import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user._id;

    // Fetch notifications that match user's role, or are marked 'all', or match specific userId
    const notifications = await Notification.find({
      $or: [
        { role: 'all' },
        { role },
        { userId }
      ]
    });

    // Sort by newest first
    const sorted = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, count: sorted.length, notifications: sorted });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    res.json({ success: true, notification: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
