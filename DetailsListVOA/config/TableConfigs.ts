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
  'source',
  'salesource',
  'sale_source',
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

  switch (filters.searchBy) {
    case 'uprn':
      if (filters.uprn) params.uprn = filters.uprn;
      break;
    case 'taskId':
      if (filters.taskId) params.taskId = filters.taskId;
      break;
    case 'postcode':
      if (filters.postcode) params.postcode = filters.postcode;
      break;
    case 'address':
      if (filters.buildingNameNumber) params.buildingName = filters.buildingNameNumber;
      if (filters.street) params.street = filters.street;
      if (filters.townCity) params.town = filters.townCity;
      if (filters.postcode) params.postcode = filters.postcode;
      break;
    case 'manualCheck':
      if (filters.manualCheck && filters.manualCheck !== 'all') params.manualCheck = filters.manualCheck;
      break;
    case 'taskStatus':
      if (filters.taskStatus) params.taskStatus = filters.taskStatus;
      break;
    case 'source':
      if (filters.source) params.source = filters.source;
      break;
    default:
      break;
  }

  return params;
};

export const TABLE_CONFIGS: Record<TableKey, TableConfig> = {
  // All Sales (alias 'sales')
  sales: {
    lookupFields: salesLookupFields,
    buildApiParams: buildSalesParams,
    searchByOptions: ['address', 'uprn', 'taskId', 'manualCheck', 'taskStatus', 'source', 'postcode'],
  },
  allsales: {
    lookupFields: salesLookupFields,
    buildApiParams: buildSalesParams,
    searchByOptions: ['address', 'uprn', 'taskId', 'manualCheck', 'taskStatus', 'source', 'postcode'],
  },
  // My Assignment
  myassignment: {
    lookupFields: new Set<string>([...salesLookupFields]),
    buildApiParams: buildSalesParams,
    searchByOptions: ['address', 'uprn', 'taskId', 'manualCheck', 'taskStatus', 'source', 'postcode'],
  },
  // Manager dashboard
  manager: {
    lookupFields: new Set<string>([...salesLookupFields]),
    buildApiParams: buildSalesParams,
    searchByOptions: ['address', 'uprn', 'taskId', 'manualCheck', 'taskStatus', 'source', 'postcode'],
  },
  // QA dashboard
  qa: {
    lookupFields: new Set<string>([...salesLookupFields]),
    buildApiParams: buildSalesParams,
    searchByOptions: ['address', 'uprn', 'taskId', 'manualCheck', 'taskStatus', 'source', 'postcode'],
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
