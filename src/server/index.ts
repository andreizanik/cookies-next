import { serialize, parse } from 'cookie';
import type {
  OptionsType,
  TmpCookiesObj,
  CookieValueTypes,
  AppRouterCookies,
  DefaultOptions,
  CookiesFn,
} from '../common/types';
import { stringify, decode, isClientSide } from '../common/utils';
import type { NextRequest, NextResponse } from 'next/server';

const ensureServerSide = () => {
  if (isClientSide()) {
    throw new Error('You are trying to access cookies on the client side. Please, use the client-side import with `cookies-next/client` instead.');
  }
};

const isCookiesFromAppRouter = (
  cookieStore: TmpCookiesObj | AppRouterCookies | undefined,
): cookieStore is AppRouterCookies => {
  ensureServerSide();
  if (!cookieStore) return false;
  return (
    'getAll' in cookieStore &&
    'set' in cookieStore &&
    typeof cookieStore.getAll === 'function' &&
    typeof cookieStore.set === 'function'
  );
};

const isPotentialContextFromAppRouter = (
  context?: OptionsType,
): context is { res?: NextResponse; req?: NextRequest; cookies?: CookiesFn } => {
  ensureServerSide();
  return (
    (!!context?.req && 'cookies' in context.req) ||
    (!!context?.res && 'cookies' in context.res) ||
    (!!context?.cookies && typeof context.cookies === 'function')
  );
};

const validateContextCookies = async (context: {
  res?: NextResponse;
  req?: NextRequest;
  cookies?: CookiesFn;
}): Promise<boolean> => {
  ensureServerSide();
  if (context.req && 'cookies' in context.req) {
    return isCookiesFromAppRouter(context.req.cookies);
  }
  if (context.res && 'cookies' in context.res) {
    return isCookiesFromAppRouter(context.res.cookies);
  }
  if (context.cookies) {
    const cookies = await context.cookies();
    return isCookiesFromAppRouter(cookies);
  }
  return false;
};

const transformAppRouterCookies = (cookies: AppRouterCookies): TmpCookiesObj => {
  ensureServerSide();
  let _cookies: Partial<TmpCookiesObj> = {};
  cookies.getAll().forEach(({ name, value }) => {
    _cookies[name] = value;
  });
  return _cookies;
};

const getCookies = async (options?: OptionsType): Promise<TmpCookiesObj> => {
  ensureServerSide();

  if (isPotentialContextFromAppRouter(options) && (await validateContextCookies(options))) {
    if (options?.req) {
      return transformAppRouterCookies(options.req.cookies);
    }
    if (options?.cookies) {
      if (await validateContextCookies({ cookies: options.cookies })) {
        return transformAppRouterCookies(await options.cookies());
      }
    }
  }

  let req;
  if (options) req = options.req as DefaultOptions['req'];
  if (req && req.cookies) return req.cookies;
  if (req && req.headers.cookie) return parse(req.headers.cookie);
  return {};
};

const getCookie = async (key: string, options?: OptionsType): Promise<CookieValueTypes> => {
  ensureServerSide();
  const _cookies = await getCookies(options);
  const value = _cookies[key];
  if (value === undefined) return undefined;
  return decode(value);
};

const setCookie = async (key: string, data: any, options?: OptionsType): Promise<void> => {
  ensureServerSide();

  if (isPotentialContextFromAppRouter(options) && (await validateContextCookies(options))) {
    const { req, res, cookies: cookiesFn, ...restOptions } = options;
    const payload = { name: key, value: stringify(data), ...restOptions };

    if (req) {
      req.cookies.set(payload);
    }
    if (res) {
      res.cookies.set(payload);
    }
    if (cookiesFn) {
      (await cookiesFn()).set(payload);
    }
    return;
  }

  let _cookieOptions: any;
  let _req;
  let _res;

  if (options) {
    const { req, res, ..._options } = options as DefaultOptions;
    _req = req;
    _res = res;
    _cookieOptions = _options;
  }

  const cookieStr = serialize(key, stringify(data), { path: '/', ..._cookieOptions });
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
};

const deleteCookie = async (key: string, options?: OptionsType): Promise<void> => {
  ensureServerSide();
  return setCookie(key, '', { ...options, maxAge: -1 });
};

const hasCookie = async (key: string, options?: OptionsType): Promise<boolean> => {
  ensureServerSide();
  if (!key) return false;
  const cookie = await getCookies(options);
  return cookie.hasOwnProperty(key);
};

export * from '../common/types';
export { getCookies, getCookie, setCookie, deleteCookie, hasCookie };
