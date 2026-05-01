import { GridFilterState, NumericFilter, SearchByOption } from '../Filters';
import { mapManagerPrefiltersToApi, mapQcPrefiltersToApi, mapQcViewPrefiltersToApi, type ManagerPrefilterState } from './PrefilterConfigs';

export type TableKey = 'sales' | 'allsales' | 'myassignment' | 'manager' | 'qa' | 'qaassign' | 'qaview';

export type ColumnFilterControl =
  | 'textEq'
  | 'textContains'
  | 'textPrefix'
  | 'numeric'
  | 'dateRange'
  | 'singleSelect'
  | 'multiSelect';

export interface ColumnFilterOption {
  key: string;
  text: string;
}

export interface ColumnFilterConfig {
  control: ColumnFilterControl;
  minLength?: number;
  optionFields?: string[];
  options?: (string | ColumnFilterOption)[];
  selectAllValues?: string[];
  multiLimit?: number;
}

export interface TableConfig {
  lookupFields: Set<string>;
  buildApiParams: (filters: GridFilterState, page: number, pageSize: number) => Record<string, string>;
  buildPrefilterParams?: (prefilters?: unknown) => Record<string, string>;
  // Controls which top-of-grid search modes are available per persona/table
  searchByOptions: SearchByOption[];
  columnFilterConfig: Record<string, ColumnFilterConfig>;
  showViewSalesRecord?: boolean;
}

const salesLookupFields = new Set<string>([
  'taskstatus',
  'status',
  'statuscode',
  'saleid',
  'billingauthority',
  'flaggedforreview',
  'reviewflags',
  'overallflag',
  'dwellingtype',
  'assignedto',
  'qcassignedto',
  'summaryflag',
  'summaryflags',
]);

const SALES_COLUMN_FILTERS: Record<string, ColumnFilterConfig> = {
  saleid: { control: 'textEq', minLength: 1 },
  taskid: { control: 'textEq', minLength: 3 },
  uprn: { control: 'textEq', minLength: 1 },
  address: { control: 'textContains', minLength: 3 },
  postcode: { control: 'textPrefix', minLength: 2 },
  billingauthority: { control: 'multiSelect', optionFields: ['billingauthority'], multiLimit: 3, minLength: 1 },
  transactiondate: { control: 'dateRange', minLength: 1 },
  saleprice: { control: 'numeric', minLength: 1 },
  ratio: { control: 'numeric', minLength: 1 },
  dwellingtype: { control: 'multiSelect', optionFields: ['dwellingtype'], selectAllValues: ['ALL'], minLength: 1 },
  flaggedforreview: {
    control: 'singleSelect',
    options: [
      { key: 'true', text: 'Yes' },
      { key: 'false', text: 'No' },
    ],
    minLength: 1,
  },
  reviewflags: { control: 'multiSelect', optionFields: ['reviewflags'], selectAllValues: ['ALL'], minLength: 1 },
  outlierratio: { control: 'numeric', minLength: 1 },
  overallflag: {
    control: 'multiSelect',
    minLength: 1,
    selectAllValues: ['ALL'],
    options: [
      'Exclude',
      'Exclude potential false',
      'Investigate can use',
      'Investigate do not use',
      'No flag',
      'Not fully HPI adjusted',
      'Remove',
    ],
  },
  summaryflag: {
    control: 'multiSelect',
    optionFields: ['summaryflags', 'summaryflag'],
    multiLimit: 3,
    minLength: 1,
  },
  summaryflags: {
    control: 'multiSelect',
    optionFields: ['summaryflags', 'summaryflag'],
    multiLimit: 3,
    minLength: 1,
  },
  taskstatus: { control: 'multiSelect', optionFields: ['taskstatus', 'status', 'statuscode'], selectAllValues: ['ALL'], minLength: 1 },
  assignedto: { control: 'singleSelect', optionFields: ['assignedto'], minLength: 1 },
  assigneddate: { control: 'dateRange', minLength: 1 },
  taskcompleteddate: { control: 'dateRange', minLength: 1 },
  qcassignedto: { control: 'singleSelect', optionFields: ['qcassignedto'], minLength: 1 },
  qcassigneddate: { control: 'dateRange', minLength: 1 },
  qccompleteddate: { control: 'dateRange', minLength: 1 },
};

const applySingleDateParam = (
  params: Record<string, string>,
  paramKey: string,
  range?: { from?: string; to?: string },
): void => {
  if (!range) {
    return;
  }

  const from = range.from;
  const to = range.to;
  if (from && to && from === to) {
    params[paramKey] = from;
    return;
  }

  if (from && !to) {
    params[paramKey] = from;
    return;
  }

  if (to && !from) {
    params[paramKey] = to;
    return;
  }

  if (from) {
    params[paramKey] = from;
  }
};

const applyDateRangeParams = (
  params: Record<string, string>,
  range: { from?: string; to?: string } | undefined,
  fromParam: string,
  toParam: string,
): void => {
  if (!range) {
    return;
  }

  if (range.from) params[fromParam] = range.from;
  if (range.to) params[toParam] = range.to;
};

const applyOperatorNumericParam = (
  params: Record<string, string>,
  fieldValue: GridFilterState['salePrice'],
  valueParam: string,
  operatorParam: string,
): void => {
  if (!fieldValue) {
    return;
  }

  const { mode, min, max } = fieldValue;
  if (mode === '>=' && min !== undefined) {
    params[valueParam] = String(min);
    params[operatorParam] = 'GE';
    return;
  }

  if (mode === '<=' && max !== undefined) {
    params[valueParam] = String(max);
    params[operatorParam] = 'LE';
    return;
  }

  if (mode === 'between') {
    if (min !== undefined) {
      params[valueParam] = String(min);
      params[operatorParam] = 'GE';
      return;
    }

    if (max !== undefined) {
      params[valueParam] = String(max);
      params[operatorParam] = 'LE';
    }
  }
};

const applySimpleNumericParam = (
  params: Record<string, string>,
  fieldValue: NumericFilter | undefined,
  valueParam: string,
): void => {
  if (!fieldValue) {
    return;
  }

  if (fieldValue.mode === '>=' && fieldValue.min !== undefined) {
    params[valueParam] = String(fieldValue.min);
    return;
  }

  if (fieldValue.mode === '<=' && fieldValue.max !== undefined) {
    params[valueParam] = String(fieldValue.max);
    return;
  }

  if (fieldValue.mode === 'between') {
    if (fieldValue.min !== undefined) {
      params[valueParam] = String(fieldValue.min);
      return;
    }

    if (fieldValue.max !== undefined) {
      params[valueParam] = String(fieldValue.max);
    }
  }
};

const applySummaryFlagParams = (params: Record<string, string>, summaryFlag: GridFilterState['summaryFlag']): void => {
  if (!summaryFlag) {
    return;
  }

  if (typeof summaryFlag === 'object' && summaryFlag.values?.length) {
    params.summaryFlag = summaryFlag.values.join(',');
    const operatorMap: Record<string, string> = { contains: 'LIKE', notContains: 'NTL', eq: 'EQ' };
    params.summaryFlagOperator = operatorMap[summaryFlag.operator] ?? 'LIKE';
    return;
  }

  if (typeof summaryFlag === 'string' && summaryFlag.trim()) {
    params.summaryFlag = summaryFlag;
  }
};

const buildSalesParams = (
  filters: GridFilterState,
  page: number,
  pageSize: number,
): Record<string, string> => {
  const params: Record<string, string> = {
    pageNumber: String(page + 1),
    pageSize: String(pageSize),
  };

  if (filters.source) params.source = filters.source;
  if (filters.saleId) params.saleId = filters.saleId;
  if (filters.taskId) params.taskId = filters.taskId;
  if (filters.uprn) params.uprn = filters.uprn;
  if (filters.address) params.address = filters.address;
  if (filters.buildingNameNumber) params.buildingNameOrNumber = filters.buildingNameNumber;
  if (filters.street) params.street = filters.street;
  if (filters.townCity) params.town = filters.townCity;
  if (filters.postcode) params.postcode = filters.postcode;
  if (filters.billingAuthority?.length) params.billingAuthority = filters.billingAuthority.join(',');
  if (filters.bacode) params.billingAuthorityReference = filters.bacode;
  applySingleDateParam(params, 'transactionDate', filters.transactionDate);
  applyOperatorNumericParam(params, filters.salePrice, 'salesPrice', 'salesPriceOperator');
  applySimpleNumericParam(params, filters.ratio, 'ratio');
  if (filters.dwellingType?.length) params.dwellingType = filters.dwellingType.join(',');
  if (filters.flaggedForReview) params.flaggedForReview = filters.flaggedForReview;
  if (filters.reviewFlags?.length) params.reviewFlag = filters.reviewFlags.join(',');
  if (filters.outlierKeySale?.length) params.outlierKeySale = filters.outlierKeySale.join(',');
  applySimpleNumericParam(params, filters.outlierRatio, 'outlierRatio');
  if (filters.overallFlag?.length) params.overallFlag = filters.overallFlag.join(',');
  applySummaryFlagParams(params, filters.summaryFlag);
  if (filters.taskStatus?.length) params.taskStatus = filters.taskStatus.join(',');
  if (filters.assignedTo) params.assignedTo = filters.assignedTo;
  applyDateRangeParams(params, filters.assignedDate, 'assignedFromDate', 'assignedToDate');
  if (filters.qcAssignedTo) params.qcAssignedTo = filters.qcAssignedTo;
  applyDateRangeParams(params, filters.qcAssignedDate, 'qcAssignedFromDate', 'qcAssignedToDate');
  applyDateRangeParams(params, filters.qcCompletedDate, 'qcCompleteFromDate', 'qcCompleteToDate');
  return params;
};

export const TABLE_CONFIGS: Record<TableKey, TableConfig> = {
  // All Sales (alias 'sales')
  sales: {
    lookupFields: salesLookupFields,
    buildApiParams: buildSalesParams,
    columnFilterConfig: SALES_COLUMN_FILTERS,
    showViewSalesRecord: true,
    searchByOptions: [
      'saleId',
      'taskId',
      'uprn',
      'address',
      'postcode',
      'billingAuthority',
      'transactionDate',
      'salePrice',
      'ratio',
      'dwellingType',
      'flaggedForReview',
      'reviewFlags',
      'outlierRatio',
      'overallFlag',
      'summaryFlag',
      'taskStatus',
      'assignedTo',
      'assignedDate',
      'qcAssignedTo',
      'qcAssignedDate',
      'qcCompletedDate',
    ],
  },
  allsales: {
    lookupFields: salesLookupFields,
    buildApiParams: buildSalesParams,
    columnFilterConfig: SALES_COLUMN_FILTERS,
    showViewSalesRecord: true,
    searchByOptions: [
      'saleId',
      'taskId',
      'uprn',
      'address',
      'postcode',
      'billingAuthority',
      'transactionDate',
      'salePrice',
      'ratio',
      'dwellingType',
      'flaggedForReview',
      'reviewFlags',
      'outlierRatio',
      'overallFlag',
      'summaryFlag',
      'taskStatus',
      'assignedTo',
      'assignedDate',
      'qcAssignedTo',
      'qcAssignedDate',
      'qcCompletedDate',
    ],
  },
  // My Assignment
  myassignment: {
    lookupFields: new Set<string>([...salesLookupFields]),
    buildApiParams: buildSalesParams,
    buildPrefilterParams: (prefilters?: unknown) => mapManagerPrefiltersToApi(prefilters as ManagerPrefilterState | undefined),
    columnFilterConfig: SALES_COLUMN_FILTERS,
    showViewSalesRecord: true,
    searchByOptions: [
      'saleId',
      'taskId',
      'uprn',
      'address',
      'postcode',
      'billingAuthority',
      'transactionDate',
      'salePrice',
      'ratio',
      'dwellingType',
      'flaggedForReview',
      'reviewFlags',
      'outlierRatio',
      'overallFlag',
      'summaryFlag',
      'taskStatus',
      'assignedTo',
      'assignedDate',
      'qcAssignedTo',
      'qcAssignedDate',
      'qcCompletedDate',
    ],
  },
  // Manager dashboard
  manager: {
    lookupFields: new Set<string>([...salesLookupFields]),
    buildApiParams: buildSalesParams,
    buildPrefilterParams: (prefilters?: unknown) => mapManagerPrefiltersToApi(prefilters as ManagerPrefilterState | undefined),
    columnFilterConfig: SALES_COLUMN_FILTERS,
    showViewSalesRecord: true,
    searchByOptions: [
      'saleId',
      'taskId',
      'uprn',
      'address',
      'postcode',
      'billingAuthority',
      'transactionDate',
      'salePrice',
      'ratio',
      'dwellingType',
      'flaggedForReview',
      'reviewFlags',
      'outlierRatio',
      'overallFlag',
      'summaryFlag',
      'taskStatus',
      'assignedTo',
      'assignedDate',
      'qcAssignedTo',
      'qcAssignedDate',
      'qcCompletedDate',
    ],
  },
  // QA dashboard
  qa: {
    lookupFields: new Set<string>([...salesLookupFields]),
    buildApiParams: buildSalesParams,
    buildPrefilterParams: (prefilters?: unknown) => mapQcViewPrefiltersToApi(prefilters as ManagerPrefilterState | undefined),
    columnFilterConfig: SALES_COLUMN_FILTERS,
    showViewSalesRecord: true,
    searchByOptions: [
      'saleId',
      'taskId',
      'uprn',
      'address',
      'postcode',
      'billingAuthority',
      'transactionDate',
      'salePrice',
      'ratio',
      'dwellingType',
      'flaggedForReview',
      'reviewFlags',
      'outlierRatio',
      'overallFlag',
      'summaryFlag',
      'taskStatus',
      'assignedTo',
      'assignedDate',
      'qcAssignedTo',
      'qcAssignedDate',
      'qcCompletedDate',
    ],
  },
  // QA assignment screen (alias of QA for now)
  qaassign: {
    lookupFields: new Set<string>([...salesLookupFields]),
    buildApiParams: buildSalesParams,
    buildPrefilterParams: (prefilters?: unknown) => mapQcPrefiltersToApi(prefilters as ManagerPrefilterState | undefined),
    columnFilterConfig: SALES_COLUMN_FILTERS,
    showViewSalesRecord: true,
    searchByOptions: [
      'saleId',
      'taskId',
      'uprn',
      'address',
      'postcode',
      'billingAuthority',
      'transactionDate',
      'salePrice',
      'ratio',
      'dwellingType',
      'flaggedForReview',
      'reviewFlags',
      'outlierRatio',
      'overallFlag',
      'summaryFlag',
      'taskStatus',
      'assignedTo',
      'assignedDate',
      'qcAssignedTo',
      'qcAssignedDate',
      'qcCompletedDate',
    ],
  },
  // QA view screen (alias of QA for now)
  qaview: {
    lookupFields: new Set<string>([...salesLookupFields]),
    buildApiParams: buildSalesParams,
    buildPrefilterParams: (prefilters?: unknown) => mapQcViewPrefiltersToApi(prefilters as ManagerPrefilterState | undefined),
    columnFilterConfig: SALES_COLUMN_FILTERS,
    showViewSalesRecord: true,
    searchByOptions: [
      'saleId',
      'taskId',
      'uprn',
      'address',
      'postcode',
      'billingAuthority',
      'transactionDate',
      'salePrice',
      'ratio',
      'dwellingType',
      'flaggedForReview',
      'reviewFlags',
      'outlierRatio',
      'overallFlag',
      'summaryFlag',
      'taskStatus',
      'assignedTo',
      'assignedDate',
      'qcAssignedTo',
      'qcAssignedDate',
      'qcCompletedDate',
    ],
  },
};

function getConfig(table?: string): TableConfig {
  const key = (table?.toLowerCase?.() as TableKey) ?? 'sales';
  return (TABLE_CONFIGS as Record<string, TableConfig>)[key] ?? TABLE_CONFIGS.sales;
}

export function isLookupFieldFor(table: string, fieldName?: string): boolean {
  if (!fieldName) return false;
  const f = fieldName.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return getConfig(table).lookupFields.has(f);
}

export function buildApiParamsFor(
  table: string,
  filters: GridFilterState,
  page: number,
  pageSize: number,
  prefilters?: unknown,
): Record<string, string> {
  const config = getConfig(table);
  const base = config.buildApiParams(filters, page, pageSize);
  const extra = config.buildPrefilterParams ? config.buildPrefilterParams(prefilters) : {};
  return {
    ...base,
    ...extra,
  };
}

export function getSearchByOptionsFor(table?: string): SearchByOption[] {
  return getConfig(table).searchByOptions;
}

export function isViewSalesRecordEnabledFor(table?: string): boolean {
  return getConfig(table).showViewSalesRecord !== false;
}

export function getColumnFilterConfigFor(table: string, fieldName?: string): ColumnFilterConfig | undefined {
  if (!fieldName) return undefined;
  const f = fieldName.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return getConfig(table).columnFilterConfig[f];
}
