import type { Instruction } from './instruction.types';

export type InstructionView = Omit<Instruction, 'content'> & {
  /** Built-ins are read-only: "editing" one saves a copy with the same id. */
  editable: boolean;
};

export type InstructionDetailView = InstructionView & { content: string };

/** The list entry the UI gets (no body, to keep the list small). */
export function toInstructionView(instruction: Instruction): InstructionView {
  const { id, name, description, starters, source } = instruction;
  return {
    id,
    name,
    description,
    starters,
    source,
    editable: source !== 'built-in',
  };
}

/** One instruction with its body. */
export function toInstructionDetailView(
  instruction: Instruction,
): InstructionDetailView {
  return { ...toInstructionView(instruction), content: instruction.content };
}
