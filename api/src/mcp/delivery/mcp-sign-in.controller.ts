import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { BuildContextInterceptor } from 'src/common/context/context.interceptor';
import { ContextService } from 'src/common/context/context.service';
import { toSignInRequestView } from '../domain/to-sign-in-request-view';
import { McpOAuthError, McpOAuthService } from '../data/mcp-oauth.service';
import { McpSignInRequestsService } from '../data/mcp-sign-in-requests.service';

@UseInterceptors(
  BuildContextInterceptor((req) => {
    const fromQuery = (req.query as Record<string, unknown>)?.root;
    const fromBody = (req.body as Record<string, unknown> | undefined)?.root;
    const root = typeof fromQuery === 'string' ? fromQuery : fromBody;
    return { root: typeof root === 'string' ? root : undefined };
  }),
)
@Controller('mcp/sign-in-requests')
export class McpSignInController {
  constructor(
    private readonly requests: McpSignInRequestsService,
    private readonly oauth: McpOAuthService,
    private readonly contextService: ContextService,
  ) {}

  /** `GET /mcp/sign-in-requests?root=`: what the chat shows as popups. */
  @Get()
  list() {
    return {
      requests: this.requests.list(this.requireRoot()).map(toSignInRequestView),
    };
  }

  /**
   * `POST /mcp/sign-in-requests/:id/accept` `{ root }`: the page to open.
   * An OAuth request starts the flow (no URL when a refresh was enough).
   */
  @Post(':id/accept')
  @HttpCode(200)
  async accept(@Param('id') id: string): Promise<{ url?: string }> {
    const request = this.requests.accept(this.ownRequest(id).id);
    if (!request) throw new NotFoundException('Sign-in request not found.');
    if (request.source !== 'oauth') return { url: request.url };

    try {
      const started = await this.oauth.start(request.root, request.serverName);
      return started.status === 'redirect'
        ? { url: started.authorizationUrl }
        : {};
    } catch (error) {
      throw new BadRequestException(
        error instanceof McpOAuthError
          ? error.message
          : `Sign-in failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /** `POST /mcp/sign-in-requests/:id/dismiss` `{ root }`. */
  @Post(':id/dismiss')
  @HttpCode(204)
  dismiss(@Param('id') id: string): void {
    this.requests.dismiss(this.ownRequest(id).id);
  }

  /** A request of this project; another project's ids are "not found". */
  private ownRequest(id: string) {
    const request = this.requests.get(id);
    if (!request || request.root !== this.requireRoot()) {
      throw new NotFoundException('Sign-in request not found.');
    }
    return request;
  }

  private requireRoot(): string {
    const root = this.contextService.get('root');
    if (!root) throw new BadRequestException('Send the project root (root).');
    return root;
  }
}
