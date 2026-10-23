import { sendsDataOut } from './sends-data-out';
import { touchesOutsideWorkspace } from './workspace-paths';

/**
 * How bad a command that asks could be. `destructive` still asks in auto
 * mode; `changes` (installs, new files, redirects in the workspace, plain
 * downloads) may run unasked there.
 */
export type CommandRisk = 'changes' | 'destructive';

const DESTRUCTIVE_PATTERNS: RegExp[] = [
  /\b(rm|mv|chmod|chown|docker|eval)\b/i,
  /\bgit\s+(reset|clean|checkout|restore)\b/i,
  /\bgit\s+push\b[^;&|]*\s(--force(-with-lease)?|-f)\b/i,
  /\bgit\s+branch\b[^;&|]*\s-D\b/,
  /\bgit\s+stash\s+(drop|clear)\b/i,
  /\bfind\b[^;&|]*\s-(delete|exec|execdir|ok)\b/i,
  // Piping into a shell runs whatever came in (`curl … | sh`).
  /\|\s*(ba|z)?sh\b/i,
];

const READ_ONLY_COMMANDS = new Set([
  'ls',
  'cat',
  'head',
  'tail',
  'wc',
  'stat',
  'file',
  'grep',
  'rg',
  'tree',
  'du',
  'pwd',
  'echo',
]);

/** Every step of a chain is a plain read (`ls /tmp | grep x`), with no redirect or nested command. */
function isReadOnly(command: string): boolean {
  if (/[<>`]|\$\(/.test(command.replace(/\d?\s*>\s*\/?dev\/null\b/g, ''))) {
    return false;
  }
  return command
    .split(/&&|\|\||[;|]/)
    .map((step) => step.trim().split(/\s+/)[0])
    .every((name) => !name || READ_ONLY_COMMANDS.has(name));
}

/** Risk of a command the policy already decided to ask about. */
export function assessCommandRisk(
  command: string,
  rootPath: string,
): CommandRisk {
  if (DESTRUCTIVE_PATTERNS.some((pattern) => pattern.test(command))) {
    return 'destructive';
  }
  // A prompt injection could otherwise send `.env` out without a question.
  if (sendsDataOut(command)) return 'destructive';
  // We can't tell every write apart from a read, so anything outside the
  // workspace is destructive unless the whole command is a plain read.
  if (touchesOutsideWorkspace(command, rootPath) && !isReadOnly(command)) {
    return 'destructive';
  }
  return 'changes';
}
