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

Recommended order: A and B in parallel, then C → D → E, then F, G and H in any order.

All new code follows the repo conventions: small single-purpose files, pure rules in `domain/` with `*.spec.ts`, and state in `hooks/`. Components only render.

## Working across sessions (read this first)

Each phase is done in its own agent session, and no session remembers the previous ones. **This file is the only record of what was done.** Every session must:

1. **Start** by reading this whole file, especially the **Progress** blocks of the phases this one depends on. Also run `git log --oneline -15` to check that those phases are actually merged.
2. **Branch** from up-to-date `main`: `feat/ui-<session letter>-<short-name>` (for example `feat/ui-c-visual-cleanup`).
3. **Tick checkboxes** (`- [x]`) in the phase's own section as each item is finished. Don't tick anything that isn't done and verified.
4. **Record pin points.** After each meaningful step, and always before the session ends, update the phase's **Progress** block with:
   - `Status`: `not started` / `in progress` / `done` / `blocked`
   - `Branch` and the last commit hash
   - `Done`: what changed, with the main files touched
   - `Left`: unchecked items, plus anything new that turned up
   - `Notes`: decisions made, deviations from this plan, pitfalls, anything the next session must know
5. **Commit** the plan update together with the code (or as a final `docs(ui-plan): …` commit), so the progress travels with the branch.
6. **Edit only your own phase's section and Progress block.** If something in another phase must change, write it in your `Notes` and don't edit that phase. This avoids merge conflicts between parallel sessions.
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

- [ ] **Chat screens**: header, sidebar, message box, empty state, and the settings and new-project dialogs under [components/chat/](../ui/src/components/chat/).
- [ ] **Tool labels**: [tool-ui-mapping.helper.ts](../ui/src/helpers/tool-ui-mapping.helper.ts), which decides what each tool card says.
- [ ] **Other UI pieces** under `ui/src/features/*`: model notices, tool approval, sub-agent status, MCP trust notice.
- [ ] **Saved data**: [chatDb.ts](../ui/src/lib/chatDb.ts) and [useChatHistory.ts](../ui/src/components/chat/hooks/start/useChatHistory.ts). The default title "Nova conversa" becomes "New conversation". Conversations already saved under the old title keep it. Optionally, add a small one-time migration that renames that exact default title.
- [ ] **Mode and specialty names** in `~types/consts/chat.const`.
- [ ] **Date formatting**: `formatTimestamp` uses the `en` locale.
- [ ] **VS Code extension**: [extension.ts](../vscode/src/extension.ts), [host-bridge.ts](../vscode/src/host-bridge.ts) and the command titles in `vscode/package.json`.
- [ ] Specs updated; the search for leftover Portuguese in `ui/` and `vscode/` comes back clean.

#### Progress

```
Status: not started
Branch: —
Last commit: —
Done: —
Left: —
Notes: —
```

### Session B — API (0b + 0c)

- [ ] **Error messages the API sends to the UI**: [validate-attachments.ts](../api/src/chat/domain/validate-attachments.ts), [describe-stream-error.ts](../api/src/chat/domain/describe-stream-error.ts), [validate-message-content.ts](../api/src/chat/domain/validate-message-content.ts), [mcp.controller.ts](../api/src/mcp/delivery/mcp.controller.ts) and any other user-facing errors.
- [ ] **Text the model reads**: tool descriptions in [api/src/chat/tools/](../api/src/chat/tools/), [build-summary-prompt.ts](../api/src/chat/domain/build-summary-prompt.ts), [memory.md](../api/src/common/agents/skills/memory.md), the agent-builder prompts, and other agent and tool services under `api/src/common/`.
- [ ] Add "Reply in the user's language" to the system prompt, so people who write in Portuguese still get Portuguese replies.
- [ ] Specs updated; the search for leftover Portuguese in `api/` comes back clean.

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

## Phase 1 — Visual cleanup (Session C)

CSS changes and removals only. Low risk.

- [ ] Remove the "AI ASSISTANT" label, the sidebar subtitle and the sidebar's duplicate new-chat button.
- [ ] Show the status pill only when the server is offline or reconnecting.
- [ ] Remove the outer padding and the container border and background, so the chat fills the panel.
- [ ] Use a single accent style: only the send button gets the purple fill. Every other button becomes a ghost icon button.
- [ ] Show the title on one line, ending in an ellipsis if it's too long.
- [ ] Hide the usage badges until the conversation has at least one message.

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

## Phase 3 — Pickers move into the message box (Session D)

- [ ] `domain/build-agent-picker-options.ts` + `.spec.ts`: merges `CHAT_MODE_OPTIONS` and `CHAT_SPECIALTY_OPTIONS` into one grouped list, filtered by host features.
- [ ] `components/AgentPicker.tsx`: one picker for mode and specialty, replacing [modePopover.tsx](../ui/src/components/chat/features/main/modePopover.tsx) and [specialtyPopover.tsx](../ui/src/components/chat/features/main/specialtyPopover.tsx).
- [ ] `components/ComposerToolbar.tsx`: agent picker, model picker and context-usage badge inside the message box.
- [ ] The message box becomes one compact rounded field, with the send/stop button inside it.
- [ ] `components/HeaderOverflowMenu.tsx`: a "⋯" menu with settings and new project. After this, the header holds only the title, new chat and "⋯".

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

## Phase 2 — Conversation sidebar → dropdown (Session E)

New files under `ui/src/features/conversations/`:

- [ ] `domain/filter-conversations.ts` + `.spec.ts`: search and sort rules.
- [ ] `hooks/useConversationSwitcher.ts`: open/close state and the search query.
- [ ] `components/ConversationSwitcher.tsx`: the header title becomes a button that opens a list of recent conversations, with search at the top.
- [ ] `components/ConversationSwitcherItem.tsx`: one row, with delete shown on hover.
- [ ] Remove the persistent `chat-sidebar`, its floating ⟨ toggle tab, the `isSidebarOpen` state and the related CSS.

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

## Phase 4 — Useful empty state (Session F)

- [ ] `domain/starter-prompts.ts` + `.spec.ts`: maps each mode to 3–4 starter prompts.
- [ ] `components/StarterPrompts.tsx`: clicking a prompt fills the message box; it doesn't send.
- [ ] Replace the orb in [empty.tsx](../ui/src/components/chat/features/main/empty.tsx) with a short heading, the starter prompts and a hint that images can be pasted.

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
