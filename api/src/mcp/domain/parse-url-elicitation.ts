import { readSignInUrl } from './sign-in-url';

export type UrlElicitation = {
  url: string;
  message: string;
  elicitationId?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * The URL-mode `elicitation/create` params (`mode: "url"`, `url`,
 * `message`, `elicitationId`), or undefined for form elicitations and URLs
 * a browser shouldn't open.
 */
export function parseUrlElicitation(
  params: unknown,
): UrlElicitation | undefined {
  if (!isRecord(params) || params.mode !== 'url') return undefined;
  const url = readSignInUrl(params.url);
  if (!url) return undefined;
  return {
    url: url.toString(),
    message: typeof params.message === 'string' ? params.message : '',
    ...(typeof params.elicitationId === 'string'
      ? { elicitationId: params.elicitationId }
      : {}),
  };
}
