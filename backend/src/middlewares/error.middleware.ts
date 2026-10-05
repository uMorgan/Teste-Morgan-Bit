import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError, NotFoundError } from '../errors/AppError';

/**
 * Formato padronizado de TODA resposta de erro da API:
 * { "error": { "code": "NOT_FOUND", "message": "...", "details": [...] } }
 */
interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

function buildBody(code: string, message: string, details?: unknown): ErrorResponseBody {
  return { error: { code, message, ...(details !== undefined && { details }) } };
}

/** Erros do PostgreSQL (driver pg) expõem um "code" SQLSTATE de 5 caracteres. */
function isPostgresError(err: unknown): err is { code: string; detail?: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as { code: unknown }).code === 'string' &&
    /^[0-9A-Z]{5}$/.test((err as { code: string }).code) &&
    'severity' in err
  );
}

/** JSON malformado no corpo (lançado pelo express.json()). */
function isJsonSyntaxError(err: unknown): boolean {
  return err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400;
}

/** Erros do pacote http-errors (usado pelo body-parser) marcados como seguros para expor. */
function isExposedClientHttpError(err: unknown): err is { status: number; message: string } {
  if (typeof err !== 'object' || err === null) return false;
  const candidate = err as { status?: unknown; expose?: unknown; message?: unknown };
  return (
    candidate.expose === true &&
    typeof candidate.status === 'number' &&
    candidate.status >= 400 &&
    candidate.status < 500 &&
    typeof candidate.message === 'string'
  );
}

/** Captura rotas inexistentes e delega ao handler global. */
export const notFoundMiddleware: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Rota ${req.method} ${req.originalUrl} não encontrada`));
};

export const errorMiddleware: ErrorRequestHandler = (err: unknown, req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(buildBody(err.code, err.message, err.details));
    return;
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.') || null,
      message: issue.message,
    }));
    res.status(400).json(buildBody('VALIDATION_ERROR', 'Dados de entrada inválidos', details));
    return;
  }

  if (isJsonSyntaxError(err)) {
    res.status(400).json(buildBody('INVALID_JSON', 'Corpo da requisição não é um JSON válido'));
    return;
  }

  if (isExposedClientHttpError(err)) {
    // Ex.: 413 Payload Too Large, 415 Unsupported Media Type (body-parser)
    res.status(err.status).json(buildBody('HTTP_ERROR', err.message));
    return;
  }

  if (isPostgresError(err)) {
    // Rede de segurança: validações devem barrar antes, mas o banco é a última linha de defesa
    switch (err.code) {
      case '22P02': // invalid_text_representation (ex.: UUID malformado)
      case '23514': // check_violation
      case '23502': // not_null_violation
        res.status(400).json(buildBody('INVALID_DATA', 'Dados rejeitados pelas restrições do banco'));
        return;
      case '23503': // foreign_key_violation
        res.status(409).json(buildBody('REFERENCE_CONFLICT', 'Registro referenciado não existe'));
        return;
      case '23505': // unique_violation
        res.status(409).json(buildBody('DUPLICATE_RESOURCE', 'Registro duplicado'));
        return;
      default:
        break;
    }
  }

  // Erro inesperado: loga com contexto, mas nunca vaza detalhes internos ao cliente
  console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  res.status(500).json(buildBody('INTERNAL_SERVER_ERROR', 'Erro interno do servidor'));
};
