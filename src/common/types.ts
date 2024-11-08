import { SerializeOptions } from 'cookie';
import { IncomingMessage, ServerResponse } from 'http';
import type { cookies } from 'next/headers';
import type { RequestCookies, ResponseCookies } from 'next/dist/compiled/@edge-runtime/cookies';

/* 
We need to declare our own extensions of Request and Response
because NextResponse and NextRequest have an [INTERNALS] property,
which is a symbol that conflicts with the types provided by the user to our exported function.

The TypeScript error that occurred before this re-declaration was as follows: 

  Property '[INTERNALS]' is missing in type 'import("node_modules/next/dist/server/web/spec-extension/response").NextResponse<unknown>' 
  but required in type 'import("cookies-next/node_modules/next/dist/server/web/spec-extension/response").NextResponse<unknown>'.ts(2741)

*/
interface NextCookiesRequest extends Request {
  get cookies(): RequestCookies;
}

interface NextCookiesResponse extends Response {
  get cookies(): ResponseCookies;
}

export interface HttpContext extends SerializeOptions {
  req?: IncomingMessage & {
    // Might be set by third-party libraries such as `cookie-parser`
    cookies?: TmpCookiesObj;
  };
  res?: ServerResponse;
}
export type NextContext = {
  req?: NextCookiesRequest;
  res?: NextCookiesResponse;
  cookies?: CookiesFn;
};
export type OptionsType = HttpContext | NextContext;

export type CookiesFn = typeof cookies;
export type NextCookies = NextCookiesResponse['cookies'] | NextCookiesRequest['cookies'];
export type TmpCookiesObj = { [key: string]: string } | Partial<{ [key: string]: string }>;
export type CookieValueTypes = string | undefined;
