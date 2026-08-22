const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

function handleError(error, response) {
  const status = error.status || 500;
  response.status(status).json({ error: { code: error.code || 'INTERNAL_ERROR', message: status === 500 ? 'Internal server error' : error.message, fields: error.fields || {} } });
}

function issueToken(response, claims) {
  const token = jwt.sign(claims, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
  response.cookie(authService.cookieName, token, authService.cookieOptions());
}

exports.register = async (request, response) => {
  try {
    const user = await authService.register(request.body);
    response.status(201).json({ user });
  } catch (error) { handleError(error, response); }
};

exports.login = async (request, response) => {
  try {
    const result = await authService.login(request.body);
    issueToken(response, result.claims);
    response.json({ user: result.user });
  } catch (error) { handleError(error, response); }
};

exports.me = async (request, response) => {
  try {
    const user = await authService.getCurrentUser(request.user.id || request.user.userId || request.user.sub);
    response.json({ user });
  } catch (error) { handleError(error, response); }
};