import { Injectable } from '@nestjs/common';
import type { SystemModelMessage } from 'ai';
import * as os from 'os';
import { WorkspaceService } from 'src/workspace/data/workspace.service';
import { ContextService } from '../context/context.service';
import { readGitSummary } from './prompts/data/read-git-summary';
import { buildEnvironmentBlock } from './prompts/domain/build-environment-block';
import { resolveDotyClient } from './prompts/domain/resolve-doty-client';

export type EnvironmentRequest = {
  modelRef?: string;
  toolsAvailable: boolean;
  instructionNames?: string[];
};

/** Collects the per-request facts of the environment block. */
@Injectable()
export class EnvironmentService {
  constructor(
    private readonly contextService: ContextService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async describe({
    modelRef,
    toolsAvailable,
    instructionNames = [],
  }: EnvironmentRequest): Promise<SystemModelMessage> {
    const root = this.contextService.get('root');
    return buildEnvironmentBlock({
      client: resolveDotyClient(process.env.DOTY_CLIENT),
      workspaceRoots: this.workspaceService.roots,
      activeRoot: root,
      platform: os.platform(),
      osRelease: os.release(),
      // `run_bash_command` always runs through `bash -lc` (bash.service.ts).
      shell: 'bash',
      date: new Date(),
      git: await readGitSummary(root),
      modelRef,
      toolsAvailable,
      instructionNames,
    });
  }
}
