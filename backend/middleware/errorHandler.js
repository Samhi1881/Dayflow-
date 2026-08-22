module.exports = (error, request, response, next) => {
  void request;
  void next;
  const status = error.status === 400 || error.type === 'entity.parse.failed' ? 400 : 500;
  const code = status === 400 ? 'INVALID_JSON' : 'INTERNAL_ERROR';
  const message = status === 400 ? 'Malformed JSON request' : 'Internal server error';
  response.status(status).json({ error: { code, message, fields: {} } });
};