const REMOVES_OR_SHARES = /delete|trash|remove|share|permission|access/i;

/**
 * Whether a tool's name says it deletes data or opens it to other people.
 * Servers mark plain edits destructive too, so the name is what tells a
 * delete or a share (data leaving the user's hands) from an edit.
 */
export function removesOrShares(toolName: string): boolean {
  return REMOVES_OR_SHARES.test(toolName);
}
