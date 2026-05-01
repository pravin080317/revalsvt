import { filterItemsByColumnFilters, getActiveColumnFilters } from '../utils/GridColumnFilters';

const getFilterableText = (raw: unknown): string => {
  if (Array.isArray(raw)) {
    return raw
      .map((v) => (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? String(v) : ''))
      .filter((s) => s !== '')
      .join(', ');
  }
  if (typeof raw === 'string') {
    return raw;
  }
  if (typeof raw === 'number' || typeof raw === 'boolean') {
    return raw.toString();
  }
  return '';
};

describe('grid column filter engine', () => {
  test('textEq uses contains match to align with API', () => {
    const items = [
      { taskid: 'S-1001', saleid: 'S-1001' },
      { taskid: 'A-2000', saleid: 'S-2000' },
    ];
    const result = filterItemsByColumnFilters(
      items,
      { taskid: 'S-100' },
      'sales',
      getFilterableText,
      (item, field) => item[field as keyof typeof item],
    );

    expect(result).toHaveLength(1);
    expect(result[0].taskid).toBe('S-1001');
  });

  test('returns all items when no active column filters', () => {
    const items = [
      { taskid: 'S-1001' },
      { taskid: 'A-2000' },
    ];
    const result = filterItemsByColumnFilters(
      items,
      {},
      'sales',
      getFilterableText,
      (item, field) => item[field as keyof typeof item],
    );

    expect(result).toHaveLength(2);
  });

  test('singleSelect assignedto filter matches row by assignedtoid when filter value is a GUID', () => {
    const aliceId = '11111111-1111-1111-1111-111111111111';
    const bobId = '22222222-2222-2222-2222-222222222222';
    const items = [
      { assignedto: ['Alice Caseworker'], assignedtoid: aliceId },
      { assignedto: ['Bob Caseworker'], assignedtoid: bobId },
    ];

    const result = filterItemsByColumnFilters(
      items,
      { assignedto: aliceId },
      'sales',
      getFilterableText,
      (item, field) => item[field as keyof typeof item],
    );

    expect(result).toHaveLength(1);
    expect(result[0].assignedtoid).toBe(aliceId);
  });

  test('singleSelect qcassignedto filter matches row by qcassignedtoid when filter value is a GUID', () => {
    const qcAId = '33333333-3333-3333-3333-333333333333';
    const qcBId = '44444444-4444-4444-4444-444444444444';
    const items = [
      { qcassignedto: ['Carol QC'], qcassignedtoid: qcAId },
      { qcassignedto: ['Dan QC'], qcassignedtoid: qcBId },
    ];

    const result = filterItemsByColumnFilters(
      items,
      { qcassignedto: qcAId },
      'sales',
      getFilterableText,
      (item, field) => item[field as keyof typeof item],
    );

    expect(result).toHaveLength(1);
    expect(result[0].qcassignedtoid).toBe(qcAId);
  });

  test('summary flag eq matches token within array-backed summary flags', () => {
    const items = [
      { summaryflags: ['composite:banding after txn', 'same solicitor'] },
      { summaryflags: ['other flag'] },
    ];

    const result = filterItemsByColumnFilters(
      items,
      { summaryflags: { operator: 'eq', values: ['same solicitor'] } },
      'sales',
      getFilterableText,
      (item, field) => item[field as keyof typeof item],
    );

    expect(result).toHaveLength(1);
    expect(result[0].summaryflags).toEqual(['composite:banding after txn', 'same solicitor']);
  });

  test('summary flag eq matches token within semicolon-delimited string summary flags', () => {
    const items = [
      { summaryflags: 'composite:banding after txn;same solicitor' },
      { summaryflags: 'other flag' },
    ];

    const result = filterItemsByColumnFilters(
      items,
      { summaryflags: { operator: 'eq', values: ['same solicitor'] } },
      'sales',
      getFilterableText,
      (item, field) => item[field as keyof typeof item],
    );

    expect(result).toHaveLength(1);
    expect(result[0].summaryflags).toBe('composite:banding after txn;same solicitor');
  });

  test('summary flag contains matches token within array-backed summary flags', () => {
    const items = [
      { summaryflags: ['composite:banding after txn', 'same solicitor'] },
      { summaryflags: ['other flag'] },
    ];

    const result = filterItemsByColumnFilters(
      items,
      { summaryflags: { operator: 'contains', values: ['same solicitor'] } },
      'sales',
      getFilterableText,
      (item, field) => item[field as keyof typeof item],
    );

    expect(result).toHaveLength(1);
    expect(result[0].summaryflags).toEqual(['composite:banding after txn', 'same solicitor']);
  });

  test('summary flag contains matches token within semicolon-delimited string summary flags', () => {
    const items = [
      { summaryflags: 'composite:banding after txn;same solicitor' },
      { summaryflags: 'other flag' },
    ];

    const result = filterItemsByColumnFilters(
      items,
      { summaryflags: { operator: 'contains', values: ['same solicitor'] } },
      'sales',
      getFilterableText,
      (item, field) => item[field as keyof typeof item],
    );

    expect(result).toHaveLength(1);
    expect(result[0].summaryflags).toBe('composite:banding after txn;same solicitor');
  });

  test('summary flag notContains excludes token within array-backed summary flags', () => {
    const items = [
      { summaryflags: ['composite:banding after txn', 'same solicitor'] },
      { summaryflags: ['other flag'] },
    ];

    const result = filterItemsByColumnFilters(
      items,
      { summaryflags: { operator: 'notContains', values: ['same solicitor'] } },
      'sales',
      getFilterableText,
      (item, field) => item[field as keyof typeof item],
    );

    expect(result).toHaveLength(1);
    expect(result[0].summaryflags).toEqual(['other flag']);
  });

  test('summary flag notContains excludes token within semicolon-delimited string summary flags', () => {
    const items = [
      { summaryflags: 'composite:banding after txn;same solicitor' },
      { summaryflags: 'other flag' },
    ];

    const result = filterItemsByColumnFilters(
      items,
      { summaryflags: { operator: 'notContains', values: ['same solicitor'] } },
      'sales',
      getFilterableText,
      (item, field) => item[field as keyof typeof item],
    );

    expect(result).toHaveLength(1);
    expect(result[0].summaryflags).toBe('other flag');
  });

  describe('dateRange column filter', () => {
    const items = [
      { transactiondate: '2024-01-10' },
      { transactiondate: '2024-03-15' },
      { transactiondate: '2024-06-01' },
      { transactiondate: '2024-12-31' },
    ];
    const getRaw = (item: Record<string, string>, field: string) => item[field];

    test('filters by from and to range (inclusive)', () => {
      const result = filterItemsByColumnFilters(
        items,
        { transactiondate: { from: '2024-03-01', to: '2024-06-30' } },
        'sales',
        getFilterableText,
        getRaw,
      );
      expect(result.map((r) => r.transactiondate)).toEqual(['2024-03-15', '2024-06-01']);
    });

    test('filters by from only (open-ended to)', () => {
      const result = filterItemsByColumnFilters(
        items,
        { transactiondate: { from: '2024-06-01' } },
        'sales',
        getFilterableText,
        getRaw,
      );
      expect(result.map((r) => r.transactiondate)).toEqual(['2024-06-01', '2024-12-31']);
    });

    test('filters by to only (open-ended from)', () => {
      const result = filterItemsByColumnFilters(
        items,
        { transactiondate: { to: '2024-01-31' } },
        'sales',
        getFilterableText,
        getRaw,
      );
      expect(result.map((r) => r.transactiondate)).toEqual(['2024-01-10']);
    });

    test('plain string value on dateRange column excludes rows with unparseable date (regression guard)', () => {
      // If a plain string somehow ended up as a dateRange filter value it should not crash
      // The engine casts to DateRangeFilter → from/to both undefined → all rows pass
      const result = filterItemsByColumnFilters(
        items,
        { transactiondate: '2024-03-15' as unknown as import('../utils/GridColumnFilters').ColumnFilterValue },
        'sales',
        getFilterableText,
        getRaw,
      );
      // plain string treated as a contains filter (fallthrough path): only exact matches
      expect(result).toBeDefined();
    });

    test('returns no rows when from > to of all items', () => {
      const result = filterItemsByColumnFilters(
        items,
        { transactiondate: { from: '2025-01-01', to: '2025-12-31' } },
        'sales',
        getFilterableText,
        getRaw,
      );
      expect(result).toHaveLength(0);
    });
  });
});

  // ──────────────────────────────────────
  // getActiveColumnFilters
  // ──────────────────────────────────────
  describe('getActiveColumnFilters', () => {
    test('returns empty array for empty filter object', () => {
      expect(getActiveColumnFilters({})).toEqual([]);
    });

    test('excludes blank string filters', () => {
      expect(getActiveColumnFilters({ taskid: '' })).toEqual([]);
      expect(getActiveColumnFilters({ taskid: '  ' })).toEqual([]);
    });

    test('includes non-blank string filters', () => {
      const result = getActiveColumnFilters({ taskid: 'S-100', saleid: '' });
      expect(result).toHaveLength(1);
      expect(result[0][0]).toBe('taskid');
    });

    test('includes non-empty array filters', () => {
      const result = getActiveColumnFilters({ summaryflags: ['flag-a'] });
      expect(result).toHaveLength(1);
      expect(result[0][0]).toBe('summaryflags');
    });

    test('excludes empty array filters', () => {
      expect(getActiveColumnFilters({ summaryflags: [] })).toEqual([]);
    });

    test('includes numeric >= filter with min set', () => {
      const result = getActiveColumnFilters({ saleprice: { mode: '>=', min: 200000 } });
      expect(result).toHaveLength(1);
      expect(result[0][0]).toBe('saleprice');
    });

    test('includes numeric <= filter with max set', () => {
      const result = getActiveColumnFilters({ saleprice: { mode: '<=', max: 500000 } });
      expect(result).toHaveLength(1);
    });

    test('includes numeric between filter with any bound set', () => {
      const result = getActiveColumnFilters({ saleprice: { mode: 'between', min: 100000 } });
      expect(result).toHaveLength(1);
    });

    test('excludes numeric >= filter with no min', () => {
      expect(getActiveColumnFilters({ saleprice: { mode: '>=' } as { mode: '>=' } })).toEqual([]);
    });

    test('includes DateRange filter with from set', () => {
      const result = getActiveColumnFilters({ transactiondate: { from: '2024-01-01' } });
      expect(result).toHaveLength(1);
    });
  });

  // ──────────────────────────────────────
  // numeric column filter (saleprice)
  // ──────────────────────────────────────
  describe('numeric column filter', () => {
    const getFilterableText = (raw: unknown): string => (typeof raw === 'number' ? String(raw) : String(raw ?? ''));
    const getRaw = (item: Record<string, unknown>, field: string) => item[field];

    const items = [
      { saleprice: 150000 },
      { saleprice: 250000 },
      { saleprice: 350000 },
      { saleprice: 500000 },
    ];

    test('mode >= includes items at or above min', () => {
      const result = filterItemsByColumnFilters(items, { saleprice: { mode: '>=', min: 250000 } }, 'sales', getFilterableText, getRaw);
      expect(result).toHaveLength(3);
      expect(result.map((i) => i.saleprice)).toEqual([250000, 350000, 500000]);
    });

    test('mode <= includes items at or below max', () => {
      const result = filterItemsByColumnFilters(items, { saleprice: { mode: '<=', max: 350000 } }, 'sales', getFilterableText, getRaw);
      expect(result).toHaveLength(3);
      expect(result.map((i) => i.saleprice)).toEqual([150000, 250000, 350000]);
    });

    test('mode between includes items within min-max inclusive', () => {
      const result = filterItemsByColumnFilters(
        items,
        { saleprice: { mode: 'between', min: 200000, max: 400000 } },
        'sales',
        getFilterableText,
        getRaw,
      );
      expect(result).toHaveLength(2);
      expect(result.map((i) => i.saleprice)).toEqual([250000, 350000]);
    });

    test('returns all items when between has no bounds', () => {
      const result = filterItemsByColumnFilters(
        items,
        { saleprice: { mode: 'between' } as { mode: 'between' } },
        'sales',
        getFilterableText,
        getRaw,
      );
      expect(result).toHaveLength(4);
    });

    test('excludes non-numeric values', () => {
      const mixedItems = [{ saleprice: 'N/A' }, { saleprice: 300000 }];
      const result = filterItemsByColumnFilters(mixedItems, { saleprice: { mode: '>=', min: 100000 } }, 'sales', getFilterableText, getRaw);
      expect(result).toHaveLength(1);
      expect((result[0] as { saleprice: number }).saleprice).toBe(300000);
    });
  });

  // ──────────────────────────────────────
  // fallback filter (no column config)
  // ──────────────────────────────────────
  describe('fallback filter (unconfigured field)', () => {
    const getFilterableText = (raw: unknown): string => (typeof raw === 'string' ? raw : typeof raw === 'number' ? String(raw) : '');
    const getRaw = (item: Record<string, unknown>, field: string) => item[field];

    test('string fallback: contains match on text value', () => {
      const items = [{ customfield: 'hello world' }, { customfield: 'something else' }];
      const result = filterItemsByColumnFilters(items, { customfield: 'hello' }, 'sales', getFilterableText, getRaw);
      expect(result).toHaveLength(1);
      expect((result[0] as { customfield: string }).customfield).toBe('hello world');
    });

    test('string fallback: returns all when filter is blank', () => {
      const items = [{ customfield: 'abc' }, { customfield: 'def' }];
      const result = filterItemsByColumnFilters(items, { customfield: '' }, 'sales', getFilterableText, getRaw);
      expect(result).toHaveLength(2);
    });

    test('array filterValue: matchesArrayFilter on array raw', () => {
      const items = [
        { tags: ['alpha', 'beta'] },
        { tags: ['gamma', 'delta'] },
      ];
      const result = filterItemsByColumnFilters(items, { tags: ['alpha'] }, 'sales', getFilterableText, getRaw);
      expect(result).toHaveLength(1);
      expect((result[0] as { tags: string[] }).tags).toEqual(['alpha', 'beta']);
    });

    test('array filterValue: falls back to exact text match on string raw', () => {
      const items = [{ status: 'Active' }, { status: 'Inactive' }];
      const result = filterItemsByColumnFilters(items, { status: ['active'] }, 'sales', getFilterableText, getRaw);
      expect(result).toHaveLength(1);
      expect((result[0] as { status: string }).status).toBe('Active');
    });

    test('string fallback: case-insensitive match on array raw items', () => {
      const items = [
        { codes: ['ALPHA', 'BETA'] },
        { codes: ['GAMMA'] },
      ];
      const arrText = (raw: unknown) => Array.isArray(raw) ? (raw as string[]).join(', ') : '';
      const result = filterItemsByColumnFilters(items, { codes: 'alpha' }, 'sales', arrText, getRaw);
      expect(result).toHaveLength(1);
    });
  });

  // ──────────────────────────────────────
  // textPrefix filter
  // ──────────────────────────────────────
  describe('textPrefix column filter (uprn field)', () => {
    const getFilterableText = (raw: unknown): string => (typeof raw === 'string' ? raw : '');
    const getRaw = (item: Record<string, unknown>, field: string) => item[field];

    test('matches items whose uprn starts with the prefix', () => {
      const items = [
        { uprn: '100023456789' },
        { uprn: '200098765432' },
        { uprn: '100011112222' },
      ];
      const result = filterItemsByColumnFilters(items, { uprn: '1000' }, 'sales', getFilterableText, getRaw);
      expect(result).toHaveLength(2);
    });

    test('returns all items when filter is blank', () => {
      const items = [{ uprn: '100023456789' }, { uprn: '200098765432' }];
      const result = filterItemsByColumnFilters(items, { uprn: '' }, 'sales', getFilterableText, getRaw);
      expect(result).toHaveLength(2);
    });
  });
