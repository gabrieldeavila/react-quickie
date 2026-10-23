import { createStorageApprovalPolicies } from './storage-approval-policies';

describe('createStorageApprovalPolicies', () => {
  it('asks before deleting a file, even in auto mode', () => {
    expect(
      createStorageApprovalPolicies().delete_file({ name: 'a.ts' }),
    ).toEqual({ decision: 'ask', risk: 'destructive' });
  });

  it('leaves the other file tools unasked', () => {
    expect(Object.keys(createStorageApprovalPolicies())).toEqual([
      'delete_file',
    ]);
  });
});
