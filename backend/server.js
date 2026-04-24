require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const promClient = require('prom-client');

const triageRoutes = require('./routes/triage');
const capacityRoutes = require('./routes/capacity');
const logisticsRoutes = require('./routes/logistics');
const paymentRoutes = require('./routes/payments');
const auditRoutes = require('./routes/audit');

const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { connectKafka } = require('./config/kafka');
const { logger } = require('./middleware/logger');
const { errorHandler } = require('./utils/errorHandler');
const { authenticate } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGINS?.split(',') || '*', methods: ['GET', 'POST'] }
});

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'ws:', 'wss:']
    }
  }
}));
app.use(cors({ origin: process.env.CORS_ORIGINS?.split(',') || true, credentials: true }));
app.use(express.json({ limit: process.env.UPLOAD_MAX_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many authentication attempts' }
});

// Request logging
app.use(logger);

// Health & Metrics endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.get('/health/ready', async (req, res) => {
  try {
    await require('./config/database').checkConnection();
    await require('./config/redis').checkConnection();
    res.json({ status: 'ready', services: { db: 'ok', redis: 'ok' } });
  } catch (err) {
    res.status(503).json({ status: 'not_ready', error: err.message });
  }
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// API Routes
app.use('/api/triage', apiLimiter, triageRoutes);
app.use('/api/capacity', apiLimiter, capacityRoutes);
app.use('/api/logistics', apiLimiter, logisticsRoutes);
app.use('/api/payments', apiLimiter, authenticate, paymentRoutes);
app.use('/api/audit', apiLimiter, authenticate, auditRoutes);

// Socket.io Real-time Events
io.on('connection', (socket) => {
  logger.info(`🔗 Client connected: ${socket.id}`);
  
  socket.on('patient:register', async (data) => {
    io.emit('patient:updated', { ...data, timestamp: new Date().toISOString() });
  });
  
  socket.on('capacity:change', (data) => {
    io.emit('dashboard:refresh', data);
  });
  
  socket.on('emergency:activate', (data) => {
    logger.warn(`🚨 Emergency activated: ${JSON.stringify(data)}`);
    io.emit('emergency:broadcast', { ...data, timestamp: new Date().toISOString() });
  });
  
  socket.on('disconnect', () => {
    logger.info(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Error handler
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize services
async function initialize() {
  try {
    await connectDB();
    await connectRedis();
    await connectKafka();
    logger.info('✅ All services connected');
    
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 AuraHealthSP API running on port ${PORT}`);
      logger.info(`📊 Metrics: http://localhost:${PORT}/metrics`);
      logger.info(`🔌 Health: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    logger.error('❌ Failed to initialize:', err);
    process.exit(1);
  }
}

initialize();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('🔌 Server closed');
    process.exit(0);
  });
});

module.exports = { app, io, server };