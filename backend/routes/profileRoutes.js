const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const controller = require('../controllers/profileController');

const router = express.Router();
router.use(authenticate);
router.get('/profile/me', authorize('employee', 'admin'), controller.getMe);
router.put('/profile/me', authorize('employee', 'admin'), controller.updateMe);
router.get('/admin/employees/:id', authorize('admin'), controller.getEmployee);
router.put('/admin/employees/:id', authorize('admin'), controller.updateEmployee);

module.exports = router;