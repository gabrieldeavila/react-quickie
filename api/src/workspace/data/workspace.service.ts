import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import * as fs from 'fs';
import { getAppPaths } from 'src/config/app-paths';
import { ContextService } from 'src/common/context/context.service';
import { isAllowedRoot } from '../domain/is-allowed-root';
import { resolveWorkspacePath } from '../domain/resolve-workspace-path';
import {
  DOCKER_WORKSPACE_DIR,
  resolveWorkspaceRoots,
  type WorkspaceRoots,
} from '../domain/resolve-workspace-roots';
import { WorkspaceEscapeError } from '../domain/workspace-escape.error';
import { toRealPath } from './to-real-path';

@Injectable()
export class WorkspaceService implements OnModuleInit {
  private readonly logger = new Logger(WorkspaceService.name);
  private readonly workspaceRoots: WorkspaceRoots;
  private readonly deniedPaths: string[];

  constructor(private readonly contextService: ContextService) {
    const appPaths = getAppPaths();

    this.workspaceRoots = resolveWorkspaceRoots({
      env: process.env,
      dockerWorkspaceExists: fs.existsSync(DOCKER_WORKSPACE_DIR),
      repoParentDir: appPaths.repoParentDir,
    });
    this.deniedPaths = [appPaths.storageDir, toRealPath(appPaths.storageDir)];
  }

  onModuleInit() {
    if (this.workspaceRoots.source !== 'repo-parent') return;

    this.logger.warn(
      `DOTY_WORKSPACE_ROOTS/BASE_CODE_PATH not set; using the repo's parent folder as the only workspace root: ${this.workspaceRoots.roots.join(', ')}`,
    );
  }

  /** The configured workspace roots (DOTY_WORKSPACE_ROOTS and fallbacks). */
  get roots(): string[] {
    return [...this.workspaceRoots.roots];
  }

  isAllowedRoot(root: string): boolean {
    const allowedRoots = this.workspaceRoots.roots.flatMap((allowed) => [
      allowed,
      toRealPath(allowed),
    ]);

    return (
      isAllowedRoot(root, allowedRoots, this.deniedPaths) &&
      isAllowedRoot(toRealPath(root), allowedRoots, this.deniedPaths)
    );
  }

  assertAllowedRoot(root: string): void {
    if (this.isAllowedRoot(root)) return;

    throw new ForbiddenException(
      `The folder "${root}" is not inside an allowed workspace (DOTY_WORKSPACE_ROOTS).`,
    );
  }

  /** Resolves a tool/user path against the request's workspace root. */
  resolve(input: string | undefined): string {
    const root = this.contextService.get('root');
    if (!root) {
      throw new BadRequestException('Workspace root not found.');
    }

    return this.resolveIn(root, input);
  }

  /** Resolves `input` inside `base`, rejecting traversal and symlink escapes. */
  resolveIn(base: string, input: string | undefined): string {
    try {
      const candidate = resolveWorkspacePath(base, input, this.deniedPaths);
      resolveWorkspacePath(
        toRealPath(base),
        toRealPath(candidate),
        this.deniedPaths,
      );

      return candidate;
    } catch (error) {
      if (error instanceof WorkspaceEscapeError) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }
}
