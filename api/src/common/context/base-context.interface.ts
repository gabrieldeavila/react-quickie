export interface BaseRequestContext {
  root?: string;
  /** Instruction ids the user selected for this conversation. */
  instructionIds?: string[];
  /** Auto mode is on for this conversation (see `applyAutoMode`). */
  autoApprove?: boolean;
  /** The validated `provider:model` this request runs on. */
  modelRef?: string;
  abortGeneration?: () => void;
}
