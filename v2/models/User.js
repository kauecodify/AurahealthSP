const { Pool } = require('pg');
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async getById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async getByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async create(userData) {
    const { name, email, password, role } = userData;
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES ($1, $2, $3, $4, 'active')
      RETURNING id, name, email, role, status, created_at
    `, [name, email, password_hash, role]);
    return result.rows[0];
  }

  static async update(id, userData) {
    const { name, email, role, status } = userData;
    const result = await pool.query(`
      UPDATE users
      SET name = $1, email = $2, role = $3, status = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING id, name, email, role, status, updated_at
    `, [name, email, role, status, id]);
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return true;
  }

  static async updatePassword(id, newPassword) {
    const password_hash = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(`
      UPDATE users
      SET password_hash = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, email, role
    `, [password_hash, id]);
    return result.rows[0];
  }

  static async getAll() {
    const result = await pool.query('SELECT id, name, email, role, status, created_at FROM users ORDER BY name');
    return result.rows;
  }

  static async getByRole(role) {
    const result = await pool.query('SELECT id, name, email, role, status FROM users WHERE role = $1 ORDER BY name', [role]);
    return result.rows;
  }

  static async getHospitalAdmins(hospitalId) {
    const result = await pool.query(`
      SELECT u.* FROM users u
      JOIN user_hospital_assignments uha ON u.id = uha.user_id
      WHERE uha.hospital_id = $1 AND u.role = 'hospital'
    `, [hospitalId]);
    return result.rows;
  }

  static async getGovernmentUsers() {
    const result = await pool.query('SELECT * FROM users WHERE role = \'government\' ORDER BY name');
    return result.rows;
  }

  static async verifyPassword(userId, password) {
    const user = await this.getById(userId);
    if (!user) return false;
    return bcrypt.compare(password, user.password_hash);
  }

  static async getStats() {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'hospital' THEN 1 ELSE 0 END) as hospitals,
        SUM(CASE WHEN role = 'mei' THEN 1 ELSE 0 END) as mei,
        SUM(CASE WHEN role = 'government' THEN 1 ELSE 0 END) as government,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
      FROM users
    `);
    return result.rows[0];
  }
}

module.exports = User;
