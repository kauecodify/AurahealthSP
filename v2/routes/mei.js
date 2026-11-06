const express = require('express');
const router = express.Router();
const MEIController = require('../controllers/meiController');
const { check } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/verify/:cnpj', MEIController.verify);
router.get('/status/:cnpj', MEIController.getStatus);
router.get('/:cnpj/sectors', MEIController.getSectors);
router.get('/:cnpj/hospitals', MEIController.getHospitals);
router.get('/:cnpj/authorized-hospitals', authenticate, authorize(['admin', 'mei']), MEIController.getAuthorizedHospitals);
router.get('/:cnpj/is-authorized/:hospitalId', MEIController.isAuthorizedForHospital);
router.get('/', authenticate, authorize(['admin', 'government']), MEIController.getAll);
router.get('/:id', authenticate, authorize(['admin', 'mei', 'government']), MEIController.getById);
router.get('/stats', authenticate, authorize(['admin', 'government']), MEIController.getStats);
router.get('/search', authenticate, authorize(['admin', 'government']), MEIController.search);

router.post('/verify-and-authorize', 
  authenticate, 
  authorize(['admin', 'hospital']),
  MEIController.verifyAndAuthorize
);

router.post('/register',
  authenticate,
  authorize(['admin', 'mei']),
  [
    check('cnpj').notEmpty().isLength({ min: 14, max: 14 }).withMessage('CNPJ inválido'),
    check('company_name').notEmpty().withMessage('Razão social é obrigatória'),
    check('owner_name').notEmpty().withMessage('Nome do proprietário é obrigatório'),
    check('owner_cpf').notEmpty().isLength({ min: 11, max: 11 }).withMessage('CPF inválido')
  ],
  MEIController.register
);

router.post('/:meiId/authorize/:hospitalId',
  authenticate,
  authorize(['admin', 'hospital']),
  MEIController.authorizeForHospital
);

router.put('/:id',
  authenticate,
  authorize(['admin', 'mei']),
  MEIController.update
);

router.delete('/:id', authenticate, authorize(['admin']), MEIController.delete);

module.exports = router;
