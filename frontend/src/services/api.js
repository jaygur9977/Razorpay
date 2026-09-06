import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'https://razorpay-production-35a2.up.railway.app/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL.replace(/\/api\/?$/, '');

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Socket.IO connection
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
});

// ============ AUTH API ============

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      sessionStorage.setItem('token', response.data.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      sessionStorage.setItem('token', response.data.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

export const getAdminPolicies = async () => {
  const response = await api.get('/admin/policies');
  return response.data;
};

export const updateAdminPolicies = async (data) => {
  const response = await api.put('/admin/policies', data);
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const getAdminSystemStatus = async () => {
  const response = await api.get('/admin/system-status');
  return response.data;
};

export const getDemoUsers = async () => {
  try {
    const response = await api.get('/auth/demo-users');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch demo users' };
  }
};

export const logoutUser = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  socket.disconnect();
};

// ============ DASHBOARD API ============

export const getMerchantDashboard = async () => {
  try {
    const response = await api.get('/dashboard/merchant');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch dashboard' };
  }
};

export const checkApiConnection = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'API connection failed' };
  }
};

export const getOpsDashboard = async () => {
  try {
    const response = await api.get('/dashboard/ops');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch ops dashboard' };
  }
};

export const getAdminDashboard = async () => {
  try {
    const response = await api.get('/dashboard/admin');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch admin dashboard' };
  }
};

// ============ TRANSACTIONS API ============

export const getTransactions = async (params = {}) => {
  try {
    const response = await api.get('/transactions', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch transactions' };
  }
};

export const getTransactionById = async (id) => {
  try {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch transaction' };
  }
};

export const createTransaction = async (data) => {
  try {
    const response = await api.post('/transactions', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create transaction' };
  }
};

export const getTransactionStats = async () => {
  try {
    const response = await api.get('/transactions/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch stats' };
  }
};

// ============ CASES API ============

export const getCases = async (params = {}) => {
  try {
    const response = await api.get('/cases', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch cases' };
  }
};

export const getCaseById = async (id) => {
  try {
    const response = await api.get(`/cases/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch case' };
  }
};

export const createCase = async (data) => {
  try {
    const response = await api.post('/cases', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create case' };
  }
};

export const updateCase = async (id, data) => {
  try {
    const response = await api.put(`/cases/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update case' };
  }
};

export const approveCase = async (id) => {
  try {
    const response = await api.post(`/cases/${id}/approve`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to approve case' };
  }
};

export const rejectCase = async (id) => {
  try {
    const response = await api.post(`/cases/${id}/reject`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reject case' };
  }
};

export const retryCase = async (id) => {
  try {
    const response = await api.post(`/cases/${id}/retry`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to retry case' };
  }
};

export const getCaseStats = async () => {
  try {
    const response = await api.get('/cases/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch case stats' };
  }
};

// ============ SIMULATION API ============

export const runSingleSimulation = async (data) => {
  try {
    const response = await api.post('/simulation/single', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Simulation failed' };
  }
};

export const runBatchSimulation = async (events) => {
  try {
    const response = await api.post('/simulation/batch', { events });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Batch simulation failed' };
  }
};

export const getSimulationHistory = async () => {
  try {
    const response = await api.get('/simulation/history');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch history' };
  }
};

export const getWorkflowQueueStatus = async () => {
  try {
    const response = await api.get('/simulation/queue');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch workflow queue' };
  }
};

// ============ AGENTS API ============

export const getAgentLogs = async (params = {}) => {
  try {
    const response = await api.get('/agents/logs', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch agent logs' };
  }
};

export const getAgentStatus = async () => {
  try {
    const response = await api.get('/agents/status');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch agent status' };
  }
};

export const getLogsByAgent = async (agent) => {
  try {
    const response = await api.get(`/agents/logs/${agent}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch logs' };
  }
};

// ============ SOCKET EVENTS ============

export const connectSocket = (userId, role) => {
  socket.auth = { userId, role };
  socket.connect();
  
  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
    socket.emit('joinRoom', `role:${role}`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
  });
  
  return socket;
};

export const listenToAgentUpdates = (callback) => {
  socket.on('agentUpdate', callback);
  return () => socket.off('agentUpdate', callback);
};

export const listenToCaseUpdates = (callback) => {
  socket.on('caseUpdate', callback);
  return () => socket.off('caseUpdate', callback);
};

export const listenToDashboardUpdates = (callback) => {
  socket.on('dashboardUpdate', callback);
  return () => socket.off('dashboardUpdate', callback);
};

export const listenToRecoveryProgress = (callback) => {
  socket.on('recoveryProgress', callback);
  return () => socket.off('recoveryProgress', callback);
};


export const processPendingCases = async () => {
  try {
    const response = await api.post('/simulation/process-pending');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to process pending cases' };
  }
};

// ============ NOTIFICATIONS API ============

export const getNotifications = async (params = {}) => {
  try {
    const response = await api.get('/notifications', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch notifications' };
  }
};

export const markNotificationRead = async (id) => {
  try {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark notification' };
  }
};

export const markAllNotificationsRead = async () => {
  try {
    const response = await api.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark all notifications' };
  }
};

// ============ ANALYTICS API ============

export const getAnalyticsOverview = async (timeRange = '7d') => {
  try {
    const response = await api.get('/analytics/overview', { params: { timeRange } });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch analytics' };
  }
};

export const getAgentAnalytics = async () => {
  try {
    const response = await api.get('/analytics/agents');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch agent analytics' };
  }
};

export const getRecoveryByType = async () => {
  try {
    const response = await api.get('/analytics/recovery-types');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch recovery types' };
  }
};

export const getCostAnalysis = async () => {
  try {
    const response = await api.get('/analytics/costs');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch cost analysis' };
  }
};

// ============ UPLOAD API ============

export const uploadCSV = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Upload failed' };
  }
};

export const downloadSampleCSV = async () => {
  try {
    const response = await api.get('/upload/sample', { responseType: 'blob' });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    throw error.response?.data || { message: 'Download failed' };
  }
};

// ============ SOCKET LISTENERS ============

export const listenToNotifications = (callback) => {
  socket.on('notification', callback);
  return () => socket.off('notification', callback);
};

export default api;
