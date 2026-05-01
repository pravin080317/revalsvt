import { svtDebug } from '../utils/debug';

describe('svtDebug utility', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let groupSpy: jest.SpyInstance;
  let groupEndSpy: jest.SpyInstance;
  let tableSpy: jest.SpyInstance;

  beforeEach(() => {
    (globalThis as Record<string, unknown>).SVT_DEBUG = true;
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    groupSpy = jest.spyOn(console, 'groupCollapsed').mockImplementation(() => undefined);
    groupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => undefined);
    tableSpy = jest.spyOn(console, 'table').mockImplementation(() => undefined);
  });

  afterEach(() => {
    delete (globalThis as Record<string, unknown>).SVT_DEBUG;
    jest.restoreAllMocks();
  });

  describe('when SVT_DEBUG is enabled', () => {
    test('log calls console.log with prefix', () => {
      svtDebug.log('TEST', 'hello world', { data: 1 });
      expect(logSpy).toHaveBeenCalledWith('[SVT][TEST]', 'hello world', { data: 1 });
    });

    test('log passes multiple extra args', () => {
      svtDebug.log('X', 'msg', 'a', 'b', 'c');
      expect(logSpy).toHaveBeenCalledWith('[SVT][X]', 'msg', 'a', 'b', 'c');
    });

    test('warn calls console.warn with prefix', () => {
      svtDebug.warn('TEST', 'warning message');
      expect(warnSpy).toHaveBeenCalledWith('[SVT][TEST]', 'warning message');
    });

    test('error calls console.error with prefix', () => {
      svtDebug.error('TAG', 'error occurred', new Error('boom'));
      expect(errorSpy).toHaveBeenCalledWith('[SVT][TAG]', 'error occurred', new Error('boom'));
    });

    test('group calls console.groupCollapsed with combined label', () => {
      svtDebug.group('SECTION', 'My Group');
      expect(groupSpy).toHaveBeenCalledWith('[SVT][SECTION] My Group');
    });

    test('groupEnd calls console.groupEnd', () => {
      svtDebug.groupEnd();
      expect(groupEndSpy).toHaveBeenCalled();
    });

    test('table calls console.log and console.table', () => {
      const tableData = [{ id: 1, name: 'test' }];
      svtDebug.table('DATA', tableData);
      expect(logSpy).toHaveBeenCalledWith('[SVT][DATA]');
      expect(tableSpy).toHaveBeenCalledWith(tableData);
    });
  });

  describe('when SVT_DEBUG is disabled', () => {
    beforeEach(() => {
      delete (globalThis as Record<string, unknown>).SVT_DEBUG;
    });

    test('log does not call console.log', () => {
      svtDebug.log('TEST', 'silent');
      expect(logSpy).not.toHaveBeenCalled();
    });

    test('warn does not call console.warn', () => {
      svtDebug.warn('TEST', 'silent');
      expect(warnSpy).not.toHaveBeenCalled();
    });

    test('error does not call console.error', () => {
      svtDebug.error('TEST', 'silent');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    test('group does not call console.groupCollapsed', () => {
      svtDebug.group('TAG', 'silent');
      expect(groupSpy).not.toHaveBeenCalled();
    });

    test('groupEnd does not call console.groupEnd', () => {
      svtDebug.groupEnd();
      expect(groupEndSpy).not.toHaveBeenCalled();
    });

    test('table does not call console.log or console.table', () => {
      svtDebug.table('TAG', []);
      expect(logSpy).not.toHaveBeenCalled();
      expect(tableSpy).not.toHaveBeenCalled();
    });
  });

  describe('when SVT_DEBUG is set to a non-true value', () => {
    test('falsy string does not enable debug', () => {
      (globalThis as Record<string, unknown>).SVT_DEBUG = false;
      svtDebug.log('TEST', 'nope');
      expect(logSpy).not.toHaveBeenCalled();
    });

    test('string "true" does not enable debug (must be boolean true)', () => {
      (globalThis as Record<string, unknown>).SVT_DEBUG = 'true';
      svtDebug.log('TEST', 'nope');
      expect(logSpy).not.toHaveBeenCalled();
    });
  });
});
