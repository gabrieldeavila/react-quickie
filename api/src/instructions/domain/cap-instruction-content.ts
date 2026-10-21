import { MAX_INSTRUCTION_BYTES } from './instruction-limits';

export const TRUNCATION_NOTICE =
  '[Instruction truncated: it is longer than the 20 KB limit.]';

/** A body over the limit (e.g. edited by hand) is cut and marked as truncated. */
export function capInstructionContent(
  content: string,
  maxBytes = MAX_INSTRUCTION_BYTES,
): string {
  const bytes = Buffer.from(content, 'utf8');
  if (bytes.length <= maxBytes) return content;

  // Decoding a cut buffer may end in a partial character; drop it.
  const cut = bytes.subarray(0, maxBytes).toString('utf8').replace(/�$/, '');
  return `${cut.trimEnd()}\n\n${TRUNCATION_NOTICE}`;
}
