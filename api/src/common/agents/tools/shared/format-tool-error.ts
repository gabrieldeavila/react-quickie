export type ToolResult<T = unknown> =
  | {
      success: true;
      message: string;
      data: T;
    }
  | {
      success: false;
      message: string;
      error: string;
    };

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (
    typeof error === 'number' ||
    typeof error === 'boolean' ||
    typeof error === 'bigint'
  ) {
    return String(error);
  }

  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error);
    } catch {
      return 'Erro desconhecido.';
    }
  }

  return 'Erro desconhecido.';
}

export function toolSuccess<T>(message: string, data: T): ToolResult<T> {
  return { success: true, message, data };
}

export function toolFailure(
  message: string,
  error: unknown,
): ToolResult<never> {
  return {
    success: false,
    message,
    error: getErrorMessage(error),
  };
}

export function formatToolError(
  action: string,
  error: unknown,
): ToolResult<never> {
  return toolFailure(`Não foi possível ${action}.`, error);
}
