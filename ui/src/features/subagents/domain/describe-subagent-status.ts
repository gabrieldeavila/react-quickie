import {
  isSubagentActive,
  type SubagentStepView,
  type SubagentView,
  type SubagentViewStatus,
} from "./subagent-view";

const STATUS_LABELS: Record<SubagentViewStatus, string> = {
  starting: "starting",
  queued: "queued",
  running: "running",
  completed: "completed",
  failed: "failed",
  aborted: "stopped",
  denied: "denied",
};

const STEP_LABELS: Record<SubagentStepView["state"], string> = {
  running: "running",
  done: "ok",
  error: "error",
  denied: "not run",
};

export function describeSubagentStatus(status: SubagentViewStatus): string {
  return STATUS_LABELS[status];
}

export function describeStepState(state: SubagentStepView["state"]): string {
  return STEP_LABELS[state] ?? state;
}

/** Group header: "3 sub-agents · 2 running" or "3 sub-agents · done". */
export function describeSubagentGroup(views: SubagentView[]): string {
  const active = views.filter(isSubagentActive).length;
  const count = `${views.length} sub-agents`;
  return active ? `${count} · ${active} running` : `${count} · done`;
}
