import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import prisma from '../config/prisma';
import { generateAccessToken } from '../utils/tokens';
import { v4 as uuidv4 } from 'uuid';

describe('Ticket Module', () => {
  let creator: any;
  let buyer: any;
  let creatorToken: string;
  let buyerToken: string;
  let testTicket: any;

  beforeAll(async () => {
    const hashedPw = await bcrypt.hash('test123', 10);

    await prisma.ticketPurchase.deleteMany({ where: { user: { email: { in: ['ticket-creator@ch.com', 'ticket-buyer@ch.com'] } } } });
    await prisma.ticket.deleteMany({ where: { creator: { email: 'ticket-creator@ch.com' } } });
    await prisma.user.deleteMany({ where: { email: { in: ['ticket-creator@ch.com', 'ticket-buyer@ch.com'] } } });

    creator = await prisma.user.create({
      data: { email: 'ticket-creator@ch.com', username: 'ticketcreator', password: hashedPw, fullName: 'Ticket Creator', role: 'EMPLOYER' },
    });
    buyer = await prisma.user.create({
      data: { email: 'ticket-buyer@ch.com', username: 'ticketbuyer', password: hashedPw, fullName: 'Ticket Buyer', role: 'USER' },
    });
    creatorToken = generateAccessToken({ userId: creator.id, role: 'EMPLOYER' });
    buyerToken = generateAccessToken({ userId: buyer.id, role: 'USER' });

    testTicket = await prisma.ticket.create({
      data: {
        creatorId: creator.id,
        title: 'Test Event',
        description: 'Test event description',
        price: 0,
        quantity: 100,
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: 'Addis Ababa',
        status: 'ACTIVE',
        qrCode: uuidv4(),
      },
    });
  });

  afterAll(async () => {
    await prisma.ticketPurchase.deleteMany({ where: { user: { email: { in: ['ticket-creator@ch.com', 'ticket-buyer@ch.com'] } } } });
    await prisma.ticket.deleteMany({ where: { creator: { email: 'ticket-creator@ch.com' } } });
    await prisma.user.deleteMany({ where: { email: { in: ['ticket-creator@ch.com', 'ticket-buyer@ch.com'] } } });
    await prisma.$disconnect();
  });

  describe('GET /api/tickets', () => {
    it('should list active tickets', async () => {
      const res = await request(app).get('/api/tickets');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/tickets/:id', () => {
    it('should return a single ticket', async () => {
      const res = await request(app).get(`/api/tickets/${testTicket.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Test Event');
    });

    it('should return 404 for non-existent ticket', async () => {
      const res = await request(app).get('/api/tickets/non-existent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/tickets (create)', () => {
    it('should create a ticket (employer only)', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          title: 'New Event',
          price: 50,
          quantity: 50,
          eventDate: new Date(Date.now() + 86400000).toISOString(),
          location: 'Bahir Dar',
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe('New Event');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/tickets')
        .send({ title: 'X', price: 0, quantity: 1, eventDate: new Date().toISOString() });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/tickets/:id/purchase', () => {
    it('should let user purchase a free ticket', async () => {
      const res = await request(app)
        .post(`/api/tickets/${testTicket.id}/purchase`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('qrCode');
    });

    it('should increment soldCount', async () => {
      const updated = await prisma.ticket.findUnique({ where: { id: testTicket.id } });
      expect(updated!.soldCount).toBeGreaterThan(0);
    });

    it("should not let user purchase same ticket twice", async () => {
      const res = await request(app)
        .post(`/api/tickets/${testTicket.id}/purchase`)
        .set('Authorization', `Bearer ${buyerToken}`);

      // May be 400 or 409 depending on implementation
      expect([400, 409]).toContain(res.status);
    });
  });

  describe('GET /api/tickets/my-tickets', () => {
    it("should return user's purchased tickets", async () => {
      const res = await request(app)
        .get('/api/tickets/my-tickets')
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });
});
