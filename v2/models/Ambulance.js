const { Pool } = require('pg');
const pool = require('../config/database');

class Ambulance {
  static async getAll() {
    const result = await pool.query(`
      SELECT a.*, h.name as hospital_name
      FROM ambulances a
      LEFT JOIN hospitals h ON a.hospital_id = h.id
      ORDER BY a.vehicle_id
    `);
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(`
      SELECT a.*, h.name as hospital_name
      FROM ambulances a
      LEFT JOIN hospitals h ON a.hospital_id = h.id
      WHERE a.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async getByVehicleId(vehicleId) {
    const result = await pool.query(`
      SELECT a.*, h.name as hospital_name
      FROM ambulances a
      LEFT JOIN hospitals h ON a.hospital_id = h.id
      WHERE a.vehicle_id = $1
    `, [vehicleId]);
    return result.rows[0];
  }

  static async create(ambulanceData) {
    const { vehicle_id, hospital_id, type, driver_name, driver_phone, equipment } = ambulanceData;
    const result = await pool.query(`
      INSERT INTO ambulances (vehicle_id, hospital_id, type, status, driver_name, driver_phone, equipment)
      VALUES ($1, $2, $3, 'available', $4, $5, $6)
      RETURNING *
    `, [vehicle_id, hospital_id, type, driver_name, driver_phone, equipment]);
    return result.rows[0];
  }

  static async update(id, ambulanceData) {
    const { vehicle_id, hospital_id, type, driver_name, driver_phone, equipment } = ambulanceData;
    const result = await pool.query(`
      UPDATE ambulances
      SET vehicle_id = $1, hospital_id = $2, type = $3,
          driver_name = $4, driver_phone = $5, equipment = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [vehicle_id, hospital_id, type, driver_name, driver_phone, equipment, id]);
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM ambulances WHERE id = $1', [id]);
    return true;
  }

  static async updateLocation(id, latitude, longitude, speed, heading) {
    const result = await pool.query(`
      UPDATE ambulances
      SET latitude = $1, longitude = $2, speed = $3, heading = $4, last_update = NOW()
      WHERE id = $5
      RETURNING *
    `, [latitude, longitude, speed, heading, id]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const result = await pool.query(`
      UPDATE ambulances
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, id]);
    return result.rows[0];
  }

  static async assignToEmergency(ambulanceId, emergencyId) {
    await pool.query(`
      UPDATE ambulances
      SET status = 'assigned', current_emergency_id = $1, updated_at = NOW()
      WHERE id = $2
    `, [emergencyId, ambulanceId]);
    return true;
  }

  static async getAvailable() {
    const result = await pool.query(`
      SELECT a.*, h.name as hospital_name
      FROM ambulances a
      LEFT JOIN hospitals h ON a.hospital_id = h.id
      WHERE a.status = 'available'
      ORDER BY a.vehicle_id
    `);
    return result.rows;
  }

  static async getByStatus(status) {
    const result = await pool.query(`
      SELECT a.*, h.name as hospital_name
      FROM ambulances a
      LEFT JOIN hospitals h ON a.hospital_id = h.id
      WHERE a.status = $1
      ORDER BY a.vehicle_id
    `, [status]);
    return result.rows;
  }

  static async getByHospital(hospitalId) {
    const result = await pool.query(`
      SELECT * FROM ambulances
      WHERE hospital_id = $1
      ORDER BY vehicle_id
    `, [hospitalId]);
    return result.rows;
  }

  static async getLocation(id) {
    const result = await pool.query(`
      SELECT id, vehicle_id, latitude, longitude, speed, heading, status, last_update
      FROM ambulances
      WHERE id = $1
    `, [id]);
    return result.rows[0];
  }

  static async getStats() {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as assigned,
        SUM(CASE WHEN status = 'en_route' THEN 1 ELSE 0 END) as en_route,
        SUM(CASE WHEN status = 'on_scene' THEN 1 ELSE 0 END) as on_scene,
        SUM(CASE WHEN status = 'unavailable' THEN 1 ELSE 0 END) as unavailable
      FROM ambulances
    `);
    return result.rows[0];
  }

  static async getNearby(latitude, longitude, radiusKm = 10) {
    const result = await pool.query(`
      SELECT a.*, h.name as hospital_name,
             6371 * 2 * ASIN(SQRT(POWER(SIN((RADIANS($1) - RADIANS(a.latitude)) / 2), 2) +
             COS(RADIANS($1)) * COS(RADIANS(a.latitude)) *
             POWER(SIN((RADIANS($2) - RADIANS(a.longitude)) / 2), 2))) as distance_km
      FROM ambulances a
      LEFT JOIN hospitals h ON a.hospital_id = h.id
      WHERE a.status = 'available'
      HAVING distance_km <= $3
      ORDER BY distance_km
    `, [latitude, longitude, radiusKm]);
    return result.rows;
  }
}

module.exports = Ambulance;
