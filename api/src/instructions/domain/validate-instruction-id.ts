const INSTRUCTION_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;

/** Lowercase letters, digits and dashes, 1–64 characters; doubles as the file name. */
export function isValidInstructionId(id: string): boolean {
  return INSTRUCTION_ID.test(id);
}
