import { createApp } from './app';
import { checkDatabaseConnection, pool } from './config/database';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  await checkDatabaseConnection();
  console.log('[db] Conexão com o PostgreSQL estabelecida');

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`[http] API ouvindo em http://localhost:${env.PORT}/api (${env.NODE_ENV})`);
  });

  // Graceful shutdown: para de aceitar conexões, finaliza as em andamento e fecha o pool
  const shutdown = (signal: string): void => {
    console.log(`[app] ${signal} recebido, encerrando...`);
    server.close(() => {
      pool
        .end()
        .then(() => process.exit(0))
        .catch((err: unknown) => {
          console.error('[db] Erro ao fechar pool:', err);
          process.exit(1);
        });
    });
    // Força a saída se algo travar
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err: unknown) => {
  console.error('[app] Falha ao iniciar a aplicação:', err);
  process.exit(1);
});
