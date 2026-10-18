import matter from 'gray-matter';
import { z } from 'zod/v4';
import type { AgentDefinition, AgentSource } from './agent-definition.types';

export const DEFAULT_MAX_STEPS = 15;
const MAX_STEPS_LIMIT = 50;

export class InvalidAgentDefinitionError extends Error {}

const frontmatterSchema = z.object({
  name: z
    .string()
    .regex(
      /^[a-z0-9][a-z0-9_-]{0,63}$/,
      'name must be lowercase letters, digits, "-" or "_"',
    ),
  description: z.string().trim().min(1),
  tools: z.array(z.string().trim().min(1)).default([]),
  model: z.string().trim().min(1).optional(),
  maxSteps: z
    .number()
    .int()
    .positive()
    .max(MAX_STEPS_LIMIT)
    .default(DEFAULT_MAX_STEPS),
  writes: z.boolean().default(false),
});

function describeIssues(error: z.ZodError): string {
  return error.issues
    .map(
      (issue) => `${issue.path.join('.') || 'frontmatter'}: ${issue.message}`,
    )
    .join('; ');
}

/** Markdown with frontmatter → agent definition. Throws `InvalidAgentDefinitionError`. */
export function parseAgentDefinition(
  raw: string,
  source: AgentSource,
): AgentDefinition {
  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(raw);
  } catch (error) {
    throw new InvalidAgentDefinitionError(
      `invalid frontmatter: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const result = frontmatterSchema.safeParse(parsed.data);
  if (!result.success) {
    throw new InvalidAgentDefinitionError(describeIssues(result.error));
  }

  const instructions = parsed.content.trim();
  if (!instructions) {
    throw new InvalidAgentDefinitionError('the prompt body is empty');
  }

  const { model, ...frontmatter } = result.data;
  return {
    ...frontmatter,
    model: model === 'inherit' ? undefined : model,
    instructions,
    source,
  };
}
