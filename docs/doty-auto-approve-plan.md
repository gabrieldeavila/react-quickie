# Doty — auto-approve tool calls

Status: Phase 1 done · Date: 2026-10-22 · Base: `feat/mcp-setup-and-oauth` (or `main` once it is merged) · Branch: `feat/auto-approve`

Today every risky tool call stops the agent and waits for **Allow / Deny** on an approval card: bash commands the policy flags, `create_commit`, MCP tools (unless set to `never` in `/mcp`), write-capable subagents, `save_instruction`, `save_mcp_server`/`remove_mcp_server`. A long task can ask the same question many times ("run `pnpm test`?", "call `list_drive_items`?"). This plan adds two ways to stop asking, without losing the guardrails:

1. **Rules ("Always allow")**: a button on the approval card that remembers the decision for that tool (or that exact bash command), globally or for this project.
2. **Auto mode**: a per-conversation toggle that approves everything that would ask, except a short list of dangerous operations that always ask.

## Summary

| Session | Phase | Why | Size | Depends on |
|---|---|---|---|---|
| A | 1 — Approval rules (API) | One place that turns `ask` into `never` | M | — |
| B | 2 — "Always allow" on the card (UI + API) | Create rules where the question is asked | M | A |
| C | 3 — Auto mode per conversation | Stop asking for a whole task | M | A |
| D | 4 — Manage rules, subagents, audit, docs | See/undo rules; same behaviour everywhere | M | B, C |

Order: A → B → C → D. All sessions work on `feat/auto-approve` (one branch for the feature; never a branch per session).

## Working across sessions

Same rules as `docs/doty-agent-plan.md`: read this file first, check the Progress block of the phases you depend on, tick checkboxes only when done and verified, commit small with the plan update, and finish with `typecheck`, `lint` and `test` green in every package touched (the API uses `lint:check`). Pure rules go in `domain/` with `*.spec.ts`; IO in `data/`; HTTP in `delivery/`; UI per feature in `domain/ api/ hooks/ components/`.

## How approvals work today (verified on `401d5cf`)

- Every tool that may need a decision registers a `ToolApprovalPolicy` (`input → { decision: 'never' | 'ask' | 'always-deny', reason? }`). `buildToolApprovalMap` ([approval-policy.ts](../api/src/chat/domain/approval-policy.ts)) turns them into `streamText({ toolApproval })`; [chat.service.ts](../api/src/chat/chat.service.ts) `getToolkit()` merges the policies of bash, git, MCP, subagents, instructions and MCP setup.
- `ask` makes the AI SDK emit an `approval-requested` part, signed with `experimental_toolApprovalSecret` ([chat-stream.service.ts](../api/src/chat/data/chat-stream.service.ts)); the UI answers with `addToolApprovalResponse` ([useToolApproval.ts](../ui/src/features/chat/hooks/useToolApproval.ts)) and `useChat` resends. A tool whose policy says `never` just runs; it leaves no trace that a decision was skipped.
- Bash: [command-policy.ts](../api/src/common/agents/tools/bash/domain/command-policy.ts) classifies a command as `allowed`, `approval_required` (mutations, installs, network, redirects, `$(...)`, paths outside the workspace) or `blocked` (sudo, system folders…). Read-only chains (`a && b`, pipes) can be `allowed`.
- MCP: per-server/per-tool `approval: 'ask' | 'never'` in `mcp.json`, editable in `/mcp` → Tools… ([set-mcp-tool-approval.ts](../api/src/mcp/domain/set-mcp-tool-approval.ts)). The agent can never change it ([keep-user-mcp-approval.ts](../api/src/mcp/domain/keep-user-mcp-approval.ts)).
- Subagents: a nested tool that would ask returns "needs approval" to the parent, which reruns it through the normal flow ([nested-approval-policies.ts](../api/src/subagents/domain/nested-approval-policies.ts)).

## Ground rules (all phases)

1. **Never relax a deny.** Rules and auto mode only turn `ask` into `never`. `always-deny` (blocked bash, invalid calls, unknown subagents) is final.
2. **Only the user creates rules.** Rules are written by UI endpoints, never by agent tools; no tool may read or edit the rules file. (Same principle as `keep-user-mcp-approval`.)
3. **A repository can't approve for you.** Project rules are stored in Doty's data dir keyed by the project root, **not** in `<root>/.doty/` (a cloned repo could otherwise auto-approve bash).
4. **Bash rules match exactly, not by prefix.** "Always allow `pnpm test`" allows `pnpm test` (after trimming/collapsing spaces), not `pnpm test; rm -rf x`. Any command containing chaining, pipes, redirects or `$(...)` never matches a rule.
5. **Visible.** The user can always see that auto mode is on, and which rules exist, and undo them.

---

## Phase 1 — Approval rules (API) (Session A)

**Goal:** a rules store and one wrapper that applies it to every policy.

### Rule format

```jsonc
// <DOTY_DATA_DIR>/approval-rules.json  (0600)
{
  "global": [
    { "tool": "mcp__google-drive__list_drive_items" },
    { "tool": "mcp__google-drive__*" },              // glob on the tool name
    { "tool": "run_bash_command", "command": "pnpm test" }
  ],
  "projects": {
    "/Users/me/code/app": [
      { "tool": "run_bash_command", "command": "pnpm --dir api test" },
      { "tool": "create_commit" }
    ]
  }
}
```

### Checklist

- [x] `api/src/approvals/domain/approval-rule.types.ts`: `ApprovalRule = { tool: string; command?: string; createdAt: string }`, `ApprovalRules = { global: ApprovalRule[]; projects: Record<string, ApprovalRule[]> }`.
- [x] `domain/parse-approval-rules.ts` (+spec): zod-validated read; a broken file means "no rules" (and is reported), never "allow all".
- [x] `domain/normalize-command.ts` (+spec): trim, collapse whitespace; returns `undefined` for anything with `;`, `&&`, `||`, `|`, `<`, `>`, `` ` ``, `$(`, newlines (ground rule 4).
- [x] `domain/match-approval-rule.ts` (+spec): `(rules, root, toolName, input) → rule | undefined`. Tool globs reuse `subagents/domain/tool-glob.ts`. A rule with `command` matches only `run_bash_command` with an equal normalized command. Project rules for `root`, then global.
- [x] `domain/apply-approval-rules.ts` (+spec): wraps a `Record<string, ToolApprovalPolicy>`: if the inner verdict is `ask` and a rule matches → `never`; `always-deny` and `never` pass through unchanged (ground rule 1).
- [x] `data/approval-rules.repository.ts`: read (cached by mtime, like `McpConfigRepository`), add, remove; atomic `0600` writes with `writeFileAtomic`; key project rules by the resolved root.
- [x] `ApprovalsModule` exporting the repository; `ChatService.getToolkit()` wraps the merged policies with `applyApprovalRules` before `buildToolApprovalMap`.
- [x] Tests: unit specs above; an integration spec (temp `DOTY_DATA_DIR`) that a matching rule skips the approval in the real `streamText` loop (pattern: `chat/data/tool-approval-flow.spec.ts`).

### Progress
Status: done · Last commit: `feat(approvals): user approval rules that skip the ask` · Done: all · Left: — · Notes: add/remove also live in pure `domain/edit-approval-rules.ts` (+spec), and the zod schema in `domain/approval-rules.schema.ts`. A missing `createdAt` in a hand-edited file reads as `""`. Any invalid part voids the whole file (logged once per change), and `add`/`remove` refuse to overwrite a broken file. Writes are serialized. A bash call only matches a rule with `tool: run_bash_command` + `command`, so even `{ "tool": "*" }` never allows bash. Project keys use `toRealPath(root)`. The integration spec is `approvals/data/approval-rules.integration.spec.ts`.

---

## Phase 2 — "Always allow" on the approval card (Session B)

**Goal:** create a rule from the question itself.

### Checklist

- [ ] API `approvals/delivery/approvals.controller.ts`: `GET /approvals/rules?root=`, `POST /approvals/rules` `{ root, scope: 'global' | 'project', tool, command? }`, `DELETE /approvals/rules` (same body). Validate `tool` (known tool name or glob) and `command` with `normalizeCommand`; refuse a bash rule without a command (no "allow all bash").
- [ ] Decide per tool what "Always allow" saves (pure `ui/.../domain/rule-from-approval.ts` +spec):
  - bash → `{ tool, command }` with the exact normalized command; hide the button when `normalizeCommand` returns `undefined` (chained/redirected command).
  - MCP tool → `{ tool: 'mcp__server__tool' }`, plus a secondary "all tools of this server" (`mcp__server__*`).
  - others (`create_commit`, `save_instruction`, `run_subagent` with `writes`, `save_mcp_server`…) → `{ tool }`.
- [ ] Card UI ([ToolApprovalCard.tsx](../ui/src/features/chat/components/ToolApprovalCard.tsx)): split **Allow** into **Allow once** / **Always allow ▾** (menu: "in this project" / "everywhere"). Saving the rule also approves the current call.
- [ ] `ui/src/features/approvals/` (`api/`, `hooks/useApprovalRules.ts`) for the calls.
- [ ] Decide (see Decisions): MCP "Always allow" writes `approval: never` to `mcp.json` (one place for MCP) **or** a rule (one place for everything).

### Progress
Status: not started · Last commit: — · Done: — · Left: all · Notes: —

---

## Phase 3 — Auto mode per conversation (Session C)

**Goal:** "don't ask me during this task", with a safety floor.

### Checklist

- [ ] Split bash `approval_required` by risk in `command-policy.ts` (+spec): `destructive` (`rm`, `git reset|clean|checkout`, `git push --force`, `chmod/chown`, `docker`, writes outside the workspace) vs `changes` (installs, `mkdir`, `touch`, redirects into the workspace, network). Keep the public decision values; add a `risk` field.
- [ ] `domain/apply-auto-mode.ts` (+spec): when the request has `autoApprove: true`, `ask` → `never` **except** the always-ask list: bash `destructive`, `create_commit`, `remove_mcp_server`, and any tool the user marked "always ask" (Phase 4). `always-deny` unchanged.
- [ ] Request: the UI sends `autoApprove` in the chat body ([chat.transport.helper.ts](../ui/src/helpers/chat.transport.helper.ts)); [chat.controller.ts](../api/src/chat/delivery/chat.controller.ts) stores it in the request context; `getToolkit()` applies auto mode after rules.
- [ ] UI: a toggle chip in the composer ("Auto-approve"), off by default, **per conversation** (stored with the conversation in IndexedDB, like the selected instructions), reset for new conversations; a visible banner while on; `/auto` slash command to toggle.
- [ ] The prompt's tool guide tells the model that auto mode is on and that destructive actions still ask (so it doesn't assume silence = consent for them).

### Progress
Status: not started · Last commit: — · Done: — · Left: all · Notes: —

---

## Phase 4 — Manage rules, subagents, audit, docs (Session D)

### Checklist

- [ ] Settings → **Approvals** section (and `/approvals`): list global and this-project rules, remove one, "always ask" overrides for specific tools.
- [ ] Subagents: apply the same rules and auto mode in [subagent-toolkit.service.ts](../api/src/subagents/data/subagent-toolkit.service.ts) / `nested-approval-policies`, so a subagent doesn't bounce "needs approval" for a tool the user already allowed.
- [ ] Audit: mark auto-approved calls so the tool card can show "Auto-approved (rule: …)" / "(auto mode)". Option: the wrapper records `{ toolCallId → reason }` for the request and the stream writes a `data-auto-approval` part; the UI reads it in the tool card.
- [ ] VS Code: nothing extra if rules live in the data dir (the extension's own `DOTY_DATA_DIR`); mention in README that web and VS Code keep separate rules.
- [ ] README: rules, auto mode, the always-ask list, where rules are stored, how to undo.

### Progress
Status: not started · Last commit: — · Done: — · Left: all · Notes: —

---

## Decisions (recommended; change them here before the session starts)

1. **MCP "Always allow" target**: recommended — write `approval: never` into `mcp.json` (it already exists, is shown in `/mcp` → Tools…, and travels with the server config). Rules file for everything else.
2. **Bash rule matching**: exact normalized command (recommended) vs prefix (`pnpm test*`). Prefix is convenient but easy to abuse; if ever added, it must still refuse chained commands.
3. **Auto mode scope**: per conversation, off by default (recommended) vs a global setting.
4. **Always-ask list in auto mode**: destructive bash, `create_commit`, `remove_mcp_server` (recommended); `git push` is not a tool today (bash `git push` falls under the policy).
5. **Rules expiry**: none (recommended); revisit if users ask.

## Out of scope

- Approving by an LLM judge ("is this safe?").
- Sharing rules through the repository (ground rule 3).
- Remote/team policies.
