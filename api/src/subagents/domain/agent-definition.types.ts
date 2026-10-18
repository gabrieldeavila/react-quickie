export type AgentSource = 'built-in' | 'project';

/** A subagent type, parsed from a Markdown file with frontmatter. */
export type AgentDefinition = {
  name: string;
  description: string;
  /** Tool names or globs (`mcp__github__*`) the agent may use. */
  tools: string[];
  /** `provider:model`; undefined means inherit (`model: inherit` or omitted). */
  model?: string;
  maxSteps: number;
  /** Write-capable agents need the user's approval at delegation time. */
  writes: boolean;
  /** The Markdown body: the agent's system prompt. */
  instructions: string;
  source: AgentSource;
};
