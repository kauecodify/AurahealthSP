const express = require('express');
const router = express.Router();
const ProposalController = require('../controllers/proposalController');
const { check } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize(['admin', 'government', 'mei']), ProposalController.getAll);
router.get('/pending', authenticate, authorize(['admin', 'government']), ProposalController.getPending);
router.get('/stats', authenticate, authorize(['admin', 'government']), ProposalController.getStats);
router.get('/:id', authenticate, authorize(['admin', 'government', 'mei']), ProposalController.getById);
router.get('/user/:userId', authenticate, authorize(['admin', 'government', 'mei']), ProposalController.getByUser);
router.get('/mei/:meiId', authenticate, authorize(['admin', 'government', 'mei']), ProposalController.getByMEI);
router.get('/hospital/:hospitalId', authenticate, authorize(['admin', 'government', 'hospital']), ProposalController.getByHospital);
router.get('/status/:status', authenticate, authorize(['admin', 'government']), ProposalController.getByStatus);

router.post('/',
  authenticate,
  authorize(['mei', 'admin']),
  [
    check('title').notEmpty().withMessage('Título é obrigatório'),
    check('description').notEmpty().withMessage('Descrição é obrigatória'),
    check('value').isFloat({ min: 0 }).withMessage('Valor inválido'),
    check('duration_days').isInt({ min: 1 }).withMessage('Duração inválida')
  ],
  ProposalController.create
);

router.post('/submit-with-mei',
  authenticate,
  authorize(['mei', 'admin']),
  [
    check('user_id').notEmpty().withMessage('Usuário é obrigatório'),
    check('cnpj').notEmpty().isLength({ min: 14, max: 14 }).withMessage('CNPJ inválido'),
    check('title').notEmpty().withMessage('Título é obrigatório'),
    check('description').notEmpty().withMessage('Descrição é obrigatória'),
    check('value').isFloat({ min: 0 }).withMessage('Valor inválido')
  ],
  ProposalController.submitWithMEI
);

router.put('/:id',
  authenticate,
  authorize(['mei', 'admin']),
  [
    check('title').optional().notEmpty().withMessage('Título é obrigatório'),
    check('value').optional().isFloat({ min: 0 }).withMessage('Valor inválido')
  ],
  ProposalController.update
);

router.put('/:id/approve', authenticate, authorize(['admin', 'government']), ProposalController.approve);
router.put('/:id/reject', authenticate, authorize(['admin', 'government']), ProposalController.reject);
router.put('/:id/quick-approve', authenticate, authorize(['admin', 'government']), ProposalController.quickApprove);

router.delete('/:id', authenticate, authorize(['admin']), ProposalController.delete);

module.exports = router;
