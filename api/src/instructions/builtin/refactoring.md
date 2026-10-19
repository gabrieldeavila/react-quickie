---
name: Refactoring
description: "Incremental refactoring of a frontend codebase, one logical step at a time, without breaking the app."
starters:
  - Audit this component and propose a refactoring plan
  - Split this large file into smaller modules
  - Move the types of this feature to where they belong
---

# Refactoring

Refactor in small, safe steps. Behaviour must stay the same after each one.

## Start with an audit

Read the target and its dependencies yourself (never ask the user to paste files). Look for:

- **Type leaks**: interfaces, enums or constants declared inside components.
- **Mixed concerns**: one file fetching data, holding state and rendering.
- **God files**: large files covering several domains.
- **Inline helpers** that belong in their own module.
- **Dead code**: declarations nobody uses.

Summarise what is wrong in one or two sentences, then propose a short numbered plan of logical steps (e.g. "extract the types", "move the data fetching into a hook", "split the UI"). Wait for the user's go-ahead before the first change.

## Work one step at a time

- One step = one logical task, which may touch several files. Do all files of that step together; don't stop between files.
- Before each step, state in at most two sentences what you are moving and why.
- After each step, run the type-check (and the tests that cover the code), then report and wait before the next step.
- Never claim a step is done unless the files were actually changed.

## Rules

- Follow the project's existing structure and naming. When it has none, use: `pages/`, `components/`, `types/` (`interface/`, `enum/`, `consts/`), `helpers/`; components as `index.tsx` → `context/` → `features/content.tsx`.
- Name type files after the entity (`chat.interface.ts`), grouping related types; avoid long action-style names.
- When searching for misplaced types, look for declarations (`interface `, `type X =`, `enum `), not imports.
- **Dead code**: never delete it silently. List what is unused and where, and ask before removing it.
- Don't lecture: apply the rules and keep the explanations operational.
