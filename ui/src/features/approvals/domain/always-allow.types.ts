export type ApprovalRuleScope = "global" | "project";

/** What "Always allow" saves: a rule in Doty's rules file, or MCP's own setting. */
export type AlwaysAllowRequest =
  | { kind: "rule"; scope: ApprovalRuleScope; tool: string; command?: string }
  /** `approval: never` in the server's `mcp.json` entry. */
  | { kind: "mcp"; tool: string; wholeServer: boolean };

export type AlwaysAllowOption = {
  key: string;
  label: string;
  request: AlwaysAllowRequest;
};
