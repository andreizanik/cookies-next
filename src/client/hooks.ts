import type { OptionsType, TmpCookiesObj, CookieValueTypes } from '../common/types';
import { CookieContext } from './context';
import { useContext, useEffect, useState } from 'react';
import { deleteCookie, getCookie, getCookies, hasCookie, setCookie } from './cookie-functions';
import { PoolingOptions } from './types';

const useWrappedCookieFn = <TCookieFn extends (...args: any) => any>(cookieFnCb: TCookieFn) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return isMounted ? cookieFnCb : ((() => {}) as TCookieFn);
};
const useCookieContext = () => {
  const context = useContext(CookieContext);
  if (!context) {
    throw new Error('useCookieContext must be used within a CookieProvider');
  }
  return context;
};

export const useCookiesPolling = (
  onChange: (newCookies: TmpCookiesObj | undefined) => void,
  poolingOptions?: PoolingOptions,
) => {
  const { intervalMs = 1000, enabled = false } = poolingOptions || {};

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let previousCookies = getCookies();

    const interval = setInterval(() => {
      const currentCookies = getCookies();
      const hasChanged = Object.keys({ ...currentCookies, ...previousCookies }).some(
        key => currentCookies?.[key] !== previousCookies?.[key],
      );

      if (hasChanged) {
        onChange(currentCookies);
        previousCookies = currentCookies;
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [onChange, intervalMs]);
};
const useGetCookies = () => useWrappedCookieFn(getCookies);
const useGetCookie = () => useWrappedCookieFn(getCookie);
const useHasCookie = () => useWrappedCookieFn(hasCookie);
const useSetCookie = () => useWrappedCookieFn(setCookie);
const useDeleteCookie = () => useWrappedCookieFn(deleteCookie);

const useCookiesNext = () => {
  return {
    getCookies: useGetCookies(),
    getCookie: useGetCookie(),
    hasCookie: useHasCookie(),
    setCookie: useSetCookie(),
    deleteCookie: useDeleteCookie(),
  };
};

const useReactiveGetCookies = () => {
  const context = useCookieContext();
  return (_options?: OptionsType | undefined) => context?.getAll();
};
const useReactiveGetCookie = () => {
  const context = useCookieContext();

  return (key: string, _options?: OptionsType | undefined) => {
    return context?.get(key);
  };
};
const useReactiveSetCookie = () => {
  const context = useCookieContext();
  return (key: string, data: any, _options?: OptionsType) => {
    context?.set(key, data);
    return setCookie(key, data);
  };
};
const useReactiveDeleteCookie = () => {
  const context = useCookieContext();
  return (key: string, _options?: OptionsType) => {
    context?.delete(key);
    return deleteCookie(key);
  };
};
const useReactiveHasCookie = () => {
  const context = useCookieContext();
  return (key: string, _options?: OptionsType) => {
    return context?.has(key);
  };
};
const useReactiveCookiesNext = () => {
  return {
    getCookies: useReactiveGetCookies(),
    getCookie: useReactiveGetCookie(),
    hasCookie: useReactiveHasCookie(),
    setCookie: useReactiveSetCookie(),
    deleteCookie: useReactiveDeleteCookie(),
  };
};

export {
  useGetCookies,
  useGetCookie,
  useSetCookie,
  useDeleteCookie,
  useHasCookie,
  useCookiesNext,
  useReactiveCookiesNext,
  useReactiveGetCookies,
  useReactiveGetCookie,
  useReactiveSetCookie,
  useReactiveDeleteCookie,
  useReactiveHasCookie,
};
