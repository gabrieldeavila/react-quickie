import { z } from 'zod/v4';
import type { InstructionInput } from './instruction.types';
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_INSTRUCTION_BYTES,
  MAX_NAME_LENGTH,
  MAX_STARTER_LENGTH,
  MAX_STARTERS,
} from './instruction-limits';

export class InvalidInstructionInputError extends Error {}

const inputSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(MAX_NAME_LENGTH),
  description: z.string().trim().max(MAX_DESCRIPTION_LENGTH).default(''),
  starters: z
    .array(z.string().trim().min(1).max(MAX_STARTER_LENGTH))
    .max(MAX_STARTERS)
    .default([]),
  content: z
    .string()
    .trim()
    .min(1, 'content is required')
    .refine(
      (text) => Buffer.byteLength(text, 'utf8') <= MAX_INSTRUCTION_BYTES,
      'content is longer than 20 KB',
    ),
});

function describeIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
    .join('; ');
}

/** A create/update request body → trimmed input. Throws `InvalidInstructionInputError`. */
export function validateInstructionInput(body: unknown): InstructionInput {
  const result = inputSchema.safeParse(body);
  if (!result.success) {
    throw new InvalidInstructionInputError(describeIssues(result.error));
  }
  return result.data;
}
