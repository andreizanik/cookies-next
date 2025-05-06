import type { OptionsType, TmpCookiesObj, CookieValueTypes } from '../common/types';
import { useCookieContext } from './context';
import { useEffect, useRef, useState } from 'react';
import { deleteCookie, getCookie, getCookies, hasCookie, setCookie } from './cookie-functions';
import { PoolingOptions } from './types';

const useWrappedCookieFn = <TCookieFn extends (...args: any) => any>(cookieFnCb: TCookieFn) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return isMounted ? cookieFnCb : ((() => {}) as TCookieFn);
};
const useReactiveWrappedCookieFn = <TCookieFn extends (...args: any) => any>(cookieFnCb: TCookieFn) => {
  const context = useCookieContext();
  const operation = cookieFnCb.name;

  if (operation === 'setCookie') {
    return (...args: any) => {
      context?.set(args[0], args[1]);
      return cookieFnCb(...args) as ReturnType<TCookieFn>;
    };
  }
  if (operation === 'getCookie') {
    return (...args: any) => {
      return context?.get(args[0]) as ReturnType<TCookieFn>;
    };
  }
  if (operation === 'getCookies') {
    return () => context?.get() as ReturnType<TCookieFn>;
  }
  if (operation === 'hasCookie') {
    return (...args: any) => {
      return context?.has(args[0]) as ReturnType<TCookieFn>;
    };
  }
  if (operation === 'deleteCookie') {
    return (...args: any) => {
      context?.delete(args[0]);
      return cookieFnCb(...args) as ReturnType<TCookieFn>;
    };
  }
  throw new Error(`Unknown operation: ${operation}`);
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

const useReactiveGetCookies = () => useReactiveWrappedCookieFn(getCookies);
const useReactiveGetCookie = () => useReactiveWrappedCookieFn(getCookie);
const useReactiveSetCookie = () => useReactiveWrappedCookieFn(setCookie);
const useReactiveDeleteCookie = () => useReactiveWrappedCookieFn(deleteCookie);
const useReactiveHasCookie = () => useReactiveWrappedCookieFn(hasCookie);
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
