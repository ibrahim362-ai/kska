import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import prisma from '../config/prisma';
import { generateAccessToken } from '../utils/tokens';

describe('Auth Module', () => {
  const TEST_EMAIL = 'test-auth@ch.com';
  const TEST_USERNAME = 'testauthuser';
  const TEST_PASSWORD = 'TestPass123!';

  beforeEach(async () => {
    await prisma.refreshToken.deleteMany({ where: { user: { email: TEST_EMAIL } } });
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({ where: { user: { email: TEST_EMAIL } } });
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
    await prisma.$disconnect();
  });

  // ====================================================================
  // POST /api/auth/signup
  // ====================================================================
  describe('POST /api/auth/signup', () => {
    it('should create a new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: TEST_EMAIL,
          username: TEST_USERNAME,
          password: TEST_PASSWORD,
          fullName: 'Test User',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('email', TEST_EMAIL);
      expect(res.body.data.user).toHaveProperty('username', TEST_USERNAME);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user).not.toHaveProperty('password'); // password must not leak
    });

    it('should reject signup with short password', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: TEST_EMAIL,
          username: TEST_USERNAME,
          password: 'short',
          fullName: 'Test User',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject signup with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'not-an-email',
          username: TEST_USERNAME,
          password: TEST_PASSWORD,
          fullName: 'Test User',
        });

      expect(res.status).toBe(400);
    });

    it('should reject duplicate email', async () => {
      await request(app).post('/api/auth/signup').send({
        email: TEST_EMAIL,
        username: TEST_USERNAME,
        password: TEST_PASSWORD,
        fullName: 'Test User',
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: TEST_EMAIL,
          username: 'differentuser',
          password: TEST_PASSWORD,
          fullName: 'Another',
        });

      expect(res.status).toBe(409);
    });

    it('should reject duplicate username', async () => {
      await request(app).post('/api/auth/signup').send({
        email: TEST_EMAIL,
        username: TEST_USERNAME,
        password: TEST_PASSWORD,
        fullName: 'Test User',
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'other@ch.com',
          username: TEST_USERNAME,
          password: TEST_PASSWORD,
          fullName: 'Another',
        });

      expect(res.status).toBe(409);
    });
  });

  // ====================================================================
  // POST /api/auth/signin
  // ====================================================================
  describe('POST /api/auth/signin', () => {
    beforeEach(async () => {
      const hashedPw = await bcrypt.hash(TEST_PASSWORD, 10);
      await prisma.user.create({
        data: {
          email: TEST_EMAIL,
          username: TEST_USERNAME,
          password: hashedPw,
          fullName: 'Test User',
          role: 'USER',
        },
      });
    });

    it('should sign in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({ email: TEST_EMAIL, password: 'wrongpass' });

      expect(res.status).toBe(401);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/signin')
        .send({ email: 'nobody@ch.com', password: TEST_PASSWORD });

      expect(res.status).toBe(401);
    });

    it('should reject banned user', async () => {
      await prisma.user.update({
        where: { email: TEST_EMAIL },
        data: { isBanned: true, banReason: 'Test ban' },
      });

      const res = await request(app)
        .post('/api/auth/signin')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('banned');
    });
  });

  // ====================================================================
  // GET /api/auth/me (Protected)
  // ====================================================================
  describe('GET /api/auth/me', () => {
    let token: string;
    let userId: string;

    beforeEach(async () => {
      const hashedPw = await bcrypt.hash(TEST_PASSWORD, 10);
      const user = await prisma.user.create({
        data: {
          email: TEST_EMAIL,
          username: TEST_USERNAME,
          password: hashedPw,
          fullName: 'Test User',
          role: 'USER',
        },
      });
      userId = user.id;
      token = generateAccessToken({ userId: user.id, role: 'USER' });
    });

    it('should return user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('email', TEST_EMAIL);
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
    });

    it('should return 401 with malformed Authorization header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'NotBearer xyz');
      expect(res.status).toBe(401);
    });
  });

  // ====================================================================
  // Rate Limiting
  // ====================================================================
  describe('Rate Limiting', () => {
    it('should enforce auth rate limit (10 attempts per 15 min)', async () => {
      // Make 12 rapid signin attempts (with bad credentials)
      const requests = Array.from({ length: 12 }, () =>
        request(app)
          .post('/api/auth/signin')
          .send({ email: 'nobody@ch.com', password: 'wrong' })
      );

      const responses = await Promise.all(requests);
      const tooMany = responses.filter((r) => r.status === 429);
      expect(tooMany.length).toBeGreaterThan(0);
    });
  });

  // ====================================================================
  // RBAC - Role-based authorization
  // ====================================================================
  describe('RBAC (Role-based access)', () => {
    it('admin-only endpoint should reject USER', async () => {
      const userToken = generateAccessToken({ userId: 'fake-id', role: 'USER' });
      const res = await request(app)
        .get('/api/manual-payments/proofs')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('admin-only endpoint should accept ADMIN', async () => {
      const adminToken = generateAccessToken({ userId: 'fake-id', role: 'ADMIN' });
      const res = await request(app)
        .get('/api/manual-payments/proofs')
        .set('Authorization', `Bearer ${adminToken}`);
      // May return 200 with empty data, or 500 if userId doesn't exist - depends on query
      // Either way, should NOT be 403
      expect(res.status).not.toBe(403);
    });
  });
});
