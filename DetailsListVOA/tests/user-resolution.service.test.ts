import { UserResolutionService } from '../services/UserResolution';

describe('UserResolutionService', () => {
  const originalXrm = (globalThis as any).Xrm;

  afterEach(() => {
    (globalThis as any).Xrm = originalXrm;
  });

  test('returns undefined for empty guid', async () => {
    const service = new UserResolutionService();
    const result = await service.resolveUser({} as any, '   ');
    expect(result).toBeUndefined();
  });

  test('resolves by system user id and caches the result', async () => {
    const retrieveRecord = jest.fn().mockResolvedValue({
      systemuserid: '111',
      fullname: 'Test User',
      azureactivedirectoryobjectid: 'entra-1',
      isdisabled: false,
    });
    const retrieveMultipleRecords = jest.fn();
    const context = { webAPI: { retrieveRecord, retrieveMultipleRecords } } as any;

    const service = new UserResolutionService();
    const first = await service.resolveUser(context, 'ABC-123');
    const second = await service.resolveUser(context, 'abc-123');

    expect(first).toEqual({
      name: 'Test User',
      isActive: true,
      systemUserId: '111',
      entraObjectId: 'entra-1',
    });
    expect(second).toEqual(first);
    expect(retrieveRecord).toHaveBeenCalledTimes(1);
    expect(service.getCacheSize()).toBe(1);
  });

  test('falls back to entra object id lookup when systemuserid lookup fails', async () => {
    const retrieveRecord = jest.fn().mockRejectedValue(new Error('not found'));
    const retrieveMultipleRecords = jest.fn().mockResolvedValue({
      records: [
        {
          systemuserid: '222',
          fullname: 'Entra User',
          azureactivedirectoryobjectid: 'entra-2',
          isdisabled: true,
        },
      ],
    });
    const context = { webAPI: { retrieveRecord, retrieveMultipleRecords } } as any;

    const service = new UserResolutionService();
    const result = await service.resolveUser(context, 'ENTRA-GUID');

    expect(result).toEqual({
      name: 'Entra User',
      isActive: false,
      systemUserId: '222',
      entraObjectId: 'entra-2',
    });
    expect(retrieveMultipleRecords).toHaveBeenCalledTimes(1);
  });

  test('uses firstname and lastname when fullname is missing', async () => {
    const retrieveRecord = jest.fn().mockResolvedValue({
      systemuserid: '333',
      fullname: '   ',
      firstname: 'Case',
      lastname: 'Worker',
      azureactivedirectoryobjectid: 'entra-3',
      isdisabled: false,
    });
    const context = { webAPI: { retrieveRecord, retrieveMultipleRecords: jest.fn() } } as any;

    const service = new UserResolutionService();
    const result = await service.resolveUser(context, 'GUID-3');

    expect(result?.name).toBe('Case Worker');
  });

  test('uses domainname when full and split names are missing', async () => {
    const retrieveRecord = jest.fn().mockResolvedValue({
      systemuserid: '444',
      fullname: '',
      firstname: '',
      lastname: '',
      domainname: 'domain\\user',
      azureactivedirectoryobjectid: 'entra-4',
      isdisabled: false,
    });
    const context = { webAPI: { retrieveRecord, retrieveMultipleRecords: jest.fn() } } as any;

    const service = new UserResolutionService();
    const result = await service.resolveUser(context, 'GUID-4');

    expect(result?.name).toBe('domain\\user');
  });

  test('returns undefined when no web api is available', async () => {
    const service = new UserResolutionService();
    const result = await service.resolveUser({} as any, 'GUID-5');
    expect(result).toBeUndefined();
  });

  test('uses global Xrm WebApi.online when context webAPI is absent', async () => {
    const retrieveRecord = jest.fn().mockResolvedValue({
      systemuserid: '555',
      fullname: 'Online User',
      azureactivedirectoryobjectid: 'entra-5',
      isdisabled: false,
    });
    (globalThis as any).Xrm = {
      WebApi: {
        online: {
          retrieveRecord,
          retrieveMultipleRecords: jest.fn(),
        },
      },
    };

    const service = new UserResolutionService();
    const result = await service.resolveUser({} as any, 'GUID-6');

    expect(result?.name).toBe('Online User');
    expect(retrieveRecord).toHaveBeenCalledTimes(1);
  });

  test('resolveUsers skips blanks and collects successful resolutions', async () => {
    const service = new UserResolutionService();
    const spy = jest
      .spyOn(service, 'resolveUser')
      .mockResolvedValueOnce({ name: 'One' })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ name: 'Three' });

    const result = await service.resolveUsers({} as any, ['a', ' ', 'b', 'c']);

    expect(spy).toHaveBeenCalledTimes(3);
    expect(result.get('a')).toEqual({ name: 'One' });
    expect(result.has('b')).toBe(false);
    expect(result.get('c')).toEqual({ name: 'Three' });
  });

  test('resolveUsers continues when an individual resolution throws', async () => {
    const service = new UserResolutionService();
    const spy = jest
      .spyOn(service, 'resolveUser')
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ name: 'Safe User' });

    const result = await service.resolveUsers({} as any, ['x', 'y']);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(result.size).toBe(1);
    expect(result.get('y')).toEqual({ name: 'Safe User' });
  });

  test('clearCache resets stored entries', async () => {
    const retrieveRecord = jest.fn().mockResolvedValue({
      systemuserid: '777',
      fullname: 'Cache User',
      azureactivedirectoryobjectid: 'entra-7',
      isdisabled: false,
    });
    const context = { webAPI: { retrieveRecord, retrieveMultipleRecords: jest.fn() } } as any;
    const service = new UserResolutionService();

    await service.resolveUser(context, 'GUID-7');
    expect(service.getCacheSize()).toBe(1);

    service.clearCache();
    expect(service.getCacheSize()).toBe(0);
  });
});
