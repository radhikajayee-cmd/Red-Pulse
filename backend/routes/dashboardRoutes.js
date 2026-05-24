import express from 'express';
import {
  getAdminDashboardStats,
  getDonorDashboardStats,
  getHospitalDashboardStats,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin', protect, authorize('admin'), getAdminDashboardStats);
router.get('/donor', protect, authorize('donor'), getDonorDashboardStats);
router.get('/hospital', protect, authorize('hospital'), getHospitalDashboardStats);

export default router;
