export type OAuthCallbackOutcome =
  { ok: true; serverName: string } | { ok: false; message: string };

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** The page the browser lands on after signing in to an MCP server. */
export function renderOAuthCallbackPage(outcome: OAuthCallbackOutcome): string {
  const title = outcome.ok ? 'Signed in' : 'Sign-in failed';
  const body = outcome.ok
    ? `Doty is connected to <strong>${escapeHtml(outcome.serverName)}</strong>. You can close this tab and go back to Doty.`
    : `${escapeHtml(outcome.message)} Close this tab and try again from the MCP dialog in Doty.`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Doty · ${title}</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 15px/1.5 system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 16px; box-sizing: border-box; }
  main { max-width: 420px; }
  h1 { font-size: 20px; margin: 0 0 8px; }
</style>
</head>
<body><main><h1>${title}</h1><p>${body}</p></main></body>
</html>
`;
}
