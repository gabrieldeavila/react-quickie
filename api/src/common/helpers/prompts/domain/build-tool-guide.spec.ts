import { buildToolGuide } from './build-tool-guide';

const guideFor = (toolNames: string[]) =>
  buildToolGuide(toolNames)[0]?.content ?? '';

describe('buildToolGuide', () => {
  it('is empty without tools', () => {
    expect(buildToolGuide([])).toEqual([]);
    expect(buildToolGuide(['some_unknown_tool'])).toEqual([]);
  });

  it('lists only the groups whose tools are present', () => {
    const guide = guideFor(['read_file', 'edit_file', 'run_bash_command']);

    expect(guide).toMatch(/^Tool guide/);
    expect(guide).toContain('Files:');
    expect(guide).toContain('Shell:');
    expect(guide).not.toContain('Git:');
    expect(guide).not.toContain('Subagents:');
    expect(guide).not.toContain('MCP servers:');
  });

  it('tells the model to read before editing and to prefer edit_file', () => {
    const guide = guideFor(['edit_file']);

    expect(guide).toMatch(/Read a file before you edit it/);
    expect(guide).toMatch(/Prefer `edit_file`/);
  });

  it('includes the git rules when a git tool is present', () => {
    const guide = guideFor(['get_uncommitted_changes']);

    expect(guide).toContain('Git:');
    expect(guide).toMatch(/Commit only when the user asks/);
    expect(guide).toMatch(/Conventional Commits/);
  });

  it('matches MCP tools by prefix and subagents by name', () => {
    const guide = guideFor(['mcp__github__create_issue', 'run_subagent']);

    expect(guide).toContain('MCP servers:');
    expect(guide).toMatch(/side effects/);
    expect(guide).toContain('Subagents:');
    expect(guide).toMatch(/do not see this conversation/);
  });

  it('keeps a stable group order whatever the tool order', () => {
    expect(guideFor(['run_subagent', 'read_file'])).toBe(
      guideFor(['read_file', 'run_subagent']),
    );
  });
});
