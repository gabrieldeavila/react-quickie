import { InvalidChatMessagesError } from './invalid-chat-messages.error';
import { parseCompaction } from './parse-compaction';

describe('parseCompaction', () => {
  it('accepts absence', () => {
    expect(parseCompaction(undefined)).toBeUndefined();
    expect(parseCompaction(null)).toBeUndefined();
  });

  it('keeps only the known fields', () => {
    expect(
      parseCompaction({ summary: 'S', upToMessageId: 'a1', extra: true }),
    ).toEqual({ summary: 'S', upToMessageId: 'a1' });
  });

  it.each([
    'text',
    {},
    { summary: '', upToMessageId: 'a1' },
    { summary: 'S' },
    { summary: 'x'.repeat(100_001), upToMessageId: 'a1' },
  ])('rejects %p', (raw) => {
    expect(() => parseCompaction(raw)).toThrow(InvalidChatMessagesError);
  });
});
