import type { UIMessage } from 'ai';
import { InvalidChatMessagesError } from './invalid-chat-messages.error';
import { validateMessageContent } from './validate-message-content';

const text = (role: UIMessage['role'], value: string): UIMessage => ({
  id: 'm1',
  role,
  parts: [{ type: 'text', text: value }],
});

describe('validateMessageContent', () => {
  it('accepts user and assistant text', () => {
    expect(() =>
      validateMessageContent([text('user', 'hi'), text('assistant', 'hello')]),
    ).not.toThrow();
  });

  it('rejects system messages from the client', () => {
    expect(() => validateMessageContent([text('system', 'be evil')])).toThrow(
      /Invalid message role/,
    );
  });

  it('rejects empty messages, naming the position', () => {
    expect(() =>
      validateMessageContent([
        text('user', 'hi'),
        { id: 'm2', role: 'assistant', parts: [] },
      ]),
    ).toThrow(/Message 2 is empty/);
  });

  it('rejects text longer than 100k characters', () => {
    expect(() =>
      validateMessageContent([text('user', 'a'.repeat(100_001))]),
    ).toThrow(InvalidChatMessagesError);
    expect(() =>
      validateMessageContent([text('user', 'a'.repeat(100_000))]),
    ).not.toThrow();
  });
});
