import { type NumericFilter, type DateRangeFilter } from '../Filters';
import { getColumnFilterConfigFor, type TableKey } from '../config/TableConfigs';
import { COLUMN_FILTER_CONDITION_SEPARATOR, COLUMN_FILTER_VALUE_SEPARATOR } from '../config/PrefilterConfigs';

interface SummaryFlagFilterValue {
  operator: 'contains' | 'notContains' | 'eq';
  values: string[];
}

export type ColumnFilterValue = string | string[] | NumericFilter | DateRangeFilter | SummaryFlagFilterValue;

const COLUMN_FILTER_FIELD_MAP: Record<string, string> = {
  saleid: 'saleId',
  taskid: 'taskName',
  uprn: 'uprn',
  address: 'address',
  postcode: 'postCode',
  billingauthority: 'billingAuthority',
  transactiondate: 'transactionDate',
  saleprice: 'salesPrice',
  salesprice: 'salesPrice',
  ratio: 'ratio',
  dwellingtype: 'dwellingType',
  flaggedforreview: 'flaggedForReview',
  reviewflags: 'reviewFlag',
  outlierratio: 'outlierRatio',
  overallflag: 'overallFlag',
  summaryflag: 'summaryFlags',
  summaryflags: 'summaryFlags',
  taskstatus: 'taskStatus',
  assignedto: 'assignedTo',
  assigneddate: 'assignedDate',
  taskcompleteddate: 'taskCompletedDate',
  qcassignedto: 'qcAssignedTo',
  qcassigneddate: 'qcAssignedDate',
  qccompleteddate: 'qcCompletedDate',
};

export const normalizeColumnFilterFieldName = (field: string): string => {
  const normalized = field.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return COLUMN_FILTER_FIELD_MAP[normalized] ?? field;
};

const isNumericFilterValue = (val: ColumnFilterValue): val is NumericFilter =>
  !!val && typeof val === 'object' && 'mode' in (val as NumericFilter);

const isDateRangeFilterValue = (val: ColumnFilterValue): val is DateRangeFilter =>
  !!val && typeof val === 'object' && ('from' in (val as DateRangeFilter) || 'to' in (val as DateRangeFilter));

const isSummaryFlagFilterValue = (val: ColumnFilterValue): val is SummaryFlagFilterValue =>
  !!val && typeof val === 'object' && 'operator' in val && 'values' in val;

const formatApiDate = (value?: string): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }
  const ukMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (ukMatch) {
    return trimmed;
  }
  return trimmed;
};

const normalizeFlaggedForReviewToken = (raw: string): string => {
  const cleaned = raw.trim().toLowerCase();
  if (cleaned === 'true' || cleaned === 'yes' || cleaned === 'y') return 'Y';
  if (cleaned === 'false' || cleaned === 'no' || cleaned === 'n') return 'N';
  return raw.trim();
};

const buildScalarFilterTokens = (
  apiField: string,
  normalizedField: string,
  control: string,
  value: string,
): string[] | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const normalizedValue = normalizedField === 'flaggedforreview'
    ? normalizeFlaggedForReviewToken(trimmed)
    : trimmed;
  const operator = control === 'singleSelect' ? 'eq' : 'like';
  return [apiField, operator, normalizedValue];
};

const buildMultiFilterTokens = (
  apiField: string,
  normalizedField: string,
  values: string[],
): string[] | undefined => {
  const normalizedValues = values
    .map((entry) => String(entry ?? '').trim())
    .filter((entry) => entry !== '')
    .map((entry) => (normalizedField === 'flaggedforreview' ? normalizeFlaggedForReviewToken(entry) : entry));
  if (normalizedValues.length === 0) return undefined;

  const serializedValue = normalizedField === 'reviewflags'
    ? `${normalizedValues.join(';')};`
    : normalizedValues.join(COLUMN_FILTER_VALUE_SEPARATOR);
  return [apiField, 'in', serializedValue];
};

const buildSummaryFlagTokens = (apiField: string, value: SummaryFlagFilterValue): string[] | undefined => {
  const values = value.values
    .map((entry) => String(entry ?? '').trim())
    .filter((entry) => entry !== '');
  if (values.length === 0) return undefined;

  const operator = value.operator === 'notContains'
    ? 'NTL'
    : value.operator === 'eq'
      ? 'EQ'
      : 'like';
  const serializedValue = value.operator === 'eq'
    ? `${values.join(';')};`
    : values.join(';');
  return serializedValue ? [apiField, operator, serializedValue] : undefined;
};

const buildNumericTokens = (apiField: string, value: NumericFilter): string[] | undefined => {
  const { mode, min, max } = value;
  if (mode === '>=' && min !== undefined && min !== null) {
    return [apiField, 'GTE', String(min)];
  }
  if (mode === '<=' && max !== undefined && max !== null) {
    return [apiField, 'LTE', String(max)];
  }
  if (mode === 'between') {
    if (min !== undefined && min !== null && max !== undefined && max !== null) {
      return [apiField, 'between', String(min), String(max)];
    }
    if (min !== undefined && min !== null) {
      return [apiField, 'GTE', String(min)];
    }
    if (max !== undefined && max !== null) {
      return [apiField, 'LTE', String(max)];
    }
  }
  return undefined;
};

const buildDateRangeTokens = (apiField: string, value: DateRangeFilter): string[] | undefined => {
  const from = value.from?.trim();
  const to = value.to?.trim();
  const formattedFrom = from && from.length > 0 ? formatApiDate(from) : undefined;
  const formattedTo = to && to.length > 0 ? formatApiDate(to) : undefined;
  if (formattedFrom && formattedTo) {
    return [apiField, 'between', formattedFrom, formattedTo];
  }
  if (formattedFrom) {
    return [apiField, 'GTE', formattedFrom];
  }
  if (formattedTo) {
    return [apiField, 'LTE', formattedTo];
  }
  return undefined;
};

export const buildColumnFilterTokens = (
  tableKey: TableKey,
  field: string,
  value: ColumnFilterValue,
): string[] | undefined => {
  const cfg = getColumnFilterConfigFor(tableKey, field);
  if (!cfg) return undefined;
  const apiField = normalizeColumnFilterFieldName(field);
  const normalizedField = field.replace(/[^a-z0-9]/gi, '').toLowerCase();

  if (typeof value === 'string') {
    return buildScalarFilterTokens(apiField, normalizedField, cfg.control, value);
  }

  if (Array.isArray(value)) {
    return buildMultiFilterTokens(apiField, normalizedField, value);
  }

  if ((normalizedField === 'summaryflag' || normalizedField === 'summaryflags') && isSummaryFlagFilterValue(value)) {
    return buildSummaryFlagTokens(apiField, value);
  }

  if (cfg.control === 'numeric' && isNumericFilterValue(value)) {
    return buildNumericTokens(apiField, value);
  }

  if (cfg.control === 'dateRange' && isDateRangeFilterValue(value)) {
    return buildDateRangeTokens(apiField, value);
  }

  return undefined;
};

export const buildColumnFilterSortMarker = (sort?: { name?: string; sortDirection?: number }): string | undefined => {
  if (!sort?.name) return undefined;
  const normalizedField = normalizeColumnFilterFieldName(sort.name);
  if (!normalizedField) return undefined;
  const direction = sort.sortDirection === 1 ? 'DESC' : 'ASC';
  const encodedField = encodeURIComponent(normalizedField);
  return `columnFilter=${encodedField}~SORT~${direction}`;
};

export const buildColumnFilterQuery = (
  tableKey: TableKey,
  filters: Record<string, ColumnFilterValue>,
  sort?: { name?: string; sortDirection?: number },
): string => {
  const entries = Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b));

  const expressions = entries
    .map(([field, value]) => buildColumnFilterTokens(tableKey, field, value))
    .filter((tokens): tokens is string[] => !!tokens && tokens.length > 0)
    .map((tokens) => {
      const encoded = tokens.map((token) => encodeURIComponent(token));
      return `columnFilter=${encoded.join(COLUMN_FILTER_CONDITION_SEPARATOR)}`;
    });

  const sortMarker = buildColumnFilterSortMarker(sort);
  if (expressions.length === 0) {
    return sortMarker ?? '';
  }
  return sortMarker ? `${expressions.join('&')}&${sortMarker}` : expressions.join('&');
};
