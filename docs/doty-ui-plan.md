# Doty — UI/UX simplification plan

Status: proposed · Date: 2026-10-18 · Base: `main` @ `300d1e4`

Doty mostly runs in a narrow VS Code side panel, but the layout is built like a full-width web app. It has a permanent two-column split, nested cards, and a header packed with controls. This plan gives the chat as much room as possible, keeps controls hidden until they're needed, and switches the whole product from Portuguese (pt-BR) to English.

## Summary

| Session | Phase | Why | Size | Depends on |
|---------|-------|-----|------|------------|
| A | 0 (UI) — English in `ui/` and `vscode/` (0a + 0d) | One language, with no translation system to maintain | M | — |
| B | 0 (API) — English in `api/` (0b + 0c) | Same | M | — (can run alongside A) |
| C | 1 — Visual cleanup | Remove noise: duplicate buttons, redundant labels, nested frames | S | A |
| D | 3 — Pickers move into the message box | Settings that affect the next message sit next to it | M | C |
| E | 2 — Conversation sidebar → dropdown | The sidebar takes about 40% of a narrow panel | M | D |
| F | 4 — Useful empty state | Starter prompts instead of a dead end | S | C |
| G | 5 — Panel title-bar actions in VS Code | Removes the header row entirely in the editor | M | E |
| H | 6 — Theme tokens + keyboard | Matches the user's VS Code theme; keyboard-first | S | E |

Recommended order: A and B (they touch different folders, so they may run at the same time), then C → D → E, then F, G and H one at a time. "Depends on" means that session's Progress block says `Status: done`. Every session works on the same branch (see below).

All new code follows the repo conventions: small single-purpose files, pure rules in `domain/` with `*.spec.ts`, and state in `hooks/`. Components only render.

## Working across sessions (read this first)

Each phase is done in its own agent session, and no session remembers the previous ones. **This file is the only record of what was done.** Every session must:

1. **Start** by reading this whole file, especially the **Progress** blocks of the phases this one depends on. They must say `Status: done`. Also run `git log --oneline -15` to check that their commits are there. If a dependency isn't done, stop and say so.
2. **Don't create a branch.** All sessions work on one shared branch, `feat/ui-a-english-ui` (the one Session A started on), one after another, so nothing has to be synced or merged between sessions. Check it with `git branch --show-current`; if you're on another branch, `git switch feat/ui-a-english-ui` (only when the working tree is clean). The branch is merged into `main` once, after the last session.
3. **Tick checkboxes** (`- [x]`) in the phase's own section as each item is finished. Don't tick anything that isn't done and verified.
4. **Record pin points.** After each meaningful step, and always before the session ends, update the phase's **Progress** block with:
   - `Status`: `not started` / `in progress` / `done` / `blocked`
   - `Branch` and the last commit hash
   - `Done`: what changed, with the main files touched
   - `Left`: unchecked items, plus anything new that turned up
   - `Notes`: decisions made, deviations from this plan, pitfalls, anything the next session must know
5. **Commit** small, focused commits on the shared branch, with the plan update included (or as a final `docs(ui-plan): …` commit). Stage only the files you changed (`git add <paths>`; never `git add -A` or `git commit -a`), because another session may have uncommitted work in the same checkout.
6. **Edit only your own phase's section and Progress block.** If something in another phase must change, write it in your `Notes` and don't edit that phase.
7. **Finish** with `pnpm` type-check, lint and tests passing in every package touched, and say so in `Notes`. If something fails and you can't fix it, set `Status: blocked` and explain why.

## Current problems

1. **The conversation list takes about 40% of the panel width**, even when it's empty. The title "Nova conversa" wraps onto two lines.
2. **The header has too many controls.** [header.tsx](../ui/src/components/chat/features/main/header.tsx) holds an "AI ASSISTANT" label, the title, an Online pill, usage badges, the model picker, mode, specialty, new project, new chat and settings. Most are icon-only with heavy outlines, and two use the purple highlight, so no action stands out as the main one.
3. **"New conversation" appears twice**: once in the sidebar ([sidebar.tsx](../ui/src/components/chat/features/sidebar.tsx)) and once in the header.
4. **Too many frames**: the outer padding, then the bordered `chat-container`, then the sidebar card and the header divider. VS Code already frames the panel.
5. **Labels that tell the user nothing**: "AI ASSISTANT" (the panel is already titled "Doty: Chat"), "Histórico local sincronizado", and an "Online" pill that only matters when the server is offline.
6. **The empty state is a dead end** ([empty.tsx](../ui/src/components/chat/features/main/empty.tsx)). It shows an orb and a sentence, with nothing to click.
7. **The message box isn't the main thing on screen** ([composer.tsx](../ui/src/components/chat/features/main/composer.tsx)). It's a large bordered box with a separate send button, and the model and mode pickers live far away in the header.

## Target layout

```
┌──────────────────────────────────────┐
│ New conversation ▾          ＋   ⋯   │  ← one slim row
├──────────────────────────────────────┤
│                                      │
│        What do you want to build?    │
│   [Landing page] [Login form] [API]  │  ← starter prompts
│                                      │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ Ask Doty…                        │ │
│ │ [Frontend ▾] [Sonnet ▾]   12% ➤ │ │  ← pickers next to the send button
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## Phase 0 — English throughout

**Decision (recommended):** replace the Portuguese text with English directly, with no translation library. Doty only needs one language, and a translation system would add work to every string change. Portuguese text currently appears in about 60 files.

Many `*.spec.ts` files check the Portuguese strings directly. Update them alongside each file, with one commit per area. Finish by searching the code for accented characters (`[áàâãéêíóôõúç]`) and common Portuguese words, to catch anything missed.

### Session A — Interface and extension (0a + 0d)

- [x] **Chat screens**: header, sidebar, message box, empty state, and the settings and new-project dialogs under [components/chat/](../ui/src/components/chat/).
- [x] **Tool labels**: [tool-ui-mapping.helper.ts](../ui/src/helpers/tool-ui-mapping.helper.ts), which decides what each tool card says.
- [x] **Other UI pieces** under `ui/src/features/*`: model notices, tool approval, sub-agent status, MCP trust notice.
- [x] **Saved data**: [chatDb.ts](../ui/src/lib/chatDb.ts) and [useChatHistory.ts](../ui/src/components/chat/hooks/start/useChatHistory.ts). The default title "Nova conversa" becomes "New conversation". Conversations already saved under the old title keep it. Optionally, add a small one-time migration that renames that exact default title.
- [x] **Mode and specialty names** in `~types/consts/chat.const`.
- [x] **Date formatting**: `formatTimestamp` uses the `en` locale.
- [x] **VS Code extension**: [extension.ts](../vscode/src/extension.ts), [host-bridge.ts](../vscode/src/host-bridge.ts) and the command titles in `vscode/package.json`.
- [x] Specs updated; the search for leftover Portuguese in `ui/` and `vscode/` comes back clean.

#### Progress

```
Status: done
Branch: feat/ui-a-english-ui
Last commit: 62e357f (ui) + the following commit (vscode + this block)
Done:
  - ui/: all user-facing text in English, with no i18n layer. Touched components/chat/*
    (header, sidebar, composer, empty, messages, mode/specialty popovers, settings and
    new-project dialogs, hooks), components/primitives, host/components,
    helpers/tool-ui-mapping.helper.ts, features/{chat,mcp,models,subagents,usage},
    types/consts/{chat,project}.const.ts. formatTimestamp uses the "en" locale.
  - Saved data: title rules moved from lib/chatDb.ts to lib/conversation-title.ts (+ spec).
    DEFAULT_CONVERSATION_TITLE = "New conversation"; header.tsx imports it.
  - vscode/: api-process.ts, host-bridge.ts, doty-view-provider.ts, commands/*,
    README.md. extension.ts and package.json command titles were already English.
  - Specs that asserted Portuguese strings were updated, and so was Portuguese test data.
Left: —
Notes:
  - Legacy title migration: isDefaultConversationTitle also matches "Nova conversa". On
    hydrate, migrateDefaultConversationTitles renames it to the first user message, or to
    "New conversation" when there is none. Custom titles are untouched.
  - Wording picked for later phases: mode "Agnostic", specialty "No specialty",
    status pill "Online" / "Responding" / "Error", "sub-agent" (hyphenated) in labels.
  - Not translated (not user-facing): ui/.agents/repo-router.md (agent instructions).
  - The checked-in vscode/doty.vsix still has the old strings. Rebuild it after
    Session B lands (Session G already plans a rebuild).
  - Accent grep with xargs/BSD grep gives false positives on ×, …, ›, ⟨ (byte matching);
    check with perl -CSD.
  - Checks: ui type-check, lint and tests (30 files / 114 tests) green;
    vscode type-check and tests (5 files / 18 tests) green. vscode has no lint script.
```

### Session B — API (0b + 0c)

- [x] **Error messages the API sends to the UI**: [validate-attachments.ts](../api/src/chat/domain/validate-attachments.ts), [describe-stream-error.ts](../api/src/chat/domain/describe-stream-error.ts), [validate-message-content.ts](../api/src/chat/domain/validate-message-content.ts), [mcp.controller.ts](../api/src/mcp/delivery/mcp.controller.ts) and any other user-facing errors.
- [x] **Text the model reads**: tool descriptions in [api/src/chat/tools/](../api/src/chat/tools/), [build-summary-prompt.ts](../api/src/chat/domain/build-summary-prompt.ts), [memory.md](../api/src/common/agents/skills/memory.md), the agent-builder prompts, and other agent and tool services under `api/src/common/`.
- [x] Add "Reply in the user's language" to the system prompt, so people who write in Portuguese still get Portuguese replies.
- [x] Specs updated; the search for leftover Portuguese in `api/` comes back clean.

#### Progress

```
Status: done
Branch: feat/ui-a-english-ui
Last commit: f480eea (fix: track storage/ sources) + the following feat(api) commit (code + this block)
Done:
  - User-facing errors in English: chat/domain (validate-attachments, validate-message-content,
    prepare-chat-messages, parse-compaction, describe-stream-error), llm/domain
    (describe-provider-error, select-request-model, parse-model-ref), mcp (controller,
    parse-mcp-config, with-timeout, client pool, cap-mcp-tool-result), workspace/*,
    auth.guard, project.controller, project helpers, memory.service, tschecker.service.
  - Model-facing text in English: every tool description and input .describe() in
    chat/tools (incl. storage/*), common/agents/tools/{bash,git,frontend,shared}, the
    agent_builder createAgent tool; tool result messages; formatToolError/withRoot action
    phrases ("Could not <action>."); TOOL_UI_MAPPING labels in chat/tools/index.ts.
    Skills (*.md), memory.md, build-summary-prompt and agent-builder templates were already English.
  - System prompt: new prompts/domain/build-base-instruction.ts (+ spec). The first system
    message is now "The user project is <root>" + REPLY_LANGUAGE_RULE ("Reply in the user's
    language ..."). behavior.md already said this, but that file is optional at runtime.
  - Specs that asserted Portuguese updated; .env.example comments translated.
Left: —
Notes:
  - api/.gitignore had a bare `storage` rule (meant for the runtime api/storage folder) that
    also ignored src/chat/tools/storage/ and src/common/helpers/storage/. Those imported
    sources were never committed, so a fresh clone would not build. Anchored to `/storage`
    and committed them in f480eea before translating.
  - Some files use decomposed Unicode (NFD), so a plain accent grep misses words such as
    "conteúdo". Normalize to NFC first (perl -MUnicode::Normalize / python unicodedata).
    The translated files were written back as NFC.
  - ui/ and vscode/ don't match on any API string, so nothing there needed changing.
  - The leftover-Portuguese search in api/ is clean (accents after NFC + common pt words).
    Hits in skills/frontend/specialty/landing_pages.md are box-drawing false positives.
  - Checks: api typecheck, lint:check and tests (72 suites / 424 tests) green.
```

---

## Phase 1 — Visual cleanup (Session C)

CSS changes and removals only. Low risk.

- [x] Remove the "AI ASSISTANT" label, the sidebar subtitle and the sidebar's duplicate new-chat button.
- [x] Show the status pill only when the server is offline or reconnecting.
- [x] Remove the outer padding and the container border and background, so the chat fills the panel.
- [x] Use a single accent style: only the send button gets the purple fill. Every other button becomes a ghost icon button.
- [x] Show the title on one line, ending in an ellipsis if it's too long.
- [x] Hide the usage badges until the conversation has at least one message.

#### Progress

```
Status: done
Branch: feat/ui-a-english-ui
Last commit: 02685a3 + the following feat(ui) commit (code + this block)
Done:
  - header.tsx: removed the "AI Assistant" label; the status pill renders only when
    status !== "ready" ("Responding" / "Error"); UsageHeaderBadges render only when
    renderedMessages.length > 0; title has a tooltip and sits in .chat-header__title-wrap
    (min-width: 0) so it truncates with an ellipsis on one line.
  - sidebar.tsx: removed the "Local history, synced" subtitle and the duplicate
    new-chat button (+ their CSS in chat-sidebar.css).
  - primitives/button.tsx: dropped the `highlight` prop; every header button is a ghost
    icon button (32px, no border, hover tint) via chat-focus.css. Popover triggers
    (mode/specialty/model) got the same ghost look in chat-controls.css.
  - chat-shell.css: no outer padding/gradient on .chat-shell; .chat-container has no
    border/radius/background/shadow and is height: 100%. Slimmer header (10px 16px),
    1rem title. chat-responsive.css: removed the overrides that are now the default.
  - Status pill and usage badges shrunk to 28px (editor.css, chat-usage.css).
Left: —
Notes:
  - Narrow width: .chat-header__top wraps, so when the panel is too narrow the actions
    move onto a second row under the title instead of squashing it (title gets
    flex-basis 120px). Phase 3 removes most header buttons, after which it should fit
    on one row. There was no browser on this machine to screenshot it, so this was
    checked by reading the CSS, not by eye. Worth a look in the VS Code panel.
  - "Responding" still shows the pill: the UI has no separate offline/reconnecting
    state, so the pill appears for any non-ready status. If Session D/E adds a
    connection state, narrow it to that.
  - Dialog buttons (settings, new project, MCP trust notice) keep the purple
    .chat-button fill: dialog layouts are out of scope. Inside the chat screen, only
    the send button is purple now.
  - Sidebar is untouched apart from the removals (Session E replaces it).
  - Checks: ui typecheck, lint and tests (30 files / 114 tests) green.
```

---

## Phase 3 — Pickers move into the message box (Session D)

- [x] `domain/build-agent-picker-options.ts` + `.spec.ts`: merges `CHAT_MODE_OPTIONS` and `CHAT_SPECIALTY_OPTIONS` into one grouped list, filtered by host features.
- [x] `components/AgentPicker.tsx`: one picker for mode and specialty, replacing [modePopover.tsx](../ui/src/components/chat/features/main/modePopover.tsx) and [specialtyPopover.tsx](../ui/src/components/chat/features/main/specialtyPopover.tsx).
- [x] `components/ComposerToolbar.tsx`: agent picker, model picker and context-usage badge inside the message box.
- [x] The message box becomes one compact rounded field, with the send/stop button inside it.
- [x] `components/HeaderOverflowMenu.tsx`: a "⋯" menu with settings and new project. After this, the header holds only the title, new chat and "⋯".

#### Progress

```
Status: done
Branch: feat/ui-a-english-ui
Last commit: fa3ad98 + the following feat(ui) commit (code + this block)
Done:
  - Agent picker (ui/src/features/agent-picker/):
    domain/build-agent-picker-options.ts (+ spec): one group per mode (filtered with
    filterModeOptions), each followed by its specialties minus "No specialty". A mode row
    selects {focus, specialty: "none"}; a specialty row selects {focus, specialty}.
    domain/describe-agent-choice.ts (+ spec): trigger text ("Frontend" / "Frontend ·
    Forms") and isSameAgentChoice (a specialty the mode doesn't offer counts as none).
    components/AgentPicker.tsx + AgentPickerRow.tsx render it.
    components/chat/hooks/events/useAgentChoice.ts binds it to projectContext.
    modePopover.tsx and specialtyPopover.tsx deleted.
  - Popover primitive: open/close/flip logic extracted to primitives/usePopoverPanel.ts;
    primitives/popover-trigger.tsx renders either the icon button or a labelled chip
    (icon + label + chevron). PopoverProps gained `triggerLabel` and `placement`
    ("up" opens above the trigger, scrolls past 360px).
  - Message box: components/chat/features/main/composer.tsx moved to composer/index.tsx
    and split into PastedImages.tsx, SendButton.tsx and ComposerToolbar.tsx. The field is
    one rounded box (styles/chat/chat-composer-field.css) with the textarea on top and the
    toolbar below: [Agent ▾] [Model ▾] … usage badges, then a 30px send/stop button.
    ModelPicker is now a chip showing the model name and opens upwards.
  - Usage: UsageHeaderBadges renamed to UsageBadges (lives in the toolbar, still only
    once the conversation has messages). ContextUsageBadge text is "64%", with
    "Context window used: 64%" as title/aria-label.
  - Header: title, new chat (＋) and the "⋯" menu only.
    features/header-menu/components/HeaderOverflowMenu.tsx (generic items list) +
    domain/new-project-label.ts (+ spec: label per mode, null when the host can't
    create projects or the mode has no template) + hooks/events/useHeaderMenuItems.ts.
Left: —
Notes:
  - Placement deviates slightly from the plan's bare `components/` paths:
    AgentPicker lives in features/agent-picker/, HeaderOverflowMenu in
    features/header-menu/, and ComposerToolbar in components/chat/features/main/composer/
    because it reads the chat contexts like the rest of the composer.
  - Behaviour change: picking a mode now resets the specialty to "none" (before, the old
    specialty was kept when switching modes).
  - Status pill now shows only on "error". "Responding" is shown by the stop button
    inside the message box. Narrow it further if a real offline state is added.
  - isFrontendMode/isBackendMode/isAgnosticMode stay in ChatServicesContext: the
    new-project modal still uses them.
  - ConversationUsageBadge (total cost/tokens) moved into the toolbar with the context
    badge, borderless and smaller. Drop it there if the toolbar gets too crowded.
  - Session E: the header row now has only the title, ＋ and ⋯, so the title can become
    the conversation-switcher button without fighting other controls. Session G: the ⋯
    items come from useHeaderMenuItems, reusable for the view/title commands.
  - No browser on this machine, so the layout was checked by reading the CSS, not by eye.
    Worth a look in the VS Code panel (especially the upward pickers at narrow widths).
  - Checks: ui typecheck, lint and tests (33 files / 126 tests) green; vite build OK.
    vscode/ and api/ untouched.
```

---

## Phase 2 — Conversation sidebar → dropdown (Session E)

New files under `ui/src/features/conversations/`:

- [x] `domain/filter-conversations.ts` + `.spec.ts`: search and sort rules.
- [x] `hooks/useConversationSwitcher.ts`: open/close state and the search query.
- [x] `components/ConversationSwitcher.tsx`: the header title becomes a button that opens a list of recent conversations, with search at the top.
- [x] `components/ConversationSwitcherItem.tsx`: one row, with delete shown on hover.
- [x] Remove the persistent `chat-sidebar`, its floating ⟨ toggle tab, the `isSidebarOpen` state and the related CSS.

#### Progress

```
Status: done
Branch: feat/ui-a-english-ui
Last commit: d0f957c + the following feat(ui) commit (code + this block)
Done:
  - ui/src/features/conversations/:
    domain/filter-conversations.ts (+ spec): case- and accent-insensitive search that
    needs every query word in the title (any order), sorted by lastMessageAt then
    updatedAt, newest first. Doesn't mutate its input.
    hooks/useConversationSwitcher.ts: reuses usePopoverPanel (outside click / Escape),
    holds the query (cleared on every open), select() closes the panel,
    selectFirstMatch() for Enter in the search box.
    components/ConversationSwitcher.tsx: the header title is now a button (title +
    chevron) that opens a panel: search box (autofocused) and a scrolling list,
    with "Loading conversations…" / "No conversations yet." / "No conversations match.".
    components/ConversationSwitcherItem.tsx: title (ellipsis) + timestamp; trash
    button shown on hover/focus-within (always shown on touch, via hover: none).
  - header.tsx renders ConversationSwitcher from history (conversations, active id,
    isHydrated, setActiveConversationId, deleteConversation).
  - Removed: features/sidebar.tsx, chat-sidebar.css, chat-conversation-list.css, the
    ⟨ toggle, isSidebarOpen/setIsSidebarOpen (ChatBaseContext + chat-context
    interface), the localStorage sync in useStartChatState, readSidebarOpenState,
    SIDEBAR_OPEN_STORAGE_KEY and the chat-container--sidebar-* classes.
  - New styles/chat/chat-conversation-switcher.css; chat-focus.css focus rings point
    at the new classes.
Left: —
Notes:
  - The title element is now a <span class="chat-title"> inside the trigger button
    (a heading isn't allowed inside a <button>), so the page has no <h1> any more.
  - The panel is role="dialog" (it holds a search input), not a menu. Arrow-key
    navigation through rows is NOT done: Tab moves between rows/delete buttons and
    Enter in the search box opens the first match. Session H should add arrow keys
    and move focus back to the trigger on close.
  - Deleting a row keeps the panel open; deleting the active conversation clears
    the selection (existing useChatHistory behaviour, unchanged).
  - Old "chat-sidebar-open" localStorage values are just ignored now; no cleanup.
  - Session G: the "History" title-bar command can open this switcher. The open
    state lives in useConversationSwitcher (local), so G needs to lift it or expose
    an open() trigger when the in-page header is hidden in VS Code.
  - No browser on this machine, so the layout was checked by reading the CSS, not
    by eye. Worth a look in the VS Code panel at narrow widths.
  - Checks: ui typecheck, lint and tests (34 files / 132 tests) green; vite build OK.
    vscode/ and api/ untouched.
```

---

## Phase 4 — Useful empty state (Session F)

- [x] `domain/starter-prompts.ts` + `.spec.ts`: maps each mode to 3–4 starter prompts.
- [x] `components/StarterPrompts.tsx`: clicking a prompt fills the message box; it doesn't send.
- [x] Replace the orb in [empty.tsx](../ui/src/components/chat/features/main/empty.tsx) with a short heading, the starter prompts and a hint that images can be pasted.

#### Progress

```
Status: done
Branch: feat/ui-a-english-ui
Last commit: 069878d + the following feat(ui) commit (code + this block)
Done:
  - ui/src/features/starter-prompts/:
    domain/starter-prompts.ts (+ spec): StarterPrompt {label, text}; 3–4 prompts per
    mode (frontend, backend, agnostic, git, agent_builder); starterPromptsFor(focus)
    falls back to the agnostic prompts for an unknown mode. The spec checks every
    mode in AgentFocusEnum + AgentFocusPluginEnum, so a new mode without prompts fails.
    domain/empty-state-heading.ts (+ spec): "What do you want to build?" by default,
    own wording for agnostic, git and agent_builder.
    components/StarterPrompts.tsx: a list of pill buttons (full text as tooltip).
  - components/chat/hooks/events/useFillComposer.ts: setInput(text), then focuses the
    textarea with the cursor at the end. It never sends.
  - composer/chat-input-id.ts: CHAT_INPUT_ID ("chat-input"), set as the textarea id
    so the hook can focus it without lifting the composer's ref.
  - empty.tsx: orb removed; heading + starter prompts for projectContext.focus + a
    "Tip: paste a screenshot or mockup…" hint, shown only when the model accepts images.
  - Styles: empty-state rules moved out of messages.css (orb CSS deleted) into new
    styles/chat/chat-empty-state.css; .starter-prompts__item added to chat-focus.css.
Left: —
Notes:
  - Picking a prompt replaces whatever draft is in the message box (the empty state
    only shows before the first message, so that's usually nothing).
  - Some prompts end in ": " (e.g. "Refactor this component…: ") so the user types the
    target right after; that's why the cursor goes to the end.
  - Prompts follow the mode only, not the specialty. Specialty-specific prompts could
    be added later by keying on `${focus}:${specialty}`.
  - Session H: the chips use a plain 1px border and the shared focus ring; switch them
    to theme tokens along with the rest.
  - No browser on this machine, so the layout was checked by reading the CSS, not by eye.
  - Checks: ui typecheck, lint and tests (36 files / 147 tests) green; vite build OK.
    vscode/ and api/ untouched.
```

---

## Phase 5 — Panel title-bar actions in VS Code (Session G, optional)

- [ ] Register "New chat", "History" and "Settings" as `contributes.menus` → `view/title` in `vscode/package.json`.
- [ ] Each command posts a message to the chat view through the host bridge, and the UI handles it.
- [ ] In VS Code, hide the in-page header. The web host keeps the slim header. The existing host-feature check (`getHostFeatures`) decides which one to show.
- [ ] Rebuild the VSIX and check it in VS Code.

#### Progress

```
Status: not started
Branch: —
Last commit: —
Done: —
Left: —
Notes: —
```

---

## Phase 6 — Theme tokens and keyboard (Session H)

- [ ] Replace fixed colours with VS Code theme tokens (`--vscode-editor-background`, `--vscode-input-background`, `--vscode-focusBorder`, `--vscode-button-background`…), falling back to the current palette on the web host.
- [ ] Check that both a light and a dark VS Code theme look right.
- [ ] ⌘/Ctrl+N starts a new chat, and Esc stops the response.
- [ ] Every control has a visible focus ring, and the conversation dropdown works fully from the keyboard.

#### Progress

```
Status: not started
Branch: —
Last commit: —
Done: —
Left: —
Notes: —
```

---

## Out of scope

- Rendering of messages and tool cards (only their text changes, in Phase 0).
- Settings and new-project dialog layouts, beyond the English text.
