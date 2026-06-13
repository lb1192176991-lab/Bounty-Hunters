import { z } from 'zod';

const providerConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  baseUrl: z.string().url('Must be a valid URL').optional(),
  model: z.string().min(1, 'Model name is required'),
  maxTokens: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export function validateProviderConfig(config: unknown): { valid: boolean; errors: string[] } {
  const result = providerConfigSchema.safeParse(config);
  if (result.success) return { valid: true, errors: [] };
  return { valid: false, errors: result.error.issues.map(i => i.message) };
}
