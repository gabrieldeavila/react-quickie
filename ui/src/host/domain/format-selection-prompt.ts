import type { InsertSelectionMessage } from "./host-messages";

function formatLineRange(startLine: number, endLine: number): string {
  return startLine === endLine ? `${startLine}` : `${startLine}-${endLine}`;
}

/** Composer text for "Doty: Ask about selection": file, lines and code. */
export function formatSelectionPrompt(
  selection: Omit<InsertSelectionMessage, "type">,
): string {
  const range = formatLineRange(selection.startLine, selection.endLine);
  const fence = selection.text.includes("```") ? "````" : "```";

  return [
    `\`${selection.file}:${range}\``,
    `${fence}${selection.languageId}`,
    selection.text.replace(/\n+$/, ""),
    fence,
    "",
  ].join("\n");
}

/** Appends to whatever the user already typed, separated by a blank line. */
export function appendToComposer(current: string, addition: string): string {
  if (!current.trim()) return addition;
  return `${current.replace(/\s+$/, "")}\n\n${addition}`;
}
