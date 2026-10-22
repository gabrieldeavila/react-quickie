import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { BuildContextInterceptor } from 'src/common/context/context.interceptor';
import { ContextService } from 'src/common/context/context.service';
import { McpConfigConflictError } from '../domain/mcp-config-conflict.error';
import { McpConfigUntrustedError } from '../domain/mcp-config-untrusted.error';
import { McpConfigEditError } from '../domain/mcp-config-text';
import {
  isUsableServer,
  type McpConfigSource,
} from '../domain/mcp-server.types';
import { McpClientPoolService } from '../data/mcp-client-pool.service';
import {
  McpConfigEditsService,
  type OAuthSourceRef,
} from '../data/mcp-config-edits.service';
import { McpServersService } from '../data/mcp-servers.service';
import { McpServerCatalogService } from '../data/mcp-server-catalog.service';

type EditBody = {
  scope?: unknown;
  baseHash?: unknown;
  config?: unknown;
  disabled?: unknown;
  toolApproval?: unknown;
  /** `{ scope, name }` of the server a reused OAuth client comes from. */
  oauthFrom?: unknown;
};

@UseInterceptors(
  BuildContextInterceptor((req) => {
    const fromQuery = (req.query as Record<string, unknown>)?.root;
    const fromBody = (req.body as Record<string, unknown> | undefined)?.root;
    const root = typeof fromQuery === 'string' ? fromQuery : fromBody;
    return { root: typeof root === 'string' ? root : undefined };
  }),
)
@Controller('mcp')
export class McpController {
  constructor(
    private readonly serversService: McpServersService,
    private readonly pool: McpClientPoolService,
    private readonly edits: McpConfigEditsService,
    private readonly catalog: McpServerCatalogService,
    private readonly contextService: ContextService,
  ) {}

  /**
   * `GET /mcp/servers?root=`: status, tool count, trust state, scope and the
   * masked entry per server, plus each file's hash for edits.
   */
  @Get('servers')
  async list() {
    return this.catalog.list(this.requireRoot());
  }

  /**
   * `PUT /mcp/servers/:name` `{ scope, config, baseHash, oauthFrom? }`: add
   * or replace.
   */
  @Put('servers/:name')
  async upsert(@Param('name') name: string, @Body() body: EditBody) {
    const root = this.requireRoot();
    const scope = this.readScope(body.scope);
    await this.runEdit(() =>
      this.edits.upsert(
        root,
        scope,
        name,
        body.config,
        this.readBaseHash(body.baseHash),
        this.readOAuthFrom(body.oauthFrom),
      ),
    );
    return this.list();
  }

  /** `DELETE /mcp/servers/:name?root=&scope=&baseHash=`. */
  @Delete('servers/:name')
  async remove(
    @Param('name') name: string,
    @Query('scope') scope: unknown,
    @Query('baseHash') baseHash: unknown,
  ) {
    const root = this.requireRoot();
    const target = this.readScope(scope);
    await this.runEdit(() =>
      this.edits.remove(root, target, name, this.readBaseHash(baseHash)),
    );
    return this.list();
  }

  /** `PATCH /mcp/servers/:name` `{ scope, disabled?, toolApproval?, baseHash? }`. */
  @Patch('servers/:name')
  async patch(@Param('name') name: string, @Body() body: EditBody) {
    const root = this.requireRoot();
    const scope = this.readScope(body.scope);
    if (body.disabled !== undefined && typeof body.disabled !== 'boolean') {
      throw new BadRequestException('"disabled" must be true or false.');
    }
    if (body.disabled === undefined && body.toolApproval === undefined) {
      throw new BadRequestException('Send "disabled" or "toolApproval".');
    }
    await this.runEdit(() =>
      this.edits.patch(
        root,
        scope,
        name,
        {
          disabled: body.disabled as boolean | undefined,
          toolApproval: body.toolApproval,
        },
        this.readBaseHash(body.baseHash),
      ),
    );
    return this.list();
  }

  /** Trusts the project `mcp.json` whose content hash the user reviewed. */
  @Post('trust')
  @HttpCode(200)
  async trust(@Body() body: { hash?: unknown }) {
    const root = this.requireRoot();
    if (typeof body.hash !== 'string') {
      throw new BadRequestException('Send the hash of the reviewed config.');
    }

    const result = await this.serversService.trustProject(root, body.hash);
    if (result === 'missing') {
      throw new NotFoundException('This project has no .doty/mcp.json.');
    }
    if (result === 'changed') {
      throw new ConflictException(
        'The file changed since it was shown. Review it again.',
      );
    }
    return this.list();
  }

  /** Drops the client and connects again right away. */
  @Post(':name/reconnect')
  @HttpCode(200)
  async reconnect(@Param('name') name: string) {
    const root = this.requireRoot();
    const { active } = await this.serversService.resolve(root);
    const server = active.find((candidate) => candidate.name === name);
    if (!server) throw new NotFoundException(`MCP server "${name}" not found.`);

    await this.pool.disconnect(root, name);
    if (isUsableServer(server)) await this.pool.getTools(root, server);
    return this.list();
  }

  /** Maps edit errors to HTTP; a conflict answers 409 with the fresh list. */
  private async runEdit(edit: () => Promise<void>): Promise<void> {
    try {
      await edit();
    } catch (error) {
      if (error instanceof McpConfigConflictError) {
        throw new ConflictException({
          statusCode: 409,
          message: error.message,
          ...(await this.list()),
        });
      }
      if (error instanceof McpConfigUntrustedError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof McpConfigEditError) {
        throw error.kind === 'not-found'
          ? new NotFoundException(error.message)
          : new BadRequestException(error.message);
      }
      throw error;
    }
  }

  private readScope(value: unknown): McpConfigSource {
    if (value === 'global' || value === 'project') return value;
    throw new BadRequestException('Scope must be "global" or "project".');
  }

  private readOAuthFrom(value: unknown): OAuthSourceRef | undefined {
    if (value === undefined || value === null) return undefined;
    const ref = value as Record<string, unknown>;
    if (typeof ref.name !== 'string') {
      throw new BadRequestException('"oauthFrom.name" must be a string.');
    }
    return { scope: this.readScope(ref.scope), name: ref.name };
  }

  /** Missing → no check; "" or null → the file must not exist yet. */
  private readBaseHash(value: unknown): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    if (typeof value === 'string') return value;
    throw new BadRequestException('"baseHash" must be a string.');
  }

  private requireRoot(): string {
    const root = this.contextService.get('root');
    if (!root) throw new BadRequestException('Send the project root (root).');
    return root;
  }
}
