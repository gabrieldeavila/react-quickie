import type { UIMessage } from 'ai';
import { findCompactionCut, isOverContextBudget } from './find-compaction-cut';

const message = (id: string, role: UIMessage['role']) =>
  ({ id, role, parts: [{ type: 'text', text: id }] }) as UIMessage;

const ids = (messages: UIMessage[] | undefined) => messages?.map((m) => m.id);

describe('isOverContextBudget', () => {
  it('is true above 75% of the window', () => {
    expect(isOverContextBudget(750, 1000)).toBe(false);
    expect(isOverContextBudget(751, 1000)).toBe(true);
  });
});

describe('findCompactionCut', () => {
  const conversation = [
    message('u1', 'user'),
    message('a1', 'assistant'),
    message('u2', 'user'),
    message('a2', 'assistant'),
    message('u3', 'user'),
    message('a3', 'assistant'),
  ];

  it('keeps the last two user turns', () => {
    const cut = findCompactionCut(conversation);

    expect(ids(cut?.older)).toEqual(['u1', 'a1']);
    expect(ids(cut?.recent)).toEqual(['u2', 'a2', 'u3', 'a3']);
    expect(cut?.upToMessageId).toBe('a1');
  });

  it('returns undefined when there are not enough turns', () => {
    expect(findCompactionCut(conversation.slice(0, 4))).toBeUndefined();
  });

  it('returns undefined when the kept turns start the conversation', () => {
    expect(
      findCompactionCut([message('u1', 'user'), message('u2', 'user')], 2),
    ).toBeUndefined();
  });

  it('keeps an approval continuation (last message assistant) in recent', () => {
    const cut = findCompactionCut(conversation, 1);

    expect(ids(cut?.recent)).toEqual(['u3', 'a3']);
  });
});
