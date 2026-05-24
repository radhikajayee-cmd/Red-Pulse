import express from 'express';
import { getInventory, updateInventoryStock } from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getInventory);
router.post('/update', protect, authorize('admin'), updateInventoryStock);

export default router;
