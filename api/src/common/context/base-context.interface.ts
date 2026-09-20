export interface BaseRequestContext {
  root?: string;
  mode?: string;
  specialty?: string;
  planningModeEnabled?: boolean;
  bashApprovalPending?: boolean;
  abortGeneration?: () => void;
}
