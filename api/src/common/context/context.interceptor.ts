import {
  CallHandler,
  ExecutionContext,
  Injectable,
  mixin,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { Request } from 'express';
import { WorkspaceService } from 'src/workspace/data/workspace.service';
import { ContextService } from './context.service';
import { BaseRequestContext } from './base-context.interface';

export function BuildContextInterceptor<T extends BaseRequestContext>(
  builderFn: (req: Request) => T,
): Type<NestInterceptor> {
  @Injectable()
  class MixinContextInterceptor implements NestInterceptor {
    constructor(
      private readonly contextService: ContextService,
      private readonly workspaceService: WorkspaceService,
    ) {}

    intercept(ctx: ExecutionContext, next: CallHandler) {
      const req = ctx.switchToHttp().getRequest<Request>();

      const contextData = builderFn(req);
      if (contextData.root) {
        this.workspaceService.assertAllowedRoot(contextData.root);
      }

      return this.contextService.run(contextData, () => next.handle());
    }
  }

  return mixin(MixinContextInterceptor);
}
