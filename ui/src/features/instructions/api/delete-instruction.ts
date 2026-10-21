import type { InstructionScope } from "../domain/instruction.types";
import { requestInstructions } from "./request-instructions";

/** `DELETE /instructions/:scope/:id`: removes that scope's file. */
export async function deleteInstruction(
  root: string,
  scope: InstructionScope,
  id: string,
): Promise<void> {
  await requestInstructions(`/${scope}/${encodeURIComponent(id)}`, root, {
    method: "DELETE",
  });
}
