import { CookieSerializeOptions } from 'cookie';
import { IncomingMessage, ServerResponse } from 'http';
import type { NextRequest, NextResponse } from 'next/server';

export type OptionsType = DefaultOptions | AppRouterMiddlewareOptions;
export interface DefaultOptions extends CookieSerializeOptions {
  res?: ServerResponse;
  req?: IncomingMessage & {
    cookies?: TmpCookiesObj;
  };
}
export type AppRouterMiddlewareOptions = { res?: Response | NextResponse; req?: Request | NextRequest };
export type AppRouterMiddlewareCookies = NextResponse['cookies'] | NextRequest['cookies'];
export type TmpCookiesObj = { [key: string]: string } | Partial<{ [key: string]: string }>;
export type CookieValueTypes = string | undefined;
