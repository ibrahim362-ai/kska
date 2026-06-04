import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import prisma from '../config/prisma';
import { generateAccessToken } from '../utils/tokens';

describe('Membership Module', () => {
  let testUser: any;
  let userToken: string;
  let freePlan: any;
  let goldPlan: any;

  beforeAll(async () => {
    const hashedPw = await bcrypt.hash('test123', 10);

    // Clean up
    await prisma.userMembership.deleteMany({});
    await prisma.membership.deleteMany({ where: { name: { in: ['TEST_FREE', 'TEST_GOLD'] } } });
    await prisma.user.deleteMany({ where: { email: 'membership-test@ch.com' } });

    freePlan = await prisma.membership.create({
      data: { name: 'TEST_FREE', planType: 'FREE', price: 0, duration: 30, extraVotes: 0, priorityTicket: false, leaderboardBoost: 1.0 },
    });
    goldPlan = await prisma.membership.create({
      data: { name: 'TEST_GOLD', planType: 'GOLD', price: 199, duration: 30, extraVotes: 3, priorityTicket: true, leaderboardBoost: 2.0 },
    });

    testUser = await prisma.user.create({
      data: { email: 'membership-test@ch.com', username: 'membertester', password: hashedPw, fullName: 'Member Tester', role: 'USER' },
    });
    userToken = generateAccessToken({ userId: testUser.id, role: 'USER' });
  });

  afterAll(async () => {
    await prisma.payment.deleteMany({ where: { userId: testUser.id } });
    await prisma.userMembership.deleteMany({ where: { userId: testUser.id } });
    await prisma.membership.deleteMany({ where: { name: { in: ['TEST_FREE', 'TEST_GOLD'] } } });
    await prisma.user.deleteMany({ where: { email: 'membership-test@ch.com' } });
    await prisma.$disconnect();
  });

  describe('GET /api/memberships', () => {
    it('should list all active plans (public)', async () => {
      const res = await request(app).get('/api/memberships');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('POST /api/memberships/purchase', () => {
    it('should allow user to claim a free plan', async () => {
      const res = await request(app)
        .post('/api/memberships/purchase')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ membershipId: freePlan.id, autoRenew: false });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('membershipId', freePlan.id);
    });

    it("should reject second active membership", async () => {
      // User already has free, try to claim gold
      const res = await request(app)
        .post('/api/memberships/purchase')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ membershipId: goldPlan.id, autoRenew: false });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('active');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/memberships/purchase')
        .send({ membershipId: freePlan.id, autoRenew: false });
      expect(res.status).toBe(401);
    });

    it('should reject invalid plan ID', async () => {
      // Use a different user for this test
      const otherUser = await prisma.user.create({
        data: {
          email: 'membership-other@ch.com',
          username: 'memberother',
          password: 'x',
          fullName: 'Other',
        },
      });
      const otherToken = generateAccessToken({ userId: otherUser.id, role: 'USER' });

      const res = await request(app)
        .post('/api/memberships/purchase')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ membershipId: 'non-existent', autoRenew: false });

      expect(res.status).toBe(404);

      await prisma.user.delete({ where: { id: otherUser.id } });
    });
  });

  describe('GET /api/memberships/my', () => {
    it("should return user's memberships", async () => {
      const res = await request(app)
        .get('/api/memberships/my')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
