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

```bash
npm install --save cookies-next
```

For Next.js versions 15 and above, use the latest version of cookies-next.

For Next.js versions 12.2.0 to 13.x, use cookies-next version 4.3.0:

```bash
npm install --save cookies-next@5.0.0
```

## Usage

### Importing

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
import { getCookies, setCookie, deleteCookie, getCookie } from 'cookies-next';

// Use anywhere in client-side code
getCookies();
getCookie('key');
setCookie('key', 'value');
deleteCookie('key');
```

### Server-side Usage (Pages Router)

In `getServerSideProps`:

```javascript
import { getCookies, getCookie, setCookie, deleteCookie } from 'cookies-next';

export const getServerSideProps = ({ req, res }) => {
  setCookie('test', 'value', { req, res, maxAge: 60 * 60 * 24 });
  getCookie('test', { req, res });
  getCookies({ req, res });
  deleteCookie('test', { req, res });

  return { props: {} };
};
```

### Server-side Usage (App Router)

In Server Components:

```javascript
import { getCookie, getCookies, hasCookie } from 'cookies-next';
import { cookies } from 'next/headers';

const ServerComponent = async () => {
  // Read-only operations in Server Components
  const value = getCookie('test', { cookies });
  const allCookies = getCookies({ cookies });
  const exists = hasCookie('test', { cookies });

  // Note: setCookie and deleteCookie cannot be used in Server Components
  return <div>...</div>;
};
```

In Server Actions:

```javascript
'use server';

import { cookies } from 'next/headers';
import { setCookie, deleteCookie, getCookie, getCookies, hasCookie } from 'cookies-next';

export async function serverAction() {
  setCookie('test', 'value', { cookies });
  deleteCookie('test', { cookies });
  getCookie('test', { cookies });
  getCookies({ cookies });
  hasCookie('test', { cookies });
}
```

### API Routes (Pages Router)

```javascript
import { getCookies, getCookie, setCookie, deleteCookie } from 'cookies-next';

export default async function handler(req, res) {
  setCookie('key', 'value', { req, res, maxAge: 60 * 60 * 24 });
  getCookie('key', { req, res });
  getCookies({ req, res });
  deleteCookie('key', { req, res });

  return res.status(200).json({ message: 'ok' });
}
```

### API Routes (App Router)

```javascript
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { deleteCookie, getCookie, setCookie, hasCookie, getCookies } from 'cookies-next';

export async function GET(req: NextRequest) {
  const res = new NextResponse();
  setCookie('test', 'value', { res, req });
  getCookie('test', { res, req });
  getCookies({ res, req });
  deleteCookie('test', { res, req });
  hasCookie('test', { req, res });

  // Using cookies function
  setCookie('test1', 'value', { cookies });
  getCookie('test1', { cookies });
  getCookies({ cookies });
  deleteCookie('test1', { cookies });
  hasCookie('test1', { cookies });

  return res;
}
```

### Middleware

```javascript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCookie, setCookie, deleteCookie, hasCookie, getCookies } from 'cookies-next';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  setCookie('test', 'value', { res, req });
  hasCookie('test', { req, res });
  deleteCookie('test', { res, req });
  getCookie('test', { res, req });
  getCookies({ res, req });

  // Note: cookies function from next/headers cannot be used in middleware
  return res;
}
```

## API

### setCookie(key, value, options)

Sets a cookie.

### getCookie(key, options)

Retrieves a specific cookie.

### getCookies(options)

Retrieves all cookies.

### hasCookie(key, options)

Checks if a cookie exists.

### deleteCookie(key, options)

Deletes a cookie.

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
