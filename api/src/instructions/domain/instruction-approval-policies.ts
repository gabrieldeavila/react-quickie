import type { ToolApprovalPolicy } from 'src/chat/domain/approval-policy';
import { SAVE_INSTRUCTION_TOOL } from './instruction-tool-names';
import {
  planInstructionSave,
  type SaveInstructionRequest,
} from './plan-instruction-save';

/**
 * An instruction becomes prompt text for later conversations, so the user
 * always approves it. A call that would fail anyway is denied with the
 * reason instead of asking first.
 */
export function createInstructionApprovalPolicies(
  root?: string,
): Record<string, ToolApprovalPolicy> {
  return {
    [SAVE_INSTRUCTION_TOOL]: (input) => {
      try {
        planInstructionSave(input as SaveInstructionRequest, root);
        return { decision: 'ask' };
      } catch (error) {
        return {
          decision: 'always-deny',
          reason: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}
