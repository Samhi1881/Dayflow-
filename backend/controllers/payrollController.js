const payrollService = require('../services/payrollService');

function handleError(error, response) {
  const status = error.status || 500;
  response.status(status).json({ error: { code: error.code || 'DATABASE_ERROR', message: status === 500 ? 'Database error' : error.message, fields: error.fields || {} } });
}

exports.getMine = async (request, response) => {
  try { response.json({ data: { payroll: await payrollService.getOwn(request.user.id || request.user.userId || request.user.sub) } }); } catch (error) { handleError(error, response); }
};

exports.getAdmin = async (_request, response) => {
  try { response.json({ data: { payroll: await payrollService.list() } }); } catch (error) { handleError(error, response); }
};

exports.update = async (request, response) => {
  try { response.json({ data: { payroll: await payrollService.update(request.params.userId, request.body) } }); } catch (error) { handleError(error, response); }
};