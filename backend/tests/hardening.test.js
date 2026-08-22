process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');

describe('backend hardening', () => {
  test('rejects expired JWTs with a JSON 401', async () => {
    const token = jwt.sign({ id: 7, role: 'employee' }, process.env.JWT_SECRET, { expiresIn: -1 });
    const response = await request(app).get('/api/v1/profile/me').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  test('returns consistent JSON for malformed JSON and unknown routes', async () => {
    const malformed = await request(app).post('/api/v1/profile/me').set('Content-Type', 'application/json').send('{');
    expect(malformed.status).toBe(400);
    expect(malformed.body.error).toEqual(expect.objectContaining({ code: 'INVALID_JSON' }));

    const missing = await request(app).get('/not-a-route');
    expect(missing.status).toBe(404);
    expect(missing.body.error).toEqual(expect.objectContaining({ code: 'NOT_FOUND' }));
  });

  test('sets security headers', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });
});