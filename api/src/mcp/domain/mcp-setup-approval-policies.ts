import type { ToolApprovalPolicy } from 'src/chat/domain/approval-policy';
import { checkMcpServerRequest } from './check-mcp-server-request';
import {
  REMOVE_MCP_SERVER_TOOL,
  SAVE_MCP_SERVER_TOOL,
} from './mcp-setup-tool-names';

const ASK: ToolApprovalPolicy = () => ({ decision: 'ask' });

function readField(input: unknown, field: string): unknown {
  return input && typeof input === 'object'
    ? (input as Record<string, unknown>)[field]
    : undefined;
}

/**
 * A server may run a command on the user's machine, so every change is
 * approved. A save that would fail anyway is denied with the reason.
 */
const savePolicy: ToolApprovalPolicy = (input) => {
  try {
    const name = readField(input, 'name');
    checkMcpServerRequest(
      typeof name === 'string' ? name : '',
      readField(input, 'config'),
    );
    return { decision: 'ask' };
  } catch (error) {
    return {
      decision: 'always-deny',
      reason: error instanceof Error ? error.message : String(error),
    };
  }
};

export function createMcpSetupApprovalPolicies(): Record<
  string,
  ToolApprovalPolicy
> {
  return {
    [SAVE_MCP_SERVER_TOOL]: savePolicy,
    [REMOVE_MCP_SERVER_TOOL]: ASK,
  };
}
