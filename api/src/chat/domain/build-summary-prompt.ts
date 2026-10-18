import type { Instructions, SystemModelMessage, UIMessage } from 'ai';
import { toSystemMessages } from 'src/llm/domain/to-system-messages';
import { renderTranscript } from './render-transcript';

const SUMMARIZER_INSTRUCTIONS = `You compress the earlier part of a conversation between a user and a coding agent so the agent can continue without it.
Write a concise summary in the conversation's language. Keep:
- the user's goals, decisions and constraints;
- files read, created or changed (with paths) and what changed;
- commands run and their important results or errors;
- open questions and the next planned steps.
Leave out greetings, repeated content and full file contents. Output only the summary.`;

export type SummaryPrompt = { instructions: string; prompt: string };

/** Prompt for the summary model; an earlier summary is folded in. */
export function buildSummaryPrompt(
  older: UIMessage[],
  previousSummary?: string,
): SummaryPrompt {
  const sections = [
    previousSummary
      ? `Summary of the conversation before this part:\n${previousSummary}`
      : undefined,
    `Conversation:\n${renderTranscript(older)}`,
  ].filter(Boolean);

  return {
    instructions: SUMMARIZER_INSTRUCTIONS,
    prompt: sections.join('\n\n'),
  };
}

/** How the summary is given to the chat model in later requests. */
export function toSummaryInstruction(summary: string): SystemModelMessage {
  return {
    role: 'system',
    content: `Older messages of this conversation were removed to fit the context window. Summary of them:\n\n${summary}`,
  };
}

/** The chat instructions, plus the summary (if any) as the last one. */
export function withSummaryInstruction(
  instructions: Instructions,
  summary: string | undefined,
): Instructions {
  if (!summary) return instructions;
  return [...toSystemMessages(instructions), toSummaryInstruction(summary)];
}
