process.env.JWT_SECRET = 'test-secret';

jest.mock('../models', () => ({
  EmployeeProfile: { findOne: jest.fn(), findAll: jest.fn() },
  User: { findByPk: jest.fn() },
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const { EmployeeProfile, User } = require('../models');

const token = (claims = {}) => jwt.sign({ id: 7, role: 'employee', ...claims }, process.env.JWT_SECRET);
const profile = (overrides = {}) => ({ userId: 7, salary: '72000.00', save: jest.fn().mockResolvedValue(), ...overrides });

describe('payroll salary API', () => {
  beforeEach(() => jest.clearAllMocks());

  test('employee can view only their own salary without password data', async () => {
    User.findByPk.mockResolvedValue({ id: 7, role: 'employee', passwordHash: 'secret' });
    EmployeeProfile.findOne.mockResolvedValue(profile());
    const response = await request(app).get('/api/v1/payroll/me').set('Authorization', `Bearer ${token()}`);
    expect(response.status).toBe(200);
    expect(response.body.data.payroll).toEqual({ userId: 7, salary: '72000.00' });
    expect(JSON.stringify(response.body)).not.toContain('password');
  });

  test('admin can view employee salaries with one joined query', async () => {
    EmployeeProfile.findAll.mockResolvedValue([profile(), profile({ userId: 8, salary: '65000.00' })]);
    const response = await request(app).get('/api/v1/admin/payroll').set('Authorization', `Bearer ${token({ id: 1, role: 'admin' })}`);
    expect(response.status).toBe(200);
    expect(response.body.data.payroll).toHaveLength(2);
    expect(EmployeeProfile.findAll).toHaveBeenCalledWith(expect.objectContaining({ include: [expect.objectContaining({ as: 'user' })] }));
  });

  test('admin can update a valid employee salary', async () => {
    User.findByPk.mockResolvedValue({ id: 7, role: 'employee' });
    const employeeProfile = profile();
    EmployeeProfile.findOne.mockResolvedValue(employeeProfile);
    const response = await request(app).put('/api/v1/admin/payroll/7').set('Authorization', `Bearer ${token({ id: 1, role: 'admin' })}`).send({ salary: 90000 });
    expect(response.status).toBe(200);
    expect(employeeProfile.salary).toBe(90000);
    expect(employeeProfile.save).toHaveBeenCalled();
  });

  test('rejects zero, negative, nonnumeric, and excessive salaries', async () => {
    User.findByPk.mockResolvedValue({ id: 7, role: 'employee' });
    EmployeeProfile.findOne.mockResolvedValue(profile());
    for (const salary of [0, -1, 'not-a-number', 10000001]) {
      const response = await request(app).put('/api/v1/admin/payroll/7').set('Authorization', `Bearer ${token({ id: 1, role: 'admin' })}`).send({ salary });
      expect(response.status).toBe(400);
    }
  });

  test('rejects employees, invalid IDs, missing employees, and missing authentication', async () => {
    expect((await request(app).get('/api/v1/admin/payroll').set('Authorization', `Bearer ${token()}`)).status).toBe(403);
    expect((await request(app).put('/api/v1/admin/payroll/nope').set('Authorization', `Bearer ${token({ id: 1, role: 'admin' })}`).send({ salary: 1 })).status).toBe(400);
    User.findByPk.mockResolvedValue(null);
    expect((await request(app).put('/api/v1/admin/payroll/9').set('Authorization', `Bearer ${token({ id: 1, role: 'admin' })}`).send({ salary: 1 })).status).toBe(404);
    expect((await request(app).get('/api/v1/payroll/me')).status).toBe(401);
  });
});