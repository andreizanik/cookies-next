import type { OptionsType, TmpCookiesObj, CookieValueTypes } from '../common/types';
import { CookieContext } from './context';
import { useContext, useEffect, useState } from 'react';
import { deleteCookie, getCookie, getCookies, hasCookie, revalidateCookies, setCookie } from './cookie-functions';
import type { PollingOptions } from './types';

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
  pollingOptions?: PollingOptions,
) => {
  const { intervalMs = 1000, enabled = false } = pollingOptions || {};

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let previousCookies = getCookies();

    const interval = setInterval(() => {
      revalidateCookies(onChange, previousCookies);
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
    return setCookie(key, data, _options);
  };
};
const useReactiveDeleteCookie = () => {
  const context = useCookieContext();
  return (key: string, _options?: OptionsType) => {
    context?.delete(key);
    return deleteCookie(key, _options);
  };
};
const useReactiveHasCookie = () => {
  const context = useCookieContext();
  return (key: string, _options?: OptionsType) => {
    return context?.has(key);
  };
};
const useRevalidateCookiesState = () => {
  const context = useCookieContext();
  return () => {
    context?.revalidateCookiesState();
  };
};
const useReactiveCookiesNext = () => {
  return {
    getCookies: useReactiveGetCookies(),
    getCookie: useReactiveGetCookie(),
    hasCookie: useReactiveHasCookie(),
    setCookie: useReactiveSetCookie(),
    deleteCookie: useReactiveDeleteCookie(),
    revalidateCookiesState: useRevalidateCookiesState(),
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
  useRevalidateCookiesState,
};
