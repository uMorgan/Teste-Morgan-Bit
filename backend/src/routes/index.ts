import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { dashboardRoutes } from './dashboard.routes';
import { serviceRequestRoutes } from './service-request.routes';

export const routes = Router();

routes.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

routes.use('/auth', authRoutes);
routes.use('/requests', serviceRequestRoutes);
routes.use('/dashboard', dashboardRoutes);
