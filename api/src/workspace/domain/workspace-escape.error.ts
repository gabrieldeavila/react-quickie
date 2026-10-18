export class WorkspaceEscapeError extends Error {
  constructor(
    readonly input: string,
    reason = 'fora do workspace permitido',
  ) {
    super(`O caminho "${input}" está ${reason}.`);
    this.name = 'WorkspaceEscapeError';
  }
}
