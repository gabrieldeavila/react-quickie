import { SECRET_FIELDS, SECRET_MASK } from './mask-mcp-secrets';
import { McpConfigEditError } from './mcp-config-text';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * An update sends back `••••` for secrets the user didn't touch: those take
 * the stored value of the same key. A mask with nothing stored behind it is
 * an error (it would be saved as the literal "••••").
 */
export function mergeMaskedSecrets(
  incoming: unknown,
  stored: unknown,
): unknown {
  if (!isPlainObject(incoming)) return incoming;
  const merged: Record<string, unknown> = { ...incoming };

  for (const field of SECRET_FIELDS) {
    const values = incoming[field];
    if (!isPlainObject(values)) continue;
    const storedValues = isPlainObject(stored) ? stored[field] : undefined;

    merged[field] = Object.fromEntries(
      Object.entries(values).map(([key, value]) => {
        if (value !== SECRET_MASK) return [key, value];
        const previous = isPlainObject(storedValues)
          ? storedValues[key]
          : undefined;
        if (typeof previous !== 'string') {
          throw new McpConfigEditError(
            'invalid-server',
            `"${field}.${key}" has no stored value; type the value again.`,
          );
        }
        return [key, previous];
      }),
    );
  }
  return merged;
}
