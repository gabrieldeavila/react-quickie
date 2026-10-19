export class WorkspaceEscapeError extends Error {
  constructor(
    readonly input: string,
    reason = 'outside the allowed workspace',
  ) {
    super(`The path "${input}" is ${reason}.`);
    this.name = 'WorkspaceEscapeError';
  }
}
