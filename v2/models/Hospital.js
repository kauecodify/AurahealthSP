const { Pool } = require('pg');
const pool = require('../config/database');

class Hospital {
  static async getAll() {
    const result = await pool.query(`
      SELECT h.*, c.contract_number, c.value as contract_value, c.status as contract_status
      FROM hospitals h
      LEFT JOIN contracts c ON h.contract_id = c.id
      ORDER BY h.name
    `);
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(`
      SELECT h.*, c.contract_number, c.value as contract_value, c.status as contract_status
      FROM hospitals h
      LEFT JOIN contracts c ON h.contract_id = c.id
      WHERE h.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async getByCNPJ(cnpj) {
    const result = await pool.query('SELECT * FROM hospitals WHERE cnpj = $1', [cnpj]);
    return result.rows[0];
  }

  static async create(hospitalData) {
    const { name, cnpj, address, latitude, longitude, total_beds, icu_beds, phone, email } = hospitalData;
    const result = await pool.query(`
      INSERT INTO hospitals (name, cnpj, address, latitude, longitude, total_beds, icu_beds, phone, email, available_beds, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $6, 'available')
      RETURNING *
    `, [name, cnpj, address, latitude, longitude, total_beds, icu_beds, phone, email]);
    return result.rows[0];
  }

  static async update(id, hospitalData) {
    const { name, address, latitude, longitude, total_beds, icu_beds, phone, email, status } = hospitalData;
    const result = await pool.query(`
      UPDATE hospitals
      SET name = $1, address = $2, latitude = $3, longitude = $4,
          total_beds = $5, icu_beds = $6, phone = $7, email = $8, status = $9, updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `, [name, address, latitude, longitude, total_beds, icu_beds, phone, email, status, id]);
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM hospitals WHERE id = $1', [id]);
    return true;
  }

  static async updateStatus(id, status, available_beds, oxygen_level) {
    const result = await pool.query(`
      UPDATE hospitals
      SET status = $1, available_beds = $2, oxygen_level = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [status, available_beds, oxygen_level, id]);
    return result.rows[0];
  }

  static async getStatus(id) {
    const result = await pool.query(`
      SELECT id, name, status, available_beds, total_beds, icu_beds, oxygen_level,
             latitude, longitude, updated_at
      FROM hospitals
      WHERE id = $1
    `, [id]);
    return result.rows[0];
  }

  static async getSectors(hospitalId) {
    const result = await pool.query(`
      SELECT * FROM hospital_sectors
      WHERE hospital_id = $1
      ORDER BY name
    `, [hospitalId]);
    return result.rows;
  }

  static async getAuthorizedMEIs(hospitalId) {
    const result = await pool.query(`
      SELECT m.* FROM mei m
      JOIN hospital_mei_authorizations hma ON m.id = hma.mei_id
      WHERE hma.hospital_id = $1
    `, [hospitalId]);
    return result.rows;
  }

  static async getStats() {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'busy' THEN 1 ELSE 0 END) as busy,
        SUM(CASE WHEN status = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(total_beds) as total_beds,
        SUM(available_beds) as available_beds,
        SUM(icu_beds) as total_icu,
        AVG(oxygen_level) as avg_oxygen
      FROM hospitals
    `);
    return result.rows[0];
  }

  static async search(query) {
    const result = await pool.query(`
      SELECT * FROM hospitals
      WHERE name ILIKE $1 OR cnpj ILIKE $1
      ORDER BY name
    `, [`%${query}%`]);
    return result.rows;
  }
}

module.exports = Hospital;
