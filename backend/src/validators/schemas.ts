import { z } from 'zod';
import { REQUEST_CATEGORIES, REQUEST_STATUSES } from '../models/service-request.model';

/** Query strings vazias (?category=) são tratadas como "não informado". */
const optionalQueryParam = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), 'Data inválida');

export const loginSchema = z.object({
  email: z.string({ required_error: 'E-mail é obrigatório' }).trim().toLowerCase().email('E-mail inválido'),
  password: z.string({ required_error: 'Senha é obrigatória' }).min(1, 'Senha é obrigatória'),
});

export const idParamSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: 'ID deve ser numérico' })
    .int('ID deve ser um número inteiro')
    .positive('ID deve ser positivo')
    .max(2_147_483_647, 'ID fora do intervalo permitido'), // limite do tipo SERIAL (int4)
});

const requestBodyFields = {
  title: z
    .string({ required_error: 'Título é obrigatório' })
    .trim()
    .min(3, 'Título deve ter ao menos 3 caracteres')
    .max(255, 'Título deve ter no máximo 255 caracteres'),
  description: z
    .string({ required_error: 'Descrição é obrigatória' })
    .trim()
    .min(1, 'Descrição é obrigatória')
    .max(5000, 'Descrição deve ter no máximo 5000 caracteres'),
  category: z.enum(REQUEST_CATEGORIES, {
    errorMap: () => ({ message: `Categoria deve ser uma de: ${REQUEST_CATEGORIES.join(', ')}` }),
  }),
};

/** .strict() rejeita campos extras como "status" ou "userId" no corpo. */
export const createRequestSchema = z.object(requestBodyFields).strict();

/** PUT = substituição completa dos campos editáveis. */
export const updateRequestSchema = z.object(requestBodyFields).strict();

export const updateStatusSchema = z
  .object({
    status: z.enum(REQUEST_STATUSES, {
      errorMap: () => ({ message: `Status deve ser um de: ${REQUEST_STATUSES.join(', ')}` }),
    }),
  })
  .strict();

export const listRequestsQuerySchema = z
  .object({
    startDate: optionalQueryParam(isoDate),
    endDate: optionalQueryParam(isoDate),
    category: optionalQueryParam(z.enum(REQUEST_CATEGORIES)),
    status: optionalQueryParam(z.enum(REQUEST_STATUSES)),
    search: optionalQueryParam(z.string().trim().max(255)),
    page: optionalQueryParam(z.coerce.number().int().min(1)).transform((v) => v ?? 1),
    limit: optionalQueryParam(z.coerce.number().int().min(1).max(100)).transform((v) => v ?? 10),
  })
  .refine((q) => !q.startDate || !q.endDate || q.startDate <= q.endDate, {
    message: 'startDate não pode ser posterior a endDate',
    path: ['startDate'],
  });

export type LoginBody = z.infer<typeof loginSchema>;
export type ListRequestsQuery = z.infer<typeof listRequestsQuerySchema>;
