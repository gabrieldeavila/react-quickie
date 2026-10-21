import { planInstructionSave } from './plan-instruction-save';
import { InvalidInstructionInputError } from './validate-instruction-input';

const base = { name: 'Our API conventions', content: '# Rules\n\nUse REST.' };

describe('planInstructionSave', () => {
  it('defaults to the project scope and an id from the name', () => {
    expect(planInstructionSave(base, '/repo')).toEqual({
      scope: 'project',
      id: 'our-api-conventions',
      input: { ...base, description: '', starters: [] },
      replace: false,
    });
  });

  it('defaults to the global scope without a project', () => {
    expect(planInstructionSave(base).scope).toBe('global');
  });

  it('keeps an explicit scope, id and replace flag', () => {
    const plan = planInstructionSave(
      { ...base, scope: 'global', id: 'api', replace: true },
      '/repo',
    );
    expect(plan).toMatchObject({ scope: 'global', id: 'api', replace: true });
  });

  it('refuses the project scope without a project', () => {
    expect(() => planInstructionSave({ ...base, scope: 'project' })).toThrow(
      InvalidInstructionInputError,
    );
  });

  it('refuses ids that could escape the folder', () => {
    expect(() => planInstructionSave({ ...base, id: '../x' }, '/repo')).toThrow(
      /Invalid id/,
    );
  });

  it('refuses a name that gives no id', () => {
    expect(() =>
      planInstructionSave({ ...base, name: '***' }, '/repo'),
    ).toThrow(/Invalid id/);
  });

  it('refuses empty content', () => {
    expect(() =>
      planInstructionSave({ ...base, content: '  ' }, '/repo'),
    ).toThrow(/content is required/);
  });
});
