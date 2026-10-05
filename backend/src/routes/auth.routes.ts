import { Router } from 'express';
import { authController, authMiddleware } from '../container';
import { asyncHandler } from '../utils/http';

export const authRoutes = Router();

// Pública
authRoutes.post('/login', asyncHandler(authController.login));

// Protegidas
authRoutes.get('/me', authMiddleware, asyncHandler(authController.me));
authRoutes.post('/logout', authMiddleware, asyncHandler(authController.logout));
