# cookies-next

[![npm version](https://badge.fury.io/js/cookies-next.svg)](https://badge.fury.io/js/cookies-next)
![GitHub code size in bytes](https://img.shields.io/bundlephobia/min/cookies-next?style=plastic)

Getting, setting and removing cookies with NEXT.JS

- can be used on the client side, anywhere
- can be used for server side rendering in getServerSideProps
- can be used in API handlers

## Installation
```
npm install --save cookies-next
```

## Usage
Create a cookie

```
import { setCookies } from 'cookies-next';

setCookies('key', 'value', options);
```

Read cookie:

```
import { getCookie } from 'cookies-next';

getCookie('key', options); // => 'value'
getCookie('nothing', options); // => undefined
```

Read all cookies:
```
import { getCookies } from 'cookies-next';

getCookies(options); // => { 'name1': 'value1', name2: 'value2' }
```

Check if Cookies Exists:
```
import { checkCookies } from 'cookies-next';

checkCookies('name', options); // => true
checkCookies('nothing', options); // => false
```

Delete cookie:
```
import { removeCookies } from 'cookies-next';

removeCookies(name, options);
```

*IMPORTANT! When deleting a cookie and you're not relying on the default attributes,
you must pass the exact same path and domain attributes that were used to set the cookie:*

```
import { removeCookies } from 'cookies-next';

removeCookies(name, { path: '/path', domain: '.yourdomain.com' });
```

## Client and Server
If you pass ctx (Next.js context) in function, then this function will be done on both client and server

If the function should be done only on client or can't get ctx, pass null or {} 
as the first argument to the function and when server side rendering, this function return undefined;

#### Client Example

```
import { getCookies, setCookies, removeCookies } from 'cookies-next';
// we can use it anywhere
getCookies();
getCookie('key');
setCookies('key', 'value');
removeCookies('key'); 
```

#### SSR Example

`/page/index.js`
```
import React from 'react'
import { getCookies, getCookie, setCookies, removeCookies } from 'cookies-next';

const Home = () => {
  return (
    <div>page content</div>
  )
}

export const getServerSideProps = ({ req, res }) => {
    setCookies('test', 'value', { req, res, maxAge: 60 * 6 * 24 });
    getCookie('test', { req, res});
    getCookies({ req, res});
    removeCookies('test', { req, res});
  return { props: {}};
}

export default Home
```


#### API Example
`/page/api/example.js`
```
import type { NextApiRequest, NextApiResponse } from 'next'
import  { getCookies, getCookie, setCookies, removeCookies } from 'cookies-next'

export default async function handler(req, res) {
  setCookies('server-key', 'value', { req, res, maxAge: 60 * 60 * 24 });
  getCookie('key', { req, res });
  getCookies({ req, res });
  removeCookies('key', { req, res });
     
  return res.status(200).json({ message: "ok" })
}

```

## API
## setCookies(key, value, options);
````
setCookies('key', 'value', options);

setCookies('key', 'value'); - client side
setCookies('key', 'value', { req, res }); - server side
````

## getCookies(options);
```
getCookies(); - client side
getCookies({ req, res }); - server side
```

## getCookie(key, options);
```
getCookie('key'); - client side
getCookie('key', { req, res }); - server side
```

## checkCookies(key, options);
```
checkCookies('key'); - client side
checkCookies('key', { req, res }); - server side
```

### removeCookies(key, options);
```
removeCookies('key'); - client side
removeCookies('key', { req, res }); - server side
```

*IMPORTANT! When deleting a cookie and you're not relying on the default attributes,
you must pass the exact same path and domain attributes that were used to set the cookie:*
```
removeCookies(ctx, name, { path: '/path', domain: '.yourdomain.com' });  - client side
removeCookies(ctx, name, { req, res, path: '/path', domain: '.yourdomain.com' }); - server side
```


#### key
cookie's name

#### value
cookie's value

#### options:

##### req
required for server side cookies (API and getServerSideProps)

##### res
required for server side cookies (API and getServerSideProps)

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

`Date` object or `number` days count

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
