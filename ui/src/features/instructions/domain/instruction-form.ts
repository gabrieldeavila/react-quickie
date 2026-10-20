import { isValidInstructionId } from "./instruction-id";
import type {
  InstructionDetail,
  InstructionInput,
  InstructionScope,
} from "./instruction.types";

/** Same limits as the API. */
export const MAX_CONTENT_BYTES = 20 * 1024;
export const MAX_STARTERS = 10;

export type InstructionFormValues = {
  name: string;
  id: string;
  description: string;
  /** One starter prompt per line. */
  startersText: string;
  content: string;
  scope: InstructionScope;
};

export type InstructionFormErrors = Partial<
  Record<"name" | "id" | "content" | "starters", string>
>;

export function emptyInstructionForm(
  scope: InstructionScope = "global",
): InstructionFormValues {
  return {
    name: "",
    id: "",
    description: "",
    startersText: "",
    content: "",
    scope,
  };
}

/**
 * Form for editing an instruction. A built-in can't be changed in place, so
 * editing it starts a global copy with the same id (which then overrides it).
 */
export function formForEdit(detail: InstructionDetail): InstructionFormValues {
  return {
    name: detail.name,
    id: detail.id,
    description: detail.description,
    startersText: detail.starters.join("\n"),
    content: detail.content,
    scope: detail.source === "built-in" ? "global" : detail.source,
  };
}

/** Form for a new instruction that starts from an existing one. */
export function formForDuplicate(
  detail: InstructionDetail,
): InstructionFormValues {
  return {
    ...formForEdit(detail),
    name: `${detail.name} (copy)`,
    id: `${detail.id}-copy`.slice(0, 64),
  };
}

function parseStarters(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function validateInstructionForm(
  values: InstructionFormValues,
): InstructionFormErrors {
  const errors: InstructionFormErrors = {};
  if (!values.name.trim()) errors.name = "Give it a name.";
  if (!isValidInstructionId(values.id)) {
    errors.id = "Use lowercase letters, digits and dashes (up to 64).";
  }
  if (!values.content.trim()) errors.content = "Write the instruction.";
  else if (new TextEncoder().encode(values.content).length > MAX_CONTENT_BYTES) {
    errors.content = "Keep it under 20 KB.";
  }
  if (parseStarters(values.startersText).length > MAX_STARTERS) {
    errors.starters = `At most ${MAX_STARTERS} starter prompts.`;
  }
  return errors;
}

export function hasFormErrors(errors: InstructionFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** The `PUT` body for the form. */
export function formToInput(values: InstructionFormValues): InstructionInput {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    starters: parseStarters(values.startersText),
    content: values.content.trim(),
  };
}
