import type { ModelMessage } from 'ai';
import { pruneForContext } from './prune-for-context';

const toolTurn = (id: string): ModelMessage[] => [
  {
    role: 'assistant',
    content: [
      { type: 'reasoning', text: `thinking ${id}` },
      { type: 'text', text: `reading ${id}` },
      {
        type: 'tool-call',
        toolCallId: id,
        toolName: 'read_file',
        input: { path: id },
      },
    ],
  },
  {
    role: 'tool',
    content: [
      {
        type: 'tool-result',
        toolCallId: id,
        toolName: 'read_file',
        output: { type: 'text', value: 'x'.repeat(1000) },
      },
    ],
  },
];

const types = (message: ModelMessage): string[] =>
  Array.isArray(message.content)
    ? (message.content as Array<{ type: string }>).map((part) => part.type)
    : ['string'];

describe('pruneForContext', () => {
  const messages: ModelMessage[] = [
    { role: 'user', content: 'first' },
    ...toolTurn('c1'),
    { role: 'user', content: 'second' },
    ...toolTurn('c2'),
  ];

  it('drops old tool calls and reasoning but keeps their text', () => {
    const pruned = pruneForContext(messages);

    expect(types(pruned[1])).toEqual(['text']);
    expect(
      pruned.some((m) => m.role === 'tool' && m.content.length === 0),
    ).toBe(false);
  });

  it('keeps tool calls of the last three messages', () => {
    const pruned = pruneForContext(messages);
    const last = pruned.slice(-2);

    expect(types(last[0])).toContain('tool-call');
    expect(types(last[1])).toEqual(['tool-result']);
  });

  it('makes the conversation smaller', () => {
    const pruned = pruneForContext(messages);

    expect(JSON.stringify(pruned).length).toBeLessThan(
      JSON.stringify(messages).length,
    );
  });
});
