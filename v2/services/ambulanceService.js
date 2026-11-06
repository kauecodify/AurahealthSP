const { query } = require('../config/database');
const { get, set, publish } = require('../config/redis');
const { logger } = require('../middleware/logger');
const { trackAmbulance, getTrackingData, getSignalStrength } = require('../config/satellite');

class AmbulanceTracker {
  constructor(io) {
    this.io = io;
    this.subscriptions = new Map(); // { socketId: Set<ambulanceId> }
    this.ambulanceIntervals = new Map(); // { ambulanceId: intervalId }
    this.isRunning = false;
    this.updateInterval = parseInt(process.env.AMBULANCE_UPDATE_INTERVAL_MS) || 5000;
  }

  // Initialize tracker
  async initialize() {
    try {
      logger.info('🚑 Initializing ambulance tracker...');
      
      // Load all ambulances from database
      const ambulances = await this.getAllAmbulances();
      logger.info(`🚑 Loaded ${ambulances.length} ambulances`);
      
      // Start tracking for each ambulance
      for (const ambulance of ambulances) {
        await this.startTracking(ambulance.id);
      }
      
      this.isRunning = true;
      logger.info('✅ Ambulance tracker initialized');
    } catch (err) {
      logger.error('❌ Failed to initialize ambulance tracker:', err);
      throw err;
    }
  }

  // Start tracking all ambulances
  start() {
    if (this.isRunning) {
      logger.info('🚑 Ambulance tracker already running');
      return;
    }
    
    this.initialize().catch(err => {
      logger.error('❌ Ambulance tracker start error:', err);
    });
  }

  // Stop tracking
  stop() {
    this.isRunning = false;
    
    // Clear all intervals
    for (const interval of this.ambulanceIntervals.values()) {
      clearInterval(interval);
    }
    this.ambulanceIntervals.clear();
    
    // Clear subscriptions
    this.subscriptions.clear();
    
    logger.info('🚑 Ambulance tracker stopped');
  }

  // Subscribe to ambulance updates
  subscribe(socketId, ambulanceId) {
    if (!this.subscriptions.has(socketId)) {
      this.subscriptions.set(socketId, new Set());
    }
    this.subscriptions.get(socketId).add(ambulanceId);
    logger.info(`🚑 Socket ${socketId} subscribed to ambulance ${ambulanceId}`);
  }

  // Unsubscribe from ambulance updates
  unsubscribe(socketId, ambulanceId) {
    if (this.subscriptions.has(socketId)) {
      this.subscriptions.get(socketId).delete(ambulanceId);
      logger.info(`🚑 Socket ${socketId} unsubscribed from ambulance ${ambulanceId}`);
    }
  }

  // Unsubscribe all for a socket
  unsubscribeAll(socketId) {
    if (this.subscriptions.has(socketId)) {
      const ambulanceIds = Array.from(this.subscriptions.get(socketId));
      this.subscriptions.delete(socketId);
      logger.info(`🚑 Socket ${socketId} unsubscribed from all ambulances: ${ambulanceIds.join(', ')}`);
    }
  }

  // Start tracking a specific ambulance
  async startTracking(ambulanceId) {
    try {
      // Check if already tracking
      if (this.ambulanceIntervals.has(ambulanceId)) {
        logger.info(`🚑 Already tracking ambulance ${ambulanceId}`);
        return;
      }
      
      // Get ambulance from database
      const ambulance = await this.getAmbulance(ambulanceId);
      if (!ambulance) {
        logger.warn(`⚠️  Ambulance ${ambulanceId} not found`);
        return;
      }
      
      // Start update interval
      const intervalId = setInterval(async () => {
        try {
          await this.updateAmbulanceLocation(ambulanceId);
        } catch (err) {
          logger.error(`❌ Failed to update ambulance ${ambulanceId} location:`, err.message);
        }
      }, this.updateInterval);
      
      this.ambulanceIntervals.set(ambulanceId, intervalId);
      logger.info(`🚑 Started tracking ambulance ${ambulanceId}`);
    } catch (err) {
      logger.error(`❌ Failed to start tracking ambulance ${ambulanceId}:`, err);
    }
  }

  // Stop tracking a specific ambulance
  stopTracking(ambulanceId) {
    if (this.ambulanceIntervals.has(ambulanceId)) {
      clearInterval(this.ambulanceIntervals.get(ambulanceId));
      this.ambulanceIntervals.delete(ambulanceId);
      logger.info(`🚑 Stopped tracking ambulance ${ambulanceId}`);
    }
  }

  // Update ambulance location
  async updateAmbulanceLocation(ambulanceId) {
    try {
      // Get current ambulance data
      const ambulance = await this.getAmbulance(ambulanceId);
      if (!ambulance) {
        return;
      }
      
      // Check if using satellite tracking
      const useSatellite = process.env.AMBULANCE_TRACKING_ENABLED === 'true';
      
      let location;
      
      if (useSatellite) {
        // Get location from satellite
        try {
          const trackingData = await getTrackingData(ambulanceId);
          if (trackingData && trackingData.location) {
            location = trackingData.location;
          }
        } catch (satelliteErr) {
          logger.warn(`⚠️  Satellite tracking failed for ambulance ${ambulanceId}: ${satelliteErr.message}`);
          // Fall back to database
        }
      }
      
      // If no satellite data, use last known location from database
      if (!location) {
        location = {
          latitude: ambulance.latitude,
          longitude: ambulance.longitude,
          speed: ambulance.speed,
          heading: ambulance.heading,
          accuracy: ambulance.accuracy || 0,
          timestamp: new Date().toISOString()
        };
      }
      
      // Update database
      const result = await query(
        `UPDATE ambulances SET
          latitude = $1,
          longitude = $2,
          speed = $3,
          heading = $4,
          accuracy = $5,
          last_update = NOW(),
          updated_at = NOW()
        WHERE id = $6
        RETURNING *`,
        [
          location.latitude,
          location.longitude,
          location.speed || 0,
          location.heading || 0,
          location.accuracy || 0,
          ambulanceId
        ]
      );
      
      const updatedAmbulance = result.rows[0];
      
      // Broadcast to all subscribers
      this.broadcastAmbulanceUpdate(updatedAmbulance);
      
      // Cache location
      await set(`ambulance:${ambulanceId}:location`, location, 30);
      
      logger.debug(`📍 Ambulance ${ambulanceId} updated: ${location.latitude}, ${location.longitude}`);
    } catch (err) {
      logger.error(`❌ Failed to update ambulance ${ambulanceId} location:`, err);
    }
  }

  // Broadcast ambulance update to subscribers
  broadcastAmbulanceUpdate(ambulance) {
    const message = {
      type: 'ambulance:location',
      data: {
        ambulanceId: ambulance.id,
        vehicleId: ambulance.vehicle_id,
        latitude: ambulance.latitude,
        longitude: ambulance.longitude,
        speed: ambulance.speed,
        heading: ambulance.heading,
        status: ambulance.status,
        lastUpdate: ambulance.last_update,
        timestamp: new Date().toISOString()
      }
    };
    
    // Broadcast to all subscribers of this ambulance
    for (const [socketId, ambulanceIds] of this.subscriptions) {
      if (ambulanceIds.has(ambulance.id)) {
        this.io.to(socketId).emit('ambulance:location', message.data);
      }
    }
    
    // Also broadcast to all sockets (for global tracking)
    this.io.emit('ambulance:global-update', message.data);
  }

  // Broadcast emergency to all ambulances
  broadcastEmergency(emergency) {
    const message = {
      type: 'emergency:alert',
      data: emergency,
      timestamp: new Date().toISOString()
    };
    
    // Notify all ambulances
    this.io.emit('emergency:broadcast', message);
    
    logger.info(`🚨 Emergency broadcasted to all ambulances: ${emergency.id}`);
  }

  // Get all ambulances
  async getAllAmbulances() {
    try {
      const result = await query(
        `SELECT * FROM ambulances
         ORDER BY status, last_update DESC`
      );
      
      return result.rows.map(row => this._formatAmbulance(row));
    } catch (err) {
      logger.error('❌ Failed to get all ambulances:', err);
      return [];
    }
  }

  // Get ambulance by ID
  async getAmbulance(ambulanceId) {
    try {
      const result = await query(
        'SELECT * FROM ambulances WHERE id = $1',
        [ambulanceId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this._formatAmbulance(result.rows[0]);
    } catch (err) {
      logger.error('❌ Failed to get ambulance:', err);
      return null;
    }
  }

  // Get ambulance by vehicle ID
  async getAmbulanceByVehicleId(vehicleId) {
    try {
      const result = await query(
        'SELECT * FROM ambulances WHERE vehicle_id = $1',
        [vehicleId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this._formatAmbulance(result.rows[0]);
    } catch (err) {
      logger.error('❌ Failed to get ambulance by vehicle ID:', err);
      return null;
    }
  }

  // Format ambulance from database
  _formatAmbulance(row) {
    return {
      id: row.id,
      vehicleId: row.vehicle_id,
      hospitalId: row.hospital_id,
      type: row.type,
      status: row.status,
      latitude: row.latitude,
      longitude: row.longitude,
      speed: row.speed,
      heading: row.heading,
      altitude: row.altitude,
      accuracy: row.accuracy,
      batteryLevel: row.battery_level,
      fuelLevel: row.fuel_level,
      lastUpdate: row.last_update,
      driverId: row.driver_id,
      driverName: row.driver_name,
      driverPhone: row.driver_phone,
      driverLicense: row.driver_license,
      equipment: row.equipment ? JSON.parse(row.equipment) : [],
      currentEmergencyId: row.current_emergency_id,
      assignedTo: row.assigned_to,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Create ambulance
  async createAmbulance(data) {
    try {
      const result = await query(
        `INSERT INTO ambulances (
          vehicle_id, hospital_id, type, status, latitude, longitude,
          speed, heading, altitude, accuracy, battery_level, fuel_level,
          driver_id, driver_name, driver_phone, driver_license, equipment,
          current_emergency_id, assigned_to, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW())
        RETURNING *`,
        [
          data.vehicleId,
          data.hospitalId,
          data.type || 'basic',
          data.status || 'available',
          data.latitude || 0,
          data.longitude || 0,
          data.speed || 0,
          data.heading || 0,
          data.altitude || 0,
          data.accuracy || 0,
          data.batteryLevel || 100,
          data.fuelLevel || 100,
          data.driverId,
          data.driverName,
          data.driverPhone,
          data.driverLicense,
          JSON.stringify(data.equipment || []),
          data.currentEmergencyId,
          data.assignedTo
        ]
      );
      
      const ambulance = this._formatAmbulance(result.rows[0]);
      
      // Start tracking
      await this.startTracking(ambulance.id);
      
      // Broadcast new ambulance
      this.io.emit('ambulance:new', ambulance);
      
      return ambulance;
    } catch (err) {
      logger.error('❌ Failed to create ambulance:', err);
      throw err;
    }
  }

  // Update ambulance
  async updateAmbulance(ambulanceId, data) {
    try {
      const ambulance = await this.getAmbulance(ambulanceId);
      if (!ambulance) {
        throw new Error('Ambulance not found');
      }
      
      const updates = [];
      const values = [];
      let paramIndex = 1;
      
      const fields = [
        'vehicleId', 'hospitalId', 'type', 'status', 'latitude', 'longitude',
        'speed', 'heading', 'altitude', 'accuracy', 'batteryLevel', 'fuelLevel',
        'driverId', 'driverName', 'driverPhone', 'driverLicense', 'equipment',
        'currentEmergencyId', 'assignedTo'
      ];
      
      for (const field of fields) {
        if (data[field] !== undefined) {
          updates.push(`${field === 'vehicleId' ? 'vehicle_id' : field === 'hospitalId' ? 'hospital_id' : field === 'driverId' ? 'driver_id' : field === 'currentEmergencyId' ? 'current_emergency_id' : field === 'assignedTo' ? 'assigned_to' : field.toLowerCase()} = $${paramIndex++}`);
          values.push(data[field]);
        }
      }
      
      if (updates.length === 0) {
        return ambulance;
      }
      
      updates.push('updated_at = NOW()');
      values.push(ambulanceId);
      
      const result = await query(
        `UPDATE ambulances SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *`,
        values
      );
      
      const updatedAmbulance = this._formatAmbulance(result.rows[0]);
      
      // Broadcast update
      this.broadcastAmbulanceUpdate(updatedAmbulance);
      
      return updatedAmbulance;
    } catch (err) {
      logger.error('❌ Failed to update ambulance:', err);
      throw err;
    }
  }

  // Delete ambulance
  async deleteAmbulance(ambulanceId) {
    try {
      // Stop tracking
      this.stopTracking(ambulanceId);
      
      // Delete from database
      await query('DELETE FROM ambulances WHERE id = $1', [ambulanceId]);
      
      // Broadcast deletion
      this.io.emit('ambulance:deleted', { ambulanceId });
      
      logger.info(`🚑 Ambulance ${ambulanceId} deleted`);
      
      return true;
    } catch (err) {
      logger.error('❌ Failed to delete ambulance:', err);
      throw err;
    }
  }

  // Get available ambulances
  async getAvailableAmbulances(hospitalId = null) {
    try {
      let queryText = `
        SELECT * FROM ambulances
        WHERE status = 'available'
      `;
      const params = [];
      
      if (hospitalId) {
        queryText += ' AND hospital_id = $1';
        params.push(hospitalId);
      }
      
      queryText += ' ORDER BY last_update DESC';
      
      const result = await query(queryText, params);
      
      return result.rows.map(row => this._formatAmbulance(row));
    } catch (err) {
      logger.error('❌ Failed to get available ambulances:', err);
      return [];
    }
  }

  // Assign ambulance to emergency
  async assignAmbulance(ambulanceId, emergencyId, hospitalId = null) {
    try {
      const ambulance = await this.getAmbulance(ambulanceId);
      if (!ambulance) {
        throw new Error('Ambulance not found');
      }
      
      if (ambulance.status !== 'available') {
        throw new Error('Ambulance is not available');
      }
      
      const result = await query(
        `UPDATE ambulances SET
          status = 'assigned',
          current_emergency_id = $1,
          assigned_to = $2,
          updated_at = NOW()
        WHERE id = $3
        RETURNING *`,
        [emergencyId, hospitalId || ambulance.hospitalId, ambulanceId]
      );
      
      const updatedAmbulance = this._formatAmbulance(result.rows[0]);
      
      // Broadcast assignment
      this.io.emit('ambulance:assigned', {
        ambulance: updatedAmbulance,
        emergencyId
      });
      
      return updatedAmbulance;
    } catch (err) {
      logger.error('❌ Failed to assign ambulance:', err);
      throw err;
    }
  }

  // Release ambulance from emergency
  async releaseAmbulance(ambulanceId) {
    try {
      const ambulance = await this.getAmbulance(ambulanceId);
      if (!ambulance) {
        throw new Error('Ambulance not found');
      }
      
      const result = await query(
        `UPDATE ambulances SET
          status = 'available',
          current_emergency_id = NULL,
          assigned_to = NULL,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *`,
        [ambulanceId]
      );
      
      const updatedAmbulance = this._formatAmbulance(result.rows[0]);
      
      // Broadcast release
      this.io.emit('ambulance:released', updatedAmbulance);
      
      return updatedAmbulance;
    } catch (err) {
      logger.error('❌ Failed to release ambulance:', err);
      throw err;
    }
  }

  // Update ambulance status
  async updateStatus(ambulanceId, status) {
    try {
      const validStatuses = ['available', 'assigned', 'en_route', 'on_scene', 'unavailable', 'maintenance'];
      
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }
      
      const result = await query(
        `UPDATE ambulances SET
          status = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *`,
        [status, ambulanceId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Ambulance not found');
      }
      
      const updatedAmbulance = this._formatAmbulance(result.rows[0]);
      
      // Broadcast status update
      this.broadcastAmbulanceUpdate(updatedAmbulance);
      
      return updatedAmbulance;
    } catch (err) {
      logger.error('❌ Failed to update ambulance status:', err);
      throw err;
    }
  }

  // Get ambulances by hospital
  async getAmbulancesByHospital(hospitalId) {
    try {
      const result = await query(
        'SELECT * FROM ambulances WHERE hospital_id = $1 ORDER BY status, last_update DESC',
        [hospitalId]
      );
      
      return result.rows.map(row => this._formatAmbulance(row));
    } catch (err) {
      logger.error('❌ Failed to get ambulances by hospital:', err);
      return [];
    }
  }

  // Get nearest available ambulances
  async getNearestAmbulances(latitude, longitude, limit = 5) {
    try {
      const result = await query(
        `SELECT *,
          6371 * 2 * ASIN(SQRT(
            POWER(SIN((RADIANS($2) - RADIANS(latitude)) / 2), 2) +
            COS(RADIANS(latitude)) * COS(RADIANS($2)) *
            POWER(SIN((RADIANS($3) - RADIANS(longitude)) / 2), 2)
          )) as distance
        FROM ambulances
        WHERE status = 'available'
        ORDER BY distance ASC
        LIMIT $1`,
        [limit, longitude, latitude]
      );
      
      return result.rows.map(row => ({
        ...this._formatAmbulance(row),
        distance: row.distance
      }));
    } catch (err) {
      logger.error('❌ Failed to get nearest ambulances:', err);
      return [];
    }
  }

  // Get ambulance statistics
  async getStatistics() {
    try {
      const result = await query(
        `SELECT
          status,
          COUNT(*) as count,
          AVG(speed) as avg_speed,
          AVG(battery_level) as avg_battery,
          AVG(fuel_level) as avg_fuel
        FROM ambulances
        GROUP BY status`
      );
      
      const totalResult = await query('SELECT COUNT(*) as total FROM ambulances');
      
      return {
        total: parseInt(totalResult.rows[0].total),
        byStatus: result.rows.map(row => ({
          status: row.status,
          count: parseInt(row.count),
          avgSpeed: parseFloat(row.avg_speed),
          avgBattery: parseFloat(row.avg_battery),
          avgFuel: parseFloat(row.avg_fuel)
        }))
      };
    } catch (err) {
      logger.error('❌ Failed to get ambulance statistics:', err);
      return {
        total: 0,
        byStatus: []
      };
    }
  }
}

module.exports = { AmbulanceTracker };
