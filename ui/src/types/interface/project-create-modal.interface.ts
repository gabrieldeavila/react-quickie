export type ProjectCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (path: string) => void;
};
