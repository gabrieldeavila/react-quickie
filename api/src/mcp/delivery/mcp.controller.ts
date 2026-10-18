import {
  BadRequestException,
  Body,
  ConflictException,
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
import { buildServerViews } from '../domain/build-server-views';
import { isUsableServer } from '../domain/mcp-server.types';
import { McpClientPoolService } from '../data/mcp-client-pool.service';
import { McpServersService } from '../data/mcp-servers.service';

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
    private readonly contextService: ContextService,
  ) {}

  /** `GET /mcp/servers?root=`: status, tool count and trust state per server. */
  @Get('servers')
  async list() {
    const root = this.requireRoot();
    const { active, untrusted, globalConfig, projectConfig } =
      await this.serversService.resolve(root);

    return {
      globalConfig,
      projectConfig,
      servers: buildServerViews(active, untrusted, (server) =>
        this.pool.snapshot(root, server),
      ),
    };
  }

  /** Trusts the project `mcp.json` whose content hash the user reviewed. */
  @Post('trust')
  @HttpCode(200)
  async trust(@Body() body: { hash?: unknown }) {
    const root = this.requireRoot();
    if (typeof body.hash !== 'string') {
      throw new BadRequestException('Informe o hash da configuração revisada.');
    }

    const result = await this.serversService.trustProject(root, body.hash);
    if (result === 'missing') {
      throw new NotFoundException('Este projeto não tem .doty/mcp.json.');
    }
    if (result === 'changed') {
      throw new ConflictException(
        'O arquivo mudou desde que foi exibido. Revise-o novamente.',
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
    if (!server)
      throw new NotFoundException(`Servidor MCP "${name}" não encontrado.`);

    await this.pool.disconnect(root, name);
    if (isUsableServer(server)) await this.pool.getTools(root, server);
    return this.list();
  }

  private requireRoot(): string {
    const root = this.contextService.get('root');
    if (!root)
      throw new BadRequestException('Informe a raiz do projeto (root).');
    return root;
  }
}
