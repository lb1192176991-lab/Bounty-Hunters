import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const testSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  value: z.number().int().positive(),
  tags: z.array(z.string()).optional(),
});

describe('Schema round-trip validation', () => {
  it('should serialize and deserialize correctly', () => {
    const input = { id: '550e8400-e29b-41d4-a716-446655440000', name: 'test', value: 42 };
    const parsed = testSchema.parse(input);
    expect(parsed).toEqual(input);
  });

  it('should reject invalid data', () => {
    expect(() => testSchema.parse({ id: 'invalid', name: '', value: -1 })).toThrow();
  });

  it('should handle optional fields', () => {
    const input = { id: '550e8400-e29b-41d4-a716-446655440000', name: 'test', value: 1 };
    const parsed = testSchema.parse(input);
    expect(parsed.tags).toBeUndefined();
  });
});
