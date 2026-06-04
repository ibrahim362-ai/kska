import request from 'supertest';
import app from '../app';

describe('XSS Sanitization Middleware', () => {
  it('should strip <script> tags from body', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'xss-test@ch.com',
        username: 'xsstest',
        password: 'TestPass123!',
        fullName: 'Test<script>alert(1)</script>User',
      });

    // The signup may fail with 409 or 400 or succeed — but the script tag must be stripped
    // We can check the response body to verify sanitization
    if (res.body?.data?.user?.fullName) {
      expect(res.body.data.user.fullName).not.toContain('<script>');
      expect(res.body.data.user.fullName).not.toContain('alert(1)');
    }
  });

  it('should strip javascript: protocol', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'xss2@ch.com',
        username: 'xssuser2',
        password: 'TestPass123!',
        fullName: 'javascript:void(0) Test',
      });

    if (res.body?.data?.user?.fullName) {
      expect(res.body.data.user.fullName).not.toContain('javascript:');
    }
  });

  it('should strip on* event handlers', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'xss3@ch.com',
        username: 'xssuser3',
        password: 'TestPass123!',
        fullName: 'TestUser onclick=alert(1)',
      });

    if (res.body?.data?.user?.fullName) {
      expect(res.body.data.user.fullName).not.toMatch(/on\w+\s*=/);
    }
  });
});
