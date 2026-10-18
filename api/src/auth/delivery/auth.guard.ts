import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { isAuthorized } from '../domain/check-bearer-token';

/**
 * When `DOTY_AUTH_TOKEN` is set (VSCode), every request needs
 * `Authorization: Bearer <token>`, so other local processes and web pages
 * can't drive an API that runs bash.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();

    if (isAuthorized(process.env.DOTY_AUTH_TOKEN, req.headers.authorization)) {
      return true;
    }

    throw new UnauthorizedException('Invalid access token.');
  }
}
