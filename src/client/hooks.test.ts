import { renderHook, act } from '@testing-library/react-hooks';
import {
  getCookie,
  setCookie,
  useDeleteCookie,
  useGetCookie,
  useGetCookies,
  useHasCookie,
  useSetCookie,
} from '../index';

describe('Hooks operations.', () => {
  test('useGetCookies should return all cookies.', () => {
    const { result } = renderHook(() => useGetCookies());
    setCookie('key1', 'value1');
    setCookie('key2', 'value2');

    const getCookies = result.current;

    let cookies = null;

    act(() => {
      cookies = getCookies();
    });
    expect(cookies).toEqual({ key1: 'value1', key2: 'value2' });
  });

  test('useSetCookie should set a cookie', () => {
    const { result } = renderHook(() => useSetCookie());

    const setCookie = result.current;

    act(() => {
      setCookie('testKey', 'testValue');
    });
    expect(document.cookie).toContain('testKey=testValue');
  });
  test('useDeleteCookie should remove a cookie', () => {
    const { result } = renderHook(() => useDeleteCookie());

    const deleteCookie = result.current;

    document.cookie = 'testKey3=testValue3';
    act(() => {
      deleteCookie('testKey3');
    });

    expect(document.cookie).not.toContain('testKey3=testValue3');
  });

  test('useHasCookie should return true for existing cookie', () => {
    const { result } = renderHook(() => useHasCookie());

    const hasCookie = result.current;

    document.cookie = 'testKey4=testValue4';
    let exists = null;
    act(() => {
      exists = hasCookie('testKey4');
    });

    expect(exists).toBe(true);
  });

  test('useHasCookie should return false for non-existing cookie', () => {
    const { result } = renderHook(() => useHasCookie());

    const hasCookie = result.current;

    let exists = null;
    act(() => {
      exists = hasCookie('nonExistentKey5');
    });

    expect(exists).toBe(false);
  });

  test('useGetCookie should return undefined for non-existing cookie', () => {
    const { result } = renderHook(() => useGetCookie());

    const getCookie = result.current;

    let value = null;

    act(() => {
      value = getCookie('nonExistentKey');
    });
    expect(value).toBeUndefined();
  });
  test('useSetCookie should handle complex values', () => {
    const complexValue = { key: 'value', nested: { array: [1, 2, 3] } };
    const { result } = renderHook(() => useSetCookie());

    const setCookie = result.current;

    act(() => {
      setCookie('complexKey', complexValue);
    });
    let retrievedValue = getCookie('complexKey');

    expect(typeof retrievedValue === 'string' ? JSON.parse(retrievedValue) : {}).toEqual(complexValue);
  });
});
