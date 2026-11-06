const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { check } = require('express-validator');

router.post('/login',
  [
    check('email').isEmail().withMessage('Email inválido'),
    check('password').notEmpty().withMessage('Senha é obrigatória')
  ],
  AuthController.login
);

router.post('/register',
  [
    check('name').notEmpty().withMessage('Nome é obrigatório'),
    check('email').isEmail().withMessage('Email inválido'),
    check('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    check('role').notEmpty().withMessage('Papel é obrigatório')
  ],
  AuthController.register
);

router.post('/register-person',
  [
    check('name').notEmpty().withMessage('Nome é obrigatório'),
    check('email').isEmail().withMessage('Email inválido'),
    check('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
  ],
  AuthController.registerPerson
);

router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.me);

router.post('/change-password',
  [
    check('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
    check('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres')
  ],
  AuthController.changePassword
);

module.exports = router;
