import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { formatProjectMemory } from './domain/format-project-memory';
import {
  loadAgentsFile,
  loadProjectAgents,
  loadSkillDirectory,
  loadSkillFile,
} from './skill-loaders';

const readMarkdown = (file: string) =>
  Promise.resolve(fs.readFileSync(file, 'utf-8').trim());

const contents = (instructions: unknown) =>
  (instructions as Array<{ content: string }>).map((item) => item.content);

describe('skill loaders', () => {
  let dir: string;

  const write = (relative: string, content: string) => {
    const file = path.join(dir, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  };

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'doty-skills-'));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('loads index, defaults and the chosen specialty in order', async () => {
    write('frontend/index.md', 'index');
    write('frontend/default/design.md', 'design');
    write('frontend/specialty/forms.md', 'forms');
    write('frontend/specialty/other.md', 'other');

    const skills = await loadSkillDirectory(
      readMarkdown,
      path.join(dir, 'frontend'),
      'forms',
    );

    expect(contents(skills)).toEqual(['index', 'design', 'forms']);
  });

  it('skips the specialty when none is chosen and empty files always', async () => {
    write('mode/index.md', '');
    write('mode/specialty/forms.md', 'forms');

    expect(
      await loadSkillDirectory(readMarkdown, path.join(dir, 'mode'), 'none'),
    ).toEqual([]);
  });

  it('is empty for a missing folder or file', async () => {
    expect(
      await loadSkillDirectory(readMarkdown, path.join(dir, 'x'), 'forms'),
    ).toEqual([]);
    expect(await loadSkillFile(readMarkdown, path.join(dir, 'x.md'))).toEqual(
      [],
    );
  });

  it('loads every project agent file', async () => {
    write('.agents/a.md', 'agent a');
    write('.agents/b.md', 'agent b');

    expect(contents(await loadProjectAgents(readMarkdown, dir))).toEqual([
      'agent a',
      'agent b',
    ]);
    expect(await loadProjectAgents(readMarkdown, undefined)).toEqual([]);
  });

  it('loads AGENTS.md from the project root when present', async () => {
    expect(await loadAgentsFile(readMarkdown, dir)).toEqual([]);

    write('AGENTS.md', 'use pnpm');

    expect(contents(await loadAgentsFile(readMarkdown, dir))).toEqual([
      'use pnpm',
    ]);
    expect(await loadAgentsFile(readMarkdown, undefined)).toEqual([]);
  });
});

describe('formatProjectMemory', () => {
  it('lists topics as JSON values', () => {
    expect(formatProjectMemory({ stack: 'nest', ports: [3000] })).toBe(
      '- stack: "nest"\n- ports: [3000]',
    );
  });

  it('is null without topics', () => {
    expect(formatProjectMemory({})).toBeNull();
    expect(formatProjectMemory(undefined)).toBeNull();
  });
});
