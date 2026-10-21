import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { ToolExecutionOptions } from 'ai';
import type { WorkspaceService } from 'src/workspace/data/workspace.service';
import { InstructionToolsService } from './instruction-tools.service';
import { InstructionsRepository } from './instructions.repository';

const options: ToolExecutionOptions<unknown> = {
  toolCallId: 'call',
  messages: [],
  context: undefined,
};

describe('InstructionToolsService (temp dirs)', () => {
  let tmp: string;
  let root: string;
  let service: InstructionToolsService;
  const savedEnv = { ...process.env };

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'doty-instruction-tools-'));
    root = path.join(tmp, 'project');
    fs.mkdirSync(root);
    process.env.DOTY_API_BASE_DIR = path.join(tmp, 'api-dist');
    process.env.DOTY_DATA_DIR = path.join(tmp, 'data');

    const workspace = {
      resolveIn: (base: string, relative: string) =>
        path.resolve(base, relative),
    } as unknown as WorkspaceService;
    service = new InstructionToolsService(
      new InstructionsRepository(workspace),
    );
  });

  afterEach(() => {
    process.env = { ...savedEnv };
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  const save = (input: Record<string, unknown>) =>
    service.createToolkit(root).tools.save_instruction.execute!(
      input,
      options,
    ) as Promise<{
      success: boolean;
      message: string;
    }>;

  const projectFile = (id: string) =>
    path.join(root, '.doty', 'instructions', `${id}.md`);

  it('creates a project instruction with an id from its name', async () => {
    const result = await save({
      name: 'API Conventions',
      description: 'REST rules',
      content: 'Use plural nouns.',
    });

    expect(result).toMatchObject({ success: true });
    expect(fs.readFileSync(projectFile('api-conventions'), 'utf8')).toContain(
      'Use plural nouns.',
    );
  });

  it('refuses to overwrite unless replace is set', async () => {
    await save({ name: 'Forms', content: 'v1' });

    const refused = await save({ name: 'Forms', content: 'v2' });
    expect(refused).toMatchObject({ success: false });
    expect(fs.readFileSync(projectFile('forms'), 'utf8')).toContain('v1');

    const replaced = await save({
      name: 'Forms',
      content: 'v2',
      replace: true,
    });
    expect(replaced).toMatchObject({ success: true });
    expect(fs.readFileSync(projectFile('forms'), 'utf8')).toContain('v2');
  });

  it('lists and reads what it saved', async () => {
    await save({ name: 'Forms', content: 'Validate on blur.' });
    const { tools } = service.createToolkit(root);

    const list = (await tools.list_instructions.execute!({}, options)) as {
      data: { id: string }[];
    };
    expect(list.data.map(({ id }) => id)).toContain('forms');

    const read = (await tools.read_instruction.execute!(
      { id: 'forms' },
      options,
    )) as { data: { content: string } };
    expect(read.data.content).toBe('Validate on blur.');
  });
});
