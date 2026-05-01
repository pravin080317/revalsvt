import {
  buildUnboundCustomApiRequest,
  executeUnboundCustomApi,
  normalizeCustomApiName,
  resolveCustomApiOperationType,
} from '../services/CustomApi';

describe('CustomApi service helpers', () => {
  const originalXrm = (globalThis as any).Xrm;

  afterEach(() => {
    (globalThis as any).Xrm = originalXrm;
  });

  test('normalizeCustomApiName trims and collapses whitespace', () => {
    expect(normalizeCustomApiName('  voa  Get All  Sales  ')).toBe('voa_Get_All_Sales');
    expect(normalizeCustomApiName('')).toBe('');
    expect(normalizeCustomApiName(undefined)).toBe('');
  });

  test('resolveCustomApiOperationType maps action to 0 and defaults to 1', () => {
    expect(resolveCustomApiOperationType('action')).toBe(0);
    expect(resolveCustomApiOperationType(' Action ')).toBe(0);
    expect(resolveCustomApiOperationType('function')).toBe(1);
    expect(resolveCustomApiOperationType(undefined)).toBe(1);
  });

  test('buildUnboundCustomApiRequest includes metadata and string parameter types', () => {
    const request = buildUnboundCustomApiRequest('voa_TestApi', { a: '1', b: '2' }, 1);
    const metadata = request.getMetadata();

    expect(metadata.operationName).toBe('voa_TestApi');
    expect(metadata.operationType).toBe(1);
    expect(metadata.boundParameter).toBeNull();
    expect(metadata.parameterTypes).toEqual({
      a: { typeName: 'Edm.String', structuralProperty: 1 },
      b: { typeName: 'Edm.String', structuralProperty: 1 },
    });
    expect((request as any).a).toBe('1');
    expect((request as any).b).toBe('2');
  });

  test('executeUnboundCustomApi parses JSON responses', async () => {
    const execute = jest.fn().mockResolvedValue({
      text: async () => JSON.stringify({ ok: true, value: 42 }),
    });

    const result = await executeUnboundCustomApi<any>(
      { webAPI: { execute } } as any,
      'voa_TestApi',
      { p: 'x' },
      { operationType: 1 },
    );

    expect(result).toEqual({ ok: true, value: 42 });
    expect(execute).toHaveBeenCalledTimes(1);
  });

  test('executeUnboundCustomApi returns empty object for empty response body', async () => {
    const execute = jest.fn().mockResolvedValue({ text: async () => '   ' });

    const result = await executeUnboundCustomApi<any>(
      { webAPI: { execute } } as any,
      'voa_Empty',
      { p: 'x' },
    );

    expect(result).toEqual({});
  });

  test('executeUnboundCustomApi returns plain text for non-JSON responses', async () => {
    const execute = jest.fn().mockResolvedValue({ text: async () => 'OK' });

    const result = await executeUnboundCustomApi<any>(
      { webAPI: { execute } } as any,
      'voa_Text',
      { p: 'x' },
    );

    expect(result).toBe('OK');
  });

  test('executeUnboundCustomApi uses global Xrm WebApi.online fallback', async () => {
    const execute = jest.fn().mockResolvedValue({
      text: async () => JSON.stringify({ via: 'online' }),
    });
    (globalThis as any).Xrm = {
      WebApi: {
        online: { execute },
      },
    };

    const result = await executeUnboundCustomApi<any>({} as any, 'voa_Fallback', { p: 'x' });

    expect(result).toEqual({ via: 'online' });
    expect(execute).toHaveBeenCalledTimes(1);
  });

  test('throws clear error when execute is unavailable', async () => {
    await expect(
      executeUnboundCustomApi<any>({} as any, 'voa_NoExecute', { p: 'x' }),
    ).rejects.toThrow('Web API execute is not available in this environment');
  });

  test('maps harness execute errors to friendly message', async () => {
    const execute = jest.fn().mockRejectedValue(new Error('execute is not a function'));

    await expect(
      executeUnboundCustomApi<any>({ webAPI: { execute } } as any, 'voa_Harness', { p: 'x' }),
    ).rejects.toThrow('Web API execute is not supported in the PCF test harness. Please test in a Dataverse environment.');
  });

  test('rethrows non-harness errors unchanged', async () => {
    const execute = jest.fn().mockRejectedValue(new Error('network timeout'));

    await expect(
      executeUnboundCustomApi<any>({ webAPI: { execute } } as any, 'voa_Network', { p: 'x' }),
    ).rejects.toThrow('network timeout');
  });
});
