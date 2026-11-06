const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/hospitals', require('./hospital'));
router.use('/mei', require('./mei'));
router.use('/proposals', require('./proposal'));
router.use('/ambulances', require('./ambulance'));
router.use('/satellite', require('./satellite'));
router.use('/admin', require('./admin'));

router.get('/', (req, res) => {
  res.json({
    message: 'AuraHealthSP v2 API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/v2/auth',
      hospitals: '/api/v2/hospitals',
      mei: '/api/v2/mei',
      proposals: '/api/v2/proposals',
      ambulances: '/api/v2/ambulances',
      satellite: '/api/v2/satellite',
      admin: '/api/v2/admin'
    },
    budget: 'R$ 20.000.000,00 (Pre-Seed 2030)',
    infrastructure: 'OldButGold TR8'
  });
});

router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;
