import {
  resolveConfiguredApiName,
  resolveConfiguredApiType,
  resolveCurrentUserId,
  resolveCurrentUserDisplayName,
  unwrapCustomApiPayload,
  parseManualTaskCreationResult,
  parseModifyTaskResult,
  parseApiMutationResult,
  extractTaskIdFromUnknown,
} from '../services/runtime/actions';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeContext = (params: Record<string, { raw?: string }>, userSettings?: Record<string, string>) =>
  ({
    parameters: params as unknown,
    userSettings: (userSettings ?? {}) as unknown,
  }) as ComponentFramework.Context<never>;

// ---------------------------------------------------------------------------
// resolveConfiguredApiName
// ---------------------------------------------------------------------------

describe('resolveConfiguredApiName', () => {
  test('returns value from context parameter when present', () => {
    const ctx = makeContext({ myApiParam: { raw: '  my_api_name  ' } });
    expect(resolveConfiguredApiName(ctx as never, 'myApiParam')).toBe('my_api_name');
  });

  test('falls back to fallbackApiName when context param is absent', () => {
    const ctx = makeContext({});
    expect(resolveConfiguredApiName(ctx as never, 'missingParam', 'fallback_api')).toBe('fallback_api');
  });

  test('returns empty string when both sources are empty', () => {
    const ctx = makeContext({ myParam: { raw: '' } });
    expect(resolveConfiguredApiName(ctx as never, 'myParam', undefined)).toBe('');
  });

  test('context param takes precedence over fallback', () => {
    const ctx = makeContext({ myParam: { raw: 'ctx_api' } });
    expect(resolveConfiguredApiName(ctx as never, 'myParam', 'fallback_api')).toBe('ctx_api');
  });
});

// ---------------------------------------------------------------------------
// resolveConfiguredApiType
// ---------------------------------------------------------------------------

describe('resolveConfiguredApiType', () => {
  test('returns 0 for "Action" context value', () => {
    const ctx = makeContext({ typeParam: { raw: 'Action' } });
    expect(resolveConfiguredApiType(ctx as never, 'typeParam')).toBe(0);
  });

  test('returns 1 (default) for unknown type', () => {
    const ctx = makeContext({ typeParam: { raw: 'function' } });
    expect(resolveConfiguredApiType(ctx as never, 'typeParam')).toBe(1);
  });

  test('falls back to fallbackApiType when context param missing', () => {
    const ctx = makeContext({});
    expect(resolveConfiguredApiType(ctx as never, 'missing', 'Action')).toBe(0);
  });

  test('returns 1 when both sources are empty', () => {
    const ctx = makeContext({});
    expect(resolveConfiguredApiType(ctx as never, 'missing')).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// resolveCurrentUserId
// ---------------------------------------------------------------------------

describe('resolveCurrentUserId', () => {
  const GUID = '{11111111-1111-1111-1111-111111111111}';

  test('returns normalized GUID from context userSettings', () => {
    const ctx = makeContext({}, { userId: GUID });
    const result = resolveCurrentUserId(ctx as never);
    // normalizeGuidValue strips braces
    expect(result).toBe('11111111-1111-1111-1111-111111111111');
  });

  test('falls back to Xrm when context userId is empty', () => {
    const ctx = makeContext({}, { userId: '' });
    const xrm = {
      Utility: {
        getGlobalContext: () => ({
          userSettings: { userId: '{22222222-2222-2222-2222-222222222222}' },
        }),
      },
    };
    (globalThis as Record<string, unknown>).Xrm = xrm;
    const result = resolveCurrentUserId(ctx as never);
    delete (globalThis as Record<string, unknown>).Xrm;
    expect(result).toBe('22222222-2222-2222-2222-222222222222');
  });

  test('returns empty string when both sources are absent', () => {
    const ctx = makeContext({}, {});
    const result = resolveCurrentUserId(ctx as never);
    expect(result).toBe('');
  });
});

// ---------------------------------------------------------------------------
// resolveCurrentUserDisplayName
// ---------------------------------------------------------------------------

describe('resolveCurrentUserDisplayName', () => {
  test('returns userName from context', () => {
    // userSettings has userName
    const ctx = {
      parameters: {},
      userSettings: { userName: 'Alice Smith' },
    } as unknown as ComponentFramework.Context<never>;
    expect(resolveCurrentUserDisplayName(ctx as never)).toBe('Alice Smith');
  });

  test('falls back to userDisplayName when userName is absent', () => {
    const ctx = {
      parameters: {},
      userSettings: { userName: '', userDisplayName: 'Bob Jones' },
    } as unknown as ComponentFramework.Context<never>;
    expect(resolveCurrentUserDisplayName(ctx as never)).toBe('Bob Jones');
  });

  test('falls back to Xrm userName when context has no name', () => {
    const ctx = {
      parameters: {},
      userSettings: {},
    } as unknown as ComponentFramework.Context<never>;
    (globalThis as Record<string, unknown>).Xrm = {
      Utility: { getGlobalContext: () => ({ userSettings: { userName: 'Xrm User' } }) },
    };
    const result = resolveCurrentUserDisplayName(ctx as never);
    delete (globalThis as Record<string, unknown>).Xrm;
    expect(result).toBe('Xrm User');
  });

  test('returns empty string when all sources are absent', () => {
    const ctx = { parameters: {}, userSettings: {} } as unknown as ComponentFramework.Context<never>;
    expect(resolveCurrentUserDisplayName(ctx as never)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// unwrapCustomApiPayload
// ---------------------------------------------------------------------------

describe('unwrapCustomApiPayload', () => {
  test('unwraps Result (capital R) string as parsed JSON', () => {
    const inner = { success: true, message: 'ok' };
    const payload = { Result: JSON.stringify(inner) };
    expect(unwrapCustomApiPayload(payload)).toEqual(inner);
  });

  test('unwraps result (lower-case r) string as parsed JSON', () => {
    const inner = { data: 42 };
    const payload = { result: JSON.stringify(inner) };
    expect(unwrapCustomApiPayload(payload)).toEqual(inner);
  });

  test('returns raw string when JSON parse fails', () => {
    const payload = { Result: 'not-json' };
    expect(unwrapCustomApiPayload(payload)).toBe('not-json');
  });

  test('returns original payload when no Result/result field', () => {
    const payload = { other: 'value' };
    expect(unwrapCustomApiPayload(payload)).toEqual({ other: 'value' });
  });

  test('returns null unchanged', () => {
    expect(unwrapCustomApiPayload(null)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// parseManualTaskCreationResult
// ---------------------------------------------------------------------------

describe('parseManualTaskCreationResult', () => {
  test('parses object with success:true and message', () => {
    const result = parseManualTaskCreationResult({ success: true, message: 'Task created', payload: 'M-1234' });
    expect(result.success).toBe(true);
    expect(result.payload).toBe('M-1234');
  });

  test('parses object with success:false', () => {
    const result = parseManualTaskCreationResult({ success: false, message: 'Something went wrong', payload: '' });
    expect(result.success).toBe(false);
  });

  test('parses JSON string result', () => {
    const inner = JSON.stringify({ success: true, message: 'done', payload: 'M-5678' });
    const result = parseManualTaskCreationResult({ Result: inner });
    expect(result.success).toBe(true);
    expect(result.payload).toBe('M-5678');
  });

  test('handles 500 error in message — returns technical error message', () => {
    const result = parseManualTaskCreationResult({ success: false, message: '500 Internal Server Error', payload: '' });
    expect(result.success).toBe(false);
    expect(result.message).toBe('Technical error. Please try again in some time.');
  });

  test('returns failure with default message for null input', () => {
    const result = parseManualTaskCreationResult(null);
    expect(result.success).toBe(false);
    expect(result.message).toBeTruthy();
  });

  test('parses plain "success" string result', () => {
    const result = parseManualTaskCreationResult('success');
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// parseModifyTaskResult
// ---------------------------------------------------------------------------

describe('parseModifyTaskResult', () => {
  test('parses object with success:true', () => {
    // message field is traversed first; use a value that resolves to success
    const result = parseModifyTaskResult({ success: true, message: 'succeeded' });
    expect(result.success).toBe(true);
  });

  test('parses object with success:false', () => {
    const result = parseModifyTaskResult({ success: false, message: 'Failed to update' });
    expect(result.success).toBe(false);
  });

  test('parses JSON-wrapped Result field', () => {
    const inner = JSON.stringify({ success: true, message: 'ok' });
    const result = parseModifyTaskResult({ Result: inner });
    expect(result.success).toBe(true);
  });

  test('parses "ok" string as success', () => {
    const result = parseModifyTaskResult('ok');
    expect(result.success).toBe(true);
  });

  test('sanitises 500 error message', () => {
    const result = parseModifyTaskResult({ success: false, message: 'status: 500 failure' });
    expect(result.message).toBe('Technical error. Please try again in some time.');
  });

  test('returns default failure for null input', () => {
    const result = parseModifyTaskResult(null);
    expect(result.success).toBe(false);
    expect(result.message).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// parseApiMutationResult
// ---------------------------------------------------------------------------

describe('parseApiMutationResult', () => {
  const fallback = 'Mutation failed.';

  test('parses success object', () => {
    const result = parseApiMutationResult({ success: true, message: 'Submitted' }, fallback);
    expect(result.success).toBe(true);
    expect(result.message).toBe('Submitted');
  });

  test('parses failure object', () => {
    const result = parseApiMutationResult({ success: false, message: 'Invalid request' }, fallback);
    expect(result.success).toBe(false);
  });

  test('returns fallback message for null', () => {
    const result = parseApiMutationResult(null, fallback);
    expect(result.success).toBe(false);
    expect(result.message).toBe(fallback);
  });

  test('parses success hint in plain string', () => {
    const result = parseApiMutationResult('submitted', fallback);
    expect(result.success).toBe(true);
  });

  test('parses failure hint in plain string', () => {
    const result = parseApiMutationResult('error in processing', fallback);
    expect(result.success).toBe(false);
  });

  test('sanitises bad request HTML response', () => {
    const result = parseApiMutationResult({ success: false, message: '400 bad request' }, fallback);
    expect(result.message).toBe(fallback);
  });

  test('sanitises response with 500 status code', () => {
    const result = parseApiMutationResult({ success: false, message: '500 Internal Server Error' }, fallback);
    expect(result.message).toBe('Technical error. Please try again in some time.');
  });

  test('unwraps nested Result field before parsing', () => {
    // message 'submitted' is in SUCCESS_HINTS so nested traversal resolves to success:true
    const inner = JSON.stringify({ success: true, message: 'submitted' });
    const result = parseApiMutationResult({ Result: inner }, fallback);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// extractTaskIdFromUnknown
// ---------------------------------------------------------------------------

describe('extractTaskIdFromUnknown', () => {
  test('extracts M-1234 pattern from plain string', () => {
    expect(extractTaskIdFromUnknown('M-1234')).toBe('M-1234');
  });

  test('extracts M-id from string with surrounding text', () => {
    expect(extractTaskIdFromUnknown('Task id is M-5678 created')).toBe('M-5678');
  });

  test('extracts task id from object with taskId key', () => {
    expect(extractTaskIdFromUnknown({ taskId: 'M-9999' })).toBe('M-9999');
  });

  test('extracts task id from array of objects', () => {
    expect(extractTaskIdFromUnknown([{ svtTaskId: 'M-1111' }])).toBe('M-1111');
  });

  test('extracts from JSON string', () => {
    expect(extractTaskIdFromUnknown(JSON.stringify({ taskId: 'M-2222' }))).toBe('M-2222');
  });

  test('returns empty string for null', () => {
    expect(extractTaskIdFromUnknown(null)).toBe('');
  });

  test('returns empty string for empty string', () => {
    expect(extractTaskIdFromUnknown('')).toBe('');
  });

  test('returns empty string when no task id pattern found', () => {
    expect(extractTaskIdFromUnknown({ randomKey: 'no-id-here' })).toBe('');
  });

  test('returns empty string for undefined', () => {
    expect(extractTaskIdFromUnknown(undefined)).toBe('');
  });
});
