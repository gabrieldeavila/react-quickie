export const DEFAULT_MAX_PARALLEL_SUBAGENTS = 4;

/** `DOTY_MAX_PARALLEL_SUBAGENTS` → a positive integer, else the default. */
export function readMaxParallel(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : DEFAULT_MAX_PARALLEL_SUBAGENTS;
}

export type Release = () => void;

type Waiter = { grant: (release: Release) => void };

function abortError(signal: AbortSignal): unknown {
  return signal.reason ?? new DOMException('Aborted', 'AbortError');
}

/** A semaphore: at most `limit` holders; the rest wait in FIFO order. */
export class ConcurrencyLimiter {
  private active = 0;
  private readonly waiters: Waiter[] = [];

  constructor(private readonly limit: number) {}

  get running(): number {
    return this.active;
  }

  get waiting(): number {
    return this.waiters.length;
  }

  /** Resolves with a release function (safe to call twice). Rejects if `signal` aborts first. */
  acquire(signal?: AbortSignal): Promise<Release> {
    if (signal?.aborted) return Promise.reject(abortError(signal));
    if (this.active < this.limit) {
      this.active++;
      return Promise.resolve(this.createRelease());
    }

    return new Promise<Release>((resolve, reject) => {
      const waiter: Waiter = {
        grant: (release) => {
          signal?.removeEventListener('abort', onAbort);
          resolve(release);
        },
      };
      const onAbort = () => {
        this.removeWaiter(waiter);
        reject(abortError(signal!));
      };
      signal?.addEventListener('abort', onAbort, { once: true });
      this.waiters.push(waiter);
    });
  }

  private createRelease(): Release {
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.handOff();
    };
  }

  /** Passes the freed slot to the next waiter, or frees it. */
  private handOff() {
    const next = this.waiters.shift();
    if (next) next.grant(this.createRelease());
    else this.active--;
  }

  private removeWaiter(waiter: Waiter) {
    const index = this.waiters.indexOf(waiter);
    if (index >= 0) this.waiters.splice(index, 1);
  }
}
