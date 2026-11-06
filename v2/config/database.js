const { Pool } = require('pg');
const { logger } = require('../middleware/logger');

let pool;

async function connectDB() {
  try {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5433,
      database: process.env.DB_NAME || 'aurahealth_v2',
      user: process.env.DB_USER || 'aura',
      password: process.env.DB_PASSWORD || 'aura123',
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    });
    
    // Test connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    logger.info(`✅ PostgreSQL connected at ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    return pool;
  } catch (err) {
    logger.error('❌ Database connection error:', err);
    throw err;
  }
}

async function checkConnection() {
  try {
    if (!pool) {
      await connectDB();
    }
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return 'ok';
  } catch (err) {
    logger.error('❌ Database health check failed:', err);
    return 'error';
  }
}

async function getClient() {
  if (!pool) {
    await connectDB();
  }
  return pool.connect();
}

async function query(text, params) {
  if (!pool) {
    await connectDB();
  }
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  
  if (process.env.LOG_QUERIES === 'true') {
    logger.info('🗄️ Query executed:', { text, duration, rows: result.rowCount });
  }
  
  return result;
}

async function close() {
  if (pool) {
    await pool.end();
    logger.info('✅ Database connection closed');
  }
}

// Database migration helper
async function runMigrations() {
  try {
    const client = await getClient();
    
    // Create tables if not exist
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        cpf VARCHAR(11),
        cnpj VARCHAR(14),
        phone VARCHAR(20),
        avatar_url VARCHAR(500),
        status VARCHAR(50) DEFAULT 'active',
        email_verified BOOLEAN DEFAULT false,
        phone_verified BOOLEAN DEFAULT false,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS hospitals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        cnpj VARCHAR(14) UNIQUE,
        address JSONB NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        total_beds INTEGER DEFAULT 0,
        available_beds INTEGER DEFAULT 0,
        icu_beds INTEGER DEFAULT 0,
        available_icu_beds INTEGER DEFAULT 0,
        oxygen_level DECIMAL(5, 2) DEFAULT 100,
        oxygen_capacity DECIMAL(5, 2) DEFAULT 100,
        status VARCHAR(50) DEFAULT 'available',
        phone VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(255),
        emergency_phone VARCHAR(20),
        type VARCHAR(50) DEFAULT 'HOSPITAL',
        level VARCHAR(50) DEFAULT 'central',
        region VARCHAR(100),
        city VARCHAR(100),
        state VARCHAR(2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS hospital_sectors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        capacity INTEGER DEFAULT 0,
        current_occupancy INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        mei_required BOOLEAN DEFAULT false,
        equipment JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS mei (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cnpj VARCHAR(14) UNIQUE NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        owner_cpf VARCHAR(11) NOT NULL,
        owner_email VARCHAR(255),
        owner_phone VARCHAR(20),
        sectors JSONB NOT NULL,
        registration_date DATE NOT NULL,
        expiry_date DATE,
        status VARCHAR(50) DEFAULT 'pending',
        verified BOOLEAN DEFAULT false,
        verification_date TIMESTAMP,
        verification_code VARCHAR(100),
        documents JSONB,
        address JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS proposals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        mei_id UUID REFERENCES mei(id) ON DELETE SET NULL,
        hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        value DECIMAL(15, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'BRL',
        duration_days INTEGER,
        start_date DATE,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(50) DEFAULT 'normal',
        category VARCHAR(100),
        documents JSONB DEFAULT '[]',
        notes TEXT,
        rejection_reason TEXT,
        approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS ambulances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vehicle_id VARCHAR(50) UNIQUE NOT NULL,
        hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'basic',
        status VARCHAR(50) DEFAULT 'available',
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        speed DECIMAL(10, 2) DEFAULT 0,
        heading DECIMAL(10, 2) DEFAULT 0,
        altitude DECIMAL(10, 2),
        accuracy DECIMAL(10, 2),
        battery_level DECIMAL(5, 2) DEFAULT 100,
        fuel_level DECIMAL(5, 2) DEFAULT 100,
        last_update TIMESTAMP DEFAULT NOW(),
        driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
        driver_name VARCHAR(255),
        driver_phone VARCHAR(20),
        driver_license VARCHAR(50),
        equipment JSONB DEFAULT '[]',
        current_emergency_id UUID,
        assigned_to VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS contracts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
        provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        mei_id UUID REFERENCES mei(id) ON DELETE SET NULL,
        contract_number VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        value DECIMAL(15, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'BRL',
        payment_terms JSONB,
        scope_of_work TEXT,
        status VARCHAR(50) DEFAULT 'active',
        auto_renewal BOOLEAN DEFAULT false,
        renewal_notice_days INTEGER DEFAULT 30,
        signed_at TIMESTAMP,
        signed_by UUID REFERENCES users(id) ON DELETE SET NULL,
        documents JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS emergencies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        caller_name VARCHAR(255),
        caller_phone VARCHAR(20) NOT NULL,
        caller_location JSONB,
        patient_name VARCHAR(255),
        patient_age INTEGER,
        patient_gender VARCHAR(20),
        patient_condition TEXT,
        emergency_type VARCHAR(100) NOT NULL,
        severity VARCHAR(50) DEFAULT 'medium',
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        assigned_ambulance_id UUID REFERENCES ambulances(id) ON DELETE SET NULL,
        assigned_hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
        assigned_at TIMESTAMP,
        arrived_at TIMESTAMP,
        completed_at TIMESTAMP,
        location JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS satellite_commands (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        command_type VARCHAR(100) NOT NULL,
        target VARCHAR(100),
        parameters JSONB DEFAULT '{}',
        status VARCHAR(50) DEFAULT 'pending',
        response JSONB,
        error TEXT,
        sent_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID,
        old_value JSONB,
        new_value JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        status VARCHAR(50) DEFAULT 'unread',
        data JSONB DEFAULT '{}',
        action_url VARCHAR(500),
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
      `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,
      `CREATE INDEX IF NOT EXISTS idx_hospitals_status ON hospitals(status)`,
      `CREATE INDEX IF NOT EXISTS idx_hospitals_location ON hospitals(latitude, longitude)`,
      `CREATE INDEX IF NOT EXISTS idx_mei_cnpj ON mei(cnpj)`,
      `CREATE INDEX IF NOT EXISTS idx_mei_status ON mei(status)`,
      `CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status)`,
      `CREATE INDEX IF NOT EXISTS idx_proposals_user ON proposals(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_ambulances_status ON ambulances(status)`,
      `CREATE INDEX IF NOT EXISTS idx_ambulances_hospital ON ambulances(hospital_id)`,
      `CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status)`,
      `CREATE INDEX IF NOT EXISTS idx_emergencies_status ON emergencies(status)`,
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status)`
    ];
    
    for (const table of tables) {
      await client.query(table);
    }
    
    // Create triggers for updated_at
    const triggers = [
      `CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'`,
      
      `DROP TRIGGER IF EXISTS update_users_updated_at ON users`,
      `CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
      
      `DROP TRIGGER IF EXISTS update_hospitals_updated_at ON hospitals`,
      `CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON hospitals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
      
      `DROP TRIGGER IF EXISTS update_mei_updated_at ON mei`,
      `CREATE TRIGGER update_mei_updated_at BEFORE UPDATE ON mei FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
      
      `DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals`,
      `CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
      
      `DROP TRIGGER IF EXISTS update_ambulances_updated_at ON ambulances`,
      `CREATE TRIGGER update_ambulances_updated_at BEFORE UPDATE ON ambulances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
      
      `DROP TRIGGER IF EXISTS update_contracts_updated_at ON contracts`,
      `CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`
    ];
    
    for (const trigger of triggers) {
      await client.query(trigger);
    }
    
    client.release();
    logger.info('✅ Database migrations completed');
  } catch (err) {
    logger.error('❌ Database migration error:', err);
    if (client) client.release();
    throw err;
  }
}

module.exports = {
  connectDB,
  checkConnection,
  getClient,
  query,
  close,
  runMigrations,
  pool
};
