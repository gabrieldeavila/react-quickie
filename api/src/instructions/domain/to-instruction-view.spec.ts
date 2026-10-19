import type { Instruction } from './instruction.types';
import {
  toInstructionDetailView,
  toInstructionView,
} from './to-instruction-view';

const forms: Instruction = {
  id: 'forms',
  name: 'Forms',
  description: 'Typed forms.',
  starters: ['Build a signup form'],
  content: 'Use Zod.',
  source: 'built-in',
};

describe('toInstructionView', () => {
  it('leaves out the body and marks built-ins as read-only', () => {
    expect(toInstructionView(forms)).toEqual({
      id: 'forms',
      name: 'Forms',
      description: 'Typed forms.',
      starters: ['Build a signup form'],
      source: 'built-in',
      editable: false,
    });
  });

  it('marks global and project instructions as editable', () => {
    expect(toInstructionView({ ...forms, source: 'global' }).editable).toBe(
      true,
    );
    expect(toInstructionView({ ...forms, source: 'project' }).editable).toBe(
      true,
    );
  });

  it('keeps the body in the detail view', () => {
    expect(toInstructionDetailView(forms)).toMatchObject({
      content: 'Use Zod.',
      editable: false,
    });
  });
});
