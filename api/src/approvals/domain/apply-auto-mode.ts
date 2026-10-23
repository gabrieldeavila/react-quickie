import type {
  ApprovalVerdict,
  ToolApprovalPolicy,
} from 'src/chat/domain/approval-policy';
import {
  REMOVE_MCP_SERVER_TOOL,
  SAVE_MCP_SERVER_TOOL,
} from 'src/mcp/domain/mcp-setup-tool-names';
import { SAVE_INSTRUCTION_TOOL } from 'src/instructions/domain/instruction-tool-names';
import { matchesToolGlob } from 'src/subagents/domain/tool-glob';

/**
 * Tools that ask even in auto mode. `save_mcp_server` is here because
 * saving a server starts its command: approving it unasked would run any
 * command, past the destructive-bash floor. `save_instruction` because an
 * instruction lands in later conversations' prompts: a prompt injection
 * saved unasked would outlive this conversation.
 */
export const AUTO_MODE_ALWAYS_ASK: readonly string[] = [
  'create_commit',
  REMOVE_MCP_SERVER_TOOL,
  SAVE_MCP_SERVER_TOOL,
  SAVE_INSTRUCTION_TOOL,
];

export type AutoModeOptions = {
  enabled: boolean;
  /** Tool names or globs the user wants asked about anyway. */
  alwaysAsk?: string[];
};

function keepsAsking(
  toolName: string,
  verdict: ApprovalVerdict,
  alwaysAsk: string[],
): boolean {
  if (verdict.risk === 'destructive') return true;
  if (AUTO_MODE_ALWAYS_ASK.includes(toolName)) return true;
  return alwaysAsk.some((pattern) => matchesToolGlob(pattern, toolName));
}

/**
 * Auto mode turns `ask` into `never`, except destructive calls and the
 * always-ask tools. `never` and `always-deny` pass through unchanged.
 */
export function applyAutoMode(
  policies: Record<string, ToolApprovalPolicy>,
  { enabled, alwaysAsk = [] }: AutoModeOptions,
): Record<string, ToolApprovalPolicy> {
  if (!enabled) return policies;

  return Object.fromEntries(
    Object.entries(policies).map(([toolName, policy]) => [
      toolName,
      (input: unknown): ApprovalVerdict => {
        const verdict = policy(input);
        if (verdict.decision !== 'ask') return verdict;
        return keepsAsking(toolName, verdict, alwaysAsk)
          ? verdict
          : { decision: 'never' };
      },
    ]),
  );
}
