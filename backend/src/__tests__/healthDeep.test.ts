import request from 'supertest';
import app from '../app';

describe('Deep Health Check', () => {
  it('GET /api/health/deep should return status with checks', async () => {
    const res = await request(app).get('/api/health/deep');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('checks');
    expect(res.body.checks).toHaveProperty('database');
    expect(res.body.checks).toHaveProperty('redis');
    expect(res.body.checks).toHaveProperty('disk');
    expect(res.body.checks.database).toHaveProperty('status');
    expect(res.body.checks.database).toHaveProperty('duration');
  });

  it('GET /api/health should return basic status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
