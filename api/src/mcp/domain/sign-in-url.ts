const URL_IN_TEXT = /\bhttps?:\/\/[^\s"'<>`]+/g;

/** Hosts and path words that mark a login page. */
const LOGIN_HOST = /^(accounts|login|auth|oauth|signin|sso|id)\./i;
const LOGIN_WORDS =
  /(oauth|authori[sz]e|\bauth\b|\/auth[/?]|login|signin|sign-in|consent|device)/i;

function isLoopback(hostname: string): boolean {
  return (
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
  );
}

/**
 * Only pages a browser should open: https anywhere, http only on this
 * machine (local servers often serve their own login page there).
 */
export function readSignInUrl(value: unknown): URL | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return url;
    if (url.protocol === 'http:' && isLoopback(url.hostname)) return url;
  } catch {
    // Not a URL.
  }
  return undefined;
}

function looksLikeLogin(url: URL): boolean {
  return (
    LOGIN_HOST.test(url.hostname) ||
    LOGIN_WORDS.test(`${url.pathname}${url.search}`)
  );
}

/**
 * A login URL in a line a local server printed, if any. A guess: servers
 * that need a login usually print "visit https://…/authorize?…".
 */
export function findSignInUrl(line: string): string | undefined {
  for (const match of line.matchAll(URL_IN_TEXT)) {
    const url = readSignInUrl(match[0].replace(/[).,;:]+$/, ''));
    if (url && looksLikeLogin(url)) return url.toString();
  }
  return undefined;
}
