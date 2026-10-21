import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { readMarkdownBody } from './read-markdown-body';

describe('readMarkdownBody', () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'doty-md-'));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('returns the Markdown without frontmatter, not HTML', async () => {
    const file = path.join(dir, 'a.md');
    fs.writeFileSync(file, '---\nname: a\n---\n\n# Title\n\n- `code`\n');

    expect(await readMarkdownBody(file)).toBe('# Title\n\n- `code`');
  });

  it('keeps a file without frontmatter as is', async () => {
    const file = path.join(dir, 'b.md');
    fs.writeFileSync(file, 'Use pnpm.\n');

    expect(await readMarkdownBody(file)).toBe('Use pnpm.');
  });

  it('returns an empty string for a missing file', async () => {
    expect(await readMarkdownBody(path.join(dir, 'nope.md'))).toBe('');
  });
});
