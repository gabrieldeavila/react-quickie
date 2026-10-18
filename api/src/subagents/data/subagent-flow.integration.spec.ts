import {
  isStepCount,
  readUIMessageStream,
  streamText,
  tool,
  type UIMessage,
} from 'ai';
import { MockLanguageModelV4, simulateReadableStream } from 'ai/test';
import { z } from 'zod/v4';
import type { ConfigService } from '@nestjs/config';
import { buildToolApprovalMap } from 'src/chat/domain/approval-policy';
import { createBashApprovalPolicy } from 'src/common/agents/tools/bash/domain/bash-approval-policy';
import { assessCommand } from 'src/common/agents/tools/bash/domain/command-policy';
import type { ContextService } from 'src/common/context/context.service';
import type { ProviderRegistryService } from 'src/llm/data/provider-registry.service';
import type { AgentDefinition } from '../domain/agent-definition.types';
import { buildNestedApprovalPolicies } from '../domain/nested-approval-policies';
import type { SubagentProgress } from '../domain/subagent-progress';
import type { AgentDefinitionsRepository } from './agent-definitions.repository';
import { SubagentRunnerService } from './subagent-runner.service';
import { SubagentToolService } from './subagent-tool.service';
import type { SubagentToolkitService } from './subagent-toolkit.service';

// End-to-end check of the Phase 4 wiring against the real AI SDK: nested
// streamText with the "ask → report back" policies, preliminary outputs on the
// parent's tool part, and toModelOutput keeping the transcript out of the parent.

const ROOT = '/workspace/project';
const usage = {
  inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 1, text: 1, reasoning: 0 },
};
const finish = (unified: 'tool-calls' | 'stop') => ({
  type: 'finish',
  finishReason: { unified, raw: undefined },
  usage,
});

const toolCallStream = (toolName: string, input: unknown, id = 'call-1') => ({
  stream: simulateReadableStream({
    chunks: [
      {
        type: 'tool-call',
        toolCallId: id,
        toolName,
        input: JSON.stringify(input),
      },
      finish('tool-calls'),
    ],
  }),
});

const textStream = (text: string) => ({
  stream: simulateReadableStream({
    chunks: [
      { type: 'text-start', id: 't' },
      { type: 'text-delta', id: 't', delta: text },
      { type: 'text-end', id: 't' },
      finish('stop'),
    ],
  }),
});

const mockModel = (...streams: unknown[]) =>
  new MockLanguageModelV4({ doStream: streams as never });

const implementer: AgentDefinition = {
  name: 'implementer',
  description: 'Edits code.',
  tools: ['run_bash_command'],
  maxSteps: 5,
  writes: true,
  instructions: 'Implement.',
  source: 'built-in',
};

function setup(subagentModel: MockLanguageModelV4) {
  const execute = jest.fn(() => Promise.resolve('ran'));
  const tools = {
    run_bash_command: tool({
      inputSchema: z.object({ command: z.string() }),
      execute,
    }),
  };
  const approvalPolicies = buildNestedApprovalPolicies({
    run_bash_command: createBashApprovalPolicy((command) =>
      assessCommand(command, ROOT),
    ),
  });

  const runner = new SubagentRunnerService(
    { get: () => '4' } as unknown as ConfigService,
    {
      selectForSubagent: () => ({
        ref: 'openai:mock',
        provider: 'openai',
        model: { supportsTools: true },
      }),
      languageModel: () => subagentModel,
    } as unknown as ProviderRegistryService,
    {
      get: (key: string) => (key === 'root' ? ROOT : undefined),
    } as unknown as ContextService,
    {
      forAgent: () => Promise.resolve({ tools, approvalPolicies }),
    } as unknown as SubagentToolkitService,
  );
  return { execute, runner };
}

async function collect(
  iterable: AsyncIterable<SubagentProgress>,
): Promise<SubagentProgress[]> {
  const items: SubagentProgress[] = [];
  for await (const item of iterable) items.push(item);
  return items;
}

describe('SubagentRunnerService (nested approval)', () => {
  it('holds back commands that need approval and reports them', async () => {
    const { execute, runner } = setup(
      mockModel(
        toolCallStream('run_bash_command', { command: 'npm install left-pad' }),
        textStream('Could not install the package.'),
      ),
    );

    const updates = await collect(
      runner.run({ definition: implementer, task: 'add left-pad' }),
    );
    const final = updates[updates.length - 1];

    expect(execute).not.toHaveBeenCalled();
    expect(updates[0].status).toBe('queued');
    expect(final).toMatchObject({
      status: 'completed',
      text: 'Could not install the package.',
      needsApproval: ['npm install left-pad'],
    });
    expect(final.steps).toEqual([
      expect.objectContaining({ tool: 'run_bash_command', state: 'denied' }),
    ]);
    // Two steps of 1 in / 1 out each; the mock model has no pricing.
    expect(final.usage).toMatchObject({
      model: 'openai:mock',
      usage: { inputTokens: 2, outputTokens: 2 },
      costUsd: undefined,
    });
  });

  it('runs auto-approved commands', async () => {
    const { execute, runner } = setup(
      mockModel(
        toolCallStream('run_bash_command', { command: 'ls' }),
        textStream('Listed.'),
      ),
    );

    const updates = await collect(
      runner.run({ definition: implementer, task: 'list' }),
    );
    const final = updates[updates.length - 1];

    expect(execute).toHaveBeenCalledTimes(1);
    expect(final.needsApproval).toEqual([]);
    expect(final.steps[0].state).toBe('done');
  });

  it('reports a provider failure instead of throwing', async () => {
    const failing = new MockLanguageModelV4({
      doStream: () => Promise.reject(new Error('rate limited')),
    });
    const { runner } = setup(failing);

    const updates = await collect(
      runner.run({ definition: implementer, task: 'x' }),
    );

    expect(updates[updates.length - 1]).toMatchObject({
      status: 'failed',
      error: expect.stringContaining('rate limited') as unknown,
    });
  });
});

describe('run_subagent inside the parent stream', () => {
  it('streams preliminary progress and gives the parent only the summary', async () => {
    const { runner } = setup(
      mockModel(
        toolCallStream('run_bash_command', { command: 'ls' }),
        textStream('Summary for the parent.'),
      ),
    );
    const repository = {
      load: () => Promise.resolve([implementer]),
    } as unknown as AgentDefinitionsRepository;
    const { tools } = await new SubagentToolService(
      repository,
      runner,
    ).createToolkit(ROOT);

    const parentModel = mockModel(
      toolCallStream('run_subagent', { agent: 'implementer', task: 'list' }),
      textStream('All done.'),
    );
    const result = streamText({
      model: parentModel,
      prompt: 'go',
      tools,
      stopWhen: isStepCount(3),
    });

    const snapshots: UIMessage[] = [];
    for await (const message of readUIMessageStream({
      stream: result.toUIMessageStream(),
    })) {
      snapshots.push(structuredClone(message));
    }

    const toolParts = snapshots
      .flatMap((message) => message.parts)
      .filter((part) => part.type === 'tool-run_subagent') as Array<{
      state: string;
      preliminary?: boolean;
      output?: SubagentProgress;
    }>;
    expect(toolParts.some((part) => part.preliminary)).toBe(true);
    expect(toolParts.some((part) => part.output?.status === 'running')).toBe(
      true,
    );
    const last = toolParts[toolParts.length - 1];
    expect(last.output).toMatchObject({
      status: 'completed',
      text: 'Summary for the parent.',
    });

    const secondPrompt = JSON.stringify(parentModel.doStreamCalls[1].prompt);
    expect(secondPrompt).toContain('Summary for the parent.');
    expect(secondPrompt).not.toContain('inputSummary');
  });

  it('asks the user before delegating to a write-capable agent', async () => {
    const { runner } = setup(mockModel(textStream('never runs')));
    const repository = {
      load: () => Promise.resolve([implementer]),
    } as unknown as AgentDefinitionsRepository;
    const { tools, approvalPolicies } = await new SubagentToolService(
      repository,
      runner,
    ).createToolkit(ROOT);

    const result = streamText({
      model: mockModel(
        toolCallStream('run_subagent', { agent: 'implementer', task: 'edit' }),
      ),
      prompt: 'go',
      tools,
      toolApproval: buildToolApprovalMap(approvalPolicies),
    });

    const parts: string[] = [];
    for await (const part of result.fullStream) parts.push(part.type);
    expect(parts).toContain('tool-approval-request');
    expect(parts).not.toContain('tool-result');
  });
});
