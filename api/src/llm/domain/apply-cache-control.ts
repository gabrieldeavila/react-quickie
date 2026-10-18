import type { Instructions, ModelMessage } from 'ai';
import { toSystemMessages } from './to-system-messages';

type ProviderOptions = NonNullable<ModelMessage['providerOptions']>;

const EPHEMERAL = { type: 'ephemeral' } as const;

function withoutCacheControl(
  options: ModelMessage['providerOptions'],
): ModelMessage['providerOptions'] {
  if (!options?.anthropic || !('cacheControl' in options.anthropic)) {
    return options;
  }
  const anthropic = { ...options.anthropic };
  delete anthropic.cacheControl;
  const rest: ProviderOptions = { ...options };
  delete rest.anthropic;
  return Object.keys(anthropic).length > 0 ? { ...rest, anthropic } : rest;
}

function withCacheControl(
  options: ModelMessage['providerOptions'],
): ProviderOptions {
  return {
    ...options,
    anthropic: { ...options?.anthropic, cacheControl: EPHEMERAL },
  };
}

function markLast<T extends ModelMessage>(messages: T[]): T[] {
  return messages.map((message, index) => ({
    ...message,
    providerOptions:
      index === messages.length - 1
        ? withCacheControl(message.providerOptions)
        : withoutCacheControl(message.providerOptions),
  }));
}

export type CacheablePrompt = {
  instructions: Instructions | undefined;
  messages: ModelMessage[];
};

/**
 * Anthropic prompt caching: one breakpoint on the last system instruction
 * (tools + skills + memory, stable across turns) and one on the last message
 * (the conversation so far). Runs on every step, and step overrides carry
 * forward, so earlier message breakpoints are removed first: Anthropic allows
 * at most four per request.
 */
export function applyCacheControl({
  instructions,
  messages,
}: CacheablePrompt): CacheablePrompt {
  const system = toSystemMessages(instructions);

  return {
    instructions: system.length > 0 ? markLast(system) : instructions,
    messages: markLast(messages),
  };
}
