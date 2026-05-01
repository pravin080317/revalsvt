export type SearchByOption =
  | 'taskId'
  | 'uprn'
  | 'address'
  | 'postcode'
  | 'manualCheck'
  | 'street'
  | 'town'
  | 'source'
  | 'saleId'
  | 'billingAuthority'
  | 'transactionDate'
  | 'salePrice'
  | 'ratio'
  | 'dwellingType'
  | 'flaggedForReview'
  | 'reviewFlags'
  | 'outlierKeySale'
  | 'outlierRatio'
  | 'overallFlag'
  | 'summaryFlag'
  | 'taskStatus'
  | 'assignedTo'
  | 'assignedDate'
  | 'taskCompletedDate'
  | 'qcAssignedTo'
  | 'qcAssignedDate'
  | 'qcCompletedDate';

export type ManualCheckFilter = 'all' | 'yes' | 'no';

export type NumericFilterMode = '>=' | '<=' | 'between';

export interface NumericFilter {
  mode: NumericFilterMode;
  min?: number;
  max?: number;
}

export interface DateRangeFilter {
  from?: string;
  to?: string;
}

export interface GridFilterState {
  searchBy: SearchByOption;
  uprn?: string;
  taskId?: string;
  saleId?: string;
  address?: string;
  buildingNameNumber?: string;
  street?: string;
  townCity?: string;
  postcode?: string;
  billingAuthority?: string[];
  manualCheck?: ManualCheckFilter;
  transactionDate?: DateRangeFilter;
  salePrice?: NumericFilter;
  ratio?: NumericFilter;
  dwellingType?: string[];
  flaggedForReview?: 'true' | 'false';
  reviewFlags?: string[];
  outlierKeySale?: string[];
  outlierRatio?: NumericFilter;
  overallFlag?: string[];
  summaryFlag?: string | {
    operator: 'contains' | 'notContains' | 'eq';
    values: string[];
  };
  taskStatus?: string[];
  assignedTo?: string;
  assignedDate?: DateRangeFilter;
  taskCompletedDate?: DateRangeFilter;
  qcAssignedTo?: string;
  qcAssignedDate?: DateRangeFilter;
  qcCompletedDate?: DateRangeFilter;
  source?: string;
  bacode?: string;
}

export const createDefaultGridFilters = (): GridFilterState => ({
  searchBy: 'taskId',
});

const UK_POSTCODE_FULL_REGEX = /^(GIR0AA|(?:[A-Z][0-9]{1,2}|[A-Z][A-HJ-Y][0-9]{1,2}|[A-Z][0-9][A-Z]|[A-Z][A-HJ-Y][0-9]?[A-Z])[0-9][A-Z]{2})$/;
const UK_POSTCODE_OUTWARD_REGEX = /^(?:[A-Z][0-9]{1,2}|[A-Z][A-HJ-Y][0-9]{1,2}|[A-Z][0-9][A-Z]|[A-Z][A-HJ-Y][0-9]?[A-Z])$/;

export const normalizeUkPostcode = (value: string): string =>
  value.toUpperCase().trim();

export const isValidUkPostcode = (value: string, allowPartial = false): boolean => {
  const normalized = normalizeUkPostcode(value).replace(/\s+/g, '');
  if (!normalized) return false;
  if (allowPartial && normalized.length <= 4) {
    return UK_POSTCODE_OUTWARD_REGEX.test(normalized);
  }
  return UK_POSTCODE_FULL_REGEX.test(normalized);
};

const sanitizeNumericFilter = (value?: NumericFilter): NumericFilter | undefined => {
  if (!value) return undefined;

  const mode = value.mode ?? '>=';
  const min = value.min !== undefined && !Number.isNaN(value.min) ? value.min : undefined;
  const max = value.max !== undefined && !Number.isNaN(value.max) ? value.max : undefined;

  if (mode === 'between' && min === undefined && max === undefined) return undefined;
  if (mode === '>=' && min === undefined) return undefined;
  if (mode === '<=' && max === undefined) return undefined;

  return { mode, min, max };
};

const sanitizeStringArray = (values?: string[]): string[] | undefined => {
  if (!values || values.length === 0) return undefined;
  const trimmed = values.map((v) => v.trim()).filter((v) => v.length > 0);
  return trimmed.length > 0 ? trimmed : undefined;
};

const sanitizeSummaryFlagValue = (
  summaryFlag: GridFilterState['summaryFlag'],
): GridFilterState['summaryFlag'] | undefined => {
  if (!summaryFlag) {
    return undefined;
  }

  if (typeof summaryFlag === 'object' && !Array.isArray(summaryFlag)) {
    if (Array.isArray(summaryFlag.values) && summaryFlag.values.length > 0) {
      return summaryFlag;
    }
    return undefined;
  }

  if (typeof summaryFlag === 'string') {
    const trimmed = summaryFlag.trim();
    return trimmed.length >= 3 ? trimmed : undefined;
  }

  return undefined;
};

export const sanitizeFilters = (filters: GridFilterState): GridFilterState => {
  const sanitized: GridFilterState = {
    searchBy: filters.searchBy,
  };

  type StringFilterKey =
    | 'taskId'
    | 'saleId'
    | 'address'
    | 'buildingNameNumber'
    | 'street'
    | 'townCity'
    | 'source'
    | 'assignedTo'
    | 'qcAssignedTo'
    | 'bacode';
  type DateRangeFilterKey = 'assignedDate' | 'taskCompletedDate' | 'qcAssignedDate' | 'qcCompletedDate';

  const trimToUndefined = (value?: string, minLength = 1): string | undefined => {
    const trimmed = (value ?? '').trim();
    return trimmed.length >= minLength ? trimmed : undefined;
  };

  const sanitizeDateRange = (value?: DateRangeFilter, preserveEmptyBounds = false): DateRangeFilter | undefined => {
    if (!value) return undefined;
    const rawFrom = value.from?.trim() ?? undefined;
    const rawTo = value.to?.trim() ?? undefined;
    const from = preserveEmptyBounds ? rawFrom : trimToUndefined(rawFrom);
    const to = preserveEmptyBounds ? rawTo : trimToUndefined(rawTo);
    return from || to ? { from, to } : undefined;
  };

  const applySanitizedStringField = (
    targetKey: StringFilterKey,
    sourceValue?: string,
    minLength = 1,
  ): void => {
    const next = trimToUndefined(sourceValue, minLength);
    if (next) {
      sanitized[targetKey] = next;
    }
  };

  if (filters.uprn) {
    const digits = filters.uprn.replace(/\D/g, '');
    sanitized.uprn = digits.length > 0 ? digits : undefined;
  }

  applySanitizedStringField('taskId', filters.taskId);
  applySanitizedStringField('saleId', filters.saleId);

  if (filters.postcode) {
    const trimmed = normalizeUkPostcode(filters.postcode);
    sanitized.postcode = trimmed.length >= 2 ? trimmed : undefined;
  }

  applySanitizedStringField('address', filters.address, 3);

  const basicStringFields: Array<[StringFilterKey, string | undefined]> = [
    ['buildingNameNumber', filters.buildingNameNumber],
    ['street', filters.street],
    ['townCity', filters.townCity],
    ['source', filters.source],
    ['assignedTo', filters.assignedTo],
    ['qcAssignedTo', filters.qcAssignedTo],
    ['bacode', filters.bacode],
  ];
  basicStringFields.forEach(([key, value]) => applySanitizedStringField(key, value));

  if (filters.manualCheck) sanitized.manualCheck = filters.manualCheck;

  if (filters.billingAuthority?.length) {
    const trimmed = filters.billingAuthority.map((b) => b.trim()).filter((b) => b.length > 0);
    if (trimmed.length > 0) sanitized.billingAuthority = trimmed.slice(0, 3);
  }

  const transactionDate = sanitizeDateRange(filters.transactionDate);
  if (transactionDate) sanitized.transactionDate = transactionDate;

  const salePrice = sanitizeNumericFilter(filters.salePrice);
  if (salePrice) sanitized.salePrice = salePrice;

  const ratio = sanitizeNumericFilter(filters.ratio);
  if (ratio) sanitized.ratio = ratio;

  const outlierRatio = sanitizeNumericFilter(filters.outlierRatio);
  if (outlierRatio) sanitized.outlierRatio = outlierRatio;

  const dwellingType = sanitizeStringArray(filters.dwellingType);
  if (dwellingType) sanitized.dwellingType = dwellingType;

  if (filters.flaggedForReview) sanitized.flaggedForReview = filters.flaggedForReview;

  const reviewFlags = sanitizeStringArray(filters.reviewFlags);
  if (reviewFlags) sanitized.reviewFlags = reviewFlags;

  const outlierKeySale = sanitizeStringArray(filters.outlierKeySale);
  if (outlierKeySale) sanitized.outlierKeySale = outlierKeySale;

  const overallFlag = sanitizeStringArray(filters.overallFlag);
  if (overallFlag) sanitized.overallFlag = overallFlag;

  const summaryFlag = sanitizeSummaryFlagValue(filters.summaryFlag);
  if (summaryFlag) {
    sanitized.summaryFlag = summaryFlag;
  }

  const taskStatus = sanitizeStringArray(filters.taskStatus);
  if (taskStatus) sanitized.taskStatus = taskStatus;

  const dateRangeFields: Array<[DateRangeFilterKey, DateRangeFilter | undefined]> = [
    ['assignedDate', filters.assignedDate],
    ['taskCompletedDate', filters.taskCompletedDate],
    ['qcAssignedDate', filters.qcAssignedDate],
    ['qcCompletedDate', filters.qcCompletedDate],
  ];
  dateRangeFields.forEach(([key, value]) => {
    const range = sanitizeDateRange(value, true);
    if (range) {
      sanitized[key] = range;
    }
  });

  return sanitized;
};
