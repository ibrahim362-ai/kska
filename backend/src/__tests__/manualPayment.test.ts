import request from 'supertest';
import app from '../app';
import prisma from '../config/prisma';
import { generateAccessToken } from '../utils/tokens';
import bcrypt from 'bcryptjs';

describe('Manual Payment Flow', () => {
  let testUser: any;
  let testAdmin: any;
  let userToken: string;
  let adminToken: string;
  let testPayment: any;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.manualPaymentProof.deleteMany({});
    await prisma.payment.deleteMany({ where: { reference: { startsWith: 'TEST-' } } });
    await prisma.user.deleteMany({ where: { email: { in: ['test-user@ch.com', 'test-admin@ch.com'] } } });

    const hashedPw = await bcrypt.hash('test123', 10);

    testUser = await prisma.user.create({
      data: {
        email: 'test-user@ch.com',
        username: 'testuser',
        password: hashedPw,
        fullName: 'Test User',
        role: 'USER',
      },
    });

    testAdmin = await prisma.user.create({
      data: {
        email: 'test-admin@ch.com',
        username: 'testadmin',
        password: hashedPw,
        fullName: 'Test Admin',
        role: 'ADMIN',
      },
    });

    userToken = generateAccessToken({ userId: testUser.id, role: 'USER' });
    adminToken = generateAccessToken({ userId: testAdmin.id, role: 'ADMIN' });

    testPayment = await prisma.payment.create({
      data: {
        userId: testUser.id,
        amount: 100,
        currency: 'ETB',
        method: 'MANUAL',
        reference: `TEST-${Date.now()}`,
        metadata: JSON.stringify({ type: 'MEMBERSHIP', targetName: 'Test Plan' }),
      },
    });
  });

  afterAll(async () => {
    await prisma.manualPaymentProof.deleteMany({});
    await prisma.payment.deleteMany({ where: { reference: { startsWith: 'TEST-' } } });
    await prisma.user.deleteMany({ where: { email: { in: ['test-user@ch.com', 'test-admin@ch.com'] } } });
    await prisma.$disconnect();
  });

  describe('GET /api/manual-payments/instructions', () => {
    it('should return payment instructions publicly (no auth)', async () => {
      const res = await request(app).get('/api/manual-payments/instructions');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('instructions');
      expect(res.body.data).toHaveProperty('accounts');
      expect(res.body.data.accounts).toHaveProperty('bank');
      expect(res.body.data.accounts).toHaveProperty('telebirr');
      expect(res.body.data.currency).toBe('ETB');
    });
  });

  describe('POST /api/manual-payments/:paymentId/proof', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post(`/api/manual-payments/${testPayment.id}/proof`)
        .send({});
      expect(res.status).toBe(401);
    });

    it('should require a receipt file', async () => {
      const res = await request(app)
        .post(`/api/manual-payments/${testPayment.id}/proof`)
        .set('Authorization', `Bearer ${userToken}`)
        .field('senderName', 'Test Sender')
        .field('paidAt', new Date().toISOString());
      expect(res.status).toBe(400);
    });

    it("should reject submission for another user's payment", async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: 'other-user@ch.com',
          username: 'otheruser',
          password: 'test',
          fullName: 'Other',
          role: 'USER',
        },
      });
      const otherPayment = await prisma.payment.create({
        data: {
          userId: otherUser.id,
          amount: 50,
          reference: `TEST-OTHER-${Date.now()}`,
        },
      });

      const res = await request(app)
        .post(`/api/manual-payments/${otherPayment.id}/proof`)
        .set('Authorization', `Bearer ${userToken}`)
        .attach('receipt', Buffer.from('fake-image-data'), 'receipt.png')
        .field('senderName', 'Test')
        .field('paidAt', new Date().toISOString());

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/manual-payments/proofs/my', () => {
    it('should return user own proofs', async () => {
      const res = await request(app)
        .get('/api/manual-payments/proofs/my')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/manual-payments/proofs (admin)', () => {
    it('should require admin role', async () => {
      const res = await request(app)
        .get('/api/manual-payments/proofs')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('should return proofs for admin', async () => {
      const res = await request(app)
        .get('/api/manual-payments/proofs?status=PENDING')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });
});
