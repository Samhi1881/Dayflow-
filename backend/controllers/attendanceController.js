const attendanceService = require('../services/attendanceService');

function handleError(error, response) {
  const status = error.status || 500;
  response.status(status).json({ error: { code: error.code || 'DATABASE_ERROR', message: status === 500 ? 'Database error' : error.message, fields: error.fields || {} } });
}

exports.checkIn = async (request, response) => {
  try { response.status(201).json({ data: { attendance: await attendanceService.checkIn(request.user.id || request.user.userId || request.user.sub) } }); } catch (error) { handleError(error, response); }
};

exports.checkOut = async (request, response) => {
  try { response.json({ data: { attendance: await attendanceService.checkOut(request.user.id || request.user.userId || request.user.sub) } }); } catch (error) { handleError(error, response); }
};

exports.getMine = async (request, response) => {
  try { response.json({ data: { attendance: await attendanceService.listOwn(request.user.id || request.user.userId || request.user.sub, request.query) } }); } catch (error) { handleError(error, response); }
};

exports.getAdmin = async (request, response) => {
  try { response.json({ data: await attendanceService.listAdmin(request.query) }); } catch (error) { handleError(error, response); }
};