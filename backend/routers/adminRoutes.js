import express from 'express';
import { getAdminPolicies, updateAdminPolicies, getUsers, getSystemStatus } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, authorize('admin'));
router.get('/policies', getAdminPolicies);
router.put('/policies', updateAdminPolicies);
router.get('/users', getUsers);
router.get('/system-status', getSystemStatus);

export default router;