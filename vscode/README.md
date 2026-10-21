# Doty for VS Code

The Doty chat in the VS Code sidebar. The extension starts the Doty API with VS Code's own Node (you don't need Node installed) and shows the same interface in a webview. Tools only act on the folders open in the workspace.

## Installation (local `.vsix`)

From the repository root:

```bash
npm install
npm run build              # api, ui and vscode
npm run package --prefix vscode
code --install-extension vscode/doty.vsix
```

Then open a folder, run **Doty: Set API key** and click the Doty icon in the activity bar.

## Commands

| Command | What it does |
|---|---|
| Doty: Set API key | Stores the Anthropic, OpenAI, DeepSeek or OpenAI-compatible server key in the system keychain (SecretStorage) and restarts the API. |
| Doty: New chat | Starts a new conversation. Also the ＋ button in the chat view's title bar, and ⌘N / Ctrl+N while the chat has focus. |
| Doty: History | Opens the recent conversations, with search. Also the history button in the title bar. |
| Doty: Settings | Opens the chat settings (workspace folder). Also the gear button in the title bar. |
| Doty: MCP servers | Opens the MCP dialog: add, edit, enable/disable, trust and remove servers. Same as typing `/mcp` in the message box. |
| Doty: Ask about selection | Sends the selected code (file and lines) to the message box. Also available in the editor context menu. |
| Doty: Restart API | Restarts the API and reloads the view. |
| Doty: Show logs | Shows the API output (the "Doty" channel). |

## In the message box

- **Instructions** (the chip next to the model): Markdown guidance you pick per conversation (built-in, global or project files in `.doty/instructions/`). See [Instructions](../README.md#instruções).
- `/` opens the command menu: `/mcp`, `/instructions`, `/new`, `/settings`, and `/<instruction-id>` to toggle one instruction.
- The agent also reads `AGENTS.md` at the project root.

## Settings

- `doty.defaultModel`: default model as `provider:model` (same as `DOTY_DEFAULT_MODEL`).
- `doty.openaiCompatible.baseUrl` and `doty.openaiCompatible.models`: OpenAI-compatible server.

## How it works

- The API listens on `127.0.0.1`, on a free port, and requires a random token (`DOTY_AUTH_TOKEN`) on every request.
- `DOTY_WORKSPACE_ROOTS` receives the workspace folders. With several folders, pick one in the chat settings.
- Data (memory, global instructions, MCP trust, global `mcp.json`) lives in the extension's storage, not in `~/.doty`. **Open file** in the MCP dialog opens the right `mcp.json`.
- The API runs with `DOTY_CLIENT=vscode`, so the agent knows it is inside VS Code.
- Conversation history lives in the webview's IndexedDB, separate from the browser interface's history.
- If the API crashes, it restarts with increasing delays; after 5 crashes in a row, use **Doty: Restart API**.
- Colours follow the active VS Code theme (light, dark and high contrast). In the chat, Escape stops the response being generated.
- The chat has no in-page header in VS Code: new chat, history and settings are the view's title-bar buttons, and the active conversation's title shows next to the view name.
- Not available in VS Code: **New project** (the templates aren't packaged).
