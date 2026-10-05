export const USER_ROLES = ['USER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Entidade completa (uso interno — contém o hash da senha). */
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/** Representação segura para expor na API. */
export type PublicUser = Omit<User, 'passwordHash'>;

/** Dados do usuário autenticado extraídos do JWT e injetados em req.user. */
export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _ignored, ...publicData } = user;
  return publicData;
}
