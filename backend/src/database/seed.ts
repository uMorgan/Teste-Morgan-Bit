import { pool } from '../config/database';
import { BcryptHashProvider } from '../providers/hash.provider';

/**
 * Seed idempotente: pode ser executado várias vezes sem duplicar dados.
 * Senha de todos os usuários de teste: Senha@123
 */
const DEFAULT_PASSWORD = 'Senha@123';

const DDL_STATEMENTS = `
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

  CREATE TABLE IF NOT EXISTS requests (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(50) NOT NULL CHECK (
          category IN ('TI', 'RH', 'Compras', 'Financeiro', 'Infraestrutura')
      ),
      status VARCHAR(50) NOT NULL DEFAULT 'Aberto' CHECK (
          status IN ('Aberto', 'Em Atendimento', 'Concluído')
      ),
      user_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      
      CONSTRAINT fk_requests_user
          FOREIGN KEY (user_id) 
          REFERENCES users(id) 
          ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
  CREATE INDEX IF NOT EXISTS idx_requests_category ON requests(category);
  CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
  CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);
  CREATE INDEX IF NOT EXISTS idx_requests_title ON requests(title);

  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
  END;
  $$ language 'plpgsql';

  DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
  CREATE TRIGGER trigger_update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS trigger_update_requests_updated_at ON requests;
  CREATE TRIGGER trigger_update_requests_updated_at
      BEFORE UPDATE ON requests
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
`;

const USERS = [
  { name: 'Administrador do Sistema', email: 'admin@empresa.com', role: 'ADMIN' },
  { name: 'João Silva', email: 'joao.silva@empresa.com', role: 'USER' },
] as const;

const SAMPLE_REQUESTS = [
  {
    title: 'Troca de monitor danificado',
    description: 'O monitor secundário apresenta linhas verticais e está piscando.',
    category: 'TI',
    status: 'Aberto',
    daysAgo: 2,
  },
  {
    title: 'Reembolso de despesas de viagem',
    description: 'Reembolso de táxi e alimentação da visita ao cliente em São Paulo.',
    category: 'Financeiro',
    status: 'Em Atendimento',
    daysAgo: 1,
  },
  {
    title: 'Ajuste de cadeira do posto 42',
    description: 'Regulagem de altura da cadeira está travada.',
    category: 'Infraestrutura',
    status: 'Concluído',
    daysAgo: 5,
  },
] as const;

async function seed(): Promise<void> {
  const client = await pool.connect();
  const hashProvider = new BcryptHashProvider();

  try {
    await client.query('BEGIN');

    // Executa a DDL para criação do schema/tabelas se não existirem
    await client.query(DDL_STATEMENTS);

    const passwordHash = await hashProvider.hash(DEFAULT_PASSWORD);
    for (const user of USERS) {
      await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING`,
        [user.name, user.email, passwordHash, user.role],
      );
    }

    const { rows } = await client.query<{ count: number }>('SELECT COUNT(*)::int AS count FROM requests');
    if ((rows[0]?.count ?? 0) === 0) {
      const requester = await client.query<{ id: string }>('SELECT id FROM users WHERE email = $1', [
        'joao.silva@empresa.com',
      ]);
      const userId = requester.rows[0]?.id;
      if (!userId) throw new Error('Usuário solicitante do seed não encontrado');

      for (const r of SAMPLE_REQUESTS) {
        await client.query(
          `INSERT INTO requests (title, description, category, status, user_id, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW() - make_interval(days => $6::int))`,
          [r.title, r.description, r.category, r.status, userId, r.daysAgo],
        );
      }
    }

    await client.query('COMMIT');
    console.log('[seed] Concluído. Schema criado e dados iniciais populados com sucesso!');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

seed()
  .then(() => pool.end())
  .catch(async (err: unknown) => {
    console.error('[seed] Falha:', err);
    await pool.end();
    process.exit(1);
  });
