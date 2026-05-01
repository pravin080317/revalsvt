import { type NumericFilter, type DateRangeFilter } from '../Filters';
import { getColumnFilterConfigFor } from '../config/TableConfigs';

export interface SummaryFlagFilter {
  operator: 'contains' | 'notContains' | 'eq';
  values: string[];
}

export type ColumnFilterValue = string | string[] | NumericFilter | DateRangeFilter | SummaryFlagFilter;

const GUID_LIKE_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MONTH_MAP: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

const toDateKey = (value?: string): number | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/.exec(trimmed);
  if (isoMatch) {
    return Number(`${isoMatch[1]}${isoMatch[2]}${isoMatch[3]}`);
  }
  const ukMatch = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[T\s].*)?$/.exec(trimmed);
  if (ukMatch) {
    const day = ukMatch[1].padStart(2, '0');
    const month = ukMatch[2].padStart(2, '0');
    return Number(`${ukMatch[3]}${month}${day}`);
  }
  const ukMonthMatch = /^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})/.exec(trimmed);
  if (ukMonthMatch) {
    const day = ukMonthMatch[1].padStart(2, '0');
    const monthKey = ukMonthMatch[2].slice(0, 3).toLowerCase();
    const month = MONTH_MAP[monthKey];
    if (month) {
      return Number(`${ukMonthMatch[3]}${String(month).padStart(2, '0')}${day}`);
    }
  }
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return Number(`${year}${month}${day}`);
  }
  return undefined;
};

const nowMs = (): number => {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
};

const normalizeNumericText = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  let cleaned = trimmed.replace(/[£$€\s]/g, '');
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');
  if (hasComma && !hasDot && /^-?\d+,\d+$/.test(cleaned)) {
    cleaned = cleaned.replace(',', '.');
  } else if (hasComma) {
    cleaned = cleaned.replace(/,/g, '');
  }
  return cleaned;
};

const toNumericValue = (raw: unknown, fallbackText: string): number | undefined => {
  if (typeof raw === 'number') return Number.isNaN(raw) ? undefined : raw;
  const text = typeof raw === 'string' ? raw : fallbackText;
  const normalized = normalizeNumericText(text);
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const toTokenText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
};

const normalizeToken = (value: unknown): string => toTokenText(value).trim().toLowerCase();

const splitTokens = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeToken(entry))
      .filter((entry) => entry !== '');
  }
  const text = toTokenText(value).trim();
  if (!text) return [];
  return text
    .split(/[;,]/)
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry !== '');
};

const isGuidLike = (value: string): boolean => GUID_LIKE_REGEX.test(value.trim());

const resolveUserIdFieldCandidates = (fieldName: string): string[] => {
  const normalizedField = fieldName.replace(/[^a-z0-9]/gi, '').toLowerCase();
  if (normalizedField === 'assignedto') {
    return [
      'assignedtoid',
      'assignedToId',
      'assignedtouserid',
      'assignedToUserId',
      'caseworkerassignedtoid',
      'caseworkerAssignedToId',
      'caseworkerassignedtouserid',
      'caseworkerAssignedToUserId',
    ];
  }
  if (normalizedField === 'qcassignedto') {
    return [
      'qcassignedtoid',
      'qcAssignedToId',
      'qcassignedtouserid',
      'qcAssignedToUserId',
    ];
  }
  return [];
};

const isActiveFilterValue = (value: ColumnFilterValue): boolean => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim() !== '';
  if ((value as NumericFilter).mode !== undefined) {
    const num = value as NumericFilter;
    if (num.mode === 'between') return num.min !== undefined || num.max !== undefined;
    if (num.mode === '>=') return num.min !== undefined;
    if (num.mode === '<=') return num.max !== undefined;
    return false;
  }
  if ((value as DateRangeFilter).from !== undefined || (value as DateRangeFilter).to !== undefined) {
    return true;
  }
  if (typeof value === 'object' && value !== null && 'values' in value && 'operator' in value) {
    return Array.isArray(value.values) && value.values.length > 0;
  }
  return false;
};

export const getActiveColumnFilters = (
  filters: Record<string, ColumnFilterValue>,
): [string, ColumnFilterValue][] => Object.entries(filters).filter(([, value]) => value !== undefined && isActiveFilterValue(value));

const isSummaryFlagFilter = (fieldName: string, filterValue: ColumnFilterValue): filterValue is SummaryFlagFilter => {
  const normalizedField = fieldName.toLowerCase();
  if (normalizedField !== 'summaryflags' && normalizedField !== 'summaryflag') {
    return false;
  }

  return typeof filterValue === 'object'
    && filterValue !== null
    && !Array.isArray(filterValue)
    && 'values' in filterValue
    && 'operator' in filterValue;
};

const getMultiSelectOperator = (fieldName: string, filterValue: ColumnFilterValue): SummaryFlagFilter['operator'] =>
  isSummaryFlagFilter(fieldName, filterValue) ? filterValue.operator : 'contains';

const getMultiSelectValues = (fieldName: string, filterValue: ColumnFilterValue): string[] => {
  if (isSummaryFlagFilter(fieldName, filterValue)) {
    return filterValue.values;
  }
  return Array.isArray(filterValue) ? filterValue : [];
};

const matchesTextFilter = (textVal: string, filterValue: ColumnFilterValue, mode: 'eq' | 'prefix' | 'contains'): boolean => {
  if (typeof filterValue !== 'string') {
    return true;
  }

  const haystack = textVal.toLowerCase();
  const needle = filterValue.trim().toLowerCase();
  if (mode === 'prefix') {
    return haystack.startsWith(needle);
  }
  return haystack.includes(needle);
};

const matchesSingleSelectFilter = <T>(
  item: T,
  raw: unknown,
  textVal: string,
  fieldName: string,
  filterValue: ColumnFilterValue,
  getFieldValue: (item: T, field: string) => unknown,
): boolean => {
  if (typeof filterValue !== 'string') {
    return true;
  }

  const needle = normalizeToken(filterValue);
  if (!needle) {
    return true;
  }

  const textTokens = splitTokens(raw);
  if (textTokens.some((token) => token === needle) || textVal.toLowerCase() === needle) {
    return true;
  }

  if (!isGuidLike(needle)) {
    return false;
  }

  const idFieldCandidates = resolveUserIdFieldCandidates(fieldName);
  if (idFieldCandidates.length === 0) {
    return false;
  }

  return idFieldCandidates.some((candidate) => {
    const candidateTokens = splitTokens(getFieldValue(item, candidate));
    return candidateTokens.some((token) => token === needle);
  });
};

const matchesMultiSelectTokens = (
  hayTokens: string[],
  rawText: string,
  needles: string[],
  operator: SummaryFlagFilter['operator'],
): boolean => {
  if (operator === 'eq') {
    if (hayTokens.length > 0) {
      return needles.some((needle) => hayTokens.includes(needle));
    }
    return needles.some((needle) => rawText === needle);
  }

  if (hayTokens.length > 0) {
    return operator === 'contains'
      ? needles.some((needle) => hayTokens.includes(needle))
      : !needles.some((needle) => hayTokens.includes(needle));
  }

  return operator === 'contains'
    ? needles.some((needle) => rawText.includes(needle))
    : !needles.some((needle) => rawText.includes(needle));
};

const matchesMultiSelectFilter = (
  raw: unknown,
  textVal: string,
  fieldName: string,
  filterValue: ColumnFilterValue,
): boolean => {
  const values = getMultiSelectValues(fieldName, filterValue);
  if (values.length === 0) {
    return true;
  }

  const needles = values.map((value) => String(value).trim().toLowerCase());
  return matchesMultiSelectTokens(splitTokens(raw), textVal.toLowerCase(), needles, getMultiSelectOperator(fieldName, filterValue));
};

const matchesNumericFilter = (raw: unknown, textVal: string, filterValue: ColumnFilterValue): boolean => {
  const numFilter = filterValue as NumericFilter;
  const numericRaw = toNumericValue(raw, textVal);
  if (numericRaw === undefined) {
    return false;
  }
  if (numFilter.mode === 'between') {
    const minOk = numFilter.min !== undefined ? numericRaw >= numFilter.min : true;
    const maxOk = numFilter.max !== undefined ? numericRaw <= numFilter.max : true;
    return minOk && maxOk;
  }
  if (numFilter.mode === '>=') {
    return numFilter.min !== undefined ? numericRaw >= numFilter.min : true;
  }
  if (numFilter.mode === '<=') {
    return numFilter.max !== undefined ? numericRaw <= numFilter.max : true;
  }
  return true;
};

const matchesDateRangeFilter = (textVal: string, filterValue: ColumnFilterValue): boolean => {
  const dr = filterValue as DateRangeFilter;
  const rawKey = toDateKey(textVal);
  if (rawKey === undefined) {
    return false;
  }

  const fromKey = dr.from ? toDateKey(dr.from) : undefined;
  const toKey = dr.to ? toDateKey(dr.to) : undefined;
  if (fromKey !== undefined && rawKey < fromKey) return false;
  if (toKey !== undefined && rawKey > toKey) return false;
  return true;
};

const matchesConfiguredFilter = <T>(
  item: T,
  tableKey: string,
  fieldName: string,
  raw: unknown,
  textVal: string,
  filterValue: ColumnFilterValue,
  getFieldValue: (item: T, field: string) => unknown,
): boolean | undefined => {
  const cfg = getColumnFilterConfigFor(tableKey, fieldName);
  if (!cfg) {
    return undefined;
  }

  switch (cfg.control) {
    case 'textEq':
      return matchesTextFilter(textVal, filterValue, 'eq');
    case 'textPrefix':
      return matchesTextFilter(textVal, filterValue, 'prefix');
    case 'textContains':
      return matchesTextFilter(textVal, filterValue, 'contains');
    case 'singleSelect':
      return matchesSingleSelectFilter(item, raw, textVal, fieldName, filterValue, getFieldValue);
    case 'multiSelect':
      return matchesMultiSelectFilter(raw, textVal, fieldName, filterValue);
    case 'numeric':
      return matchesNumericFilter(raw, textVal, filterValue);
    case 'dateRange':
      return matchesDateRangeFilter(textVal, filterValue);
    default:
      return true;
  }
};

const toPrimitiveArrayTokens = (raw: unknown[]): string[] => raw
  .map((value) => (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value).trim().toLowerCase() : ''))
  .filter((value) => value !== '');

const matchesArrayFilter = (raw: unknown, filterValue: string[]): boolean => {
  const needles = filterValue.map((value) => String(value).trim().toLowerCase()).filter((value) => value !== '');
  if (needles.length === 0) {
    return true;
  }
  if (Array.isArray(raw)) {
    const haystack = toPrimitiveArrayTokens(raw);
    return needles.some((needle) => haystack.includes(needle));
  }
  return false;
};

const matchesFallbackFilter = (raw: unknown, textVal: string, filterValue: ColumnFilterValue): boolean => {
  if (Array.isArray(filterValue)) {
    if (Array.isArray(raw)) {
      return matchesArrayFilter(raw, filterValue);
    }
    const needles = filterValue.map((value) => String(value).trim().toLowerCase()).filter((value) => value !== '');
    if (needles.length === 0) {
      return true;
    }
    return needles.some((needle) => textVal.toLowerCase() === needle);
  }

  const needle = typeof filterValue === 'string' ? filterValue.trim().toLowerCase() : '';
  if (Array.isArray(raw)) {
    return raw.some((value) => (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') && String(value).toLowerCase().includes(needle));
  }
  return textVal.toLowerCase().includes(needle);
};

const matchesColumnFilter = <T>(
  item: T,
  tableKey: string,
  fieldName: string,
  filterValue: ColumnFilterValue,
  getFilterableText: (raw: unknown) => string,
  getFieldValue: (item: T, field: string) => unknown,
): boolean => {
  const raw = getFieldValue(item, fieldName);
  const textVal = getFilterableText(raw).trim();
  const configuredMatch = matchesConfiguredFilter(item, tableKey, fieldName, raw, textVal, filterValue, getFieldValue);
  if (configuredMatch !== undefined) {
    return configuredMatch;
  }
  return matchesFallbackFilter(raw, textVal, filterValue);
};

export const filterItemsByColumnFilters = <T>(
  items: T[],
  filters: Record<string, ColumnFilterValue>,
  tableKey: string,
  getFilterableText: (raw: unknown) => string,
  getFieldValue: (item: T, field: string) => unknown,
): T[] => {
  const t0 = nowMs();
  const filterEntries = getActiveColumnFilters(filters);
  if (filterEntries.length === 0) {
    const t1 = nowMs();
    console.log('[Grid Perf] Client filteredItems (no filters) (ms):', Math.round(t1 - t0), 'items:', items.length);
    return items;
  }
  const out = items.filter((item) => {
    return filterEntries.every(([fieldName, filterValue]) => matchesColumnFilter(
      item,
      tableKey,
      fieldName,
      filterValue,
      getFilterableText,
      getFieldValue,
    ));
  });
  const t1 = nowMs();
  console.log('[Grid Perf] Client filteredItems (ms):', Math.round(t1 - t0), 'items:', items.length, 'filters:', filterEntries.length, 'result:', out.length);
  return out;
};
