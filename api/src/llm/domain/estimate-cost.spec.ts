import { estimateCost } from './estimate-cost';
import type { TokenUsage } from './token-usage.types';

const usage = (extra: Partial<TokenUsage> = {}): TokenUsage => ({
  inputTokens: 1_000_000,
  outputTokens: 100_000,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
  reasoningTokens: 0,
  ...extra,
});

describe('estimateCost', () => {
  it('returns undefined without pricing', () => {
    expect(estimateCost(usage(), undefined)).toBeUndefined();
  });

  it('prices input and output per million tokens', () => {
    expect(
      estimateCost(usage(), { inputPerMTok: 2, outputPerMTok: 10 }),
    ).toBeCloseTo(3);
  });

  it('prices cached reads and writes separately from uncached input', () => {
    const cost = estimateCost(
      usage({ cacheReadTokens: 600_000, cacheWriteTokens: 200_000 }),
      {
        inputPerMTok: 2,
        outputPerMTok: 10,
        cacheReadPerMTok: 0.2,
        cacheWritePerMTok: 2.5,
      },
    );
    // 200k uncached × 2 + 600k × 0.2 + 200k × 2.5 + 100k × 10
    expect(cost).toBeCloseTo(0.4 + 0.12 + 0.5 + 1);
  });

  it('falls back to the input price for cache tokens', () => {
    const cost = estimateCost(usage({ cacheReadTokens: 500_000 }), {
      inputPerMTok: 2,
      outputPerMTok: 10,
    });
    expect(cost).toBeCloseTo(3);
  });

  it('does not count reasoning tokens twice', () => {
    const cost = estimateCost(usage({ reasoningTokens: 50_000 }), {
      inputPerMTok: 2,
      outputPerMTok: 10,
    });
    expect(cost).toBeCloseTo(3);
  });
});
