import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ContextService } from './context.service';

@Injectable()
export class ContextFallbackMiddleware implements NestMiddleware {
  constructor(private readonly contextService: ContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const fallbackContext = {};

    this.contextService.run(fallbackContext, () => next());
  }
}
