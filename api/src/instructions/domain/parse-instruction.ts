import matter from 'gray-matter';
import { capInstructionContent } from './cap-instruction-content';
import type { Instruction, InstructionSource } from './instruction.types';

export class InvalidInstructionError extends Error {}

function readText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Non-string or blank entries are dropped; anything but a list is empty. */
function readStarters(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(readText).filter(Boolean);
}

/**
 * Markdown with frontmatter → instruction. Lenient: a missing name falls back
 * to the id, bad `starters` are dropped, an oversized body is truncated.
 * Throws `InvalidInstructionError` only when the frontmatter can't be parsed.
 */
export function parseInstruction(
  raw: string,
  id: string,
  source: InstructionSource,
): Instruction {
  let parsed: matter.GrayMatterFile<string>;
  try {
    // A fresh options object: gray-matter caches results by input otherwise.
    parsed = matter(raw, {});
  } catch (error) {
    throw new InvalidInstructionError(
      `invalid frontmatter: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const data = parsed.data as Record<string, unknown>;
  return {
    id,
    name: readText(data.name) || id,
    description: readText(data.description),
    starters: readStarters(data.starters),
    content: capInstructionContent(parsed.content.trim()),
    source,
  };
}
