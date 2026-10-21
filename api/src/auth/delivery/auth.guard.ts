import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { isAuthorized } from '../domain/check-bearer-token';
import { IS_PUBLIC_KEY } from './public.decorator';

/**
 * When `DOTY_AUTH_TOKEN` is set (VSCode), every request needs
 * `Authorization: Bearer <token>`, so other local processes and web pages
 * can't drive an API that runs bash. Routes marked `@Public()` skip it.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest<Request>();

    if (isAuthorized(process.env.DOTY_AUTH_TOKEN, req.headers.authorization)) {
      return true;
    }

    throw new UnauthorizedException('Invalid access token.');
  }
}
