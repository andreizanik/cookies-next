import { NextRequest, NextResponse } from 'next/server';
import { getCookies, getCookie, setCookie, deleteCookie, hasCookie } from './index';
import { HttpContext } from '../common/types';
import { IncomingMessage, ServerResponse } from 'http';

describe('Server-side cookie functions', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Mock isClientSide to always return false for server-side tests
    jest.spyOn(require('../common/utils'), 'isClientSide').mockReturnValue(false);
  });

  describe('getCookies', () => {
    describe('Next.js', () => {
      it('should return cookies from req.cookies', async () => {
        const mockReq = {
          cookies: {
            set: jest.fn(),
            getAll: jest.fn().mockReturnValue([{ name: 'test', value: 'value' }]),
          },
        } as unknown as NextRequest;

        const cookies = await getCookies({ req: mockReq });
        expect(cookies).toEqual({ test: 'value' });
      });

      it('should return cookies from res.cookies', async () => {
        const mockRes = {
          cookies: {
            set: jest.fn(),
            getAll: jest.fn().mockReturnValue([{ name: 'test', value: 'value' }]),
          },
        } as unknown as NextResponse;

        const cookies = await getCookies({ res: mockRes });
        expect(cookies).toEqual({ test: 'value' });
      });

      it('should return cookies from cookies()', async () => {
        const mockCookies = jest.fn().mockResolvedValue({
          getAll: jest.fn().mockReturnValue([{ name: 'test', value: 'value' }]),
          set: jest.fn(),
        });
        const cookies = await getCookies({ cookies: mockCookies });
        expect(cookies).toEqual({ test: 'value' });
      });
    });

    describe('Http', () => {
      it('should parse cookies from req.headers.cookie', async () => {
        const mockReq = { headers: { cookie: 'test=value' } } as unknown as IncomingMessage;
        const cookies = await getCookies({ req: mockReq });
        expect(cookies).toEqual({ test: 'value' });
      });

      it('should return cookies from req.cookies', async () => {
        const mockReq = { cookies: { test: 'value' } } as unknown as IncomingMessage;
        const cookies = await getCookies({ req: mockReq });
        expect(cookies).toEqual({ test: 'value' });
      });

      it('should return empty object if no cookies are present', async () => {
        const cookies = await getCookies();
        expect(cookies).toEqual({});
      });
    });
  });

  describe('getCookie', () => {
    it('should return a specific cookie value', async () => {
      const mockReq = {
        cookies: {
          set: jest.fn(),
          getAll: jest.fn().mockReturnValue([
            { name: 'test', value: 'value' },
            { name: 'test2', value: 'value2' },
          ]),
        },
      } as unknown as NextRequest;
      const value = await getCookie('test2', { req: mockReq });
      expect(value).toBe('value2');
    });

    it('should return undefined for non-existent cookie', async () => {
      const mockReq = {
        cookies: {
          set: jest.fn(),
          getAll: jest.fn().mockReturnValue([]),
        },
      } as unknown as NextRequest;
      const value = await getCookie('nonexistent', { req: mockReq });
      expect(value).toBeUndefined();
    });
  });

  describe('setCookie', () => {
    describe('Next.js', () => {
      it('should set a cookie on req', async () => {
        const mockReq = {
          cookies: {
            set: jest.fn(),
            getAll: jest.fn().mockReturnValue([]),
          },
        } as unknown as NextRequest;
        await setCookie('test', 'value', { req: mockReq });
        expect(mockReq.cookies.set).toHaveBeenCalledWith({ name: 'test', value: 'value' });
      });

      it('should set a cookie on res', async () => {
        const mockRes = {
          cookies: {
            set: jest.fn(),
            getAll: jest.fn().mockReturnValue([]),
          },
        } as unknown as NextResponse;
        await setCookie('test', 'value', { res: mockRes });
        expect(mockRes.cookies.set).toHaveBeenCalledWith({ name: 'test', value: 'value' });
      });

      it('should set a cookie on cookies()', async () => {
        const mockSet = jest.fn();
        const mockCookies = jest.fn().mockResolvedValue({
          set: mockSet,
          getAll: jest.fn().mockReturnValue([]),
        });
        await setCookie('test', 'value', { cookies: mockCookies });
        expect(mockSet).toHaveBeenCalledWith({ name: 'test', value: 'value' });
      });
    });

    describe('Http', () => {
      it('should set a cookie on headers', async () => {
        const mockReq = { headers: { cookie: 'other=cookie;' } } as unknown as IncomingMessage;
        const mockRes = { setHeader: jest.fn(), getHeader: jest.fn().mockReturnValue([]) } as unknown as ServerResponse;
        await setCookie('test', 'value', { req: mockReq, res: mockRes });

        expect(mockRes.setHeader).toHaveBeenCalledWith(
          'Set-Cookie',
          expect.arrayContaining([expect.stringContaining('test=value;')]),
        );
        expect(mockReq.headers.cookie).toBe('other=cookie;test=value;');
      });

      it('should set a cookie on cookies', async () => {
        const mockReq = { cookies: { other: 'cookie' } } as unknown as HttpContext['req'];
        const mockRes = { setHeader: jest.fn(), getHeader: jest.fn().mockReturnValue([]) } as unknown as ServerResponse;
        await setCookie('test', 'value', { req: mockReq, res: mockRes });
        expect(mockReq?.cookies).toEqual({ other: 'cookie', test: 'value' });
      });
    });
  });

  describe('deleteCookie', () => {
    it('should delete a cookie', async () => {
      const mockReq = { cookies: {} } as unknown as HttpContext['req'];
      const mockRes = { setHeader: jest.fn(), getHeader: jest.fn().mockReturnValue([]) } as unknown as ServerResponse;
      await setCookie('test', 'value', { req: mockReq, res: mockRes });
      expect(mockReq?.cookies).toEqual({ test: 'value' });

      await deleteCookie('test', { req: mockReq, res: mockRes });
      expect(mockReq?.cookies).toEqual({});
    });
  });

  describe('hasCookie', () => {
    it('should return true if cookie exists', async () => {
      const mockReq = { cookies: { existing: 'cookie' } } as unknown as HttpContext['req'];
      const mockRes = { setHeader: jest.fn(), getHeader: jest.fn().mockReturnValue([]) } as unknown as ServerResponse;
      const has = await hasCookie('existing', { req: mockReq, res: mockRes });
      expect(has).toBe(true);
    });

    it('should return false if cookie does not exist', async () => {
      const mockReq = { cookies: {} } as unknown as HttpContext['req'];
      const mockRes = { setHeader: jest.fn(), getHeader: jest.fn().mockReturnValue([]) } as unknown as ServerResponse;
      const has = await hasCookie('non-existing-cookie', { req: mockReq, res: mockRes });
      expect(has).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should throw an error when trying to access cookies on client-side', async () => {
      jest.spyOn(require('../common/utils'), 'isClientSide').mockReturnValue(true);
      await expect(getCookies()).rejects.toThrow('You are trying to access cookies on the client side');
    });
  });
});
