VERSION
export function validateEnv(): string[] {
  const errors: string[] = [];
  const required = ['API_KEY', 'DATABASE_URL', 'JWT_SECRET'];
  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Missing required env: ${key}`);
    }
  }
  return errors;
}
