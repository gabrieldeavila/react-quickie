import type {
  ApprovalVerdict,
  ToolApprovalPolicy,
} from 'src/chat/domain/approval-policy';
import type { CommandAssessment } from './command-policy';

type AssessCommand = (command: string) => CommandAssessment;

function readCommand(input: unknown): string | undefined {
  if (!input || typeof input !== 'object') return undefined;
  const command = (input as { command?: unknown }).command;
  return typeof command === 'string' ? command : undefined;
}

/** Maps the command policy (allowed / approval_required / blocked) onto tool approval. */
export function createBashApprovalPolicy(
  assess: AssessCommand,
): ToolApprovalPolicy {
  return (input): ApprovalVerdict => {
    const command = readCommand(input);
    // An unreadable input never runs unattended.
    if (command === undefined) return { decision: 'ask' };

    const assessment = assess(command);
    if (assessment.decision === 'blocked') {
      return { decision: 'always-deny', reason: assessment.reason };
    }
    if (assessment.decision === 'approval_required') return { decision: 'ask' };
    return { decision: 'never' };
  };
}
