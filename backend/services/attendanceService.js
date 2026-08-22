const { Op, UniqueConstraintError } = require('sequelize');
const { Attendance, User } = require('../models');

class AttendanceError extends Error {
  constructor(status, code, message, fields = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

function today() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return date.toISOString().slice(0, 10) === value;
}

function parseDateFilters(query) {
  const { from, to } = query;
  const fields = {};
  if (from !== undefined && !validDate(from)) fields.from = 'Must be an ISO date (YYYY-MM-DD)';
  if (to !== undefined && !validDate(to)) fields.to = 'Must be an ISO date (YYYY-MM-DD)';
  if (from && to && from > to) fields.to = 'Must be on or after from';
  if (Object.keys(fields).length) throw new AttendanceError(400, 'INVALID_DATE', 'Invalid date filter', fields);
  return { from, to };
}

function parsePagination(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 20 : Number(query.limit);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new AttendanceError(400, 'INVALID_PAGINATION', 'Page must be positive and limit must be between 1 and 100');
  }
  return { page, limit, offset: (page - 1) * limit };
}

function serialize(record) {
  return {
    id: record.id,
    userId: record.userId,
    date: record.date,
    checkInAt: record.checkIn,
    checkOutAt: record.checkOut,
    status: record.status,
  };
}

function whereForDates(filters) {
  if (!filters.from && !filters.to) return {};
  return { date: { ...(filters.from ? { [Op.gte]: filters.from } : {}), ...(filters.to ? { [Op.lte]: filters.to } : {}) } };
}

async function ensureEmployee(userId) {
  const user = await User.findByPk(userId, { attributes: ['id', 'role'] });
  if (!user) throw new AttendanceError(404, 'EMPLOYEE_NOT_FOUND', 'Employee not found');
  return user;
}

module.exports = {
  AttendanceError,

  async checkIn(userId) {
    await ensureEmployee(userId);
    const timestamp = new Date();
    try {
      const record = await Attendance.create({ userId, date: today(), checkIn: timestamp, status: 'present' });
      return serialize(record);
    } catch (error) {
      if (error instanceof UniqueConstraintError) throw new AttendanceError(409, 'DUPLICATE_CHECK_IN', 'Employee has already checked in today');
      throw error;
    }
  },

  async checkOut(userId) {
    await ensureEmployee(userId);
    const record = await Attendance.findOne({ where: { userId, date: today() } });
    if (!record) throw new AttendanceError(409, 'CHECK_IN_REQUIRED', 'Employee must check in before checking out');
    if (record.checkOut) throw new AttendanceError(409, 'DUPLICATE_CHECK_OUT', 'Employee has already checked out today');
    record.checkOut = new Date();
    await record.save();
    return serialize(record);
  },

  async listOwn(userId, query) {
    await ensureEmployee(userId);
    const filters = parseDateFilters(query);
    const records = await Attendance.findAll({ where: { userId, ...whereForDates(filters) }, order: [['date', 'DESC'], ['id', 'DESC']] });
    return records.map(serialize);
  },

  async listAdmin(query) {
    const filters = parseDateFilters(query);
    const pagination = parsePagination(query);
    const where = whereForDates(filters);
    if (query.userId !== undefined) {
      if (!/^\d+$/.test(query.userId) || Number(query.userId) < 1) throw new AttendanceError(400, 'INVALID_EMPLOYEE_ID', 'userId must be a positive integer');
      await ensureEmployee(Number(query.userId));
      where.userId = Number(query.userId);
    }
    const result = await Attendance.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['date', 'DESC'], ['id', 'DESC']],
      limit: pagination.limit,
      offset: pagination.offset,
      distinct: true,
    });
    return { attendance: result.rows.map(serialize), pagination: { page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(result.count / pagination.limit), totalItems: result.count } };
  },
};