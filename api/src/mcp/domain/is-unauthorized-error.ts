const MAX_DEPTH = 5;

/**
 * Whether a connection failed because the server wants a sign-in. The SDK
 * throws `UnauthorizedError`, sometimes wrapped as another error's `cause`.
 */
export function isUnauthorizedError(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < MAX_DEPTH && current; depth += 1) {
    if (current instanceof Error && current.name === 'UnauthorizedError') {
      return true;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}
