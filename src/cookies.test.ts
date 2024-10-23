import { getCookies, getCookie, setCookie, deleteCookie, hasCookie, validateContextCookies } from './index';
import type { OptionsType, AppRouterCookies } from './types';
import { NextRequest, NextResponse } from 'next/server';

// Mock implementations
const mockAppRouterCookies: AppRouterCookies = {
  getAll: jest.fn().mockReturnValue([
    { name: 'test', value: 'value' },
    { name: 'jsonCookie', value: JSON.stringify({ foo: 'bar' }) }
  ]),
  set: jest.fn(),
  get: jest.fn(),
  has: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  [Symbol.iterator]: jest.fn(),
  size: 2,
};

const mockOptions = {
  req: {
    cookies: mockAppRouterCookies,
  } as unknown as NextRequest,
  res: {
    cookies: mockAppRouterCookies,
  } as unknown as NextResponse,
  cookies: jest.fn().mockResolvedValue(mockAppRouterCookies),
} satisfies OptionsType;

describe('Cookie Functions', () => {
  afterEach(() => {
    jest.clearAllMocks();

    // Reset document.cookie before each test
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  describe('validateContextCookies', () => {
    test('should return true for valid AppRouterCookies', async () => {
      const result = await validateContextCookies(mockOptions);
      expect(result).toBe(true);
    });

    test('should return false for invalid context', async () => {
      const result = await validateContextCookies({});
      expect(result).toBe(false);
    });
  });

  describe('getCookies', () => {
    test('should return transformed cookies for valid context', async () => {
      const cookies = await getCookies(mockOptions);
      expect(cookies).toEqual({ test: 'value', jsonCookie: JSON.stringify({ foo: 'bar' }) });
    });

    test('should return empty object for client-side without cookies', async () => {
      const cookies = await getCookies();
      expect(cookies).toEqual({});
    });

    test('should parse client-side cookies', async () => {
      document.cookie = 'key1=value1; key2=value2';
      const cookies = await getCookies();
      expect(cookies).toEqual({ key1: 'value1', key2: 'value2' });
    });
  });

  describe('getCookie', () => {
    test('should return specific cookie value for valid context', async () => {
      const value = await getCookie('test', mockOptions);
      expect(value).toBe('value');
    });

    test('should return undefined for non-existent cookie', async () => {
      const value = await getCookie('nonexistent', mockOptions);
      expect(value).toBeUndefined();
    });

    test('should parse JSON cookie value', async () => {
      const value = await getCookie('jsonCookie', mockOptions);
      expect(value).toBe('{"foo":"bar"}');
    });
  });

  describe('setCookie', () => {
    test('should set a cookie in AppRouterCookies', async () => {
      await setCookie('newKey', 'newValue', mockOptions);
      expect(mockAppRouterCookies.set).toHaveBeenCalledWith({
        name: 'newKey',
        value: 'newValue',
      });
    });

    test('should set a cookie on client-side', async () => {
      await setCookie('clientKey', 'clientValue');
      expect(document.cookie).toContain('clientKey=clientValue');
    });

    test('should stringify non-string values', async () => {
      await setCookie('objectKey', { foo: 'bar' }, mockOptions);
      expect(mockAppRouterCookies.set).toHaveBeenCalledWith({
        name: 'objectKey',
        value: '{"foo":"bar"}',
      });
    });
  });

  describe('deleteCookie', () => {
    test('should delete a cookie in AppRouterCookies', async () => {
      await deleteCookie('test', mockOptions);
      expect(mockAppRouterCookies.set).toHaveBeenCalledWith({
        name: 'test',
        value: '',
        maxAge: -1,
      });
    });

    test('should delete a cookie on client-side', async () => {
      document.cookie = 'toDelete=value; path=/';
      await deleteCookie('toDelete');
      expect(document.cookie).not.toContain('toDelete=value');
    });
  });

  describe('hasCookie', () => {
    test('should return true for existing cookie in AppRouterCookies', async () => {
      const result = await hasCookie('test', mockOptions);
      expect(result).toBe(true);
    });

    test('should return false for non-existent cookie', async () => {
      const result = await hasCookie('nonexistent', mockOptions);
      expect(result).toBe(false);
    });

    test('should check for cookie existence on client-side', async () => {
      document.cookie = 'existingCookie=value; path=/';
      const result = await hasCookie('existingCookie');
      expect(result).toBe(true);
    });
  });
});
