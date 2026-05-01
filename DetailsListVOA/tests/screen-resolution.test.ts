import { normalizeTableKey, resolveScreenConfig, toKnownTableKey } from '../utils/ScreenResolution';
import { buildPrefilterStorageKey } from '../utils/ScreenBehavior';

describe('table key helpers', () => {
  test('toKnownTableKey normalizes valid keys and rejects unknown values', () => {
    expect(toKnownTableKey(' QAASSIGN ')).toBe('qaassign');
    expect(toKnownTableKey('manager')).toBe('manager');
    expect(toKnownTableKey('')).toBeUndefined();
    expect(toKnownTableKey(undefined)).toBeUndefined();
    expect(toKnownTableKey('not-a-table')).toBeUndefined();
  });

  test('normalizeTableKey falls back to sales for invalid values', () => {
    expect(normalizeTableKey('qaview')).toBe('qaview');
    expect(normalizeTableKey('invalid')).toBe('sales');
  });
});

describe('resolveScreenConfig', () => {
  test('resolves direct screen names to expected configs', () => {
    const cases = [
      { name: 'SalesRecordSearch', kind: 'salesSearch', tableKey: 'sales', source: 'SRS' },
      { name: 'ManagerAssignment', kind: 'managerAssign', tableKey: 'manager', source: 'MA' },
      { name: 'CaseworkerView', kind: 'caseworkerView', tableKey: 'myassignment', source: 'CWV' },
      { name: 'QualityControlAssignment', kind: 'qcAssign', tableKey: 'qaassign', source: 'QCA' },
      { name: 'QualityControlView', kind: 'qcView', tableKey: 'qaview', source: 'QCV' },
    ];

    for (const c of cases) {
      const resolved = resolveScreenConfig(c.name, undefined, 'sales');
      expect(resolved.kind).toBe(c.kind);
      expect(resolved.tableKey).toBe(c.tableKey);
      expect(resolved.sourceCode).toBe(c.source);
    }
  });

  test('uses token matching for assignment screens', () => {
    const resolved = resolveScreenConfig('SVT Manager Assignment Screen', undefined, 'sales');
    expect(resolved.kind).toBe('managerAssign');
    expect(resolved.tableKey).toBe('manager');
    expect(resolved.sourceCode).toBe('MA');
  });

  test('uses token matching for generic quality control assignment screens', () => {
    const resolved = resolveScreenConfig('Quality Workspace Assignment', undefined, 'sales');
    expect(resolved.kind).toBe('qcAssign');
    expect(resolved.tableKey).toBe('qaassign');
    expect(resolved.sourceCode).toBe('QCA');
  });

  test('uses token matching for caseworker, qc view, and sales search screens', () => {
    expect(resolveScreenConfig('Caseworker Dashboard', undefined, 'sales')).toEqual(
      expect.objectContaining({ kind: 'caseworkerView', tableKey: 'myassignment', sourceCode: 'CWV' }),
    );
    expect(resolveScreenConfig('Quality Control Workspace', undefined, 'sales')).toEqual(
      expect.objectContaining({ kind: 'qcView', tableKey: 'qaview', sourceCode: 'QCV' }),
    );
    expect(resolveScreenConfig('Sales Record Search Workspace', undefined, 'manager')).toEqual(
      expect.objectContaining({ kind: 'salesSearch', tableKey: 'sales', sourceCode: 'SRS' }),
    );
    expect(resolveScreenConfig('RecordSearch', undefined, 'manager')).toEqual(
      expect.objectContaining({ kind: 'salesSearch', tableKey: 'sales', sourceCode: 'SRS' }),
    );
  });

  test('falls back to explicit tableKey when screen name is unknown', () => {
    const resolved = resolveScreenConfig('Unknown Screen', 'qaassign', 'sales');
    expect(resolved.kind).toBe('qcAssign');
    expect(resolved.tableKey).toBe('qaassign');
    expect(resolved.sourceCode).toBe('QCA');
  });

  test('falls back to fallback table key when screen name and explicit table key are unknown', () => {
    const resolved = resolveScreenConfig('Unknown Screen', undefined, 'allsales');
    expect(resolved.kind).toBe('salesSearch');
    expect(resolved.tableKey).toBe('allsales');
    expect(resolved.profileKey).toBe('allsales');
    expect(resolved.sourceCode).toBe('SRS');
  });

  test('prefilter storage key is stable across screen name variants', () => {
    const a = resolveScreenConfig('Quality Control Assignment', undefined, 'sales');
    const b = resolveScreenConfig('QC Assignment Screen', undefined, 'sales');

    const keyA = buildPrefilterStorageKey(a.tableKey, a.kind);
    const keyB = buildPrefilterStorageKey(b.tableKey, b.kind);

    expect(keyA).toBe(keyB);
  });
});
