import { replaceUniqueBlock } from './replace-unique-block';

describe('replaceUniqueBlock', () => {
  it('replaces a block that occurs once and reports its line', () => {
    expect(replaceUniqueBlock('a\nb\nc\n', 'b\n', 'B\nB2\n')).toEqual({
      ok: true,
      content: 'a\nB\nB2\nc\n',
      line: 2,
    });
  });

  it('rejects an empty block', () => {
    expect(replaceUniqueBlock('abc', '', 'x')).toEqual({
      ok: false,
      reason: 'empty',
    });
  });

  it('rejects a missing block', () => {
    expect(replaceUniqueBlock('abc', 'z', 'x')).toEqual({
      ok: false,
      reason: 'not-found',
    });
  });

  it('rejects an ambiguous block with the occurrence count', () => {
    expect(replaceUniqueBlock('x y x y x', 'x', 'z')).toEqual({
      ok: false,
      reason: 'ambiguous',
      occurrences: 3,
    });
  });

  it('matches across CRLF/LF and keeps the file line ending', () => {
    const result = replaceUniqueBlock('a\r\nb\r\nc', 'a\nb', 'x\r\ny');

    expect(result).toEqual({ ok: true, content: 'x\r\ny\r\nc', line: 1 });
  });

  it('keeps $ patterns in the new code literal', () => {
    const result = replaceUniqueBlock(
      'const label = old;',
      'old',
      '`$${price}` + "$&" + "$1"',
    );

    expect(result).toMatchObject({
      content: 'const label = `$${price}` + "$&" + "$1";',
    });
  });
});
