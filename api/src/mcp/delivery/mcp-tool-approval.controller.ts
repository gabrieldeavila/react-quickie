import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { BuildContextInterceptor } from 'src/common/context/context.interceptor';
import { ContextService } from 'src/common/context/context.service';
import { McpToolApprovalService } from '../data/mcp-tool-approval.service';
import { toMcpEditHttpError } from './to-mcp-edit-http-error';

type AlwaysAllowBody = {
  root?: unknown;
  tool?: unknown;
  wholeServer?: unknown;
};

@UseInterceptors(
  BuildContextInterceptor((req) => {
    const root = (req.body as Record<string, unknown> | undefined)?.root;
    return { root: typeof root === 'string' ? root : undefined };
  }),
)
@Controller('mcp/tools')
export class McpToolApprovalController {
  constructor(
    private readonly approvals: McpToolApprovalService,
    private readonly contextService: ContextService,
  ) {}

  /**
   * `POST /mcp/tools/always-allow` `{ root, tool, wholeServer? }`: `tool` is
   * the exposed name (`mcp__<server>__<tool>`) from the approval request.
   */
  @Post('always-allow')
  @HttpCode(204)
  async alwaysAllow(@Body() body: AlwaysAllowBody = {}): Promise<void> {
    const root = this.contextService.get('root');
    if (!root) throw new BadRequestException('Send the project root (root).');
    if (typeof body.tool !== 'string' || !body.tool) {
      throw new BadRequestException('Send the MCP tool name (tool).');
    }
    if (
      body.wholeServer !== undefined &&
      typeof body.wholeServer !== 'boolean'
    ) {
      throw new BadRequestException('"wholeServer" must be true or false.');
    }
    try {
      await this.approvals.alwaysAllow(
        root,
        body.tool,
        body.wholeServer ?? false,
      );
    } catch (error) {
      throw toMcpEditHttpError(error);
    }
  }
}
