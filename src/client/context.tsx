'use client';

import React, { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { CookieValueTypes, getCookies, TmpCookiesObj, useCookiesPolling } from '.';
import { stringify } from '../common/utils';
import { PollingOptions } from './types';

type CookieState = TmpCookiesObj;

type CookieContextType = {
  cookies: CookieState;
  set: (key: string, data: any) => void;
  get: (key: string) => CookieValueTypes;
  getAll: () => TmpCookiesObj | undefined;
  has: (key: string) => boolean;
  delete: (key: string) => void;
};

type CookieProviderProps = {
  children: ReactNode;
  pollingOptions?: PollingOptions;
};

export const CookieContext = createContext<CookieContextType | null>(null);

export function CookieProvider({ children, pollingOptions }: CookieProviderProps) {
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
  }, pollingOptions);

  const value = useMemo(() => {
    return {
      cookies,
      set: (key: string, data: any) => {
        setCookies(prev => ({ ...prev, [key]: encodeURIComponent(stringify(data)) }));
      },
      get: (key: string) => {
        const cookieValue = cookies?.[key];

        return cookieValue;
      },
      getAll: () => {
        return cookies;
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
