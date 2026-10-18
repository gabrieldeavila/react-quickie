/** Provider keys kept in SecretStorage and passed to the API as env vars. */
export const PROVIDER_KEYS = [
  { id: 'anthropic', label: 'Anthropic', envVar: 'ANTHROPIC_API_KEY' },
  { id: 'openai', label: 'OpenAI', envVar: 'OPENAI_API_KEY' },
  { id: 'deepseek', label: 'DeepSeek', envVar: 'DEEPSEEK_API_KEY' },
  {
    id: 'openai-compatible',
    label: 'OpenAI-compatible',
    envVar: 'OPENAI_COMPATIBLE_API_KEY',
  },
] as const;

export type ProviderKeyId = (typeof PROVIDER_KEYS)[number]['id'];

export function secretKeyFor(id: ProviderKeyId): string {
  return `doty.apiKey.${id}`;
}
