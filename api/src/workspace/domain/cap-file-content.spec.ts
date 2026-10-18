import { capFileContent } from './cap-file-content';

describe('capFileContent', () => {
  it('returns content under the limit unchanged', () => {
    expect(capFileContent('a\nb', 10)).toBe('a\nb');
  });

  it('cuts at the last line break and says how to read the rest', () => {
    const content = 'line1\nline2\nline3\nline4';

    const capped = capFileContent(content, 14);

    expect(capped.startsWith('line1\nline2\n\n')).toBe(true);
    expect(capped).toContain('mostrando 2 de 4 linhas');
    expect(capped).toContain(`${content.length} caracteres`);
    expect(capped).toContain('lineStart/lineEnd');
  });

  it('cuts a single long line at the limit', () => {
    const capped = capFileContent('x'.repeat(30), 10);

    expect(capped.startsWith(`${'x'.repeat(10)}\n\n[truncado`)).toBe(true);
  });

  it('does not split a surrogate pair', () => {
    const capped = capFileContent('ab😀cd', 3);

    expect(capped.startsWith('ab\n\n[truncado')).toBe(true);
  });
});
