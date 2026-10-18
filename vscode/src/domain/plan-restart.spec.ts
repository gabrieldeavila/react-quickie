import { describe, expect, it } from 'vitest';
import { MAX_RESTART_ATTEMPTS, planRestart, STABLE_UPTIME_MS } from './plan-restart';

describe('planRestart', () => {
  it('backs off exponentially on quick crashes', () => {
    expect(planRestart(0, 100)).toEqual({ attempt: 1, delayMs: 1000 });
    expect(planRestart(1, 100)).toEqual({ attempt: 2, delayMs: 2000 });
    expect(planRestart(3, 100)).toEqual({ attempt: 4, delayMs: 8000 });
  });

  it('gives up after too many crashes in a row', () => {
    expect(planRestart(MAX_RESTART_ATTEMPTS, 100)).toBeNull();
  });

  it('starts over after a stable run', () => {
    expect(planRestart(MAX_RESTART_ATTEMPTS, STABLE_UPTIME_MS)).toEqual({
      attempt: 1,
      delayMs: 1000,
    });
  });
});
