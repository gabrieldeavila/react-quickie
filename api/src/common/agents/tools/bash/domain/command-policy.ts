import { assessCommandRisk, type CommandRisk } from './command-risk';
import { referencesOutsideWorkspace } from './workspace-paths';

export type CommandDecision = 'allowed' | 'approval_required' | 'blocked';

export interface CommandAssessment {
  decision: CommandDecision;
  reason?: string;
  /** Set when `decision` is `approval_required`. */
  risk?: CommandRisk;
}

const MUTATION_PATTERNS: RegExp[] = [
  /\b(rm|mv|chmod|chown|install|touch|mkdir|rmdir|git\s+(reset|clean|checkout|push)|npm\s+(install|uninstall)|pnpm\s+(install|remove|add)|yarn\s+(add|remove)|docker|curl|wget)\b/i,
  /\bgit\s+branch\b[^;&|]*\s-D\b/,
  /\bgit\s+stash\s+(drop|clear)\b/i,
  /\bfind\b[^;&|]*\s-(delete|exec|execdir|ok)\b/i,
  /\|\s*(ba|z)?sh\b/i,
];

function askFor(
  command: string,
  rootPath: string,
  reason: string,
): CommandAssessment {
  return {
    decision: 'approval_required',
    reason,
    risk: assessCommandRisk(command, rootPath),
  };
}

export function assessCommand(
  command: string,
  rootPath: string,
): CommandAssessment {
  const normalized = command.trim();

  if (/(^|[;&|])\s*(sudo|shutdown|reboot|mkfs|fdisk|dd)\b/i.test(normalized)) {
    return {
      decision: 'blocked',
      reason: 'System-wide admin or destructive command not allowed.',
    };
  }

  if (
    /(\/etc|\/usr|\/System|\/Library|~\/Library|\/var\/root)/i.test(normalized)
  ) {
    return {
      decision: 'blocked',
      reason: 'Access to system folders not allowed.',
    };
  }

  if (MUTATION_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return askFor(
      normalized,
      rootPath,
      'The command may change files, install dependencies or reach external resources.',
    );
  }

  // Pipelines and conditional chaining are safe for read-only commands. The
  // mutation check above still catches commands such as `rm`, `touch`, and
  const commandWithoutSafeNullRedirects = normalized.replace(
    /\d?\s*>\s*\/?dev\/null\b/g,
    '',
  );

  if (/[<>]|\$\(|`/.test(commandWithoutSafeNullRedirects)) {
    return askFor(
      normalized,
      rootPath,
      'The command redirects to a file or runs a nested command.',
    );
  }

  if (referencesOutsideWorkspace(normalized, rootPath)) {
    return askFor(
      normalized,
      rootPath,
      'The command may access files outside the current workspace.',
    );
  }

  return { decision: 'allowed' };
}
