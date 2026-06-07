import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { config } from '../config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KSKA API',
      version: '1.0.0',
      description:
        'Multi-platform KSKA engagement API (auth, posts, votes, tickets, memberships, manual payments)',
      contact: { name: 'KSKA Team' },
    },
    servers: [
      { url: config.backendUrl, description: 'Current server' },
      { url: 'http://localhost:5000', description: 'Local development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication & user management' },
      { name: 'Users', description: 'User profile & management' },
      { name: 'Posts', description: 'KSKA posts, comments, likes, saves' },
      { name: 'Votes', description: 'Voting system' },
      { name: 'Memberships', description: 'Subscription plans' },
      { name: 'Tickets', description: 'Event tickets & QR check-in' },
      { name: 'Leaderboard', description: 'User rankings' },
      { name: 'Notifications', description: 'In-app & push notifications' },
      { name: 'Payments', description: 'Manual payment proofs (admin verification)' },
      { name: 'Upload', description: 'Media uploads' },
      { name: 'Settings', description: 'App-wide settings' },
      { name: 'Employer', description: 'Employer-specific endpoints' },
      { name: 'Admin', description: 'Admin-only endpoints' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

export function mountSwagger(app: Express) {
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'KSKA API Docs',
      swaggerOptions: { persistAuthorization: true },
    })
  );

  app.get('/api/docs.json', (_req, res) => {
    res.json(swaggerSpec);
  });
}
