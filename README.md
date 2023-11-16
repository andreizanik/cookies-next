# cookies-next

[![npm version](https://badge.fury.io/js/cookies-next.svg)](https://badge.fury.io/js/cookies-next)
![GitHub code size in bytes](https://img.shields.io/bundlephobia/min/cookies-next?style=plastic)

Getting, setting and removing cookies with NEXT.JS

- can be used on the client side, anywhere
- can be used for server side rendering in getServerSideProps
- can be used in API handlers
- can be used in Next.js 13+

## Installation

```
npm install --save cookies-next
```

If you are using next.js version greater than `12.2.0` you need to use cookies-next version `2.1.0` or later

## Usage

Create a cookie:

```js
import { setCookie } from 'cookies-next';

setCookie('key', 'value', options);
```

Read a cookie:

```js
import { getCookie } from 'cookies-next';

getCookie('key', options); // => 'value'
getCookie('nothing', options); // => undefined
```

Read all cookies:

```js
import { getCookies } from 'cookies-next';

getCookies(options); // => { 'name1': 'value1', name2: 'value2' }
```

Check if a cookie exists:

```js
import { hasCookie } from 'cookies-next';

hasCookie('name', options); // => true
hasCookie('nothing', options); // => false
```

Delete a cookie:

```js
import { deleteCookie } from 'cookies-next';

deleteCookie(name, options);
```

_IMPORTANT! When deleting a cookie and you're not relying on the default attributes,
you must pass the exact same path and domain attributes that were used to set the cookie:_

```js
import { deleteCookie } from 'cookies-next';

deleteCookie(name, { path: '/path', domain: '.yourdomain.com' });
```

### Performance

The [time complexity](https://en.wikipedia.org/wiki/Time_complexity) of all operations is linear with the number of cookies.
For example, under the hood, `getCookie` calls `getCookies`. When working reading multiple cookies,
it is fastest to use `getCookies` and inspect the returned object.

## Client and Server

If you pass ctx (Next.js context) in function, then this function will be done on both client and server

If the function should be done only on client or can't get ctx, pass null or {}
as the first argument to the function and when server side rendering, this function return undefined;

In Next.js 13+, you can [read(only)](https://nextjs.org/docs/app/api-reference/functions/cookies) cookies in `Server Components` and read/update them in `Server Actions`. This can be achieved by using the `cookies` function as an option, which is imported from `next/headers`, instead of using `req` and `res`.

#### Client -  App Router Example

```ts
'use client'
import { getCookies, setCookie, deleteCookie, getCookie } from 'cookies-next';

getCookies();
getCookie('key');
setCookie('key', 'value');
deleteCookie('key');
```
#### Client - Pages Router Example

```js
import { getCookies, setCookie, deleteCookie, getCookie } from 'cookies-next';

// we can use it anywhere
getCookies();
getCookie('key');
setCookie('key', 'value');
deleteCookie('key');
```

#### SSR - App Router Example

`/app/page.tsx`

```tsx
import { setCookie, getCookie, getCookies, deleteCookie, hasCookie } from 'cookies-next';
import { cookies } from 'next/headers';

const Home = async () => {
  // It's not possible to update the cookie in RSC
  ❌ setCookie("test", "value", { cookies }); 👉🏻// Won't work.
  ❌ deleteCookie('test1', { cookies }); 👉🏻// Won't work.
  
  ✔️ getCookie('test1', { cookies });
  ✔️ getCookies({ cookies });
  ✔️ hasCookie('test1', { cookies });

  return (
    <main>
      <h1>Hello cookies next</h1>
    </main>
  );
};

export default Home;

```
#### SSR - Pages Router Example

`/page/index.js`

```jsx
import React from 'react';
import { getCookies, getCookie, setCookie, deleteCookie } from 'cookies-next';

const Home = () => {
  return <div>page content</div>;
};

export const getServerSideProps = ({ req, res }) => {
  setCookie('test', 'value', { req, res, maxAge: 60 * 6 * 24 });
  getCookie('test', { req, res });
  getCookies({ req, res });
  deleteCookie('test', { req, res });

  return { props: {} };
};

export default Home;
```
#### SSR - Server Actions Example
```ts
'use server';

import { cookies } from 'next/headers';
import { setCookie, deleteCookie, hasCookie, getCookie, getCookies } from 'cookies-next';

export async function testAction() {
  setCookie('test', 'value', { cookies });
  getCookie('test', { cookies });
  getCookies({ cookies });
  hasCookie('test', { cookies });
  deleteCookie('test', { cookies });
}



```

#### API - Pages Router Example

`/page/api/example.js`

```js
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCookies, getCookie, setCookie, deleteCookie } from 'cookies-next';

export default async function handler(req, res) {
  setCookie('server-key', 'value', { req, res, maxAge: 60 * 60 * 24 });
  getCookie('key', { req, res });
  getCookies({ req, res });
  deleteCookie('key', { req, res });

  return res.status(200).json({ message: 'ok' });
}
```
#### API - App Router Example

`/app/api/hello/route.ts`

```ts
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { deleteCookie, getCookie, setCookie, hasCookie, getCookies } from 'cookies-next';

export async function GET(req: NextRequest) {
  const res = new NextResponse();
  setCookie('test', 'value', { res, req });
  getCookie('test', { res, req });
  getCookies({ res, req });
  deleteCookie('test', { res, req });
  hasCookie('test', { req, res });

  // provide cookies fn
  setCookie('test1', 'value', { cookies });
  getCookie('test1', { cookies });
  getCookies({ cookies });
  deleteCookie('test1', { cookies });
  hasCookie('test1', { cookies });

  return res;
}

```
#### Middleware 

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCookie, setCookie, deleteCookie, hasCookie, getCookies } from 'cookies-next';
import { cookies } from 'next/headers';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  setCookie('test', 'value', { res, req });
  hasCookie('test', { req, res });
  deleteCookie('test', { res, req });
  getCookie('test', { res, req });
  getCookies({ res, req });

  ❌ setCookie('test', 'value', { cookies }); 👉🏻// Won't work.
  // It's not possible to use cookies function from next/headers in middleware.
  return res;
}

```

## API

## setCookie(key, value, options);

```js
setCookie('key', 'value', options);

setCookie('key', 'value'); // - client side
setCookie('key', 'value', { req, res }); // - server side
setCookie({ cookies }); // - server side(route handlers, server actions)
```

## getCookies(options);

```js
getCookies(); // - client side
getCookies({ req, res }); // - server side
getCookies({ cookies }); // - server side(route handlers, server actions, server components, middleware)
```

## getCookie(key, options);

```js
getCookie('key'); // - client side
getCookie('key', { req, res }); // - server side
getCookie('key', { cookies }); // - server side(route handlers, server actions, server components, middleware)
```

## hasCookie(key, options);

```js
hasCookie('key'); // - client side
hasCookie('key', { req, res }); // - server side
hasCookie('key', { cookies }); // server side(route handlers, server actions, server components, middleware)
```

### deleteCookie(key, options);

```js
deleteCookie('key'); // - client side
deleteCookie('key', { req, res }); // - server side
deleteCookie('key', { cookies }); // - server side(route handlers, server actions)
```

_IMPORTANT! When deleting a cookie and you're not relying on the default attributes,
you must pass the exact same path and domain attributes that were used to set the cookie:_

```js
deleteCookie(ctx, name, { path: '/path', domain: '.yourdomain.com' });  - client side
deleteCookie(ctx, name, { req, res, path: '/path', domain: '.yourdomain.com' }); - server side
```

#### key

cookie's name

#### value

cookie's value

#### options:

##### req

required for server side cookies (route handlers, middleware, API and getServerSideProps)

##### res

required for server side cookies (route handlers, middleware, API and getServerSideProps)

##### cookies

required for server actions and can be used in route handlers

##### domain

Specifies the value for the [`Domain` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.3). By default, no
domain is set, and most clients will consider the cookie to apply to only the current domain.

##### encode

Specifies a function that will be used to encode a cookie's value. Since value of a cookie
has a limited character set (and must be a simple string), this function can be used to encode
a value into a string suited for a cookie's value.

The default function is the global `encodeURIComponent`, which will encode a JavaScript string
into UTF-8 byte sequences and then URL-encode any that fall outside of the cookie range.

##### expires

A `Date` object indicating the cookie's expiration date

By default, no expiration is set, and most clients will consider this a "non-persistent cookie" and
will delete it on a condition like exiting a web browser application.

**note** the [cookie storage model specification](https://tools.ietf.org/html/rfc6265#section-5.3) states that if both `expires` and
`maxAge` are set, then `maxAge` takes precedence, but it is possible not all clients by obey this,
so if both are set, they should point to the same date and time.

##### httpOnly

Specifies the `boolean` value for the [`HttpOnly` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.6). When truthy,
the `HttpOnly` attribute is set, otherwise it is not. By default, the `HttpOnly` attribute is not set.

**note** be careful when setting this to `true`, as compliant clients will not allow client-side
JavaScript to see the cookie in `document.cookie`.

##### maxAge

Specifies the `number` (in seconds) to be the value for the [`Max-Age` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.2).
The given number will be converted to an integer by rounding down. By default, no maximum age is set.

**note** the [cookie storage model specification](https://tools.ietf.org/html/rfc6265#section-5.3) states that if both `expires` and
`maxAge` are set, then `maxAge` takes precedence, but it is possible not all clients by obey this,
so if both are set, they should point to the same date and time.

##### path

Specifies the value for the [`Path` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.4). By default, the path
is considered the ["default path"](https://tools.ietf.org/html/rfc6265#section-5.1.4).

##### sameSite

Specifies the `boolean` or `string` to be the value for the [`SameSite` `Set-Cookie` attribute](https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-03#section-4.1.2.7).

- `true` will set the `SameSite` attribute to `Strict` for strict same site enforcement.
- `false` will not set the `SameSite` attribute.
- `'lax'` will set the `SameSite` attribute to `Lax` for lax same site enforcement.
- `'none'` will set the `SameSite` attribute to `None` for an explicit cross-site cookie.
- `'strict'` will set the `SameSite` attribute to `Strict` for strict same site enforcement.

More information about the different enforcement levels can be found in
[the specification](https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-03#section-4.1.2.7).

**note** This is an attribute that has not yet been fully standardized, and may change in the future.
This also means many clients may ignore this attribute until they understand it.

##### secure

Specifies the `boolean` value for the [`Secure` `Set-Cookie` attribute](https://tools.ietf.org/html/rfc6265#section-5.2.5). When truthy,
the `Secure` attribute is set, otherwise it is not. By default, the `Secure` attribute is not set.

**note** be careful when setting this to `true`, as compliant clients will not send the cookie back to
the server in the future if the browser does not have an HTTPS connection.

## License

MIT
