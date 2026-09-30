export interface BaseRequestContext {
  root?: string;
  mode?: string;
  specialty?: string;
  bashApprovalPending?: boolean;
  abortGeneration?: () => void;
  emitSubagentEvent?: (event: {
    id: string;
    name: string;
    task: string;
    status: 'running' | 'completed' | 'failed';
  }) => void;
}
