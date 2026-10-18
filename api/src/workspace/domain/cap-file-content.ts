/** Same budget as bash output (`MAX_OUTPUT_SIZE`). */
export const MAX_FILE_CONTENT_CHARS = 50_000;

function countLines(text: string): number {
  return text.split(/\r?\n/).length;
}

function isHighSurrogate(code: number): boolean {
  return code >= 0xd800 && code <= 0xdbff;
}

/** Cuts at the last line break before `max`, or mid-line without splitting a surrogate pair. */
function cutAt(content: string, max: number): string {
  const head = content.slice(0, max);
  const lastBreak = head.lastIndexOf('\n');
  if (lastBreak > 0) return head.slice(0, lastBreak);
  return isHighSurrogate(head.charCodeAt(head.length - 1))
    ? head.slice(0, -1)
    : head;
}

/**
 * Keeps a `read_file` result within the model's budget. Older turns are
 * truncated by the UI, but the latest turn is sent in full, so one large file
 * could fill the context window on its own.
 */
export function capFileContent(
  content: string,
  max = MAX_FILE_CONTENT_CHARS,
): string {
  if (content.length <= max) return content;

  const kept = cutAt(content, max);
  const shownLines = countLines(kept);
  const totalLines = countLines(content);
  return (
    `${kept}\n\n[truncated: showing ${shownLines} of ${totalLines} lines ` +
    `(${content.length} characters). Read the rest with lineStart/lineEnd.]`
  );
}
