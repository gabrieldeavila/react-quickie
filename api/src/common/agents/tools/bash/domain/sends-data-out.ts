/**
 * Tools whose whole job is reaching another machine (shell, copy, raw
 * socket), where a command starts, so `cat ~/.ssh/config` doesn't count.
 */
export const REMOTE_TOOLS =
  /(^|[;&|(]\s*|\bxargs\s+)(nc|ncat|netcat|ssh|scp|sftp|rsync|telnet|ftp)\b/i;

const HTTP_CLIENTS = /\b(curl|wget)\b/i;

/**
 * Flags that send a body or pick a method: curl `-d`/`-F`/`-T` (alone or
 * in a cluster like `-sSd`), `--data*`, `--form`, `--json`, `--upload-file`,
 * `-X`/`--request`; wget `--post-*`, `--body-*`, `--method`.
 */
const UPLOAD_FLAGS =
  /\s(-[A-Za-z]*[dFTX]|--(data|form|json|upload-file|request|post-|body-|method))/;

/** A variable or nested command can carry a secret into a URL or header. */
const EXPANSION = /[$`]/;

/**
 * Whether a command can send workspace data or secrets to another machine:
 * a remote tool, `git push` (to any remote, not just `origin`), or an HTTP
 * client that uploads or expands a variable. A plain `curl <url>` is not.
 */
export function sendsDataOut(command: string): boolean {
  if (REMOTE_TOOLS.test(command)) return true;
  if (/\bgit\s+push\b/i.test(command)) return true;
  if (!HTTP_CLIENTS.test(command)) return false;
  return UPLOAD_FLAGS.test(command) || EXPANSION.test(command);
}
