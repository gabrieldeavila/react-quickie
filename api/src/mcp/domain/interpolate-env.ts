const VARIABLE = /\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g;

type Env = Record<string, string | undefined>;

export type Interpolated<T> = { value: T; missing: string[] };

function interpolateString(text: string, env: Env, missing: Set<string>) {
  return text.replace(VARIABLE, (match, name: string) => {
    const value = env[name];
    if (value === undefined) {
      missing.add(name);
      return match;
    }
    return value;
  });
}

function walk(value: unknown, env: Env, missing: Set<string>): unknown {
  if (typeof value === 'string') return interpolateString(value, env, missing);
  if (Array.isArray(value))
    return value.map((item) => walk(item, env, missing));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        walk(item, env, missing),
      ]),
    );
  }
  return value;
}

/**
 * Replaces `${VAR}` in every string of a JSON value. Missing variables are
 * reported instead of becoming empty strings (a blank token would still be sent).
 */
export function interpolateEnv<T>(value: T, env: Env): Interpolated<T> {
  const missing = new Set<string>();
  const result = walk(value, env, missing) as T;
  return { value: result, missing: [...missing].sort() };
}
