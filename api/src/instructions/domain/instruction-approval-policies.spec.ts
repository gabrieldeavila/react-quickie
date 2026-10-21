import { createInstructionApprovalPolicies } from './instruction-approval-policies';

const valid = { name: 'Forms', content: 'Validate on blur.' };

describe('createInstructionApprovalPolicies', () => {
  it('asks the user before saving a valid instruction', () => {
    const policy = createInstructionApprovalPolicies('/repo').save_instruction;
    expect(policy(valid)).toEqual({ decision: 'ask' });
  });

  it('denies an invalid call with the reason, without asking', () => {
    const policy = createInstructionApprovalPolicies().save_instruction;
    expect(policy({ ...valid, scope: 'project' })).toEqual({
      decision: 'always-deny',
      reason: expect.stringContaining('No project is open'),
    });
  });
});
