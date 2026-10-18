import { resolve, sep } from 'path';

export type CommandDecision = 'allowed' | 'approval_required' | 'blocked';

export interface CommandAssessment {
  decision: CommandDecision;
  reason?: string;
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

  if (
    /\b(rm|mv|chmod|chown|install|touch|mkdir|rmdir|git\s+(reset|clean|checkout)|npm\s+(install|uninstall)|pnpm\s+(install|remove|add)|yarn\s+(add|remove)|docker|curl|wget)\b/i.test(
      normalized,
    )
  ) {
    return {
      decision: 'approval_required',
      reason:
        'The command may change files, install dependencies or reach external resources.',
    };
  }

  // Pipelines and conditional chaining are safe for read-only commands. The
  // mutation check above still catches commands such as `rm`, `touch`, and
  const commandWithoutSafeNullRedirects = normalized.replace(
    /\d?\s*>\s*\/?dev\/null\b/g,
    '',
  );

  if (/[<>]|\$\(|`/.test(commandWithoutSafeNullRedirects)) {
    return {
      decision: 'approval_required',
      reason: 'The command redirects to a file or runs a nested command.',
    };
  }

  const outsideWorkspace = referencesOutsideWorkspace(normalized, rootPath);
  if (outsideWorkspace) {
    return {
      decision: 'approval_required',
      reason: 'The command may access files outside the current workspace.',
    };
  }

  return { decision: 'allowed' };
}

function referencesOutsideWorkspace(
  command: string,
  rootPath: string,
): boolean {
  const absolutePaths: string[] =
    command.match(/(?:^|[\s])\/(?:[^\s"']+)/g) ?? [];
  const resolvedRoot = resolve(rootPath);

  return absolutePaths.some((value) => {
    const candidatePath = value.trim();

    // `/dev/null` is a harmless standard stream target commonly used by
    // read-only inspection commands (`2>/dev/null`). It is not workspace
    // access and must not trigger an approval request.
    if (/^\/?dev\/null(?:\b|["'])/.test(candidatePath)) {
      return false;
    }

    const candidate = resolve(candidatePath);
    return (
      candidate !== resolvedRoot &&
      !candidate.startsWith(`${resolvedRoot}${sep}`)
    );
  });
}
