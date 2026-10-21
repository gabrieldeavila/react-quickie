import { instructionIdFromName } from './instruction-id-from-name';

describe('instructionIdFromName', () => {
  it('turns a name into a file-safe id', () => {
    expect(instructionIdFromName('Landing Pages (v2)')).toBe(
      'landing-pages-v2',
    );
    expect(instructionIdFromName('  Our API conventions!  ')).toBe(
      'our-api-conventions',
    );
  });

  it('folds accents', () => {
    expect(instructionIdFromName('Revisão de código')).toBe(
      'revisao-de-codigo',
    );
  });

  it('caps the id at 64 characters without a trailing dash', () => {
    const id = instructionIdFromName(`${'a'.repeat(63)} b`);
    expect(id).toBe('a'.repeat(63));
  });

  it('returns an empty id when nothing usable is left', () => {
    expect(instructionIdFromName('***')).toBe('');
  });
});
