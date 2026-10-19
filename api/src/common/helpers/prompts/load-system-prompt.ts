import type { SystemModelMessage } from 'ai';
import path from 'path';
import { buildAgentIdentity } from './domain/build-agent-identity';
import { buildToolGuide } from './domain/build-tool-guide';
import { formatProjectMemory } from './domain/format-project-memory';
import {
  loadAgentsFile,
  loadProjectAgents,
  loadSkillDirectory,
  loadSkillFile,
  type ReadMarkdown,
} from './skill-loaders';

export type SystemPromptInput = {
  readMarkdown: ReadMarkdown;
  skillsDir: string;
  pluginSkillsDir: string;
  root?: string;
  mode?: string;
  specialty?: string;
  toolsAvailable: boolean;
  /** The request's toolset; ignored when tools are unavailable. */
  toolNames: string[];
  projectMemory?: Record<string, unknown>;
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
 * guide, project instructions (`AGENTS.md`, `.agents/`), mode skills, memory
 * rules, project memory, environment.
 */
export async function loadSystemPrompt(
  input: SystemPromptInput,
): Promise<SystemModelMessage[]> {
  const { readMarkdown: read, skillsDir, root, toolsAvailable } = input;
  const modeDir = `${input.mode}`;

  const groups: SystemModelMessage[][] = [
    [buildAgentIdentity({ toolsAvailable })],
    await loadSkillFile(read, path.join(skillsDir, 'behavior.md')),
    buildToolGuide(toolsAvailable ? input.toolNames : []),
    await loadAgentsFile(read, root),
    await loadProjectAgents(read, root),
    await loadSkillDirectory(
      read,
      path.join(skillsDir, modeDir),
      input.specialty,
    ),
    await loadSkillDirectory(
      read,
      path.join(input.pluginSkillsDir, modeDir),
      input.specialty,
    ),
    // The memory rules are about the `save_project_memory` tool.
    toolsAvailable
      ? await loadSkillFile(read, path.join(skillsDir, 'memory.md'))
      : [],
    projectMemoryMessage(input.projectMemory),
    [input.environment],
  ];
  return groups.flat();
}
