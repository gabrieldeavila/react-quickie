import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { writeFileAtomic } from './write-file-atomic';

describe('writeFileAtomic', () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'doty-atomic-'));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('creates missing folders and leaves no temp file behind', async () => {
    const file = path.join(dir, 'a', 'b', 'x.json');

    await writeFileAtomic(file, '{}\n');

    expect(fs.readFileSync(file, 'utf8')).toBe('{}\n');
    expect(fs.readdirSync(path.dirname(file))).toEqual(['x.json']);
  });

  it('replaces an existing file and applies the mode', async () => {
    const file = path.join(dir, 'secret.json');
    fs.writeFileSync(file, 'old');

    await writeFileAtomic(file, 'new', 0o600);

    expect(fs.readFileSync(file, 'utf8')).toBe('new');
    expect(fs.statSync(file).mode & 0o777).toBe(0o600);
  });
});
