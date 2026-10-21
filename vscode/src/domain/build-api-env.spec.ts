import { describe, expect, it } from 'vitest';
import { buildApiEnv, type ApiEnvInput } from './build-api-env';

const input: ApiEnvInput = {
  baseEnv: { PATH: '/usr/bin', DOTY_AUTH_TOKEN: 'inherited', EMPTY: '' },
  port: 51234,
  token: 'tok',
  workspaceRoots: ['/work/a', '/work/b'],
  dataDir: '/storage',
  apiBaseDir: '/ext/dist/api',
  providerKeys: { ANTHROPIC_API_KEY: 'sk-ant', OPENAI_API_KEY: undefined },
  settings: { defaultModel: 'anthropic:claude-sonnet-5-5', openaiCompatibleModels: ' ' },
};

describe('buildApiEnv', () => {
  it('sets the Doty runtime vars', () => {
    expect(buildApiEnv(input)).toMatchObject({
      ELECTRON_RUN_AS_NODE: '1',
      PORT: '51234',
      DOTY_AUTH_TOKEN: 'tok',
      DOTY_WORKSPACE_ROOTS: '/work/a,/work/b',
      DOTY_DATA_DIR: '/storage',
      DOTY_API_BASE_DIR: '/ext/dist/api',
      DOTY_CLIENT: 'vscode',
    });
  });

  it('keeps the host env but never an inherited token', () => {
    const env = buildApiEnv(input);
    expect(env.PATH).toBe('/usr/bin');
    expect(env.DOTY_AUTH_TOKEN).toBe('tok');
  });

  it('passes keys and settings, skipping blank values', () => {
    const env = buildApiEnv(input);
    expect(env.ANTHROPIC_API_KEY).toBe('sk-ant');
    expect(env.DOTY_DEFAULT_MODEL).toBe('anthropic:claude-sonnet-5-5');
    expect(env).not.toHaveProperty('OPENAI_API_KEY');
    expect(env).not.toHaveProperty('OPENAI_COMPATIBLE_MODELS');
    expect(env).not.toHaveProperty('EMPTY');
  });
});
