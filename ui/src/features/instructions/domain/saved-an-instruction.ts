import type { UIMessage } from "ai";

const SAVE_PART_TYPE = "tool-save_instruction";

function isSuccessfulOutput(output: unknown): boolean {
  return (
    typeof output === "object" &&
    output !== null &&
    (output as { success?: unknown }).success === true
  );
}

/** Whether the agent saved an instruction in this message (so the list is stale). */
export function savedAnInstruction(message: UIMessage): boolean {
  return message.parts.some(
    (part) =>
      part.type === SAVE_PART_TYPE &&
      "state" in part &&
      part.state === "output-available" &&
      isSuccessfulOutput((part as { output?: unknown }).output),
  );
}
