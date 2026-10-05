import type { Queryable } from '../config/database';
import type { DashboardSummary } from '../models/service-request.model';

export interface IDashboardRepository {
  getSummary(): Promise<DashboardSummary>;
}

export class PgDashboardRepository implements IDashboardRepository {
  constructor(private readonly db: Queryable) {}

  /**
   * Os 4 indicadores em uma única varredura da tabela.
   * COUNT(CASE WHEN ...) conta apenas as linhas onde o CASE não é NULL.
   * (Equivalente no PostgreSQL: COUNT(*) FILTER (WHERE status = '...').)
   * O cast ::int evita que o driver pg retorne bigint como string.
   */
  async getSummary(): Promise<DashboardSummary> {
    const { rows } = await this.db.query<DashboardSummary>(
      `SELECT
         COUNT(*)::int                                            AS "total",
         COUNT(CASE WHEN status = 'Aberto'         THEN 1 END)::int AS "abertas",
         COUNT(CASE WHEN status = 'Em Atendimento' THEN 1 END)::int AS "emAtendimento",
         COUNT(CASE WHEN status = 'Concluído'      THEN 1 END)::int AS "concluidas"
       FROM requests`,
    );

    return rows[0] ?? { total: 0, abertas: 0, emAtendimento: 0, concluidas: 0 };
  }
}
