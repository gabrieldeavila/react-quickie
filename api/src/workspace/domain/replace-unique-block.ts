export type ReplaceBlockResult =
  | { ok: true; content: string; line: number }
  | { ok: false; reason: 'empty' }
  | { ok: false; reason: 'not-found' }
  | { ok: false; reason: 'ambiguous'; occurrences: number };

const toLf = (text: string) => text.replace(/\r\n/g, '\n');

function countOccurrences(content: string, block: string): number {
  let occurrences = 0;
  let index = content.indexOf(block);
  while (index !== -1) {
    occurrences++;
    index = content.indexOf(block, index + block.length);
  }
  return occurrences;
}

/**
 * Replaces `oldBlock` in `content` only when it occurs exactly once, so an
 * edit never lands in the wrong place. Matching ignores CRLF vs LF, and the
 * result keeps the file's own line ending. `line` is where the block started.
 */
export function replaceUniqueBlock(
  rawContent: string,
  oldBlock: string,
  newBlock: string,
): ReplaceBlockResult {
  if (!oldBlock) return { ok: false, reason: 'empty' };

  const lineEnding = rawContent.includes('\r\n') ? '\r\n' : '\n';
  const content = toLf(rawContent);
  const target = toLf(oldBlock);

  const occurrences = countOccurrences(content, target);
  if (occurrences === 0) return { ok: false, reason: 'not-found' };
  if (occurrences > 1) return { ok: false, reason: 'ambiguous', occurrences };

  const start = content.indexOf(target);
  // Sliced, not `String.replace`: that would expand `$$`, `$&`, `$1` in the
  // new code (e.g. a template literal like `$${price}`).
  const updated =
    content.slice(0, start) +
    toLf(newBlock) +
    content.slice(start + target.length);
  return {
    ok: true,
    content: updated.replace(/\n/g, lineEnding),
    line: content.slice(0, start).split('\n').length,
  };
}
