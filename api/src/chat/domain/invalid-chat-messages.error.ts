/** Raised by the message pipeline; the controller maps it to HTTP 400. */
export class InvalidChatMessagesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidChatMessagesError';
  }
}
