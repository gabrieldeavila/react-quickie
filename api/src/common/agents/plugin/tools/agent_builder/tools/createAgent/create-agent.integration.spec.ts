import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { getAppPaths } from 'src/config/app-paths';

// Runs create_agent against temp copies of the real plugin files.

const mockDirs = { apiPluginDir: '', uiPluginDir: '' };

jest.mock('../../agent-builder-dirs', () => ({
  getAgentBuilderDirs: () => mockDirs,
}));
// Prettier only restyles; skip spawning it.
jest.mock('child_process', () => ({
  ...jest.requireActual<object>('child_process'),
  execFileSync: jest.fn(),
}));

import { createAgent } from './tool';

const agent = {
  name: 'data_analyst',
  label: 'Data "Analyst"',
  icon: 'FaChartBar',
  iconImport: 'react-icons/fa',
};

function copyFixture(from: string, to: string) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

describe('createAgent (integration)', () => {
  let tmp: string;

  beforeEach(() => {
    const { apiSourceDir, uiDir } = getAppPaths();
    const realApi = path.join(apiSourceDir, 'common', 'agents', 'plugin');
    const realUi = path.join(uiDir, 'types', 'plugin');

    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'doty-agent-'));
    mockDirs.apiPluginDir = path.join(tmp, 'api');
    mockDirs.uiPluginDir = path.join(tmp, 'ui');
    for (const file of [
      'tools.plugins.service.ts',
      'agent.plugins.module.ts',
    ]) {
      copyFixture(
        path.join(realApi, 'tools', file),
        path.join(mockDirs.apiPluginDir, 'tools', file),
      );
    }
    copyFixture(
      path.join(realUi, 'specialty.plugin.ts'),
      path.join(mockDirs.uiPluginDir, 'specialty.plugin.ts'),
    );
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  const read = (...parts: string[]) =>
    fs.readFileSync(path.join(tmp, ...parts), 'utf-8');

  it('wires the agent into the UI list, the tools service and the module', () => {
    const files = createAgent(agent);

    expect(files).toHaveLength(4);
    expect(files.every(Boolean)).toBe(true);

    const ui = read('ui', 'specialty.plugin.ts');
    expect(ui).toContain('DATA_ANALYST = "data_analyst"');
    expect(ui).toContain('label: "Data \\"Analyst\\""');
    expect(ui).toMatch(
      /import \{[^}]*FaChartBar[^}]*\} from "react-icons\/fa"/,
    );

    const service = read('api', 'tools', 'tools.plugins.service.ts');
    expect(service).toContain('DataAnalystToolsService');
    expect(service).toContain(
      'data_analyst: () => this.DataAnalystToolsService.createTools()',
    );

    const module = read('api', 'tools', 'agent.plugins.module.ts');
    expect(module.match(/DataAnalystToolsService/g)?.length).toBe(3);

    expect(read('api', 'tools', 'data_analyst', 'tools.service.ts')).toContain(
      'class DataAnalystToolsService',
    );
    expect(read('api', 'skills', 'data_analyst', 'index.md')).toBeTruthy();
  });

  it('does not duplicate entries when run twice', () => {
    createAgent(agent);
    createAgent(agent);

    const ui = read('ui', 'specialty.plugin.ts');
    expect(ui.match(/AgentFocusPluginEnum\.DATA_ANALYST/g)?.length).toBe(1);
    const module = read('api', 'tools', 'agent.plugins.module.ts');
    expect(module.match(/DataAnalystToolsService/g)?.length).toBe(3);
  });

  it('refuses a name that would leave the plugin folder', () => {
    expect(() => createAgent({ ...agent, name: '../../escape' })).toThrow(
      'Nome de agente inválido',
    );
    expect(fs.existsSync(path.join(tmp, 'escape'))).toBe(false);
  });
});
