import Appointment from '../models/Appointment.js';
import Donor from '../models/Donor.js';
import BloodInventory from '../models/BloodInventory.js';
import Notification from '../models/Notification.js';

// @desc    Book a donation appointment
// @route   POST /api/appointments
// @access  Private (Admin, Donor)
export const bookAppointment = async (req, res, next) => {
  try {
    const { donorName, email, phone, bloodGroup, date, timeSlot } = req.body;

    if (!donorName || !email || !phone || !bloodGroup || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Please provide all details' });
    }

    // Verify donor is eligible (check last donation date > 3 months)
    const donor = await Donor.findOne({ email });
    if (donor && donor.lastDonationDate) {
      const lastDate = new Date(donor.lastDonationDate);
      const diffTime = Math.abs(new Date() - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 90) {
        return res.status(400).json({
          success: false,
          message: `Donor not eligible. Last donation was ${diffDays} days ago. A gap of 90 days is required.`,
        });
      }
    }

    const appointment = await Appointment.create({
      donorName,
      email,
      phone,
      bloodGroup,
      date: new Date(date),
      timeSlot,
      userId: req.user._id,
      status: 'Pending',
    });

    // Notify Admin
    await Notification.create({
      title: `New Appointment booked`,
      message: `${donorName} booked a donation slot on ${date} at ${timeSlot}.`,
      type: 'info',
      role: 'admin',
    });

    res.status(201).json({ success: true, message: 'Appointment booked successfully', appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments (Admin only)
// @route   GET /api/appointments
// @access  Private (Admin)
export const getAppointments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const appointments = await Appointment.find(query);
    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own appointments
// @route   GET /api/appointments/my-appointments
// @access  Private (Donor)
export const getDonorAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id });
    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (Admin only)
// @route   PUT /api/appointments/:id/status
// @access  Private (Admin)
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'Approved', 'Completed', 'Cancelled'
    if (!['Approved', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status === 'Completed' || appointment.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: `Appointment status is already ${appointment.status}` });
    }

    const prevStatus = appointment.status;

    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );

    // If marked Completed:
    // 1. Add 1 blood unit to inventory stock
    // 2. Update Donor's lastDonationDate
    if (status === 'Completed') {
      const inventory = await BloodInventory.findOne({ bloodGroup: appointment.bloodGroup });
      const currentStock = inventory ? inventory.units : 0;
      
      if (inventory) {
        await BloodInventory.findByIdAndUpdate(inventory._id, { units: currentStock + 1 });
      } else {
        await BloodInventory.create({ bloodGroup: appointment.bloodGroup, units: 1 });
      }

      const donor = await Donor.findOne({ email: appointment.email });
      if (donor) {
        donor.lastDonationDate = new Date();
        await donor.save();
      }

      // Notify Donor
      await Notification.create({
        title: `Donation Successful!`,
        message: `Thank you for donating blood! 1 unit of ${appointment.bloodGroup} has been added to stock.`,
        type: 'success',
        userId: appointment.userId,
        role: 'donor',
      });
    } else if (status === 'Approved') {
      // Notify Donor
      await Notification.create({
        title: `Appointment Approved`,
        message: `Your appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.timeSlot} is approved.`,
        type: 'success',
        userId: appointment.userId,
        role: 'donor',
      });
    } else if (status === 'Cancelled') {
      // Notify Donor
      await Notification.create({
        title: `Appointment Cancelled`,
        message: `Your donation appointment has been cancelled.`,
        type: 'error',
        userId: appointment.userId,
        role: 'donor',
      });
    }

    res.json({ 
      success: true, 
      message: `Appointment updated to ${status} successfully.`, 
      appointment: updatedAppointment 
    });
  } catch (error) {
    next(error);
  }
};
