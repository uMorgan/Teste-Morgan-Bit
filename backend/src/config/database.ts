import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import { env } from './env';

/**
 * Pool único de conexões compartilhado por toda a aplicação.
 */
export const pool = new Pool(
  env.DATABASE_URL
    ? {
        connectionString: env.DATABASE_URL,
        ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 5_000,
      }
    : {
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        max: 10,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 5_000,
      },
);

pool.on('error', (err) => {
  // Erros em clientes ociosos não devem derrubar o processo silenciosamente
  console.error('[db] Erro inesperado em cliente ocioso do pool:', err);
});

/**
 * Abstração mínima de "algo que executa queries".
 * Os repositórios dependem desta interface (e não do Pool concreto),
 * o que permite injetar um PoolClient em transações ou um mock em testes.
 */
export interface Queryable {
  query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: unknown[],
  ): Promise<QueryResult<R>>;
}

export async function checkDatabaseConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }
}
