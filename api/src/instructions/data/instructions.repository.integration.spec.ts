import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { WorkspaceService } from 'src/workspace/data/workspace.service';
import { InstructionsRepository } from './instructions.repository';

const input = (name: string, content = `${name} body`) => ({
  name,
  description: '',
  starters: [],
  content,
});

describe('InstructionsRepository (temp dirs)', () => {
  let tmp: string;
  let root: string;
  let builtinDir: string;
  let repository: InstructionsRepository;
  const savedEnv = { ...process.env };

  const write = (file: string, content: string) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  };

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'doty-instructions-'));
    root = path.join(tmp, 'project');
    fs.mkdirSync(root);
    // getAppPaths reads these on every call.
    process.env.DOTY_API_BASE_DIR = path.join(tmp, 'api-dist');
    process.env.DOTY_DATA_DIR = path.join(tmp, 'data');
    builtinDir = path.join(tmp, 'api-dist', 'instructions', 'builtin');

    write(
      path.join(builtinDir, 'forms.md'),
      '---\nname: Forms\n---\nBuilt-in forms.',
    );
    write(
      path.join(builtinDir, 'refactoring.md'),
      '---\nname: Refactoring\n---\nRefactor.',
    );
    write(path.join(builtinDir, 'Not_Valid.md'), 'skipped: bad id');
    write(path.join(builtinDir, 'notes.txt'), 'skipped: not markdown');

    const workspace = {
      resolveIn: (base: string, relative: string) =>
        path.resolve(base, relative),
    } as unknown as WorkspaceService;
    repository = new InstructionsRepository(workspace);
  });

  afterEach(() => {
    process.env = { ...savedEnv };
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  const sources = async (projectRoot?: string) =>
    (await repository.list(projectRoot)).map(
      ({ id, source }) => `${id}:${source}`,
    );

  it('lists built-ins and skips files that are not valid instructions', async () => {
    expect(await sources()).toEqual(['forms:built-in', 'refactoring:built-in']);
  });

  it('writes global and project files that override the built-in', async () => {
    await repository.write('global', 'forms', input('Forms (mine)'), root);
    expect(await sources(root)).toEqual([
      'forms:global',
      'refactoring:built-in',
    ]);

    await repository.write('project', 'forms', input('Forms (team)'), root);
    await repository.write('project', 'api', input('API conventions'), root);
    expect(await sources(root)).toEqual([
      'api:project',
      'forms:project',
      'refactoring:built-in',
    ]);
    expect(
      fs.existsSync(path.join(root, '.doty', 'instructions', 'api.md')),
    ).toBe(true);

    // Without a root the project scope isn't read.
    expect(await sources()).toEqual(['forms:global', 'refactoring:built-in']);
  });

  it('picks up edits made outside Doty', async () => {
    await repository.write('global', 'notes', input('Notes', 'first'), root);
    expect((await repository.get('notes'))?.content).toBe('first');

    const file = path.join(tmp, 'data', 'instructions', 'notes.md');
    write(file, '---\nname: Notes\n---\nsecond, longer');
    expect((await repository.get('notes'))?.content).toBe('second, longer');
  });

  it('removes a scope file and falls back to the next source', async () => {
    await repository.write('global', 'forms', input('Forms (mine)'), root);

    expect(await repository.remove('global', 'forms', root)).toBe(true);
    expect(await repository.remove('global', 'forms', root)).toBe(false);
    expect((await repository.get('forms'))?.source).toBe('built-in');
  });

  it('refuses ids that could leave the folder and project writes without a root', async () => {
    await expect(
      repository.write('global', '../escape', input('X'), root),
    ).rejects.toThrow(/Invalid instruction id/);
    await expect(repository.write('project', 'x', input('X'))).rejects.toThrow(
      /project root/,
    );
  });
});
