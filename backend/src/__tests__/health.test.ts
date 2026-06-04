import request from 'supertest';
import app from '../app';

describe('Health Endpoint', () => {
  it('GET /api/health should return 200 and ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(typeof res.body.uptime).toBe('number');
  });

  it('GET /api/health timestamp should be a valid ISO date', async () => {
    const res = await request(app).get('/api/health');
    const ts = new Date(res.body.timestamp);
    expect(ts.toString()).not.toBe('Invalid Date');
  });

  it('GET /unknown-route should return 404', async () => {
    const res = await request(app).get('/api/this-route-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
  });
});

describe('CORS', () => {
  it('should include CORS headers', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});

describe('Security Headers (helmet)', () => {
  it('should set security headers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
  });
});
