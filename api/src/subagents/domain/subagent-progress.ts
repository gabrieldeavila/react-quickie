import { summarizeToolInput } from './summarize-tool-input';

export type SubagentStatus =
  'queued' | 'running' | 'completed' | 'failed' | 'aborted';

export type SubagentStepState = 'running' | 'done' | 'error' | 'denied';

export type SubagentStep = {
  id: string;
  tool: string;
  inputSummary: string;
  state: SubagentStepState;
};

/** The `run_subagent` tool output: yielded as it changes, the last one is final. */
export type SubagentProgress = {
  status: SubagentStatus;
  agent: string;
  task: string;
  /** Text of the latest step that produced text (the final answer once done). */
  text: string;
  /** Calls the subagent was not allowed to run without the user's approval. */
  needsApproval: string[];
  error?: string;
  steps: SubagentStep[];
};

export type SubagentEvent =
  | { type: 'start' }
  | { type: 'step-start' }
  | {
      type: 'tool-call';
      toolCallId: string;
      toolName: string;
      input: unknown;
      /** Set when the nested policy holds this call back for approval. */
      heldCall?: string;
    }
  | {
      type: 'tool-result' | 'tool-error' | 'tool-output-denied';
      toolCallId: string;
    }
  | { type: 'text-delta'; text: string }
  | { type: 'finish' }
  | { type: 'fail'; error: string }
  | { type: 'abort' };

/** Progress plus what the reducer needs between events. */
export type SubagentRun = {
  progress: SubagentProgress;
  /** A new step began: its first text replaces the previous step's text. */
  textBelongsToOldStep: boolean;
  heldCalls: Record<string, string>;
};

export function startSubagentRun(agent: string, task: string): SubagentRun {
  return {
    progress: {
      status: 'queued',
      agent,
      task,
      text: '',
      needsApproval: [],
      steps: [],
    },
    textBelongsToOldStep: false,
    heldCalls: {},
  };
}

function setStepState(
  steps: SubagentStep[],
  id: string,
  state: SubagentStepState,
): SubagentStep[] {
  return steps.map((step) => (step.id === id ? { ...step, state } : step));
}

/** Running steps of a run that ended can no longer finish. */
function closeRunningSteps(steps: SubagentStep[]): SubagentStep[] {
  return steps.map((step) =>
    step.state === 'running' ? { ...step, state: 'error' } : step,
  );
}

function withProgress(
  run: SubagentRun,
  patch: Partial<SubagentProgress>,
): SubagentRun {
  return { ...run, progress: { ...run.progress, ...patch } };
}

function applyToolCall(
  run: SubagentRun,
  event: Extract<SubagentEvent, { type: 'tool-call' }>,
): SubagentRun {
  const step: SubagentStep = {
    id: event.toolCallId,
    tool: event.toolName,
    inputSummary: summarizeToolInput(event.input),
    state: 'running',
  };
  const next = withProgress(run, { steps: [...run.progress.steps, step] });
  if (!event.heldCall) return next;
  return {
    ...next,
    heldCalls: { ...run.heldCalls, [event.toolCallId]: event.heldCall },
  };
}

function applyDenied(run: SubagentRun, toolCallId: string): SubagentRun {
  const steps = setStepState(run.progress.steps, toolCallId, 'denied');
  const held = run.heldCalls[toolCallId];
  const needsApproval =
    held && !run.progress.needsApproval.includes(held)
      ? [...run.progress.needsApproval, held]
      : run.progress.needsApproval;
  return withProgress(run, { steps, needsApproval });
}

function applyText(run: SubagentRun, delta: string): SubagentRun {
  const text = run.textBelongsToOldStep ? delta : run.progress.text + delta;
  return { ...withProgress(run, { text }), textBelongsToOldStep: false };
}

export function applySubagentEvent(
  run: SubagentRun,
  event: SubagentEvent,
): SubagentRun {
  const { steps } = run.progress;
  switch (event.type) {
    case 'start':
      return withProgress(run, { status: 'running' });
    case 'step-start':
      return { ...run, textBelongsToOldStep: run.progress.text !== '' };
    case 'tool-call':
      return applyToolCall(run, event);
    case 'tool-result':
      return withProgress(run, {
        steps: setStepState(steps, event.toolCallId, 'done'),
      });
    case 'tool-error':
      return withProgress(run, {
        steps: setStepState(steps, event.toolCallId, 'error'),
      });
    case 'tool-output-denied':
      return applyDenied(run, event.toolCallId);
    case 'text-delta':
      return applyText(run, event.text);
    case 'finish':
      return withProgress(run, {
        status: 'completed',
        steps: closeRunningSteps(steps),
      });
    case 'fail':
      return withProgress(run, {
        status: 'failed',
        error: event.error,
        steps: closeRunningSteps(steps),
      });
    case 'abort':
      return withProgress(run, {
        status: 'aborted',
        steps: closeRunningSteps(steps),
      });
  }
}
