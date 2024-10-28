import { serialize, parse, SerializeOptions } from 'cookie';
import type {
  OptionsType,
  TmpCookiesObj,
  CookieValueTypes,
  NextCookies,
  HttpContext,
  NextContext,
} from '../common/types';
import { stringify, decode, isClientSide } from '../common/utils';

const ensureServerSide = (context?: OptionsType) => {
  if (isClientSide(context)) {
    throw new Error(
      'You are trying to access cookies on the client side. Please, use the client-side import with `cookies-next/client` instead.',
    );
  }
};

const isCookiesFromNext = (cookieStore: TmpCookiesObj | NextCookies | undefined): cookieStore is NextCookies => {
  if (!cookieStore) return false;
  return (
    'getAll' in cookieStore &&
    'set' in cookieStore &&
    typeof cookieStore.getAll === 'function' &&
    typeof cookieStore.set === 'function'
  );
};

const isContextFromNext = (context?: OptionsType): context is NextContext => {
  return (
    (!!context?.req && 'cookies' in context.req && isCookiesFromNext(context.req.cookies)) ||
    (!!context?.res && 'cookies' in context.res && isCookiesFromNext(context.res.cookies)) ||
    (!!context && 'cookies' in context && typeof context.cookies === 'function')
  );
};

const transformAppRouterCookies = (cookies: NextCookies): TmpCookiesObj => {
  let _cookies: Partial<TmpCookiesObj> = {};
  cookies.getAll().forEach(({ name, value }) => {
    _cookies[name] = value;
  });
  return _cookies;
};

const getCookies = async (options?: OptionsType): Promise<TmpCookiesObj> => {
  ensureServerSide(options);
  // Use Next.js context if available
  if (isContextFromNext(options)) {
    if (options.req) {
      return transformAppRouterCookies(options.req.cookies);
    }
    if (options.res) {
      return transformAppRouterCookies(options.res.cookies);
    }
    if (options.cookies) {
      return transformAppRouterCookies(await options.cookies());
    }
  }

  // Use context from the default HTTP request context
  let httpRequest;
  if (options?.req) {
    httpRequest = options.req as HttpContext['req'];
  }

  if (httpRequest?.cookies) {
    return httpRequest.cookies;
  }

  if (httpRequest?.headers.cookie) {
    return parse(httpRequest.headers.cookie);
  }

  return {};
};

const getCookie = async (key: string, options?: OptionsType): Promise<CookieValueTypes> => {
  ensureServerSide(options);
  const cookies = await getCookies(options);
  const value = cookies[key];
  if (value === undefined) return undefined;
  return decode(value);
};

const setCookie = async (key: string, data: any, options?: OptionsType): Promise<void> => {
  ensureServerSide(options);

  if (isContextFromNext(options)) {
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

  let cookieOptions: SerializeOptions = {};
  let req: HttpContext['req'];
  let res: HttpContext['res'];

  if (options) {
    const { req: _req, res: _res, ...rest } = options as HttpContext;
    req = _req;
    res = _res;
    cookieOptions = rest;
  }

  const cookieStore = serialize(key, stringify(data), { path: '/', ...cookieOptions });

  if (res && req) {
    let currentCookies = res.getHeader('Set-Cookie');
    if (!Array.isArray(currentCookies)) {
      currentCookies = !currentCookies ? [] : [String(currentCookies)];
    }
    res.setHeader('Set-Cookie', currentCookies.concat(cookieStore));

    if (req && req.cookies) {
      const cookies = req.cookies;
      data === '' ? delete cookies[key] : (cookies[key] = stringify(data));
    }

    if (req && req.headers && req.headers.cookie) {
      const cookies = parse(req.headers.cookie);
      data === '' ? delete cookies[key] : (cookies[key] = stringify(data));

      req.headers.cookie = Object.entries(cookies).reduce((accum, item) => {
        return accum.concat(`${item[0]}=${item[1]};`);
      }, '');
    }
  }
};

const deleteCookie = async (key: string, options?: OptionsType): Promise<void> => {
  ensureServerSide(options);
  return setCookie(key, '', { ...options, maxAge: -1 });
};

const hasCookie = async (key: string, options?: OptionsType): Promise<boolean> => {
  ensureServerSide(options);
  if (!key) return false;
  const cookie = await getCookies(options);
  return cookie.hasOwnProperty(key);
};

export * from '../common/types';
export { getCookies, getCookie, setCookie, deleteCookie, hasCookie };
