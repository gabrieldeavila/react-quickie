import { availableProviders } from './available-providers';
import { PROVIDER_CATALOG } from './provider-catalog';
import { resolveDefaultModel } from './resolve-default-model';
import { resolveSubagentModel } from './resolve-subagent-model';
import {
  NoModelConfiguredError,
  selectRequestModel,
  UnknownModelError,
} from './select-request-model';

const env = {
  OPENAI_KEY: 'sk',
  OPENAI_MODEL: 'gpt-5.6-sol',
  ANTHROPIC_API_KEY: 'sk-ant',
};
const providers = availableProviders(PROVIDER_CATALOG, env);

describe('resolveDefaultModel', () => {
  it('uses DOTY_DEFAULT_MODEL when it is available', () => {
    expect(
      resolveDefaultModel(providers, {
        ...env,
        DOTY_DEFAULT_MODEL: 'anthropic:claude-haiku-5-5',
      })?.ref,
    ).toBe('anthropic:claude-haiku-5-5');
  });

  it('falls back to openai:$OPENAI_MODEL', () => {
    expect(resolveDefaultModel(providers, env)?.ref).toBe('openai:gpt-5.6-sol');
  });

  it('skips a DOTY_DEFAULT_MODEL whose provider has no key', () => {
    expect(
      resolveDefaultModel(providers, {
        ...env,
        DOTY_DEFAULT_MODEL: 'deepseek:deepseek-v4-pro',
      })?.ref,
    ).toBe('openai:gpt-5.6-sol');
  });

  it('falls back to the first available model', () => {
    const anthropicOnly = availableProviders(PROVIDER_CATALOG, {
      ANTHROPIC_API_KEY: 'k',
    });
    expect(resolveDefaultModel(anthropicOnly, {})?.ref).toBe(
      'anthropic:claude-opus-5-5',
    );
  });

  it('is undefined without providers', () => {
    expect(resolveDefaultModel([], env)).toBeUndefined();
  });
});

describe('selectRequestModel', () => {
  const defaultModel = resolveDefaultModel(providers, env);

  it('uses the default when the body has no model', () => {
    expect(selectRequestModel(providers, undefined, defaultModel).ref).toBe(
      'openai:gpt-5.6-sol',
    );
    expect(selectRequestModel(providers, '', defaultModel).ref).toBe(
      'openai:gpt-5.6-sol',
    );
  });

  it('returns the requested model with its capabilities', () => {
    const selected = selectRequestModel(
      providers,
      'anthropic:claude-sonnet-5-5',
      defaultModel,
    );
    expect(selected.provider).toBe('anthropic');
    expect(selected.model.supportsImages).toBe(true);
  });

  it.each(['deepseek:deepseek-v4-pro', 'anthropic:claude-2', 'nope', 42])(
    'rejects %p',
    (requested) => {
      expect(() =>
        selectRequestModel(providers, requested, defaultModel),
      ).toThrow(UnknownModelError);
    },
  );

  it('fails clearly when nothing is configured', () => {
    expect(() => selectRequestModel([], undefined, undefined)).toThrow(
      NoModelConfiguredError,
    );
  });
});

describe('resolveSubagentModel', () => {
  const defaultModel = resolveDefaultModel(providers, env);

  it("prefers the agent's frontmatter model", () => {
    expect(
      resolveSubagentModel(providers, {
        agentModel: 'openai:gpt-6-luna',
        subagentModel: 'anthropic:claude-haiku-5-5',
        defaultModel,
      })?.ref,
    ).toBe('openai:gpt-6-luna');
  });

  it('skips an agent model whose provider has no key', () => {
    expect(
      resolveSubagentModel(providers, {
        agentModel: 'deepseek:deepseek-v4-pro',
        subagentModel: 'anthropic:claude-haiku-5-5',
        defaultModel,
      })?.ref,
    ).toBe('anthropic:claude-haiku-5-5');
  });

  it('then DOTY_SUBAGENT_MODEL', () => {
    expect(
      resolveSubagentModel(providers, {
        subagentModel: 'anthropic:claude-haiku-5-5',
        conversationModel: 'openai:gpt-6-luna',
        defaultModel,
      })?.ref,
    ).toBe('anthropic:claude-haiku-5-5');
  });

  it('then the conversation model', () => {
    expect(
      resolveSubagentModel(providers, {
        subagentModel: 'deepseek:deepseek-v4-pro', // no key → skipped
        conversationModel: 'openai:gpt-6-luna',
        defaultModel,
      })?.ref,
    ).toBe('openai:gpt-6-luna');
  });

  it('then the default', () => {
    expect(resolveSubagentModel(providers, { defaultModel })?.ref).toBe(
      'openai:gpt-5.6-sol',
    );
  });
});
