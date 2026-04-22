import { buildColumnFilterQuery } from '../utils/ColumnFilterQuery';

describe('column filter query', () => {
  test('returns empty string when no filters and no sort', () => {
    const query = buildColumnFilterQuery('sales', {});
    expect(query).toBe('');
  });

  test('uses eq for single select fields', () => {
    const query = buildColumnFilterQuery('sales', { flaggedForReview: 'true' });
    expect(query).toBe('columnFilter=flaggedForReview~eq~Y');
  });

  test('uses like for text fields and encodes values', () => {
    const query = buildColumnFilterQuery('sales', { address: 'High Street' });
    expect(query).toBe('columnFilter=address~like~High%20Street');
  });

  test('keeps taskId prefixes and maps field to taskName in text filters', () => {
    const query = buildColumnFilterQuery('sales', { taskId: 'A-1000234' });
    expect(query).toBe('columnFilter=taskName~like~A-1000234');
  });

  test('does not append sort marker when sort is not provided', () => {
    const query = buildColumnFilterQuery('sales', { address: 'High' });
    expect(query).toBe('columnFilter=address~like~High');
  });

  test('uses in for multi select fields', () => {
    const query = buildColumnFilterQuery('sales', { taskStatus: ['Assigned', 'Complete'] });
    expect(query).toBe('columnFilter=taskStatus~in~Assigned%2CComplete');
  });

  test('serializes review flags as semicolon-delimited values with trailing semicolon', () => {
    const query = buildColumnFilterQuery('sales', { reviewFlags: ['Low', 'High'] });
    expect(query).toBe('columnFilter=reviewFlag~in~Low%3BHigh%3B');
  });

  test('serializes single review flag with trailing semicolon', () => {
    const query = buildColumnFilterQuery('sales', { reviewFlags: ['Low'] });
    expect(query).toBe('columnFilter=reviewFlag~in~Low%3B');
  });

  test('serializes summary flag contains filters with semicolon-separated values', () => {
    const query = buildColumnFilterQuery('sales', {
      summaryFlag: { operator: 'contains', values: ['Potential', 'Review'] },
    });
    expect(query).toBe('columnFilter=summaryFlags~like~Potential%3BReview');
  });

  test('serializes summary flag exact filters as eq with a single value and trailing semicolon', () => {
    const query = buildColumnFilterQuery('sales', {
      summaryFlag: { operator: 'eq', values: ['Potential'] },
    });
    expect(query).toBe('columnFilter=summaryFlags~EQ~Potential%3B');
  });

  test('serializes summary flag exact filters as eq with multiple values and trailing semicolon', () => {
    const query = buildColumnFilterQuery('sales', {
      summaryFlag: { operator: 'eq', values: ['Potential', 'Review'] },
    });
    expect(query).toBe('columnFilter=summaryFlags~EQ~Potential%3BReview%3B');
  });

  test('serializes summary flag not-contains filters with the NTL operator and semicolons', () => {
    const query = buildColumnFilterQuery('sales', {
      summaryFlag: { operator: 'notContains', values: ['Potential', 'Review'] },
    });
    expect(query).toBe('columnFilter=summaryFlags~NTL~Potential%3BReview');
  });

  test('builds numeric comparisons', () => {
    const query = buildColumnFilterQuery('sales', { salePrice: { mode: '>=', min: 250000 } });
    expect(query).toBe('columnFilter=salesPrice~GTE~250000');
  });

  test('formats date ranges as dd/MM/yyyy', () => {
    const query = buildColumnFilterQuery('sales', {
      assignedDate: { from: '2026-02-01', to: '2026-02-03' },
    });
    expect(query).toBe('columnFilter=assignedDate~between~01%2F02%2F2026~03%2F02%2F2026');
  });

  test('maps task completed date filter field names for date ranges', () => {
    const query = buildColumnFilterQuery('sales', {
      taskcompleteddate: { from: '2026-02-06', to: '2026-02-10' },
    });
    expect(query).toBe('columnFilter=taskCompletedDate~between~06%2F02%2F2026~10%2F02%2F2026');
  });

  test('handles numeric between with only min or max', () => {
    const minOnly = buildColumnFilterQuery('sales', { salePrice: { mode: 'between', min: 100 } });
    const maxOnly = buildColumnFilterQuery('sales', { salePrice: { mode: 'between', max: 200 } });
    expect(minOnly).toBe('columnFilter=salesPrice~GTE~100');
    expect(maxOnly).toBe('columnFilter=salesPrice~LTE~200');
  });

  test('handles date range with only from date as open-ended lower bound', () => {
    const query = buildColumnFilterQuery('sales', {
      assignedDate: { from: '2026-02-01' },
    });
    expect(query).toBe('columnFilter=assignedDate~GTE~01%2F02%2F2026');
  });

  test('handles date range with only to date as open-ended upper bound', () => {
    const query = buildColumnFilterQuery('sales', {
      qcCompletedDate: { to: '2026-02-06' },
    });
    expect(query).toBe('columnFilter=qcCompletedDate~LTE~06%2F02%2F2026');
  });

  test('drops empty array filters', () => {
    const query = buildColumnFilterQuery('sales', { taskStatus: [' ', ''] });
    expect(query).toBe('');
  });

  test('appends sort marker', () => {
    const query = buildColumnFilterQuery('sales', { address: 'High' }, { name: 'saleId', sortDirection: 1 });
    expect(query).toBe('columnFilter=address~like~High&columnFilter=saleId~SORT~DESC');
  });

  test('returns sort marker when only sort is provided', () => {
    const query = buildColumnFilterQuery('sales', {}, { name: 'saleId', sortDirection: 0 });
    expect(query).toBe('columnFilter=saleId~SORT~ASC');
  });

  test('normalizes sort field names for sort marker', () => {
    const query = buildColumnFilterQuery('sales', {}, { name: 'Sale Id', sortDirection: 1 });
    expect(query).toBe('columnFilter=saleId~SORT~DESC');
  });

  test('normalizes task sort field to taskName for sort marker', () => {
    const query = buildColumnFilterQuery('sales', {}, { name: 'taskId', sortDirection: 0 });
    expect(query).toBe('columnFilter=taskName~SORT~ASC');
  });
});
