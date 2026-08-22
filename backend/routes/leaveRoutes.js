const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const controller = require('../controllers/leaveController');

const router = express.Router();
router.use(authenticate);
router.post('/leave', authorize('employee', 'admin'), controller.create);
router.get('/leave/me', authorize('employee', 'admin'), controller.getMine);
router.get('/admin/leave', authorize('admin'), controller.getAdmin);
router.patch('/admin/leave/:id/approve', authorize('admin'), controller.approve);
router.patch('/admin/leave/:id/reject', authorize('admin'), controller.reject);

module.exports = router;