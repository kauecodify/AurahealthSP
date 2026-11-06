const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['admin', 'government']));

router.get('/dashboard', AdminController.getDashboard);
router.get('/reports', AdminController.getReports);
router.get('/reports/contracts', AdminController.getContractReports);
router.get('/reports/hospitals', AdminController.getHospitalReports);
router.get('/reports/proposals', AdminController.getProposalReports);
router.get('/reports/budget', AdminController.getBudgetReport);

router.get('/contracts', AdminController.getContracts);
router.get('/contracts/:id', AdminController.getContract);
router.post('/contracts', AdminController.createContract);
router.put('/contracts/:id', AdminController.updateContract);
router.delete('/contracts/:id', AdminController.deleteContract);

router.get('/hospitals', AdminController.getHospitals);
router.get('/hospitals/:id', AdminController.getHospital);

router.get('/proposals', AdminController.getProposals);
router.get('/proposals/:id', AdminController.getProposal);
router.put('/proposals/:id/approve', AdminController.approveProposal);
router.put('/proposals/:id/reject', AdminController.rejectProposal);

router.get('/meis', AdminController.getMEIs);
router.get('/meis/:id', AdminController.getMEI);

router.get('/users', AdminController.getUsers);
router.get('/ambulances', AdminController.getAmbulances);

router.post('/proposals/quick-approve-all', AdminController.quickApproveAll);

module.exports = router;
