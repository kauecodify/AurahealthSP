const express = require('express');
const router = express.Router();
const SatelliteController = require('../controllers/satelliteController');
const { check } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/coverage', SatelliteController.getCoverage);
router.get('/status', SatelliteController.getStatus);
router.get('/stats', authenticate, authorize(['admin', 'government']), SatelliteController.getSatelliteStats);
router.get('/test', authenticate, authorize(['admin']), SatelliteController.testConnection);
router.get('/ambulances', authenticate, authorize(['admin', 'hospital', 'government']), SatelliteController.getAmbulanceSatelliteData);
router.get('/ambulances/all', authenticate, authorize(['admin', 'hospital', 'government']), SatelliteController.trackAllAmbulances);
router.get('/ambulances/:ambulanceId', authenticate, authorize(['admin', 'hospital', 'government']), SatelliteController.trackAmbulance);
router.get('/ambulances/:ambulanceId/location', authenticate, authorize(['admin', 'hospital', 'government']), SatelliteController.getSatelliteAmbulanceLocation);

router.post('/command',
  authenticate,
  authorize(['admin', 'hospital']),
  [
    check('command').notEmpty().withMessage('Comando é obrigatório')
  ],
  SatelliteController.sendCommand
);

router.post('/emergency-command',
  authenticate,
  authorize(['admin', 'hospital']),
  [
    check('ambulanceId').notEmpty().withMessage('ID da ambulância é obrigatório'),
    check('emergencyLocation').notEmpty().withMessage('Local da emergência é obrigatório')
  ],
  SatelliteController.sendEmergencyCommand
);

module.exports = router;
