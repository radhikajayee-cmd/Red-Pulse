import BloodInventory from '../models/BloodInventory.js';
import Notification from '../models/Notification.js';

// Low stock threshold
const LOW_STOCK_LIMIT = 10;

// @desc    Get current blood inventory
// @route   GET /api/inventory
// @access  Private (Admin, Hospital, Donor)
export const getInventory = async (req, res, next) => {
  try {
    const inventory = await BloodInventory.find({});
    
    // If inventory is empty (e.g. fresh DB), we return standard groups with 0 stock
    const groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    const items = groups.map(grp => {
      const dbItem = inventory.find(i => i.bloodGroup === grp);
      return dbItem || { bloodGroup: grp, units: 0, _id: grp };
    });

    res.json({ success: true, count: items.length, inventory: items });
  } catch (error) {
    next(error);
  }
};

// @desc    Update blood stock
// @route   POST /api/inventory/update
// @access  Private (Admin)
export const updateInventoryStock = async (req, res, next) => {
  try {
    const { bloodGroup, units, action } = req.body; // action: 'add' or 'remove' or 'set'

    if (!bloodGroup || units === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide bloodGroup and units' });
    }

    const groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    if (!groups.includes(bloodGroup)) {
      return res.status(400).json({ success: false, message: 'Invalid blood group' });
    }

    let record = await BloodInventory.findOne({ bloodGroup });
    let currentUnits = record ? record.units : 0;
    let newUnits = currentUnits;

    const unitsNum = Number(units);
    if (action === 'add') {
      newUnits += unitsNum;
    } else if (action === 'remove') {
      newUnits = Math.max(0, newUnits - unitsNum);
    } else {
      // 'set' or default
      newUnits = Math.max(0, unitsNum);
    }

    if (record) {
      record = await BloodInventory.findByIdAndUpdate(record._id, { units: newUnits }, { new: true });
    } else {
      record = await BloodInventory.create({ bloodGroup, units: newUnits });
    }

    // Check for low stock warning
    if (newUnits < LOW_STOCK_LIMIT) {
      // Create notification for admin
      await Notification.create({
        title: `Low Stock Alert: ${bloodGroup}`,
        message: `The blood stock level for ${bloodGroup} is low (${newUnits} units). Please replenish stock soon.`,
        type: 'warning',
        role: 'admin',
      });
    }

    res.json({
      success: true,
      message: `Successfully updated ${bloodGroup} stock to ${newUnits} units.`,
      inventory: record,
    });
  } catch (error) {
    next(error);
  }
};
