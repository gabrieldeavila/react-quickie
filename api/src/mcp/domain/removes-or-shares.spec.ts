import { removesOrShares } from './removes-or-shares';

describe('removesOrShares', () => {
  it.each([
    'delete_file',
    'trash_file',
    'removeLabel',
    'share_file',
    'set_drive_file_permissions',
    'manage_drive_access',
  ])('flags %s', (name) => {
    expect(removesOrShares(name)).toBe(true);
  });

  it.each(['update_drive_file', 'modify_doc_text', 'create_doc', 'get_doc'])(
    'lets %s through',
    (name) => {
      expect(removesOrShares(name)).toBe(false);
    },
  );
});
