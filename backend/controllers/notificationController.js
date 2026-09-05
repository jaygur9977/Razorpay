import Notification from '../models/Notification.js';

// @desc    Get all notifications
// @route   GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const { unreadOnly = false, limit = 50 } = req.query;
    
    const filter = {};
    if (unreadOnly === 'true') filter.isRead = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('case', 'caseId customerName amount status');

    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { updatedCount: result.modifiedCount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create notification
// @route   POST /api/notifications
export const createNotification = async (req, res) => {
  try {
    const { title, message, type, caseId } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and message',
      });
    }

    const notificationData = {
      title,
      message,
      type: type || 'info',
    };

    if (caseId) notificationData.case = caseId;

    const notification = await Notification.create(notificationData);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('notification', notification);
    }

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications
export const clearAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({});

    res.json({
      success: true,
      message: 'All notifications cleared',
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};