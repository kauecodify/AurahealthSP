const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { logger } = require('./logger');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production-min-64-chars';

// Generate JWT token
function generateToken(user, expiresIn = '24h') {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// Generate refresh token
function generateRefreshToken(user, expiresIn = '7d') {
  const payload = {
    id: user.id,
    tokenType: 'refresh'
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    logger.error('❌ JWT verification error:', err.message);
    return null;
  }
}

// Authentication middleware
async function authenticate(req, res, next) {
  try {
    // Get token from header, query or cookies
    let token = req.headers.authorization;
    
    if (!token) {
      token = req.query.token;
    }
    
    if (!token) {
      token = req.cookies?.token;
    }
    
    if (!token) {
      return res.status(401).json({
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
    }
    
    // Remove Bearer prefix
    if (token.startsWith('Bearer ')) {
      token = token.substring(7);
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    // Check if token is refresh token
    if (decoded.tokenType === 'refresh') {
      return res.status(401).json({
        error: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }
    
    // Get user from database
    const user = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    const userData = user.rows[0];
    
    // Check if user is active
    if (userData.status !== 'active') {
      return res.status(403).json({
        error: 'User is not active',
        code: 'USER_INACTIVE'
      });
    }
    
    // Attach user to request
    req.user = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      cpf: userData.cpf,
      cnpj: userData.cnpj,
      phone: userData.phone
    };
    
    req.token = token;
    
    next();
  } catch (err) {
    logger.error('❌ Authentication error:', err);
    res.status(500).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
}

// Authorization middleware (role-based)
function authorize(roles = []) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          code: 'UNAUTHORIZED'
        });
      }
      
      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Forbidden - Insufficient permissions',
          code: 'FORBIDDEN',
          requiredRoles: roles,
          userRole: req.user.role
        });
      }
      
      next();
    } catch (err) {
      logger.error('❌ Authorization error:', err);
      res.status(500).json({
        error: 'Authorization failed',
        code: 'AUTHZ_ERROR'
      });
    }
  };
}

// Check if user is admin
function isAdmin(req, res, next) {
  return authorize(['admin', 'super_admin'])(req, res, next);
}

// Check if user is hospital admin
function isHospitalAdmin(req, res, next) {
  return authorize(['admin', 'super_admin', 'hospital_admin'])(req, res, next);
}

// Check if user is government
function isGovernment(req, res, next) {
  return authorize(['admin', 'super_admin', 'government'])(req, res, next);
}

// Refresh token middleware
async function refreshToken(req, res) {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        error: 'Refresh token is required',
        code: 'NO_REFRESH_TOKEN'
      });
    }
    
    // Verify refresh token
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.tokenType !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
    
    // Get user from database
    const user = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    const userData = user.rows[0];
    
    // Generate new tokens
    const newToken = generateToken(userData);
    const newRefreshToken = generateRefreshToken(userData);
    
    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      }
    });
  } catch (err) {
    logger.error('❌ Refresh token error:', err);
    res.status(500).json({
      error: 'Refresh token failed',
      code: 'REFRESH_ERROR'
    });
  }
}

// Login middleware
async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }
    
    // Get user from database
    const user = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    const userData = user.rows[0];
    
    // Check password
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Check if user is active
    if (userData.status !== 'active') {
      return res.status(403).json({
        error: 'User is not active',
        code: 'USER_INACTIVE'
      });
    }
    
    // Update last login
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [userData.id]
    );
    
    // Generate tokens
    const token = generateToken(userData);
    const refreshToken = generateRefreshToken(userData);
    
    res.json({
      token,
      refreshToken,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        cpf: userData.cpf,
        cnpj: userData.cnpj,
        phone: userData.phone,
        avatarUrl: userData.avatar_url
      }
    });
  } catch (err) {
    logger.error('❌ Login error:', err);
    res.status(500).json({
      error: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
}

// Register middleware
async function register(req, res) {
  try {
    const { email, password, name, role = 'user', cpf, cnpj, phone } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password and name are required',
        code: 'MISSING_FIELDS'
      });
    }
    
    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'Email already registered',
        code: 'EMAIL_EXISTS'
      });
    }
    
    // Hash password
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await query(
      `INSERT INTO users (
        name, email, password_hash, role, cpf, cnpj, phone, status,
        email_verified, phone_verified, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING id, name, email, role, cpf, cnpj, phone, status, created_at`,
      [
        name,
        email.toLowerCase(),
        passwordHash,
        role,
        cpf,
        cnpj,
        phone,
        'active',
        false,
        false
      ]
    );
    
    const userData = result.rows[0];
    
    // Generate tokens
    const token = generateToken(userData);
    const refreshToken = generateRefreshToken(userData);
    
    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        cpf: userData.cpf,
        cnpj: userData.cnpj,
        phone: userData.phone
      }
    });
  } catch (err) {
    logger.error('❌ Registration error:', err);
    res.status(500).json({
      error: 'Registration failed',
      code: 'REGISTRATION_ERROR'
    });
  }
}

module.exports = {
  authenticate,
  authorize,
  isAdmin,
  isHospitalAdmin,
  isGovernment,
  refreshToken,
  login,
  register,
  generateToken,
  generateRefreshToken,
  verifyToken
};
