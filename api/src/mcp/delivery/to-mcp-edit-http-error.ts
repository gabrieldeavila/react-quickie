import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { McpConfigEditError } from '../domain/mcp-config-text';
import { McpConfigUntrustedError } from '../domain/mcp-config-untrusted.error';

/** The HTTP error for an edit failure, or the error itself when unknown. */
export function toMcpEditHttpError(error: unknown): unknown {
  if (error instanceof McpConfigUntrustedError) {
    return new ForbiddenException(error.message);
  }
  if (error instanceof McpConfigEditError) {
    return error.kind === 'not-found'
      ? new NotFoundException(error.message)
      : new BadRequestException(error.message);
  }
  return error;
}
