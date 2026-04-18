import express from 'express';
import routes from '@/backend/routes/api.routes.js';
import { errorHandler } from '@/backend/server/middlewares/error.middleware.js';
import { notFound } from '@/backend/server/middlewares/not-found.middleware.js';

export const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api', routes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
};