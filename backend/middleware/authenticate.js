const jwt = require('jsonwebtoken');

module.exports = (request, response, next) => {
  const [scheme, token] = (request.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return response.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required', fields: {} } });
  }
  try {
    request.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'], maxAge: process.env.JWT_MAX_AGE || '1d' });
    return next();
  } catch (error) {
    return response.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid authentication token', fields: {} } });
  }
};