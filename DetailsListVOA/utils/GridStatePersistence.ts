import { type DateRangeFilter, type NumericFilter } from '../Filters';
import { getColumnFilterConfigFor, isLookupFieldFor } from '../config/TableConfigs';
import { type ClientSortState } from './GridDataParams';

interface SummaryFlagFilterValue {
  operator: 'contains' | 'notContains' | 'eq';
  values: string[];
}

export type ColumnFilterValue = string | string[] | NumericFilter | DateRangeFilter | SummaryFlagFilterValue;

type PersistedColumnFilters = Record<string, string[]>;

const normalizeStoredStrings = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean' ? String(entry).trim() : ''))
      .filter((entry) => entry !== '');
  }

  const single = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
    ? String(value).trim()
    : '';
  return single ? [single] : [];
};

const parseStoredJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const restoreNumericFilter = (raw: string): NumericFilter | undefined => {
  const parsed = parseStoredJson(raw);
  if (!parsed || typeof parsed !== 'object') return undefined;

  const candidate = parsed as Partial<NumericFilter>;
  const mode = candidate.mode;
  if (mode !== '>=' && mode !== '<=' && mode !== 'between') return undefined;

  const min = toNumber(candidate.min);
  const max = toNumber(candidate.max);
  if (mode === 'between') {
    if (min === undefined && max === undefined) return undefined;
    return { mode, min, max };
  }
  if (mode === '>=') {
    return min === undefined ? undefined : { mode, min };
  }
  return max === undefined ? undefined : { mode, max };
};

const restoreDateRangeFilter = (raw: string): DateRangeFilter | undefined => {
  const parsed = parseStoredJson(raw);
  if (!parsed || typeof parsed !== 'object') return undefined;

  const candidate = parsed as Partial<DateRangeFilter>;
  const from = typeof candidate.from === 'string' && candidate.from.trim() ? candidate.from.trim() : undefined;
  const to = typeof candidate.to === 'string' && candidate.to.trim() ? candidate.to.trim() : undefined;
  return from || to ? { from, to } : undefined;
};

const isSummaryFlagKey = (normalizedKey: string): boolean =>
  normalizedKey === 'summaryflag' || normalizedKey === 'summaryflags';

const restoreSummaryFlagFilter = (raw: string): SummaryFlagFilterValue | undefined => {
  const parsed = parseStoredJson(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return undefined;

  const candidate = parsed as { operator?: unknown; values?: unknown };
  const operator = candidate.operator;
  const values = normalizeStoredStrings(candidate.values);
  if (operator !== 'contains' && operator !== 'notContains' && operator !== 'eq') return undefined;
  if (values.length === 0) return undefined;
  return { operator, values };
};

export const serializeColumnFiltersForStorage = (
  filters: Record<string, ColumnFilterValue>,
): PersistedColumnFilters => {
  const out: PersistedColumnFilters = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      const values = normalizeStoredStrings(value);
      if (values.length > 0) out[key] = values;
      return;
    }

    if (typeof value === 'string') {
      if (value !== '') out[key] = [value];
      return;
    }

    out[key] = [JSON.stringify(value)];
  });

  return out;
};

const restoreStoredColumnFilterValue = (
  tableKey: string,
  normalizedKey: string,
  storedValues: string[],
): ColumnFilterValue | undefined => {
  const cfg = getColumnFilterConfigFor(tableKey, normalizedKey);

  if (cfg?.control === 'multiSelect') {
    if (isSummaryFlagKey(normalizedKey) && storedValues.length === 1) {
      const restoredSummaryFlag = restoreSummaryFlagFilter(storedValues[0]);
      if (restoredSummaryFlag) {
        return restoredSummaryFlag;
      }
    }
    return storedValues.length > 0 ? storedValues : undefined;
  }

  if (cfg?.control === 'numeric') {
    return storedValues[0] ? restoreNumericFilter(storedValues[0]) : undefined;
  }

  if (cfg?.control === 'dateRange') {
    return storedValues[0] ? restoreDateRangeFilter(storedValues[0]) : undefined;
  }

  if (storedValues.length === 0) {
    return undefined;
  }

  if (
    cfg?.control === 'singleSelect'
    || cfg?.control === 'textEq'
    || cfg?.control === 'textContains'
    || cfg?.control === 'textPrefix'
  ) {
    return storedValues[0];
  }

  return isLookupFieldFor(tableKey, normalizedKey) ? storedValues : storedValues[0];
};

const parsePersistedColumnFilters = (
  raw: string | PersistedColumnFilters | null | undefined,
): Record<string, unknown> | undefined => {
  if (!raw) return undefined;

  const parsedStore = typeof raw === 'string' ? parseStoredJson(raw) : raw;
  if (!parsedStore || typeof parsedStore !== 'object') return undefined;

  return parsedStore as Record<string, unknown>;
};

const restoreStoredColumnFilterEntry = (
  tableKey: string,
  key: string,
  value: unknown,
): { normalizedKey: string; restored: ColumnFilterValue } | undefined => {
  const normalizedKey = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const storedValues = normalizeStoredStrings(value);
  const restored = restoreStoredColumnFilterValue(tableKey, normalizedKey, storedValues);
  if (restored === undefined) return undefined;
  return { normalizedKey, restored };
};

export const deserializeColumnFiltersFromStorage = (
  tableKey: string,
  raw: string | PersistedColumnFilters | null | undefined,
): Record<string, ColumnFilterValue> => {
  const parsedStore = parsePersistedColumnFilters(raw);
  if (!parsedStore) return {};

  const out: Record<string, ColumnFilterValue> = {};
  Object.entries(parsedStore).forEach(([key, value]) => {
    const entry = restoreStoredColumnFilterEntry(tableKey, key, value);
    if (!entry) return;
    out[entry.normalizedKey] = entry.restored;
  });

  return out;
};

export const parseStoredSortState = (raw: string | null | undefined): ClientSortState | undefined => {
  if (!raw) return undefined;

  const parsed = parseStoredJson(raw);
  if (!parsed || typeof parsed !== 'object') return undefined;

  const candidate = parsed as Partial<ClientSortState>;
  const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
  const sortDirection = candidate.sortDirection;
  if (!name || (sortDirection !== 0 && sortDirection !== 1)) return undefined;
  return { name, sortDirection };
};

export const shouldPersistSortState = (
  clientSort: ClientSortState | undefined,
  userSortActive: boolean,
): clientSort is ClientSortState =>
  !!clientSort && !!clientSort.name?.trim() && userSortActive && (clientSort.sortDirection === 0 || clientSort.sortDirection === 1);
