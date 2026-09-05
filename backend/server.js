import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';

// Import routes
// Import routes (top of file)
import authRoutes from './routers/authRoutes.js';
import transactionRoutes from './routers/transactionRoutes.js';
import caseRoutes from './routers/caseRoutes.js';
import dashboardRoutes from './routers/dashboardRoutes.js';
import simulationRoutes from './routers/simulationRoutes.js';
import agentRoutes from './routers/agentRoutes.js';
import uploadRoutes from './routers/uploadRoutes.js';
import analyticsRoutes from './routers/analyticsRoutes.js';
import notificationRoutes from './routers/notificationRoutes.js';
import adminRoutes from './routers/adminRoutes.js';

// Use routes (after middleware, before error handling)


// Import middleware
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Import socket manager
import { setSocketIO } from './utils/socketManager.js';
import { scanAndQueuePendingCases } from './utils/workflowQueue.js';

// Load env vars
dotenv.config();

// Initialize express
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Set socket IO in manager
setSocketIO(io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Create uploads directory if it doesn't exist
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined: ${room}`);
  });

  socket.on('joinCase', (caseId) => {
    socket.join(`case:${caseId}`);
    console.log(`Socket ${socket.id} joined case: ${caseId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'RevArb AI API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to RevArb AI API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      transactions: '/api/transactions',
      cases: '/api/cases',
      dashboard: '/api/dashboard',
      simulation: '/api/simulation',
      agents: '/api/agents',
      upload: '/api/upload',
      analytics: '/api/analytics',
      notifications: '/api/notifications',
    },
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/revenue_rescue_ai';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log('\n🚀 RevArb AI Server Running');
      console.log(`   Port: ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV}`);
      console.log(`   API URL: http://localhost:${PORT}/api`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
      console.log(`\n   Available Endpoints:`);
      console.log(`   - Auth: /api/auth`);
      console.log(`   - Transactions: /api/transactions`);
      console.log(`   - Cases: /api/cases`);
      console.log(`   - Dashboard: /api/dashboard`);
      console.log(`   - Simulation: /api/simulation`);
      console.log(`   - Agents: /api/agents`);
      console.log(`   - Upload: /api/upload`);
      console.log(`   - Analytics: /api/analytics`);
      console.log(`   - Notifications: /api/notifications`);
      setInterval(() => scanAndQueuePendingCases().catch((error) => console.error('Pending recovery monitor error:', error)), 60000);
      scanAndQueuePendingCases().catch((error) => console.error('Initial pending recovery scan error:', error));
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  });