const axios = require('axios');
const { logger } = require('../middleware/logger');
const { get, set } = require('./redis');

let isConnected = false;
let connectionStatus = 'disconnected';

class SatelliteConfig {
  constructor() {
    this.apiUrl = process.env.SATELLITE_API_URL || 'https://api.satellite-tracking.gov.br/v1';
    this.apiKey = process.env.SATELLITE_API_KEY || '';
    this.timeout = parseInt(process.env.SATELLITE_TIMEOUT_MS) || 10000;
    this.retryCount = parseInt(process.env.SATELLITE_RETRY_COUNT) || 3;
    this.cacheTTL = parseInt(process.env.SATELLITE_CACHE_TTL) || 300; // 5 minutes
  }

  async connectSatellite() {
    try {
      logger.info('🛰️  Connecting to satellite service...');
      
      // Test connection
      const response = await this._request('GET', '/status');
      
      if (response.data && response.data.status === 'ok') {
        isConnected = true;
        connectionStatus = 'connected';
        logger.info('✅ Satellite connected');
        
        // Cache connection status
        await set('satellite:status', { connected: true, timestamp: new Date().toISOString() }, 60);
        
        return true;
      }
      
      throw new Error('Invalid response from satellite service');
    } catch (err) {
      logger.error('❌ Satellite connection error:', err.message);
      isConnected = false;
      connectionStatus = 'error';
      throw err;
    }
  }

  async checkConnection() {
    try {
      // Check cache first
      const cached = await get('satellite:status');
      if (cached && cached.connected) {
        return 'ok';
      }
      
      // Test connection
      const response = await this._request('GET', '/status');
      
      if (response.data && response.data.status === 'ok') {
        isConnected = true;
        connectionStatus = 'connected';
        await set('satellite:status', { connected: true, timestamp: new Date().toISOString() }, 60);
        return 'ok';
      }
      
      return 'error';
    } catch (err) {
      logger.error('❌ Satellite health check failed:', err.message);
      isConnected = false;
      connectionStatus = 'error';
      return 'error';
    }
  }

  async _request(method, endpoint, data = null, params = {}) {
    const url = `${this.apiUrl}${endpoint}`;
    
    const config = {
      method,
      url,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'User-Agent': 'AuraHealthSP-v2'
      },
      timeout: this.timeout,
      params
    };
    
    if (data) {
      config.data = data;
    }
    
    let lastError;
    for (let i = 0; i < this.retryCount; i++) {
      try {
        const response = await axios(config);
        return response;
      } catch (err) {
        lastError = err;
        logger.warn(`⚠️  Satellite request attempt ${i + 1} failed: ${err.message}`);
        
        if (i < this.retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    
    throw lastError;
  }

  // Satellite API methods
  async getCoverage() {
    try {
      const cacheKey = 'satellite:coverage';
      const cached = await get(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      const response = await this._request('GET', '/coverage');
      const coverage = response.data;
      
      // Cache for 5 minutes
      await set(cacheKey, coverage, this.cacheTTL);
      
      return coverage;
    } catch (err) {
      logger.error('❌ Failed to get satellite coverage:', err.message);
      throw err;
    }
  }

  async getSatellites() {
    try {
      const cacheKey = 'satellite:list';
      const cached = await get(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      const response = await this._request('GET', '/satellites');
      const satellites = response.data;
      
      // Cache for 5 minutes
      await set(cacheKey, satellites, this.cacheTTL);
      
      return satellites;
    } catch (err) {
      logger.error('❌ Failed to get satellites:', err.message);
      throw err;
    }
  }

  async getSatelliteStatus(satelliteId) {
    try {
      const response = await this._request('GET', `/satellites/${satelliteId}/status`);
      return response.data;
    } catch (err) {
      logger.error('❌ Failed to get satellite status:', err.message);
      throw err;
    }
  }

  async sendCommand(command) {
    try {
      const response = await this._request('POST', '/commands', command);
      return response.data;
    } catch (err) {
      logger.error('❌ Failed to send satellite command:', err.message);
      throw err;
    }
  }

  async trackAmbulance(ambulanceId, options = {}) {
    try {
      const response = await this._request('POST', '/tracking/ambulance', {
        ambulanceId,
        ...options
      });
      return response.data;
    } catch (err) {
      logger.error('❌ Failed to track ambulance via satellite:', err.message);
      throw err;
    }
  }

  async getTrackingData(ambulanceId) {
    try {
      const cacheKey = `satellite:tracking:${ambulanceId}`;
      const cached = await get(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      const response = await this._request('GET', `/tracking/ambulance/${ambulanceId}`);
      const data = response.data;
      
      // Cache for 1 minute
      await set(cacheKey, data, 60);
      
      return data;
    } catch (err) {
      logger.error('❌ Failed to get tracking data:', err.message);
      throw err;
    }
  }

  async getSignalStrength(latitude, longitude) {
    try {
      const response = await this._request('GET', '/signal-strength', null, {
        lat: latitude,
        lng: longitude
      });
      return response.data;
    } catch (err) {
      logger.error('❌ Failed to get signal strength:', err.message);
      throw err;
    }
  }

  // WebSocket connection for real-time satellite data
  async startRealtimeConnection(callback) {
    try {
      // This would be implemented with WebSocket in production
      // For now, we'll use polling
      logger.info('🛰️  Starting satellite real-time connection');
      
      const interval = setInterval(async () => {
        try {
          const coverage = await this.getCoverage();
          callback({ type: 'coverage', data: coverage });
        } catch (err) {
          logger.error('❌ Satellite real-time error:', err.message);
        }
      }, 30000); // Every 30 seconds
      
      return () => clearInterval(interval);
    } catch (err) {
      logger.error('❌ Failed to start satellite real-time connection:', err.message);
      throw err;
    }
  }

  // Status getters
  getStatus() {
    return connectionStatus;
  }

  isConnected() {
    return isConnected;
  }
}

const satelliteConfig = new SatelliteConfig();

module.exports = {
  connectSatellite: satelliteConfig.connectSatellite.bind(satelliteConfig),
  checkConnection: satelliteConfig.checkConnection.bind(satelliteConfig),
  getCoverage: satelliteConfig.getCoverage.bind(satelliteConfig),
  getSatellites: satelliteConfig.getSatellites.bind(satelliteConfig),
  getSatelliteStatus: satelliteConfig.getSatelliteStatus.bind(satelliteConfig),
  sendCommand: satelliteConfig.sendCommand.bind(satelliteConfig),
  trackAmbulance: satelliteConfig.trackAmbulance.bind(satelliteConfig),
  getTrackingData: satelliteConfig.getTrackingData.bind(satelliteConfig),
  getSignalStrength: satelliteConfig.getSignalStrength.bind(satelliteConfig),
  startRealtimeConnection: satelliteConfig.startRealtimeConnection.bind(satelliteConfig),
  getStatus: satelliteConfig.getStatus.bind(satelliteConfig),
  isConnected: satelliteConfig.isConnected.bind(satelliteConfig),
  config: satelliteConfig
};
