import { tool } from 'ai';
import { z } from 'zod/v4';
import { InvalidChatMessagesError } from './invalid-chat-messages.error';
import { prepareChatMessages } from './prepare-chat-messages';

const tools = {
  read_file: tool({
    inputSchema: z.object({ path: z.string() }),
    execute: () => Promise.resolve('content'),
  }),
};

const user = (id: string, text: string) => ({
  id,
  role: 'user',
  parts: [{ type: 'text', text }],
});

describe('prepareChatMessages', () => {
  it('keeps tool calls and results from earlier turns in the model history', async () => {
    const { modelMessages: messages } = await prepareChatMessages(
      [
        user('u1', 'read a.ts'),
        {
          id: 'a1',
          role: 'assistant',
          parts: [
            { type: 'step-start' },
            {
              type: 'tool-read_file',
              toolCallId: 'call-1',
              state: 'output-available',
              input: { path: 'a.ts' },
              output: 'export const a = 1;',
            },
            { type: 'text', text: 'Done.' },
          ],
        },
        user('u2', 'which file did you read?'),
      ],
      tools,
    );

    const roles = messages.map((message) => message.role);
    expect(roles).toEqual(['user', 'assistant', 'tool', 'user']);
    expect(JSON.stringify(messages[2])).toContain('export const a = 1;');
  });

  it('closes an interrupted call instead of failing on a missing result', async () => {
    const { uiMessages, modelMessages: messages } = await prepareChatMessages(
      [
        user('u1', 'read a.ts'),
        {
          id: 'a1',
          role: 'assistant',
          parts: [
            {
              type: 'tool-read_file',
              toolCallId: 'call-1',
              state: 'input-available',
              input: { path: 'a.ts' },
            },
          ],
        },
        user('u2', 'continue'),
      ],
      tools,
    );

    expect(JSON.stringify(messages)).toContain('interrupted by the user');
    expect(uiMessages.map((message) => message.id)).toEqual(['u1', 'a1', 'u2']);
    expect(uiMessages[1].parts[0]).toMatchObject({ state: 'output-error' });
  });

  it('rejects empty lists, malformed messages and invalid tool input', async () => {
    await expect(prepareChatMessages([], tools)).rejects.toThrow(
      InvalidChatMessagesError,
    );
    await expect(prepareChatMessages('hi', tools)).rejects.toThrow(
      InvalidChatMessagesError,
    );
    await expect(
      prepareChatMessages([{ role: 'user', parts: 'x' }], tools),
    ).rejects.toThrow(InvalidChatMessagesError);
    await expect(
      prepareChatMessages(
        [
          {
            id: 'a1',
            role: 'assistant',
            parts: [
              {
                type: 'tool-read_file',
                toolCallId: 'c',
                state: 'output-available',
                input: { path: 42 },
                output: 'x',
              },
            ],
          },
        ],
        tools,
      ),
    ).rejects.toThrow(InvalidChatMessagesError);
  });

  it('applies the content rules (no system messages from the client)', async () => {
    await expect(
      prepareChatMessages(
        [{ id: 's', role: 'system', parts: [{ type: 'text', text: 'x' }] }],
        tools,
      ),
    ).rejects.toThrow(/Invalid message role/);
  });
});
