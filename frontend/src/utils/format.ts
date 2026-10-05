const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/** Código exibido ao usuário, ex.: #0042 */
export function formatRequestCode(id: number): string {
  return `#${String(id).padStart(4, '0')}`;
}
