import {
  isSubagentActive,
  type SubagentStepView,
  type SubagentView,
  type SubagentViewStatus,
} from "./subagent-view";

const STATUS_LABELS: Record<SubagentViewStatus, string> = {
  starting: "iniciando",
  queued: "na fila",
  running: "executando",
  completed: "concluído",
  failed: "falhou",
  aborted: "interrompido",
  denied: "negado",
};

const STEP_LABELS: Record<SubagentStepView["state"], string> = {
  running: "executando",
  done: "ok",
  error: "erro",
  denied: "não executado",
};

export function describeSubagentStatus(status: SubagentViewStatus): string {
  return STATUS_LABELS[status];
}

export function describeStepState(state: SubagentStepView["state"]): string {
  return STEP_LABELS[state] ?? state;
}

/** Group header: "3 subagentes · 2 em execução" or "3 subagentes · concluídos". */
export function describeSubagentGroup(views: SubagentView[]): string {
  const active = views.filter(isSubagentActive).length;
  const count = `${views.length} subagentes`;
  return active ? `${count} · ${active} em execução` : `${count} · concluídos`;
}
