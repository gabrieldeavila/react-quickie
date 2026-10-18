import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { copyLegacyMemory } from './copy-legacy-memory';

describe('copyLegacyMemory', () => {
  let sandbox: string;
  let legacyDir: string;
  let targetDir: string;

  beforeEach(() => {
    sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'doty-memory-'));
    legacyDir = path.join(sandbox, 'api', 'storage', 'memory');
    targetDir = path.join(sandbox, '.doty', 'memory');
  });

  afterEach(() => {
    fs.rmSync(sandbox, { recursive: true, force: true });
  });

  it('copies the legacy folder and leaves it in place', async () => {
    fs.mkdirSync(legacyDir, { recursive: true });
    fs.writeFileSync(path.join(legacyDir, 'abc_app.json'), '{}');

    await expect(copyLegacyMemory(legacyDir, targetDir)).resolves.toBe(true);

    expect(fs.existsSync(path.join(targetDir, 'abc_app.json'))).toBe(true);
    expect(fs.existsSync(path.join(legacyDir, 'abc_app.json'))).toBe(true);
  });

  it('does nothing when the new folder already exists', async () => {
    fs.mkdirSync(legacyDir, { recursive: true });
    fs.writeFileSync(path.join(legacyDir, 'abc_app.json'), '{}');
    fs.mkdirSync(targetDir, { recursive: true });

    await expect(copyLegacyMemory(legacyDir, targetDir)).resolves.toBe(false);
    expect(fs.readdirSync(targetDir)).toEqual([]);
  });

  it('does nothing when there is no legacy folder', async () => {
    await expect(copyLegacyMemory(legacyDir, targetDir)).resolves.toBe(false);
    expect(fs.existsSync(targetDir)).toBe(false);
  });
});
