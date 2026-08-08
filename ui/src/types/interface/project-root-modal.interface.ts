export type ProjectRootModalProps = {
  isOpen: boolean;
  planningModeEnabled: boolean;
  value: string;
  onChange: (value: string) => void;
  onPlanningModeChange: (enabled: boolean) => void;
  onClose: () => void;
  onSave: () => void;
};
