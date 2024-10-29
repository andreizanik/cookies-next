import * as clientCookies from './client';
import * as serverCookies from './server';
export * from './common/types';
import type { OptionsType } from './common/types';
import { isClientSide } from './common/utils';

const getRenderPhase = () => (typeof window === 'undefined' ? 'server' : 'client');

const getFn = (fnName: keyof typeof clientCookies, options?: OptionsType) => {
  if (isClientSide(options)) {
    if (getRenderPhase() === 'server') {
      // to prevent crash caused by missing window.document during server rendering phase
      return;
    }
    return clientCookies[fnName];
  }

  return serverCookies[fnName];
};
export const getCookies = (options?: OptionsType) => {
  const fn = getFn('getCookies', options) as (
    options?: OptionsType,
  ) => Promise<serverCookies.TmpCookiesObj> | clientCookies.TmpCookiesObj;
  if (!fn) {
    return;
  }

  return fn(options);
};
export const getCookie = (key: string, options?: OptionsType) => {
  return getFn('getCookie', options)?.(key, options);
};
export const setCookie = (key: string, data: any, options?: OptionsType) => {
  return getFn('setCookie', options)?.(key, data, options);
};
export const deleteCookie = (key: string, options?: OptionsType) => {
  return getFn('deleteCookie', options)?.(key, options);
};
export const hasCookie = (key: string, options?: OptionsType) => {
  return getFn('hasCookie', options)?.(key, options);
};
