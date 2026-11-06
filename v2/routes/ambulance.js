const express = require('express');
const router = express.Router();
const AmbulanceController = require('../controllers/ambulanceController');
const { check } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize(['admin', 'hospital', 'government']), AmbulanceController.getAll);
router.get('/available', AmbulanceController.getAvailable);
router.get('/stats', authenticate, authorize(['admin', 'hospital', 'government']), AmbulanceController.getStats);
router.get('/nearby', AmbulanceController.getNearby);
router.get('/realtime', authenticate, authorize(['admin', 'hospital', 'government']), AmbulanceController.getRealTimeTracking);
router.get('/:id', authenticate, authorize(['admin', 'hospital', 'government']), AmbulanceController.getById);
router.get('/:id/location', AmbulanceController.getLocation);
router.get('/:id/vehicle/:vehicleId', authenticate, authorize(['admin', 'hospital', 'government']), AmbulanceController.getByVehicleId);
router.get('/hospital/:hospitalId', authenticate, authorize(['admin', 'hospital', 'government']), AmbulanceController.getByHospital);
router.get('/status/:status', authenticate, authorize(['admin', 'hospital', 'government']), AmbulanceController.getByStatus);

router.post('/',
  authenticate,
  authorize(['admin']),
  [
    check('vehicle_id').notEmpty().withMessage('ID do veículo é obrigatório'),
    check('type').notEmpty().withMessage('Tipo é obrigatório')
  ],
  AmbulanceController.create
);

router.post('/:id/assign',
  authenticate,
  authorize(['admin', 'hospital']),
  AmbulanceController.assignToEmergency
);

router.post('/emergency-broadcast',
  authenticate,
  authorize(['admin', 'hospital']),
  AmbulanceController.emergencyBroadcast
);

router.put('/:id',
  authenticate,
  authorize(['admin', 'hospital']),
  [
    check('vehicle_id').optional().notEmpty().withMessage('ID do veículo é obrigatório')
  ],
  AmbulanceController.update
);

router.put('/:id/location',
  authenticate,
  authorize(['admin', 'hospital']),
  [
    check('latitude').isFloat().withMessage('Latitude inválida'),
    check('longitude').isFloat().withMessage('Longitude inválida')
  ],
  AmbulanceController.updateLocation
);

router.put('/:id/status',
  authenticate,
  authorize(['admin', 'hospital']),
  [
    check('status').notEmpty().withMessage('Status é obrigatório')
  ],
  AmbulanceController.updateStatus
);

router.delete('/:id', authenticate, authorize(['admin']), AmbulanceController.delete);

module.exports = router;
