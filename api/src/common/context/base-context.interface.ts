export interface BaseRequestContext {
  root?: string;
  mode?: string;
  specialty?: string;
  /** The validated `provider:model` this request runs on. */
  modelRef?: string;
  abortGeneration?: () => void;
}
