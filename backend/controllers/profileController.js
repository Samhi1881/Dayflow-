const profileService = require('../services/profileService');

function handleError(error, response) {
  const status = error.status || 500;
  response.status(status).json({ error: { code: error.code || 'DATABASE_ERROR', message: status === 500 ? 'Database error' : error.message, fields: error.fields || {} } });
}

exports.getMe = async (request, response) => {
  try { response.json({ data: { profile: await profileService.getOwnProfile(request.user.id || request.user.userId || request.user.sub, request.user.role) } }); } catch (error) { handleError(error, response); }
};

exports.updateMe = async (request, response) => {
  try { response.json({ data: { profile: await profileService.updateOwnProfile(request.user.id || request.user.userId || request.user.sub, request.body, request.user.role) } }); } catch (error) { handleError(error, response); }
};

exports.getEmployee = async (request, response) => {
  try { response.json({ data: { profile: await profileService.getEmployee(request.params.id, true) } }); } catch (error) { handleError(error, response); }
};

exports.updateEmployee = async (request, response) => {
  try { response.json({ data: { profile: await profileService.updateEmployee(request.params.id, request.body) } }); } catch (error) { handleError(error, response); }
};