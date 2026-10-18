import type { UIMessage } from 'ai';

const MAX_TOOL_INPUT = 500;
const MAX_TOOL_OUTPUT = 1_500;

type AnyPart = UIMessage['parts'][number] & Record<string, unknown>;

function clip(value: unknown, max: number): string {
  const text =
    typeof value === 'string' ? value : (JSON.stringify(value) ?? '');
  return text.length <= max ? text : `${text.slice(0, max)}… [cut]`;
}

function toolName(part: AnyPart): string {
  if (part.type === 'dynamic-tool') return String(part.toolName);
  return part.type.slice('tool-'.length);
}

function toolResult(part: AnyPart): string {
  switch (part.state) {
    case 'output-available':
      return clip(part.output, MAX_TOOL_OUTPUT);
    case 'output-error':
      return `error: ${clip(part.errorText, MAX_TOOL_OUTPUT)}`;
    case 'output-denied':
      return 'denied by the user';
    default:
      return 'no result';
  }
}

function renderPart(part: AnyPart): string | undefined {
  if (part.type === 'text') return String(part.text);
  if (part.type === 'file') return '[image]';
  if (part.type === 'dynamic-tool' || part.type.startsWith('tool-')) {
    const input = clip(part.input, MAX_TOOL_INPUT);
    return `[tool ${toolName(part)}(${input}) → ${toolResult(part)}]`;
  }
  return undefined; // reasoning, step-start, data-*
}

const SPEAKER: Record<UIMessage['role'], string> = {
  user: 'User',
  assistant: 'Assistant',
  system: 'System',
};

/**
 * Plain-text transcript for the summary model. Tool calls become one line
 * each (clipped), so the summarizer needs no tool definitions.
 */
export function renderTranscript(messages: UIMessage[]): string {
  return messages
    .flatMap((message) => {
      const lines = (message.parts as AnyPart[]).flatMap((part) => {
        const line = renderPart(part);
        return line ? [line] : [];
      });
      return lines.length > 0
        ? [`${SPEAKER[message.role]}:\n${lines.join('\n')}`]
        : [];
    })
    .join('\n\n');
}
