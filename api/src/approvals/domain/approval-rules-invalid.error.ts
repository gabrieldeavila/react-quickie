/** The rules file can't be parsed; edits refuse to overwrite it. */
export class ApprovalRulesInvalidError extends Error {
  constructor(filePath: string, reason: string) {
    super(`${filePath} is invalid (${reason}) Fix or delete it first.`);
  }
}
