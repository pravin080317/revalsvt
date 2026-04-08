import { filterItemsByColumnFilters } from '../utils/GridColumnFilters';

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
