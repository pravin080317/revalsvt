import * as React from 'react';
import { Selection, SelectionMode, IDetailsList, IObjectWithKey, MessageBarType } from '@fluentui/react';
import { DetailsList as Grid, GridProps } from '../DetailsList';
import { PCFContext } from '../context/PCFContext';
import { ColumnConfig, AssignUser } from '../../Component.types';
import { GridFilterState, createDefaultGridFilters, sanitizeFilters, NumericFilter, DateRangeFilter } from '../../Filters';
import { getProfileConfigs } from '../../config/ColumnProfiles';
import { CONTROL_CONFIG } from '../../config/ControlConfig';
import { getColumnFilterConfigFor, type TableKey } from '../../config/TableConfigs';
import {
  COLUMN_FILTER_VALUE_SEPARATOR,
  isManagerCompletedWorkThat,
  isQcCompletedWorkThat,
  type ManagerPrefilterState,
} from '../../config/PrefilterConfigs';
import { CASEWORKER_ROLE_NAMES, CASEWORKER_TEAM_NAMES, QA_ROLE_NAMES, QA_TEAM_NAMES } from '../../constants/AccessControl';
import { SCREEN_TEXT, MANAGER_BILLING_AUTHORITY_OPTIONS, MANAGER_CASEWORKER_OPTIONS } from '../../constants/ScreenText';
import { buildColumns } from '../../utils/ColumnsBuilder';
import { ensureSampleColumns, buildSampleEntityRecords } from '../../utils/SampleHelpers';
import { parseAssignableUsersResponse as parseAssignableUsersResponseBase, resolveAssignmentStatusValidation } from '../../utils/AssignmentHelpers';
import { buildColumnFilterQuery } from '../../utils/ColumnFilterQuery';
import { filterItemsByColumnFilters } from '../../utils/GridColumnFilters';
import { toSortableDateKey } from '../../utils/DateSortUtils';
import { deserializeColumnFiltersFromStorage, parseStoredSortState, serializeColumnFiltersForStorage, shouldPersistSortState } from '../../utils/GridStatePersistence';
import { isGuidValue, normalizeSuid, normalizeUserId } from '../../utils/IdentifierUtils';
import { buildHereditamentUrl } from '../../utils/HereditamentUrl';
import { buildGridSessionKey, buildPrefilterStorageKey, isSalesSearchDefaultFilters, resolveAssignmentScreenName, shouldShowResults } from '../../utils/ScreenBehavior';
import { resolveScreenConfig, toKnownTableKey, normalizeTableKey, type ScreenKind } from '../../utils/ScreenResolution';
import { loadGridData } from '../../services/GridDataController';
import { executeUnboundCustomApi, normalizeCustomApiName, resolveCustomApiOperationType } from '../../services/CustomApi';
import { IInputs } from '../../generated/ManifestTypes';
import { logPerf } from '../../utils/Perf';
import { abbreviateSummaryFlagLabel } from '../../utils/TagSemanticUtils';

export type { ScreenKind } from '../../utils/ScreenResolution';

export interface DetailsListHostProps {
  context: ComponentFramework.Context<IInputs>;
  onRowInvoke?: (args: { taskId?: string; saleId?: string; screenKind?: string; tableKey?: string }) => void | Promise<void>;
  // Emit IDs on selection (single or multi); arrays support multi-select
  onSelectionChange?: (args: { taskId?: string; saleId?: string; selectedTaskIds?: string[]; selectedSaleIds?: string[] }) => void;
  // Emit count of selected rows (even if IDs are missing)
  onSelectionCountChange?: (count: number) => void;
  // Triggered when the back button is pressed
  onBackRequested?: () => void;
  // When provided, the host renders these items instead of loading via APIM.
  externalItems?: unknown[];
  // Bubble header filter Apply back to parent (used by external item scenarios to call API with extra params)
  onColumnFiltersApply?: (filters: Record<string, string | string[]>) => void;
  // Optional journey/home overrides for screen routing.
  screenNameOverride?: string;
  tableKeyOverride?: string;
  // Optional global request context overrides.
  countryOverride?: string;
  listYearOverride?: string;
  // Optional context subtitle to display in the command bar (merged from journey banner).
  contextSubtitle?: string;
  // Callback to edit the context (country / list year).
  onEditContext?: () => void;
  // Expose the GUID→display-name map so sibling components (e.g. SaleDetailsShell) can resolve user names.
  onUserDisplayNameMapChange?: (map: Record<string, string>) => void;
  // Bumped by the parent when the grid becomes visible again (e.g. returning from details).
  refreshNonce?: number;
  // Azure Entra Object ID resolved from the user context plugin (preferred over systemuserid).
  entraObjectId?: string;
  // Bulk create task handler - passed down to Grid.
  onBulkCreateTask?: (saleIds: string[]) => Promise<void>;
  // Access gate for bulk create task action.
  canCreateManualTask?: boolean;
}

interface SummaryFlagFilterValue {
  operator: 'contains' | 'notContains' | 'eq';
  values: string[];
}

type ColumnFilterValue = string | string[] | NumericFilter | DateRangeFilter | SummaryFlagFilterValue;
type FilterOptionsMap = Record<string, string[]>;

const MANAGER_ASSIGNMENT_SCREEN_NAME = 'manager assignment';
const QC_ASSIGNMENT_SCREEN_NAME = 'quality control assignment';

const normalizeGroupName = (value?: string): string => (value ?? '').trim().toLowerCase();
const normalizeGroupList = (values?: string[]): string[] =>
  (Array.isArray(values) ? values.map((value) => normalizeGroupName(value)).filter((value) => value !== '') : []);
const isAssignableUserInGroup = (user: AssignUser, teamNames: Set<string>, roleNames: Set<string>): boolean => {
  if (!user) return false;
  const team = normalizeGroupName(user.team);
  const role = normalizeGroupName(user.role);
  const teams = normalizeGroupList(user.teams);
  const roles = normalizeGroupList(user.roles);
  const hasTeam = ([team, ...teams]).some((value) => value !== '' && teamNames.has(value));
  const hasRole = ([role, ...roles]).some((value) => value !== '' && roleNames.has(value));
  return hasTeam || hasRole;
};

const buildAssignableUsersCacheKey = (apiName: string, customApiType: number, screenName: string): string =>
  `${apiName}|${customApiType}|${screenName.trim().toLowerCase()}`;

const normalizeAssignableUserId = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
    return '';
  }
  return normalizeUserId(String(value)).toLowerCase();
};

const resolveAssignedByUserId = (context: ComponentFramework.Context<IInputs>): string => {
  const fromContext = (context.userSettings as { userId?: string } | undefined)?.userId;
  if (fromContext) return normalizeUserId(fromContext);
  const xrm = (globalThis as {
    Xrm?: { Utility?: { getGlobalContext?: () => { userSettings?: { userId?: string } } } };
  }).Xrm;
  const fromXrm = xrm?.Utility?.getGlobalContext?.()?.userSettings?.userId;
  return normalizeUserId(fromXrm);
};

const tryParseJsonRecord = (value: unknown): Record<string, unknown> | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return undefined;
    }
    return undefined;
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
};

const findUserContextValue = (record: Record<string, unknown>, ...candidates: string[]): unknown => {
  const keys = Object.keys(record);
  for (const candidate of candidates) {
    if (Object.prototype.hasOwnProperty.call(record, candidate)) {
      return record[candidate];
    }
    const match = keys.find((key) => key.toLowerCase() === candidate.toLowerCase());
    if (match) return record[match];
  }
  return undefined;
};

const parseUserContextEntraObjectId = (payload: unknown): string => {
  const rootRecord = tryParseJsonRecord(payload) ?? {};
  const nestedRecord = tryParseJsonRecord(findUserContextValue(rootRecord, 'Result', 'result'));
  const record = nestedRecord ?? rootRecord;
  const rawValue = findUserContextValue(record, 'entraObjectId');
  return typeof rawValue === 'string' ? normalizeUserId(rawValue).toLowerCase() : '';
};

const SALES_SEARCH_DEFAULT_FILTERS: GridFilterState = {
  ...createDefaultGridFilters(),
  searchBy: 'address',
};


const resolveClientUrl = (ctx: ComponentFramework.Context<IInputs>): string => {
  const contextWithPage = ctx as unknown as { page?: { getClientUrl?: () => string } };
  const page = contextWithPage.page;
  if (typeof page?.getClientUrl === 'function') {
    try {
      return page.getClientUrl();
    } catch {
      // Fall back for test harness where getClientUrl may not be available.
    }
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
};

const normalizeContextValue = (value: unknown): string => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
  return '';
};

const normalizeStorageContextPart = (value: string): string => {
  if (!value) return 'na';
  const normalized = value.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  return normalized || 'na';
};

const buildContextScopeKey = (country: string, listYear: string): string => `${normalizeStorageContextPart(country)}:${normalizeStorageContextPart(listYear)}`;

const toFilterValueString = (val: ColumnFilterValue | undefined): string => {
  if (val === undefined || val === null) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.map((v) => toFilterValueString(v as ColumnFilterValue)).filter((s) => s !== '').join('|');
  if (typeof val === 'object') return JSON.stringify(val);
  return '';
};

const normalizeFilterArray = (val: unknown): string[] =>
  Array.isArray(val)
    ? val.map((v) => toFilterValueString(v as ColumnFilterValue)).filter((s) => s.trim() !== '')
    : [];

const isPlainObject = (val: unknown): val is Record<string, unknown> =>
  !!val && typeof val === 'object' && !Array.isArray(val);

const parseFilterValue = (raw: string): ColumnFilterValue => {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) return parsed.map((v) => String(v));
      if (isPlainObject(parsed)) return parsed as ColumnFilterValue;
    } catch {
      // ignore JSON parse issues
    }
  }
  return trimmed;
};

interface AssignmentApiResult { success?: boolean; message?: string; payload?: string }

interface SelectionIds {
  taskId?: string;
  saleId?: string;
  selectedTaskIds: string[];
  selectedSaleIds: string[];
}

const toNumericTaskId = (value: unknown): string => {
  const raw = typeof value === 'string' ? value : typeof value === 'number' || typeof value === 'boolean' ? String(value) : '';
  if (!raw) return '';
  const digitsOnly = raw.replace(/\D/g, '');
  return digitsOnly || raw;
};

const buildUniqueTaskIdsFromRecords = (records: Record<string, unknown>[]): string[] => {
  const taskIds = records
    .map((rec) => toNumericTaskId(rec.taskid ?? rec.taskId ?? ''))
    .map((value) => value.trim())
    .filter((value) => value !== '');
  return Array.from(new Set(taskIds));
};

const parseJsonString = <T,>(value: string): T | undefined => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
};

const parseAssignmentApiString = (value: string): AssignmentApiResult =>
  parseJsonString<AssignmentApiResult>(value) ?? { message: value };

const parseAssignmentApiRecord = (record: Record<string, unknown>): AssignmentApiResult | null => {
  const raw = record.Result ?? record.result;
  if (typeof raw === 'string') {
    return parseAssignmentApiString(raw);
  }
  return typeof record.success === 'boolean' ? record as AssignmentApiResult : null;
};

const parseAssignmentApiResult = (payload: unknown): AssignmentApiResult | null => {
  if (!payload) return null;
  if (typeof payload === 'string') {
    return parseAssignmentApiString(payload);
  }
  if (typeof payload === 'object') {
    return parseAssignmentApiRecord(payload as Record<string, unknown>);
  }
  return null;
};

const normalizeAssignmentOutcomeText = (value?: string): string => {
  if (!value) return '';
  return value.replace(/^['"]|['"]$/g, '').trim().toLowerCase();
};

const hasAlreadyAssignedOutcome = (value: string): boolean =>
  value.includes('already assigned') || value.includes('alreadyassigned');

const extractAssignmentOutcomeRecord = (record: Record<string, unknown>): { success?: boolean; alreadyAssigned?: boolean } => {
  const success = typeof record.success === 'boolean' ? record.success : undefined;
  const message = [record.message, record.status, record.result, record.detail]
    .map((value) => (typeof value === 'string' ? value : ''))
    .join(' ');
  return {
    success,
    alreadyAssigned: hasAlreadyAssignedOutcome(normalizeAssignmentOutcomeText(message)),
  };
};

const tryParseAssignmentOutcome = (raw: string): { success?: boolean; alreadyAssigned?: boolean } | undefined => {
  const parsed = parseJsonString<unknown>(raw);
  if (parsed === undefined) {
    return undefined;
  }
  if (typeof parsed === 'string') {
    return parseAssignmentOutcome(parsed);
  }
  if (parsed && typeof parsed === 'object') {
    return extractAssignmentOutcomeRecord(parsed as Record<string, unknown>);
  }
  return undefined;
};

const parseAssignmentOutcome = (payload?: string): { success?: boolean; alreadyAssigned?: boolean } => {
  const raw = typeof payload === 'string' ? payload.trim() : '';
  if (!raw) return {};
  const normalized = normalizeAssignmentOutcomeText(raw);
  const hasAlreadyAssigned = hasAlreadyAssignedOutcome(normalized);
  if (['success', 'succeeded', 'ok', 'true'].includes(normalized)) return { success: true };
  if (['fail', 'failed', 'failure', 'error', 'false'].includes(normalized)) {
    return { success: false, alreadyAssigned: hasAlreadyAssigned };
  }
  const parsedOutcome = tryParseAssignmentOutcome(raw);
  if (parsedOutcome) {
    return parsedOutcome;
  }
  return { alreadyAssigned: hasAlreadyAssigned };
};

const extractSelectionIds = (selected: unknown[]): SelectionIds => {
  const makeIds = (item: unknown): { taskId?: string; saleId?: string } => {
    const record = item as { taskid?: string; taskId?: string; saleid?: string; saleId?: string };
    return { taskId: record.taskid ?? record.taskId, saleId: record.saleid ?? record.saleId };
  };
  const pairs = (selected ?? [])
    .map(makeIds)
    .filter((pair) => [pair.taskId, pair.saleId].some((value) => !!value));
  const selectedTaskIds = pairs.map((pair) => pair.taskId).filter((value): value is string => !!value);
  const selectedSaleIds = pairs.map((pair) => pair.saleId).filter((value): value is string => !!value);
  const first = pairs[0] ?? { taskId: undefined, saleId: undefined };
  return {
    taskId: first.taskId,
    saleId: first.saleId,
    selectedTaskIds,
    selectedSaleIds,
  };
};

const normalizeApiFilters = (filters?: Record<string, unknown>): Record<string, ColumnFilterValue> | undefined => {
  if (!filters) return undefined;
  const normalized: Record<string, ColumnFilterValue> = {};
  Object.entries(filters).forEach(([key, value]) => {
    const lowerKey = key.toLowerCase();
    const normalizedValue = (() => {
      if (value === undefined || value === null) return undefined;
      if (Array.isArray(value)) {
        const entries = value.map((entry) => String(entry ?? '')).filter((entry) => entry.trim() !== '');
        return entries.length > 0 ? entries : undefined;
      }
      if (typeof value === 'string') {
        const parsed = parseFilterValue(value);
        return parsed !== '' ? parsed : undefined;
      }
      if (isPlainObject(value)) {
        return value as ColumnFilterValue;
      }
      return undefined;
    })();
    if (normalizedValue !== undefined) {
      normalized[lowerKey] = normalizedValue;
    }
  });
  return normalized;
};

const normalizeFilterKey = (value: string): string =>
  value.replace(/[^a-z0-9]/gi, '').toLowerCase();

const splitDelimitedFilterValue = (value: string): string[] =>
  value
    .split(/[;,|]/)
    .map((part) => part.trim())
    .filter((part) => part !== '');

const toUniqueNonEmpty = (values: string[]): string[] => Array.from(new Set(values.filter((value) => value.trim() !== '')));

const normalizeArrayFilterOptionValues = (
  value: string[],
  isSelectableFilter: boolean,
): string[] => {
  const mapped = isSelectableFilter
    ? value
      .map((v) => String(v ?? '').trim())
      .flatMap((v) => (/[;,|]/.test(v) ? splitDelimitedFilterValue(v) : [v]))
      .map((v) => v.trim())
    : value.map((v) => String(v ?? '').trim());
  return toUniqueNonEmpty(mapped);
};

const normalizeStringFilterOptionValues = (
  trimmed: string,
  isSelectableFilter: boolean,
): string[] => {
  if (!trimmed) return [];
  const parsed = ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}')))
    ? parseJsonString<unknown>(trimmed)
    : undefined;
  if (Array.isArray(parsed)) {
    return toUniqueNonEmpty(parsed.map((value) => String(value ?? '').trim()));
  }
  if (isSelectableFilter && /[;,|]/.test(trimmed)) {
    return toUniqueNonEmpty(splitDelimitedFilterValue(trimmed));
  }
  return [trimmed];
};

const normalizeFilterOptionValue = (
  value: string | string[],
  isSelectableFilter: boolean,
): string[] => Array.isArray(value)
  ? normalizeArrayFilterOptionValues(value, isSelectableFilter)
  : normalizeStringFilterOptionValues(value.trim(), isSelectableFilter);

const normalizeFilterOptions = (table: string, filters?: Record<string, string | string[]>): FilterOptionsMap => {
  if (!filters) return {};
  const normalized: FilterOptionsMap = {};
  Object.entries(filters).forEach(([key, value]) => {
    const lowerKey = normalizeFilterKey(key);
    if (value === undefined || value === null) return;
    const cfg = getColumnFilterConfigFor(table, lowerKey);
    const isSelectableFilter = cfg?.control === 'multiSelect' || cfg?.control === 'singleSelect';
    const options = normalizeFilterOptionValue(value, isSelectableFilter);
    if (options.length > 0) {
      normalized[lowerKey] = options;
    }
  });
  return normalized;
};

const splitUserIdentifiers = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry ?? '').trim()).filter((entry) => entry !== '');
  }
  if (typeof value === 'string') {
    return value.split(',').map((entry) => entry.trim()).filter((entry) => entry !== '');
  }
  return [];
};

const mapUserIdsToDisplayNames = (
  value: unknown,
  hasUserDisplayNameMap: boolean,
  userDisplayNameMap: Record<string, string>,
): string[] | undefined => {
  if (!hasUserDisplayNameMap) {
    return undefined;
  }

  const ids = splitUserIdentifiers(value);
  if (ids.length === 0) {
    return undefined;
  }

  return ids.map((id) => {
    const normalizedId = normalizeAssignableUserId(id);
    return normalizedId ? userDisplayNameMap[normalizedId] ?? id : id;
  });
};

const extractNormalizedUserIds = (value: unknown): string[] | undefined => {
  const normalized = splitUserIdentifiers(value)
    .map((entry) => normalizeAssignableUserId(entry))
    .filter((entry) => entry !== '');
  if (normalized.length === 0) {
    return undefined;
  }
  return Array.from(new Set(normalized));
};

const assignDisplayNames = (args: {
  record: Record<string, unknown>;
  sourceKey: 'assignedto' | 'qcassignedto';
  nameKey: 'assignedtoname' | 'qcassignedtoname';
  camelSourceKey: 'assignedTo' | 'qcAssignedTo';
  camelNameKey: 'assignedToName' | 'qcAssignedToName';
  hasUserDisplayNameMap: boolean;
  userDisplayNameMap: Record<string, string>;
  toTextValue: (value: unknown) => string;
}): void => {
  const {
    record,
    sourceKey,
    nameKey,
    camelSourceKey,
    camelNameKey,
    hasUserDisplayNameMap,
    userDisplayNameMap,
    toTextValue,
  } = args;
  const nameFromResponse = toTextValue(record[nameKey] ?? record[camelNameKey]);
  if (nameFromResponse) {
    record[sourceKey] = [nameFromResponse];
    record[camelSourceKey] = [nameFromResponse];
    return;
  }

  const mappedNames = mapUserIdsToDisplayNames(record[sourceKey] ?? record[camelSourceKey], hasUserDisplayNameMap, userDisplayNameMap);
  if (mappedNames) {
    record[sourceKey] = mappedNames;
    record[camelSourceKey] = mappedNames;
  }
};

const resolvePrimaryApimRecordId = (item: Record<string, unknown>): string | undefined => {
  const statutorySpatialUnitLabelId = item.statutorySpatialUnitLabelId ?? item.statutoryspatialunitlabelid;
  if (typeof statutorySpatialUnitLabelId === 'string' && statutorySpatialUnitLabelId.trim() !== '') {
    return statutorySpatialUnitLabelId;
  }

  if (typeof item.taskId === 'string' && item.taskId.trim() !== '') {
    return item.taskId;
  }

  return undefined;
};

const buildApimRecordId = (item: Record<string, unknown>, index: number): string => {
  const primaryId = resolvePrimaryApimRecordId(item);
  const uprnValue = item.uprn;
  const uprnText = typeof uprnValue === 'string' || typeof uprnValue === 'number' ? String(uprnValue) : '';
  const fallbackId = uprnText ? `${uprnText}-${index}` : `apim-${index}`;
  return primaryId ? `${primaryId}-${index}` : fallbackId;
};

const mapApimItemsToEntityRecords = (
  apimItems: unknown[],
  clientUrl: string,
  hasUserDisplayNameMap: boolean,
  userDisplayNameMap: Record<string, string>,
): { records: Record<string, ComponentFramework.PropertyHelper.DataSetApi.EntityRecord>; ids: string[] } => {
  const records: Record<string, ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> = {};
  const ids: string[] = [];
  const toTextValue = (value: unknown) => (typeof value === 'string' ? value : typeof value === 'number' || typeof value === 'boolean' ? String(value) : '');

  apimItems.forEach((item, index) => {
    const base: Record<string, unknown> = {};
    const record = base as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord & Record<string, unknown>;
    const r = record;
    const source = item as Record<string, unknown>;
    const id = buildApimRecordId(source, index);

    record.getRecordId = () => id;
    record.getNamedReference = undefined as unknown as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord['getNamedReference'];
    record.getValue = ((columnName: string) => record[columnName] ?? '') as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord['getValue'];
    record.getFormattedValue = ((columnName: string) => toTextValue(record[columnName])) as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord['getFormattedValue'];
    Object.keys(source).forEach((key) => {
      record[key.toLowerCase()] = source[key];
    });

    const assignedToIds = extractNormalizedUserIds(record.assignedto ?? record.assignedTo);
    if (assignedToIds && assignedToIds.length > 0) {
      r.assignedtoid = assignedToIds;
      r.assignedToId = assignedToIds;
    }
    const qcAssignedToIds = extractNormalizedUserIds(record.qcassignedto ?? record.qcAssignedTo);
    if (qcAssignedToIds && qcAssignedToIds.length > 0) {
      r.qcassignedtoid = qcAssignedToIds;
      r.qcAssignedToId = qcAssignedToIds;
    }
    assignDisplayNames({
      record,
      sourceKey: 'assignedto',
      nameKey: 'assignedtoname',
      camelSourceKey: 'assignedTo',
      camelNameKey: 'assignedToName',
      hasUserDisplayNameMap,
      userDisplayNameMap,
      toTextValue,
    });
    assignDisplayNames({
      record,
      sourceKey: 'qcassignedto',
      nameKey: 'qcassignedtoname',
      camelSourceKey: 'qcAssignedTo',
      camelNameKey: 'qcAssignedToName',
      hasUserDisplayNameMap,
      userDisplayNameMap,
      toTextValue,
    });

    record.saleid = record.saleid ?? (record as Record<string, unknown> & { saleId?: unknown }).saleId;
    const suid = normalizeSuid(record.suid);
    record.addressurl = suid && clientUrl ? buildHereditamentUrl(clientUrl, suid) : '';
    ids.push(id);
    records[id] = record;
  });

  return { records, ids };
};

const buildUserDisplayNameMap = (
  apiUserLookup: Record<string, string>,
  assignableUsersCache: AssignUser[],
  getUserDisplayName: (user: AssignUser) => string,
): Record<string, string> => {
  const map: Record<string, string> = { ...apiUserLookup };
  assignableUsersCache.forEach((user) => {
    const name = getUserDisplayName(user);
    if (!name) {
      return;
    }

    const primaryId = normalizeAssignableUserId(user.entraObjectId ?? user.id);
    if (primaryId) {
      map[primaryId] = name;
    }

    const userId = normalizeAssignableUserId(user.id);
    if (userId) {
      map[userId] = name;
    }

    const systemUserId = normalizeAssignableUserId(user.systemUserId);
    if (systemUserId) {
      map[systemUserId] = name;
    }
  });
  return map;
};

const readStoredSessionScreens = (): Record<string, boolean> => {
  try {
    const rawScreens = sessionStorage.getItem('voa-session-screens');
    return rawScreens ? JSON.parse(rawScreens) as Record<string, boolean> : {};
  } catch {
    return {};
  }
};

const restoreStoredHeaderFilters = (
  tableKey: string,
  storageKey: string,
  storageKeyNC: string,
): Record<string, ColumnFilterValue> => {
  const rawLocalFilters = localStorage.getItem(storageKey) ?? localStorage.getItem(storageKeyNC);
  if (!rawLocalFilters) {
    return {};
  }
  return deserializeColumnFiltersFromStorage(String(tableKey), rawLocalFilters) as Record<string, ColumnFilterValue>;
};

const restoreStoredSort = (
  storageKeySort: string,
  storageKeySortNC: string,
): ReturnType<typeof parseStoredSortState> => {
  const rawLocalSort = localStorage.getItem(storageKeySort) ?? localStorage.getItem(storageKeySortNC);
  return rawLocalSort ? parseStoredSortState(rawLocalSort) : undefined;
};

const restoreStoredPage = (
  storageKeyPage: string,
  storageKeyPageNC: string,
): number => {
  const rawLocalPage = localStorage.getItem(storageKeyPage) ?? localStorage.getItem(storageKeyPageNC);
  if (!rawLocalPage) {
    return 0;
  }
  const page = Number(rawLocalPage);
  return !Number.isNaN(page) && page >= 0 ? page : 0;
};

const persistSessionScreenState = (sessionScreens: Record<string, boolean>, screenInstanceKey: string): void => {
  try {
    sessionScreens[screenInstanceKey] = true;
    sessionStorage.setItem('voa-session-screens', JSON.stringify(sessionScreens));
    sessionStorage.setItem('voa-last-screen', screenInstanceKey);
  } catch {
    // ignore session storage failures
  }
};

const parseMetadataPayload = (rawPayload: unknown): unknown => {
  let payload: unknown = rawPayload;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload) as unknown;
    } catch {
      return payload;
    }
  }
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const raw = record.Result ?? record.result;
    if (typeof raw === 'string') {
      try {
        payload = JSON.parse(raw) as unknown;
      } catch {
        // ignore parse failures
      }
    }
  }
  return payload;
};

const extractBillingAuthorityValues = (payload: unknown): { values: string[]; hasAuthorityField: boolean } => {
  const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : undefined;
  const hasAuthorityField = Boolean(record && (Array.isArray(record.billingAuthority) || Array.isArray(record.billingAuthorities)));
  const list = Array.isArray(record?.billingAuthority)
    ? record.billingAuthority
    : Array.isArray(record?.billingAuthorities)
      ? record.billingAuthorities
      : [];
  const values = Array.isArray(list)
    ? list
      .filter((value) => typeof value === 'string')
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
    : [];
  return { values, hasAuthorityField };
};

const areFiltersEqual = (a: Record<string, ColumnFilterValue>, b: Record<string, ColumnFilterValue>): boolean => {
  const aKeys = Object.keys(a).sort((left, right) => left.localeCompare(right));
  const bKeys = Object.keys(b).sort((left, right) => left.localeCompare(right));
  if (aKeys.length !== bKeys.length) return false;
  for (let i = 0; i < aKeys.length; i++) {
    if (aKeys[i] !== bKeys[i]) return false;
    const av = a[aKeys[i]];
    const bv = b[bKeys[i]];
    if (Array.isArray(av) || Array.isArray(bv)) {
      const aa = normalizeFilterArray(av);
      const bb = normalizeFilterArray(bv);
      if (aa.length !== bb.length) return false;
      for (let j = 0; j < aa.length; j++) if (aa[j] !== bb[j]) return false;
      continue;
    }
    if (isPlainObject(av) || isPlainObject(bv)) {
      if (JSON.stringify(av ?? {}) !== JSON.stringify(bv ?? {})) return false;
      continue;
    }
    const avText = toFilterValueString(av as ColumnFilterValue).trim();
    const bvText = toFilterValueString(bv as ColumnFilterValue).trim();
    if (avText !== bvText) return false;
  }
  return true;
};

export const DetailsListHost: React.FC<DetailsListHostProps> = ({
  context,
  onRowInvoke,
  onSelectionChange,
  onSelectionCountChange,
  onBackRequested,
  externalItems,
  onColumnFiltersApply,
  screenNameOverride,
  tableKeyOverride,
  countryOverride,
  listYearOverride,
  contextSubtitle,
  onEditContext,
  onUserDisplayNameMapChange,
  refreshNonce,
  entraObjectId,
  onBulkCreateTask,
  canCreateManualTask = false,
}) => {
  // Parse basic params
  const pageSize = (context.parameters as unknown as Record<string, { raw?: number }>).pageSize?.raw ?? 500;
  const allocatedHeight = typeof context.mode?.allocatedHeight === 'number' && context.mode.allocatedHeight > 0
    ? context.mode.allocatedHeight
    : undefined;
  const canvasScreenNameRaw = (context.parameters as unknown as Record<string, { raw?: string }>).canvasScreenName?.raw ?? '';
  const tableKeyInputRaw = (context.parameters as unknown as Record<string, { raw?: string }>).tableKey?.raw ?? '';
  const countryFromInput = (context.parameters as unknown as Record<string, { raw?: string }>).country?.raw;
  const listYearFromInput = (context.parameters as unknown as Record<string, { raw?: string }>).listYear?.raw;
  const canvasScreenName = (screenNameOverride ?? canvasScreenNameRaw ?? '').trim();
  const tableKeyRaw = (tableKeyOverride ?? tableKeyInputRaw ?? '').trim();
  const country = normalizeContextValue(countryOverride ?? countryFromInput);
  const listYear = normalizeContextValue(listYearOverride ?? listYearFromInput);
  const includeCountryListYearApiParams = CONTROL_CONFIG.enableCountryListYearApiParams === true;
  const contextScopeKey = React.useMemo(() => buildContextScopeKey(country, listYear), [country, listYear]);
  const columnDisplayNamesRaw = (context.parameters as unknown as Record<string, { raw?: string }>).columnDisplayNames?.raw?.trim() ?? '{}';
  const columnConfigRaw = (context.parameters as unknown as Record<string, { raw?: string }>).columnConfig?.raw?.trim() ?? '[]';
  const screenName = canvasScreenName.toLowerCase();
  const fallbackTableKey = React.useMemo(
    () => normalizeTableKey((CONTROL_CONFIG.tableKey || 'sales').trim().toLowerCase()),
    [],
  );
  const explicitTableKey = React.useMemo(() => toKnownTableKey(tableKeyRaw), [tableKeyRaw]);
  const resolvedScreenConfig = React.useMemo(
    () => resolveScreenConfig(canvasScreenName, explicitTableKey, fallbackTableKey),
    [canvasScreenName, explicitTableKey, fallbackTableKey],
  );
  const { tableKey, profileKey, sourceCode, kind: screenKind } = resolvedScreenConfig;
  const assignmentScreenName = React.useMemo(
    () => resolveAssignmentScreenName(canvasScreenName, screenKind),
    [canvasScreenName, screenKind],
  );
  const commonText = SCREEN_TEXT.common;
  const managerText = SCREEN_TEXT.managerAssignment;
  const qcText = SCREEN_TEXT.qcAssignment;
  const assignTasksText = SCREEN_TEXT.assignTasks;
  const assignmentConfig = CONTROL_CONFIG.taskAssignment ?? {
    maxBatchSize: 500,
    allowedStatusesManager: [] as string[],
    allowedStatusesQc: [] as string[],
    allowedStatuses: [] as string[],
  };
  const isLocalHost = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    const host = window.location?.hostname ?? '';
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  }, []);
  const fallbackBillingAuthorityOptions = React.useMemo(
    () => (isLocalHost
      ? MANAGER_BILLING_AUTHORITY_OPTIONS
        .map((opt) => String(opt.text ?? opt.key ?? '').trim())
        .filter((value) => value.length > 0)
      : []),
    [isLocalHost],
  );
  const fallbackCaseworkerOptions = React.useMemo(
    () => (isLocalHost
      ? MANAGER_CASEWORKER_OPTIONS
        .map((opt) => String(opt.text ?? opt.key ?? '').trim())
        .filter((value) => value.length > 0)
      : []),
    [isLocalHost],
  );
  const fallbackQcUserOptions = React.useMemo(() => fallbackCaseworkerOptions, [fallbackCaseworkerOptions]);
  const currentSystemUserId = React.useMemo(() => resolveAssignedByUserId(context).toLowerCase(), [context]);

  // Column display names and configs
  const [columnDisplayNames, setColumnDisplayNames] = React.useState<Record<string, string>>({});
  const [columnConfigs, setColumnConfigs] = React.useState<Record<string, ColumnConfig>>({});

  React.useEffect(() => {
    try {
      const parsed = JSON.parse(columnDisplayNamesRaw) as Record<string, string>;
      const map: Record<string, string> = {};
      Object.keys(parsed).forEach((k) => (map[k.toLowerCase()] = parsed[k]));
      setColumnDisplayNames(map);
    } catch {
      setColumnDisplayNames({});
    }
  }, [columnDisplayNamesRaw]);

  React.useEffect(() => {
    try {
      const fromProfile = getProfileConfigs(profileKey);
      const fromJson = JSON.parse(columnConfigRaw) as ColumnConfig[];
      const merged = [...fromProfile, ...fromJson];
      const map: Record<string, ColumnConfig> = {};
      merged.forEach((c) => {
        const n = c.ColName?.trim().toLowerCase();
        if (n && n !== 'completeddate') map[n] = c;
      });
      // Ensure multi-value flags render as tags by default
      if (!map.summaryflags) {
        map.summaryflags = { ColName: 'summaryflags', ColCellType: 'tag' } as ColumnConfig;
      }
      if (!map.reviewflags) {
        map.reviewflags = { ColName: 'reviewflags', ColCellType: 'tag' } as ColumnConfig;
      }
      if (map.saleid) {
        if (!map.saleid.ColCellType) {
          map.saleid = { ...map.saleid, ColCellType: 'link' } as ColumnConfig;
        }
      } else {
        map.saleid = { ColName: 'saleid', ColCellType: 'link' } as ColumnConfig;
      }
      setColumnConfigs(map);
    } catch {
      setColumnConfigs({});
    }
  }, [columnConfigRaw, profileKey]);

  // State
  const [currentPage, setCurrentPage] = React.useState(0);
  const [headerFilters, setHeaderFilters] = React.useState<Record<string, ColumnFilterValue>>({});

  const toApiHeaderFilters = React.useCallback(
    (filters: Record<string, ColumnFilterValue>): Record<string, string | string[]> => {
      const out: Record<string, string | string[]> = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          out[k] = v.map((x) => String(x ?? ''));
        } else if (typeof v === 'string') {
          out[k] = v;
        } else if (v && typeof v === 'object') {
          out[k] = [JSON.stringify(v)];
        }
      });
      return out;
    },
    [],
  );
  const lastAppliedFiltersRef = React.useRef<Record<string, ColumnFilterValue>>({});
  const [clientSort, setClientSort] = React.useState<{ name: string; sortDirection: number } | undefined>({
    name: 'taskid',
    sortDirection: 0,
  });
  const [userSortActive, setUserSortActive] = React.useState(false);
  const [searchFilters, setSearchFilters] = React.useState<GridFilterState>(SALES_SEARCH_DEFAULT_FILTERS);
  const [prefilters, setPrefilters] = React.useState<ManagerPrefilterState | undefined>(undefined);
  const [prefilterApplied, setPrefilterApplied] = React.useState(false);
  const appliedPrefilterSnapshotRef = React.useRef<string>(JSON.stringify(null));
  const prefilterDirtyRef = React.useRef(false);
  const [searchNonce, setSearchNonce] = React.useState(0);

  // When the parent bumps refreshNonce (e.g. returning from details), trigger a re-fetch and clear any stale status banner.
  const refreshNonceRef = React.useRef(refreshNonce);
  React.useEffect(() => {
    if (refreshNonce !== undefined && refreshNonce !== refreshNonceRef.current) {
      refreshNonceRef.current = refreshNonce;
      setSearchNonce((n) => n + 1);
      setAssignMessage(undefined);
    }
  }, [refreshNonce]);

  const [apiFilterOptions, setApiFilterOptions] = React.useState<FilterOptionsMap>({});
  const [apiUserLookup, setApiUserLookup] = React.useState<Record<string, string>>({});
  const [apiUserFilterOptions, setApiUserFilterOptions] = React.useState<Record<string, Array<{ key: string; text: string }>>>({});
  const [billingAuthorityOptions, setBillingAuthorityOptions] = React.useState<string[]>([]);
  const [billingAuthorityOptionsLoading, setBillingAuthorityOptionsLoading] = React.useState(false);
  const [billingAuthorityOptionsError, setBillingAuthorityOptionsError] = React.useState<string | undefined>(undefined);
  const [caseworkerOptions, setCaseworkerOptions] = React.useState<string[]>([]);
  const [caseworkerOptionsLoading, setCaseworkerOptionsLoading] = React.useState(false);
  const [caseworkerOptionsError, setCaseworkerOptionsError] = React.useState<string | undefined>(undefined);
  const [qcUserOptions, setQcUserOptions] = React.useState<string[]>([]);
  const [qcUserOptionsLoading, setQcUserOptionsLoading] = React.useState(false);
  const [qcUserOptionsError, setQcUserOptionsError] = React.useState<string | undefined>(undefined);
  const [apimItems, setApimItems] = React.useState<unknown[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [serverDriven, setServerDriven] = React.useState(false);
  const [apimLoading, setApimLoading] = React.useState(false);
  const [hasLoadedApim, setHasLoadedApim] = React.useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = React.useState<string | undefined>(undefined);
  const [assignMessage, setAssignMessage] = React.useState<{ text: string; type: MessageBarType } | undefined>(undefined);
  const [assignUsers, setAssignUsers] = React.useState<AssignUser[]>([]);
  const [assignUsersLoading, setAssignUsersLoading] = React.useState(false);
  const [assignUsersError, setAssignUsersError] = React.useState<string | undefined>(undefined);
  const [assignUsersInfo, setAssignUsersInfo] = React.useState<string | undefined>(undefined);
  const [assignableUsersCache, setAssignableUsersCache] = React.useState<AssignUser[]>([]);
  const [assignPanelOpen, setAssignPanelOpen] = React.useState(false);
  const [assignPendingRefresh, setAssignPendingRefresh] = React.useState(false);
  const assignRefreshResolve = React.useRef<null | ((ok: boolean) => void)>(null);
  const assignUsersLoadKeyRef = React.useRef<string>('');
  const caseworkerOptionsLoadKeyRef = React.useRef<string>('');
  const assignableUsersCacheLoadKeyRef = React.useRef<string>('');
  const assignableUsersCacheContextsRef = React.useRef<Set<string>>(new Set());
  const metadataLoadKeyRef = React.useRef<string>('');
  const prefilterSkipLogKeyRef = React.useRef<string>('');
  const inFlightGridLoadKeyRef = React.useRef<string>('');
  const handleAssignPanelToggle = React.useCallback((isOpen: boolean): boolean => {
    if (!isOpen) {
      setAssignPanelOpen(false);
      return true;
    }

    const selected = selection.getSelection() as Record<string, unknown>[];
    const isAssignmentScreen = screenKind === 'managerAssign' || screenKind === 'qcAssign';
    if (isAssignmentScreen && selected.length > 0) {
      const statusCheck = resolveAssignmentStatusValidation(
        selected,
        screenKind,
        assignmentConfig,
        assignTasksText.messages.invalidStatus,
      );
      if (statusCheck.error) {
        setAssignMessage({ text: statusCheck.error, type: MessageBarType.error });
        return false;
      }
    }

    setAssignPanelOpen(true);
    setAssignUsers([]);
    setAssignUsersError(undefined);
    setAssignUsersInfo(undefined);
    setAssignUsersLoading(true);
    return true;
  }, [assignmentConfig, assignTasksText.messages.invalidStatus, screenKind]);
  // Defer persistence until after initial hydration to avoid add/remove flicker in localStorage
  const [hydrated, setHydrated] = React.useState(false);
  const resetHostResultsState = React.useCallback(() => {
    setApimLoading((prev) => (prev ? false : prev));
    setHasLoadedApim((prev) => (prev ? false : prev));
    setApimItems((prev) => (prev.length > 0 ? [] : prev));
    setTotalCount((prev) => (prev !== 0 ? 0 : prev));
    setServerDriven((prev) => (prev ? false : prev));
    setApiFilterOptions((prev) => (Object.keys(prev).length > 0 ? {} : prev));
    setApiUserLookup((prev) => (Object.keys(prev).length > 0 ? {} : prev));
    setApiUserFilterOptions((prev) => (Object.keys(prev).length > 0 ? {} : prev));
    setLoadErrorMessage((prev) => (prev !== undefined ? undefined : prev));
  }, []);
  const allowColumnReorder = (context.parameters as unknown as Record<string, { raw?: string | boolean }>).allowColumnReorder?.raw === true ||
    String((context.parameters as unknown as Record<string, { raw?: string | boolean }>).allowColumnReorder?.raw ?? '').toLowerCase() === 'true';
  const isManagerAssign = screenKind === 'managerAssign';
  const isQcAssign = screenKind === 'qcAssign';
  const isCaseworkerView = screenKind === 'caseworkerView';
  const isQcView = screenKind === 'qcView';
  const isSalesSearch = screenKind === 'salesSearch';
  const isAssignment = isManagerAssign || isQcAssign;
  const isPrefilterScreen = isManagerAssign || isCaseworkerView || isQcAssign || isQcView;
  let assignmentContextKey = '';
  if (isManagerAssign) {
    assignmentContextKey = 'manager';
  } else if (isQcAssign) {
    assignmentContextKey = 'qa';
  }
  const assignmentContextScreenName = React.useMemo(() => {
    return resolveAssignmentScreenName(canvasScreenName ?? '', screenKind);
  }, [canvasScreenName, screenKind]);
  const userMappingScreenName = QC_ASSIGNMENT_SCREEN_NAME;
  const requiresCurrentUserEntra = isCaseworkerView || isQcView;

  // For prefilter screens (caseworkerView, qcView, etc.), when refreshNonce bumps (returning from details),
  // automatically re-apply the prefilter state so the main load effect proceeds with the API call.
  const lastRefreshNonceRef = React.useRef<number | undefined>(refreshNonce);
  React.useEffect(() => {
    if (!isPrefilterScreen || prefilterApplied || !prefilters) return;
    if (prefilterDirtyRef.current) return;
    if (refreshNonce !== undefined && refreshNonce !== lastRefreshNonceRef.current) {
      lastRefreshNonceRef.current = refreshNonce;
      const currentPrefilterSnapshot = JSON.stringify(prefilters ?? null);
      const hasAppliedSnapshot = appliedPrefilterSnapshotRef.current !== JSON.stringify(null);
      const canAutoReapply = hasAppliedSnapshot && currentPrefilterSnapshot === appliedPrefilterSnapshotRef.current;
      if (!canAutoReapply) {
        console.debug('[Prefilter] refresh auto-apply skipped (dirty prefilters)', {
          screen: screenKind,
          refreshNonce,
          prefilters,
        });
        return;
      }
      console.debug('[Prefilter] auto-apply on refresh', {
        screen: screenKind,
        refreshNonce,
        prefilters,
      });
      setPrefilterApplied(true);
    }
  }, [isPrefilterScreen, prefilterApplied, prefilters, refreshNonce, screenKind]);

  const [resolvedCurrentUserEntraId, setResolvedCurrentUserEntraId] = React.useState('');
  const [currentUserEntraLoading, setCurrentUserEntraLoading] = React.useState(false);
  const currentUserId = React.useMemo(
    () => normalizeUserId(resolvedCurrentUserEntraId).toLowerCase(),
    [resolvedCurrentUserEntraId],
  );

  const userContextApiName = React.useMemo(() => {
    const raw = (context.parameters as unknown as Record<string, { raw?: string }>).userContextApiName?.raw;
    const fromContext = normalizeCustomApiName(typeof raw === 'string' ? raw : undefined);
    const fallback = normalizeCustomApiName(CONTROL_CONFIG.userContextApiName);
    return fromContext || fallback || '';
  }, [context]);

  const userContextApiType = React.useMemo(() => {
    const raw = (context.parameters as unknown as Record<string, { raw?: string }>).userContextApiType?.raw;
    const fromContext = typeof raw === 'string' ? raw : undefined;
    return resolveCustomApiOperationType(fromContext ?? CONTROL_CONFIG.userContextApiType ?? CONTROL_CONFIG.customApiType);
  }, [context]);

  React.useEffect(() => {
    let active = true;

    if (!requiresCurrentUserEntra) {
      setCurrentUserEntraLoading(false);
      return () => {
        active = false;
      };
    }

    if (!userContextApiName) {
      setResolvedCurrentUserEntraId('');
      setCurrentUserEntraLoading(false);
      return () => {
        active = false;
      };
    }

    setCurrentUserEntraLoading(true);
    const loadCurrentUserEntra = async (): Promise<void> => {
      try {
        const rawPayload = await executeUnboundCustomApi<unknown>(
          context,
          userContextApiName,
          {},
          { operationType: userContextApiType },
        );
        if (!active) return;
        setResolvedCurrentUserEntraId(parseUserContextEntraObjectId(rawPayload));
      } catch {
        if (!active) return;
        setResolvedCurrentUserEntraId('');
      } finally {
        if (active) {
          setCurrentUserEntraLoading(false);
        }
      }
    };

    loadCurrentUserEntra().catch(() => undefined);

    return () => {
      active = false;
    };
  }, [context, requiresCurrentUserEntra, userContextApiName, userContextApiType]);
  const [salesSearchApplied, setSalesSearchApplied] = React.useState(!isSalesSearch);
  const handlePrefilterDirty = React.useCallback(() => {
    if (!isPrefilterScreen) return;
    prefilterDirtyRef.current = true;
    setPrefilterApplied(false);
  }, [isPrefilterScreen]);
  const handleSalesSearchDirty = React.useCallback(() => {
    if (!isSalesSearch) return;
    setSalesSearchApplied(false);
  }, [isSalesSearch]);
  const lastSalesModeRef = React.useRef<boolean | undefined>(undefined);
  const lastScreenKindRef = React.useRef<ScreenKind | undefined>(undefined);

  React.useEffect(() => {
    if (lastSalesModeRef.current === isSalesSearch) return;
    lastSalesModeRef.current = isSalesSearch;
    if (isSalesSearch) {
      setSalesSearchApplied(false);
      setSearchFilters(SALES_SEARCH_DEFAULT_FILTERS);
      setCurrentPage(0);
      setHeaderFilters({});
      lastAppliedFiltersRef.current = {};
      setHasLoadedApim(false);
      setApimItems([]);
      setTotalCount(0);
      setServerDriven(false);
      setApiFilterOptions({});
      setApiUserLookup({});
      setApiUserFilterOptions({});
      setLoadErrorMessage(undefined);
      return;
    }
    // Non-sales screens should not inject a transient taskStatus filter,
    // otherwise prefilter auto-apply can trigger a double-load race on entry.
    setSalesSearchApplied(true);
    setSearchFilters(createDefaultGridFilters());
  }, [isSalesSearch]);

  const parseAssignableUsersResponse = React.useCallback(
    (response?: { Result?: string; result?: string }) => parseAssignableUsersResponseBase(response, assignTasksText.messages),
    [assignTasksText.messages],
  );

  const getUserDisplayName = React.useCallback((user: AssignUser): string => {
    const first = String(user?.firstName ?? '').trim();
    const last = String(user?.lastName ?? '').trim();
    const full = `${first} ${last}`.trim();
    if (full) return full;
    const email = String(user?.email ?? '').trim();
    if (email) return email;
    return String(user?.id ?? '').trim();
  }, []);

  const isQcAssignableUser = React.useCallback(
    (user: AssignUser) => isAssignableUserInGroup(user, QA_TEAM_NAMES, QA_ROLE_NAMES),
    [],
  );
  const isCaseworkerAssignableUser = React.useCallback(
    (user: AssignUser) => isAssignableUserInGroup(user, CASEWORKER_TEAM_NAMES, CASEWORKER_ROLE_NAMES),
    [],
  );

  const caseworkerNameToIdMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    assignableUsersCache.forEach((user) => {
      const id = normalizeUserId(String(user?.id ?? ''));
      if (!id) return;
      const name = getUserDisplayName(user).trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (!map[key]) {
        map[key] = id;
      }
    });
    return map;
  }, [assignableUsersCache, getUserDisplayName]);

  const systemUserIdToEntraIdMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    assignableUsersCache.forEach((user) => {
      const systemUserId = normalizeUserId(String(user.systemUserId ?? '')).toLowerCase();
      const entraId = normalizeUserId(String(user.entraObjectId ?? user.id ?? '')).toLowerCase();
      if (systemUserId && entraId && isGuidValue(entraId)) {
        map[systemUserId] = entraId;
      }
    });
    if (currentSystemUserId && currentUserId) {
      map[currentSystemUserId] = currentUserId;
    }
    return map;
  }, [assignableUsersCache, currentSystemUserId, currentUserId]);

  const knownEntraIds = React.useMemo(() => {
    const ids = new Set<string>();
    assignableUsersCache.forEach((user) => {
      const entraId = normalizeUserId(String(user.entraObjectId ?? user.id ?? '')).toLowerCase();
      if (entraId && isGuidValue(entraId)) {
        ids.add(entraId);
      }
    });
    if (currentUserId && isGuidValue(currentUserId)) {
      ids.add(currentUserId);
    }
    return ids;
  }, [assignableUsersCache, currentUserId]);

  const normalizePrefilterGuidToEntra = React.useCallback((value: string): string => {
    const normalized = normalizeUserId(String(value ?? '')).toLowerCase();
    if (!normalized || !isGuidValue(normalized)) {
      return '';
    }
    if (knownEntraIds.has(normalized)) {
      return normalized;
    }
    return systemUserIdToEntraIdMap[normalized] ?? '';
  }, [knownEntraIds, systemUserIdToEntraIdMap]);

  const normalizePrefilterUsersToEntra = React.useCallback((values: string[]): string[] => {
    const normalizedValues = values
      .map((value) => {
        const raw = String(value ?? '').trim();
        if (!raw) return '';
        if (raw === '__all__') return raw;
        const normalizedGuid = normalizeUserId(raw).toLowerCase();
        if (isGuidValue(normalizedGuid)) {
          return normalizePrefilterGuidToEntra(normalizedGuid);
        }
        return raw;
      })
      .filter((value) => value !== '');
    return Array.from(new Set(normalizedValues));
  }, [normalizePrefilterGuidToEntra]);

  const normalizePrefilterStateUserIds = React.useCallback((state: ManagerPrefilterState): ManagerPrefilterState => {
    const normalizedCaseworkers = normalizePrefilterUsersToEntra(state.caseworkers ?? []);
    if ((state.caseworkers ?? []).join('|') === normalizedCaseworkers.join('|')) {
      return state;
    }
    return {
      ...state,
      caseworkers: normalizedCaseworkers,
    };
  }, [normalizePrefilterUsersToEntra]);

  const mapCaseworkerNamesToIds = React.useCallback(
    (values: string[]): string[] =>
      values.map((v) => {
        const raw = String(v ?? '').trim();
        if (!raw) return raw;
        if (raw === '__all__') return raw;
        const id = caseworkerNameToIdMap[raw.toLowerCase()];
        return id ?? raw;
      }),
    [caseworkerNameToIdMap],
  );

  const mapUserValueToId = React.useCallback((value: string): string => {
    const raw = String(value ?? '').trim();
    if (!raw) return raw;
    const normalized = normalizeUserId(raw);
    if (isGuidValue(normalized)) return normalized;
    const mapped = caseworkerNameToIdMap[raw.toLowerCase()];
    return mapped ?? '';
  }, [caseworkerNameToIdMap]);
  const summaryFlagOptions = React.useMemo(() => {
    const values = apiFilterOptions.summaryflags ?? apiFilterOptions.summaryflag ?? [];
    if (values.length === 0) return [];
    return Array.from(new Set(
      values
        .map((value) => String(value ?? '').trim())
        .filter((value) => value !== ''),
    ));
  }, [apiFilterOptions]);
  const resolveSummaryFlagFilterValue = React.useCallback((rawValue: string): string => {
    const trimmed = String(rawValue ?? '').trim();
    if (!trimmed) return '';
    if (summaryFlagOptions.length === 0) return trimmed;
    const lower = trimmed.toLowerCase();
    const exactLabel = summaryFlagOptions.find((option) => option.toLowerCase() === lower);
    if (exactLabel) return exactLabel;
    const exactAbbreviationMatches = summaryFlagOptions.filter(
      (option) => abbreviateSummaryFlagLabel(option).toLowerCase() === lower,
    );
    if (exactAbbreviationMatches.length === 1) return exactAbbreviationMatches[0];
    if (lower.length >= 2) {
      const abbreviationPrefixMatches = summaryFlagOptions.filter(
        (option) => abbreviateSummaryFlagLabel(option).toLowerCase().startsWith(lower),
      );
      if (abbreviationPrefixMatches.length === 1) return abbreviationPrefixMatches[0];
    }
    return trimmed;
  }, [summaryFlagOptions]);
  const normalizeSummaryFlagColumnFilters = React.useCallback(
    (filters: Record<string, ColumnFilterValue>): Record<string, ColumnFilterValue> => {
      const normalized: Record<string, ColumnFilterValue> = { ...filters };
      Object.keys(normalized).forEach((field) => {
        const key = normalizeFilterKey(field);
        if (key !== 'summaryflags' && key !== 'summaryflag') return;
        const current = normalized[field];
        if (typeof current === 'string') {
          const resolved = resolveSummaryFlagFilterValue(current);
          if (!resolved) {
            delete normalized[field];
            return;
          }
          normalized[field] = resolved;
          return;
        }

        if (!current || typeof current !== 'object' || Array.isArray(current)) return;
        const summary = current as SummaryFlagFilterValue;
        if (!Array.isArray(summary.values) || summary.values.length === 0) {
          delete normalized[field];
          return;
        }

        const resolvedValues = summary.values
          .map((value) => resolveSummaryFlagFilterValue(String(value ?? '')))
          .filter((value) => value !== '');

        if (resolvedValues.length === 0) {
          delete normalized[field];
          return;
        }

        normalized[field] = {
          ...summary,
          values: resolvedValues,
        };
      });
      return normalized;
    },
    [resolveSummaryFlagFilterValue],
  );

  const mapColumnFiltersForApi = React.useCallback(
    (
      filters: Record<string, ColumnFilterValue>,
      options?: { normalizeSummaryFlags?: boolean },
    ): Record<string, ColumnFilterValue> => {
      const mapped: Record<string, ColumnFilterValue> = options?.normalizeSummaryFlags === false
        ? { ...filters }
        : normalizeSummaryFlagColumnFilters(filters);
      (['assignedto', 'qcassignedto'] as const).forEach((field) => {
        const current = mapped[field];
        if (!current) return;
        if (typeof current === 'string') {
          const value = mapUserValueToId(current);
          if (!value) {
            delete mapped[field];
            return;
          }
          mapped[field] = value;
          return;
        }
        if (Array.isArray(current)) {
          const values = current
            .map((value) => mapUserValueToId(String(value)))
            .filter((value) => value && isGuidValue(value));
          if (values.length === 0) {
            delete mapped[field];
            return;
          }
          mapped[field] = values;
        }
      });
      return mapped;
    },
    [mapUserValueToId, normalizeSummaryFlagColumnFilters],
  );

  const mapSearchFiltersForApi = React.useCallback(
    (filters: GridFilterState): GridFilterState => {
      const assignedTo = filters.assignedTo ? mapUserValueToId(filters.assignedTo) : '';
      const qcAssignedTo = filters.qcAssignedTo ? mapUserValueToId(filters.qcAssignedTo) : '';
      const nextAssignedTo = assignedTo || undefined;
      const nextQcAssignedTo = qcAssignedTo || undefined;
      const nextTaskId = filters.taskId;
      if (nextAssignedTo === filters.assignedTo && nextQcAssignedTo === filters.qcAssignedTo && nextTaskId === filters.taskId) {
        return filters;
      }
      return { ...filters, assignedTo: nextAssignedTo, qcAssignedTo: nextQcAssignedTo, taskId: nextTaskId };
    },
    [mapUserValueToId],
  );

  const hasFullResultSet = totalCount > 0 && apimItems.length >= totalCount;
  const clientSideThreshold = Math.max(1, pageSize);
  const clientSideEligible = hasLoadedApim
    && !serverDriven
    && hasFullResultSet
    && totalCount <= clientSideThreshold;
  const shouldNormalizeSummaryFlagFilters = clientSideEligible;
  const apiHeaderFilters = React.useMemo(
    () => mapColumnFiltersForApi(headerFilters, { normalizeSummaryFlags: shouldNormalizeSummaryFlagFilters }),
    [headerFilters, mapColumnFiltersForApi, shouldNormalizeSummaryFlagFilters],
  );
  const activeClientSort = userSortActive ? clientSort : undefined;
  const serverClientSort = clientSideEligible ? undefined : activeClientSort;
  const columnFilterQuery = React.useMemo(
    () => buildColumnFilterQuery(tableKey, apiHeaderFilters, serverClientSort),
    [apiHeaderFilters, serverClientSort, tableKey],
  );
  const buildCaseworkerNames = React.useCallback((users: AssignUser[]): string[] => {
    const names = (users ?? [])
      .map((user) => getUserDisplayName(user))
      .filter((name) => !!name);

    const unique = Array.from(new Set(names));
    unique.sort((a, b) => a.localeCompare(b));
    return unique;
  }, [getUserDisplayName]);

  const mergeAssignableUsers = React.useCallback((prev: AssignUser[], next: AssignUser[]): AssignUser[] => {
    const map = new Map<string, AssignUser>();
    prev.forEach((u) => {
      const id = normalizeAssignableUserId(u.id);
      if (id) map.set(id, { ...u, id });
    });
    next.forEach((u) => {
      const id = normalizeAssignableUserId(u.id);
      if (id) map.set(id, { ...u, id });
    });
    return Array.from(map.values());
  }, []);

  const userDisplayNameMap = React.useMemo(
    () => buildUserDisplayNameMap(apiUserLookup, assignableUsersCache, getUserDisplayName),
    [apiUserLookup, assignableUsersCache, getUserDisplayName],
  );
  const hasUserDisplayNameMap = React.useMemo(() => Object.keys(userDisplayNameMap).length > 0, [userDisplayNameMap]);
  React.useEffect(() => {
    if (onUserDisplayNameMapChange && hasUserDisplayNameMap) {
      onUserDisplayNameMapChange(userDisplayNameMap);
    }
  }, [userDisplayNameMap, hasUserDisplayNameMap, onUserDisplayNameMapChange]);
  const mapUserIdToDisplay = React.useCallback((value: string): string => {
    const raw = String(value ?? '').trim();
    if (!raw) return raw;
    const normalized = normalizeUserId(raw).toLowerCase();
    if (!isGuidValue(normalized)) return raw;
    return userDisplayNameMap[normalized] ?? raw;
  }, [userDisplayNameMap]);
  const mapUserIdsToNames = React.useCallback((values: string[]): string[] => {
    return values
      .map((id) => {
        const normalizedId = normalizeAssignableUserId(id);
        return normalizedId ? (userDisplayNameMap[normalizedId] ?? id) : id;
      })
      .map((v) => String(v ?? '').trim())
      .filter((v) => v !== '');
  }, [userDisplayNameMap]);
  const displayFilterOptions = React.useMemo(() => {
    if (!hasUserDisplayNameMap) return apiFilterOptions;
    const mapped: FilterOptionsMap = { ...apiFilterOptions };
    (['assignedto', 'qcassignedto'] as const).forEach((field) => {
      const values = mapped[field];
      if (!values || values.length === 0) return;
      const next = values
        .map(mapUserIdToDisplay)
        .map((v) => String(v ?? '').trim())
        .filter((v) => v !== '');
      if (next.length > 0) {
        mapped[field] = Array.from(new Set(next));
      }
    });
    return mapped;
  }, [apiFilterOptions, hasUserDisplayNameMap, mapUserIdToDisplay]);

  // Rich filter options: for user fields, emit {key: GUID, text: displayName} so the GUID
  // is stored in column filter state and sent to the API, while only the name is shown in the UI.
  const displayFilterOptionsRich = React.useMemo((): Record<string, Array<string | { key: string; text: string }>> => {
    const base: Record<string, Array<string | { key: string; text: string }>> = { ...displayFilterOptions };
    (['assignedto', 'qcassignedto'] as const).forEach((field) => {
      // Prefer API-supplied objects (already have correct GUIDs as keys).
      if (apiUserFilterOptions[field] && apiUserFilterOptions[field].length > 0) {
        // If plugin cache is loaded, refresh display names from it for any matching GUIDs.
        if (hasUserDisplayNameMap) {
          base[field] = apiUserFilterOptions[field].map((o) => ({
            key: o.key,
            text: userDisplayNameMap[o.key] ?? o.text,
          }));
        } else {
          base[field] = apiUserFilterOptions[field];
        }
        return;
      }
      // Fallback: rebuild {key, text} from raw GUIDs in apiFilterOptions via the display map.
      const rawValues = apiFilterOptions[field];
      if (!rawValues || rawValues.length === 0) return;
      const seen = new Set<string>();
      const items: Array<{ key: string; text: string }> = [];
      rawValues.forEach((guid) => {
        const normalizedGuid = guid.trim().toLowerCase();
        if (!normalizedGuid || seen.has(normalizedGuid)) return;
        seen.add(normalizedGuid);
        items.push({ key: normalizedGuid, text: userDisplayNameMap[normalizedGuid] ?? guid });
      });
      if (items.length > 0) base[field] = items;
    });
    return base;
  }, [apiFilterOptions, apiUserFilterOptions, displayFilterOptions, hasUserDisplayNameMap, mapUserIdsToNames, userDisplayNameMap]);

  // Persist header filters per table for consistent UX across reloads
  const storageKey = React.useMemo(() => `voa-grid-filters:${tableKey}:${contextScopeKey}`, [contextScopeKey, tableKey]);
  const storageKeySort = React.useMemo(() => `voa-grid-sort:${tableKey}:${contextScopeKey}`, [contextScopeKey, tableKey]);
  const storageKeyPage = React.useMemo(() => `voa-grid-page:${tableKey}:${contextScopeKey}`, [contextScopeKey, tableKey]);
  const prefilterStorageKey = React.useMemo(() => buildPrefilterStorageKey(tableKey, screenKind, contextScopeKey), [contextScopeKey, screenKind, tableKey]);
  const legacyPrefilterStorageKey = React.useMemo(
    () => `voa-prefilters:${tableKey}:${screenName || 'default'}:${contextScopeKey}`,
    [contextScopeKey, screenName, tableKey],
  );
  const screenInstanceKey = React.useMemo(() => buildGridSessionKey(tableKey, screenKind, contextScopeKey), [contextScopeKey, screenKind, tableKey]);
  const salesSearchStorageKey = React.useMemo(
    () => `voa-sales-search:${tableKey}:${screenName || 'default'}:${contextScopeKey}`,
    [contextScopeKey, screenName, tableKey],
  );
  const salesSearchHydratedRef = React.useRef<string>('');
  // Some environments show keys without ':' in DevTools; support both forms for compatibility
  const storageKeyNC = React.useMemo(() => storageKey.replace(':', ''), [storageKey]);
  const storageKeySortNC = React.useMemo(() => storageKeySort.replace(':', ''), [storageKeySort]);
  const storageKeyPageNC = React.useMemo(() => storageKeyPage.replace(':', ''), [storageKeyPage]);
  const [restoredGridStateKey, setRestoredGridStateKey] = React.useState('');
  const [restoredSalesSearchKey, setRestoredSalesSearchKey] = React.useState('');

  React.useEffect(() => {
    if (isManagerAssign || isQcAssign) {
      setSearchFilters(createDefaultGridFilters());
    }
  }, [isManagerAssign, isQcAssign]);

  React.useEffect(() => {
    if (!isSalesSearch) return;
    if (salesSearchHydratedRef.current === salesSearchStorageKey) return;
    salesSearchHydratedRef.current = salesSearchStorageKey;
    try {
      const raw = localStorage.getItem(salesSearchStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { filters?: GridFilterState; applied?: boolean } | undefined;
      const merged = {
        ...SALES_SEARCH_DEFAULT_FILTERS,
        ...(parsed?.filters ?? {}),
      } as GridFilterState;
      const normalized = sanitizeFilters(merged);
      const isDefault = isSalesSearchDefaultFilters(normalized);
      const shouldApply = parsed?.applied === false ? false : !isDefault;
      setSearchFilters(normalized);
      setSalesSearchApplied(shouldApply);
      if (shouldApply) {
        setSearchNonce((n) => n + 1);
      }
    } catch {
      // ignore restore failures
    } finally {
      setRestoredSalesSearchKey(salesSearchStorageKey);
    }
  }, [isSalesSearch, salesSearchStorageKey]);
  // Hydrate from localStorage on table change (URL persistence disabled by policy)
  React.useEffect(() => {
    try {
      const sessionScreens = readStoredSessionScreens();
      const normalizedFilters = restoreStoredHeaderFilters(String(tableKey), storageKey, storageKeyNC);
      lastAppliedFiltersRef.current = normalizedFilters;
      setHeaderFilters(normalizedFilters);
      if (Object.keys(normalizedFilters).length > 0) {
        try {
          onColumnFiltersApply?.(
            toApiHeaderFilters(
              mapColumnFiltersForApi(normalizedFilters, { normalizeSummaryFlags: shouldNormalizeSummaryFlagFilters }),
            ),
          );
        } catch {
          /* ignore */
        }
      }

      const parsedSort = restoreStoredSort(storageKeySort, storageKeySortNC);
      if (parsedSort) {
        setClientSort(parsedSort);
      }
      setUserSortActive(!!parsedSort);
      setCurrentPage(restoreStoredPage(storageKeyPage, storageKeyPageNC));
      persistSessionScreenState(sessionScreens, screenInstanceKey);
    } catch {
      // ignore hydrate failures
    }
    // Mark hydration complete so persistence can begin on subsequent changes
    setHydrated(true);
    setRestoredGridStateKey(screenInstanceKey);
  }, [
    mapColumnFiltersForApi,
    onColumnFiltersApply,
    screenInstanceKey,
    storageKey,
    storageKeyNC,
    storageKeySort,
    storageKeySortNC,
    storageKeyPage,
    storageKeyPageNC,
    tableKey,
    toApiHeaderFilters,
    shouldNormalizeSummaryFlagFilters,
  ]);
  // Persist to localStorage whenever filters/page/sort change
  React.useEffect(() => {
    if (!hydrated) return; // skip initial mount until hydration finishes
    try {
      // localStorage
      if (Object.keys(headerFilters).length === 0) {
        localStorage.removeItem(storageKey); localStorage.removeItem(storageKeyNC);
      } else {
        const arrayStore = serializeColumnFiltersForStorage(headerFilters);
        const filtersJSON = JSON.stringify(arrayStore);
        localStorage.setItem(storageKey, filtersJSON);
        localStorage.setItem(storageKeyNC, filtersJSON);
      }
      if (shouldPersistSortState(clientSort, userSortActive)) {
        const sortJSON = JSON.stringify(clientSort);
        localStorage.setItem(storageKeySort, sortJSON);
        localStorage.setItem(storageKeySortNC, sortJSON);
      } else {
        localStorage.removeItem(storageKeySort); localStorage.removeItem(storageKeySortNC);
      }
      localStorage.setItem(storageKeyPage, String(currentPage));
      localStorage.setItem(storageKeyPageNC, String(currentPage));
    } catch {
      // ignore persist failures
    }
  }, [headerFilters, clientSort, currentPage, storageKey, storageKeyNC, storageKeySort, storageKeySortNC, storageKeyPage, storageKeyPageNC, hydrated, userSortActive]);

  React.useEffect(() => {
    if (!isSalesSearch) return;
    try {
      const isDefault = isSalesSearchDefaultFilters(searchFilters);
      if (isDefault && !salesSearchApplied) {
        localStorage.removeItem(salesSearchStorageKey);
      } else {
        localStorage.setItem(
          salesSearchStorageKey,
          JSON.stringify({ filters: searchFilters, applied: salesSearchApplied }),
        );
      }
    } catch {
      // ignore storage failures
    }
  }, [isSalesSearch, salesSearchApplied, salesSearchStorageKey, searchFilters]);

  // Build columns from defined config only (no auto-add from API fields).
  const datasetColumns = React.useMemo(() => {
    const t0 = performance.now();
    const cols = buildColumns(columnDisplayNames, columnConfigs, undefined);
    const t1 = performance.now();
    logPerf('[Grid Perf] Build columns (ms):', Math.round(t1 - t0), 'count:', cols.length);
    return cols;
  }, [columnConfigs, columnDisplayNames]);

  const clientUrl = resolveClientUrl(context);

  // Records mapping
  const { records, ids } = React.useMemo(() => {
    const t0 = performance.now();
    const recs: Record<string, ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> = {};
    const all: string[] = [];
    if (hasLoadedApim && apimItems.length > 0) {
      const mapped = mapApimItemsToEntityRecords(apimItems, clientUrl, hasUserDisplayNameMap, userDisplayNameMap);
      Object.assign(recs, mapped.records);
      all.push(...mapped.ids);
    } else if (isLocalHost) {
      ensureSampleColumns(datasetColumns, columnDisplayNames);
      const sample = buildSampleEntityRecords();
      Object.assign(recs, sample.records);
      all.push(...sample.ids);
    }
    const t1 = performance.now();
    logPerf('[Grid Perf] Map records (ms):', Math.round(t1 - t0), 'count:', all.length);
    return { records: recs, ids: all };
  }, [apimItems, clientUrl, columnDisplayNames, datasetColumns, hasLoadedApim, hasUserDisplayNameMap, isLocalHost, userDisplayNameMap]);

  const disableClientFiltering = hasLoadedApim && !clientSideEligible;

  const getFilterableText = React.useCallback((raw: unknown): string => {
    if (Array.isArray(raw)) {
      return raw
        .map((v) => (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? String(v) : ''))
        .filter((s) => s !== '')
        .join(', ');
    }
    if (typeof raw === 'string') return raw;
    if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw);
    return '';
  }, []);

  const filteredIds = React.useMemo(() => {
    if (disableClientFiltering) {
      return ids;
    }
    const t0 = performance.now();
    const out = filterItemsByColumnFilters(
      ids,
      headerFilters,
      tableKey,
      getFilterableText,
      (id, field) => (records[id] as unknown as Record<string, unknown>)[field],
    );
    const t1 = performance.now();
    logPerf('[Grid Perf] Host filter ids (ms):', Math.round(t1 - t0), 'ids:', ids.length, 'filters:', Object.keys(headerFilters).length, 'result:', out.length);
    return out;
  }, [disableClientFiltering, getFilterableText, headerFilters, ids, records, tableKey]);

  const sortedIds = React.useMemo(() => {
    if (!clientSideEligible || !userSortActive || !clientSort) return filteredIds;
    const t0 = performance.now();
    const field = clientSort.name?.toLowerCase?.() ?? '';
    const dateFields = new Set(['transactiondate', 'assigneddate', 'taskcompleteddate', 'qcassigneddate', 'qccompleteddate']);
    const desc = clientSort.sortDirection === 1;
    const toFirstWordKey = (value: unknown): string => {
      const toText = (input: unknown): string => {
        if (typeof input === 'string') return input;
        if (typeof input === 'number' || typeof input === 'boolean') return String(input);
        return '';
      };

      // Align list fields (for example summary flags) with current multi-page behavior: sort by first word.
      const source = Array.isArray(value)
        ? value.map((entry) => toText(entry).trim()).find((entry) => entry.length > 0) ?? ''
        : toText(value);
      const firstToken = source.split(/[;,|]/)[0] ?? '';
      const firstWord = firstToken.trim().toLowerCase().split(/\s+/)[0] ?? '';
      return firstWord;
    };
    const getVal = (id: string): string => {
      const rec = records[id] as unknown as Record<string, unknown>;
      const v = rec[field];
      if (dateFields.has(field)) {
        const raw = typeof v === 'string' || typeof v === 'number' ? String(v) : '';
        return toSortableDateKey(raw);
      }
      if (Array.isArray(v)) return toFirstWordKey(v);
      if (typeof v === 'number') return String(v);
      if (typeof v === 'boolean') return v ? '1' : '0';
      if (typeof v === 'string') return toFirstWordKey(v);
      return '';
    };
    const arr = filteredIds.slice();
    arr.sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      const cmp = va.localeCompare(vb, undefined, { numeric: true, sensitivity: 'base' });
      return desc ? -cmp : cmp;
    });
    const t1 = performance.now();
    logPerf('[Grid Perf] Host sort (ms):', Math.round(t1 - t0), 'field:', field, 'desc:', desc, 'count:', arr.length);
    return arr;
  }, [clientSideEligible, clientSort, filteredIds, records, userSortActive]);

  const start = currentPage * pageSize;
  const pageIds = React.useMemo(() => {
    if (serverDriven) return filteredIds;
    const pageSliceT0 = performance.now();
    const slice = sortedIds.slice(start, start + pageSize);
    const pageSliceT1 = performance.now();
    if (sortedIds.length > 0) {
      logPerf('[Grid Perf] Host page slice (ms):', Math.round(pageSliceT1 - pageSliceT0), 'start:', start, 'size:', pageSize, 'result:', slice.length);
    }
    return slice;
  }, [filteredIds, serverDriven, sortedIds, start, pageSize]);
  const canPrev = currentPage > 0;
  const canNext = serverDriven ? (currentPage + 1) * pageSize < totalCount : start + pageSize < filteredIds.length;
  const totalPages = serverDriven ? Math.ceil(totalCount / pageSize) : Math.ceil(filteredIds.length / pageSize);

  // If externalItems are provided, use them and skip APIM loading
  React.useEffect(() => {
    if (externalItems !== undefined) {
      setApimLoading(false);
      setApimItems(externalItems ?? []);
      setTotalCount((externalItems ?? []).length);
      setServerDriven(false);
      setHasLoadedApim(true);
      setLoadErrorMessage(undefined);
    }
  }, [externalItems]);

  // Initial load and reloads when critical props change (skips when externalItems are supplied)
  const lastRef = React.useRef<{
    table?: string;
    trigger?: string;
    page?: number;
    size?: number;
    sort?: string;
    nonce?: number;
    columnFilters?: string;
    contextScope?: string;
  }>({});
  React.useEffect(() => {
    const handleScreenTransitionReset = (): boolean => {
      const prevKind = lastScreenKindRef.current;
      const screenKindChanged = prevKind !== undefined && prevKind !== screenKind;
      const switchedSalesToManager = screenKindChanged && prevKind === 'salesSearch' && isManagerAssign;
      const switchedToCaseworker = screenKindChanged && isCaseworkerView;
      const switchedToQcAssign = screenKindChanged && isQcAssign;
      const switchedToQcView = screenKindChanged && isQcView;
      lastScreenKindRef.current = screenKind;

      if (!(switchedSalesToManager || switchedToCaseworker || switchedToQcAssign || switchedToQcView)) {
        return false;
      }
      let hasStoredPrefilter = false;
      try {
        hasStoredPrefilter = !!localStorage.getItem(prefilterStorageKey);
        if (!hasStoredPrefilter && legacyPrefilterStorageKey !== prefilterStorageKey) {
          hasStoredPrefilter = !!localStorage.getItem(legacyPrefilterStorageKey);
        }
      } catch {
        hasStoredPrefilter = false;
      }

      setPrefilters(undefined);
      setPrefilterApplied(false);
      appliedPrefilterSnapshotRef.current = JSON.stringify(null);
      prefilterDirtyRef.current = false;
      setHasLoadedApim(false);
      setApimItems([]);
      setTotalCount(0);
      setServerDriven(false);
      setApiFilterOptions({});
      setApiUserLookup({});
      setApiUserFilterOptions({});
      setLoadErrorMessage(undefined);
      selection.setAllSelected(false);
      setSelectedCount(0);
      onSelectionCountChange?.(0);
      onSelectionChange?.({ selectedTaskIds: [], selectedSaleIds: [] });
      if (!hasStoredPrefilter) {
        setCurrentPage(0);
        setSearchFilters(createDefaultGridFilters());
        setUserSortActive(false);
        setHeaderFilters({});
        lastAppliedFiltersRef.current = {};
      }
      return true;
    };

    if (handleScreenTransitionReset()) {
      return;
    }

    const shouldSkipLoad = (): boolean => {
      if (externalItems !== undefined) {
        // External data path; do not load from APIM
        return true;
      }
      if (restoredGridStateKey !== screenInstanceKey) {
        prefilterSkipLogKeyRef.current = '';
        setApimLoading(false);
        return true;
      }
      if (isSalesSearch && restoredSalesSearchKey !== salesSearchStorageKey) {
        prefilterSkipLogKeyRef.current = '';
        setApimLoading(false);
        return true;
      }
      if (isSalesSearch && !salesSearchApplied) {
        prefilterSkipLogKeyRef.current = '';
        resetHostResultsState();
        return true;
      }
      const pendingScreenKindChange = lastScreenKindRef.current !== undefined && lastScreenKindRef.current !== screenKind;
      if (pendingScreenKindChange) {
        prefilterSkipLogKeyRef.current = '';
        setApimLoading(false);
        return true;
      }
      if (isPrefilterScreen && prefilterApplied) {
        if (prefilterDirtyRef.current) {
          prefilterSkipLogKeyRef.current = '';
          setPrefilterApplied(false);
          resetHostResultsState();
          return true;
        }
        const currentPrefilterSnapshot = JSON.stringify(prefilters ?? null);
        // If user edits prefilters after an applied search, treat it as dirty immediately
        // and block host loads until Search/Apply is explicitly triggered again.
        if (currentPrefilterSnapshot !== appliedPrefilterSnapshotRef.current) {
          prefilterSkipLogKeyRef.current = '';
          setPrefilterApplied(false);
          resetHostResultsState();
          return true;
        }
        const needsCompletedFromDate = (isQcAssign || isQcView)
          ? isQcCompletedWorkThat(prefilters?.workThat)
          : isManagerCompletedWorkThat(prefilters?.workThat);
        if (needsCompletedFromDate && !prefilters?.completedFrom) {
          prefilterSkipLogKeyRef.current = '';
          setPrefilterApplied(false);
          resetHostResultsState();
          return true;
        }
      }
      if (isPrefilterScreen && !prefilterApplied) {
        const skipKey = `${screenKind}|${prefilterApplied ? '1' : '0'}|${JSON.stringify(prefilters ?? null)}`;
        if (prefilterSkipLogKeyRef.current !== skipKey) {
          prefilterSkipLogKeyRef.current = skipKey;
          console.debug('[Prefilter] host load skip', {
            screen: screenKind,
            prefilterApplied,
            prefilters,
          });
        }
        resetHostResultsState();
        return true;
      }
      return false;
    };

    if (shouldSkipLoad()) {
      return;
    }

    prefilterSkipLogKeyRef.current = '';
    const trigger = String((context.parameters as unknown as Record<string, { raw?: string | number }>).searchTrigger?.raw ?? '');
    const sortKey = serverClientSort ? `${serverClientSort.name}:${serverClientSort.sortDirection}` : '';
    const nextSortKey = clientSideEligible ? lastRef.current.sort : sortKey;
    const nextColumnFilters = columnFilterQuery;
    const changed = lastRef.current.table !== tableKey
      || lastRef.current.trigger !== trigger
      || lastRef.current.page !== currentPage
      || lastRef.current.size !== pageSize
      || lastRef.current.sort !== nextSortKey
      || lastRef.current.nonce !== searchNonce
      || lastRef.current.columnFilters !== nextColumnFilters
      || lastRef.current.contextScope !== contextScopeKey
      || (!hasLoadedApim && !apimLoading);
    if (!changed) return;
    // Guard first: if the Entra user context is still loading, show the loading state but do NOT
    // consume lastRef (don't update the nonce). When the user context resolves the nonce will
    // still be "dirty" and the effect will re-run with changed=true to make the actual API call.
    if (requiresCurrentUserEntra && currentUserEntraLoading) {
      setLoadErrorMessage(undefined);
      setApimLoading(true);
      return;
    }
    lastRef.current = {
      table: tableKey,
      trigger,
      page: currentPage,
      size: pageSize,
      sort: nextSortKey,
      nonce: searchNonce,
      columnFilters: nextColumnFilters,
      contextScope: contextScopeKey,
    };
    if (requiresCurrentUserEntra && !currentUserId) {
      resetHostResultsState();
      setLoadErrorMessage('Unable to resolve current user Entra ID.');
      return;
    }
      const requestedBy = (isCaseworkerView || isQcView) && currentUserId
        ? currentUserId.toLowerCase()
        : undefined;
      const normalizedPrefilters = prefilters ? normalizePrefilterStateUserIds(prefilters) : prefilters;
      // Keep status/date prefilters even when RequestedBy is set.
      // Plugin-side query builder already suppresses searchBy/preFilter for RequestedBy flows.
      const apiPrefilters = normalizedPrefilters;
      const sanitizedSearchFilters = sanitizeFilters(mapSearchFiltersForApi(searchFilters));
      const loadRequestKey = [
        tableKey,
        sourceCode,
        String(currentPage),
        String(pageSize),
        nextSortKey,
        String(searchNonce),
        columnFilterQuery,
        requestedBy ?? '',
        contextScopeKey,
        country ?? '',
        listYear ?? '',
        JSON.stringify(sanitizedSearchFilters),
        JSON.stringify(apiPrefilters ?? null),
      ].join('|');
      if (inFlightGridLoadKeyRef.current === loadRequestKey) {
        return;
      }
      inFlightGridLoadKeyRef.current = loadRequestKey;
    setLoadErrorMessage(undefined);
    setApimLoading(true);
    const loadGrid = async (): Promise<void> => {
      try {
        console.debug('[Prefilter] host load start', {
          screen: screenKind,
          prefilterApplied,
          prefilters: apiPrefilters,
          requestedBy,
          searchNonce,
        });
        const res = await loadGridData(context, {
          tableKey,
          filters: sanitizedSearchFilters,
          source: sourceCode,
          requestedBy,
          currentPage,
          pageSize,
          clientSort: serverClientSort,
          prefilters: apiPrefilters,
          searchQuery: columnFilterQuery,
          country: includeCountryListYearApiParams ? country : undefined,
          listYear: includeCountryListYearApiParams ? listYear : undefined,
        });
        if (inFlightGridLoadKeyRef.current !== loadRequestKey) {
          return;
        }
        setApimItems(res.items);
        setTotalCount(res.totalCount);
        setServerDriven(res.serverDriven);
        setApimLoading(false);
        setHasLoadedApim(true);
        setLoadErrorMessage(res.errorMessage);
        if (assignPendingRefresh && assignRefreshResolve.current) {
          assignRefreshResolve.current(true);
          assignRefreshResolve.current = null;
          setAssignPendingRefresh(false);
        }
        setApiFilterOptions(normalizeFilterOptions(tableKey, res.filters));
        setApiUserLookup(res.userLookup ?? {});
        setApiUserFilterOptions(res.userFilterOptions ?? {});
      } finally {
        if (inFlightGridLoadKeyRef.current === loadRequestKey) {
          inFlightGridLoadKeyRef.current = '';
        }
      }
    };

    loadGrid().catch(() => undefined);
  }, [context, tableKey, sourceCode, searchFilters, currentPage, pageSize, clientSort, userSortActive, clientSideEligible, searchNonce, hasLoadedApim, apimLoading, currentUserEntraLoading, prefilters, prefilterApplied, isCaseworkerView, currentUserId, isPrefilterScreen, isQcView, isSalesSearch, normalizePrefilterStateUserIds, requiresCurrentUserEntra, salesSearchApplied, prefilterStorageKey, screenKind, columnFilterQuery, mapSearchFiltersForApi, resetHostResultsState, country, listYear, contextScopeKey, restoredGridStateKey, screenInstanceKey, restoredSalesSearchKey, salesSearchStorageKey]);

  React.useEffect(() => {
    if (!assignPanelOpen || !assignmentContextKey) {
      assignUsersLoadKeyRef.current = '';
      applyAssignUsersState({ users: [], error: undefined, info: undefined, loading: false });
      if (!assignPanelOpen) {
        applyAssignUsersState({ users: [], error: undefined, info: undefined });
      }
      return;
    }

    const apiName = resolveAssignableUsersApiName();
    if (!apiName) {
      applyAssignUsersState({
        users: [],
        error: assignTasksText.messages.assignableUsersApiNotConfigured,
        info: undefined,
        loading: false,
      });
      return;
    }

    const customApiType = resolveCustomApiTypeForAssignableUsers();
    const cacheContextKey = buildAssignableUsersCacheKey(apiName, customApiType, assignmentContextScreenName);
    const requestKey = `${assignmentContextKey}|${cacheContextKey}`;
    if (assignUsersLoadKeyRef.current === requestKey) {
      return;
    }
    assignUsersLoadKeyRef.current = requestKey;

    applyAssignUsersState({ users: [], error: undefined, info: undefined, loading: true });

    const loadAssignableUsers = async (): Promise<void> => {
      try {
        const response = await executeUnboundCustomApi<{ Result?: string; result?: string }>(
          context,
          apiName,
          { screenName: assignmentContextScreenName },
          { operationType: customApiType },
        );
        const parsed = parseAssignableUsersResponse(response);
        if (assignUsersLoadKeyRef.current !== requestKey) {
          return;
        }

        if (parsed.error) {
          applyAssignUsersState({ users: [], error: parsed.error, info: undefined });
          return;
        }

        if (parsed.info) {
          assignableUsersCacheContextsRef.current.add(cacheContextKey);
          applyAssignUsersState({ users: [], error: undefined, info: parsed.info });
          return;
        }

        const filteredUsers = isQcAssign ? parsed.users.filter(isQcAssignableUser) : parsed.users;
        if (parsed.users.length > 0) {
          setAssignableUsersCache((prev) => mergeAssignableUsers(prev, parsed.users));
          assignableUsersCacheContextsRef.current.add(cacheContextKey);
        }
        if (isQcAssign && filteredUsers.length === 0) {
          applyAssignUsersState({ users: [], error: undefined, info: assignTasksText.messages.noUsersFound });
          return;
        }
        applyAssignUsersState({ users: filteredUsers, error: undefined, info: undefined });
      } catch (err) {
        applyAssignUsersState({
          users: [],
          error: err instanceof Error ? err.message : assignTasksText.messages.assignableUsersLoadFailed,
          info: undefined,
        });
      } finally {
        if (assignUsersLoadKeyRef.current === requestKey) {
          setAssignUsersLoading(false);
        }
      }
    };

    loadAssignableUsers().catch(() => undefined);
  }, [
    assignPanelOpen,
    assignmentContextKey,
    assignTasksText.messages,
    assignmentContextScreenName,
    context,
    isQcAssign,
    isQcAssignableUser,
    parseAssignableUsersResponse,
    mergeAssignableUsers,
  ]);

  React.useEffect(() => {
    const shouldLoad = isManagerAssign || isQcAssign || isCaseworkerView;
    if (!shouldLoad) {
      caseworkerOptionsLoadKeyRef.current = '';
      applyAssignableOptionState({
        caseworkerOptions: [],
        caseworkerError: undefined,
        caseworkerLoading: false,
        qcUserOptions: [],
        qcUserError: undefined,
        qcLoading: false,
      });
      return;
    }

    const prefilterErrors = isQcAssign ? qcText.errors : managerText.errors;
    const apiName = resolveAssignableUsersApiName();
    if (!apiName) {
      const fallbackState = resolveAssignableOptionFallbackState({
        isQcAssign,
        fallbackCaseworkerOptions,
        fallbackQcUserOptions,
        error: prefilterErrors.assignableUsersApiNotConfigured,
      });
      applyAssignableOptionState({
        ...fallbackState,
        caseworkerLoading: false,
        qcLoading: false,
      });
      return;
    }

    const customApiType = resolveCustomApiTypeForAssignableUsers();
    const cacheContextKey = buildAssignableUsersCacheKey(apiName, customApiType, assignmentContextScreenName);
    const requestKey = `caseworkers|${assignmentContextKey}|${cacheContextKey}`;
    if (caseworkerOptionsLoadKeyRef.current === requestKey) {
      return;
    }
    caseworkerOptionsLoadKeyRef.current = requestKey;

    applyAssignableOptionState({
      caseworkerOptions: [],
      caseworkerError: undefined,
      caseworkerLoading: true,
      qcUserOptions: [],
      qcUserError: undefined,
      qcLoading: isQcAssign,
    });

    const loadCaseworkerOptions = async (): Promise<void> => {
      try {
        const response = await executeUnboundCustomApi<{ Result?: string; result?: string }>(
          context,
          apiName,
          { screenName: assignmentContextScreenName },
          { operationType: customApiType },
        );

        const parsed = parseAssignableUsersResponse(response);
        if (caseworkerOptionsLoadKeyRef.current !== requestKey) {
          return;
        }

        if (parsed.error) {
          applyAssignableOptionState(resolveAssignableOptionFallbackState({
            isQcAssign,
            fallbackCaseworkerOptions,
            fallbackQcUserOptions,
            error: parsed.error,
          }));
          return;
        }

        if (parsed.info) {
          assignableUsersCacheContextsRef.current.add(cacheContextKey);
          applyAssignableOptionState(resolveAssignableOptionFallbackState({
            isQcAssign,
            fallbackCaseworkerOptions,
            fallbackQcUserOptions,
            error: undefined,
          }));
          return;
        }

        const caseworkerUsers = parsed.users.filter(isCaseworkerAssignableUser);
        const qcUsers = parsed.users.filter(isQcAssignableUser);
        let caseworkerSource = caseworkerUsers;
        if (!isQcAssign && caseworkerUsers.length === 0) {
          caseworkerSource = parsed.users;
        }
        const caseworkerNames = buildCaseworkerNames(caseworkerSource);
        const qcNames = buildCaseworkerNames(qcUsers);
        applyAssignableOptionState({
          caseworkerOptions: caseworkerNames.length > 0 ? caseworkerNames : fallbackCaseworkerOptions,
          caseworkerError: undefined,
          qcUserOptions: isQcAssign ? (qcNames.length > 0 ? qcNames : fallbackQcUserOptions) : [],
          qcUserError: undefined,
        });
        setAssignableUsersCache((prev) => mergeAssignableUsers(prev, parsed.users));
        assignableUsersCacheContextsRef.current.add(cacheContextKey);
      } catch (err) {
        applyAssignableOptionState(resolveAssignableOptionFallbackState({
          isQcAssign,
          fallbackCaseworkerOptions,
          fallbackQcUserOptions,
          error: err instanceof Error ? err.message : prefilterErrors.caseworkersLoadFailed,
        }));
      } finally {
        if (caseworkerOptionsLoadKeyRef.current === requestKey) {
          setCaseworkerOptionsLoading(false);
          setQcUserOptionsLoading(false);
        }
      }
    };

    loadCaseworkerOptions().catch(() => undefined);
  }, [
    assignmentContextKey,
    buildCaseworkerNames,
    assignmentContextScreenName,
    context,
    fallbackCaseworkerOptions,
    fallbackQcUserOptions,
    isCaseworkerAssignableUser,
    isCaseworkerView,
    isManagerAssign,
    isQcAssign,
    isQcAssignableUser,
    managerText.errors,
    qcText.errors,
    parseAssignableUsersResponse,
    mergeAssignableUsers,
  ]);

  const requiresUserMapping = React.useMemo(() => {
    const assignedCfg = getColumnFilterConfigFor(tableKey, 'assignedto');
    const qcCfg = getColumnFilterConfigFor(tableKey, 'qcassignedto');
    return !!assignedCfg || !!qcCfg;
  }, [tableKey]);

  const hasGuidAssignments = React.useMemo(() => {
    if (apimItems.length === 0) return false;
    const sample = apimItems.slice(0, 50);
    const toIdList = (value: unknown): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) {
        return value.map((v) => String(v ?? '').trim()).filter((v) => v !== '');
      }
      if (typeof value === 'string') {
        return value.split(',').map((v) => v.trim()).filter((v) => v !== '');
      }
      return [];
    };
    for (const item of sample) {
      const record = item as Record<string, unknown>;
      const assignedValues = toIdList(record.assignedto ?? record.assignedTo);
      const qcAssignedValues = toIdList(record.qcassignedto ?? record.qcAssignedTo);
      for (const value of [...assignedValues, ...qcAssignedValues]) {
        const normalized = normalizeUserId(value);
        if (normalized && isGuidValue(normalized)) {
          return true;
        }
      }
    }
    return false;
  }, [apimItems]);

  React.useEffect(() => {
    if (!requiresUserMapping) return;
    if (!hasGuidAssignments) return;
    const apiName = resolveAssignableUsersApiName();
    if (!apiName) return;
    const customApiType = resolveCustomApiTypeForAssignableUsers();
    const cacheContextKey = buildAssignableUsersCacheKey(apiName, customApiType, userMappingScreenName);
    if (assignableUsersCacheContextsRef.current.has(cacheContextKey)) return;
    if (assignableUsersCacheLoadKeyRef.current === cacheContextKey) {
      return;
    }
    assignableUsersCacheLoadKeyRef.current = cacheContextKey;

    const loadUserMappings = async (): Promise<void> => {
      try {
        const response = await executeUnboundCustomApi<{ Result?: string; result?: string }>(
          context,
          apiName,
          { screenName: userMappingScreenName },
          { operationType: customApiType },
        );
        const parsed = parseAssignableUsersResponse(response);
        if (assignableUsersCacheLoadKeyRef.current !== cacheContextKey) {
          return;
        }
        if (parsed.error) {
          return;
        }
        assignableUsersCacheContextsRef.current.add(cacheContextKey);
        if (parsed.users && parsed.users.length > 0) {
          setAssignableUsersCache((prev) => mergeAssignableUsers(prev, parsed.users));
        }
      } catch {
        // ignore assignable users cache load failures
      }
    };

    loadUserMappings().catch(() => undefined);
  }, [
    context,
    hasGuidAssignments,
    mergeAssignableUsers,
    parseAssignableUsersResponse,
    requiresUserMapping,
    resolveAssignableUsersApiName,
    resolveCustomApiTypeForAssignableUsers,
    userMappingScreenName,
  ]);

  // Handlers
  const [selectedCount, setSelectedCount] = React.useState(0);
  const onSelectionChangeRef = React.useRef(onSelectionChange);
  const onSelectionCountChangeRef = React.useRef(onSelectionCountChange);
  React.useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);
  React.useEffect(() => {
    onSelectionCountChangeRef.current = onSelectionCountChange;
  }, [onSelectionCountChange]);
  const selectionRef = React.useRef<Selection<IObjectWithKey>>();
  const selection = (selectionRef.current ??= new Selection<IObjectWithKey>({
    getKey: (item: IObjectWithKey) =>
      (item as unknown as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord).getRecordId(),
    onSelectionChanged: () => {
      const selection = selectionRef.current;
      if (!selection) return;
      setSelectedCount((sel) => {
        const next = selection.getSelectedCount();
        onSelectionCountChangeRef.current?.(next);
        return next !== sel ? next : sel;
      });
      try {
        onSelectionChangeRef.current?.(extractSelectionIds(selection.getSelection()));
      } catch {
        // ignore selection mapping errors
      }
    },
  }));
  const componentRef = React.createRef<IDetailsList>();

  const onNavigate = (item?: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord): void | Promise<void> => {
    if (!item) return;
    // Records are normalized to lower‑case keys during mapping; prefer lower‑case, fall back to camelCase
    const rec = item as unknown as { taskid?: string; taskId?: string; saleid?: string; saleId?: string };
    const taskId = rec.taskid ?? rec.taskId;
    const saleId = rec.saleid ?? rec.saleId;
    // Emit only. Navigation is handled in Canvas via PCF OnChange.
    return onRowInvoke?.({ taskId, saleId, screenKind, tableKey });
  };

  const onSort = (name: string, desc: boolean): void => {
    setClientSort({ name, sortDirection: desc ? 1 : 0 });
    setUserSortActive(true);
  };

  const clearStoredSort = React.useCallback(() => {
    try {
      localStorage.removeItem(storageKeySort);
      localStorage.removeItem(storageKeySortNC);
    } catch {
      // ignore storage failures
    }
  }, [storageKeySort, storageKeySortNC]);

  const resolveAssignmentApiName = (): string => {
    const raw = (context.parameters as unknown as Record<string, { raw?: string }>).taskAssignmentApiName?.raw;
    const fromContext = normalizeCustomApiName(typeof raw === 'string' ? raw : undefined);
    const fallback = normalizeCustomApiName(CONTROL_CONFIG.taskAssignmentApiName);
    return fromContext || fallback || '';
  };

  const resolveSubmitQcRemarksApiName = (): string => {
    const raw = (context.parameters as unknown as Record<string, { raw?: string }>).submitQcRemarksApiName?.raw;
    const fromContext = normalizeCustomApiName(typeof raw === 'string' ? raw : undefined);
    const fallback = normalizeCustomApiName(CONTROL_CONFIG.submitQcRemarksApiName);
    return fromContext || fallback || '';
  };

  const resolveCustomApiTypeForAssign = (): number => {
    const raw = (context.parameters as unknown as Record<string, { raw?: string }>).taskAssignmentApiType?.raw;
    const fromContext = typeof raw === 'string' ? raw : undefined;
    const fallback = CONTROL_CONFIG.taskAssignmentApiType ?? CONTROL_CONFIG.customApiType;
    return resolveCustomApiOperationType(fromContext ?? fallback);
  };

  const resolveSubmitQcRemarksApiType = (): number => {
    const raw = (context.parameters as unknown as Record<string, { raw?: string }>).submitQcRemarksApiType?.raw;
    const fromContext = typeof raw === 'string' ? raw : undefined;
    const fallback = CONTROL_CONFIG.submitQcRemarksApiType ?? CONTROL_CONFIG.customApiType;
    return resolveCustomApiOperationType(fromContext ?? fallback);
  };

  function resolveAssignableUsersApiName(): string {
    const raw = (context.parameters as unknown as Record<string, { raw?: string }>).assignableUsersApiName?.raw;
    const fromContext = normalizeCustomApiName(typeof raw === 'string' ? raw : undefined);
    const fallback = normalizeCustomApiName(CONTROL_CONFIG.assignableUsersApiName);
    return fromContext || fallback || '';
  }

  function resolveCustomApiTypeForAssignableUsers(): number {
    const raw = (context.parameters as unknown as Record<string, { raw?: string }>).assignableUsersApiType?.raw;
    const fromContext = typeof raw === 'string' ? raw : undefined;
    const fallback = CONTROL_CONFIG.assignableUsersApiType ?? CONTROL_CONFIG.customApiType;
    return resolveCustomApiOperationType(fromContext ?? fallback);
  }

  const resolveMetadataApiName = (): string => {
    const raw = (context.parameters as unknown as Record<string, { raw?: string }>).metadataApiName?.raw;
    const fromContext = normalizeCustomApiName(typeof raw === 'string' ? raw : undefined);
    const fallback = normalizeCustomApiName(CONTROL_CONFIG.metadataApiName);
    return fromContext || fallback || '';
  };

  const resolveMetadataApiType = (): number => {
    const raw = (context.parameters as unknown as Record<string, { raw?: string }>).metadataApiType?.raw;
    const fromContext = typeof raw === 'string' ? raw : undefined;
    const fallback = CONTROL_CONFIG.metadataApiType ?? CONTROL_CONFIG.customApiType;
    return resolveCustomApiOperationType(fromContext ?? fallback);
  };

  const metadataApiName = resolveMetadataApiName();
  const metadataApiType = resolveMetadataApiType();

  React.useEffect(() => {
    const applyMetadataFallback = (errorText?: string): void => {
      if (fallbackBillingAuthorityOptions.length > 0) {
        setBillingAuthorityOptions(fallbackBillingAuthorityOptions);
        setBillingAuthorityOptionsError(undefined);
      } else {
        setBillingAuthorityOptions([]);
        setBillingAuthorityOptionsError(errorText);
      }
    };

    const shouldLoad = isManagerAssign || isSalesSearch;
    if (!shouldLoad) {
      metadataLoadKeyRef.current = '';
      setBillingAuthorityOptions([]);
      setBillingAuthorityOptionsError(undefined);
      setBillingAuthorityOptionsLoading(false);
      return;
    }

    if (!metadataApiName) {
      metadataLoadKeyRef.current = '';
      applyMetadataFallback(commonText.messages.metadataApiNotConfigured);
      setBillingAuthorityOptionsLoading(false);
      return;
    }

    const metadataLoadKey = `${screenKind}|${metadataApiName}|${metadataApiType}|${contextScopeKey}`;
    if (metadataLoadKeyRef.current === metadataLoadKey) {
      return;
    }
    metadataLoadKeyRef.current = metadataLoadKey;

    let active = true;
    setBillingAuthorityOptionsLoading(true);
    setBillingAuthorityOptionsError(undefined);

    const loadBillingAuthorityMetadata = async (): Promise<void> => {
      try {
        const metadataParams: Record<string, string> = {};
        if (includeCountryListYearApiParams) {
          if (country) metadataParams.country = country;
        }
        const rawPayload = await executeUnboundCustomApi<unknown>(
          context,
          metadataApiName,
          metadataParams,
          { operationType: metadataApiType },
        );
        const payload = parseMetadataPayload(rawPayload);
        const { values, hasAuthorityField } = extractBillingAuthorityValues(payload);

        if (!active) return;

        const finalOptions = values.length > 0 ? values : fallbackBillingAuthorityOptions;
        setBillingAuthorityOptions(finalOptions);
        if (!hasAuthorityField) {
          setBillingAuthorityOptionsError(finalOptions.length > 0 ? undefined : commonText.messages.billingAuthoritiesMissing);
        }
      } catch {
        if (!active) return;
        applyMetadataFallback(commonText.messages.billingAuthoritiesLoadFailed);
      } finally {
        if (active) {
          setBillingAuthorityOptionsLoading(false);
        }
      }
    };

    loadBillingAuthorityMetadata().catch(() => undefined);

    return () => {
      active = false;
    };
  }, [
    commonText.messages,
    context,
    fallbackBillingAuthorityOptions,
    isManagerAssign,
    isSalesSearch,
    metadataApiName,
    metadataApiType,
    country,
    listYear,
    contextScopeKey,
  ]);

  const clearCurrentSelection = React.useCallback((): void => {
    selection.setAllSelected(false);
    setSelectedCount(0);
    onSelectionCountChange?.(0);
    onSelectionChange?.({ selectedTaskIds: [], selectedSaleIds: [] });
  }, [onSelectionChange, onSelectionCountChange, selection]);

  function applyAssignUsersState(args: {
    users: AssignUser[];
    error?: string;
    info?: string;
    loading?: boolean;
  }): void {
    setAssignUsers(args.users);
    setAssignUsersError(args.error);
    setAssignUsersInfo(args.info);
    if (typeof args.loading === 'boolean') {
      setAssignUsersLoading(args.loading);
    }
  }

  function applyAssignableOptionState(args: {
    caseworkerOptions: string[];
    caseworkerError?: string;
    caseworkerLoading?: boolean;
    qcUserOptions: string[];
    qcUserError?: string;
    qcLoading?: boolean;
  }): void {
    setCaseworkerOptions(args.caseworkerOptions);
    setCaseworkerOptionsError(args.caseworkerError);
    if (typeof args.caseworkerLoading === 'boolean') {
      setCaseworkerOptionsLoading(args.caseworkerLoading);
    }
    setQcUserOptions(args.qcUserOptions);
    setQcUserOptionsError(args.qcUserError);
    if (typeof args.qcLoading === 'boolean') {
      setQcUserOptionsLoading(args.qcLoading);
    }
  }

  function resolveAssignableOptionFallbackState(args: {
    isQcAssign: boolean;
    fallbackCaseworkerOptions: string[];
    fallbackQcUserOptions: string[];
    error?: string;
  }): {
    caseworkerOptions: string[];
    caseworkerError?: string;
    qcUserOptions: string[];
    qcUserError?: string;
  } {
    const caseworkerOptions = args.fallbackCaseworkerOptions;
    const caseworkerError = caseworkerOptions.length > 0 ? undefined : args.error;
    if (!args.isQcAssign) {
      return {
        caseworkerOptions,
        caseworkerError,
        qcUserOptions: [],
        qcUserError: undefined,
      };
    }
    const qcUserOptions = args.fallbackQcUserOptions;
    const qcUserError = qcUserOptions.length > 0 ? undefined : args.error;
    return {
      caseworkerOptions,
      caseworkerError,
      qcUserOptions,
      qcUserError,
    };
  }

  const resetSalesSearchResults = React.useCallback((): void => {
    setHasLoadedApim(false);
    setApimItems([]);
    setTotalCount(0);
    setServerDriven(false);
    setApiFilterOptions({});
    setApiUserLookup({});
    setApiUserFilterOptions({});
    setLoadErrorMessage(undefined);
  }, []);

  const assignTasksToUser = async (user: { id: string; firstName: string; lastName: string }): Promise<boolean> => {
    try {
      const selected = selection.getSelection() as Record<string, unknown>[];
      if (selected.length === 0) {
        setAssignMessage({ text: assignTasksText.messages.selectTasksWarning, type: MessageBarType.warning });
        return false;
      }
      const maxBatchSize = assignmentConfig.maxBatchSize ?? 500;
      if (selected.length > maxBatchSize) {
        const template = assignTasksText.messages.tooManyTasks;
        const message = template.replace(/\{max\}/g, String(maxBatchSize));
        setAssignMessage({ text: message, type: MessageBarType.warning });
        return false;
      }
      const apiName = resolveAssignmentApiName();
      if (!apiName) {
        setAssignMessage({ text: assignTasksText.messages.apiNotConfigured, type: MessageBarType.error });
        return false;
      }
      const customApiType = resolveCustomApiTypeForAssign();
      const assignedBy = entraObjectId ?? resolveAssignedByUserId(context);
      const assignedDate = new Date().toISOString();
      const statusCheck = resolveAssignmentStatusValidation(
        selected,
        screenKind,
        assignmentConfig,
        assignTasksText.messages.invalidStatus,
      );
      if (statusCheck.error) {
        setAssignMessage({ text: statusCheck.error, type: MessageBarType.error });
        return false;
      }
      const assignmentTaskStatus = statusCheck.assignmentTaskStatus;
      const uniqueTaskIds = buildUniqueTaskIdsFromRecords(selected);
      if (uniqueTaskIds.length === 0) {
        setAssignMessage({ text: assignTasksText.messages.noValidTaskIds, type: MessageBarType.error });
        return false;
      }

      const assignmentParams: Record<string, string> = {
        assignedToUserId: user.id,
        taskId: JSON.stringify(uniqueTaskIds),
        assignedByUserId: assignedBy,
        screenName: assignmentScreenName || screenName,
      };
      if (assignmentTaskStatus) {
        assignmentParams.taskStatus = assignmentTaskStatus;
      }
      const response = await executeUnboundCustomApi<Record<string, unknown>>(
        context,
        apiName,
        assignmentParams,
        { operationType: customApiType },
      );
      const parsed = parseAssignmentApiResult(response);
      if (!parsed || parsed?.success === false) {
        setAssignMessage({ text: assignTasksText.messages.assignmentFailed, type: MessageBarType.error });
        setSearchNonce((n) => n + 1);
        return false;
      }
      const apimOutcome = parseAssignmentOutcome(parsed.payload);
      if (apimOutcome.alreadyAssigned || apimOutcome.success === false) {
        setAssignMessage({ text: assignTasksText.messages.alreadyAssigned, type: MessageBarType.error });
        setSearchNonce((n) => n + 1);
        return false;
      }
      const assignedCount = uniqueTaskIds.length;
      const rawUserName = [user.firstName, user.lastName].map((v) => (v ?? '').trim()).filter((v) => v !== '');
      const userName = rawUserName.length > 0 ? rawUserName.join(' ') : 'selected user';
      const formatTemplate = (template: string): string =>
        template.replace(/\{count\}/g, String(assignedCount)).replace(/\{user\}/g, userName);
      const assignedTemplate = assignedCount === 1
        ? assignTasksText.messages.assignedSuccessWithUserSingle
          ?? assignTasksText.messages.assignedSuccessSingle
          ?? assignTasksText.messages.assignedSuccess
        : assignTasksText.messages.assignedSuccessWithUserMultiple
          ?? assignTasksText.messages.assignedSuccessMultiple
          ?? assignTasksText.messages.assignedSuccess;
      setAssignMessage({ text: formatTemplate(assignedTemplate), type: MessageBarType.success });
      clearCurrentSelection();
      setAssignPendingRefresh(true);
      setSearchNonce((n) => n + 1);
      return await new Promise<boolean>((resolve) => {
        assignRefreshResolve.current = resolve;
      });
    } catch (err) {
      setAssignMessage({
        text: assignTasksText.messages.assignmentFailed,
        type: MessageBarType.error,
      });
      setSearchNonce((n) => n + 1);
      if (assignRefreshResolve.current) {
        assignRefreshResolve.current(false);
        assignRefreshResolve.current = null;
        setAssignPendingRefresh(false);
      }
      return false;
    }
  };

  const markPassedQcTasks = async (): Promise<void> => {
    const markPassedQcText = SCREEN_TEXT.qcView.markPassedQc;
    try {
      const selected = selection.getSelection() as Record<string, unknown>[];
      if (selected.length === 0) {
        setAssignMessage({ text: markPassedQcText.messages.noSelection, type: MessageBarType.warning });
        return;
      }
      const apiName = resolveSubmitQcRemarksApiName();
      if (!apiName) {
        setAssignMessage({ text: markPassedQcText.messages.apiNotConfigured, type: MessageBarType.error });
        return;
      }
      const REASSIGNED_TO_QC_STATUS_NORMALIZED = 'reassigned to qc';
      const allReassigned = selected.every((rec) => {
        const statusRaw = (rec.taskstatus ?? rec.taskStatus ?? '') as string;
        return String(statusRaw).trim().toLowerCase() === REASSIGNED_TO_QC_STATUS_NORMALIZED;
      });
      if (!allReassigned) {
        setAssignMessage({ text: markPassedQcText.messages.invalidStatus, type: MessageBarType.error });
        return;
      }
      const uniqueTaskIds = buildUniqueTaskIdsFromRecords(selected);
      if (uniqueTaskIds.length === 0) {
        setAssignMessage({ text: markPassedQcText.messages.noValidTaskIds, type: MessageBarType.error });
        return;
      }
      const reviewedBy = entraObjectId ?? resolveAssignedByUserId(context);
      const customApiType = resolveSubmitQcRemarksApiType();
      const qcParams: Record<string, string> = {
        taskId: JSON.stringify(uniqueTaskIds),
        qcOutcome: markPassedQcText.qcOutcome,
        qcRemark: markPassedQcText.qcRemark,
        qcReviewedBy: reviewedBy,
      };
      await executeUnboundCustomApi<Record<string, unknown>>(
        context,
        apiName,
        qcParams,
        { operationType: customApiType },
      );
      const successText = uniqueTaskIds.length === 1
        ? markPassedQcText.messages.success
        : markPassedQcText.messages.successMultiple.replace(/\{count\}/g, String(uniqueTaskIds.length));
      setAssignMessage({ text: successText, type: MessageBarType.success });
      clearCurrentSelection();
      setSearchNonce((n) => n + 1);
    } catch {
      setAssignMessage({ text: SCREEN_TEXT.qcView.markPassedQc.messages.failed, type: MessageBarType.error });
      setSearchNonce((n) => n + 1);
    }
  };

  const resolveAppliedPrefilters = React.useCallback((next: ManagerPrefilterState): ManagerPrefilterState => {
    if (isQcAssign) {
      if (next.searchBy === 'task') {
        return normalizePrefilterStateUserIds({ ...next, caseworkers: [] });
      }
      if (next.searchBy === 'caseworker' || next.searchBy === 'qcUser') {
        return normalizePrefilterStateUserIds({
          ...next,
          caseworkers: mapCaseworkerNamesToIds(next.caseworkers ?? []),
        });
      }
      return normalizePrefilterStateUserIds(next);
    }
    if (next.searchBy === 'caseworker') {
      const nextCaseworkers = next.caseworkers ?? [];
      const caseworkers = isCaseworkerView && nextCaseworkers.length === 0 && currentUserId
        ? [currentUserId]
        : mapCaseworkerNamesToIds(nextCaseworkers);
      return normalizePrefilterStateUserIds({ ...next, caseworkers });
    }
    return normalizePrefilterStateUserIds(next);
  }, [currentUserId, isCaseworkerView, isQcAssign, mapCaseworkerNamesToIds, normalizePrefilterStateUserIds]);

  const applyPrefilters = React.useCallback((
    next: ManagerPrefilterState,
    options?: { source?: 'auto' | 'user' },
  ) => {
    const isAuto = options?.source === 'auto';
    console.debug('[Prefilter] host apply', {
      screen: screenKind,
      isAuto,
      next,
    });
    let resolved = resolveAppliedPrefilters(next);
    resolved = normalizePrefilterStateUserIds(resolved);
    appliedPrefilterSnapshotRef.current = JSON.stringify(resolved ?? null);
    prefilterDirtyRef.current = false;
    setPrefilters(resolved);
    setPrefilterApplied(true);
    setCurrentPage(0);
    setSearchFilters(createDefaultGridFilters());
    if (!isAuto) {
      setClientSort({ name: 'saleid', sortDirection: 0 });
      setUserSortActive(false);
      setHeaderFilters({});
      lastAppliedFiltersRef.current = {};
      try {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(storageKeyNC);
      } catch {
        // ignore storage failures
      }
      clearStoredSort();
    }
    clearCurrentSelection();
    setSearchNonce((n) => n + 1);
  }, [
    clearCurrentSelection,
    resolveAppliedPrefilters,
    screenKind,
    clearStoredSort,
    storageKey,
    storageKeyNC,
  ]);

  const handleGridSearch = React.useCallback((fs: GridFilterState): void => {
    const sanitized = sanitizeFilters(fs);
    setSearchFilters(sanitized);
    setCurrentPage(0);
    setUserSortActive(false);
    clearStoredSort();
    if (isSalesSearch) {
      const isDefault = isSalesSearchDefaultFilters(sanitized);
      setSalesSearchApplied(!isDefault);
      if (isDefault) {
        resetSalesSearchResults();
        return;
      }
    }
    setSearchNonce((n) => n + 1);
  }, [clearStoredSort, isSalesSearch, resetSalesSearchResults]);

  const props: GridProps = {
    showSearchPanel: !isManagerAssign && !isCaseworkerView && !isQcAssign && !isQcView,
    screenKind,
    tableKey,
    datasetColumns,
    columnConfigs,
    billingAuthorityOptions,
    billingAuthorityOptionsLoading,
    billingAuthorityOptionsError,
    caseworkerOptions,
    caseworkerOptionsLoading,
    caseworkerOptionsError,
    qcUserOptions,
    qcUserOptionsLoading,
    qcUserOptionsError,
    records,
    sortedRecordIds: pageIds,
    shimmer: apimLoading,
    itemsLoading: apimLoading,
    selectionType: isCaseworkerView ? SelectionMode.single : SelectionMode.multiple,
    selection,
    onNavigate,
    onSort,
    sorting: (userSortActive && clientSort ? [{ name: clientSort.name, sortDirection: clientSort.sortDirection }] : []) as unknown as ComponentFramework.PropertyHelper.DataSetApi.SortStatus[],
    componentRef,
    resources: context.resources,
    columnDatasetNotDefined: false,
    onSearch: handleGridSearch,
    onNextPage: () => {
      if (canNext) setCurrentPage((p) => p + 1);
    },
    onPrevPage: () => {
      if (canPrev) setCurrentPage((p) => p - 1);
    },
    onSetPage: (p) => {
      if (p >= 0 && p !== currentPage) setCurrentPage(p);
    },
    currentPage,
    totalPages,
    pageSize,
    canNext,
    canPrev,
    searchFilters,
    showResults: shouldShowResults(screenKind, prefilterApplied, salesSearchApplied),
    selectedCount,
    allowColumnReorder,
    statusMessage: assignMessage,
    onStatusMessageDismiss: () => setAssignMessage(undefined),
    errorMessage: loadErrorMessage,
    assignUsers,
    assignUsersLoading,
    assignUsersError,
    assignUsersInfo,
    onAssignPanelToggle: handleAssignPanelToggle,
    currentUserId,
    onAssignTasks: assignTasksToUser,
    onMarkPassedQc: isQcView ? markPassedQcTasks : undefined,
    onBulkCreateTask: onBulkCreateTask
      ? async (saleIds: string[]) => {
        await onBulkCreateTask(saleIds);
        const count = saleIds.length;
        const successText = count === 1
          ? 'Manual task created successfully for the selected sale record.'
          : `Manual tasks created successfully for ${count} selected sale records.`;
        setAssignMessage({ text: successText, type: MessageBarType.success });
        setSearchNonce((n) => n + 1);
      }
      : undefined,
    canCreateManualTask,
    onLoadFilterOptions: (field, query) => {
      const key = normalizeFilterKey(String(field ?? ''));
      const options = displayFilterOptionsRich[key] ?? [];
      if (!query || query.trim().length === 0) return Promise.resolve(options);
      const q = query.trim().toLowerCase();
      return Promise.resolve(
        options.filter((opt) =>
          typeof opt === 'string' ? opt.toLowerCase().includes(q) : opt.text.toLowerCase().includes(q),
        ),
      );
    },
    columnFilterOptions: displayFilterOptionsRich,
    onColumnFiltersChange: (f) => {
      const normalizedBase: Record<string, ColumnFilterValue> = {};
      Object.entries(f).forEach(([k, v]) => (normalizedBase[k.toLowerCase()] = v as ColumnFilterValue));
      const normalized = shouldNormalizeSummaryFlagFilters
        ? normalizeSummaryFlagColumnFilters(normalizedBase)
        : normalizedBase;
      // No-op if unchanged to avoid duplicate apply calls
      const prev = lastAppliedFiltersRef.current;
      const same = areFiltersEqual(prev, normalized);
      if (!same) {
        lastAppliedFiltersRef.current = normalized;
        setHeaderFilters(normalized);
        // Persist immediately to localStorage as arrays
        try {
          if (Object.keys(normalized).length === 0) {
            localStorage.removeItem(storageKey); localStorage.removeItem(storageKeyNC);
          } else {
            const arrayStore = serializeColumnFiltersForStorage(normalized);
            const filtersJSON = JSON.stringify(arrayStore);
            localStorage.setItem(storageKey, filtersJSON);
            localStorage.setItem(storageKeyNC, filtersJSON);
          }
        } catch {
          // ignore storage failures
        }
        setCurrentPage(0);
        try {
          onColumnFiltersApply?.(
            toApiHeaderFilters(
              mapColumnFiltersForApi(normalized, { normalizeSummaryFlags: shouldNormalizeSummaryFlagFilters }),
            ),
          );
        } catch { void 0; }
      }
    },
    columnFilters: headerFilters,
    disableClientFiltering,
    taskCount: serverDriven ? totalCount : filteredIds.length,
    canvasScreenName,
    contextScopeKey,
    prefilterApplied,
    onPrefilterDirty: handlePrefilterDirty,
    onSearchDirty: handleSalesSearchDirty,
    onPrefilterApply: applyPrefilters,
    onPrefilterClear: () => {
      appliedPrefilterSnapshotRef.current = JSON.stringify(null);
      prefilterDirtyRef.current = true;
      setPrefilters(undefined);
      setPrefilterApplied(false);
      setCurrentPage(0);
      setSearchFilters(createDefaultGridFilters());
      setClientSort({ name: 'saleid', sortDirection: 0 });
      setUserSortActive(false);
      setHeaderFilters({});
      lastAppliedFiltersRef.current = {};
      selection.setAllSelected(false);
      setSelectedCount(0);
      onSelectionCountChange?.(0);
      onSelectionChange?.({ selectedTaskIds: [], selectedSaleIds: [] });
      setApimItems([]);
      setTotalCount(0);
      setServerDriven(false);
      setHasLoadedApim(false);
      setApiFilterOptions({});
      setApiUserLookup({});
      setApiUserFilterOptions({});
      try {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(storageKeyNC);
      } catch {
        // ignore storage failures
      }
      clearStoredSort();
    },
    rowInvokeEnabled: isLocalHost,
  };

  return <Grid {...(props as unknown as GridProps)} height={allocatedHeight} onBackRequested={onBackRequested} contextSubtitle={contextSubtitle} onEditContext={onEditContext} />;
};

DetailsListHost.displayName = 'DetailsListHost';


