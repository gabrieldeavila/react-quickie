import { buildServerViews } from './build-server-views';

describe('buildServerViews', () => {
  it('combines config, connection state and trust', () => {
    const views = buildServerViews(
      [
        {
          name: 'gh',
          source: 'global',
          config: { type: 'http', url: 'https://x' },
        },
        { name: 'db', source: 'project', config: { command: 'db-mcp' } },
        {
          name: 'bad',
          source: 'global',
          error: 'Variáveis de ambiente ausentes: X',
        },
      ],
      [{ name: 'shell', source: 'project', config: { command: 'sh' } }],
      (server) =>
        server.name === 'gh'
          ? { status: 'connected', toolCount: 3 }
          : undefined,
    );

    expect(views).toEqual([
      {
        name: 'gh',
        source: 'global',
        transport: 'http',
        status: 'connected',
        toolCount: 3,
      },
      { name: 'db', source: 'project', transport: 'stdio', status: 'idle' },
      {
        name: 'bad',
        source: 'global',
        transport: 'unknown',
        status: 'error',
        error: 'Variáveis de ambiente ausentes: X',
      },
      {
        name: 'shell',
        source: 'project',
        transport: 'stdio',
        status: 'untrusted',
        error: undefined,
      },
    ]);
  });
});
