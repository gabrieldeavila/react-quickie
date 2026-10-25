import { mcpToolRisk } from './mcp-tool-risk';

describe('mcpToolRisk', () => {
  it('lets read-only tools run, whatever their name', () => {
    expect(mcpToolRisk('get_doc', { readOnlyHint: true })).toBe('changes');
    expect(
      mcpToolRisk('get_drive_file_permissions', { readOnlyHint: true }),
    ).toBe('changes');
  });

  it.each([
    ['no hints', 'create_doc', undefined],
    ['open-world create', 'create_drive_file', { destructiveHint: false }],
    [
      'edit marked destructive',
      'update_drive_file',
      { destructiveHint: true, openWorldHint: true },
    ],
  ])('lets %s run', (_label, name, annotations) => {
    expect(mcpToolRisk(name, annotations)).toBe('changes');
  });

  it.each([
    ['delete', 'delete_event', { destructiveHint: true }],
    ['delete without hints', 'trash_file', undefined],
    ['share', 'set_drive_file_permissions', { destructiveHint: true }],
    ['access change', 'manage_drive_access', { destructiveHint: false }],
  ])('keeps asking for %s', (_label, name, annotations) => {
    expect(mcpToolRisk(name, annotations)).toBe('destructive');
  });
});
