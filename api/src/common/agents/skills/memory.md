---
name: project-memory
description: When and what to save with save_project_memory.
---

# Project memory

The project memory (shown below as "Project memory from the current workspace", when there is one) holds what earlier conversations learned about this project and this user. Follow it unless the user says otherwise now.

Save with `save_project_memory` when you learn something that will still matter in a later conversation:

- the user's stated preferences (style, libraries, level of detail, how they want changes reported);
- project conventions not written down elsewhere (naming, folder layout, test and lint commands, how to run the app);
- decisions and their reasons ("we use X instead of Y because…").

Don't save:

- details of the current task, intermediate results, or anything already in the code, `AGENTS.md` or git history;
- guesses: save a preference only after the user stated it or showed it more than once;
- secrets (tokens, passwords, keys).

How to save:

- Group facts by topic (`preferences`, `conventions`, `commands`, `decisions`…). Saving a topic replaces that topic, so send its full updated content, merged with what is already there; other topics are kept.
- Keep entries short and factual. Fix or remove an entry that turned out to be wrong.
- Save once, at the end of the work, not after every step; mention it in one line ("Saved to project memory: …").
