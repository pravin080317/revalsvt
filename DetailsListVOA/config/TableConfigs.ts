import { GridFilterState, SearchByOption } from '../Filters';

export type TableKey = 'sales' | 'allsales' | 'myassignment' | 'manager' | 'qa' | 'ssu';

export interface TableConfig {
  lookupFields: Set<string>;
  buildApiParams: (filters: GridFilterState, page: number, pageSize: number) => Record<string, string>;
  // Controls which top-of-grid search modes are available per persona/table
  searchByOptions: SearchByOption[];
}

const salesLookupFields = new Set<string>([
  'taskstatus',
  'status',
  'statuscode',
  'billingauthority',
  'flaggedforreview',
  'reviewflags',
  'overallflag',
  'dwellingtype',
  'assignedto',
  'qcassignedto',
  'summaryflags',
]);

const buildSalesParams = (
  filters: GridFilterState,
  page: number,
  pageSize: number,
): Record<string, string> => {
  const params: Record<string, string> = {
    searchBy: filters.searchBy,
    page: String(page),
    pageSize: String(pageSize),
  };

  if (filters.taskId) params.taskId = filters.taskId;
  if (filters.uprn) params.uprn = filters.uprn;
  if (filters.address) params.address = filters.address;
  if (filters.postcode) params.postcode = filters.postcode;
  if (filters.billingAuthority?.length) params.billingAuthority = filters.billingAuthority.join(',');
  if (filters.transactionDate) {
    if (filters.transactionDate.from) params.transactionDateFrom = filters.transactionDate.from;
    if (filters.transactionDate.to) params.transactionDateTo = filters.transactionDate.to;
  }
  if (filters.salePrice) {
    params.salePriceMode = filters.salePrice.mode;
    if (filters.salePrice.min !== undefined) params.salePriceMin = String(filters.salePrice.min);
    if (filters.salePrice.max !== undefined) params.salePriceMax = String(filters.salePrice.max);
  }
  if (filters.ratio) {
    params.ratioMode = filters.ratio.mode;
    if (filters.ratio.min !== undefined) params.ratioMin = String(filters.ratio.min);
    if (filters.ratio.max !== undefined) params.ratioMax = String(filters.ratio.max);
  }
  if (filters.dwellingType?.length) params.dwellingType = filters.dwellingType.join(',');
  if (filters.flaggedForReview) params.flaggedForReview = filters.flaggedForReview;
  if (filters.reviewFlags?.length) params.reviewFlags = filters.reviewFlags.join(',');
  if (filters.outlierKeySale?.length) params.outlierKeySale = filters.outlierKeySale.join(',');
  if (filters.outlierRatio) {
    params.outlierRatioMode = filters.outlierRatio.mode;
    if (filters.outlierRatio.min !== undefined) params.outlierRatioMin = String(filters.outlierRatio.min);
    if (filters.outlierRatio.max !== undefined) params.outlierRatioMax = String(filters.outlierRatio.max);
  }
  if (filters.overallFlag?.length) params.overallFlag = filters.overallFlag.join(',');
  if (filters.summaryFlag) params.summaryFlag = filters.summaryFlag;
  if (filters.taskStatus?.length) params.taskStatus = filters.taskStatus.join(',');
  if (filters.assignedTo) params.assignedTo = filters.assignedTo;
  if (filters.assignedDate) {
    if (filters.assignedDate.from) params.assignedDateFrom = filters.assignedDate.from;
    if (filters.assignedDate.to) params.assignedDateTo = filters.assignedDate.to;
  }
  if (filters.qcAssignedTo) params.qcAssignedTo = filters.qcAssignedTo;
  if (filters.qcAssignedDate) {
    if (filters.qcAssignedDate.from) params.qcAssignedDateFrom = filters.qcAssignedDate.from;
    if (filters.qcAssignedDate.to) params.qcAssignedDateTo = filters.qcAssignedDate.to;
  }
  if (filters.completedDate) {
    if (filters.completedDate.from) params.completedDateFrom = filters.completedDate.from;
    if (filters.completedDate.to) params.completedDateTo = filters.completedDate.to;
  }

  return params;
};

export const TABLE_CONFIGS: Record<TableKey, TableConfig> = {
  // All Sales (alias 'sales')
  sales: {
    lookupFields: salesLookupFields,
    buildApiParams: buildSalesParams,
    searchByOptions: [
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
      'outlierKeySale',
      'outlierRatio',
      'overallFlag',
      'summaryFlag',
      'taskStatus',
      'assignedTo',
      'assignedDate',
      'qcAssignedTo',
      'qcAssignedDate',
      'completedDate',
    ],
  },
  allsales: {
    lookupFields: salesLookupFields,
    buildApiParams: buildSalesParams,
    searchByOptions: [
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
      'outlierKeySale',
      'outlierRatio',
      'overallFlag',
      'summaryFlag',
      'taskStatus',
      'assignedTo',
      'assignedDate',
      'qcAssignedTo',
      'qcAssignedDate',
      'completedDate',
    ],
  },
  // My Assignment
  myassignment: {
    lookupFields: new Set<string>([...salesLookupFields]),
    buildApiParams: buildSalesParams,
    searchByOptions: [
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
      'outlierKeySale',
      'outlierRatio',
      'overallFlag',
      'summaryFlag',
      'taskStatus',
      'assignedTo',
      'assignedDate',
      'qcAssignedTo',
      'qcAssignedDate',
      'completedDate',
    ],
  },
  // Manager dashboard
  manager: {
    lookupFields: new Set<string>([...salesLookupFields]),
    buildApiParams: buildSalesParams,
    searchByOptions: [
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
      'outlierKeySale',
      'outlierRatio',
      'overallFlag',
      'summaryFlag',
      'taskStatus',
      'assignedTo',
      'assignedDate',
      'qcAssignedTo',
      'qcAssignedDate',
      'completedDate',
    ],
  },
  // QA dashboard
  qa: {
    lookupFields: new Set<string>([...salesLookupFields]),
    buildApiParams: buildSalesParams,
    searchByOptions: [
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
      'outlierKeySale',
      'outlierRatio',
      'overallFlag',
      'summaryFlag',
      'taskStatus',
      'assignedTo',
      'assignedDate',
      'qcAssignedTo',
      'qcAssignedDate',
      'completedDate',
    ],
  },
   // Statutory Spatial Unit POC
  ssu: {
    // Limit dropdown filters to postcode, street, town, and bacode; everything else uses textbox
    lookupFields: new Set<string>(['postcode', 'street', 'town', 'bacode']),
    // External items are used in the POC; API param builder not used but keep minimal compatibility
    buildApiParams: (filters: GridFilterState, page: number, pageSize: number) => {
      const params: Record<string, string> = { page: String(page), pageSize: String(pageSize) };
      if (filters.postcode) params.postcode = filters.postcode;
      if (filters.street) params.street = filters.street;
      if (filters.townCity) params.town = filters.townCity;
      if ((filters as unknown as { bacode?: string }).bacode) params.bacode = String((filters as unknown as { bacode?: string }).bacode);
      return params;
    },
    searchByOptions: ['address', 'postcode', 'street', 'town'],
  },
};

function getConfig(table?: string): TableConfig {
  const key = (table?.toLowerCase?.() as TableKey) || 'sales';
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
): Record<string, string> {
  return getConfig(table).buildApiParams(filters, page, pageSize);
}

export function getSearchByOptionsFor(table?: string): SearchByOption[] {
  return getConfig(table).searchByOptions;
}

