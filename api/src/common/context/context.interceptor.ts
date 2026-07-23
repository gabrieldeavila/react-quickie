import { CallHandler, ExecutionContext, Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { Request } from 'express';
import { ContextService } from './context.service';
import { BaseRequestContext } from './base-context.interface';

export function BuildContextInterceptor<T extends BaseRequestContext>(
  builderFn: (req: Request) => T,
): Type<NestInterceptor> {
  
  @Injectable()
  class MixinContextInterceptor implements NestInterceptor {
    constructor(private readonly contextService: ContextService) {}

    intercept(ctx: ExecutionContext, next: CallHandler) {
      const req = ctx.switchToHttp().getRequest<Request>();
      
      const contextData = builderFn(req); 

      return this.contextService.run(contextData, () => next.handle());
    }
  }

  return mixin(MixinContextInterceptor);
}