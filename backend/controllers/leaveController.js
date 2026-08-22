const leaveService = require('../services/leaveService');

function handleError(error, response) {
  const status = error.status || 500;
  response.status(status).json({ error: { code: error.code || 'DATABASE_ERROR', message: status === 500 ? 'Database error' : error.message, fields: error.fields || {} } });
}

exports.create = async (request, response) => {
  try { response.status(201).json({ data: { leave: await leaveService.create(request.user.id || request.user.userId || request.user.sub, request.body) } }); } catch (error) { handleError(error, response); }
};

exports.getMine = async (request, response) => {
  try { response.json({ data: { leave: await leaveService.listOwn(request.user.id || request.user.userId || request.user.sub, request.query) } }); } catch (error) { handleError(error, response); }
};

exports.getAdmin = async (request, response) => {
  try { response.json({ data: { leave: await leaveService.listAdmin(request.query) } }); } catch (error) { handleError(error, response); }
};

exports.approve = async (request, response) => {
  try { response.json({ data: { leave: await leaveService.decide(request.params.id, 'approved', request.user.id || request.user.userId || request.user.sub, request.body) } }); } catch (error) { handleError(error, response); }
};

exports.reject = async (request, response) => {
  try { response.json({ data: { leave: await leaveService.decide(request.params.id, 'rejected', request.user.id || request.user.userId || request.user.sub, request.body) } }); } catch (error) { handleError(error, response); }
};