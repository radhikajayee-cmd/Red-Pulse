import express from 'express';
import {
  bookAppointment,
  getAppointments,
  getDonorAppointments,
  updateAppointmentStatus,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('donor', 'admin'), bookAppointment)
  .get(protect, authorize('admin'), getAppointments);

router.get('/my-appointments', protect, authorize('donor'), getDonorAppointments);
router.put('/:id/status', protect, authorize('admin'), updateAppointmentStatus);

export default router;
