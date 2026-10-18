# Doty — improvement plan

Status: proposal · Date: 2026-10-17 · Base: `main` @ `9609782` · AI SDK `ai@7.0.22`

This document lists what should change in Doty and how it will most likely be done. Decisions marked **(decided)** were agreed on; everything else is a recommendation that can be revisited during implementation.

## Summary

| # | Phase | Why | Size |
|---|-------|-----|------|
| 0 | Groundwork: workspace sandbox, test setup, `process.cwd()` cleanup | Security fix + prerequisite for write-capable subagents, MCP and VSCode packaging | S |
| 1 | Tool history + native tool approval | The model currently forgets every tool call from previous turns | M |
| 2 | Multi-provider (OpenAI, Anthropic, DeepSeek, OpenAI-compatible) | Not tied to a single vendor | M |
| 3 | MCP client | Use external tools (GitHub, DBs, browsers, docs…) | M |
| 4 | Subagents v2 | Typed agents, live progress, parallel runs, write-capable agents | L |
| 5 | VSCode extension | Same UI + API embedded in the editor | L |
| 6 | Context management, usage/cost, stop | Long chats stay within the context window; visible cost; reliable abort | M |

Order **(decided)**: History → Providers → MCP → Subagents → VSCode. Phase 0 is small and goes first because later phases depend on it. Phase 6 items can be done in between (tool-output truncation is part of Phase 1).

All new code follows the repo conventions: small single-purpose files, pure rules in `domain/` with `*.spec.ts`, IO in `data/`, HTTP in `delivery/` (backend); `domain/ api/ hooks/ components/` per feature (frontend).

---

## Phase 0 — Groundwork

### 0.1 Workspace sandbox

**Problem.** `StorageService` builds paths with `path.join(root, filePath)` ([storage.service.ts](../api/src/common/helpers/storage.service.ts)), so `../../etc/passwd` or an absolute path escapes the project. `root` comes from the request body with no check ([chat.controller.ts:28-36](../api/src/chat/chat.controller.ts#L28-L36)).

**How.**
- `api/src/workspace/domain/resolve-workspace-path.ts`: `resolveWorkspacePath(root, input) → absolute path | WorkspaceEscapeError`. It normalizes the path, rejects anything outside `root`, and checks against `fs.realpath` so symlinks can't escape.
- `api/src/workspace/domain/is-allowed-root.ts`: a root must be inside one of `DOTY_WORKSPACE_ROOTS` (comma-separated; defaults to `BASE_CODE_PATH`/`/workspace` in Docker, and to the opened folder in VSCode).
- Every file tool and `StorageService` method goes through the resolver. The context interceptor rejects requests whose root is not allowed.
- Specs: traversal, absolute paths, symlink escape, and a root prefix trick (`/work` vs `/workspace2`).

### 0.2 Test setup

- API: Jest is already configured, but there are no `*.spec.ts` files. Add specs for the existing `CommandPolicyService` rules (extract them into `domain/command-policy.ts` first) and for message parsing.
- UI: add `vitest` (works with Vite) for pure functions only (`domain/` files). No component tests for now.

### 0.3 Remove `process.cwd()` assumptions

`prompts.service.ts`, `memory.service.ts`, `createAgent/tool.ts` and `componentBlueprint/index.ts` resolve paths from `process.cwd()`. That breaks as soon as the API runs from somewhere else (VSCode extension, `dist/`).
- `api/src/config/app-paths.ts`: one place that resolves `skillsDir` (copied to `dist` via `nest-cli.json` `assets`), `storageDir` (`DOTY_DATA_DIR`, default `~/.doty`) and `templatesDir`.
- Prompts load the `.md` skills from `skillsDir`, not from `src/`.

---

## Phase 1 — Tool history + native approval

### Problem

1. The UI drops everything except `text` and image `file` parts before sending ([chat.transport.helper.ts:18-21](../ui/src/helpers/chat.transport.helper.ts#L18-L21)).
2. The API would reject those parts anyway: [parse-messages.helper.ts:55](../api/src/chat/helpers/parse-messages.helper.ts#L55) only accepts `text` and `file`.
3. The result: in every new turn the model only sees prose. It doesn't know which files it read or edited, which commands it ran, or what they returned, so it repeats work or makes up state.
4. Bash approval works by sending a fake user message (`[bash-approval-control] …`) and splicing a synthetic tool part into the UI ([bashApprovalCard.tsx](../ui/src/components/primitives/bashApprovalCard.tsx)). The approval is not part of the tool call, so history is wrong, and the `bashApprovalPending` stop condition is a workaround.

### Decision **(decided)**

The client sends full UI message parts (tool calls + results). IndexedDB stays the source of truth and the API stays stateless. Bash approval moves to the AI SDK's native tool approval.

### How — UI

New UI pieces go in `ui/src/features/chat/{domain,api,hooks,components}`. The existing tree (`components/chat/…`, `helpers/`, `lib/`) stays where it is; only the parts touched by this phase are extracted.

- `ui/src/features/chat/domain/build-request-messages.ts` (pure, tested), which replaces `normalizeMessage`:
  - keeps `text`, image `file`, `tool-*`, `dynamic-tool` and `reasoning` (Anthropic needs reasoning + signature together with tool calls);
  - drops `step-start` and `data-*` parts (UI-only);
  - drops empty assistant placeholders (current behavior).
- `ui/src/features/chat/domain/truncate-tool-outputs.ts`: in all turns except the latest, any tool `output` larger than N chars (default 4k) becomes `{ truncated: true, preview, originalSize }`. The latest turn is sent in full. This keeps the payload and tokens under control, and the full output stays in IndexedDB for display.
- `useChat({ sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses })`.
- `BashApprovalCard` (moved to `features/chat/components/ToolApprovalCard.tsx`) renders any tool part in state `approval-requested`. Only the latest message can answer; on older messages the card shows "not answered":
  - **Allow** → `addToolApprovalResponse({ id, approved: true })`
  - **Deny** → `addToolApprovalResponse({ id, approved: false, reason })`
  - **Suggest alternative** → deny with `reason: "User suggests running instead: <cmd>"`. The model sees the reason and retries.
- Remove `APPROVAL_CONTROL_PREFIX`, the `setMessages` splice and the `/agent/bash-approvals/*` fetches.
- Persisting assistant parts already works (`persistAssistantMessage(…, message.parts)`). Approval round-trips update the same assistant message, so `onFinish` persistence must upsert by message id instead of appending. `onFinish` fires twice for that message (approval requested, then after the turn continues), each time with the full parts, so the record's parts are replaced, not appended (`domain/to-assistant-record.ts`). The Dexie record id is the `useChat` message id. The API passes the validated UI messages as `createUIMessageStream({ originalMessages })`: without it the `start` chunk carries a fresh id and the client renames the message mid round-trip; with it, a continuation (last message = assistant) keeps that message's id.
- Old conversations: `[bash-approval-control]` user messages and the hand-made `tool-run_bash_command` parts (`approvalId`, no `toolCallId`) stay in IndexedDB and on screen, but `build-request-messages` drops them (`domain/legacy-approval.ts`). No DB migration.

### How — API

- `chat/domain/validate-attachments.ts`: keeps the current image rules (types, 5 MB, 4 per message, data-URL check). These are pure and get tests.
- `chat/domain/close-dangling-tool-calls.ts`: tool parts left in `input-streaming`/`input-available` (stream aborted mid-call) become `output-error` with "interrupted by user". Otherwise `convertToModelMessages` throws `MissingToolResultsError`.
  - Unanswered approvals are closed too: an `approval-requested` part in any message but the last (the user typed a new message instead of answering) becomes `output-error` ("approval request was not answered"). A responded-but-not-run approval in an earlier message becomes `output-denied` (denied) or `output-error` (approved).
- `chat/domain/validate-message-content.ts`: the SDK schema accepts `role: "system"` and empty messages, so Doty rejects both here (plus the 100k text cap).
- Pipeline (`chat/domain/prepare-chat-messages.ts`, called by the controller): `safeValidateUIMessages({ messages, tools })` → `validateMessageContent` → `validateAttachments` → `closeDanglingToolCalls` → `convertToModelMessages(messages, { tools })`.
- Approval uses `streamText({ toolApproval })`. Tool-level `needsApproval` is deprecated in `ai@7` ("tool approval is handled on a `generateText` / `streamText` level now"), so no tool sets it. Each tool that needs a decision registers a `ToolApprovalPolicy`, and `buildToolApprovalMap` turns them into the map:
  ```ts
  // chat.service.ts
  getToolApproval() {
    return buildToolApprovalMap({ ...bash.createApprovalPolicies(root) /* , ...mcp, ...subagents */ });
  }
  // chat-stream.service.ts
  streamText({ tools, toolApproval: chatService.getToolApproval(), experimental_toolApprovalSecret, … })
  ```
  Bash policy (`bash/domain/bash-approval-policy.ts`): `allowed` → `not-applicable`, `approval_required` → `user-approval`, `blocked` → `{ type: 'denied', reason }`. The model gets the denial reason as the tool result (`execution-denied`) and continues in the same stream. In the UI message the SDK leaves an automatic denial as `approval-responded` with `approved: false, isAutomatic: true`, so the UI treats that state as denied. `execute` still refuses `blocked` commands as a safety net and passes `abortSignal` to `execFile`.
- Set `experimental_toolApprovalSecret` so the client can't forge approvals. Source: env `DOTY_APPROVAL_SECRET`; otherwise a secret generated on first start and saved to `DOTY_DATA_DIR/approval-secret` (mode 600), so persisted approval cards survive API restarts. If a signature still fails (secret changed), the stream error says "approval expired, ask again".
- Delete `BashApprovalService`, `BashApprovalController`, the `bashApprovalPending` stop condition and `requestContext.bashApprovalPending`.
- `chat/domain/approval-policy.ts`: one `ToolApprovalPolicy` (`(input) → { decision: never | ask | always-deny, reason? }`) and `buildToolApprovalMap(policies)`, which produces the `toolApproval` map. Bash, MCP (Phase 3) and write-capable subagents (Phase 4) all plug into that map; none of them sets per-tool `needsApproval`. Optional later: an "ask before file edits" setting.

### Controller split (while touching it)

`chat.controller.ts` currently parses input, resolves the model, builds the stream and wires subagent events. Split it into:
- `chat/delivery/chat.controller.ts`: HTTP only
- `chat/data/chat-stream.service.ts`: `streamText` + UI stream
- `chat/domain/prepare-chat-messages.ts`: the validation pipeline above

### Tests
`build-request-messages`, `truncate-tool-outputs`, `close-dangling-tool-calls`, `validate-attachments`, `validate-message-content`, `approval-policy`, `bash-approval-policy`, `prepare-chat-messages`, `legacy-approval`, `to-assistant-record`.

Jest note: `ai@7` is ESM-only. `api/package.json` lets ts-jest transform `ai`, `@ai-sdk/*` and their ESM deps (`transformIgnorePatterns`).

### Done when
In turn 2 the model can answer "which files did you change in the previous turn?" without re-reading. Bash approval works after a page reload (the approval request is persisted in the message).

---

## Phase 2 — Multi-provider

### Decision **(decided)**
A per-conversation provider/model picker in the UI. The API exposes only the providers that have keys configured. Subagents can override the model.

### How — API (`api/src/llm/`)

- `domain/provider-catalog.ts`: static catalog of providers and known models with capabilities:
  ```ts
  { id: 'anthropic', label: 'Anthropic', envKey: 'ANTHROPIC_API_KEY',
    models: [{ id: 'claude-sonnet-5-5', contextWindow, supportsTools: true, supportsImages: true,
               supportsReasoning: true, pricing: { inputPerMTok, outputPerMTok, cacheReadPerMTok } }] }
  ```
  Initial providers: `openai` (`@ai-sdk/openai`, already installed), `anthropic` (`@ai-sdk/anthropic`), `deepseek` (`@ai-sdk/deepseek`), and `openai-compatible` (`@ai-sdk/openai-compatible`, for OpenRouter / Ollama / LM Studio via `OPENAI_COMPATIBLE_BASE_URL` + `OPENAI_COMPATIBLE_MODELS`). Pin versions compatible with `ai@7`.
- `domain/parse-model-ref.ts`: `"anthropic:claude-sonnet-5-5"` → `{ provider, model }`, with validation.
- `domain/available-providers.ts`: `(catalog, env) → providers whose key exists`.
- `data/provider-registry.service.ts`: builds `createProviderRegistry({...})` once, from the available providers only, and exposes `languageModel(ref)`.
- `delivery/models.controller.ts`: `GET /models` → `{ default, providers: [{ id, label, models: [...] }] }`.
- Env:
  ```dotenv
  OPENAI_API_KEY=        # OPENAI_KEY still accepted (back-compat)
  ANTHROPIC_API_KEY=
  DEEPSEEK_API_KEY=
  OPENAI_COMPATIBLE_BASE_URL=
  OPENAI_COMPATIBLE_API_KEY=
  OPENAI_COMPATIBLE_MODELS=llama3.3,qwen3-coder
  DOTY_DEFAULT_MODEL=anthropic:claude-sonnet-5-5   # falls back to openai:$OPENAI_MODEL
  DOTY_SUBAGENT_MODEL=                             # optional
  ```
- The chat body gains a `model` field. The controller validates it against the registry (unknown → 400) and falls back to the default.
- `SubagentService` resolves its model from the registry instead of calling `createOpenAI` itself.

### Provider-specific handling
- Instructions are already an array of system messages at the start, which works for Anthropic.
- Reasoning parts are kept in history (Phase 1) and sent back. For models that don't support reasoning, `build-request-messages` drops them when the conversation switches model.
- Capability gates: if `supportsImages` is false, the UI disables image paste. If `supportsTools` is false, the UI warns that agent mode is unavailable and the API sends no tools.
- Anthropic prompt caching is covered in Phase 6.

### How — UI
- `features/models/api/fetch-models.ts`, `hooks/useModels.ts`, `components/ModelPicker.tsx` (in the composer, next to `ModePopover`).
- Dexie v4: `conversations.model?: string`. A new conversation takes the last-used model (localStorage). The transport sends `body.model`.

### Tests
`parse-model-ref`, `available-providers`, the capability-based part filtering.

---

## Phase 3 — MCP client

### Decision **(decided)**
Config files in a Claude/Cursor-compatible format: global `<storageDir>/mcp.json` (`DOTY_DATA_DIR`, default `~/.doty/mcp.json`) merged with per-project `<root>/.doty/mcp.json`. Stdio + HTTP transports. Tools are named `mcp__<server>__<tool>` (sanitized, see below). Approval policy per server.

### Config format
```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": { "Authorization": "Bearer ${GITHUB_TOKEN}" },
      "approval": "ask"
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "${DATABASE_URL}"],
      "env": {},
      "approval": "never",
      "enabledTools": ["query"]
    }
  }
}
```
`approval`: `ask` (default) | `never` | an object mapping tool name → `ask|never` (unlisted tools ask). `enabledTools` / `disabledTools` are optional filters. `type` is `stdio` (implied by `command`), `http` or `sse`. There is no per-mode field: MCP tools are available in every mode.

### How — API (`api/src/mcp/`)
- Dependency: `@ai-sdk/mcp@2.0.10`, pinned: it is the release that shares `@ai-sdk/provider-utils@5.0.7` with `ai@7.0.22` (newer 2.0.x pull a second copy). `createMCPClient`; stdio transport is `Experimental_StdioMCPTransport` from `@ai-sdk/mcp/mcp-stdio`. MCP tools come back as `dynamicTool`s and the SDK resolves `toolApproval` by tool name, so the Phase 1 map applies unchanged.
- `domain/parse-mcp-config.ts`: zod schema (`mcp-config.schema.ts`) + `${VAR}` interpolation (`interpolate-env.ts`). A missing variable marks that server as `error` ("missing env X") instead of becoming an empty string (a blank token would still be sent). An invalid server only errors that server; the rest of the file loads.
- `domain/merge-mcp-configs.ts`: project config overrides global config by server name. An **untrusted project config is ignored as a whole**: only global servers apply, so a project file can't replace a global server's command by reusing its name.
- `domain/namespace-mcp-tools.ts`: rename tools and apply enable/disable filters. Names (`domain/mcp-tool-name.ts`) are sanitized to `[A-Za-z0-9_-]` and cut to 64 chars (OpenAI/Anthropic reject anything else, and one bad name fails the whole request). If two names collide after that, each gets a 6-char hash of its original server + tool, so the suffix is stable across requests.
- `domain/mcp-approval-policies.ts`: server config → `Record<toolName, ToolApprovalPolicy>` (`ask` → `ask`, `never` → `never`). `ChatService.getToolApproval()` spreads it into the Phase 1 `toolApproval` map; MCP tools never set per-tool `needsApproval`.
- `domain/cap-mcp-tool-result.ts`: each MCP tool result is capped at 50k chars (like bash `MAX_OUTPUT_SIZE`), because the Phase 1 truncation only covers older turns. It keeps the `CallToolResult` shape (the SDK's MCP `toModelOutput` reads `content`), truncates text parts, drops `structuredContent` (the model never sees it), and adds `truncated: true, originalSize`.
- `data/mcp-config.repository.ts`: reads both files and caches by mtime.
- `data/mcp-client-pool.service.ts`: keeps one connected client per `(root, serverName)`, tagged with **the hash of that server's resolved config**, so editing one server reconnects only that server. `root` is part of the key because stdio servers run with `cwd = root`. It connects lazily on the first chat request for that root, so stdio processes are not spawned on every request. Servers connect **in parallel** with a timeout (`DOTY_MCP_CONNECT_TIMEOUT_MS`, default 10s), so the first request waits at most one timeout; a timed-out stdio process is killed. It reconnects when that server's config changes, retries a failed server after 60s, notices a stdio process that exits, closes idle clients (`DOTY_MCP_IDLE_TIMEOUT_MS`, default 10 min) and closes all of them on `OnModuleDestroy`. A failing server is marked `error`, and the chat keeps working without its tools.
- `data/mcp-tools.service.ts`: what the chat consumes, `getToolkit(root) → { tools, approvalPolicies }`. It never throws.
- `data/mcp-trust.repository.ts`: **security**. A project-level `mcp.json` can spawn arbitrary commands, so its servers stay disabled until the user trusts that file. Trust is stored as a content hash in `<storageDir>/trusted-mcp.json` (mode 600) and is invalidated when the file changes.
- `delivery/mcp.controller.ts`:
  - `GET /mcp/servers?root=` → status, tool count, trust state, and the project config's content hash
  - `POST /mcp/trust` `{ root, hash }` → trust the project config; `409` if the file no longer matches the hash the user reviewed
  - `POST /mcp/:name/reconnect`
- `ChatService.getToolkit()` (async; replaces the synchronous `getTools()` + `getToolApproval()`) merges the MCP tools and their policies in one load, so tool names and the approval map always match. Mode filtering stays the same for built-in tools; MCP tools are available in all modes.

### How — UI
- MCP tools arrive as `dynamic-tool` parts. `ToolCallCard` falls back to the label "`<server>` › `<tool>`" when `TOOL_UI_MAPPING` has no entry.
- `ToolApprovalCard` uses the same label.
- Settings modal gets an "MCP servers" section (`features/mcp/{domain,api,hooks,components}`): status list, a trust button for project configs, reconnect, and an "edit config" hint (the file paths).

### Out of scope (v1)
MCP resources, prompts, sampling, OAuth flows (use header tokens for now).

### Tests
`parse-mcp-config` (interpolation, invalid shapes), `interpolate-env`, `merge-mcp-configs`, `mcp-tool-name` (sanitizing, truncation, collision suffix), `namespace-mcp-tools` (filters), `mcp-approval-policies` (approval mapping), `cap-mcp-tool-result`, `build-server-views`. Integration specs run the real `@ai-sdk/mcp` client against a stdio fixture server (`data/__fixtures__/fake-mcp-server.mjs`): tool calls, capping, parallel connect timeout, and `toolApproval` inside `streamText`. UI: `mcp-tool-label`, `describe-server-status`.

---

## Phase 4 — Subagents v2

### Today
One generic `run_subagent` tool that blocks on `generateText` with a hard-coded system prompt and read-only tools, 8 steps, OpenAI only. Progress goes through a side channel (`emitSubagentEvent` → `data-subagent`), and only `running/completed/failed` is shown ([subagent.service.ts](../api/src/chat/subagent.service.ts)).

### Decision **(decided)**
All four: defined agent types, live streaming progress, parallel execution, write-capable subagents.

### 4.1 Agent definitions
Markdown with frontmatter. Built-in agents live in `api/src/subagents/definitions/*.md`; project agents in `<root>/.doty/agents/*.md`, which override built-ins by name.
```md
---
name: explorer
description: Read-only codebase search. Use to locate code and answer "where/how is X".
tools: [list_folders, read_file, regex_search_files_content, search_content_in_file]
model: inherit            # or "anthropic:claude-haiku-5-5"
maxSteps: 15
writes: false
---
You are a code explorer. …
```
Model order for a subagent: agent frontmatter `model` (unless `inherit`) → `DOTY_SUBAGENT_MODEL` → conversation model → default. Phase 2 implements the last three (`llm/domain/resolve-subagent-model.ts`); Phase 4 adds the frontmatter step in front. A ref whose provider has no key is skipped, not an error.
Built-ins: `explorer` (read-only), `reviewer` (read-only + git read tools), `implementer` (file write tools + bash, `writes: true`).

- `subagents/domain/parse-agent-definition.ts` (gray-matter is already a dependency) + `resolve-agent-tools.ts`. The tool allowlist supports globs such as `mcp__github__*`. Subagents never get `run_subagent`, so there is no recursion.
- `run_subagent` input becomes `{ agent: z.enum(names), task, context? }`. The tool description is built per request and lists each agent's `name — description`, so the main model can choose.

### 4.2 Live progress (preliminary tool results)
- `execute` becomes an **async generator**. It runs `streamText` for the subagent and yields preliminary outputs (`{ status, steps: [{ tool, inputSummary, state }], text }`) as the subagent works. The AI SDK streams these to the UI as preliminary tool outputs on the same tool part.
- `toModelOutput` returns only the final summary to the parent model, so the subagent's transcript doesn't fill the parent's context.
- The UI's `SubagentStatusCard` reads the tool part's output directly and shows a collapsible list of steps plus streaming text. Remove `emitSubagentEvent`, `data-subagent` and the `SubagentStatusEvent` side channel.
- The abort signal from `ToolExecutionOptions` is passed to the nested `streamText`.

### 4.3 Parallel execution
- The AI SDK already runs multiple tool calls from one step concurrently. What changes:
  - prompt guidance in `behavior.md`: "launch independent subagents in the same step";
  - `subagents/domain/concurrency-limiter.ts`: a semaphore (default 4, `DOTY_MAX_PARALLEL_SUBAGENTS`) so a model emitting 10 calls doesn't flood the provider;
  - a UI layout for several running subagent cards (grouped).
- Shared state: after Phase 1 removes `bashApprovalPending`, the request context holds no mutable per-call flags, so concurrent subagents are safe.

### 4.4 Write-capable subagents
Native approval can't pause a nested `streamText` inside a tool call and wait for the UI. So:
- **Approval happens at delegation time.** `run_subagent` registers a `ToolApprovalPolicy` in the Phase 1 `toolApproval` map: `ask` when the chosen agent has `writes: true`, `never` otherwise (the policy reads `input.agent`). No per-tool `needsApproval`. The approval card shows the agent and the task ("implementer wants to: …"). After approval, the subagent can use file write tools inside the sandbox (Phase 0).
- **Bash inside subagents:** the nested `streamText` gets its own `toolApproval` map built from the same policies, with `ask` mapped to "don't run, report back" (it cannot wait for the UI). Commands the policy marks `auto` run. Commands marked `approval_required` are **not run**; they come back in the subagent's result as "needs approval: `<cmd>`", and the parent can run them through its own approval flow. `blocked` stays blocked.
- MCP tools inside subagents keep the server policy: `ask` tools are treated like `approval_required` bash commands.

### Tests
`parse-agent-definition`, `resolve-agent-tools` (globs, no recursion, writes flag), `concurrency-limiter`, nested approval decision mapping.

---

## Phase 5 — VSCode extension

### Decision **(decided)**
The extension spawns the API itself and hosts the existing UI in a Webview. The API and UI stay the same, apart from small host-awareness changes.

### Shape
New package `vscode/` (root `postinstall`/`build` scripts updated):
```
vscode/
  src/extension.ts              # activate: register view + commands
  src/api-process.ts            # spawn/stop API, port + token
  src/webview-html.ts           # load ui/dist/index.html, rewrite asset URIs, CSP, inject config
  src/host-bridge.ts            # postMessage handlers (openFile, selection, …)
  src/secrets.ts                # provider keys in SecretStorage
  package.json                  # contributes: viewsContainers (activity bar), views, commands, settings
```

### API process
- Spawned with `process.execPath` + `ELECTRON_RUN_AS_NODE=1`, so it runs on VSCode's own Node and the user doesn't need Node installed. Entry: the bundled `api/dist/main.js` (bundle with esbuild or ship `node_modules`; check `ts-morph`/eslint sizes).
- The free port is picked by the extension (`net.createServer().listen(0)`) and passed as `PORT`.
- Env: provider keys from `SecretStorage` (command "Doty: Set API key"), `DOTY_WORKSPACE_ROOTS=<workspace folders>`, `DOTY_DATA_DIR=<globalStorageUri>`, `DOTY_AUTH_TOKEN=<random>`.
- Health check on `GET /` before showing the UI. Restart on crash with backoff, kill on deactivate. API logs go to an output channel.

### API changes (small)
- `auth.guard.ts`: if `DOTY_AUTH_TOKEN` is set, every request needs `Authorization: Bearer <token>`. **Needed:** without it, any local process or web page could call a localhost API that runs bash.
- CORS: allow the `vscode-webview://` origin when the token is set; otherwise keep the current list (`DOTY_ALLOWED_ORIGINS` env).

### UI changes
- `ui/src/host/runtime-config.ts`: reads `window.__DOTY_CONFIG__ = { apiUrl, token, root, host: 'vscode' | 'browser' }` (injected by the extension), with `VITE_API_URL` as the fallback. `CHAT_API_URL` becomes `getApiUrl()`, and every fetch adds the token header.
- `ui/src/host/host-bridge.ts`: `browserHost` vs `vscodeHost` (`acquireVsCodeApi().postMessage`). Uses:
  - clicking a file path in assistant markdown / tool cards → `openFile(path, line)` in the editor;
  - "Doty: Ask about selection" command → the extension posts the selection + file into the composer;
  - root picker hidden in VSCode (the root is the workspace folder; a folder picker appears for multi-root).
- Vite `base: './'` so assets resolve via `webview.asWebviewUri`.
- Theme: map `--vscode-*` CSS variables onto the UI tokens when `host === 'vscode'`.

### Risks
- **IndexedDB inside webviews** works and persists per extension, but it can be cleared and isn't shared with the browser UI. Acceptable for v1. If shared history becomes a need, add a server-side conversation store (this would revisit the Phase 1 choice).
- Bundle size: the API pulls `ts-morph`, which is heavy. Check before choosing esbuild vs shipping `node_modules`.
- `retainContextWhenHidden: true` on the view, so streaming isn't lost when the panel is hidden (costs memory).

### Done when
Install the `.vsix`, open a folder, set a key, chat in the sidebar: tools act on the open workspace, approvals work, file links open in the editor.

---

## Phase 6 — Context management, usage/cost, stop

### 6.1 Usage & cost
- API: `toUIMessageStream({ messageMetadata })` sends `{ model, usage }` on `finish` (`totalUsage`: input, output, cached, reasoning tokens).
- `llm/domain/estimate-cost.ts`: usage × catalog pricing (tested).
- UI: small per-turn footer (`12.3k in · 1.1k out · $0.04`) and a conversation total in the header. Stored in message metadata in Dexie.

### 6.2 Context window
- Tool-output truncation of older turns: Phase 1.
- `chat/domain/estimate-tokens.ts` (chars/4 heuristic, then refined with the real `usage.inputTokens` from the previous turn).
- When the estimate passes ~75% of the model's `contextWindow`:
  1. `pruneMessages({ reasoning: 'before-last-message', toolCalls: 'before-last-3-messages' })`;
  2. if it's still too large, summarize the older turns with a cheap model (`DOTY_SUMMARY_MODEL`) into one summary system message. The API returns it as a `data-compaction` part `{ summary, upToMessageId }`. The UI stores it on the conversation and from then on sends `summary + messages after upToMessageId`.
- UI shows "context 64% used" in the header.

### 6.3 Anthropic prompt caching
`llm/domain/apply-cache-control.ts`: for Anthropic models, set `providerOptions.anthropic.cacheControl = { type: 'ephemeral' }` on the last system instruction and on the last message. The skills + memory prefix is large and stable, so caching cuts cost a lot.

### 6.4 Stop / abort
- Composer: the send button becomes **Stop** while `status` is `submitted|streaming` and calls `useChat().stop()`.
- API: the abort already reaches `streamText`. Also pass `abortSignal` to `execFile` (bash), to nested subagent `streamText` and to MCP calls, so a stop actually kills running work.
- Interrupted tool calls are handled by `close-dangling-tool-calls` (Phase 1).

---

## Cross-cutting checklist per PR
- New rule → pure function in `domain/` + `*.spec.ts`.
- Keep files < ~200 lines; split while touching large ones (`storage.tools.ts` 347 lines, `git.service.ts` 318, `createAgent/tool.ts` 309, `messageItem.tsx` 270).
- No new `utils.ts`/`helpers.ts` dumping grounds.
- Update `README.md` (env vars, MCP config, VSCode install) at the end of each phase.

## Open questions (decide during implementation)
1. Phase 1: should file-edit tools also require approval by default, or only through an opt-in "ask before edits" setting? Recommended: opt-in.
2. Phase 2: hard-coded model lists vs fetching `/v1/models` from each provider. Recommended: catalog for known models (needed for pricing/capabilities) + env-listed extras.
3. Phase 5: publish to the Marketplace or ship the `.vsix` locally only.
