import { Injectable } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { tool } from 'ai';
import { z } from 'zod/v4';
import { ContextService } from 'src/common/context/context.service';
import { formatToolError, toolSuccess } from '../shared/format-tool-error';
import {
  describeCommandFailure,
  type CommandFailure,
} from './domain/describe-command-failure';
import type { ToolApprovalPolicy } from 'src/chat/domain/approval-policy';
import { CommandPolicyService } from './command-policy.service';
import { createBashApprovalPolicy } from './domain/bash-approval-policy';

const execFileAsync = promisify(execFile);
const COMMAND_TIMEOUT_MS = 120_000;
const MAX_OUTPUT_SIZE = 50_000;

@Injectable()
export class BashToolsService {
  constructor(
    private readonly contextService: ContextService,
    private readonly policyService: CommandPolicyService,
  ) {}

  createBashTools() {
    return {
      run_bash_command: tool({
        description:
          'Runs a Bash command in the workspace. Local read-only commands run right away; commands that change files, reach outside the workspace or use the network ask the user for approval first. Dangerous system-wide commands are denied.',
        inputSchema: z.object({
          command: z
            .string()
            .trim()
            .min(1)
            .max(10_000)
            .describe('The Bash command to run.'),
        }),
        execute: async (
          { command }: { command: string },
          { abortSignal }: { abortSignal?: AbortSignal },
        ) => {
          const rootPath = this.contextService.get('root');
          if (!rootPath)
            return formatToolError(
              'run the Bash command',
              new Error('Workspace root not found.'),
            );

          // Approval is decided by `streamText({ toolApproval })` before this
          // runs (see createApprovalPolicies). This check is a safety net for
          // callers that run the tool without that map.
          const assessment = this.policyService.assess(command, rootPath);
          if (assessment.decision === 'blocked') {
            return {
              success: false,
              blocked: true,
              message: assessment.reason,
            };
          }

          return this.executeCommand(command, rootPath, abortSignal);
        },
      }),
    };
  }

  /** Approval policies keyed by tool name, for the `toolApproval` map. */
  createApprovalPolicies(rootPath: string): Record<string, ToolApprovalPolicy> {
    return {
      run_bash_command: createBashApprovalPolicy((command) =>
        this.policyService.assess(command, rootPath),
      ),
    };
  }

  async executeCommand(command: string, cwd: string, signal?: AbortSignal) {
    try {
      const { stdout, stderr } = await execFileAsync('bash', ['-lc', command], {
        cwd,
        signal,
        timeout: COMMAND_TIMEOUT_MS,
        maxBuffer: MAX_OUTPUT_SIZE,
        windowsHide: true,
        env: process.env,
      });

      const output = [
        stdout ? `stdout:\n${stdout}` : '',
        stderr ? `stderr:\n${stderr}` : '',
      ]
        .filter(Boolean)
        .join('\n\n')
        .trim();

      return toolSuccess('Bash command finished.', [output || '(no output)']);
    } catch (error) {
      return formatToolError(
        'run the Bash command',
        describeCommandFailure(error as CommandFailure),
      );
    }
  }
}
