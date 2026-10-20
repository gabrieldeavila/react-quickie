export interface BaseRequestContext {
  root?: string;
  /** Instruction ids the user selected for this conversation. */
  instructionIds?: string[];
  /** The validated `provider:model` this request runs on. */
  modelRef?: string;
  abortGeneration?: () => void;
}
