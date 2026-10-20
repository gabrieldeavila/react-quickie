/** What the API shows instead of a literal value in `env` or `headers`. */
export const SECRET_MASK = '••••';

/** Fields whose values may be tokens. */
export const SECRET_FIELDS = ['env', 'headers'] as const;

const ENV_REFERENCE = /\$\{[A-Za-z_][A-Za-z0-9_]*\}/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/** A value that uses `${VAR}` holds no literal secret, so it's shown as is. */
function maskValue(value: unknown): unknown {
  if (typeof value !== 'string' || value === '') return value;
  return ENV_REFERENCE.test(value) ? value : SECRET_MASK;
}

/**
 * A raw server entry as the UI may see it: literal `env` and `headers`
 * values become `••••`. Everything else is returned unchanged.
 */
export function maskMcpSecrets(entry: unknown): unknown {
  if (!isPlainObject(entry)) return entry;
  const masked: Record<string, unknown> = { ...entry };
  for (const field of SECRET_FIELDS) {
    const values = entry[field];
    if (!isPlainObject(values)) continue;
    masked[field] = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, maskValue(value)]),
    );
  }
  return masked;
}
