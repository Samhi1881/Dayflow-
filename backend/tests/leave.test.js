process.env.JWT_SECRET = 'test-secret';

jest.mock('../models', () => ({
  LeaveRequest: { create: jest.fn(), findOne: jest.fn(), findAll: jest.fn(), findByPk: jest.fn() },
  User: { findByPk: jest.fn() },
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const leaveService = require('../services/leaveService');
const { LeaveRequest, User } = require('../models');

const token = (claims = {}) => jwt.sign({ id: 7, role: 'employee', ...claims }, process.env.JWT_SECRET);
const employee = { id: 7, role: 'employee' };
const admin = { id: 1, role: 'admin' };
const leave = (overrides = {}) => ({ id: 12, userId: 7, leaveType: 'paid', startDate: '2026-09-01', endDate: '2026-09-02', remarks: 'Family event', status: 'pending', adminComment: null, reviewedBy: null, save: jest.fn().mockResolvedValue(), ...overrides });

describe('leave management API', () => {
  beforeEach(() => jest.clearAllMocks());

  test('creates a pending leave request', async () => {
    User.findByPk.mockResolvedValue(employee);
    LeaveRequest.findOne.mockResolvedValue(null);
    LeaveRequest.create.mockResolvedValue(leave());
    const response = await request(app).post('/api/v1/leave').set('Authorization', `Bearer ${token()}`).send({ type: 'paid', startDate: '2026-09-01', endDate: '2026-09-02', reason: 'Family event' });
    expect(response.status).toBe(201);
    expect(LeaveRequest.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 7, leaveType: 'paid', status: 'pending' }));
  });

  test('validates leave type and date range', async () => {
    const response = await request(app).post('/api/v1/leave').set('Authorization', `Bearer ${token()}`).send({ type: 'holiday', startDate: '2026-09-03', endDate: '2026-09-01', reason: 'Invalid' });
    expect(response.status).toBe(400);
    expect(User.findByPk).not.toHaveBeenCalled();
  });

  test('employees can view only their requests and admins can filter requests', async () => {
    User.findByPk.mockResolvedValue(employee);
    LeaveRequest.findAll.mockResolvedValue([leave()]);
    const own = await request(app).get('/api/v1/leave/me?status=pending').set('Authorization', `Bearer ${token()}`);
    expect(own.status).toBe(200);
    expect(LeaveRequest.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 7, status: 'pending' } }));

    LeaveRequest.findAll.mockResolvedValue([leave()]);
    const all = await request(app).get('/api/v1/admin/leave?status=approved&userId=7').set('Authorization', `Bearer ${token({ id: 1, role: 'admin' })}`);
    expect(all.status).toBe(200);
    expect(LeaveRequest.findAll).toHaveBeenCalledWith(expect.objectContaining({ include: [expect.objectContaining({ as: 'user' })] }));
  });

  test('admin can approve a pending request with a comment and reviewer', async () => {
    User.findByPk.mockResolvedValue(admin);
    const pending = leave();
    LeaveRequest.findByPk.mockResolvedValue(pending);
    const response = await request(app).patch('/api/v1/admin/leave/12/approve').set('Authorization', `Bearer ${token({ id: 1, role: 'admin' })}`).send({ comment: 'Approved' });
    expect(response.status).toBe(200);
    expect(pending.status).toBe('approved');
    expect(pending.adminComment).toBe('Approved');
    expect(pending.reviewedBy).toBe(1);
    expect(pending.save).toHaveBeenCalled();
  });

  test('admin can reject a pending request', async () => {
    User.findByPk.mockResolvedValue(admin);
    const pending = leave();
    LeaveRequest.findByPk.mockResolvedValue(pending);
    const response = await request(app).patch('/api/v1/admin/leave/12/reject').set('Authorization', `Bearer ${token({ id: 1, role: 'admin' })}`).send({});
    expect(response.status).toBe(200);
    expect(pending.status).toBe('rejected');
  });

  test('rejects every invalid status transition', async () => {
    User.findByPk.mockResolvedValue(admin);
    const approved = leave({ status: 'approved' });
    const rejected = leave({ status: 'rejected' });
    LeaveRequest.findByPk.mockResolvedValueOnce(approved).mockResolvedValueOnce(rejected);
    expect((await request(app).patch('/api/v1/admin/leave/12/reject').set('Authorization', `Bearer ${token({ id: 1, role: 'admin' })}`).send({})).status).toBe(409);
    expect((await request(app).patch('/api/v1/admin/leave/12/approve').set('Authorization', `Bearer ${token({ id: 1, role: 'admin' })}`).send({})).status).toBe(409);
    await expect(leaveService.decide(12, 'pending', 1, {})).rejects.toMatchObject({ status: 400, code: 'INVALID_TRANSITION' });
  });

  test('prevents employees from deciding leave and handles invalid or missing IDs', async () => {
    expect((await request(app).patch('/api/v1/admin/leave/12/approve').set('Authorization', `Bearer ${token()}`).send({})).status).toBe(403);
    expect((await request(app).patch('/api/v1/admin/leave/nope/reject').set('Authorization', `Bearer ${token({ id: 1, role: 'admin' })}`).send({})).status).toBe(400);
    User.findByPk.mockResolvedValue(admin);
    LeaveRequest.findByPk.mockResolvedValue(null);
    expect((await request(app).patch('/api/v1/admin/leave/99/approve').set('Authorization', `Bearer ${token({ id: 1, role: 'admin' })}`).send({})).status).toBe(404);
  });
});