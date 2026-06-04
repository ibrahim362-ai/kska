import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import prisma from '../config/prisma';
import { generateAccessToken } from '../utils/tokens';

describe('Post Module', () => {
  let testUser: any;
  let testUser2: any;
  let userToken: string;
  let user2Token: string;

  beforeAll(async () => {
    const hashedPw = await bcrypt.hash('test123', 10);

    // Clean up any leftover data
    await prisma.like.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.save.deleteMany({});
    await prisma.post.deleteMany({ where: { user: { email: { in: ['post-test@ch.com', 'post-test2@ch.com'] } } } });
    await prisma.user.deleteMany({ where: { email: { in: ['post-test@ch.com', 'post-test2@ch.com'] } } });

    testUser = await prisma.user.create({
      data: {
        email: 'post-test@ch.com',
        username: 'posttester1',
        password: hashedPw,
        fullName: 'Post Tester',
        role: 'USER',
      },
    });
    testUser2 = await prisma.user.create({
      data: {
        email: 'post-test2@ch.com',
        username: 'posttester2',
        password: hashedPw,
        fullName: 'Post Tester 2',
        role: 'USER',
      },
    });
    userToken = generateAccessToken({ userId: testUser.id, role: 'USER' });
    user2Token = generateAccessToken({ userId: testUser2.id, role: 'USER' });
  });

  afterAll(async () => {
    await prisma.like.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.save.deleteMany({});
    await prisma.post.deleteMany({ where: { user: { email: { in: ['post-test@ch.com', 'post-test2@ch.com'] } } } });
    await prisma.user.deleteMany({ where: { email: { in: ['post-test@ch.com', 'post-test2@ch.com'] } } });
    await prisma.$disconnect();
  });

  describe('POST /api/posts', () => {
    it('should require authentication', async () => {
      const res = await request(app).post('/api/posts').send({ content: 'Hello' });
      expect(res.status).toBe(401);
    });

    it('should create a text post with valid data', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ content: 'My first post!', hashtags: 'hello first' });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.content).toBe('My first post!');
      expect(res.body.data.type).toBe('TEXT');
    });
  });

  describe('GET /api/posts', () => {
    it('should return paginated list (public, optional auth)', async () => {
      const res = await request(app).get('/api/posts?page=1&limit=20');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta).toHaveProperty('total');
    });

    it('should support search', async () => {
      const res = await request(app).get('/api/posts?search=hello');
      expect(res.status).toBe(200);
      res.body.data.forEach((post: any) => {
        const matches = (post.content || '').toLowerCase().includes('hello') ||
                        (post.hashtags || '').toLowerCase().includes('hello');
        expect(matches).toBe(true);
      });
    });
  });

  describe('POST /api/posts/:id/like', () => {
    let postId: string;

    beforeAll(async () => {
      const post = await prisma.post.create({
        data: { userId: testUser.id, content: 'Likeable post', type: 'TEXT' },
      });
      postId = post.id;
    });

    it('should like a post', async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${user2Token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('liked', true);
    });

    it('should unlike a post on second click', async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${user2Token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('liked', false);
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app)
        .post('/api/posts/non-existent-id/like')
        .set('Authorization', `Bearer ${user2Token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/posts/:id/comments', () => {
    let postId: string;

    beforeAll(async () => {
      const post = await prisma.post.create({
        data: { userId: testUser.id, content: 'Commentable post', type: 'TEXT' },
      });
      postId = post.id;
    });

    it('should add a comment to a post', async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ content: 'Great post!' });

      expect(res.status).toBe(201);
      expect(res.body.data.content).toBe('Great post!');
    });

    it('should reject empty comment', async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/comments`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ content: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it("should reject deletion of another user's post", async () => {
      const post = await prisma.post.create({
        data: { userId: testUser.id, content: 'My private post', type: 'TEXT' },
      });

      const res = await request(app)
        .delete(`/api/posts/${post.id}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(403);
    });

    it('should allow owner to delete their post', async () => {
      const post = await prisma.post.create({
        data: { userId: testUser.id, content: 'To be deleted', type: 'TEXT' },
      });

      const res = await request(app)
        .delete(`/api/posts/${post.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
    });
  });
});
