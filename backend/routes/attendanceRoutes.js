const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const controller = require('../controllers/attendanceController');

const router = express.Router();
router.use(authenticate);
router.post('/attendance/checkin', authorize('employee'), controller.checkIn);
router.post('/attendance/checkout', authorize('employee'), controller.checkOut);
router.get('/attendance/me', authorize('employee', 'admin'), controller.getMine);
router.get('/admin/attendance', authorize('admin'), controller.getAdmin);

module.exports = router;