import { pool } from './config/database';
import { env } from './config/env';
import { AuthController } from './controllers/auth.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { ServiceRequestController } from './controllers/service-request.controller';
import { createAuthMiddleware } from './middlewares/auth.middleware';
import { BcryptHashProvider } from './providers/hash.provider';
import { JwtTokenProvider } from './providers/token.provider';
import { PgDashboardRepository } from './repositories/dashboard.repository';
import { PgServiceRequestRepository } from './repositories/service-request.repository';
import { PgUserRepository } from './repositories/user.repository';
import { AuthService } from './services/auth.service';
import { DashboardService } from './services/dashboard.service';
import { ServiceRequestService } from './services/service-request.service';

/**
 * Composition Root: ÚNICO lugar que conhece as implementações concretas.
 * As demais camadas dependem apenas de interfaces (Dependency Inversion).
 */

// Providers
const hashProvider = new BcryptHashProvider();
const tokenProvider = new JwtTokenProvider(env.JWT_SECRET, env.JWT_EXPIRES_IN);

// Repositories
const userRepository = new PgUserRepository(pool);
const serviceRequestRepository = new PgServiceRequestRepository(pool);
const dashboardRepository = new PgDashboardRepository(pool);

// Services
const authService = new AuthService(userRepository, hashProvider, tokenProvider);
const serviceRequestService = new ServiceRequestService(serviceRequestRepository);
const dashboardService = new DashboardService(dashboardRepository);

// HTTP
export const authMiddleware = createAuthMiddleware(tokenProvider);
export const authController = new AuthController(authService);
export const serviceRequestController = new ServiceRequestController(serviceRequestService);
export const dashboardController = new DashboardController(dashboardService);
