import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { Public } from 'src/auth/delivery/public.decorator';
import { BuildContextInterceptor } from 'src/common/context/context.interceptor';
import { ContextService } from 'src/common/context/context.service';
import { McpOAuthError, McpOAuthService } from '../data/mcp-oauth.service';
import { McpServerCatalogService } from '../data/mcp-server-catalog.service';

type CallbackQuery = {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
};

function readText(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined;
}

@UseInterceptors(
  BuildContextInterceptor((req) => {
    const fromQuery = (req.query as Record<string, unknown>)?.root;
    const fromBody = (req.body as Record<string, unknown> | undefined)?.root;
    const root = typeof fromQuery === 'string' ? fromQuery : fromBody;
    return { root: typeof root === 'string' ? root : undefined };
  }),
)
@Controller('mcp')
export class McpOAuthController {
  constructor(
    private readonly oauth: McpOAuthService,
    private readonly catalog: McpServerCatalogService,
    private readonly contextService: ContextService,
  ) {}

  /**
   * `POST /mcp/:name/oauth/start` `{ root }`: the URL the UI opens in the
   * browser (`authorizationUrl`), or none when the stored tokens could be
   * refreshed; plus the server list.
   */
  @Post(':name/oauth/start')
  @HttpCode(200)
  async start(@Param('name') name: string) {
    const root = this.requireRoot();
    const result = await this.run(() => this.oauth.start(root, name));
    return {
      ...(result.status === 'redirect'
        ? { authorizationUrl: result.authorizationUrl }
        : {}),
      ...(await this.catalog.list(root)),
    };
  }

  /** `DELETE /mcp/:name/oauth?root=`: forgets the tokens. */
  @Delete(':name/oauth')
  async signOut(@Param('name') name: string) {
    const root = this.requireRoot();
    await this.run(() => this.oauth.signOut(root, name));
    return this.catalog.list(root);
  }

  /**
   * `GET /mcp/oauth/callback`: where the provider sends the browser back.
   * Public because the browser has no API token; the single-use `state`
   * (and PKCE) tie it to a sign-in the user started from Doty.
   */
  @Public()
  @Get('oauth/callback')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  callback(@Query() query: CallbackQuery): Promise<string> {
    return this.oauth.handleCallback({
      code: readText(query.code),
      state: readText(query.state),
      error: readText(query.error),
      errorDescription: readText(query.error_description),
    });
  }

  /** Expected failures become 400s with their message. */
  private async run<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error) {
      if (error instanceof McpOAuthError) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(
        `Sign-in failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private requireRoot(): string {
    const root = this.contextService.get('root');
    if (!root) throw new BadRequestException('Send the project root (root).');
    return root;
  }
}
