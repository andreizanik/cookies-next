import { CookieSerializeOptions } from 'cookie';
import { IncomingMessage, ServerResponse } from 'http';
import type { NextRequest, NextResponse } from 'next/server';
import type { cookies } from 'next/headers';

export type OptionsType = DefaultOptions | AppRouterMiddlewareOptions; // try conditional
export interface DefaultOptions extends CookieSerializeOptions {
  res?: ServerResponse;
  req?: IncomingMessage & {
    cookies?: TmpCookiesObj;
  };
  cookies?: CookiesFn;
}

export type CookiesFn = typeof cookies;
export type AppRouterMiddlewareOptions = {
  res?: Response | NextResponse;
  req?: Request | NextRequest;
  cookies?: CookiesFn;
};
export type AppRouterMiddlewareCookies = NextResponse['cookies'] | NextRequest['cookies'];
export type TmpCookiesObj = { [key: string]: string } | Partial<{ [key: string]: string }>;
export type CookieValueTypes = string | undefined;
