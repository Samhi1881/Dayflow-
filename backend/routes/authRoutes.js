const express = require('express');
const authenticate = require('../middleware/authenticate');
const controller = require('../controllers/authController');

const router = express.Router();
router.post('/auth/register', controller.register);
router.post('/auth/login', controller.login);
router.get('/auth/me', authenticate, controller.me);

module.exports = router;