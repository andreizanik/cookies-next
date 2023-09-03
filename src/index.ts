import { serialize, parse } from 'cookie';
import type { OptionsType, TmpCookiesObj, CookieValueTypes, AppRouterMiddlewareCookies, DefaultOptions } from './types';
import type { NextRequest, NextResponse } from 'next/server';
export { CookieValueTypes } from './types';

const isClientSide = (): boolean => typeof window !== 'undefined';

const isCookiesFromAppRouterMiddleware = (
  cookieStore: TmpCookiesObj | AppRouterMiddlewareCookies | undefined,
): cookieStore is AppRouterMiddlewareCookies => {
  if (!cookieStore) return false;
  return (
    'getAll' &&
    'set' in cookieStore &&
    typeof cookieStore.getAll === 'function' &&
    typeof cookieStore.set === 'function'
  );
};

const isContextFromAppRouterMiddleware = (
  context?: OptionsType,
): context is { res?: NextResponse; req?: NextRequest } => {
  return (
    (!!context?.req && 'cookies' in context.req && isCookiesFromAppRouterMiddleware(context?.req.cookies)) ||
    (!!context?.res && 'cookies' in context.res && isCookiesFromAppRouterMiddleware(context?.res.cookies))
  );
};

const transformAppRouterMiddlewareCookies = (cookies: AppRouterMiddlewareCookies): TmpCookiesObj => {
  let _cookies: Partial<TmpCookiesObj> = {};

  cookies.getAll().forEach(({ name, value }) => {
    _cookies[name] = value;
  });
  return _cookies;
};

const stringify = (value: string = '') => {
  try {
    const result = JSON.stringify(value);
    return /^[\{\[]/.test(result) ? result : value;
  } catch (e) {
    return value;
  }
};

const decode = (str: string): string => {
  if (!str) return str;

  return str.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
};

export const getCookies = (options?: OptionsType): TmpCookiesObj => {
  if (isContextFromAppRouterMiddleware(options) && options?.req)
    return transformAppRouterMiddlewareCookies(options.req.cookies);
  let req;
  // DefaultOptions['req] can be casted here because is narrowed by using the fn: isContextFromAppRouterMiddleware
  if (options) req = options.req as DefaultOptions['req'];

  if (!isClientSide()) {
    // if cookie-parser is used in project get cookies from ctx.req.cookies
    // if cookie-parser isn't used in project get cookies from ctx.req.headers.cookie

    if (req && req.cookies) return req.cookies;
    if (req && req.headers.cookie) return parse(req.headers.cookie);
    return {};
  }

  const _cookies: TmpCookiesObj = {};
  const documentCookies = document.cookie ? document.cookie.split('; ') : [];

  for (let i = 0, len = documentCookies.length; i < len; i++) {
    const cookieParts = documentCookies[i].split('=');

    const _cookie = cookieParts.slice(1).join('=');
    const name = cookieParts[0];

    _cookies[name] = _cookie;
  }

  return _cookies;
};

export const getCookie = (key: string, options?: OptionsType): CookieValueTypes => {
  const _cookies = getCookies(options);
  const value = _cookies[key];
  if (value === undefined) return undefined;
  return decode(value);
};

export const setCookie = (key: string, data: any, options?: OptionsType): void => {
  if (isContextFromAppRouterMiddleware(options)) {
    const { req, res, ...restOptions } = options;
    const payload = { name: key, value: data, ...restOptions };
    if (req) {
      req.cookies.set(payload);
    }
    if (res) {
      res.cookies.set(payload);
    }
    return;
  }
  let _cookieOptions: any;
  let _req;
  let _res;
  if (options) {
    // DefaultOptions can be casted here because the AppRouterMiddlewareOptions is narrowed using the fn: isContextFromAppRouterMiddleware
    const { req, res, ..._options } = options as DefaultOptions;
    _req = req;
    _res = res;
    _cookieOptions = _options;
  }

  const cookieStr = serialize(key, stringify(data), { path: '/', ..._cookieOptions });
  if (!isClientSide()) {
    if (_res && _req) {
      let currentCookies = _res.getHeader('Set-Cookie');

      if (!Array.isArray(currentCookies)) {
        currentCookies = !currentCookies ? [] : [String(currentCookies)];
      }
      _res.setHeader('Set-Cookie', currentCookies.concat(cookieStr));

      if (_req && _req.cookies) {
        const _cookies = _req.cookies;
        data === '' ? delete _cookies[key] : (_cookies[key] = stringify(data));
      }

      if (_req && _req.headers && _req.headers.cookie) {
        const _cookies = parse(_req.headers.cookie);

        data === '' ? delete _cookies[key] : (_cookies[key] = stringify(data));

        _req.headers.cookie = Object.entries(_cookies).reduce((accum, item) => {
          return accum.concat(`${item[0]}=${item[1]};`);
        }, '');
      }
    }
  } else {
    document.cookie = cookieStr;
  }
};

export const deleteCookie = (key: string, options?: OptionsType): void => {
  return setCookie(key, '', { ...options, maxAge: -1 });
};

export const hasCookie = (key: string, options?: OptionsType): boolean => {
  if (!key) return false;

  const cookie = getCookies(options);
  return cookie.hasOwnProperty(key);
};
