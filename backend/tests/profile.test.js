process.env.JWT_SECRET = 'test-secret';

jest.mock('../models', () => ({
  User: { findByPk: jest.fn() },
  EmployeeProfile: { findOne: jest.fn() },
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const { User, EmployeeProfile } = require('../models');

const makeUser = (overrides = {}) => ({ id: 7, name: 'Aisha Khan', email: 'aisha@example.com', role: 'employee', update: jest.fn().mockResolvedValue(), ...overrides });
const makeProfile = (overrides = {}) => ({ userId: 7, phone: '123', address: 'Address', department: 'Engineering', jobTitle: 'Engineer', photoUrl: 'photo', dateJoined: '2026-01-01', salary: '70000.00', update: jest.fn().mockResolvedValue(), ...overrides });
const token = (claims = {}) => jwt.sign({ id: 7, role: 'employee', ...claims }, process.env.JWT_SECRET);

describe('employee profile API', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns own profile without password hash', async () => {
    User.findByPk.mockResolvedValue(makeUser());
    EmployeeProfile.findOne.mockResolvedValue(makeProfile());
    const response = await request(app).get('/api/v1/profile/me').set('Authorization', `Bearer ${token()}`);
    expect(response.status).toBe(200);
    expect(response.body.data.profile).toEqual(expect.objectContaining({ userId: 7, firstName: 'Aisha', lastName: 'Khan', avatarUrl: 'photo' }));
    expect(response.body.data.profile).not.toHaveProperty('salary');
    expect(JSON.stringify(response.body)).not.toContain('password_hash');
  });

  test('rejects an employee update of salary', async () => {
    const response = await request(app).put('/api/v1/profile/me').set('Authorization', `Bearer ${token()}`).send({ salary: 10 });
    expect(response.status).toBe(400);
    expect(User.findByPk).not.toHaveBeenCalled();
  });

  test('rejects an employee from admin endpoints', async () => {
    const response = await request(app).get('/api/v1/admin/employees/7').set('Authorization', `Bearer ${token()}`);
    expect(response.status).toBe(403);
  });

  test('allows an admin to update job information and salary', async () => {
    const employee = makeUser();
    const employeeProfile = makeProfile();
    User.findByPk.mockResolvedValue(employee);
    EmployeeProfile.findOne.mockResolvedValue(employeeProfile);
    const response = await request(app).put('/api/v1/admin/employees/7').set('Authorization', `Bearer ${token({ id: 1, role: 'admin' })}`).send({ jobTitle: 'Lead Engineer', salary: 90000 });
    expect(response.status).toBe(200);
    expect(employeeProfile.update).toHaveBeenCalledWith({ jobTitle: 'Lead Engineer', salary: 90000 });
  });

  test('returns 400 for an invalid employee id and 401 without a token', async () => {
    expect((await request(app).get('/api/v1/admin/employees/nope').set('Authorization', `Bearer ${token({ role: 'admin' })}`)).status).toBe(400);
    expect((await request(app).get('/api/v1/profile/me')).status).toBe(401);
  });
});