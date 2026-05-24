import express from 'express';
import {
  createBloodRequest,
  getBloodRequests,
  getHospitalRequests,
  updateRequestStatus,
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('hospital', 'admin'), createBloodRequest)
  .get(protect, authorize('admin'), getBloodRequests);

router.get('/hospital', protect, authorize('hospital'), getHospitalRequests);
router.put('/:id/status', protect, authorize('admin'), updateRequestStatus);

export default router;
