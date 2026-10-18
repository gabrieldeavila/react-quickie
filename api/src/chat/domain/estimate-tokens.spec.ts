import type { UIMessage } from 'ai';
import {
  estimateContextTokens,
  estimateTokens,
  IMAGE_TOKENS,
  scaleEstimate,
} from './estimate-tokens';

const text = (id: string, role: UIMessage['role'], value: string) =>
  ({ id, role, parts: [{ type: 'text', text: value }] }) as UIMessage;

describe('estimateTokens', () => {
  it('uses chars/4 of the JSON form', () => {
    expect(estimateTokens('x'.repeat(398))).toBe(100); // 400 chars with quotes
  });

  it('counts inline images as a fixed size', () => {
    const image = {
      type: 'file',
      url: `data:image/png;base64,${'A'.repeat(1e5)}`,
    };
    const bytes = { type: 'file', data: new Uint8Array(1e5) };

    expect(estimateTokens(image)).toBeLessThan(IMAGE_TOKENS + 20);
    expect(estimateTokens(bytes)).toBeLessThan(IMAGE_TOKENS + 20);
  });
});

describe('estimateContextTokens', () => {
  it('estimates everything when no turn was measured', () => {
    const messages = [text('u1', 'user', 'hello')];

    expect(estimateContextTokens({ messages, fixedTokens: 500 })).toBe(
      500 + estimateTokens(messages),
    );
  });

  it('starts from the latest measured assistant turn', () => {
    const measured = {
      ...text('a1', 'assistant', 'answer'),
      metadata: { model: 'a:b', contextTokens: 10_000 },
    } as UIMessage;
    const next = text('u2', 'user', 'follow-up');
    const messages = [text('u1', 'user', 'q'), measured, next];

    expect(estimateContextTokens({ messages, fixedTokens: 500 })).toBe(
      10_000 + estimateTokens([next]),
    );
  });

  it('ignores invalid metadata', () => {
    const bogus = {
      ...text('a1', 'assistant', 'x'),
      metadata: { contextTokens: 'lots' },
    } as UIMessage;

    expect(estimateContextTokens({ messages: [bogus], fixedTokens: 0 })).toBe(
      estimateTokens([bogus]),
    );
  });
});

describe('scaleEstimate', () => {
  it('scales by the size ratio', () => {
    expect(scaleEstimate(1000, 200, 100)).toBe(500);
    expect(scaleEstimate(1000, 0, 100)).toBe(1000);
  });
});
