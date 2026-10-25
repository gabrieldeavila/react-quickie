/**
 * "Always allow" decision saved by the user. `command` is set only for
 * `run_bash_command`, and matches that exact (normalized) command.
 */
export type ApprovalRule = {
  /** Tool name, or a glob on it (`mcp__google-drive__*`). */
  tool: string;
  command?: string;
  createdAt: string;
};

export type ApprovalRuleScope = 'global' | 'project';

/** Contents of `<DOTY_DATA_DIR>/approval-rules.json`. */
export type ApprovalRules = {
  global: ApprovalRule[];
  /** Keyed by the resolved project root. */
  projects: Record<string, ApprovalRule[]>;
};

export const EMPTY_APPROVAL_RULES: ApprovalRules = { global: [], projects: {} };
