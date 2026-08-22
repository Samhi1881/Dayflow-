const bcrypt = require('bcryptjs');
const { UniqueConstraintError } = require('sequelize');
const { sequelize, User, EmployeeProfile } = require('../models');

const passwordMinimumLength = 8;

class AuthError extends Error {
  constructor(status, code, message, fields = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function validateCredentials(payload, requireName) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new AuthError(400, 'INVALID_INPUT', 'Request body must be an object');
  const fields = {};
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const password = typeof payload.password === 'string' ? payload.password : '';
  if (requireName && (name.length < 2 || name.length > 150)) fields.name = 'Must be between 2 and 150 characters';
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 255) fields.email = 'Must be a valid email';
  if (password.length < passwordMinimumLength || password.length > 128) fields.password = `Must be between ${passwordMinimumLength} and 128 characters`;
  if (Object.keys(fields).length) throw new AuthError(400, 'INVALID_INPUT', 'Invalid authentication input', fields);
  return { name, email, password };
}

function cookieOptions() {
  const production = process.env.NODE_ENV === 'production';
  return { httpOnly: true, secure: production, sameSite: production ? 'none' : 'lax', maxAge: 24 * 60 * 60 * 1000, path: '/' };
}

module.exports = {
  AuthError,
  cookieName: process.env.AUTH_COOKIE_NAME || 'dayflow_token',
  cookieOptions,

  async register(payload) {
    const { name, email, password } = validateCredentials(payload, true);
    try {
      return await sequelize.transaction(async (transaction) => {
        const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), role: 'employee' }, { transaction });
        await EmployeeProfile.create({ userId: user.id }, { transaction });
        return publicUser(user);
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) throw new AuthError(409, 'EMAIL_EXISTS', 'Email is already registered');
      throw error;
    }
  },

  async login(payload) {
    const { email, password } = validateCredentials(payload, false);
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new AuthError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    return { user: publicUser(user), claims: { id: user.id, role: user.role } };
  },

  async getCurrentUser(userId) {
    const user = await User.findByPk(userId, { attributes: ['id', 'name', 'email', 'role'] });
    if (!user) throw new AuthError(404, 'USER_NOT_FOUND', 'User not found');
    return publicUser(user);
  },
};