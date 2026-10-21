/** A clickable suggestion on the empty state: a short label and the message it fills in. */
export type StarterPrompt = { label: string; text: string };

export const MAX_STARTER_PROMPTS = 4;
const MAX_LABEL_LENGTH = 40;

/** Shown when no selected instruction brings its own starters. */
export const DEFAULT_STARTER_PROMPTS: StarterPrompt[] = [
  {
    label: "Explain this project",
    text: "Explain how this project is organized and where the main entry points are.",
  },
  {
    label: "Find bugs",
    text: "Review this code and point out bugs or risky spots: ",
  },
  {
    label: "Write tests",
    text: "Write unit tests for the main business rules in this project.",
  },
  {
    label: "Summarize changes",
    text: "Summarize the uncommitted changes in this repository.",
  },
];

/** A long starter keeps its full text but gets a shortened label. */
export function toStarterPrompt(text: string): StarterPrompt {
  const label =
    text.length > MAX_LABEL_LENGTH
      ? `${text.slice(0, MAX_LABEL_LENGTH - 1).trimEnd()}…`
      : text;
  return { label, text };
}

/**
 * Starters of the selected instructions, in selection order, without
 * duplicates and capped; the default set when they bring none.
 */
export function starterPromptsFor(
  selected: Array<{ starters: string[] }>,
): StarterPrompt[] {
  const texts = [...new Set(selected.flatMap((item) => item.starters))];
  if (texts.length === 0) return DEFAULT_STARTER_PROMPTS;
  return texts.slice(0, MAX_STARTER_PROMPTS).map(toStarterPrompt);
}
