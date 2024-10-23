import * as clientCookies from './client';
import * as serverCookies from './server';
export * from './common/types';

// Re-export individual functions for backwards compatibility
export const { getCookie, getCookies, setCookie, deleteCookie, hasCookie } =
  typeof window === 'undefined' ? serverCookies : clientCookies;
