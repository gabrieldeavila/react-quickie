import type { ModelMessage, UserModelMessage } from 'ai';

const MAX_MESSAGES = 10;
const MAX_CHARS = 24_000;

function textOf(message: UserModelMessage): string {
  if (typeof message.content === 'string') return message.content.trim();
  return message.content
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('\n')
    .trim();
}

/**
 * The text of the user's own messages, oldest first: the last few, cut to a
 * size cap from the oldest. Tool results, files and the agent's replies are
 * left out, so text the agent read somewhere can't pass as a request.
 */
export function collectUserRequests(messages: ModelMessage[]): string[] {
  const texts = messages
    .filter((message): message is UserModelMessage => message.role === 'user')
    .map(textOf)
    .filter((text) => text.length > 0)
    .slice(-MAX_MESSAGES);

  const kept: string[] = [];
  let size = 0;
  for (const text of texts.reverse()) {
    if (size + text.length > MAX_CHARS) {
      if (kept.length === 0) kept.push(text.slice(-MAX_CHARS));
      break;
    }
    kept.push(text);
    size += text.length;
  }
  return kept.reverse();
}
