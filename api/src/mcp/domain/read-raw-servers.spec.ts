import { readRawServers } from './read-raw-servers';

describe('readRawServers', () => {
  it('returns the entries as written, without interpolation', () => {
    expect(readRawServers('{"mcpServers":{"a":{"command":"${CMD}"}}}')).toEqual(
      { a: { command: '${CMD}' } },
    );
  });

  it('is empty for a missing or broken file', () => {
    expect(readRawServers(null)).toEqual({});
    expect(readRawServers('{bad')).toEqual({});
  });
});
