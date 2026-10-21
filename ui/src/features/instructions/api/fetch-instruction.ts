import type { InstructionDetail } from "../domain/instruction.types";
import { requestInstructions } from "./request-instructions";

/** `GET /instructions/:id?root=`: one instruction with its body. */
export async function fetchInstruction(
  root: string,
  id: string,
): Promise<InstructionDetail> {
  const response = await requestInstructions(
    `/${encodeURIComponent(id)}`,
    root,
  );
  return (await response.json()) as InstructionDetail;
}
