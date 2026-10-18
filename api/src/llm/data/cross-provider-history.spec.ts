import { streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod/v4';
import { prepareChatMessages } from 'src/chat/domain/prepare-chat-messages';
import { buildRegistryProviders } from './provider-factories';
import type { ProviderId } from '../domain/model-catalog.types';

// Offline version of the manual smoke test: a conversation that ran tools on
// OpenAI, then on Anthropic, is sent to each provider. The provider's real
// request builder runs; a fake fetch captures the body instead of calling out.
// Reasoning parts are already filtered by the UI (filter-parts-by-capabilities),
// so only tool calls, their ids and provider metadata travel across.

const tools = {
  read_file: tool({
    inputSchema: z.object({ path: z.string() }),
    execute: () => Promise.resolve('content'),
  }),
};

const history = [
  { id: 'u1', role: 'user', parts: [{ type: 'text', text: 'read a.ts' }] },
  {
    id: 'a1',
    role: 'assistant',
    parts: [
      { type: 'step-start' },
      {
        type: 'tool-read_file',
        toolCallId: 'call_openai_1',
        state: 'output-available',
        input: { path: 'a.ts' },
        output: 'export const a = 1;',
        callProviderMetadata: { openai: { itemId: 'fc_openai_1' } },
      },
      { type: 'text', text: 'a.ts exports a.' },
    ],
  },
  { id: 'u2', role: 'user', parts: [{ type: 'text', text: 'now b.ts' }] },
  {
    id: 'a2',
    role: 'assistant',
    parts: [
      { type: 'step-start' },
      {
        type: 'tool-read_file',
        toolCallId: 'toolu_anthropic_1',
        state: 'output-available',
        input: { path: 'b.ts' },
        output: 'export const b = 2;',
      },
      { type: 'text', text: 'b.ts exports b.' },
    ],
  },
  { id: 'u3', role: 'user', parts: [{ type: 'text', text: 'and c.ts?' }] },
] as unknown as UIMessage[];

const env = {
  OPENAI_API_KEY: 'test',
  ANTHROPIC_API_KEY: 'test',
  DEEPSEEK_API_KEY: 'test',
  OPENAI_COMPATIBLE_BASE_URL: 'http://localhost:1/v1',
};

const MODELS: Record<ProviderId, string> = {
  openai: 'gpt-6.1-sol',
  anthropic: 'claude-sonnet-5-5',
  deepseek: 'deepseek-v4-flash',
  'openai-compatible': 'llama3.3',
};

/** Sends the history to one provider and returns the captured request body. */
async function captureRequest(providerId: ProviderId): Promise<string> {
  let body = '';
  const fakeFetch = ((_url: unknown, init?: RequestInit) => {
    body = typeof init?.body === 'string' ? init.body : '';
    return Promise.resolve(
      new Response('{"error":"offline"}', { status: 418 }),
    );
  }) as typeof fetch;
  const model = buildRegistryProviders([providerId], env, fakeFetch)[
    providerId
  ].languageModel(MODELS[providerId]);

  const { modelMessages } = await prepareChatMessages(history, tools);
  const result = streamText({
    model,
    messages: modelMessages,
    tools,
    maxRetries: 0,
  });
  await result.consumeStream({ onError: () => undefined });
  return body;
}

describe('cross-provider history', () => {
  it.each(['openai', 'anthropic', 'deepseek', 'openai-compatible'] as const)(
    'converts OpenAI + Anthropic tool calls for %s',
    async (providerId) => {
      const body = await captureRequest(providerId);

      expect(body).not.toBe('');
      expect(body).toContain('b.ts exports b.');
      expect(body).toContain('export const b = 2;');
      // OpenAI's own calls may be sent as stored item references; every other
      // provider must get both tool call ids verbatim.
      if (providerId !== 'openai') expect(body).toContain('call_openai_1');
      expect(body).toContain('toolu_anthropic_1');
    },
  );
});
