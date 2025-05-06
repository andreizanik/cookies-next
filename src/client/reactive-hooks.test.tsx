import React, { ReactNode } from 'react';
import {
  useReactiveDeleteCookie,
  useReactiveGetCookie,
  useReactiveGetCookies,
  useReactiveHasCookie,
  useReactiveSetCookie,
} from './hooks';
import { render, renderHook, act } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';

import { CookiesNextProvider, getCookie, setCookie } from '.';

const createWrapper = () => {
  return ({ children }: { children: ReactNode }) => <CookiesNextProvider>{children}</CookiesNextProvider>;
};

function TestMutationComponent() {
  const setCookie = useReactiveSetCookie();
  const deleteCookie = useReactiveDeleteCookie();
  const getCookie = useReactiveGetCookie();
  return (
    <div>
      <p data-testid="cookie-value-setter">{getCookie('test')}</p>
      <button
        type="button"
        data-testid="set-cookie-button"
        onClick={() => {
          setCookie('test', 'test-value-from-setter-component');
        }}
      >
        Set cookie
      </button>
      <button
        type="button"
        data-testid="delete-cookie-button"
        onClick={() => {
          deleteCookie('test');
        }}
      >
        Delete cookie
      </button>
    </div>
  );
}
function TestComponent() {
  const getCookie = useReactiveGetCookie();
  return <div data-testid="cookie-value-getter">{getCookie('test')}</div>;
}

describe('CookiesNextContext test', () => {
  test('should set and get a cookie in a component', () => {
    document.cookie = 'test=test value from document.cookie';

    render(
      <CookiesNextProvider>
        <TestMutationComponent />
        <TestComponent />
      </CookiesNextProvider>,
    );
    const setterValue = screen.getByTestId('cookie-value-setter');
    const getterValue = screen.getByTestId('cookie-value-getter');

    expect(setterValue.textContent).toBe('test value from document.cookie');
    expect(getterValue.textContent).toBe('test value from document.cookie');
  });

  test('should set a cookie value on button click', async () => {
    render(
      <CookiesNextProvider>
        <TestMutationComponent />
        <TestComponent />
      </CookiesNextProvider>,
    );

    const setterButton = screen.getByTestId('set-cookie-button');
    const getterValue = screen.getByTestId('cookie-value-getter');

    await act(async () => {
      setterButton.click();
    });

    await waitFor(() => {
      expect(getterValue.textContent).toBe('test-value-from-setter-component');
    });
  });
  test('should delete a cookie value on button click', async () => {
    render(
      <CookiesNextProvider>
        <TestMutationComponent />
        <TestComponent />
      </CookiesNextProvider>,
    );

    const deleteButton = screen.getByTestId('delete-cookie-button');
    const getterValue = screen.getByTestId('cookie-value-getter');

    await act(async () => {
      deleteButton.click();
    });

    await waitFor(() => {
      expect(getterValue.textContent).toBe('');
    });
  });
});

describe('Reactive hooks operations.', () => {
  test('useReactiveGetCookies should return all cookies.', () => {
    setCookie('key1', 'value1');
    setCookie('key2', 'value2');
    const { result } = renderHook(() => useReactiveGetCookies(), { wrapper: createWrapper() });

    const getCookies = result.current;

    let cookies = null;

    act(() => {
      cookies = getCookies();
    });
    expect(cookies).toEqual({ key1: 'value1', key2: 'value2' });
  });

  test('useReactiveSetCookie should set a cookie', () => {
    const { result } = renderHook(() => useReactiveSetCookie(), { wrapper: createWrapper() });

    const setCookie = result.current;

    act(() => {
      setCookie('testKey', 'testValue');
    });
    expect(document.cookie).toContain('testKey=testValue');
  });
  test('useReactiveDeleteCookie should remove a cookie', () => {
    const { result } = renderHook(() => useReactiveDeleteCookie(), { wrapper: createWrapper() });

    const deleteCookie = result.current;

    document.cookie = 'testKey3=testValue3';
    act(() => {
      deleteCookie('testKey3');
    });

    expect(document.cookie).not.toContain('testKey3=testValue3');
  });

  test('useReactiveHasCookie should return true for existing cookie', () => {
    document.cookie = 'testKey4=testValue4';
    const { result } = renderHook(() => useReactiveHasCookie(), { wrapper: createWrapper() });

    const hasCookie = result.current;

    let exists = null;
    act(() => {
      exists = hasCookie('testKey4');
    });

    expect(exists).toBe(true);
  });

  test('useReactiveHasCookie should return false for non-existing cookie', () => {
    const { result } = renderHook(() => useReactiveHasCookie(), { wrapper: createWrapper() });

    const hasCookie = result.current;

    let exists = null;
    act(() => {
      exists = hasCookie('nonExistentKey5');
    });

    expect(exists).toBe(false);
  });

  test('useReactiveGetCookie should return undefined for non-existing cookie', () => {
    const { result } = renderHook(() => useReactiveGetCookie(), { wrapper: createWrapper() });

    const getCookie = result.current;

    let value = null;

    act(() => {
      value = getCookie('nonExistentKey');
    });
    expect(value).toBeUndefined();
  });
  test('useReactiveSetCookie should handle complex values', () => {
    const complexValue = { key: 'value', nested: { array: [1, 2, 3] } };
    const { result } = renderHook(() => useReactiveSetCookie(), { wrapper: createWrapper() });

    const setCookie = result.current;

    act(() => {
      setCookie('complexKey', complexValue);
    });
    let retrievedValue = getCookie('complexKey');

    expect(typeof retrievedValue === 'string' ? JSON.parse(retrievedValue) : {}).toEqual(complexValue);
  });
});
