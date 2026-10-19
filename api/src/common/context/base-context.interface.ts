export interface BaseRequestContext {
  root?: string;
  mode?: string;
  specialty?: string;
  /** Instruction ids the user selected for this conversation. */
  instructionIds?: string[];
  /** The validated `provider:model` this request runs on. */
  modelRef?: string;
  abortGeneration?: () => void;
}
