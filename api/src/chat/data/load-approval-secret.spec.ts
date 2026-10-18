import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  APPROVAL_SECRET_FILE,
  loadApprovalSecret,
} from './load-approval-secret';

describe('loadApprovalSecret', () => {
  let storageDir: string;

  beforeEach(async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'doty-secret-'));
    storageDir = path.join(tmp, 'nested', 'data');
  });

  it('prefers DOTY_APPROVAL_SECRET and writes nothing', async () => {
    await expect(
      loadApprovalSecret({ envSecret: '  from-env  ', storageDir }),
    ).resolves.toBe('from-env');
    await expect(fs.stat(storageDir)).rejects.toThrow();
  });

  it('creates a 600 secret file once and reuses it', async () => {
    const first = await loadApprovalSecret({ storageDir });
    const second = await loadApprovalSecret({ envSecret: '', storageDir });
    const stat = await fs.stat(path.join(storageDir, APPROVAL_SECRET_FILE));

    expect(first).toMatch(/^[0-9a-f]{64}$/);
    expect(second).toBe(first);
    expect(stat.mode & 0o777).toBe(0o600);
  });

  it('agrees on one secret when started concurrently', async () => {
    const secrets = await Promise.all(
      Array.from({ length: 5 }, () => loadApprovalSecret({ storageDir })),
    );

    expect(new Set(secrets).size).toBe(1);
  });
});
