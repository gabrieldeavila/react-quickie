import { InvalidToolApprovalSignatureError } from 'ai';

export const APPROVAL_EXPIRED_MESSAGE =
  'A aprovação expirou (o servidor foi reiniciado com outro segredo). Peça para o agente tentar de novo.';
export const GENERIC_STREAM_ERROR =
  'Não foi possível concluir a resposta do agente.';

/** Text shown to the user when the agent stream fails. */
export function describeStreamError(error: unknown): string {
  if (InvalidToolApprovalSignatureError.isInstance(error)) {
    return APPROVAL_EXPIRED_MESSAGE;
  }
  return GENERIC_STREAM_ERROR;
}
