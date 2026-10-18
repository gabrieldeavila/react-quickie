import { interpolateEnv } from './interpolate-env';

describe('interpolateEnv', () => {
  it('replaces variables in nested strings and leaves other values alone', () => {
    const { value, missing } = interpolateEnv(
      { a: '${X}-${Y}', list: ['${X}', 3], nested: { flag: true } },
      { X: '1', Y: '2' },
    );
    expect(value).toEqual({ a: '1-2', list: ['1', 3], nested: { flag: true } });
    expect(missing).toEqual([]);
  });

  it('reports each missing variable once, sorted', () => {
    const { missing } = interpolateEnv(['${B}', '${A}', '${B}'], {});
    expect(missing).toEqual(['A', 'B']);
  });

  it('treats an empty value as set', () => {
    expect(interpolateEnv('x${E}y', { E: '' }).value).toBe('xy');
  });

  it('ignores text that only looks like a variable', () => {
    expect(interpolateEnv('$HOME ${1BAD} ${}', {}).value).toBe(
      '$HOME ${1BAD} ${}',
    );
  });
});
