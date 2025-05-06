'use client';

import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { getCookies, TmpCookiesObj, useCookiesPolling } from '.';
import { stringify } from '../common/utils';
import { PoolingOptions } from './types';

type CookieState = TmpCookiesObj;

type CookieContextType = {
  cookies: TmpCookiesObj;
  set: (key: string, data: any) => void;
  get: (key?: string) => CookieState | string | undefined;
  has: (key: string) => boolean;
  delete: (key: string) => void;
};

type CookieProviderProps = {
  children: ReactNode;
  poolingOptions?: PoolingOptions;
};

export const CookieContext = createContext<CookieContextType | null>(null);

export function CookieProvider({ children, poolingOptions }: CookieProviderProps) {
  const [cookies, setCookies] = useState<CookieState>({});

  useEffect(() => {
    const initialCookies = getCookies();
    if (!initialCookies) {
      return;
    }
    setCookies(initialCookies);
  }, []);

  useCookiesPolling(newCookies => {
    if (newCookies) {
      setCookies(newCookies);
    }
  }, poolingOptions);

  const value = useMemo(() => {
    return {
      cookies,
      set: (key: string, data: any) => {
        setCookies(prev => ({ ...prev, [key]: encodeURIComponent(stringify(data)) }));
      },
      get: (key?: string) => {
        if (!key) {
          return cookies;
        }
        const cookieValue = cookies?.[key];

        return cookieValue;
      },
      has: (key: string) => {
        return cookies.hasOwnProperty(key);
      },
      delete: (key: string) => {
        if (!cookies.hasOwnProperty(key)) {
          return;
        }
        setCookies(prev => {
          const newCookies = { ...prev };
          delete newCookies[key];
          return newCookies;
        });
      },
    };
  }, [cookies]);

  return <CookieContext.Provider value={value}>{children}</CookieContext.Provider>;
}
