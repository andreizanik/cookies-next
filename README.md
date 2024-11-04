# cookies-next

[![npm version](https://badge.fury.io/js/cookies-next.svg)](https://badge.fury.io/js/cookies-next)
![GitHub code size in bytes](https://img.shields.io/bundlephobia/min/cookies-next?style=plastic)

A versatile cookie management library for Next.js applications, supporting both client-side and server-side operations.

## Features

- Works on client-side, server-side rendering, and API routes
- Supports Next.js 13+ App Router and Server Components
- TypeScript compatible
- Lightweight and easy to use

## Installation

For Next.js versions 15 and above, use the latest version of cookies-next:

```bash
npm install --save cookies-next@latest
```

For Next.js versions 12.2.0 to 14.x, use cookies-next version 4.3.0:

```bash
npm install --save cookies-next@4.3.0
```

## Usage

### Importing

For Next.js 15+:

```javascript
// For client-side usage
import { getCookie, getCookies, setCookie, deleteCookie, hasCookie } from 'cookies-next/client';

// For server-side usage
import { getCookie, getCookies, setCookie, deleteCookie, hasCookie } from 'cookies-next/server';
```

Also, you can leave the decision of which import to use to the the library itself, by importing from the root:

```javascript
import { getCookie, getCookies, setCookie, deleteCookie, hasCookie } from 'cookies-next';
```

For Next.js 12.2.0 to 13.x:

```javascript
import { getCookie, getCookies, setCookie, deleteCookie, hasCookie } from 'cookies-next';
```

### Basic Operations

#### Set a cookie

```javascript
setCookie('key', 'value', options);
```

#### Get a cookie

```javascript
const value = getCookie('key', options);
```

#### Get all cookies

```javascript
const cookies = getCookies(options);
```

#### Check if a cookie exists

```javascript
const exists = hasCookie('key', options);
```

#### Delete a cookie

```javascript
deleteCookie('key', options);
```

### Client-side Usage

```javascript
'use client';

import { getCookies, setCookie, deleteCookie, getCookie } from 'cookies-next/client';

function ClientComponent() {
  /* 
 ❗❗❗ In a client component, it's highly recommended to use cookies-next functions within useEffect or in event handlers; otherwise, you might encounter hydration mismatch errors. - 
 https://react.dev/link/hydration-mismatch.   
 */

  useEffect(() => {
    getCookies();
    getCookie('key');
    setCookie('key', 'value');
    deleteCookie('key');
    hasCookie('key');
  }, []);

  const handleClick = () => {
    getCookies();
    getCookie('key');
    setCookie('key', 'value');
    deleteCookie('key');
    hasCookie('key');
  };

  /* .... */
}
// Use anywhere in client-side code
```

### Server-side Usage (App Router)

In Server Components:

```javascript
import { getCookie, getCookies, hasCookie } from 'cookies-next/server';
import { cookies } from 'next/headers';

export const ServerComponent = async () => {
  // Read-only operations in Server Components
  const value = await getCookie('test', { cookies });
  const allCookies = await getCookies({ cookies });
  const exists = await hasCookie('test', { cookies });

  // Note: It's not possible to update cookies in Server Components
  ❌ setCookie("test", "value", { cookies }); // Won't work
  ❌ deleteCookie('test', { cookies }); // Won't work

  return <div>...</div>;
};
```

In Server Actions:

```javascript
'use server';

import { cookies } from 'next/headers';
import { setCookie, deleteCookie, getCookie, getCookies, hasCookie } from 'cookies-next/server';

export async function serverAction() {
  await setCookie('test', 'value', { cookies });
  await deleteCookie('test', { cookies });
  await getCookie('test', { cookies });
  await getCookies({ cookies });
  await hasCookie('test', { cookies });
}
```

### API Routes (App Router)

```javascript
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { deleteCookie, getCookie, setCookie, hasCookie, getCookies } from 'cookies-next/server';

export async function GET(req: NextRequest) {
  const res = new NextResponse();
  await setCookie('test', 'value', { res, req });
  await getCookie('test', { res, req });
  await getCookies({ res, req });
  await deleteCookie('test', { res, req });
  await hasCookie('test', { req, res });

  // Using cookies function
  await setCookie('test1', 'value', { cookies });
  await getCookie('test1', { cookies });
  await getCookies({ cookies });
  await deleteCookie('test1', { cookies });
  await hasCookie('test1', { cookies });

  return res;
}
```

### Middleware

```javascript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCookie, setCookie, deleteCookie, hasCookie, getCookies } from 'cookies-next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  await setCookie('test', 'value', { res, req });
  await hasCookie('test', { req, res });
  await deleteCookie('test', { res, req });
  await getCookie('test', { res, req });
  await getCookies({ res, req });

  // Note: cookies function from next/headers cannot be used in middleware
  ❌ setCookie('test', 'value', { cookies }); // Won't work

  return res;
}
```

## API

### setCookie(key, value, options)

Sets a cookie.

```javascript
setCookie('key', 'value', options);
```

### getCookie(key, options)

Retrieves a specific cookie.

```javascript
const value = getCookie('key', options);
```

### getCookies(options)

Retrieves all cookies.

```javascript
const cookies = getCookies(options);
```

### hasCookie(key, options)

Checks if a cookie exists.

```javascript
const exists = hasCookie('key', options);
```

### deleteCookie(key, options)

Deletes a cookie.

```javascript
deleteCookie('key', options);
```

## Options

- `req`: Required for server-side operations (except when using `cookies` function)
- `res`: Required for server-side operations (except when using `cookies` function)
- `cookies`: Function from `next/headers`, used in App Router for server-side operations
- `domain`: Specifies the cookie's domain
- `path`: Specifies the cookie's path
- `maxAge`: Specifies the cookie's maximum age in seconds
- `httpOnly`: Sets the HttpOnly flag
- `secure`: Sets the Secure flag
- `sameSite`: Sets the SameSite attribute ('strict', 'lax', or 'none')

For more detailed options, refer to the [cookie specification](https://tools.ietf.org/html/rfc6265).

## License

MIT
