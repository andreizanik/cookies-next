import { getCookie, getCookies, setCookie, deleteCookie, hasCookie } from '../index';

describe('Client-side cookie operations', () => {
  test('getCookies should return all cookies', () => {
    setCookie('key1', 'value1');
    setCookie('key2', 'value2');
    const cookies = getCookies();
    expect(cookies).toEqual({ key1: 'value1', key2: 'value2' });
  });

  test('setCookie should set a cookie', () => {
    setCookie('testKey', 'testValue');
    expect(document.cookie).toContain('testKey=testValue');
  });

  test('getCookie should retrieve a set cookie', () => {
    document.cookie = 'testKey2=testValue2';
    const value = getCookie('testKey2');
    expect(value).toBe('testValue2');
  });

  test('deleteCookie should remove a cookie', () => {
    document.cookie = 'testKey3=testValue3';
    deleteCookie('testKey3');
    expect(document.cookie).not.toContain('testKey3=testValue3');
  });

  test('hasCookie should return true for existing cookie', () => {
    document.cookie = 'testKey4=testValue4';
    const exists = hasCookie('testKey4');
    expect(exists).toBe(true);
  });

  test('hasCookie should return false for non-existing cookie', () => {
    const exists = hasCookie('nonExistentKey5');
    expect(exists).toBe(false);
  });

  test('getCookie should return undefined for non-existing cookie', () => {
    const value = getCookie('nonExistentKey');
    expect(value).toBeUndefined();
  });

  test('setCookie should handle complex values', () => {
    const complexValue = { key: 'value', nested: { array: [1, 2, 3] } };
    setCookie('complexKey', complexValue);
    const retrievedValue = getCookie('complexKey');
    expect(typeof retrievedValue === 'string' ? JSON.parse(retrievedValue) : {}).toEqual(complexValue);
  });
});
