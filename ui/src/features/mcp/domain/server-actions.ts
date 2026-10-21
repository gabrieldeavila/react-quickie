import { describeServerStatus } from "./describe-server-status";
import type { McpServerView } from "./mcp-server.types";

export type ServerActionKey =
  | "signIn"
  | "signOut"
  | "edit"
  | "enable"
  | "disable"
  | "reconnect"
  | "tools"
  | "remove"
  | "openFile";

type Context = {
  /** False while the server's file can't be edited (untrusted project file). */
  canEdit: boolean;
  /** VSCode can open the file in the editor; the browser shows the path. */
  canOpenFile: boolean;
};

/** The row menu's actions for a server, in display order. */
export function serverActions(
  server: McpServerView,
  { canEdit, canOpenFile }: Context,
): ServerActionKey[] {
  const actions: ServerActionKey[] = [];
  if (server.status === "needs-auth") actions.push("signIn");
  if (canEdit) actions.push("edit", server.disabled ? "enable" : "disable");
  if (describeServerStatus(server).canReconnect) actions.push("reconnect");
  if (canEdit && !server.disabled) actions.push("tools");
  if (server.signedIn) actions.push("signOut");
  if (canEdit) actions.push("remove");
  if (canOpenFile) actions.push("openFile");
  return actions;
}
