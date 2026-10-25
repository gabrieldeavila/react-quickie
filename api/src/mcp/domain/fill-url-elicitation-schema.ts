type IncomingRequest = { method?: unknown; params?: unknown };

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * A URL-mode `elicitation/create` has no `requestedSchema` (that's a form
 * field), but the SDK's request schema requires one and rejects the request.
 * This adds an empty one so the request reaches Doty's handler intact.
 */
export function fillUrlElicitationSchema<T extends IncomingRequest>(
  request: T,
): T {
  const { params } = request;
  if (
    request.method !== 'elicitation/create' ||
    !isRecord(params) ||
    params.mode !== 'url' ||
    params.requestedSchema !== undefined
  ) {
    return request;
  }
  return { ...request, params: { ...params, requestedSchema: {} } };
}
