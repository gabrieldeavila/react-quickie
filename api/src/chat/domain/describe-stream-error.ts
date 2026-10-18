import { InvalidToolApprovalSignatureError } from 'ai';
import { describeProviderError } from 'src/llm/domain/describe-provider-error';

export const APPROVAL_EXPIRED_MESSAGE =
  'A aprovação expirou (o servidor foi reiniciado com outro segredo). Peça para o agente tentar de novo.';
export const GENERIC_STREAM_ERROR =
  'Não foi possível concluir a resposta do agente.';

/**
 * Text shown to the user when the agent stream fails. `provider` (the
 * conversation model's provider id) names who failed in provider errors.
 */
export function describeStreamError(error: unknown, provider?: string): string {
  if (InvalidToolApprovalSignatureError.isInstance(error)) {
    return APPROVAL_EXPIRED_MESSAGE;
  }
  return (
    (provider && describeProviderError(error, provider)) || GENERIC_STREAM_ERROR
  );
}
