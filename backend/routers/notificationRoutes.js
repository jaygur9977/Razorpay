import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  clearAllNotifications,
} from '../controllers/notificationController.js';

const router = express.Router();

// GET /api/notifications - Get all notifications
router.get('/', getNotifications);

// POST /api/notifications - Create notification
router.post('/', createNotification);

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', markAllAsRead);

// PUT /api/notifications/:id/read - Mark as read
router.put('/:id/read', markAsRead);

// DELETE /api/notifications - Clear all notifications
router.delete('/', clearAllNotifications);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', deleteNotification);

export default router;