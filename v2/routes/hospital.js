const express = require('express');
const router = express.Router();
const HospitalController = require('../controllers/hospitalController');
const { check } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize(['admin', 'hospital', 'government']), HospitalController.getAll);
router.get('/stats', authenticate, authorize(['admin', 'hospital', 'government']), HospitalController.getStats);
router.get('/search', authenticate, authorize(['admin', 'hospital', 'government']), HospitalController.search);
router.get('/:id', authenticate, authorize(['admin', 'hospital', 'government']), HospitalController.getById);
router.get('/:id/status', HospitalController.getStatus);
router.get('/:id/sectors', authenticate, authorize(['admin', 'hospital', 'government']), HospitalController.getSectors);
router.get('/:id/mei', authenticate, authorize(['admin', 'hospital', 'government']), HospitalController.getAuthorizedMEIs);
router.get('/:id/mei/check', authenticate, authorize(['admin', 'hospital', 'government']), HospitalController.checkMEIAuthorization);
router.get('/:id/service-dashboard', authenticate, authorize(['admin', 'hospital', 'government']), HospitalController.getServiceDashboard);

router.post('/', 
  authenticate, 
  authorize(['admin']),
  [
    check('name').notEmpty().withMessage('Nome é obrigatório'),
    check('cnpj').notEmpty().isLength({ min: 14, max: 14 }).withMessage('CNPJ inválido'),
    check('latitude').isFloat().withMessage('Latitude inválida'),
    check('longitude').isFloat().withMessage('Longitude inválida'),
    check('total_beds').isInt({ min: 0 }).withMessage('Total de leitos inválido')
  ],
  HospitalController.create
);

router.put('/:id', 
  authenticate, 
  authorize(['admin', 'hospital']),
  [
    check('name').optional().notEmpty().withMessage('Nome é obrigatório'),
    check('total_beds').optional().isInt({ min: 0 }).withMessage('Total de leitos inválido')
  ],
  HospitalController.update
);

router.put('/:id/status', 
  authenticate, 
  authorize(['admin', 'hospital']),
  HospitalController.updateStatus
);

router.delete('/:id', authenticate, authorize(['admin']), HospitalController.delete);

module.exports = router;
