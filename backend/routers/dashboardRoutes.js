import express from 'express';
import { 
  getMerchantDashboard,
  getOpsDashboard,
  getAdminDashboard
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/merchant', protect, authorize('merchant', 'admin'), getMerchantDashboard);
router.get('/ops', protect, authorize('ops_manager', 'admin'), getOpsDashboard);
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

export default router;