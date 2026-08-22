module.exports = (...roles) => (request, response, next) => {
  if (!request.user || !roles.includes(request.user.role)) {
    return response.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions', fields: {} } });
  }
  return next();
};