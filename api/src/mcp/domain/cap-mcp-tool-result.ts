/** Same budget as bash output (`MAX_OUTPUT_SIZE`). */
export const MAX_MCP_RESULT_CHARS = 50_000;

type ContentPart = { type: string; text?: unknown; [key: string]: unknown };

type CappedFlags = { truncated: true; originalSize: number };

type CallToolResultLike = {
  content: ContentPart[];
  structuredContent?: unknown;
  [key: string]: unknown;
};

function isCallToolResult(value: unknown): value is CallToolResultLike {
  return (
    !!value &&
    typeof value === 'object' &&
    Array.isArray((value as { content?: unknown }).content)
  );
}

function textOf(part: ContentPart): string {
  return typeof part.text === 'string' ? part.text : '';
}

/**
 * Chars a part costs the model. Images go to the model as files, so they
 * don't count against a text budget; other non-text parts are sent as JSON.
 */
function partSize(part: ContentPart): number {
  if (part.type === 'text') return textOf(part).length;
  if (part.type === 'image') return 0;
  return JSON.stringify(part).length;
}

function truncationNotice(shown: number, total: number): ContentPart {
  return {
    type: 'text',
    text: `\n[output truncated: ${shown} of ${total} characters]`,
  };
}

function capContent(result: CallToolResultLike, max: number) {
  const parts: ContentPart[] = [];
  let used = 0;

  for (const part of result.content) {
    const size = partSize(part);
    if (used + size <= max) {
      parts.push(part);
      used += size;
      continue;
    }
    const room = max - used;
    if (part.type === 'text' && room > 0) {
      parts.push({ ...part, text: textOf(part).slice(0, room) });
      used = max;
    }
  }
  return { parts, used };
}

function capCallToolResult(
  result: CallToolResultLike,
  max: number,
): CallToolResultLike | (CallToolResultLike & CappedFlags) {
  const total = result.content.reduce((sum, part) => sum + partSize(part), 0);
  if (total <= max) return result;

  const { parts, used } = capContent(result, max);
  // The model never sees structuredContent (only `content`), and it usually
  // repeats the text, so it's dropped instead of trimmed.
  const rest: Record<string, unknown> = { ...result };
  delete rest.structuredContent;
  return {
    ...rest,
    content: [...parts, truncationNotice(used, total)],
    truncated: true,
    originalSize: total,
  };
}

/**
 * Caps an MCP tool result for the current turn (Phase 1 truncation only
 * covers older turns). Keeps the `CallToolResult` shape, because the SDK's
 * `toModelOutput` for MCP tools reads `content`.
 */
export function capMcpToolResult(
  output: unknown,
  max = MAX_MCP_RESULT_CHARS,
): unknown {
  if (isCallToolResult(output)) return capCallToolResult(output, max);

  // Tools with an outputSchema return their structured value directly.
  const serialized = JSON.stringify(output) ?? '';
  if (serialized.length <= max) return output;
  return {
    truncated: true,
    preview: serialized.slice(0, max),
    originalSize: serialized.length,
  };
}
