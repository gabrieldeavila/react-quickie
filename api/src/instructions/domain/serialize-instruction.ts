import matter from 'gray-matter';
import type { InstructionInput } from './instruction.types';

/** Input → the Markdown file written to disk (frontmatter + body). */
export function serializeInstruction({
  name,
  description,
  starters,
  content,
}: InstructionInput): string {
  const frontmatter: Record<string, unknown> = { name };
  if (description) frontmatter.description = description;
  if (starters.length) frontmatter.starters = starters;
  return matter.stringify(`${content}\n`, frontmatter);
}
