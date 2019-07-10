const cookie = require('cookie');

const isClientSide = () => {
	return typeof window !== 'undefined';
};

const processValue = (value) => {
	if (value === 'true') return true;
	if (value === 'false') return false;
	if (value === 'undefined') return undefined;
	if (value === 'null') return null;

	return value;
};

const stringify = (value = '') => {
	try {
		const result = JSON.stringify(value);
		return (/^[\{\[]/.test(result)) ? result : value;
	} catch (e) {
		return value;
	}
};

const decode = (str) => {
	if (!str) return str;

	return str.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
};

const getCookies = (ctx = null, key) => {
	if (!isClientSide()) {
		// if cookie-parser is used in project get cookies from ctx.req.cookies
		// if cookie-parser isn't used in project get cookies from ctx.req.headers.cookie
		if (ctx && ctx.req && ctx.req.cookies) {
			return key ? processValue(ctx.req.cookies[key]) : ctx.req.cookies;
		}

		if (ctx && ctx.req && ctx.req.headers && ctx.req.headers.cookie) {
			const _cookies = cookie.parse(ctx.req.headers.cookie);
			return key ? processValue(_cookies[key]) : _cookies;
		}

		return undefined;
	}

	const _cookies = {};
	const documentCookies = document.cookie ? document.cookie.split('; ') : [];

	for (let i = 0; i < documentCookies.length; i++) {
		const cookieParts = documentCookies[i].split('=');

		const _cookie = cookieParts.slice(1).join('=');
		const name = cookieParts[0];

		_cookies[name] = _cookie;
	}

	return key ? processValue(decode(_cookies[key])) : _cookies;
};

const setCookies = (ctx = null, key, data, options = {}) => {
	if (typeof options.expires === 'number') {
		options.expires = new Date(new Date() * 1 + options.expires * 864e+5);
	}

	const cookieStr = cookie.serialize(key, stringify(data), { path: '/', ...options });

	if (!isClientSide()) {
		if (ctx && ctx.res) {
			const currentCookies = ctx.res.getHeader('Set-Cookie');

			if (!currentCookies) {
				return ctx.res.setHeader(
					'Set-Cookie',
					[cookieStr]
				);
			}

			return ctx.res.setHeader(
				'Set-Cookie',
				currentCookies.concat(cookieStr),
			);
		}
		return undefined;
	}

	document.cookie = cookieStr;
};

// if cookie set with path then need remove cookie with this path
const removeCookies = (ctx = null, key, options = {}) => {
	return setCookies(ctx, key, '', { ...options, expires: -1 });
};

module.exports = { getCookies, setCookies, removeCookies };