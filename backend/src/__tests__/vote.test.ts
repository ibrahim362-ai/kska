import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import prisma from '../config/prisma';
import { generateAccessToken } from '../utils/tokens';

describe('Vote Module', () => {
  let creator: any;
  let voter: any;
  let creatorToken: string;
  let voterToken: string;
  let testVote: any;
  let testOption1: any;
  let testOption2: any;

  beforeAll(async () => {
    const hashedPw = await bcrypt.hash('test123', 10);

    await prisma.voteRecord.deleteMany({});
    await prisma.voteOption.deleteMany({ where: { vote: { creator: { email: { in: ['vote-creator@ch.com', 'vote-voter@ch.com'] } } } } });
    await prisma.vote.deleteMany({ where: { creator: { email: { in: ['vote-creator@ch.com', 'vote-voter@ch.com'] } } } });
    await prisma.user.deleteMany({ where: { email: { in: ['vote-creator@ch.com', 'vote-voter@ch.com'] } } });

    creator = await prisma.user.create({
      data: { email: 'vote-creator@ch.com', username: 'votecreator', password: hashedPw, fullName: 'Vote Creator', role: 'EMPLOYER' },
    });
    voter = await prisma.user.create({
      data: { email: 'vote-voter@ch.com', username: 'votevoter', password: hashedPw, fullName: 'Vote Voter', role: 'USER' },
    });
    creatorToken = generateAccessToken({ userId: creator.id, role: 'EMPLOYER' });
    voterToken = generateAccessToken({ userId: voter.id, role: 'USER' });

    testVote = await prisma.vote.create({
      data: {
        creatorId: creator.id,
        title: 'Test Vote',
        voteType: 'FREE_VOTE',
        startsAt: new Date(Date.now() - 60_000),
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        isLive: true,
        options: {
          create: [
            { text: 'Option A', sortOrder: 0 },
            { text: 'Option B', sortOrder: 1 },
          ],
        },
      },
      include: { options: true },
    });
    testOption1 = testVote.options[0];
    testOption2 = testVote.options[1];
  });

  afterAll(async () => {
    await prisma.voteRecord.deleteMany({});
    await prisma.voteOption.deleteMany({ where: { vote: { creator: { email: { in: ['vote-creator@ch.com', 'vote-voter@ch.com'] } } } } });
    await prisma.vote.deleteMany({ where: { creator: { email: { in: ['vote-creator@ch.com', 'vote-voter@ch.com'] } } } });
    await prisma.user.deleteMany({ where: { email: { in: ['vote-creator@ch.com', 'vote-voter@ch.com'] } } });
    await prisma.$disconnect();
  });

  describe('GET /api/votes', () => {
    it('should list live votes', async () => {
      const res = await request(app).get('/api/votes?page=1&limit=20');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/votes/:id', () => {
    it('should return vote with options', async () => {
      const res = await request(app).get(`/api/votes/${testVote.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('title', 'Test Vote');
      expect(res.body.data.options).toBeInstanceOf(Array);
      expect(res.body.data.options.length).toBe(2);
    });

    it('should return 404 for non-existent vote', async () => {
      const res = await request(app).get('/api/votes/non-existent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/votes/:id/vote (cast vote)', () => {
    it('should allow user to cast a vote', async () => {
      const res = await request(app)
        .post(`/api/votes/${testVote.id}/vote`)
        .set('Authorization', `Bearer ${voterToken}`)
        .send({ optionId: testOption1.id });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('record');
    });

    it('should reject double vote from same user (no membership)', async () => {
      const res = await request(app)
        .post(`/api/votes/${testVote.id}/vote`)
        .set('Authorization', `Bearer ${voterToken}`)
        .send({ optionId: testOption2.id });

      expect(res.status).toBe(409);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post(`/api/votes/${testVote.id}/vote`)
        .send({ optionId: testOption1.id });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/votes/:id/results', () => {
    it('should return aggregated results with percentages', async () => {
      const res = await request(app).get(`/api/votes/${testVote.id}/results`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalVotes');
      expect(res.body.data.options).toBeInstanceOf(Array);
      res.body.data.options.forEach((opt: any) => {
        expect(opt).toHaveProperty('percentage');
        expect(opt.percentage).toBeGreaterThanOrEqual(0);
        expect(opt.percentage).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('POST /api/votes (create)', () => {
    it('should create a new vote with options', async () => {
      const res = await request(app)
        .post('/api/votes')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          title: 'New Vote',
          voteType: 'FREE_VOTE',
          startsAt: new Date().toISOString(),
          endsAt: new Date(Date.now() + 86400000).toISOString(),
          options: [{ text: 'Yes' }, { text: 'No' }],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.options.length).toBe(2);
    });
  });
});
