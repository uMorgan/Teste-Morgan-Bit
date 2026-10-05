import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import { routes } from './routes';

/**
 * Cria a aplicação Express sem iniciar o servidor HTTP
 * (permite testes de integração com supertest no futuro).
 */
export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', routes);

  // A ordem importa: 404 depois de todas as rotas, handler de erro por último
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
