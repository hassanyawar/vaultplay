export function serverError(err: unknown): string {
  return process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : (err as Error).message;
}
