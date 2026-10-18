import { Injectable } from '@nestjs/common';
import { tool, type ToolSet } from 'ai';
import { z } from 'zod/v4';
import type { ToolApprovalPolicy } from 'src/chat/domain/approval-policy';
import { buildRunSubagentDescription } from '../domain/build-run-subagent-description';
import {
  createSubagentApprovalPolicy,
  unknownAgentReason,
} from '../domain/subagent-approval-policy';
import {
  startSubagentRun,
  applySubagentEvent,
  type SubagentProgress,
} from '../domain/subagent-progress';
import { summarizeSubagentOutput } from '../domain/summarize-subagent-output';
import { SUBAGENT_TOOL_NAME } from '../domain/write-tool-names';
import { AgentDefinitionsRepository } from './agent-definitions.repository';
import { SubagentRunnerService } from './subagent-runner.service';

// `agent` is a string, not an enum of the current names: saved conversations
// are validated against this schema, so a renamed or deleted project agent
// would otherwise reject the whole history. Unknown names are denied by the
// approval policy with the list of valid agents.
const runSubagentInputSchema = z.object({
  agent: z.string().min(1).describe('Name of the agent to run.'),
  task: z
    .string()
    .min(1)
    .describe('Self-contained task: the subagent does not see this chat.'),
  context: z
    .string()
    .optional()
    .describe(
      'Extra context the subagent needs (paths, decisions, constraints).',
    ),
});

type RunSubagentInput = z.infer<typeof runSubagentInputSchema>;

export type SubagentToolkitForChat = {
  tools: ToolSet;
  approvalPolicies: Record<string, ToolApprovalPolicy>;
};

/** The `run_subagent` tool and its delegation-time approval policy. */
@Injectable()
export class SubagentToolService {
  constructor(
    private readonly definitionsRepository: AgentDefinitionsRepository,
    private readonly runner: SubagentRunnerService,
  ) {}

  async createToolkit(root?: string): Promise<SubagentToolkitForChat> {
    const definitions = await this.definitionsRepository.load(root);
    const byName = new Map(definitions.map((item) => [item.name, item]));
    const runner = this.runner;

    const runSubagent = tool({
      description: buildRunSubagentDescription(definitions),
      inputSchema: runSubagentInputSchema,
      execute: async function* (
        { agent, task, context }: RunSubagentInput,
        { abortSignal }: { abortSignal?: AbortSignal },
      ): AsyncGenerator<SubagentProgress> {
        const definition = byName.get(agent);
        if (!definition) {
          // Safety net for callers that run the tool without the approval map.
          const run = startSubagentRun(agent, task);
          yield applySubagentEvent(run, {
            type: 'fail',
            error: unknownAgentReason(agent, definitions),
          }).progress;
          return;
        }
        yield* runner.run({ definition, task, context, abortSignal });
      },
      // The parent only gets the final answer, not the subagent's transcript.
      toModelOutput: ({ output }) => ({
        type: 'text',
        value: summarizeSubagentOutput(output),
      }),
    });

    return {
      tools: { [SUBAGENT_TOOL_NAME]: runSubagent },
      approvalPolicies: {
        [SUBAGENT_TOOL_NAME]: createSubagentApprovalPolicy(definitions),
      },
    };
  }
}
