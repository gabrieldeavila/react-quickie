import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isStepCount, streamText } from 'ai';
import { buildToolApprovalMap } from 'src/chat/domain/approval-policy';
import { ContextService } from 'src/common/context/context.service';
import { ProviderRegistryService } from 'src/llm/data/provider-registry.service';
import { priceUsage } from 'src/llm/domain/price-usage';
import { toTokenUsage } from 'src/llm/domain/to-token-usage';
import type { AgentDefinition } from '../domain/agent-definition.types';
import {
  ConcurrencyLimiter,
  readMaxParallel,
  type Release,
} from '../domain/concurrency-limiter';
import {
  applySubagentEvent,
  startSubagentRun,
  type SubagentEvent,
  type SubagentProgress,
  type SubagentRun,
} from '../domain/subagent-progress';
import {
  describeSubagentError,
  toSubagentEvent,
} from '../domain/to-subagent-event';
import { SubagentToolkitService } from './subagent-toolkit.service';

/** Text deltas are batched; every other change is sent right away. */
const TEXT_EMIT_INTERVAL_MS = 150;

export type SubagentRunInput = {
  definition: AgentDefinition;
  task: string;
  context?: string;
  abortSignal?: AbortSignal;
};

function buildPrompt(task: string, context?: string): string {
  return context ? `Task:\n${task}\n\nContext:\n${context}` : `Task:\n${task}`;
}

/** Runs one subagent as a nested `streamText` and yields its progress. */
@Injectable()
export class SubagentRunnerService {
  /** Shared by every request: it protects the provider, not one chat. */
  private readonly limiter: ConcurrencyLimiter;

  constructor(
    configService: ConfigService,
    private readonly providerRegistry: ProviderRegistryService,
    private readonly contextService: ContextService,
    private readonly toolkitService: SubagentToolkitService,
  ) {
    this.limiter = new ConcurrencyLimiter(
      readMaxParallel(configService.get<string>('DOTY_MAX_PARALLEL_SUBAGENTS')),
    );
  }

  async *run(input: SubagentRunInput): AsyncGenerator<SubagentProgress> {
    const { definition, task, abortSignal } = input;
    let run = startSubagentRun(definition.name, task);
    yield run.progress;

    let release: Release | undefined;
    try {
      release = await this.limiter.acquire(abortSignal);
      run = applySubagentEvent(run, { type: 'start' });
      yield run.progress;

      for await (const next of this.stream(run, input)) {
        run = next;
        yield run.progress;
      }
      if (run.progress.status === 'running') {
        run = applySubagentEvent(run, { type: 'finish' });
      }
    } catch (error) {
      const event: SubagentEvent = abortSignal?.aborted
        ? { type: 'abort' }
        : { type: 'fail', error: describeSubagentError(error) };
      run = applySubagentEvent(run, event);
    } finally {
      release?.();
    }
    yield run.progress;
  }

  /** Yields the run whenever it should be sent to the UI. */
  private async *stream(
    initial: SubagentRun,
    { definition, task, context, abortSignal }: SubagentRunInput,
  ): AsyncGenerator<SubagentRun> {
    const root = this.contextService.get('root');
    if (!root) throw new Error('Workspace root not found.');
    const selected = this.providerRegistry.selectForSubagent(
      this.contextService.get('modelRef'),
      definition.model,
    );
    if (!selected) throw new Error('No AI model is configured.');

    const toolkit = await this.toolkitService.forAgent(root, definition);
    const result = streamText({
      model: this.providerRegistry.languageModel(selected),
      instructions: definition.instructions,
      prompt: buildPrompt(task, context),
      tools: selected.model.supportsTools ? toolkit.tools : {},
      toolApproval: buildToolApprovalMap(toolkit.approvalPolicies),
      stopWhen: isStepCount(definition.maxSteps),
      maxRetries: this.providerRegistry.maxRetries,
      abortSignal,
    });

    let run = initial;
    let lastEmit = 0;
    for await (const part of result.fullStream) {
      const event =
        part.type === 'finish-step'
          ? {
              type: 'usage' as const,
              usage: priceUsage(selected, toTokenUsage(part.usage)),
            }
          : toSubagentEvent(part, toolkit.approvalPolicies);
      if (!event) continue;
      run = applySubagentEvent(run, event);

      const now = Date.now();
      if (
        event.type === 'text-delta' &&
        now - lastEmit < TEXT_EMIT_INTERVAL_MS
      ) {
        continue;
      }
      lastEmit = now;
      yield run;
    }
    yield run;
  }
}
