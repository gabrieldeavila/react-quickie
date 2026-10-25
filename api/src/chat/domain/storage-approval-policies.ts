import type { ToolApprovalPolicy } from './approval-policy';

export const DELETE_FILE_TOOL = 'delete_file';

/**
 * Of the file tools only `delete_file` asks, like bash `rm`: it is the one
 * that can't be undone (moves refuse to overwrite; edits and overwrites
 * keep the file, and git can bring it back). It asks in auto mode too.
 */
export function createStorageApprovalPolicies(): Record<
  string,
  ToolApprovalPolicy
> {
  return {
    [DELETE_FILE_TOOL]: () => ({ decision: 'ask', risk: 'destructive' }),
  };
}
