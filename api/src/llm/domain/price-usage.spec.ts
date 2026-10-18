import type { ModelInfo } from './model-catalog.types';
import { addModelUsage, priceUsage } from './price-usage';
import { sumCosts } from './sum-costs';
import type { TokenUsage } from './token-usage.types';

const tokens = (input: number, output: number): TokenUsage => ({
  inputTokens: input,
  outputTokens: output,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
  reasoningTokens: 0,
});

const model = (pricing?: ModelInfo['pricing']) => ({
  ref: 'a:b',
  model: { pricing } as ModelInfo,
});

describe('priceUsage', () => {
  it('prices usage with the model catalog', () => {
    const priced = priceUsage(
      model({ inputPerMTok: 2, outputPerMTok: 10 }),
      tokens(1000, 100),
    );

    expect(priced.model).toBe('a:b');
    expect(priced.costUsd).toBeCloseTo((1000 * 2 + 100 * 10) / 1e6);
  });

  it('leaves cost out without pricing', () => {
    expect(priceUsage(model(), tokens(1, 1)).costUsd).toBeUndefined();
  });
});

describe('addModelUsage', () => {
  it('starts from the first call', () => {
    const first = { model: 'a:b', usage: tokens(1, 1), costUsd: 0.5 };
    expect(addModelUsage(undefined, first)).toBe(first);
  });

  it('sums tokens and cost', () => {
    const total = addModelUsage(
      { model: 'a:b', usage: tokens(10, 1), costUsd: 0.5 },
      { model: 'a:b', usage: tokens(5, 2), costUsd: 0.25 },
    );

    expect(total.usage).toMatchObject({ inputTokens: 15, outputTokens: 3 });
    expect(total.costUsd).toBe(0.75);
  });
});

describe('sumCosts', () => {
  it('ignores unknown costs and is undefined when none is known', () => {
    expect(sumCosts([1, undefined, 2])).toBe(3);
    expect(sumCosts([undefined])).toBeUndefined();
    expect(sumCosts([])).toBeUndefined();
  });
});
