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
          error: 'Missing environment variables: X',
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
        error: 'Missing environment variables: X',
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

  it('lists disabled servers without asking the pool', () => {
    const snapshotOf = jest.fn();
    const views = buildServerViews(
      [
        {
          name: 'off',
          source: 'global',
          config: { command: 'x', disabled: true },
          disabled: true,
        },
      ],
      [],
      snapshotOf,
    );

    expect(views).toEqual([
      { name: 'off', source: 'global', transport: 'stdio', status: 'disabled' },
    ]);
    expect(snapshotOf).not.toHaveBeenCalled();
  });
});
