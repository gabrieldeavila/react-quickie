import {
  PROVIDER_IDS,
  type ModelRef,
  type ProviderId,
} from './model-catalog.types';

export class InvalidModelRefError extends Error {
  constructor(ref: string) {
    super(`Modelo inválido: "${ref}". Use o formato provedor:modelo.`);
    this.name = 'InvalidModelRefError';
  }
}

const isProviderId = (value: string): value is ProviderId =>
  (PROVIDER_IDS as readonly string[]).includes(value);

/**
 * `"anthropic:claude-sonnet-5-5"` → `{ provider, model }`. Splits on the first
 * colon only, so model ids with colons (`ollama:llama3.3:70b`) survive.
 */
export function parseModelRef(ref: string): ModelRef {
  const separator = ref.indexOf(':');
  if (separator <= 0) throw new InvalidModelRefError(ref);

  const provider = ref.slice(0, separator).trim();
  const model = ref.slice(separator + 1).trim();
  if (!isProviderId(provider) || !model) throw new InvalidModelRefError(ref);

  return { provider, model };
}

export const formatModelRef = ({ provider, model }: ModelRef): string =>
  `${provider}:${model}`;
