import express from 'express';
import { 
  loginUser, 
  registerUser, 
  getUserProfile,
  getDemoUsers,
  updateUserProfile,
  changePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============ PUBLIC ROUTES ============

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/register
router.post('/register', registerUser);

// GET /api/auth/demo-users
router.get('/demo-users', getDemoUsers);

// ============ PROTECTED ROUTES ============

// GET /api/auth/profile
router.get('/profile', protect, getUserProfile);

// PUT /api/auth/profile
router.put('/profile', protect, updateUserProfile);

// PUT /api/auth/change-password
router.put('/change-password', protect, changePassword);

export default router;