import { availableProviders, parseModelList } from './available-providers';
import { PROVIDER_CATALOG } from './provider-catalog';

const ids = (env: Record<string, string>) =>
  availableProviders(PROVIDER_CATALOG, env).map((provider) => provider.id);

const modelIds = (env: Record<string, string>, providerId: string) =>
  availableProviders(PROVIDER_CATALOG, env)
    .find((provider) => provider.id === providerId)
    ?.models.map((model) => model.id);

describe('availableProviders', () => {
  it('returns nothing without keys', () => {
    expect(ids({})).toEqual([]);
  });

  it('keeps only providers with a non-empty key', () => {
    expect(
      ids({
        ANTHROPIC_API_KEY: 'sk-ant',
        DEEPSEEK_API_KEY: '  ',
        OPENAI_API_KEY: '',
      }),
    ).toEqual(['anthropic']);
  });

  it('accepts the legacy OPENAI_KEY', () => {
    expect(ids({ OPENAI_KEY: 'sk' })).toEqual(['openai']);
  });

  it('adds OPENAI_MODEL as an extra model when the catalog lacks it', () => {
    const models = modelIds(
      { OPENAI_KEY: 'sk', OPENAI_MODEL: 'gpt-5.6-sol' },
      'openai',
    );
    expect(models).toContain('gpt-5.6-sol');
    expect(models).toContain('gpt-6.1-sol');
  });

  it('does not duplicate a catalog model listed in env', () => {
    const models = modelIds(
      { OPENAI_KEY: 'sk', OPENAI_MODEL: 'gpt-6.1-sol' },
      'openai',
    );
    expect(models?.filter((id) => id === 'gpt-6.1-sol')).toHaveLength(1);
  });

  it('lists openai-compatible models from env with conservative capabilities', () => {
    const [provider] = availableProviders(PROVIDER_CATALOG, {
      OPENAI_COMPATIBLE_BASE_URL: 'http://localhost:11434/v1',
      OPENAI_COMPATIBLE_MODELS: 'llama3.3, qwen3-coder',
    });
    expect(provider.id).toBe('openai-compatible');
    expect(provider.models).toEqual([
      expect.objectContaining({
        id: 'llama3.3',
        supportsTools: true,
        supportsImages: false,
        supportsReasoning: false,
      }),
      expect.objectContaining({ id: 'qwen3-coder' }),
    ]);
  });

  it('hides openai-compatible when it has a URL but no models', () => {
    expect(
      ids({ OPENAI_COMPATIBLE_BASE_URL: 'http://localhost:1234/v1' }),
    ).toEqual([]);
  });
});

describe('parseModelList', () => {
  it('trims, drops empties and duplicates', () => {
    expect(parseModelList(' a, ,b,a ')).toEqual(['a', 'b']);
  });
});
