import BloodRequest from '../models/BloodRequest.js';
import BloodInventory from '../models/BloodInventory.js';
import Notification from '../models/Notification.js';

// @desc    Create a blood request
// @route   POST /api/requests
// @access  Private (Admin, Hospital)
export const createBloodRequest = async (req, res, next) => {
  try {
    const { patientName, bloodGroup, unitsRequired, hospitalName, emergencyLevel, contactNumber, reason } = req.body;

    if (!patientName || !bloodGroup || !unitsRequired || !hospitalName || !emergencyLevel || !contactNumber || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    const request = await BloodRequest.create({
      patientName,
      bloodGroup,
      unitsRequired: Number(unitsRequired),
      hospitalName,
      emergencyLevel,
      contactNumber,
      reason,
      userId: req.user._id,
    });

    // Create notification for admin
    await Notification.create({
      title: `New Request: ${bloodGroup} (${emergencyLevel})`,
      message: `${hospitalName} requested ${unitsRequired} units of ${bloodGroup} for patient ${patientName}.`,
      type: 'info',
      role: 'admin',
    });

    res.status(201).json({ success: true, message: 'Blood request submitted successfully', request });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests (Admin only)
// @route   GET /api/requests
// @access  Private (Admin)
export const getBloodRequests = async (req, res, next) => {
  try {
    const { status, bloodGroup } = req.query;
    const query = {};

    if (status) query.status = status;
    if (bloodGroup) query.bloodGroup = bloodGroup;

    // Sort by createdAt descending
    const requests = await BloodRequest.find(query);
    res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Get requesting hospital's requests
// @route   GET /api/requests/hospital
// @access  Private (Hospital)
export const getHospitalRequests = async (req, res, next) => {
  try {
    const requests = await BloodRequest.find({ userId: req.user._id });
    res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject request status
// @route   PUT /api/requests/:id/status
// @access  Private (Admin)
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'Approved' or 'Rejected'
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    if (status === 'Approved') {
      // 1. Verify blood inventory stock
      const inventory = await BloodInventory.findOne({ bloodGroup: request.bloodGroup });
      const currentStock = inventory ? inventory.units : 0;

      if (currentStock < request.unitsRequired) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock. Requested: ${request.unitsRequired} units of ${request.bloodGroup}, Available: ${currentStock} units.` 
        });
      }

      // 2. Deduct from inventory
      const newStock = currentStock - request.unitsRequired;
      if (inventory) {
        await BloodInventory.findByIdAndUpdate(inventory._id, { units: newStock });
      } else {
        await BloodInventory.create({ bloodGroup: request.bloodGroup, units: 0 }); // Fallback should not occur normally
      }

      // 3. Trigger low-stock alert if deduction drops stock below limit
      if (newStock < 10) {
        await Notification.create({
          title: `Low Stock Alert: ${request.bloodGroup}`,
          message: `Stock level for ${request.bloodGroup} dropped to ${newStock} units after request approval.`,
          type: 'warning',
          role: 'admin',
        });
      }
    }

    // 4. Update request status
    const updatedRequest = await BloodRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });

    // 5. Notify the requesting user
    await Notification.create({
      title: `Blood Request ${status}`,
      message: `Your request for ${request.unitsRequired} units of ${request.bloodGroup} for ${request.patientName} has been ${status.toLowerCase()}.`,
      type: status === 'Approved' ? 'success' : 'error',
      userId: request.userId,
      role: 'hospital',
    });

    res.json({ 
      success: true, 
      message: `Blood request status updated to ${status} successfully.`, 
      request: updatedRequest 
    });
  } catch (error) {
    next(error);
  }
};
