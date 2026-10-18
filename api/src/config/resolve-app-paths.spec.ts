import { resolveAppPaths } from './resolve-app-paths';

describe('resolveAppPaths', () => {
  const base = { baseDir: '/repo/api/dist', homeDir: '/home/me' };

  it('derives api, ui and skills folders from the running code folder', () => {
    const paths = resolveAppPaths({ ...base, env: {} });

    expect(paths.apiDir).toBe('/repo/api');
    expect(paths.apiSourceDir).toBe('/repo/api/src');
    expect(paths.uiDir).toBe('/repo/ui');
    expect(paths.repoParentDir).toBe('/');
    expect(paths.skillsDir).toBe('/repo/api/dist/common/agents/skills');
    expect(paths.pluginSkillsDir).toBe(
      '/repo/api/dist/common/agents/plugin/skills',
    );
    expect(paths.templatesDir).toBe('/repo/templates');
    expect(paths.legacyMemoryDir).toBe('/repo/api/storage/memory');
  });

  it('defaults the data folder to ~/.doty', () => {
    const paths = resolveAppPaths({ ...base, env: {} });

    expect(paths.storageDir).toBe('/home/me/.doty');
    expect(paths.memoryDir).toBe('/home/me/.doty/memory');
  });

  it('honours DOTY_DATA_DIR and DOTY_TEMPLATES_DIR', () => {
    const paths = resolveAppPaths({
      ...base,
      env: { DOTY_DATA_DIR: '/data/doty/', DOTY_TEMPLATES_DIR: '/tpl' },
    });

    expect(paths.storageDir).toBe('/data/doty');
    expect(paths.memoryDir).toBe('/data/doty/memory');
    expect(paths.templatesDir).toBe('/tpl');
  });
});
