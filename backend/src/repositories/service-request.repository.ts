import type { Queryable } from '../config/database';
import type {
  CreateServiceRequestData,
  PaginatedResult,
  RequestCategory,
  RequestStatus,
  ServiceRequest,
  ServiceRequestFilters,
  UpdateServiceRequestData,
} from '../models/service-request.model';

/**
 * Guarda de concorrência otimista: a escrita só é aplicada se o registro
 * ainda estiver no status esperado no momento do UPDATE/DELETE.
 */
export interface WriteGuard {
  onlyIfStatus?: RequestStatus;
}

export interface IServiceRequestRepository {
  findAll(filters: ServiceRequestFilters): Promise<PaginatedResult<ServiceRequest>>;
  findById(id: number): Promise<ServiceRequest | null>;
  create(data: CreateServiceRequestData): Promise<ServiceRequest>;
  /** Retorna null se o registro não existir ou não satisfizer o guard. */
  update(id: number, data: UpdateServiceRequestData, guard?: WriteGuard): Promise<ServiceRequest | null>;
  updateStatus(id: number, status: RequestStatus): Promise<ServiceRequest | null>;
  /** Retorna false se o registro não existir ou não satisfizer o guard. */
  delete(id: number, guard?: WriteGuard): Promise<boolean>;
}

interface ServiceRequestRow {
  id: number;
  title: string;
  description: string;
  category: RequestCategory;
  status: RequestStatus;
  user_id: string;
  requester_name: string;
  created_at: Date;
  updated_at: Date;
}

/** Projeção comum: sempre traz o nome do solicitante via JOIN. */
const SELECT_COLUMNS = `
  r.id, r.title, r.description, r.category, r.status, r.user_id,
  u.name AS requester_name, r.created_at, r.updated_at`;

function toEntity(row: ServiceRequestRow): ServiceRequest {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    status: row.status,
    userId: row.user_id,
    requesterName: row.requester_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Escapa curingas do LIKE para que o texto do usuário seja tratado literalmente. */
function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export class PgServiceRequestRepository implements IServiceRequestRepository {
  constructor(private readonly db: Queryable) {}

  /**
   * Query dinâmica: cada filtro presente adiciona uma condição ao WHERE
   * e seu valor ao array de parâmetros. NENHUM valor do usuário é
   * concatenado na string SQL — apenas placeholders ($1, $2...),
   * eliminando o risco de SQL Injection.
   */
  async findAll(filters: ServiceRequestFilters): Promise<PaginatedResult<ServiceRequest>> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    const param = (value: unknown): string => {
      values.push(value);
      return `$${values.length}`;
    };

    if (filters.startDate) {
      conditions.push(`r.created_at >= ${param(filters.startDate)}::date`);
    }
    if (filters.endDate) {
      // endDate inclusivo: tudo antes do início do dia seguinte
      conditions.push(`r.created_at < (${param(filters.endDate)}::date + INTERVAL '1 day')`);
    }
    if (filters.category) {
      conditions.push(`r.category = ${param(filters.category)}`);
    }
    if (filters.status) {
      conditions.push(`r.status = ${param(filters.status)}`);
    }
    if (filters.search) {
      conditions.push(`r.title ILIKE ${param(`%${escapeLikePattern(filters.search)}%`)} ESCAPE '\\'`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const filterValues = [...values];

    const offset = (filters.page - 1) * filters.limit;
    const limitPlaceholder = param(filters.limit);
    const offsetPlaceholder = param(offset);

    const dataSql = `
      SELECT ${SELECT_COLUMNS}
        FROM requests r
        INNER JOIN users u ON u.id = r.user_id
        ${whereClause}
       ORDER BY r.created_at DESC, r.id DESC
       LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`;

    const countSql = `
      SELECT COUNT(*)::int AS total
        FROM requests r
        ${whereClause}`;

    const [dataResult, countResult] = await Promise.all([
      this.db.query<ServiceRequestRow>(dataSql, values),
      this.db.query<{ total: number }>(countSql, filterValues),
    ]);

    const total = countResult.rows[0]?.total ?? 0;

    return {
      data: dataResult.rows.map(toEntity),
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  async findById(id: number): Promise<ServiceRequest | null> {
    const { rows } = await this.db.query<ServiceRequestRow>(
      `SELECT ${SELECT_COLUMNS}
         FROM requests r
         INNER JOIN users u ON u.id = r.user_id
        WHERE r.id = $1`,
      [id],
    );
    return rows[0] ? toEntity(rows[0]) : null;
  }

  async create(data: CreateServiceRequestData): Promise<ServiceRequest> {
    // CTE: insere e já retorna com o JOIN do solicitante em um único round-trip
    const { rows } = await this.db.query<ServiceRequestRow>(
      `WITH inserted AS (
         INSERT INTO requests (title, description, category, status, user_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *
       )
       SELECT ${SELECT_COLUMNS}
         FROM inserted r
         INNER JOIN users u ON u.id = r.user_id`,
      [data.title, data.description, data.category, data.status, data.userId],
    );

    const row = rows[0];
    if (!row) {
      throw new Error('Falha ao criar solicitação: nenhuma linha retornada');
    }
    return toEntity(row);
  }

  async update(
    id: number,
    data: UpdateServiceRequestData,
    guard: WriteGuard = {},
  ): Promise<ServiceRequest | null> {
    const values: unknown[] = [data.title, data.description, data.category, id];
    let guardClause = '';
    if (guard.onlyIfStatus) {
      values.push(guard.onlyIfStatus);
      guardClause = `AND status = $${values.length}`;
    }

    const { rows } = await this.db.query<ServiceRequestRow>(
      `WITH updated AS (
         UPDATE requests
            SET title = $1, description = $2, category = $3
          WHERE id = $4 ${guardClause}
         RETURNING *
       )
       SELECT ${SELECT_COLUMNS}
         FROM updated r
         INNER JOIN users u ON u.id = r.user_id`,
      values,
    );
    return rows[0] ? toEntity(rows[0]) : null;
  }

  async updateStatus(id: number, status: RequestStatus): Promise<ServiceRequest | null> {
    const { rows } = await this.db.query<ServiceRequestRow>(
      `WITH updated AS (
         UPDATE requests
            SET status = $1
          WHERE id = $2
         RETURNING *
       )
       SELECT ${SELECT_COLUMNS}
         FROM updated r
         INNER JOIN users u ON u.id = r.user_id`,
      [status, id],
    );
    return rows[0] ? toEntity(rows[0]) : null;
  }

  async delete(id: number, guard: WriteGuard = {}): Promise<boolean> {
    const values: unknown[] = [id];
    let guardClause = '';
    if (guard.onlyIfStatus) {
      values.push(guard.onlyIfStatus);
      guardClause = `AND status = $${values.length}`;
    }

    const result = await this.db.query(`DELETE FROM requests WHERE id = $1 ${guardClause}`, values);
    return (result.rowCount ?? 0) > 0;
  }
}
