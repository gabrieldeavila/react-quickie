export type SubagentViewStatus =
  | "starting"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "aborted"
  | "denied";

export type SubagentStepView = {
  id: string;
  tool: string;
  inputSummary: string;
  state: "running" | "done" | "error" | "denied";
};

export type SubagentView = {
  agent: string;
  task: string;
  status: SubagentViewStatus;
  steps: SubagentStepView[];
  text: string;
  needsApproval: string[];
  error?: string;
};

type PartLike = {
  state?: unknown;
  input?: unknown;
  output?: unknown;
  errorText?: unknown;
  approval?: { approved?: unknown; reason?: unknown };
};

const OUTPUT_STATUSES = new Set([
  "queued",
  "running",
  "completed",
  "failed",
  "aborted",
]);

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readInput(input: unknown): { agent: string; task: string } {
  const value = (input ?? {}) as Record<string, unknown>;
  // `name` is the pre-Phase-4 input.
  return { agent: str(value.agent) || str(value.name), task: str(value.task) };
}

function readSteps(steps: unknown): SubagentStepView[] {
  return Array.isArray(steps) ? (steps as SubagentStepView[]) : [];
}

function readStrings(values: unknown): string[] {
  return Array.isArray(values)
    ? values.filter((item): item is string => typeof item === "string")
    : [];
}

function fromOutput(base: SubagentView, output: unknown): SubagentView {
  const value = (output ?? {}) as Record<string, unknown>;
  // Pre-Phase-4 output: { success, subagentId, result | error }.
  if (value.status === undefined && "success" in value) {
    return value.success === false
      ? { ...base, status: "failed", error: str(value.error) }
      : { ...base, status: "completed", text: str(value.result) };
  }

  const status = OUTPUT_STATUSES.has(str(value.status))
    ? (value.status as SubagentViewStatus)
    : "running";
  return {
    ...base,
    status,
    steps: readSteps(value.steps),
    text: str(value.text),
    needsApproval: readStrings(value.needsApproval),
    error: str(value.error) || undefined,
  };
}

function isDenied(part: PartLike): boolean {
  return (
    part.state === "output-denied" ||
    (part.state === "approval-responded" && part.approval?.approved === false)
  );
}

/** A `run_subagent` tool part → what the card shows. */
export function toSubagentView(part: PartLike): SubagentView {
  const base: SubagentView = {
    ...readInput(part.input),
    status: "starting",
    steps: [],
    text: "",
    needsApproval: [],
  };

  if (isDenied(part)) {
    return {
      ...base,
      status: "denied",
      error: str(part.approval?.reason) || undefined,
    };
  }
  if (part.state === "output-error") {
    return {
      ...base,
      status: "failed",
      error: str(part.errorText) || undefined,
    };
  }
  if (part.state === "output-available") return fromOutput(base, part.output);
  return base;
}

export function isSubagentActive(view: SubagentView): boolean {
  return (
    view.status === "starting" ||
    view.status === "queued" ||
    view.status === "running"
  );
}
