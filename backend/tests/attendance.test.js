process.env.JWT_SECRET = 'test-secret';

jest.mock('../models', () => ({
  Attendance: { create: jest.fn(), findOne: jest.fn(), findAll: jest.fn(), findAndCountAll: jest.fn() },
  User: { findByPk: jest.fn() },
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { UniqueConstraintError } = require('sequelize');
const app = require('../server');
const { Attendance, User } = require('../models');

const token = (claims = {}) => jwt.sign({ id: 7, role: 'employee', ...claims }, process.env.JWT_SECRET);
const employee = { id: 7, role: 'employee' };
const record = (overrides = {}) => ({ id: 3, userId: 7, date: '2026-08-22', checkIn: new Date('2026-08-22T09:00:00Z'), checkOut: null, status: 'present', save: jest.fn().mockResolvedValue(), ...overrides });

describe('attendance API', () => {
  beforeEach(() => jest.clearAllMocks());

  test('checks in using a created attendance record', async () => {
    User.findByPk.mockResolvedValue(employee);
    Attendance.create.mockResolvedValue(record());
    const response = await request(app).post('/api/v1/attendance/checkin').set('Authorization', `Bearer ${token()}`);
    expect(response.status).toBe(201);
    expect(Attendance.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 7, status: 'present', date: expect.any(String), checkIn: expect.any(Date) }));
  });

  test('maps the database unique constraint to duplicate check-in', async () => {
    User.findByPk.mockResolvedValue(employee);
    Attendance.create.mockRejectedValue(new UniqueConstraintError({}));
    const response = await request(app).post('/api/v1/attendance/checkin').set('Authorization', `Bearer ${token()}`);
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('DUPLICATE_CHECK_IN');
  });

  test('rejects checkout before check-in and duplicate checkout', async () => {
    User.findByPk.mockResolvedValue(employee);
    Attendance.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(record({ checkOut: new Date() }));
    expect((await request(app).post('/api/v1/attendance/checkout').set('Authorization', `Bearer ${token()}`)).status).toBe(404);
    const duplicate = await request(app).post('/api/v1/attendance/checkout').set('Authorization', `Bearer ${token()}`);
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('DUPLICATE_CHECK_OUT');
  });

  test('checks out an employee who has checked in', async () => {
    const attendance = record();
    User.findByPk.mockResolvedValue(employee);
    Attendance.findOne.mockResolvedValue(attendance);
    const response = await request(app).post('/api/v1/attendance/checkout').set('Authorization', `Bearer ${token()}`);
    expect(response.status).toBe(200);
    expect(attendance.save).toHaveBeenCalled();
    expect(attendance.checkOut).toEqual(expect.any(Date));
  });

  test('returns only own attendance and validates date filters', async () => {
    User.findByPk.mockResolvedValue(employee);
    Attendance.findAll.mockResolvedValue([record()]);
    const response = await request(app).get('/api/v1/attendance/me?from=2026-08-01&to=2026-08-22').set('Authorization', `Bearer ${token()}`);
    expect(response.status).toBe(200);
    expect(response.body.data.attendance).toHaveLength(1);
    expect(Attendance.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ userId: 7 }) }));
    expect((await request(app).get('/api/v1/attendance/me?from=bad').set('Authorization', `Bearer ${token()}`)).status).toBe(400);
  });

  test('admin lists paginated attendance with one joined user query', async () => {
    Attendance.findAndCountAll.mockResolvedValue({ rows: [record()], count: 21 });
    const response = await request(app).get('/api/v1/admin/attendance?from=2026-08-01&to=2026-08-22&page=2&limit=10').set('Authorization', `Bearer ${token({ id: 1, role: 'admin' })}`);
    expect(response.status).toBe(200);
    expect(response.body.data.pagination).toEqual({ page: 2, limit: 10, totalPages: 3, totalItems: 21 });
    expect(Attendance.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({ include: [expect.objectContaining({ as: 'user' })], limit: 10, offset: 10 }));
  });

  test('enforces authorization and reports nonexistent employees', async () => {
    expect((await request(app).get('/api/v1/admin/attendance').set('Authorization', `Bearer ${token()}`)).status).toBe(403);
    expect((await request(app).get('/api/v1/attendance/me')).status).toBe(401);
    User.findByPk.mockResolvedValue(null);
    const response = await request(app).post('/api/v1/attendance/checkin').set('Authorization', `Bearer ${token()}`);
    expect(response.status).toBe(404);
  });
});