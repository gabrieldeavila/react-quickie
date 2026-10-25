import type { SystemModelMessage } from 'ai';
import path from 'path';
import { buildAgentIdentity } from './domain/build-agent-identity';
import { buildAutoModeNotice } from './domain/build-auto-mode-notice';
import { buildToolGuide } from './domain/build-tool-guide';
import { formatProjectMemory } from './domain/format-project-memory';
import {
  loadAgentsFile,
  loadProjectAgents,
  loadSkillFile,
  type ReadMarkdown,
} from './skill-loaders';

export type SystemPromptInput = {
  readMarkdown: ReadMarkdown;
  skillsDir: string;
  root?: string;
  toolsAvailable: boolean;
  /** The request's toolset; ignored when tools are unavailable. */
  toolNames: string[];
  /** One message per instruction the user selected. */
  selectedInstructions?: SystemModelMessage[];
  projectMemory?: Record<string, unknown>;
  /** Auto mode is on for this conversation. */
  autoApprove?: boolean;
  /** The per-request environment block (always last). */
  environment: SystemModelMessage;
};

function projectMemoryMessage(
  topics: Record<string, unknown> | undefined,
): SystemModelMessage[] {
  const memory = formatProjectMemory(topics);
  return memory
    ? [
        {
          role: 'system',
          content: `Project memory from the current workspace:\n${memory}`,
        },
      ]
    : [];
}

/**
 * The system prompt of a request. Static parts first and per-request parts
 * last, so provider prompt caching keeps working: identity, behavior, tool
 * guide, project instructions (`AGENTS.md`, `.agents/`), selected
 * instructions, memory rules, project memory, auto mode, environment.
 */
export async function loadSystemPrompt(
  input: SystemPromptInput,
): Promise<SystemModelMessage[]> {
  const { readMarkdown: read, skillsDir, root, toolsAvailable } = input;

  const groups: SystemModelMessage[][] = [
    [buildAgentIdentity({ toolsAvailable })],
    await loadSkillFile(read, path.join(skillsDir, 'behavior.md')),
    buildToolGuide(toolsAvailable ? input.toolNames : []),
    await loadAgentsFile(read, root),
    await loadProjectAgents(read, root),
    input.selectedInstructions ?? [],
    // The memory rules are about the `save_project_memory` tool.
    toolsAvailable
      ? await loadSkillFile(read, path.join(skillsDir, 'memory.md'))
      : [],
    projectMemoryMessage(input.projectMemory),
    buildAutoModeNotice(input.autoApprove === true, toolsAvailable),
    [input.environment],
  ];
  return groups.flat();
}
