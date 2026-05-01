import {
  deserializeColumnFiltersFromStorage,
  parseStoredSortState,
  serializeColumnFiltersForStorage,
  shouldPersistSortState,
} from '../utils/GridStatePersistence';

describe('grid state persistence', () => {
  test('serializes column filters for storage', () => {
    expect(serializeColumnFiltersForStorage({
      address: 'High Street',
      taskstatus: ['Assigned', 'Complete'],
      saleprice: { mode: 'between', min: 100, max: 200 },
    })).toEqual({
      address: ['High Street'],
      taskstatus: ['Assigned', 'Complete'],
      saleprice: ['{"mode":"between","min":100,"max":200}'],
    });
  });

  test('skips nullish, empty array, and empty scalar values during serialization', () => {
    expect(serializeColumnFiltersForStorage({
      address: '',
      taskstatus: [],
      flaggedforreview: null as unknown as string,
      reviewflags: ['  ', 'Flag 1', false as unknown as string],
      saleprice: { mode: '>=', min: 250000 },
      summaryflag: 'FLAGGED',
    })).toEqual({
      reviewflags: ['Flag 1', 'false'],
      saleprice: ['{"mode":">=","min":250000}'],
      summaryflag: ['FLAGGED'],
    });
  });

  test('deserializes text, multi-select, numeric, and date filters', () => {
    const restored = deserializeColumnFiltersFromStorage('sales', JSON.stringify({
      address: ['High Street'],
      taskStatus: ['Assigned', 'Complete'],
      salePrice: ['{"mode":"between","min":"100","max":"200"}'],
      assignedDate: ['{"from":"2026-02-01","to":"2026-02-03"}'],
    }));

    expect(restored).toEqual({
      address: 'High Street',
      taskstatus: ['Assigned', 'Complete'],
      saleprice: { mode: 'between', min: 100, max: 200 },
      assigneddate: { from: '2026-02-01', to: '2026-02-03' },
    });
  });

  test('returns empty object for null, invalid json, and non-object stored values', () => {
    expect(deserializeColumnFiltersFromStorage('sales', null)).toEqual({});
    expect(deserializeColumnFiltersFromStorage('sales', 'not-json')).toEqual({});
    expect(deserializeColumnFiltersFromStorage('sales', '123')).toEqual({});
  });

  test('ignores invalid structured filters during restore', () => {
    const restored = deserializeColumnFiltersFromStorage('sales', JSON.stringify({
      salePrice: ['not-json'],
      assignedDate: ['{}'],
      address: ['High Street'],
    }));

    expect(restored).toEqual({
      address: 'High Street',
    });
  });

  test('restores numeric modes for >=, <=, and one-sided between while rejecting invalid bounds', () => {
    const restored = deserializeColumnFiltersFromStorage('sales', JSON.stringify({
      salePrice: ['{"mode":">=","min":"100"}'],
      ratio: ['{"mode":"<=","max":"2.5"}'],
      outlierRatio: ['{"mode":"between","max":"1.4"}'],
    }));

    const invalidRestored = deserializeColumnFiltersFromStorage('sales', JSON.stringify({
      salePrice: ['{"mode":">="}'],
      ratio: ['{"mode":"<="}'],
    }));

    expect(restored.saleprice).toEqual({ mode: '>=', min: 100 });
    expect(restored.ratio).toEqual({ mode: '<=', max: 2.5 });
    expect(restored.outlierratio).toEqual({ mode: 'between', min: undefined, max: 1.4 });
    expect(invalidRestored.saleprice).toBeUndefined();
    expect(invalidRestored.ratio).toBeUndefined();
  });

  test('restores one-sided date ranges and rejects blank date payloads', () => {
    const restored = deserializeColumnFiltersFromStorage('sales', JSON.stringify({
      assignedDate: ['{"from":"2026-02-01"}'],
      qcAssignedDate: ['{"to":"2026-02-03"}'],
      qcCompletedDate: ['{"from":"   ","to":""}'],
    }));

    expect(restored.assigneddate).toEqual({ from: '2026-02-01', to: undefined });
    expect(restored.qcassigneddate).toEqual({ from: undefined, to: '2026-02-03' });
    expect(restored.qccompleteddate).toBeUndefined();
  });

  test('restores summary flag structured operator filter', () => {
    const restored = deserializeColumnFiltersFromStorage('sales', JSON.stringify({
      summaryFlags: ['{"operator":"contains","values":["band inactive"]}'],
    }));

    expect(restored).toEqual({
      summaryflags: {
        operator: 'contains',
        values: ['band inactive'],
      },
    });
  });

  test('falls back to stored array for summary flag when structured payload is invalid', () => {
    const restored = deserializeColumnFiltersFromStorage('sales', JSON.stringify({
      summaryFlags: ['{"operator":"bad","values":["x"]}'],
    }));

    expect(restored.summaryflags).toEqual(['{"operator":"bad","values":["x"]}']);
  });

  test('returns first value for configured single-select and unknown fields', () => {
    const restored = deserializeColumnFiltersFromStorage('sales', {
      assignedTo: ['user-1', 'user-2'],
      unknownField: ['first', 'second'],
      address: ['100', '200'],
    });

    expect(restored.assignedto).toBe('user-1');
    expect(restored.unknownfield).toBe('first');
    expect(restored.address).toBe('100');
  });

  test('parses valid stored sort state', () => {
    expect(parseStoredSortState('{"name":"saleId","sortDirection":1}')).toEqual({
      name: 'saleId',
      sortDirection: 1,
    });
  });

  test('rejects invalid stored sort state', () => {
    expect(parseStoredSortState(undefined)).toBeUndefined();
    expect(parseStoredSortState('not-json')).toBeUndefined();
    expect(parseStoredSortState('{"name":"","sortDirection":1}')).toBeUndefined();
    expect(parseStoredSortState('{"name":"saleId","sortDirection":2}')).toBeUndefined();
    expect(parseStoredSortState('{"name":"saleId"}')).toBeUndefined();
  });

  test('persists sort only when the user has an active sort', () => {
    expect(shouldPersistSortState({ name: 'saleId', sortDirection: 0 }, true)).toBe(true);
    expect(shouldPersistSortState({ name: 'saleId', sortDirection: 0 }, false)).toBe(false);
    expect(shouldPersistSortState(undefined, true)).toBe(false);
    expect(shouldPersistSortState({ name: '   ', sortDirection: 0 }, true)).toBe(false);
    expect(shouldPersistSortState({ name: 'saleId', sortDirection: 2 as 0 }, true)).toBe(false);
  });
});
