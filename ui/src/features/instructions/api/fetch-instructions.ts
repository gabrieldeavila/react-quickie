import type { InstructionSummary } from "../domain/instruction.types";
import { requestInstructions } from "./request-instructions";

/** `GET /instructions?root=`: every instruction, without bodies. */
export async function fetchInstructions(
  root: string,
  signal?: AbortSignal,
): Promise<InstructionSummary[]> {
  const response = await requestInstructions("", root, { signal });
  const body = (await response.json()) as {
    instructions: InstructionSummary[];
  };
  return body.instructions;
}
