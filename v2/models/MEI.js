const { Pool } = require('pg');
const pool = require('../config/database');

class MEI {
  static async getByCNPJ(cnpj) {
    const result = await pool.query('SELECT * FROM mei WHERE cnpj = $1', [cnpj]);
    return result.rows[0];
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM mei WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(meiData) {
    const { cnpj, company_name, owner_name, owner_cpf, sectors, registration_date, expiry_date } = meiData;
    const result = await pool.query(`
      INSERT INTO mei (cnpj, company_name, owner_name, owner_cpf, sectors, registration_date, expiry_date, status, verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', false)
      RETURNING *
    `, [cnpj, company_name, owner_name, owner_cpf, sectors, registration_date, expiry_date]);
    return result.rows[0];
  }

  static async update(id, meiData) {
    const { cnpj, company_name, owner_name, owner_cpf, sectors, registration_date, expiry_date, status, verified } = meiData;
    const result = await pool.query(`
      UPDATE mei
      SET cnpj = $1, company_name = $2, owner_name = $3, owner_cpf = $4,
          sectors = $5, registration_date = $6, expiry_date = $7,
          status = $8, verified = $9, updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `, [cnpj, company_name, owner_name, owner_cpf, sectors, registration_date, expiry_date, status, verified, id]);
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM mei WHERE id = $1', [id]);
    return true;
  }

  static async verify(cnpj) {
    const result = await pool.query(`
      UPDATE mei
      SET verified = true, verification_date = NOW(), status = 'active'
      WHERE cnpj = $1
      RETURNING *
    `, [cnpj]);
    return result.rows[0];
  }

  static async getAll() {
    const result = await pool.query('SELECT * FROM mei ORDER BY company_name');
    return result.rows;
  }

  static async getAuthorizedForHospital(hospitalId) {
    const result = await pool.query(`
      SELECT m.* FROM mei m
      JOIN hospital_mei_authorizations hma ON m.id = hma.mei_id
      WHERE hma.hospital_id = $1 AND m.verified = true
    `, [hospitalId]);
    return result.rows;
  }

  static async authorizeForHospital(meiId, hospitalId, sectors) {
    await pool.query(`
      INSERT INTO hospital_mei_authorizations (mei_id, hospital_id, authorized_sectors)
      VALUES ($1, $2, $3)
      ON CONFLICT (mei_id, hospital_id) DO UPDATE
      SET authorized_sectors = $3
    `, [meiId, hospitalId, sectors]);
    return true;
  }

  static async isAuthorizedForHospital(cnpj, hospitalId) {
    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM hospital_mei_authorizations hma
      JOIN mei m ON hma.mei_id = m.id
      WHERE m.cnpj = $1 AND hma.hospital_id = $2
    `, [cnpj, hospitalId]);
    return result.rows[0].count > 0;
  }

  static async getSectors(cnpj) {
    const mei = await this.getByCNPJ(cnpj);
    return mei ? mei.sectors : [];
  }

  static async getHospitalsForMEI(meiId) {
    const result = await pool.query(`
      SELECT h.* FROM hospitals h
      JOIN hospital_mei_authorizations hma ON h.id = hma.hospital_id
      WHERE hma.mei_id = $1
    `, [meiId]);
    return result.rows;
  }

  static async getStats() {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN verified = true THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired
      FROM mei
    `);
    return result.rows[0];
  }

  static async search(query) {
    const result = await pool.query(`
      SELECT * FROM mei
      WHERE company_name ILIKE $1 OR owner_name ILIKE $1 OR cnpj ILIKE $1
      ORDER BY company_name
    `, [`%${query}%`]);
    return result.rows;
  }
}

module.exports = MEI;
