const express = require('express');
const router = express.Router();
const ContractController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['admin', 'government']));

router.get('/', ContractController.getContracts);
router.get('/:id', ContractController.getContract);
router.post('/', ContractController.createContract);
router.put('/:id', ContractController.updateContract);
router.delete('/:id', ContractController.deleteContract);

module.exports = router;
