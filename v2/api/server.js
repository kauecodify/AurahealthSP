require('dotenv').config({ path: '../.env' });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const authRoutes = require('../routes/auth');
const hospitalRoutes = require('../routes/hospital');
const meiRoutes = require('../routes/mei');
const proposalRoutes = require('../routes/proposal');
const ambulanceRoutes = require('../routes/ambulance');
const satelliteRoutes = require('../routes/satellite');
const adminRoutes = require('../routes/admin');
const contractRoutes = require('../routes/contract');
const indexRoutes = require('../routes/index');

// Import middleware
const { authenticate } = require('../middleware/auth');
const { logger } = require('../middleware/logger');
const { errorHandler } = require('../middleware/errorHandler');

// Import services
const { connectDB } = require('../config/database');
const { connectRedis } = require('../config/redis');
const { connectSatellite } = require('../config/satellite');
const { AmbulanceTracker } = require('../services/ambulanceService');

const app = express();
const server = http.createServer(app);

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST']
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts' },
  skip: (req) => req.path.includes('/health')
});

// Request logging
app.use(logger);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '2.0.0',
    services: {
      db: 'ok',
      redis: 'ok',
      satellite: 'ok'
    }
  });
});

app.get('/health/ready', async (req, res) => {
  try {
    const dbStatus = await require('../config/database').checkConnection();
    const redisStatus = await require('../config/redis').checkConnection();
    const satelliteStatus = await require('../config/satellite').checkConnection();
    
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      services: {
        db: dbStatus,
        redis: redisStatus,
        satellite: satelliteStatus
      }
    });
  } catch (err) {
    res.status(503).json({
      status: 'not_ready',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use('/api/v2/auth', authLimiter, authRoutes);
app.use('/api/v2/hospitals', apiLimiter, hospitalRoutes);
app.use('/api/v2/mei', apiLimiter, meiRoutes);
app.use('/api/v2/proposals', apiLimiter, proposalRoutes);
app.use('/api/v2/ambulances', apiLimiter, ambulanceRoutes);
app.use('/api/v2/satellite', apiLimiter, satelliteRoutes);
app.use('/api/v2/admin', apiLimiter, adminRoutes);
app.use('/api/v2/contracts', apiLimiter, contractRoutes);
app.use('/api/v2', apiLimiter, indexRoutes);

// Public routes (no auth required)
app.use('/api/v2/public/hospitals', apiLimiter, hospitalRoutes);

// Socket.IO Real-time Events
const ambulanceTracker = new AmbulanceTracker(io);

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  // Ambulance tracking
  socket.on('ambulance:subscribe', (data) => {
    logger.info(`Subscribed to ambulance: ${data.ambulanceId}`);
    ambulanceTracker.subscribe(socket.id, data.ambulanceId);
  });
  
  socket.on('ambulance:unsubscribe', (data) => {
    logger.info(`Unsubscribed from ambulance: ${data.ambulanceId}`);
    ambulanceTracker.unsubscribe(socket.id, data.ambulanceId);
  });
  
  // Hospital status
  socket.on('hospital:subscribe', (data) => {
    logger.info(`Subscribed to hospital: ${data.hospitalId}`);
    socket.join(`hospital:${data.hospitalId}`);
  });
  
  socket.on('hospital:status', (data) => {
    io.to(`hospital:${data.hospitalId}`).emit('hospital:status', data);
    io.emit('hospital:global-status', data);
  });
  
  // MEI verification
  socket.on('mei:verify', async (data) => {
    try {
      const meiService = require('../services/meiService');
      const result = await meiService.verifyMEI(data.cnpj);
      socket.emit('mei:verified', result);
    } catch (err) {
      socket.emit('mei:error', { error: err.message });
    }
  });
  
  // Emergency broadcast
  socket.on('emergency:activate', (data) => {
    logger.warn(`Emergency activated: ${JSON.stringify(data)}`);
    io.emit('emergency:broadcast', { ...data, timestamp: new Date().toISOString() });
    ambulanceTracker.broadcastEmergency(data);
  });
  
  // Satellite commands
  socket.on('satellite:command', async (data) => {
    try {
      const satelliteService = require('../services/satelliteService');
      const result = await satelliteService.sendCommand(data);
      io.emit('satellite:response', result);
    } catch (err) {
      socket.emit('satellite:error', { error: err.message });
    }
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
    ambulanceTracker.unsubscribeAll(socket.id);
  });
});

// Start ambulance tracking
ambulanceTracker.start();

// Error handler
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Initialize services
async function initialize() {
  try {
    logger.info('Initializing AuraHealthSP v2...');
    
    // Connect to database
    await connectDB();
    logger.info('Database connected');
    
    // Connect to Redis
    await connectRedis();
    logger.info('Redis connected');
    
    // Connect to Satellite
    await connectSatellite();
    logger.info('Satellite connected');
    
    // Initialize ambulance tracker
    await ambulanceTracker.initialize();
    logger.info('Ambulance tracker initialized');
    
    const PORT = process.env.PORT || 3002;
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`AuraHealthSP v2 API running on port ${PORT}`);
      logger.info(`Health: http://localhost:${PORT}/health`);
      logger.info(`Socket.IO: ws://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to initialize:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  ambulanceTracker.stop();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  ambulanceTracker.stop();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection:', err);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
  process.exit(1);
});

// Start the application
initialize();

module.exports = { app, io, server, ambulanceTracker };
