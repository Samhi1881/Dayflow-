const { Op } = require('sequelize');
const { LeaveRequest, User } = require('../models');

const leaveTypes = ['paid', 'sick', 'unpaid'];
const statuses = ['pending', 'approved', 'rejected'];

class LeaveError extends Error {
  constructor(status, code, message, fields = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

function parseId(value) {
  if (!/^\d+$/.test(String(value)) || Number(value) < 1) throw new LeaveError(400, 'INVALID_ID', 'Leave request ID must be a positive integer');
  return Number(value);
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return date.toISOString().slice(0, 10) === value;
}

function validateDateRange(startDate, endDate) {
  const fields = {};
  if (!validDate(startDate)) fields.startDate = 'Must be an ISO date (YYYY-MM-DD)';
  if (!validDate(endDate)) fields.endDate = 'Must be an ISO date (YYYY-MM-DD)';
  if (validDate(startDate) && validDate(endDate) && startDate > endDate) fields.endDate = 'Must be on or after startDate';
  if (Object.keys(fields).length) throw new LeaveError(400, 'INVALID_DATE', 'Invalid leave dates', fields);
}

function serialize(request) {
  return {
    id: request.id,
    userId: request.userId,
    startDate: request.startDate,
    endDate: request.endDate,
    type: request.leaveType,
    reason: request.remarks,
    status: request.status,
    adminComment: request.adminComment,
    reviewedBy: request.reviewedBy,
  };
}

async function ensureUser(userId) {
  const user = await User.findByPk(userId, { attributes: ['id', 'role'] });
  if (!user) throw new LeaveError(404, 'EMPLOYEE_NOT_FOUND', 'Employee not found');
  return user;
}

function validateCreate(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new LeaveError(400, 'INVALID_INPUT', 'Request body must be an object');
  const fields = {};
  if (!leaveTypes.includes(payload.type)) fields.type = 'Must be paid, sick, or unpaid';
  if (typeof payload.reason !== 'string' || !payload.reason.trim()) fields.reason = 'Required';
  if (payload.reason && payload.reason.length > 5000) fields.reason = 'Must be at most 5000 characters';
  try { validateDateRange(payload.startDate, payload.endDate); } catch (error) { Object.assign(fields, error.fields); }
  if (Object.keys(fields).length) throw new LeaveError(400, 'INVALID_INPUT', 'Invalid leave request', fields);
}

function parseStatus(value) {
  if (value !== undefined && !statuses.includes(value)) throw new LeaveError(400, 'INVALID_STATUS', 'Status must be pending, approved, or rejected', { status: 'Invalid status' });
  return value;
}

module.exports = {
  LeaveError,

  async create(userId, payload) {
    validateCreate(payload);
    await ensureUser(userId);
    const overlapping = await LeaveRequest.findOne({ where: { userId, status: { [Op.in]: ['pending', 'approved'] }, startDate: { [Op.lte]: payload.endDate }, endDate: { [Op.gte]: payload.startDate } } });
    if (overlapping) throw new LeaveError(409, 'OVERLAPPING_LEAVE', 'Leave dates overlap an existing request');
    const request = await LeaveRequest.create({ userId, leaveType: payload.type, startDate: payload.startDate, endDate: payload.endDate, remarks: payload.reason, status: 'pending' });
    return serialize(request);
  },

  async listOwn(userId, query) {
    await ensureUser(userId);
    const status = parseStatus(query.status);
    const where = { userId };
    if (status) where.status = status;
    const requests = await LeaveRequest.findAll({ where, order: [['startDate', 'DESC'], ['id', 'DESC']] });
    return requests.map(serialize);
  },

  async listAdmin(query) {
    const status = parseStatus(query.status);
    const where = {};
    if (status) where.status = status;
    if (query.userId !== undefined) {
      if (!/^\d+$/.test(query.userId) || Number(query.userId) < 1) throw new LeaveError(400, 'INVALID_EMPLOYEE_ID', 'userId must be a positive integer');
      await ensureUser(Number(query.userId));
      where.userId = Number(query.userId);
    }
    const requests = await LeaveRequest.findAll({ where, include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }], order: [['startDate', 'DESC'], ['id', 'DESC']] });
    return requests.map(serialize);
  },

  async decide(id, status, adminId, payload) {
    const requestId = parseId(id);
    if (!['approved', 'rejected'].includes(status)) throw new LeaveError(400, 'INVALID_TRANSITION', 'Leave request can only be approved or rejected');
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new LeaveError(400, 'INVALID_INPUT', 'Request body must be an object');
    const fields = Object.keys(payload).filter((key) => key !== 'comment');
    if (fields.length || (payload.comment !== undefined && (typeof payload.comment !== 'string' || payload.comment.length > 5000))) throw new LeaveError(400, 'INVALID_INPUT', 'Invalid admin comment', { comment: 'Must be a string of at most 5000 characters' });
    await ensureUser(adminId);
    const request = await LeaveRequest.findByPk(requestId);
    if (!request) throw new LeaveError(404, 'LEAVE_NOT_FOUND', 'Leave request not found');
    if (request.status !== 'pending') throw new LeaveError(409, 'INVALID_TRANSITION', `Cannot change a ${request.status} leave request`);
    request.status = status;
    request.adminComment = payload.comment === undefined ? null : payload.comment;
    request.reviewedBy = adminId;
    await request.save();
    return serialize(request);
  },
};