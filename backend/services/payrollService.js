const { EmployeeProfile, User } = require('../models');

const MAX_SALARY = 10000000;

class PayrollError extends Error {
  constructor(status, code, message, fields = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

function parseId(value) {
  const id = Number(value);
  if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(id) || id < 1) throw new PayrollError(400, 'INVALID_EMPLOYEE_ID', 'Employee ID must be a positive integer');
  return id;
}

function parseSalary(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || Object.keys(payload).some((key) => key !== 'salary')) {
    throw new PayrollError(400, 'INVALID_INPUT', 'Request body must contain only salary');
  }
  const salary = payload.salary;
  const numericSalary = typeof salary === 'number' ? salary : Number(salary);
  if (salary === '' || salary === null || !Number.isFinite(numericSalary) || numericSalary <= 0 || numericSalary > MAX_SALARY) {
    throw new PayrollError(400, 'INVALID_SALARY', `Salary must be greater than zero and no more than ${MAX_SALARY}`, { salary: 'Invalid salary' });
  }
  return numericSalary;
}

function serialize(profile) {
  return { userId: profile.userId, salary: profile.salary };
}

async function findEmployee(userId) {
  const user = await User.findByPk(userId, { attributes: ['id', 'role'] });
  if (!user) throw new PayrollError(404, 'EMPLOYEE_NOT_FOUND', 'Employee not found');
  const profile = await EmployeeProfile.findOne({ where: { userId } });
  if (!profile) throw new PayrollError(404, 'PROFILE_NOT_FOUND', 'Employee profile not found');
  return profile;
}

module.exports = {
  async getOwn(userId) {
    return serialize(await findEmployee(parseId(userId)));
  },

  async list() {
    const profiles = await EmployeeProfile.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['userId', 'ASC']],
    });
    return profiles.map(serialize);
  },

  async update(userId, payload) {
    const profile = await findEmployee(parseId(userId));
    profile.salary = parseSalary(payload);
    await profile.save();
    return serialize(profile);
  },
};

module.exports.PayrollError = PayrollError;