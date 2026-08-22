const { EmployeeProfile, User } = require('../models');

const profileFields = { phone: 'phone', address: 'address', avatarUrl: 'photoUrl', photoUrl: 'photoUrl' };
const jobFields = ['department', 'jobTitle', 'dateJoined'];
const stringLimits = { phone: 30, address: 255, photoUrl: 500, department: 100, jobTitle: 100 };

class ProfileError extends Error {
  constructor(status, code, message, fields = {}) {
    super(message); this.status = status; this.code = code; this.fields = fields;
  }
}

function parseId(value) {
  const id = Number(value);
  if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(id) || id < 1) throw new ProfileError(400, 'INVALID_ID', 'Employee ID must be a positive integer');
  return id;
}

function splitName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return date.toISOString().slice(0, 10) === value;
}

function serialize(user, profile, includeSalary = false) {
  const name = splitName(user.name);
  const result = { userId: user.id, firstName: name.firstName, lastName: name.lastName, email: user.email, role: user.role, phone: profile.phone, address: profile.address, department: profile.department, jobTitle: profile.jobTitle, avatarUrl: profile.photoUrl, dateJoined: profile.dateJoined };
  if (includeSalary) result.salary = profile.salary;
  return result;
}

async function findProfile(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw new ProfileError(404, 'EMPLOYEE_NOT_FOUND', 'Employee not found');
  const profile = await EmployeeProfile.findOne({ where: { userId } });
  if (!profile) throw new ProfileError(404, 'PROFILE_NOT_FOUND', 'Employee profile not found');
  return { user, profile };
}

function validate(payload, role) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new ProfileError(400, 'INVALID_INPUT', 'Request body must be an object');
  const allowed = new Set(['firstName', 'lastName', 'phone', 'address', 'photoUrl', 'avatarUrl', ...(role === 'admin' ? [...jobFields, 'email', 'role', 'salary'] : [])]);
  const fields = {};
  Object.keys(payload).forEach((key) => { if (!allowed.has(key)) fields[key] = 'Field is not allowed'; });
  Object.keys(payload).forEach((key) => {
    const value = payload[key];
    if (value !== null && typeof value !== 'string' && !['salary'].includes(key)) fields[key] = 'Must be a string or null';
    const field = profileFields[key] || key;
    if (typeof value === 'string' && stringLimits[field] && value.length > stringLimits[field]) fields[key] = `Must be at most ${stringLimits[field]} characters`;
  });
  if (payload.email !== undefined && (typeof payload.email !== 'string' || !/^\S+@\S+\.\S+$/.test(payload.email))) fields.email = 'Must be a valid email';
  if (payload.role !== undefined && !['admin', 'employee'].includes(payload.role)) fields.role = 'Must be admin or employee';
  if (payload.salary !== undefined && (Number.isNaN(Number(payload.salary)) || Number(payload.salary) < 0)) fields.salary = 'Must be a non-negative number';
  if (payload.dateJoined !== undefined && payload.dateJoined !== null && !validDate(payload.dateJoined)) fields.dateJoined = 'Must be an ISO date';
  if (Object.keys(fields).length) throw new ProfileError(400, 'INVALID_INPUT', 'Request contains invalid fields', fields);
}

async function update(userId, payload, role) {
  validate(payload, role);
  const { user, profile } = await findProfile(userId);
  const userUpdates = {};
  if (payload.firstName !== undefined || payload.lastName !== undefined) {
    const current = splitName(user.name);
    const firstName = payload.firstName === undefined ? current.firstName : payload.firstName;
    const lastName = payload.lastName === undefined ? current.lastName : payload.lastName;
    if (!firstName || !lastName) throw new ProfileError(400, 'INVALID_INPUT', 'First and last name are required', { name: 'Both firstName and lastName are required' });
    userUpdates.name = `${firstName} ${lastName}`.trim();
  }
  ['email', 'role'].forEach((key) => { if (payload[key] !== undefined) userUpdates[key] = payload[key]; });
  if (Object.keys(userUpdates).length) await user.update(userUpdates);
  const profileUpdates = {};
  Object.entries(profileFields).forEach(([key, column]) => { if (payload[key] !== undefined) profileUpdates[column] = payload[key]; });
  jobFields.forEach((key) => { if (payload[key] !== undefined) profileUpdates[key] = payload[key]; });
  if (payload.salary !== undefined) profileUpdates.salary = payload.salary;
  if (Object.keys(profileUpdates).length) await profile.update(profileUpdates);
  return serialize(user, profile);
}

module.exports = {
  async getOwnProfile(userId, role) { const result = await findProfile(parseId(userId)); return serialize(result.user, result.profile, role === 'admin'); },
  async updateOwnProfile(userId, payload, role) { return update(parseId(userId), payload, role); },
  async getEmployee(id) { const result = await findProfile(parseId(id)); return serialize(result.user, result.profile, true); },
  async updateEmployee(id, payload) { return update(parseId(id), payload, 'admin'); },
};