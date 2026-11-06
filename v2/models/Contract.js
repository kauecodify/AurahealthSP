const { Pool } = require('pg');
const pool = require('../config/database');

class Contract {
  static async getAll() {
    const result = await pool.query(`
      SELECT c.*, h.name as hospital_name, u.name as provider_name, u.email as provider_email
      FROM contracts c
      JOIN hospitals h ON c.hospital_id = h.id
      JOIN users u ON c.provider_id = u.id
      ORDER BY c.start_date DESC
    `);
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(`
      SELECT c.*, h.name as hospital_name, u.name as provider_name, u.email as provider_email
      FROM contracts c
      JOIN hospitals h ON c.hospital_id = h.id
      JOIN users u ON c.provider_id = u.id
      WHERE c.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async getByContractNumber(contractNumber) {
    const result = await pool.query(`
      SELECT c.*, h.name as hospital_name, u.name as provider_name
      FROM contracts c
      JOIN hospitals h ON c.hospital_id = h.id
      JOIN users u ON c.provider_id = u.id
      WHERE c.contract_number = $1
    `, [contractNumber]);
    return result.rows[0];
  }

  static async create(contractData) {
    const { hospital_id, provider_id, contract_number, start_date, end_date, value, description, auto_renewal, payment_terms, scope_of_work } = contractData;
    const result = await pool.query(`
      INSERT INTO contracts (hospital_id, provider_id, contract_number, start_date, end_date, value, description, auto_renewal, payment_terms, scope_of_work)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [hospital_id, provider_id, contract_number, start_date, end_date, value, description, auto_renewal, payment_terms, scope_of_work]);
    return result.rows[0];
  }

  static async update(id, contractData) {
    const { hospital_id, provider_id, contract_number, start_date, end_date, value, description, auto_renewal, payment_terms, scope_of_work, status } = contractData;
    const result = await pool.query(`
      UPDATE contracts
      SET hospital_id = $1, provider_id = $2, contract_number = $3,
          start_date = $4, end_date = $5, value = $6, description = $7,
          auto_renewal = $8, payment_terms = $9, scope_of_work = $10, status = $11, updated_at = NOW()
      WHERE id = $12
      RETURNING *
    `, [hospital_id, provider_id, contract_number, start_date, end_date, value, description, auto_renewal, payment_terms, scope_of_work, status, id]);
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM contracts WHERE id = $1', [id]);
    return true;
  }

  static async getByHospital(hospitalId) {
    const result = await pool.query(`
      SELECT c.*, u.name as provider_name, u.email as provider_email
      FROM contracts c
      JOIN users u ON c.provider_id = u.id
      WHERE c.hospital_id = $1
      ORDER BY c.start_date DESC
    `, [hospitalId]);
    return result.rows;
  }

  static async getByProvider(providerId) {
    const result = await pool.query(`
      SELECT c.*, h.name as hospital_name
      FROM contracts c
      JOIN hospitals h ON c.hospital_id = h.id
      WHERE c.provider_id = $1
      ORDER BY c.start_date DESC
    `, [providerId]);
    return result.rows;
  }

  static async getActive() {
    const result = await pool.query(`
      SELECT c.*, h.name as hospital_name, u.name as provider_name
      FROM contracts c
      JOIN hospitals h ON c.hospital_id = h.id
      JOIN users u ON c.provider_id = u.id
      WHERE c.status = 'active' AND c.end_date >= CURRENT_DATE
      ORDER BY c.start_date DESC
    `);
    return result.rows;
  }

  static async getExpiringSoon(days = 30) {
    const result = await pool.query(`
      SELECT c.*, h.name as hospital_name, u.name as provider_name,
             c.end_date - CURRENT_DATE as days_until_expiry
      FROM contracts c
      JOIN hospitals h ON c.hospital_id = h.id
      JOIN users u ON c.provider_id = u.id
      WHERE c.status = 'active' AND c.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${days} days'
      ORDER BY c.end_date
    `);
    return result.rows;
  }

  static async getStats() {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(value) as total_value,
        AVG(value) as avg_value
      FROM contracts
    `);
    return result.rows[0];
  }

  static async renew(id, newEndDate) {
    const result = await pool.query(`
      UPDATE contracts
      SET end_date = $1, status = 'active', updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [newEndDate, id]);
    return result.rows[0];
  }

  static async cancel(id) {
    const result = await pool.query(`
      UPDATE contracts
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);
    return result.rows[0];
  }
}

module.exports = Contract;
