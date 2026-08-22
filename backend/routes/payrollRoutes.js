const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const controller = require('../controllers/payrollController');

const router = express.Router();
router.use(authenticate);
router.get('/payroll/me', authorize('employee', 'admin'), controller.getMine);
router.get('/admin/payroll', authorize('admin'), controller.getAdmin);
router.put('/admin/payroll/:userId', authorize('admin'), controller.update);

module.exports = router;