import type { ApprovalRuleScope } from './approval-rule.types';
import type { ApprovalRuleTarget } from './edit-approval-rules';
import { BASH_TOOL } from './match-approval-rule';
import { normalizeCommand } from './normalize-command';

/** A tool name, or `mcp__<server>__*` for every tool of one server. */
const TOOL_NAME = /^[A-Za-z0-9_-]{1,64}$/;
const MCP_SERVER_GLOB = /^mcp__[A-Za-z0-9_-]+__\*$/;

export type RuleRequestResult =
  { ok: true; target: ApprovalRuleTarget } | { ok: false; message: string };

const fail = (message: string): RuleRequestResult => ({ ok: false, message });

function readScope(value: unknown): ApprovalRuleScope | undefined {
  return value === 'global' || value === 'project' ? value : undefined;
}

function readCommand(
  tool: string,
  command: unknown,
): { ok: true; command?: string } | { ok: false; message: string } {
  if (tool !== BASH_TOOL) {
    return command === undefined
      ? { ok: true }
      : { ok: false, message: 'Only Bash rules take a "command".' };
  }
  if (typeof command !== 'string') {
    return { ok: false, message: 'A Bash rule needs the exact "command".' };
  }
  const normalized = normalizeCommand(command);
  if (!normalized) {
    return {
      ok: false,
      message:
        'Chained, piped or redirected commands (;, &&, |, >, $(...)) cannot be always allowed.',
    };
  }
  return { ok: true, command: normalized };
}

/**
 * Checks a `POST`/`DELETE /approvals/rules` body. Refuses globs other than
 * one MCP server's tools, and Bash rules without a single plain command.
 */
export function validateRuleRequest(
  body: Record<string, unknown>,
  root: string | undefined,
): RuleRequestResult {
  const scope = readScope(body.scope);
  if (!scope) return fail('Scope must be "global" or "project".');
  if (scope === 'project' && !root) return fail('A project rule needs a root.');

  const { tool } = body;
  if (
    typeof tool !== 'string' ||
    !(TOOL_NAME.test(tool) || MCP_SERVER_GLOB.test(tool))
  ) {
    return fail('"tool" must be a tool name or mcp__<server>__*.');
  }

  const command = readCommand(tool, body.command);
  if (!command.ok) return fail(command.message);
  return {
    ok: true,
    target: {
      scope,
      ...(scope === 'project' ? { root } : {}),
      tool,
      ...(command.command === undefined ? {} : { command: command.command }),
    },
  };
}
