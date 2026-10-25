import { matchesToolGlob } from 'src/subagents/domain/tool-glob';
import type { ApprovalRule, ApprovalRules } from './approval-rule.types';
import { normalizeCommand } from './normalize-command';

export const BASH_TOOL = 'run_bash_command';

function commandOf(input: unknown): string | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const { command } = input as { command?: unknown };
  return typeof command === 'string' ? command : undefined;
}

/** Bash calls need a rule with the same command; a bare `tool` never allows all bash. */
function matchesBash(rule: ApprovalRule, input: unknown): boolean {
  if (rule.tool !== BASH_TOOL || rule.command === undefined) return false;
  const command = commandOf(input);
  const called = command === undefined ? undefined : normalizeCommand(command);
  return called !== undefined && called === normalizeCommand(rule.command);
}

function matchesRule(
  rule: ApprovalRule,
  toolName: string,
  input: unknown,
): boolean {
  if (toolName === BASH_TOOL) return matchesBash(rule, input);
  return rule.command === undefined && matchesToolGlob(rule.tool, toolName);
}

/** The first rule that allows this call: project rules for `root`, then global. */
export function matchApprovalRule(
  rules: ApprovalRules,
  root: string | undefined,
  toolName: string,
  input: unknown,
): ApprovalRule | undefined {
  const candidates = [
    ...((root && rules.projects[root]) || []),
    ...rules.global,
  ];
  return candidates.find((rule) => matchesRule(rule, toolName, input));
}
