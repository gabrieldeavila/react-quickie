import * as fs from 'fs';
import matter from 'gray-matter';
import * as os from 'os';
import * as path from 'path';
import { buildEnvironmentBlock } from './domain/build-environment-block';
import { loadSystemPrompt, type SystemPromptInput } from './load-system-prompt';

// The shipped skills, so a change to behavior.md or memory.md shows up here.
const SKILLS_DIR = path.resolve(__dirname, '../../agents/skills');

// Like MarkdownService without the HTML rendering (`marked` is ESM-only).
const readMarkdown = (file: string) =>
  Promise.resolve(matter(fs.readFileSync(file, 'utf-8')).content.trim());

const environment = buildEnvironmentBlock({
  client: 'vscode',
  workspaceRoots: ['/work'],
  activeRoot: '/work/app',
  platform: 'darwin',
  osRelease: '24.5.0',
  shell: 'bash',
  date: new Date(2026, 9, 18),
  git: { isRepository: true, branch: 'main', changedFiles: 2 },
  modelRef: 'anthropic:claude-sonnet-5-5',
  toolsAvailable: true,
  instructionIds: [],
});

describe('loadSystemPrompt', () => {
  let root: string;

  const write = (relative: string, content: string) => {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  };

  const load = (overrides: Partial<SystemPromptInput> = {}) =>
    loadSystemPrompt({
      readMarkdown,
      skillsDir: SKILLS_DIR,
      pluginSkillsDir: path.join(root, 'no-plugins'),
      root,
      mode: 'none',
      toolsAvailable: true,
      toolNames: ['read_file', 'edit_file', 'run_bash_command', 'run_subagent'],
      projectMemory: { stack: 'nest' },
      environment,
      ...overrides,
    });

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'doty-prompt-'));
    write('AGENTS.md', 'Use pnpm.');
    write('.agents/style.md', 'Two-space indentation.');
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('assembles the prompt in a stable order (snapshot)', async () => {
    const prompt = (await load()).map(({ content }) => content);

    expect(prompt.join('\n\n----\n\n')).toMatchSnapshot();
  });

  it('starts with the identity and ends with the environment', async () => {
    const prompt = await load();

    expect(prompt[0].content).toMatch(/^You are Doty, an autonomous/);
    expect(prompt[prompt.length - 1]).toBe(environment);
  });

  it('puts AGENTS.md before the legacy .agents files', async () => {
    const contents = (await load()).map(({ content }) => content);

    expect(contents.indexOf('Use pnpm.')).toBeLessThan(
      contents.indexOf('Two-space indentation.'),
    );
  });

  it('puts selected instructions after project instructions and before memory', async () => {
    const contents = (
      await load({
        selectedInstructions: [{ role: 'system', content: 'Selected: forms' }],
      })
    ).map(({ content }) => content);
    const selected = contents.indexOf('Selected: forms');

    expect(selected).toBeGreaterThan(
      contents.indexOf('Two-space indentation.'),
    );
    expect(selected).toBeLessThan(
      contents.findIndex((text) => text.startsWith('Project memory')),
    );
  });

  it('drops the tool guide and memory rules for models without tools', async () => {
    const contents = (await load({ toolsAvailable: false })).map(
      ({ content }) => content,
    );

    expect(contents[0]).toMatch(/Tools are unavailable/);
    expect(contents.some((text) => text.startsWith('Tool guide'))).toBe(false);
    expect(contents.some((text) => text.includes('save_project_memory'))).toBe(
      false,
    );
    expect(contents).toContain(
      'Project memory from the current workspace:\n- stack: "nest"',
    );
  });
});
