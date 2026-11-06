const winston = require('winston');
const { combine, timestamp, printf, colorize, json, errors } = winston.format;

// Custom format for console
const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level}]: ${message}`;
    
    if (stack) {
      logMessage += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }
    
    return logMessage;
  })
);

// Custom format for file
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  json()
);

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: {
    service: 'aurahealthsp-v2',
    version: process.env.APP_VERSION || '2.0.0'
  },
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ],
  exitOnError: false
});

// Add stream for morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Custom log methods
logger.success = (message, meta = {}) => {
  logger.info(message, { ...meta, type: 'success' });
};

logger.warning = (message, meta = {}) => {
  logger.warn(message, { ...meta, type: 'warning' });
};

logger.error = (message, meta = {}) => {
  logger.error(message, { ...meta, type: 'error' });
};

logger.debug = (message, meta = {}) => {
  logger.debug(message, { ...meta, type: 'debug' });
};

// Request logging middleware
function requestLogger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    };
    
    if (res.statusCode >= 400) {
      logger.warning('Request completed', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });
  
  next();
}

// Error logging middleware
function errorLogger(err, req, res, next) {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });
  
  next(err);
}

module.exports = {
  logger,
  requestLogger,
  errorLogger
};
