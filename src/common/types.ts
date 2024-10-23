import { SerializeOptions } from 'cookie';
import { IncomingMessage, ServerResponse } from 'http';
import type { NextRequest, NextResponse } from 'next/server';
import type { cookies } from 'next/headers';

export interface HttpContext extends SerializeOptions {
  req?: IncomingMessage & {
    // Might be set by third-party libraries such as `cookie-parser`
    cookies?: TmpCookiesObj;
  };
  res?: ServerResponse;
}
export interface NextContext {
  req?: NextRequest;
  res?: NextResponse;
  cookies?: CookiesFn;
}
export type OptionsType = HttpContext | NextContext;

export type CookiesFn = typeof cookies;
export type NextCookies = NextResponse['cookies'] | NextRequest['cookies'];
export type TmpCookiesObj = { [key: string]: string } | Partial<{ [key: string]: string }>;
export type CookieValueTypes = string | undefined;
