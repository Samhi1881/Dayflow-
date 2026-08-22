process.env.JWT_SECRET = 'test-secret';

jest.mock('../models', () => ({
  User: { create: jest.fn(), findOne: jest.fn(), findByPk: jest.fn() },
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const { UniqueConstraintError } = require('sequelize');
const app = require('../server');
const { User } = require('../models');

const storedUser = (overrides = {}) => ({ id: 7, name: 'Aisha Khan', email: 'aisha@example.com', role: 'employee', passwordHash: bcrypt.hashSync('correct-password', 4), ...overrides });
const bearer = (claims = {}) => jwt.sign({ id: 7, role: 'employee', ...claims }, process.env.JWT_SECRET);

describe('authentication API', () => {
  beforeEach(() => jest.clearAllMocks());

  test('registers an employee with a normalized email and hashed password', async () => {
    User.create.mockImplementation(async (attributes) => ({ id: 7, ...attributes }));
    const response = await request(app).post('/api/v1/auth/register').send({ name: '  Aisha Khan ', email: ' AISHA@EXAMPLE.COM ', password: 'correct-password' });
    expect(response.status).toBe(201);
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Aisha Khan', email: 'aisha@example.com', role: 'employee', passwordHash: expect.any(String) }));
    expect(response.body.user).toEqual(expect.objectContaining({ id: 7, role: 'employee' }));
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  test('rejects invalid registration input and duplicate emails', async () => {
    const invalid = await request(app).post('/api/v1/auth/register').send({ name: 'A', email: 'bad', password: 'short' });
    expect(invalid.status).toBe(400);
    User.create.mockRejectedValue(new UniqueConstraintError({}));
    const duplicate = await request(app).post('/api/v1/auth/register').send({ name: 'Aisha Khan', email: 'aisha@example.com', password: 'correct-password' });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('EMAIL_EXISTS');
  });

  test('logs in with a generic error for unknown email or wrong password', async () => {
    User.findOne.mockResolvedValue(null);
    const unknown = await request(app).post('/api/v1/auth/login').send({ email: 'unknown@example.com', password: 'correct-password' });
    expect(unknown.status).toBe(401);
    User.findOne.mockResolvedValue(storedUser());
    const wrong = await request(app).post('/api/v1/auth/login').send({ email: 'aisha@example.com', password: 'wrong-password' });
    expect(wrong.status).toBe(401);
    expect(wrong.body.error.message).toBe('Invalid email or password');
  });

  test('sets an HTTP-only cookie and returns a public user on login', async () => {
    User.findOne.mockResolvedValue(storedUser());
    const response = await request(app).post('/api/v1/auth/login').send({ email: ' Aisha@Example.com ', password: 'correct-password' });
    expect(response.status).toBe(200);
    expect(response.headers['set-cookie'][0]).toMatch(/dayflow_token=.*HttpOnly/);
    expect(response.body.user).toEqual({ id: 7, name: 'Aisha Khan', email: 'aisha@example.com', role: 'employee' });
    expect(JSON.stringify(response.body)).not.toContain('passwordHash');
  });

  test('/me supports cookie and Bearer authentication and returns current DB data', async () => {
    User.findOne.mockResolvedValue(storedUser());
    const login = await request(app).post('/api/v1/auth/login').send({ email: 'aisha@example.com', password: 'correct-password' });
    User.findByPk.mockResolvedValue(storedUser({ name: 'Updated Aisha' }));
    const cookieResponse = await request(app).get('/api/v1/auth/me').set('Cookie', login.headers['set-cookie']);
    expect(cookieResponse.status).toBe(200);
    expect(cookieResponse.body.user.name).toBe('Updated Aisha');
    const bearerResponse = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${bearer()}`);
    expect(bearerResponse.status).toBe(200);
    expect(bearerResponse.body.user).not.toHaveProperty('passwordHash');
  });

  test('returns 401 for unauthenticated /me', async () => {
    const response = await request(app).get('/api/v1/auth/me');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
});