import type { CookiesFn, OptionsType } from './types';

export const stringify = (value: any) => {
  try {
    if (typeof value === 'string') {
      return value;
    }
    const stringifiedValue = JSON.stringify(value);
    return stringifiedValue;
  } catch (e) {
    return value;
  }
};

export const decode = (str: string): string => {
  if (!str) return str;
  return str.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
};

export const isClientSide = (options?: OptionsType) => {
  const renderPhase = getRenderPhase();
  if (renderPhase === 'server' && typeof options === 'undefined') {
    throw new Error('In server context, options must be provided');
  }

  return !options?.req && !options?.res && !(options && 'cookies' in options && (options?.cookies as CookiesFn));
};

export const getRenderPhase = () => (typeof window === 'undefined' ? 'server' : 'client');
