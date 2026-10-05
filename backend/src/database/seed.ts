import { pool } from '../config/database';
import { BcryptHashProvider } from '../providers/hash.provider';

/**
 * Seed idempotente: pode ser executado várias vezes sem duplicar dados.
 * Senha de todos os usuários de teste: Senha@123
 */
const DEFAULT_PASSWORD = 'Senha@123';

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
           VALUES ($1, $2, $3, $4, $5, NOW() - make_interval(days => $6))`,
          [r.title, r.description, r.category, r.status, userId, r.daysAgo],
        );
      }
    }

    await client.query('COMMIT');
    console.log('[seed] Concluído. Login: admin@empresa.com / joao.silva@empresa.com — senha: Senha@123');
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
