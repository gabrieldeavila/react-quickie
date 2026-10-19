import { readInstructionIds } from './read-instruction-ids';

describe('readInstructionIds', () => {
  it('keeps non-empty strings', () => {
    expect(readInstructionIds(['forms', '', 3, null, 'api'])).toEqual([
      'forms',
      'api',
    ]);
  });

  it('is empty for anything but a list', () => {
    expect(readInstructionIds(undefined)).toEqual([]);
    expect(readInstructionIds('forms')).toEqual([]);
    expect(readInstructionIds({ 0: 'forms' })).toEqual([]);
  });
});
