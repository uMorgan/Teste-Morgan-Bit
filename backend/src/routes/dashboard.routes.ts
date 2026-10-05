import { Router } from 'express';
import { authMiddleware, dashboardController } from '../container';
import { asyncHandler } from '../utils/http';

export const dashboardRoutes = Router();

dashboardRoutes.get('/', authMiddleware, asyncHandler(dashboardController.summary));
