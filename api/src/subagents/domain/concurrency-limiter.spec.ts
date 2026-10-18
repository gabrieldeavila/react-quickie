import {
  ConcurrencyLimiter,
  DEFAULT_MAX_PARALLEL_SUBAGENTS,
  readMaxParallel,
} from './concurrency-limiter';

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe('readMaxParallel', () => {
  it('reads a positive integer', () => {
    expect(readMaxParallel('2')).toBe(2);
  });

  it.each([undefined, '', '0', '-1', '1.5', 'many'])(
    'falls back to the default for %p',
    (value) => {
      expect(readMaxParallel(value)).toBe(DEFAULT_MAX_PARALLEL_SUBAGENTS);
    },
  );
});

describe('ConcurrencyLimiter', () => {
  it('lets up to the limit run and queues the rest', async () => {
    const limiter = new ConcurrencyLimiter(2);
    await limiter.acquire();
    await limiter.acquire();

    let third = false;
    void limiter.acquire().then(() => (third = true));
    await flush();

    expect(limiter.running).toBe(2);
    expect(limiter.waiting).toBe(1);
    expect(third).toBe(false);
  });

  it('hands a released slot to the next waiter in FIFO order', async () => {
    const limiter = new ConcurrencyLimiter(1);
    const release = await limiter.acquire();
    const order: string[] = [];
    void limiter.acquire().then((r) => {
      order.push('a');
      r();
    });
    void limiter.acquire().then(() => order.push('b'));

    release();
    await flush();

    expect(order).toEqual(['a', 'b']);
    expect(limiter.running).toBe(1);
    expect(limiter.waiting).toBe(0);
  });

  it('ignores a second release of the same slot', async () => {
    const limiter = new ConcurrencyLimiter(2);
    const release = await limiter.acquire();
    await limiter.acquire();

    release();
    release();

    expect(limiter.running).toBe(1);
  });

  it('drops a waiter whose signal aborts and keeps the slot count right', async () => {
    const limiter = new ConcurrencyLimiter(1);
    const release = await limiter.acquire();
    const controller = new AbortController();
    const waiting = limiter.acquire(controller.signal);

    controller.abort();

    await expect(waiting).rejects.toBeDefined();
    expect(limiter.waiting).toBe(0);
    release();
    expect(limiter.running).toBe(0);
  });

  it('rejects at once when the signal is already aborted', async () => {
    const limiter = new ConcurrencyLimiter(1);
    const controller = new AbortController();
    controller.abort();

    await expect(limiter.acquire(controller.signal)).rejects.toBeDefined();
    expect(limiter.running).toBe(0);
  });
});
