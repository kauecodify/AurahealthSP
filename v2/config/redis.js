const redis = require('redis');
const { logger } = require('../middleware/logger');

let client;
let isConnected = false;

async function connectRedis() {
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6380}`,
      password: process.env.REDIS_PASSWORD || undefined,
      socket: {
        reconnectStrategy: (retries) => {
          return Math.min(retries * 100, 5000);
        }
      }
    });
    
    client.on('error', (err) => {
      logger.error('❌ Redis error:', err);
      isConnected = false;
    });
    
    client.on('connect', () => {
      logger.info('✅ Redis connected');
      isConnected = true;
    });
    
    client.on('reconnecting', () => {
      logger.info('🔄 Redis reconnecting...');
    });
    
    client.on('end', () => {
      logger.info('🔌 Redis connection closed');
      isConnected = false;
    });
    
    await client.connect();
    
    // Test connection
    await client.ping();
    
    return client;
  } catch (err) {
    logger.error('❌ Redis connection error:', err);
    throw err;
  }
}

async function checkConnection() {
  try {
    if (!client) {
      await connectRedis();
    }
    await client.ping();
    return 'ok';
  } catch (err) {
    logger.error('❌ Redis health check failed:', err);
    return 'error';
  }
}

async function getClient() {
  if (!client) {
    await connectRedis();
  }
  return client;
}

// Cache utilities
async function get(key) {
  try {
    const c = await getClient();
    const value = await c.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    logger.error('❌ Redis get error:', err);
    return null;
  }
}

async function set(key, value, ttl) {
  try {
    const c = await getClient();
    const serialized = JSON.stringify(value);
    if (ttl) {
      await c.setEx(key, ttl, serialized);
    } else {
      await c.set(key, serialized);
    }
    return true;
  } catch (err) {
    logger.error('❌ Redis set error:', err);
    return false;
  }
}

async function del(key) {
  try {
    const c = await getClient();
    await c.del(key);
    return true;
  } catch (err) {
    logger.error('❌ Redis del error:', err);
    return false;
  }
}

async function keys(pattern) {
  try {
    const c = await getClient();
    const keys = await c.keys(pattern);
    return keys;
  } catch (err) {
    logger.error('❌ Redis keys error:', err);
    return [];
  }
}

async function flushAll() {
  try {
    const c = await getClient();
    await c.flushAll();
    return true;
  } catch (err) {
    logger.error('❌ Redis flushAll error:', err);
    return false;
  }
}

// Pub/Sub utilities
async function publish(channel, message) {
  try {
    const c = await getClient();
    await c.publish(channel, JSON.stringify(message));
    return true;
  } catch (err) {
    logger.error('❌ Redis publish error:', err);
    return false;
  }
}

async function subscribe(channel, callback) {
  try {
    const c = await getClient();
    const subscriber = c.duplicate();
    await subscriber.connect();
    
    await subscriber.subscribe(channel, (message) => {
      try {
        callback(JSON.parse(message));
      } catch (err) {
        logger.error('❌ Redis subscribe callback error:', err);
      }
    });
    
    return subscriber;
  } catch (err) {
    logger.error('❌ Redis subscribe error:', err);
    return null;
  }
}

async function close() {
  try {
    if (client) {
      await client.quit();
      logger.info('✅ Redis connection closed');
    }
  } catch (err) {
    logger.error('❌ Redis close error:', err);
  }
}

module.exports = {
  connectRedis,
  checkConnection,
  getClient,
  get,
  set,
  del,
  keys,
  flushAll,
  publish,
  subscribe,
  close
};
