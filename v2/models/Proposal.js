const { Pool } = require('pg');
const pool = require('../config/database');

class Proposal {
  static async getAll() {
    const result = await pool.query(`
      SELECT p.*, u.name as user_name, u.email as user_email,
             m.company_name as mei_name, m.cnpj as mei_cnpj,
             h.name as hospital_name
      FROM proposals p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN mei m ON p.mei_id = m.id
      LEFT JOIN hospitals h ON p.hospital_id = h.id
      ORDER BY p.created_at DESC
    `);
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(`
      SELECT p.*, u.name as user_name, u.email as user_email,
             m.company_name as mei_name, m.cnpj as mei_cnpj,
             h.name as hospital_name
      FROM proposals p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN mei m ON p.mei_id = m.id
      LEFT JOIN hospitals h ON p.hospital_id = h.id
      WHERE p.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async getByUser(userId) {
    const result = await pool.query(`
      SELECT p.*, u.name as user_name, u.email as user_email,
             m.company_name as mei_name, h.name as hospital_name
      FROM proposals p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN mei m ON p.mei_id = m.id
      LEFT JOIN hospitals h ON p.hospital_id = h.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
    `, [userId]);
    return result.rows;
  }

  static async create(proposalData) {
    const { user_id, mei_id, hospital_id, title, description, value, duration_days, documents, priority } = proposalData;
    const result = await pool.query(`
      INSERT INTO proposals (user_id, mei_id, hospital_id, title, description, value, duration_days, documents, priority)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [user_id, mei_id, hospital_id, title, description, value, duration_days, documents, priority]);
    return result.rows[0];
  }

  static async update(id, proposalData) {
    const { title, description, value, duration_days, documents, priority } = proposalData;
    const result = await pool.query(`
      UPDATE proposals
      SET title = $1, description = $2, value = $3, duration_days = $4,
          documents = $5, priority = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [title, description, value, duration_days, documents, priority, id]);
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM proposals WHERE id = $1', [id]);
    return true;
  }

  static async approve(id, approvedBy) {
    const result = await pool.query(`
      UPDATE proposals
      SET status = 'approved', approved_at = NOW(), approved_by = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [approvedBy, id]);
    return result.rows[0];
  }

  static async reject(id, approvedBy, notes) {
    const result = await pool.query(`
      UPDATE proposals
      SET status = 'rejected', approved_at = NOW(), approved_by = $1, notes = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [approvedBy, notes, id]);
    return result.rows[0];
  }

  static async getPending() {
    const result = await pool.query(`
      SELECT p.*, u.name as user_name, u.email as user_email,
             m.company_name as mei_name, h.name as hospital_name
      FROM proposals p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN mei m ON p.mei_id = m.id
      LEFT JOIN hospitals h ON p.hospital_id = h.id
      WHERE p.status = 'pending'
      ORDER BY p.priority DESC, p.created_at ASC
    `);
    return result.rows;
  }

  static async getByStatus(status) {
    const result = await pool.query(`
      SELECT p.*, u.name as user_name, u.email as user_email,
             m.company_name as mei_name, h.name as hospital_name
      FROM proposals p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN mei m ON p.mei_id = m.id
      LEFT JOIN hospitals h ON p.hospital_id = h.id
      WHERE p.status = $1
      ORDER BY p.created_at DESC
    `, [status]);
    return result.rows;
  }

  static async getStats() {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(value) as total_value,
        AVG(value) as avg_value
      FROM proposals
    `);
    return result.rows[0];
  }

  static async getByMEI(meiId) {
    const result = await pool.query(`
      SELECT p.*, u.name as user_name, h.name as hospital_name
      FROM proposals p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN hospitals h ON p.hospital_id = h.id
      WHERE p.mei_id = $1
      ORDER BY p.created_at DESC
    `, [meiId]);
    return result.rows;
  }

  static async getByHospital(hospitalId) {
    const result = await pool.query(`
      SELECT p.*, u.name as user_name, m.company_name as mei_name
      FROM proposals p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN mei m ON p.mei_id = m.id
      WHERE p.hospital_id = $1
      ORDER BY p.created_at DESC
    `, [hospitalId]);
    return result.rows;
  }
}

module.exports = Proposal;
