import { SECRET_MASK } from './mask-mcp-secrets';
import { toEditableViews } from './to-editable-views';

describe('toEditableViews', () => {
  it('adds scope, disabled and the masked raw entry', () => {
    const views = toEditableViews(
      [
        { name: 'gh', source: 'global', transport: 'http', status: 'idle' },
        {
          name: 'db',
          source: 'project',
          transport: 'stdio',
          status: 'disabled',
        },
      ],
      {
        global: {
          gh: {
            type: 'http',
            url: 'https://x',
            headers: { Authorization: 'Bearer real-token' },
          },
        },
        project: { db: { command: 'db', disabled: true } },
      },
    );

    expect(views).toEqual([
      {
        name: 'gh',
        source: 'global',
        transport: 'http',
        status: 'idle',
        scope: 'global',
        disabled: false,
        config: {
          type: 'http',
          url: 'https://x',
          headers: { Authorization: SECRET_MASK },
        },
      },
      {
        name: 'db',
        source: 'project',
        transport: 'stdio',
        status: 'disabled',
        scope: 'project',
        disabled: true,
        config: { command: 'db', disabled: true },
      },
    ]);
  });
});
