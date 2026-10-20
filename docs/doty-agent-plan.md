# Doty — instructions, coding-agent prompt and MCP setup

Status: proposed · Date: 2026-10-18 · Base: `feat/ui-a-english-ui` @ `d04be85` · Branch: `feat/instructions-and-mcp`

Doty picks its behaviour from a fixed list of **modes** (Frontend, Backend, Agnostic, Git, Agent Builder) and **specialties** (Landing Pages, Forms, Refactoring). The list is hard-coded in the UI and the API, a new entry means editing Doty's source (that is what Agent Builder does), and the mode also decides which tools the model gets. This plan:

1. Replaces modes and specialties with **instructions**: Markdown files the user writes ("landing pages", "forms", "our API conventions"…) and attaches to a conversation.
2. Gives the model a real **coding-agent system prompt**, so it knows it is an agent working on real files with real tools, in which environment, and how to behave.
3. Lets the user **configure MCP servers from the Doty interface**, opened with `/mcp` in the message box.

## Summary

| Session | Phase | Why | Size | Depends on |
|---------|-------|-----|------|------------|
| A | 1 — Coding-agent prompt (API) | The model is only told "The user project is <root>" | M | — |
| B | 2 — Instructions (API) | User-defined guidance instead of hard-coded specialties | M | A |
| C | 3 — MCP config writes (API) | The UI can only read `mcp.json` today | M | — (may run alongside A or B) |
| D | 4 — Instructions replace modes (UI) | One concept the user controls, not two fixed pickers | L | B |
| E | 5 — Remove modes (API cleanup) | Dead code, mode-gated tools, Agent Builder | M | D |
| F | 6 — Slash commands in the message box | `/mcp`, `/instructions`, `/new`, `/<instruction>` | M | D |
| G | 7 — MCP dialog (UI) + `/mcp` | Add, edit, enable and trust servers without editing JSON | L | C, F |
| H | 8 — Wrap-up: VSIX, docs, end-to-end check | Ship it and check it in VS Code | S | all |

Recommended order: A → B → D → E, with C at any point before G; then F → G → H. One session at a time, except C, which only touches `api/src/mcp/` and may run in parallel with A or B.

All new code follows the repo conventions: small single-purpose files, pure rules in `domain/` with `*.spec.ts`, IO in `data/`, HTTP in `delivery/` (API); `domain/ api/ hooks/ components/` per feature (UI). Components only render.

## Working across sessions (read this first)

Each phase is done in its own agent session, and no session remembers the previous ones. **This file is the only record of what was done.** Every session must:

1. **Start** by reading this whole file, especially the **Progress** blocks of the phases this one depends on. They must say `Status: done`. Also run `git log --oneline -15` to check that their commits are there. If a dependency isn't done, stop and say so.
2. **Don't create a branch.** All sessions work on `feat/instructions-and-mcp`, one after another. Check with `git branch --show-current`; if you're elsewhere, `git switch feat/instructions-and-mcp` (only with a clean working tree).
3. **Tick checkboxes** (`- [x]`) in your phase as each item is finished and verified. Never tick something that isn't done.
4. **Record pin points.** After each meaningful step, and always before the session ends, update your phase's **Progress** block: `Status` (`not started` / `in progress` / `done` / `blocked`), `Last commit`, `Done` (what changed, main files), `Left`, `Notes` (decisions, deviations, pitfalls, what the next session must know).
5. **Commit** small, focused commits with the plan update included. Stage only your files (`git add <paths>`; never `git add -A` or `git commit -a`).
6. **Edit only your own phase's section and Progress block.** If another phase must change, say so in your `Notes`.
7. **Finish** with type-check, lint and tests passing in every package touched (`pnpm --dir <pkg> typecheck|lint|test`; the API uses `lint:check`, `vscode` has no lint), and say so in `Notes`. If something fails and you can't fix it, set `Status: blocked` and explain.

## How things work today (verified on `d04be85`)

- **Prompt** ([prompts.service.ts](../api/src/common/helpers/prompts.service.ts)): system messages in this order: `buildBaseInstruction(root)` ("The user project is <root>" + reply-language rule), [behavior.md](../api/src/common/agents/skills/behavior.md), the project's `.agents/*.md`, `skills/<mode>/` (`index.md`, `default/*`, `specialty/<specialty>.md`), `plugin/skills/<mode>/`, [memory.md](../api/src/common/agents/skills/memory.md), project memory. Nothing tells the model it is a coding agent, what tools it has, where it runs (VS Code or web, OS, shell), or what to do when the model has no tool support.
- **Mode skills** are 200–250-line "pipelines" with quality gates ([agnostic/index.md](../api/src/common/agents/skills/agnostic/index.md), `frontend/index.md`, `backend/index.md`). They push plans and checklists on every request, which contradicts `behavior.md` ("don't impose plans…"). Frontend mode always adds `default/design.system.md`.
- **Mode decides tools** ([chat.service.ts](../api/src/chat/chat.service.ts) `getCustomTools`): git tools only in `git`, `create_component_blueprint` only in `frontend`, Agent Builder tools only in `agent_builder` ([tools.plugins.service.ts](../api/src/common/agents/plugin/tools/tools.plugins.service.ts)). `create_commit` has **no approval** today.
- **Request**: the UI sends `chatMode` / `chatSpecialty` ([chat.transport.helper.ts](../ui/src/helpers/chat.transport.helper.ts)); [chat.controller.ts](../api/src/chat/delivery/chat.controller.ts) stores them as `mode` / `specialty` in the request context.
- **UI**: `AgentFocusEnum` / `AgentSpecialtyEnum` ([agent.enum.ts](../ui/types/enum/agent.enum.ts)), `CHAT_MODE_OPTIONS` / `CHAT_SPECIALTY_OPTIONS` ([chat.const.ts](../ui/types/consts/chat.const.ts)), plugin entries in [specialty.plugin.ts](../ui/types/plugin/specialty.plugin.ts) (written by Agent Builder), the picker in `features/agent-picker/`, starter prompts and empty-state heading per mode, and the new-project label/template per mode.
- **Subagents** already use the pattern instructions need: Markdown + frontmatter, built-ins merged with `<root>/.doty/agents/*.md` ([agent-definitions.repository.ts](../api/src/subagents/data/agent-definitions.repository.ts), `merge-agent-definitions.ts`).
- **MCP**: config in `~/.doty/mcp.json` (global) and `<root>/.doty/mcp.json` (project, off until trusted by content hash), parsed by [parse-mcp-config.ts](../api/src/mcp/domain/parse-mcp-config.ts) against [mcp-config.schema.ts](../api/src/mcp/domain/mcp-config.schema.ts). The API only exposes `GET /mcp/servers`, `POST /mcp/trust` and `POST /mcp/:name/reconnect`; the settings dialog lists servers and shows the file paths. Adding a server means editing JSON by hand.
- **Message box**: no slash commands. Enter sends; Esc stops the response (Phase 6 of the UI plan).

---

## Phase 1 — Coding-agent prompt (Session A)

**Goal:** whatever model runs (Claude, GPT, DeepSeek, a small local model through the OpenAI-compatible provider), it must know from the first system message that it is **Doty, a coding agent acting on the user's real workspace through tools**, and how to work.

### Prompt layout

Static parts first and dynamic parts last, so provider prompt caching keeps working:

1. **Identity** (static, in code): `prompts/domain/build-agent-identity.ts`.
2. **Behaviour** (static, editable): `behavior.md` (keep; remove the bullets the identity now covers).
3. **Tool guide** (static per toolset): `prompts/domain/build-tool-guide.ts(toolNames)`. It only mentions tools that are actually in this request's toolset, so the prompt never promises a tool that isn't there.
4. **Project instructions**: `AGENTS.md` at the root (the cross-tool convention), then the legacy `.agents/*.md`.
5. **Selected instructions** (Phase 2).
6. **Memory rules + project memory** (as today).
7. **Environment** (dynamic, per request): `prompts/domain/build-environment-block.ts`.

### Identity (draft wording; refine, but keep every point)

> You are Doty, an autonomous coding agent. You work inside the user's software project through tools: you read and search files, edit and create files, run shell commands, and use git. Your changes are real: they are written to the user's disk, and commands run on their machine.
>
> How you work: understand the request → inspect the relevant code (read before you edit; never guess file contents) → make the smallest change that does the job, following the project's existing patterns → verify it (type-check, lint, tests, or running the code) → report what changed and what you checked.
>
> - Use your tools instead of asking the user to paste code or run commands for you.
> - Some tools ask the user for approval. If the user denies a call, don't retry the same call; adjust or ask.
> - Stay inside the workspace. Don't run destructive commands (deleting data, force-pushing, rewriting history) unless the user explicitly asked.
> - Never claim a check you didn't run, or a file you didn't read.
> - Refer to code as `path:line` (the interface makes these clickable). Show code blocks for snippets and proposals, not for whole files you have already written.

When the selected model has no tool support (`supportsTools: false`), the identity says instead that tools are unavailable in this conversation: the model can't read or change files, must say so when asked to, and can only explain and propose code.

### Environment block

```
Environment
- Interface: VS Code extension (or: web app)
- Workspace roots: /path/a, /path/b · active root: /path/a
- Platform: darwin 24.5 · shell: /bin/zsh
- Date: 2026-10-18
- Git: branch feat/x, 3 changed files (or: not a git repository)
- Model: anthropic:claude-sonnet-5-5 · tools: available
- Instructions in use: landing-pages, forms
```

- The interface comes from a new env var `DOTY_CLIENT` (`vscode` set by [build-api-env.ts](../vscode/src/domain/build-api-env.ts); default `web`). Don't trust a request field for this.
- Git status: `git status --porcelain=v1 -b` with a ~1 s timeout; on failure or timeout, leave the line out. Count only; never list file names (keeps the block small and stable).

### Checklist

- [x] `build-agent-identity.ts` (+ spec): tools/no-tools variants; the spec asserts the key facts (Doty, coding agent, real files, verify, approvals, `path:line`).
- [x] `build-tool-guide.ts` (+ spec): short per-group guidance (files: read before edit, prefer `edit_file` over `overwrite_file`; search before guessing paths; bash: non-interactive commands, check exit codes; git: inspect with status/diff before committing, commit only when asked; subagents: self-contained tasks only; MCP: external systems, mind side effects). A group appears only if one of its tools is present.
- [x] `build-environment-block.ts` (+ spec) and `data/read-git-summary.ts` (IO, timeout).
- [x] `AGENTS.md` loading in `skill-loaders.ts` (+ spec).
- [x] `PromptsService.getInstructions` takes the toolset/model info it needs and assembles the new order. `buildBaseInstruction` merges into identity + environment (keep `REPLY_LANGUAGE_RULE` in code).
- [x] Subagents get the environment block too (their definitions already describe their role).
- [x] `api/scripts/preview-prompt.ts` (`pnpm --dir api prompt:preview -- --root <dir> --model <ref>`): prints the assembled system prompt, for humans to read. Add a snapshot spec of the assembled prompt for a fixture setup, so accidental prompt changes show up in review.
- [ ] Manual check with one strong model and one small OpenAI-compatible model (record the results in Notes): "Who are you and what can you do here?" (says coding agent + workspace + tools); "What scripts does package.json have?" (calls `read_file`, doesn't ask for a paste); "Fix the failing test in <file>" (reads, edits, runs the test, reports); the same question on a no-tools model (says it can't access files).

#### Progress

```
Status: in progress (code done; manual model check left)
Last commit: see `git log` — "feat(api): coding-agent system prompt (Phase 1)"
Done:
- Identity, tool guide, environment block as pure builders with specs in
  api/src/common/helpers/prompts/domain/ (build-agent-identity, build-tool-guide,
  build-environment-block, parse-git-status, resolve-doty-client).
  REPLY_LANGUAGE_RULE now lives in build-agent-identity.ts;
  build-base-instruction.ts was deleted.
- prompts/data/read-git-summary.ts: `git status --porcelain=v1 -b`, 1 s timeout;
  "not a git repository" is reported, any other failure leaves the line out.
- prompts/load-system-prompt.ts assembles the order (identity → behavior.md →
  tool guide → AGENTS.md → .agents/ → mode skills → plugin skills → memory.md →
  project memory → environment). Snapshot spec: load-system-prompt.spec.ts
  (uses the shipped behavior.md / memory.md, so edits to them show in review).
- EnvironmentService (common/helpers/environment.service.ts) collects the facts;
  WorkspaceService gained a `roots` getter.
- PromptsService.getInstructions({ model, toolNames }); ChatStreamService passes
  the toolset actually given to the model (empty for no-tools models).
- Subagents: instructions = [definition body, environment block].
- behavior.md: dropped the language, coding-task, report and subagent bullets
  (now in identity / tool guide).
- AGENTS.md loader (skill-loaders.ts `loadAgentsFile`, + spec).
- vscode build-api-env.ts sets DOTY_CLIENT=vscode (+ spec).
- `pnpm --dir api prompt:preview -- --root <dir> [--model <ref>]`
  (scripts/preview-prompt.ts, ts-node; boots the real Nest app, so it also
  connects the root's MCP servers). `scripts/` is excluded in tsconfig.build.json
  so dist keeps its layout.
Left:
- Manual check with a strong model and a small OpenAI-compatible model (last
  checklist item). Not run in this session: it needs real model calls through
  the UI; do it before Phase 8 at the latest and record the results here.
Notes:
- Checks: api typecheck, lint:check, test (78 suites / 450 tests, 1 snapshot);
  vscode typecheck, test (20). All pass.
- Shell in the environment block is always `bash`: run_bash_command runs
  `bash -lc` whatever the user's $SHELL is.
- memory.md is only included when tools are available (it is about
  save_project_memory). It is still a 5-phase "pipeline" that contradicts
  behavior.md; Phase 2 or 5 should shorten it like the mode skills.
- Pre-existing quirk, not changed: MarkdownService renders every skill /
  AGENTS.md to HTML (marked) before it goes into the prompt (see the preview
  output). Plain Markdown would be cheaper and clearer for the model; consider
  switching PromptsService.readMarkdown to the frontmatter-stripped Markdown
  (the snapshot spec already reads it that way).
- "Instructions in use" line: EnvironmentService.describe accepts
  `instructionNames`; Phase 2 should pass the selected names.
- Selected instructions (Phase 2) go between project instructions and memory,
  where the mode skills are now.
- Without a mode, the toolset contains the Agent Builder plugin tools and no
  git tools (getCustomTools); the guide follows the toolset. Fixed in Phase 5.
```
---

## Phase 2 — Instructions (API) (Session B)

**Instruction file** (Markdown + frontmatter, like subagent definitions). The file name is the id:

```md
---
name: Landing pages
description: Conversion-focused landing pages: sections, copy hierarchy, responsive layout.
starters:
  - Build a landing page for a SaaS product with pricing and FAQ
---
Guidance in plain Markdown…
```

**Scopes**, merged by id (project wins over global, global over built-in):

- built-in: `api/src/instructions/builtin/*.md` (shipped; read-only)
- global: `<DOTY_DATA_DIR>/instructions/*.md` (default `~/.doty/instructions/`)
- project: `<root>/.doty/instructions/*.md` (can be committed and shared with a team)

**Built-ins**: convert the current skills into short guidance (aim for ≤ 80 lines each, no "pipelines" or quality gates): `landing-pages`, `forms`, `refactoring` (from `frontend/specialty/`), `design-system` (`frontend/default/design.system.md`), `react-architecture` (`frontend/index.md`), `backend-architecture` (`backend/index.md`), `clean-architecture` (`agnostic/index.md`). `git/index.md` moves into the git part of the tool guide (Phase 1).

### Checklist

- [x] `api/src/instructions/` module: `domain/parse-instruction.ts` (+ spec: frontmatter, missing name → id, invalid `starters` dropped), `domain/merge-instructions.ts` (+ spec: precedence, `source` per entry), `domain/validate-instruction-id.ts` (+ spec: `^[a-z0-9][a-z0-9-]{0,63}$`), `data/instructions.repository.ts` (reads all three scopes; project paths through `WorkspaceService`; mtime cache like `McpConfigRepository`).
- [x] Limits: a body over 20 KB is rejected on write and truncated with a notice on read; at most 8 instructions per request.
- [x] Endpoints (behind the existing auth guard): `GET /instructions?root=` (id, name, description, starters, source, editable), `GET /instructions/:id?root=` (with body), `PUT /instructions/:scope/:id` (`scope` = `global` | `project`; body: name, description, starters, content; atomic write), `DELETE /instructions/:scope/:id`. Built-ins can't be written or deleted; "edit" a built-in = save a copy in global or project scope with the same id.
- [x] Chat request field `instructions: string[]` → request context `instructionIds`. Unknown ids are ignored (logged once). `PromptsService` loads the selected bodies as one system message each, headed `Instruction "<name>" (selected by the user):`. Modes still work during the transition (removed in Phase 5).
- [x] Copy `instructions/builtin/*.md` into `dist` (`nest-cli.json` assets); the VS Code build already copies every `.md` under `api/dist` (check `vscode/scripts/build.mjs`).
- [x] Security note in the repository code: project instructions are prompt text from the repo, as trusted as `AGENTS.md`; they can't run anything by themselves. The UI shows their source (Phase 4).

#### Progress

```
Status: done
Last commit: see `git log` — "feat(api): user instructions replace specialties (Phase 2)"
Done:
- api/src/instructions/ (InstructionsModule, imported by AppModule and HelperModule):
  - domain/: instruction.types, instruction-limits, validate-instruction-id,
    parse-instruction (lenient: name → id, bad starters dropped, body capped),
    cap-instruction-content (20 KB, UTF-8 safe, notice), merge-instructions
    (project > global > built-in, sorted by name), validate-instruction-input
    (zod; write-time limits incl. 20 KB → 400), serialize-instruction,
    select-instructions (request order, dedupe, max 8, unknown ids),
    format-instruction-message, to-instruction-view. All with specs.
  - data/: instructions.repository (three scopes; project paths through
    WorkspaceService.resolveIn; security note in its doc comment),
    instruction-files (readdir + per-file mtime/size cache; invalid files are
    skipped with a warning), write-file-atomic (temp + rename),
    instruction-selection.service (logs each unknown id once).
    Integration spec on temp dirs.
  - delivery/instructions.controller.ts: GET /instructions?root=,
    GET /instructions/:id?root=, PUT /instructions/:scope/:id (root in query or
    body; returns the written entry with `source` = scope), DELETE
    /instructions/:scope/:id?root= (204, 404 when that scope has no file).
  - builtin/*.md: landing-pages, forms, refactoring, design-system,
    react-architecture, backend-architecture, clean-architecture (39–54 lines
    each, no pipelines). builtin-instructions.spec.ts checks they all parse and
    stay short.
- AppPaths: builtinInstructionsDir (`<baseDir>/instructions/builtin`),
  globalInstructionsDir (`<DOTY_DATA_DIR>/instructions`). nest-cli.json copies
  `instructions/builtin/*.md`; vscode/scripts/build.mjs already copies every .md
  under api/dist (checked: dist/instructions/builtin/ has all 7).
- Chat: body `instructions: string[]` → context `instructionIds`
  (chat/domain/read-instruction-ids.ts). PromptsService adds one system message
  per selected instruction (after project instructions and mode skills, before
  memory) and their ids to the environment block ("Instructions in use").
- prompt:preview takes `--instructions <id,id>`.
Left: —
Notes:
- Checks: api typecheck, lint:check, test (90 suites / 495 tests, 1 snapshot),
  build. Manual HTTP check on the built API (temp DOTY_DATA_DIR/WORKSPACE_ROOTS,
  auth token): list, get, PUT project/global, 400 for built-in scope, bad id and
  missing content, 403 for a root outside the workspace, DELETE 204 then 404,
  file written to <root>/.doty/instructions/forms.md. Preview with
  `--instructions forms,nope` shows the instruction message, the environment
  line, and one "Ignored unknown instructions: nope" warning.
- Phase 1's manual model check is still open (Phase 1 Progress); it does not
  block this phase's code.
- Instruction bodies go to the model as plain Markdown (not through
  MarkdownService's HTML rendering, unlike the skills).
- YAML pitfall: frontmatter values containing ": " must be quoted (the built-in
  descriptions are). serialize-instruction uses gray-matter's stringify, which
  quotes as needed; the UI never writes YAML itself.
- The old skills (skills/frontend|backend|agnostic|git) and modes still work;
  Phase 5 deletes them. Mode skills and selected instructions can both be in a
  prompt during the transition.
- Phase 4 (UI): list entries carry `editable` (false for built-ins). "Edit" on a
  built-in = PUT to global/project with the same id; that copy then shadows the
  built-in (DELETE it to get the built-in back).
```
---

## Phase 3 — MCP config writes (API) (Session C)

### Checklist

- [x] Schema: add `disabled?: boolean` to both server shapes; `parse-mcp-config` skips disabled servers but still lists them (status `disabled`).
- [x] Pure edits on the file text, each with a spec: `domain/upsert-mcp-server.ts`, `remove-mcp-server.ts`, `set-mcp-server-disabled.ts`, `set-mcp-tool-approval.ts`. They keep the other servers and unknown top-level keys, write 2-space JSON, and validate the new server against `mcpServerSchema` before returning.
- [x] Secrets: `domain/mask-mcp-secrets.ts` (+ spec) replaces literal values in `env` and `headers` with `"••••"` in responses (`${VAR}` references are shown as-is); `merge-masked-secrets.ts` (+ spec) keeps the stored value when an update sends the mask back unchanged.
- [x] Endpoints: `GET /mcp/servers` gains `scope`, `disabled`, masked `config`, and the file `hash` per scope. `PUT /mcp/servers/:name` `{ scope, config, baseHash }`, `DELETE /mcp/servers/:name?scope=&baseHash=`, `PATCH /mcp/servers/:name` `{ scope, disabled?, toolApproval? }`.
- [x] Concurrency: `baseHash` must match the file's current hash, or the answer is `409` with the fresh list (the file was edited elsewhere).
- [x] Writes are atomic (temp file + rename). The global file is written with mode `0o600` (it may hold tokens). The project file goes through the workspace sandbox and creates `.doty/` if needed.
- [x] A project write by the user through the UI is consent: re-trust the new content hash right after writing, so the server doesn't switch off.
- [x] After a write, the client pool reconnects only the changed server, or closes it when removed or disabled.
- [x] Integration spec on a temp dir: add → list → edit (with masked secret kept) → disable → remove, plus a 409 case.

#### Progress

```
Status: done
Last commit: see `git log` — "feat(api): write MCP config from the API (Phase 3)"
Done:
- Schema: `disabled?: boolean` on both server shapes. parse-mcp-config keeps a
  disabled server (not interpolated, so missing env vars don't error it) with
  `disabled: true`; isUsableServer excludes it; views show status `disabled`.
- Pure edits on file text (api/src/mcp/domain, each with a spec):
  mcp-config-text (read/write document, keeps unknown top-level keys, 2-space
  JSON + newline, McpConfigEditError kinds, server-name rule
  `^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$`), upsert-mcp-server (validated with
  mcpServerSchema, stored as sent so unknown fields survive), remove-mcp-server,
  set-mcp-server-disabled (false removes the key), set-mcp-tool-approval
  ("ask" removes the key; "never" or a per-tool map), read-raw-servers.
- Secrets: mask-mcp-secrets (literal env/headers values → "••••"; values with
  `${VAR}` shown as is), merge-masked-secrets (mask → stored value of the same
  key; a mask with nothing stored is a 400).
- data/mcp-config-edits.service.ts: base-hash check (McpConfigConflictError),
  atomic write via McpConfigRepository.write (global 0o600; project through
  WorkspaceService.resolveIn, `.doty/` created), re-trust after a project write,
  pool.disconnect(root, name) then background reconnect only when the server is
  still active and usable (removed/disabled → closed).
- common/fs/write-file-atomic.ts (moved from instructions/data, gained `mode`;
  + spec). Instructions repository uses it.
- Endpoints (mcp.controller.ts): GET /mcp/servers adds per server `scope`,
  `disabled`, masked `config` (raw entry, before interpolation) and
  `globalConfig.hash` (projectConfig already had it). PUT /mcp/servers/:name
  `{ scope, config, baseHash }`, DELETE /mcp/servers/:name?scope=&baseHash=,
  PATCH /mcp/servers/:name `{ scope, disabled?, toolApproval?, baseHash? }`
  (400 when neither field). All answer with the refreshed list; 409 bodies carry
  the fresh list too. baseHash: omitted = no check; null or "" = "the file must
  not exist yet".
- Integration spec (data/mcp-config-edits.integration.spec.ts, temp dirs, real
  repositories, fake pool): add → list → edit with masked secret kept →
  disable → per-tool approval → remove; 409; global file 0o600 + unknown keys
  kept; outside edit still revokes trust; 400/404 cases.
- UI (small, to avoid a crash): McpServerStatus gains "disabled" and
  describeServerStatus handles it (+ spec). The rest of the UI is Phase 7.
Left: —
Notes:
- Checks: api typecheck, lint:check, test (100 suites / 517 tests), build; ui
  lint, typecheck, test (171). HTTP smoke on the built API with a temp
  DOTY_DATA_DIR and auth token: PUT global (token masked in the response,
  stored in the file, mode 600, status `connecting` right after), PATCH disable,
  PATCH with a stale hash → 409 + list, PUT project → trusted, DELETE, DELETE
  unknown → 404.
- The list still shows only the effective servers: a global server overridden
  by a project server of the same name isn't listed, so it can't be edited from
  the UI while overridden. Phase 7 may want the API to list both; it would need
  an extra `overridden` entry in the response.
- PATCH accepts an optional baseHash; the UI should send it.
```
---

## Phase 4 — Instructions replace modes (UI) (Session D)

**In the message box**, the agent picker becomes an **Instructions** chip: `[✎ Landing pages +1 ▾]`, or `[✎ Instructions ▾]` when none are selected. It opens a multi-select list (search, check rows, source badge `built-in` / `global` / `project`) with "Manage instructions…" at the bottom.

**Manage dialog**: list by source; create, edit, duplicate (a built-in becomes an editable copy) and delete; fields: name, id (derived from the name, editable on create), description, starters (one per line), body (plain textarea; a Markdown preview is optional), scope (global or project).

**Selection** is stored per conversation (`instructionIds` on the conversation in [chatDb.ts](../ui/src/lib/chatDb.ts)). A new conversation starts with the last selection used in that project (localStorage, keyed by root).

### Checklist

- [x] `features/instructions/`: `api/instructions.api.ts`, `domain/` (selection rules, chip label, id-from-name, form validation; all with specs), `hooks/useInstructions.ts` (list, cache, refetch on root change), `hooks/useInstructionSelection.ts`, `components/InstructionsPicker.tsx`, `InstructionsDialog.tsx`, `InstructionForm.tsx`.
- [x] Transport sends `instructions` and no longer sends `chatMode` / `chatSpecialty`.
- [x] Starter prompts come from the selected instructions' `starters`, falling back to a default set; one empty-state heading ("What do you want to build?").
- [x] New-project dialog: an explicit template choice (`vite-base`, `next-base`, `nest-base` from `templates/`) instead of deriving it from the mode.
- [x] Remove: `features/agent-picker/`, `useAgentChoice`, `agent.enum.ts`, `CHAT_MODE_OPTIONS`, `CHAT_SPECIALTY_OPTIONS`, `types/plugin/specialty.plugin.ts`, `focus` / `specialty` in `ProjectContext` (keep `reference`), `filterModeOptions` and `canBuildAgents` in host features, mode-based `new-project-label` and `empty-state-heading`. Saved `project-context` values with `focus` / `specialty` are read and ignored (no migration needed).
- [x] Settings dialog: drop the mode fields; keep the project root.

#### Progress

```
Status: done
Last commit: see `git log` — "feat(ui): instructions replace modes in the message box (Phase 4)"
Done:
- ui/src/features/instructions/:
  - domain/ (all with specs): instruction.types, toggle-instruction (max 8),
    resolve-selection, instructions-chip-label, instruction-id (idFromName,
    isValidInstructionId), filter-instructions, pick-conversation-instructions,
    instruction-form (empty/edit/duplicate, validation mirroring the API,
    formToInput), group-by-source.
  - api/: one file per endpoint (fetch-instructions, fetch-instruction,
    save-instruction, delete-instruction over request-instructions),
    last-instructions.storage (localStorage `doty:last-instructions:<root>`),
    save-conversation-instructions. The plan's single `instructions.api.ts`
    was split per endpoint, like features/mcp/api.
  - hooks/: useInstructions (list per root + save/remove), useInstructionSelection
    (per conversation, like useConversationModel), useInstructionEditor (dialog
    flow: create/edit/duplicate/delete, id follows the name until edited).
  - components/: InstructionsPicker (+Row, SourceBadge), InstructionsDialog,
    InstructionList, InstructionForm.
- chatDb v5: conversations.instructionIds (non-indexed). A conversation without
  it adopts the current selection; new conversations start from the project's
  last selection.
- ChatBaseContext exposes `instructions`, `instructionSelection` and
  `isInstructionsDialogOpen` / `setIsInstructionsDialogOpen` (Phase 6 can open
  the dialog with the setter). Dialog mounted in features/modal/instructions.tsx.
- Transport sends `instructions` (ids), no `chatMode` / `chatSpecialty`.
- Empty state: one heading; starters from the selected instructions (deduped,
  max 4, long labels shortened), default set otherwise.
- New project: "New project" menu item (browser only), explicit template select
  over all PROJECT_TEMPLATE_OPTIONS (vite-base default; nest-vite-base kept: the
  API composes it).
- Removed: features/agent-picker/, useAgentChoice, agent.enum.ts,
  CHAT_MODE_OPTIONS / CHAT_SPECIALTY_OPTIONS, types/plugin/specialty.plugin.ts,
  focus/specialty in ProjectContext (old saved values are read and dropped),
  isFrontend/Backend/AgnosticMode, canBuildAgents / filterModeOptions /
  AGENT_BUILDER_MODE, new-project-label, empty-state-heading, agent-picker CSS.
- components/primitives/useEscapeKey.ts: document-level Escape for dialogs
  (focus can be on <body> after a button unmounts).
Left: —
Notes:
- Checks: ui lint, typecheck, test (43 files / 170 tests), build; vscode
  typecheck, test (20).
- Browser check (Playwright + cached headless Chromium against the built API and
  `vite --port 5299`, temp data dir and workspace): chip label and search,
  multi-select, starters follow the selection, manage dialog groups, form
  validation (errors clear as fields change), create project instruction (file
  written), edit built-in → global copy (Global group appears), Escape closes
  the dialog, chat request body = root/model/messages/instructions without
  chatMode, old `project-context` with focus/specialty rewritten without them,
  per-conversation selection kept in IndexedDB while a new conversation
  diverges, 380px layout. Scripts stayed in the session scratchpad, not the repo.
- The API still accepts chatMode/chatSpecialty until Phase 5; the UI no longer
  sends them, so mode skills and mode-gated tools are now off for UI requests
  (git tools and create_component_blueprint only come back with Phase 5).
- Deleting an instruction uses window.confirm (fine in the VS Code webview).
```
---

## Phase 5 — Remove modes (API cleanup) (Session E)

### Checklist

- [x] Remove `mode` / `specialty` from the request context, the controller and `PromptsService`; delete `skills/frontend|backend|agnostic|git/` (now built-in instructions or tool guide) and `pluginSkillsDir` from `app-paths`.
- [x] Remove Agent Builder: `common/agents/plugin/` (tools, skills, module). Instructions replace it, and it edited Doty's own source tree.
- [x] Tools no longer depend on a mode: git tools are always included (when the root is a git repository); `create_commit` gets approval `ask` through the approval map. Remove `create_component_blueprint` and its `templates/componentBlueprint` (recommended: it encoded the old frontend mode's folder structure; the `react-architecture` instruction covers the guidance). Delete `getCustomTools`.
- [x] Rename the misspelled `install_depency` tool to `install_dependency` (update the UI tool label mapping).
- [x] Update subagent toolkit comments ("of the chat mode") and any spec still mentioning modes. `grep -rn "mode\b\|specialty\|agent_builder" api/src` comes back clean apart from unrelated meanings.

#### Progress

```
Status: done
Last commit: see `git log` — "refactor(api): remove modes, Agent Builder and mode-gated tools (Phase 5)"
Done:
- Request context, chat controller, PromptsService and loadSystemPrompt no
  longer know `mode` / `specialty`; loadSkillDirectory (mode folders) and
  AppPaths.pluginSkillsDir removed. Deleted skills/frontend|backend|agnostic|git
  (now built-in instructions and the tool guide's Git group).
- Agent Builder removed: common/agents/plugin/ (module, tools, skill).
- create_component_blueprint and tools/frontend/ (FrontendToolsService,
  templates/componentBlueprint) removed; ChatService.getCustomTools deleted.
- Git tools are always offered when the root is a git repository:
  GitToolsService.createToolkit(root) (is-git-repository.ts:
  `git rev-parse --is-inside-work-tree`, 1 s timeout). create_commit asks for
  approval through the approval map (domain/git-approval-policies.ts, + spec);
  subagents get the same policy (held back as "needs approval" when nested).
- install_depency → install_dependency, input `dependecyName` → `dependencyName`
  (API tool, TOOL_UI_MAPPING, WRITE_TOOL_NAMES, tool guide). UI label mapping
  has the new name and keeps the old names (and create_component_blueprint) so
  older conversations still render labels.
- Subagent toolkit comment updated.
Left: —
Notes:
- Checks: api typecheck, lint:check, test (89 suites / 479 tests, 1 snapshot),
  build (dist/common/agents has no plugin/); ui lint, typecheck, test (170);
  vscode typecheck, test (20).
- `grep -rnE "\bmode\b|specialty|agent_builder" api/src` only finds unrelated
  meanings (file permission `mode`, "agent mode" in available-providers, MCP
  approval modes).
- Checked before renaming: the AI SDK's safeValidateUIMessages /
  convertToModelMessages accept history tool parts whose tool no longer exists,
  so old conversations with install_depency, create_component_blueprint or Agent
  Builder calls still load and send.
- prompt:preview on this repo shows the Git group in the tool guide; on a
  non-git folder the group is absent and the environment says "not a git
  repository".
- Phase 8 (docs) should drop any README mention of modes / Agent Builder.
```
---

## Phase 6 — Slash commands in the message box (Session F)

Typing `/` as the first character of the message opens a command menu above the message box, filtered as you type.

| Command | Does |
|---------|------|
| `/mcp` | Opens the MCP dialog (Phase 7; until then, the settings dialog) |
| `/instructions` | Opens the instructions picker/manager |
| `/<instruction-id>` | Toggles that instruction for this conversation (e.g. `/landing-pages`) |
| `/new` | New conversation |
| `/settings` | Settings |

### Checklist

- [ ] `features/slash-commands/domain/parse-slash-input.ts` (+ spec): a query only when the whole input is `/` + letters, digits or dashes (no spaces or newlines), so `/usr/bin is…` or a pasted path doesn't trigger it.
- [ ] `domain/match-slash-commands.ts` (+ spec): prefix matches first, then substring; built-in commands before instruction ids; stable order.
- [ ] `hooks/useSlashCommands.ts`: open state, active index; ArrowUp/ArrowDown, Enter or Tab runs, Esc closes (with `preventDefault`, so it doesn't also stop a response; see `match-chat-shortcut.ts`). Running a command clears the input. When nothing matches, Enter sends the text as a normal message.
- [ ] `components/SlashCommandMenu.tsx`: `role="listbox"`, `aria-activedescendant` on the textarea, theme tokens only, opens upwards like the pickers.
- [ ] The placeholder hints at it: "Ask Doty… (/ for commands)".

#### Progress

```
Status: not started
Last commit: —
Done: —
Left: —
Notes: —
```

---

## Phase 7 — MCP dialog (UI) + `/mcp` (Session G)

One dialog for everything MCP, opened by `/mcp`, from the "⋯" menu (web) and from a new **Doty: MCP servers** command (VS Code palette). The MCP section moves out of the settings dialog, which keeps a link to it.

```
MCP servers                                   [+ Add server]
──────────────────────────────────────────────────────────
● github     http · global · 12 tools        [⋯]
● postgres   stdio · project · 1 tool        [⋯]
○ browser    stdio · global · disabled       [⋯]
⚠ docs       project · not trusted           [Trust]
──────────────────────────────────────────────────────────
Global: ~/.doty/mcp.json · Project: <root>/.doty/mcp.json
```

Row menu: Edit, Enable/Disable, Reconnect, Tools (per-tool approval: ask / never), Remove, Open file (VS Code opens it through the host bridge; the web shows the path).

**Add / edit form**: name, scope (global or project), transport (stdio or HTTP/SSE). stdio: command, arguments (one per row), environment (key/value rows). HTTP: URL, headers (key/value rows). Secret fields show `••••` for stored values and suggest `${ENV_VAR}` references; a value that looks like a token (long, no spaces) gets a hint to use an env var instead. An "Edit JSON" toggle shows the server's raw JSON for advanced fields.

### Checklist

- [ ] `features/mcp/`: `api/mcp.api.ts` (new endpoints), `domain/` (form ↔ config mapping, validation mirroring the server schema, token-looking value detection, status label; all with specs), `hooks/useMcpServers.ts` (list, mutations, 409 → refresh and show "changed elsewhere"), `components/McpDialog.tsx`, `McpServerRow.tsx`, `McpServerForm.tsx`, `McpToolList.tsx`.
- [ ] `/mcp` in the slash commands opens it; the "⋯" menu gets "MCP servers".
- [ ] VS Code: `doty.openMcp` command → host message `runCommand: openMcp` (follow the Phase 5 pattern in `host-messages.ts` on both sides, with specs).
- [ ] The trust notice for an untrusted project file stays (now inside the dialog) and shows the file's server names and commands before the user trusts it.
- [ ] Keyboard: full dialog keyboard flow; focus returns to the message box on close.

#### Progress

```
Status: not started
Last commit: —
Done: —
Left: —
Notes: —
```

---

## Phase 8 — Wrap-up (Session H)

- [ ] Bump `vscode/package.json` `version` (VS Code caches icons and the manifest by version), rebuild everything and the VSIX (`pnpm --dir api build && pnpm --dir ui build && pnpm --dir vscode build && pnpm --dir vscode package`).
- [ ] README (root and `vscode/`): instructions (files, scopes, slash commands), MCP dialog, removed modes, `DOTY_CLIENT`.
- [ ] End-to-end check in the real VS Code with a light and a dark theme: pick and create instructions, `/landing-pages`, `/mcp` add → edit → disable → remove a stdio server, trust a project server, the prompt preview for the same setup. How to drive VS Code: Playwright `_electron.launch` with VS Code's binary, `--extensionDevelopmentPath=vscode`, a throwaway short `--user-data-dir`, `ELECTRON_RUN_AS_NODE` and `VSCODE_*` unset, and a mock OpenAI-compatible server for streaming (`doty.openaiCompatible.*` settings). Optionally commit that driver as `vscode/scripts/smoke.mjs` with `playwright-core` as a dev dependency.
- [ ] Carry-over from the previous UI plan (Phase 5): click the view title-bar buttons (＋, History, Settings) in VS Code; until now they were only run through the command palette.

#### Progress

```
Status: not started
Last commit: —
Done: —
Left: —
Notes: —
```

---

## Decisions (recommended; change them here before the session starts)

1. **Instructions are files**, not database rows: users can edit them in any editor, commit project ones, and the API stays the single reader.
2. **Selection is per conversation**, defaulting to the last one used in the project.
3. **Agent Builder and `create_component_blueprint` are removed.** Instructions cover the first; the second only made sense with the old frontend mode.
4. **Git tools are always on**, with `create_commit` asking for approval.
5. **Project MCP writes from the UI re-trust the file**; edits made outside Doty still revoke trust.

## Out of scope

- MCP resources, prompts, sampling and OAuth flows (header tokens and env vars only, as before).
- Automatic instruction selection by the model (the model can't pick instructions for itself in v1).
- Rewriting the subagent definitions beyond adding the environment block.
