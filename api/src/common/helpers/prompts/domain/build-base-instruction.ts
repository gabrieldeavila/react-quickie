import type { SystemModelMessage } from 'ai';

/** Kept in code so it holds even when `behavior.md` is missing or replaced. */
export const REPLY_LANGUAGE_RULE =
  "Reply in the user's language: answer in the language of the user's latest message, even though these instructions are in English.";

/** First system message of every request: the workspace and the reply language. */
export function buildBaseInstruction(
  root: string | undefined,
): SystemModelMessage {
  return {
    role: 'system',
    content: `The user project is ${root}\n\n${REPLY_LANGUAGE_RULE}`,
  };
}
