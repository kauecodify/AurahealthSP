const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

class AuthController {
  static async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.getByEmail(email);
      
      if (!user) {
        return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ success: false, error: 'Conta inativa' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );

      res.json({ 
        success: true, 
        data: { 
          token, 
          refreshToken,
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role 
          } 
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async register(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, email, password, role } = req.body;
      
      const existingUser = await User.getByEmail(email);
      if (existingUser) {
        return res.status(409).json({ success: false, error: 'Email já cadastrado' });
      }

      const user = await User.create({ name, email, password, role });
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      res.status(201).json({ 
        success: true, 
        data: { 
          token,
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role 
          } 
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(401).json({ success: false, error: 'Refresh token é obrigatório' });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.getById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ success: false, error: 'Usuário não encontrado' });
      }

      const newToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      res.json({ success: true, data: { token: newToken } });
    } catch (error) {
      res.status(401).json({ success: false, error: 'Refresh token inválido ou expirado' });
    }
  }

  static async logout(req, res) {
    try {
      res.json({ success: true, message: 'Logout realizado com sucesso' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async me(req, res) {
    try {
      const user = await User.getById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
      }

      res.json({ 
        success: true, 
        data: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          status: user.status
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async registerPerson(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, email, password, cpf, phone, address } = req.body;
      
      const existingUser = await User.getByEmail(email);
      if (existingUser) {
        return res.status(409).json({ success: false, error: 'Email já cadastrado' });
      }

      const user = await User.create({ 
        name, 
        email, 
        password, 
        role: 'mei' 
      });

      res.status(201).json({ 
        success: true, 
        data: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          message: 'Pessoa cadastrada com sucesso. Agora você pode enviar propostas.'
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async changePassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.getById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, error: 'Senha atual inválida' });
      }

      await User.updatePassword(req.user.id, newPassword);
      
      res.json({ success: true, message: 'Senha alterada com sucesso' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = AuthController;
