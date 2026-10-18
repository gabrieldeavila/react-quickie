export class McpTimeoutError extends Error {
  constructor(ms: number) {
    super(`O servidor não respondeu em ${Math.round(ms / 1000)}s.`);
    this.name = 'McpTimeoutError';
  }
}

/** Rejects after `ms`; `onTimeout` cleans up whatever the promise was opening. */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  onTimeout: () => void,
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      onTimeout();
      reject(new McpTimeoutError(ms));
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
