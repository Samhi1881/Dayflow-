const jwt = require('jsonwebtoken');

function cookieToken(request) {
  const cookieHeader = request.headers.cookie || '';
  const cookieName = process.env.AUTH_COOKIE_NAME || 'dayflow_token';
  const cookie = cookieHeader.split(';').map((value) => value.trim()).find((value) => value.startsWith(`${cookieName}=`));
  return cookie ? decodeURIComponent(cookie.slice(cookieName.length + 1)) : null;
}

module.exports = (request, response, next) => {
  const [scheme, bearerToken] = (request.headers.authorization || '').split(' ');
  const token = scheme === 'Bearer' && bearerToken ? bearerToken : cookieToken(request);
  if (!token) {
    return response.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required', fields: {} } });
  }
  try {
    request.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'], maxAge: process.env.JWT_MAX_AGE || '1d' });
    return next();
  } catch (error) {
    return response.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid authentication token', fields: {} } });
  }
};