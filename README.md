# cookies-next

[![npm version](https://badge.fury.io/js/cookies-next.svg)](https://badge.fury.io/js/cookies-next)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/andreizanik/cookies-next.svg)

Getting, setting and removing cookies on both client and server with next.js

- SSR support, for setting, getting and remove cookies
- working on both client and server

## Installation
```
npm install --save cookies-next
```

## Usage
Create a cookie

```
import { setCookies } from 'cookies-next';

setCookies(ctx, 'name', 'value');
```

Create a cookie that expires 7 days from now:

```
import { setCookies } from 'cookies-next';

setCookies(ctx, 'name', 'value', { expires: 7 });
```

Check if Cookies Exists:

```
import { checkCookies } from 'cookies-next';

checkCookies(ctx, 'name'); // => true
checkCookies(ctx, 'nothing'); // => false
checkCookies(ctx); // => false

/* 
ctx
Next.js context, null or {}

If null or {} then at SSR will always return undefined

name
cookie's name
*/

```


Read cookie:

```
import { getCookies } from 'cookies-next';

getCookies(ctx, 'name'); // => 'value'
getCookies(ctx, 'nothing'); // => undefined
```

Read all cookies:

```
import { getCookies } from 'cookies-next';

getCookies(ctx); // => {'name1': 'value1', name2: 'value2'}
```

Delete cookie:

```
import { removeCookies } from 'cookies-next';

removeCookies(ctx, name);
```

*IMPORTANT! When deleting a cookie and you're not relying on the default attributes,
you must pass the exact same path and domain attributes that were used to set the cookie:*

```
import { removeCookies } from 'cookies-next';

removeCookies(ctx, name, { path: '/path', domain: '.yourdomain.com' });
```

## Client and Server
If you pass ctx (Next.js context) in function, then this function will be done on both client and server

If the function should be done only on client or can't get ctx, pass null or {} 
as the first argument to the function and when server side rendering, this function return undefined;

#### Client Example

```
import { getCookies, setCookies, removeCookies } from 'cookies-next';

getCookies(ctx, 'name'); // => 'value'
getCookies(null, 'name'); // => 'value'

setCookies(ctx, 'name'); // cookies are set
setCookies(null, 'name'); // cookies are set

removeCookies(ctx, 'name'); // cookies are deleted
removeCookies(null, 'name'); // cookies are deleted
```

#### SSR Example

```
import { getCookies, setCookies, removeCookies } from 'cookies-next';

getCookies(ctx, 'name'); // => 'value'
getCookies(null, 'name'); // => undefined

setCookies(ctx, 'name'); // cookies are set
setCookies(null, 'name'); // cookies aren't set

removeCookies(ctx, 'name'); // cookies are deleted
removeCookies(null, 'name'); // cookies aren't deleted
```

## API
### setCookies(ctx, name, value, options);
`setCookies(ctx, 'name', 'value', options);`

#### ctx
Next.js context, null or {}

If null or {} then at SSR will not set cookies

#### name
cookie's name

#### value
cookie's value

#### options
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

### checkCookies(ctx, name);
```
checkCookies(ctx, 'name'); // => true
checkCookies(ctx, 'nothing'); // => false
checkCookies(ctx); // => false
```

### getCookies(ctx, name);
```
getCookies(ctx, 'name'); // => 'value'
getCookies(ctx, 'nothing'); // => undefined
getCookies(ctx); // => {'name1': 'value1', name2: 'value2'}
```

#### ctx
Next.js context, null or {}

If null or {} then at SSR will always return undefined

#### name
cookie's name

### removeCookies(ctx, name, options);
```
removeCookies(ctx, name, options)
```

#### ctx
Next.js context, null or {}

If null or {} then at SSR will not deleted cookies

#### name
cookie's name

#### options
Look `setCookies()`

*IMPORTANT! When deleting a cookie and you're not relying on the default attributes,
you must pass the exact same path and domain attributes that were used to set the cookie:*

```
removeCookies(ctx, name, { path: '/path', domain: '.yourdomain.com' });
```

## License

MIT
