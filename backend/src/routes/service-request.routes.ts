import { Router } from 'express';
import { authMiddleware, serviceRequestController as controller } from '../container';
import { requireRole } from '../middlewares/role.middleware';
import { asyncHandler } from '../utils/http';

export const serviceRequestRoutes = Router();

// Todas as rotas deste router exigem JWT
serviceRequestRoutes.use(authMiddleware);

serviceRequestRoutes.get('/', asyncHandler(controller.list));
serviceRequestRoutes.post('/', asyncHandler(controller.create));
serviceRequestRoutes.get('/:id', asyncHandler(controller.show));
// Editar/Excluir: dono ou ADMIN, apenas com status 'Aberto' (regra no service)
serviceRequestRoutes.put('/:id', asyncHandler(controller.update));
serviceRequestRoutes.delete('/:id', asyncHandler(controller.remove));
// Alterar status: exclusivo de ADMIN
serviceRequestRoutes.patch('/:id/status', requireRole('ADMIN'), asyncHandler(controller.updateStatus));
