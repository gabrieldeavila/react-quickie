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
| Doty: Ask about selection | Sends the selected code (file and lines) to the message box. Also available in the editor context menu. |
| Doty: Restart API | Restarts the API and reloads the view. |
| Doty: Show logs | Shows the API output (the "Doty" channel). |

## Settings

- `doty.defaultModel`: default model as `provider:model` (same as `DOTY_DEFAULT_MODEL`).
- `doty.openaiCompatible.baseUrl` and `doty.openaiCompatible.models`: OpenAI-compatible server.

## How it works

- The API listens on `127.0.0.1`, on a free port, and requires a random token (`DOTY_AUTH_TOKEN`) on every request.
- `DOTY_WORKSPACE_ROOTS` receives the workspace folders. With several folders, pick one in the chat settings.
- Data (memory, MCP trust, global `mcp.json`) lives in the extension's storage, not in `~/.doty`.
- Conversation history lives in the webview's IndexedDB, separate from the browser interface's history.
- If the API crashes, it restarts with increasing delays; after 5 crashes in a row, use **Doty: Restart API**.
- Not available in VS Code: **New project** (the templates aren't packaged) and **Agent Builder** mode (it edits Doty's own source code).
