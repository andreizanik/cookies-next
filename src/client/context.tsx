'use client';

import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { getCookies, TmpCookiesObj } from '.';
import { stringify } from '../common/utils';

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
};

const CookieContext = createContext<CookieContextType | null>(null);

export function CookieProvider({ children }: CookieProviderProps) {
  const [cookies, setCookies] = useState<CookieState>({});

  useEffect(() => {
    const initialCookies = getCookies();
    if (!initialCookies) {
      return;
    }
    setCookies(initialCookies);
  }, []);
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

export function useCookieContext() {
  const context = useContext(CookieContext);
  if (!context) {
    throw new Error('useCookieContext must be used within a CookieProvider');
  }
  return context;
}
