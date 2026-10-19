/** Where an instruction comes from; later sources override earlier ones. */
export type InstructionSource = 'built-in' | 'global' | 'project';

/** The scopes users can write to (built-ins are read-only). */
export type InstructionScope = Exclude<InstructionSource, 'built-in'>;

export const INSTRUCTION_SCOPES: InstructionScope[] = ['global', 'project'];

/** Guidance the user attaches to a conversation, from a Markdown file. */
export type Instruction = {
  /** The file name without `.md`. */
  id: string;
  name: string;
  description: string;
  /** Starter prompts the UI offers when the instruction is selected. */
  starters: string[];
  /** The Markdown body. */
  content: string;
  source: InstructionSource;
};

/** What a user sends to create or update an instruction. */
export type InstructionInput = Pick<
  Instruction,
  'name' | 'description' | 'starters' | 'content'
>;
