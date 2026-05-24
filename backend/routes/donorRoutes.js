import express from 'express';
import {
  getDonors,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonor,
} from '../controllers/donorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin', 'hospital'), getDonors)
  .post(protect, authorize('admin'), createDonor);

router.route('/:id')
  .get(protect, getDonorById)
  .put(protect, updateDonor)
  .delete(protect, authorize('admin'), deleteDonor);

export default router;
