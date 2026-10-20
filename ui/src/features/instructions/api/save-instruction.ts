import type {
  InstructionDetail,
  InstructionInput,
  InstructionScope,
} from "../domain/instruction.types";
import { requestInstructions } from "./request-instructions";

/** `PUT /instructions/:scope/:id`: creates or replaces the scope's file. */
export async function saveInstruction(
  root: string,
  scope: InstructionScope,
  id: string,
  input: InstructionInput,
): Promise<InstructionDetail> {
  const response = await requestInstructions(
    `/${scope}/${encodeURIComponent(id)}`,
    root,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return (await response.json()) as InstructionDetail;
}
