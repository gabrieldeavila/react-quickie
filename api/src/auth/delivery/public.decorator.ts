import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'doty:isPublic';

/**
 * Skips the bearer-token check. Only for routes a browser reaches without
 * the token (the OAuth callback), which must protect themselves another way.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
