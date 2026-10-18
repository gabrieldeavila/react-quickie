function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Placeholder shown while the API starts, or when it failed to start. */
export function buildLoadingHtml(message: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">
    <style>
      body { font-family: var(--vscode-font-family); color: var(--vscode-descriptionForeground); padding: 1rem; }
    </style>
  </head>
  <body><p>${escapeHtml(message)}</p></body>
</html>`;
}
