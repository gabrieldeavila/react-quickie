import { createGitApprovalPolicies } from './git-approval-policies';

describe('createGitApprovalPolicies', () => {
  it('asks before every commit', () => {
    const policies = createGitApprovalPolicies();

    expect(
      policies.create_commit({ message: 'feat: x', files: ['.'] }),
    ).toEqual({ decision: 'ask' });
  });

  it('leaves the read-only git tools without a policy', () => {
    expect(Object.keys(createGitApprovalPolicies())).toEqual(['create_commit']);
  });
});
