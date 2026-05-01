import { 
  CheckboxVisibility,
  ColumnActionsMode,
  ContextualMenuItemType,
  createTheme,
  DetailsList,
  DirectionalHint,
  IColumn,
  IColumnReorderOptions,
  IContextualMenuItem,
  IDetailsList,
  IDetailsHeaderProps,
  IDetailsColumnRenderTooltipProps,
  IDetailsRowProps,
  IObjectWithKey,
  IRefObject,
  ISelection,
  IPartialTheme,
  IDropdownOption,
  PrimaryButton,
  SelectionMode,
  ShimmeredDetailsList,
  ConstrainMode,
  DetailsListLayoutMode,
  ThemeProvider,
  TextField,
  Stack,
  Text,
  DefaultButton,
  MessageBar,
  MessageBarType,
  ComboBox,
  IComboBox,
  IComboBoxOption,
  Icon,
  Label,
  SearchBox,
  Spinner,
  SpinnerSize,
  Link,
  DatePicker,
  DayOfWeek,
  IDatePickerStrings,
  IButtonStyles,
  TooltipHost,
} from '@fluentui/react';
import * as React from 'react';
import { NoFields } from '../DetailsListVOA/grid/NoFields';
import { RecordsColumns } from '../DetailsListVOA/config/ManifestConstants';
import { IGridColumn, ColumnConfig, AssignUser } from './Component.types';
import { AssignTasksOverlay } from './components/Grid/AssignTasksOverlay';
import { ColumnFilterContextMenu } from './components/Grid/ColumnFilterContextMenu';
import { CreateTaskDialog } from './components/Grid/CreateTaskDialog';
import { FocusableActionButton, renderLabelWithRequired } from './components/Grid/GridSharedControls';
import { BulkSelectionField } from './components/Grid/BulkSelectionField';
import { CompactClearSelectionButton } from './components/Grid/CompactClearSelectionButton';
import { GenericDateRangeSearchControl } from './components/Grid/GenericDateRangeSearchControl';
import { GenericMultiSelectControl } from './components/Grid/GenericMultiSelectControl';
import { GenericNumericSearchControl } from './components/Grid/GenericNumericSearchControl';
import { GenericSingleSelectControl } from './components/Grid/GenericSingleSelectControl';
import { GenericTextSearchControl } from './components/Grid/GenericTextSearchControl';
import { PrefilterActionsRow } from './components/Grid/PrefilterActionsRow';
import { PrefilterCompletedDateFields } from './components/Grid/PrefilterCompletedDateFields';
import { PrefilterMultiSelectComboField } from './components/Grid/PrefilterMultiSelectComboField';
import { SalesAddressSearchControl } from './components/Grid/SalesAddressSearchControl';
import { SalesBillingAuthoritySearchControl } from './components/Grid/SalesBillingAuthoritySearchControl';
import { SalesIdentifierSearchControl } from './components/Grid/SalesIdentifierSearchControl';
import { SalesSearchActionsRow } from './components/Grid/SalesSearchActionsRow';
import { SearchByComboField } from './components/Grid/SearchByComboField';
import { GridCell } from '../DetailsListVOA/grid/GridCell';
import { ClassNames } from '../DetailsListVOA/grid/Grid.styles';
import { GridFilterState, NumericFilter, NumericFilterMode, createDefaultGridFilters, sanitizeFilters, SearchByOption, DateRangeFilter, isValidUkPostcode, normalizeUkPostcode } from './Filters';
import { filterItemsByColumnFilters, type ColumnFilterValue } from './utils/GridColumnFilters';
import {
  buildExactMatchHighlightedOptions,
  comboBoxStyles240x200,
  comboBoxStyles240x240,
  resolveMenuMultiSelectValue,
} from './utils/GridComboUtils';
import { buildAriaDescribedBy, formatRequiredAriaLabel, joinClassNames } from './utils/GridUiUtils';
import { buildSortMenuItems, buildDividerMenuItem, computeDateRangeFilterError, computeDateRangeIncompleteText } from './utils/GridColumnMenuHelpers';
import { getSearchByOptionsFor, getColumnFilterConfigFor, isLookupFieldFor, isViewSalesRecordEnabledFor, ColumnFilterConfig } from '../DetailsListVOA/config/TableConfigs';
import { SALES_SEARCH_OPTIONS, SEARCH_FIELD_CONFIGS, type SearchFieldConfig } from './config/SearchFieldConfigs';
import {
  ADDRESS_FIELD_MAX_LENGTH,
  ID_FIELD_MAX_LENGTH,
  MIN_ADDRESS_TEXT_LENGTH,
  SALE_ID_REGEX,
  TASK_ID_MIN_LENGTH,
  TASK_ID_REGEX,
  UPRN_MAX_LENGTH,
  getSalesSearchErrors,
  sanitizeAlphaNumHyphen,
  sanitizeDigits,
  sanitizeTaskIdInput,
} from './utils/SalesSearchValidation';
import { buildPrefilterStorageKey, shouldResetPrefiltersOnScreenChange } from './utils/ScreenBehavior';
import {
  MANAGER_PREFILTER_DEFAULT,
  CASEWORKER_PREFILTER_DEFAULT,
  QC_PREFILTER_DEFAULT,
  QC_VIEW_PREFILTER_DEFAULT,
  CASEWORKER_WORKTHAT_SELF_OPTIONS,
  QC_WORKTHAT_SELF_OPTIONS,
  MANAGER_SEARCH_BY_OPTIONS,
  QC_SEARCH_BY_OPTIONS,
  getManagerWorkThatOptions,
  isManagerCompletedWorkThat,
  getQcWorkThatOptions,
  isQcCompletedWorkThat,
  type ManagerPrefilterState,
  type ManagerSearchBy,
  type ManagerWorkThat,
  type QcSearchBy,
} from './config/PrefilterConfigs';
import { computeCompletedToDateIso, getPrefilterFromDateError } from './utils/PrefilterDateUtils';
import { parseDateInput } from './utils/DateInputUtils';
import {
  isPrefilterUserAutoApplyReady,
  normalizePrefilterSearchBy,
  shouldRemoveStoredPrefilter,
  shouldSkipPrefilterAutoApply,
} from './utils/PrefilterUtils';
import { type ScreenKind } from './utils/ScreenResolution';
import { SCREEN_TEXT } from '../DetailsListVOA/constants/ScreenText';
import { CONTROL_CONFIG } from './config/ControlConfig';
import { HOME_JOURNEY_COPY } from '../DetailsListVOA/constants/HomeJourney';
import {
  resolveAssignedUserIdsToDisable,
  resolveAssignmentStatusValidation,
  type AssignmentConfig,
} from './utils/AssignmentHelpers';

type DataSet = ComponentFramework.PropertyHelper.DataSetApi.EntityRecord & IObjectWithKey;
const ASSIGN_LOADING_ROW_ID = '__loading__';

const isValidNumericFilterInput = (value: string): boolean => {
  if (value === '') {
    return true;
  }

  let index = 0;
  if (value.charCodeAt(0) === 45) {
    if (value.length === 1) {
      return true;
    }
    index = 1;
  }

  let dotSeen = false;
  for (; index < value.length; index++) {
    const ch = value.charCodeAt(index);
    if (ch === 46) {
      if (dotSeen) {
        return false;
      }
      dotSeen = true;
      continue;
    }

    if (ch < 48 || ch > 57) {
      return false;
    }
  }

  return true;
};

export type GridScreenKind = ScreenKind;

export interface GridProps {
  // When false, hides the built-in top search panel
  showSearchPanel?: boolean;
  screenKind?: GridScreenKind;
  tableKey?: string;
  height?: number;
  taskCount?: number;
  selectedCount?: number;
  datasetColumns: ComponentFramework.PropertyHelper.DataSetApi.Column[];
  columnConfigs: Record<string, ColumnConfig>;
  records: Record<string, ComponentFramework.PropertyHelper.DataSetApi.EntityRecord>;
  sortedRecordIds: string[];
  shimmer: boolean;
  itemsLoading: boolean;
  selectionType: SelectionMode;
  selection: ISelection<IObjectWithKey>;
  onNavigate: (item?: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord) => void | Promise<void>;
  onSort: (name: string, desc: boolean) => void;
  sorting: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[];
  componentRef: IRefObject<IDetailsList>;
  compact?: boolean;
  themeJSON?: string | IPartialTheme;
  isHeaderVisible?: boolean;
  resources: ComponentFramework.Resources;
  columnDatasetNotDefined?: boolean;
  onSearch: (filters: GridFilterState) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  onSetPage: (page: number) => void;
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  canNext: boolean;
  canPrev: boolean;
  overlayOnSort?: boolean;
  searchFilters: GridFilterState;
  billingAuthorityOptions?: string[];
  billingAuthorityOptionsLoading?: boolean;
  billingAuthorityOptionsError?: string;
  caseworkerOptions?: string[];
  caseworkerOptionsLoading?: boolean;
  caseworkerOptionsError?: string;
  qcUserOptions?: string[];
  qcUserOptionsLoading?: boolean;
  qcUserOptionsError?: string;
  errorMessage?: string;
  showResults?: boolean;
  onLoadFilterOptions?: (field: string, query: string) => Promise<Array<string | { key: string; text: string }>>;
  columnFilterOptions?: Record<string, Array<string | { key: string; text: string }>>;
  onColumnFiltersChange?: (filters: Record<string, ColumnFilterValue | string | string[]>) => void;
  allowColumnReorder?: boolean;
  columnFilters?: Record<string, ColumnFilterValue>;
  disableClientFiltering?: boolean;
  canvasScreenName?: string;
  onAssignTasks?: (user: AssignUser) => Promise<boolean>;
  onMarkPassedQc?: () => Promise<void>;
  statusMessage?: { text: string; type: MessageBarType };
  onStatusMessageDismiss?: () => void;
  prefilterApplied?: boolean;
  onPrefilterApply?: (prefilters: ManagerPrefilterState, options?: { source?: 'auto' | 'user' }) => void;
  onPrefilterClear?: () => void;
  onPrefilterDirty?: () => void;
  onSearchDirty?: () => void;
  onBackRequested?: () => void;
  contextSubtitle?: string;
  onEditContext?: () => void;
  contextScopeKey?: string;
  disableViewSalesRecordAction?: boolean;
  rowInvokeEnabled?: boolean;
  assignUsers?: AssignUser[];
  assignUsersLoading?: boolean;
  assignUsersError?: string;
  assignUsersInfo?: string;
  onAssignPanelToggle?: (isOpen: boolean) => boolean | void;
  currentUserId?: string;
  onBulkCreateTask?: (saleIds: string[]) => Promise<void>;
  canCreateManualTask?: boolean;
}

const defaultTheme = createTheme({
  palette: {
    themePrimary: '#3B79B7',
  },
  fonts: {
    medium: {
      fontFamily: "'Segoe UI', 'SegoeUI', 'Arial', sans-serif",
      fontSize: '14px',
    },
  },
});

const PREFILTER_COLLAPSE_BREAKPOINT = 1200;

function useTheme(themeJSON?: string | IPartialTheme) {
  return React.useMemo(() => {
    if (!themeJSON) {
      return defaultTheme;
    }
    try {
      const partial: IPartialTheme = typeof themeJSON === 'string' ? (JSON.parse(themeJSON) as unknown as IPartialTheme) : themeJSON;
      return createTheme(partial);
    } catch {
      return defaultTheme;
    }
  }, [themeJSON]);
}

const getFilterField = <T = unknown>(state: GridFilterState, key: keyof GridFilterState): T | undefined =>
  (state as unknown as Record<string, unknown>)[key as string] as T | undefined;
const getColumnFilterField = <T extends ColumnFilterValue = ColumnFilterValue>(
  state: Record<string, ColumnFilterValue>,
  key: string,
): T | undefined => (state as unknown as Record<string, ColumnFilterValue>)[key] as T | undefined;

const normalizeColumnFilterOptionKey = (value: string): string =>
  value.replace(/[^a-z0-9]/gi, '').toLowerCase();

interface PrefilterTooltips {
  searchBy?: string;
  billingAuthority?: string;
  caseworker?: string;
  qcUser?: string;
  workThat?: string;
  fromDate?: string;
  toDate?: string;
}

interface ViewportMetrics {
  width: number;
  height: number;
  zoomPercent: number;
}

const BILLING_AUTHORITY_ALL_KEY = '__all__';
const CASEWORKER_ALL_KEY = '__all__';
const SELECT_ALL_KEY = '__select_all__';
const DEFAULT_ZOOM_PERCENT = 100;
const COMPACT_MODE_ZOOM_THRESHOLD_PERCENT = 120;

type StoredPrefilterState = Partial<ManagerPrefilterState> & { applied?: boolean };
interface StoredPrefilterLoadResult {
  raw: string;
  parsed: StoredPrefilterState;
  migratedFromLegacy: boolean;
}

interface PrefilterAutoApplyDecision {
  storedApplied: boolean | undefined;
  hasOwner: boolean;
  hasWorkThat: boolean;
  hasFromDate: boolean;
  userResolutionReady: boolean;
  canAutoApply: boolean;
  shouldAutoApply: boolean;
}

const normalizeOptionToken = (value: unknown): string => {
  if (typeof value === 'string') return value.trim().toLowerCase();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim().toLowerCase();
  return '';
};
const isAllToken = (value: unknown): boolean => normalizeOptionToken(value) === 'all';
const isOtherToken = (value: unknown): boolean => {
  const token = normalizeOptionToken(value);
  return token === 'other' || token === 'others' || token === 'other(s)';
};
const hasAllOption = (options: IComboBoxOption[]): boolean =>
  options.some((opt) => isAllToken(opt.key) || isAllToken(opt.text ?? opt.key));
const hasOtherOption = (options: IComboBoxOption[]): boolean =>
  options.some((opt) => isOtherToken(opt.key) || isOtherToken(opt.text ?? opt.key));
const hasAllOrOtherOption = (options: IComboBoxOption[]): boolean => hasAllOption(options) || hasOtherOption(options);
const resolveAllOptionKey = (options: IComboBoxOption[]): string | undefined => {
  const match = options.find((opt) => isAllToken(opt.key) || isAllToken(opt.text ?? opt.key));
  return match ? String(match.key) : undefined;
};
type SalesSearchFieldKey =
  | 'buildingNameNumber'
  | 'street'
  | 'townCity'
  | 'postcode'
  | 'billingAuthority'
  | 'bacode'
  | 'saleId'
  | 'taskId'
  | 'uprn';

const focusSalesSearchFieldById = (fieldId: string): void => {
  if (typeof document === 'undefined') return;
  const fieldRoot = document.getElementById(fieldId);
  if (!fieldRoot) return;
  const focusTarget = (fieldRoot.matches('input,button,textarea,[tabindex]') ? fieldRoot : fieldRoot.querySelector<HTMLElement>('input,button,textarea,[tabindex]'))
    ?? undefined;
  focusTarget?.focus();
};

const normalizePrefilterArray = (value: unknown): string[] =>
  (Array.isArray(value) ? value.map((item) => String(item)) : []);

const loadStoredPrefilterState = (
  prefilterStorageKey: string,
  legacyPrefilterStorageKey: string,
): StoredPrefilterLoadResult | undefined => {
  try {
    let raw = localStorage.getItem(prefilterStorageKey);
    let migratedFromLegacy = false;
    if (!raw && legacyPrefilterStorageKey !== prefilterStorageKey) {
      raw = localStorage.getItem(legacyPrefilterStorageKey);
      migratedFromLegacy = !!raw;
    }
    if (!raw) {
      return undefined;
    }
    const parsed = JSON.parse(raw) as StoredPrefilterState;
    return { raw, parsed, migratedFromLegacy };
  } catch {
    return undefined;
  }
};

const toManagerPrefilterState = (
  parsed: StoredPrefilterState,
  derivedScreenKind: GridScreenKind,
): ManagerPrefilterState => ({
  searchBy: normalizePrefilterSearchBy(parsed.searchBy, derivedScreenKind),
  billingAuthorities: normalizePrefilterArray(parsed.billingAuthorities),
  caseworkers: normalizePrefilterArray(parsed.caseworkers),
  workThat: parsed.workThat,
  completedFrom: typeof parsed.completedFrom === 'string' ? parsed.completedFrom : undefined,
  completedTo: typeof parsed.completedTo === 'string' ? parsed.completedTo : undefined,
});

const evaluatePrefilterAutoApplyDecision = (args: {
  normalizedNext: ManagerPrefilterState;
  derivedScreenKind: GridScreenKind;
  isCaseworkerView: boolean;
  isQcAssign: boolean;
  isQcView: boolean;
  prefilterApplied: boolean | undefined;
  caseworkerOptionsLoading: boolean;
  caseworkerOptionsError: string | undefined;
  caseworkerOptions: string[];
  qcUserOptionsLoading: boolean;
  qcUserOptionsError: string | undefined;
  qcUserOptions: string[];
  storedApplied: boolean | undefined;
}): PrefilterAutoApplyDecision => {
  const {
    normalizedNext,
    derivedScreenKind,
    isCaseworkerView,
    isQcAssign,
    isQcView,
    prefilterApplied,
    caseworkerOptionsLoading,
    caseworkerOptionsError,
    caseworkerOptions,
    qcUserOptionsLoading,
    qcUserOptionsError,
    qcUserOptions,
    storedApplied,
  } = args;

  const needsCompleted = (isQcAssign || isQcView)
    ? isQcCompletedWorkThat(normalizedNext.workThat)
    : isManagerCompletedWorkThat(normalizedNext.workThat);
  const hasOwner = hasPrefilterOwnerSelection(normalizedNext, {
    isCaseworkerView,
    isQcView,
    isQcAssign,
  });
  const hasWorkThat = !!normalizedNext.workThat;
  const hasFromDate = !needsCompleted || !!normalizedNext.completedFrom;
  const userResolutionReady = isPrefilterUserAutoApplyReady({
    screenKind: derivedScreenKind,
    searchBy: normalizedNext.searchBy,
    selectedUsers: normalizedNext.caseworkers,
    caseworkerOptionsLoading,
    caseworkerOptionsError,
    caseworkerOptions,
    qcUserOptionsLoading,
    qcUserOptionsError,
    qcUserOptions,
  });
  const canAutoApply = hasOwner && hasWorkThat && hasFromDate && userResolutionReady;
  const shouldAutoApply = storedApplied === false ? false : canAutoApply;

  return {
    storedApplied,
    hasOwner,
    hasWorkThat,
    hasFromDate,
    userResolutionReady,
    canAutoApply,
    shouldAutoApply,
  };
};

const runPrefilterAutoApply = (
  onPrefilterApply: ((prefilters: ManagerPrefilterState, options?: { source?: 'auto' | 'user' }) => void) | undefined,
  normalizedNext: ManagerPrefilterState,
  derivedScreenKind: GridScreenKind,
): void => {
  if (!onPrefilterApply) return;
  console.debug('[Prefilter] auto-apply fire', {
    screen: derivedScreenKind,
    prefilters: normalizedNext,
    onPrefilterApplyType: typeof onPrefilterApply,
  });
  try {
    onPrefilterApply(normalizedNext, { source: 'auto' });
    console.debug('[Prefilter] auto-apply done', { screen: derivedScreenKind });
  } catch (err) {
    console.error('[Prefilter] auto-apply failed', err);
  }
};

const migrateLegacyPrefilterState = (
  migratedFromLegacy: boolean,
  prefilterStorageKey: string,
  legacyPrefilterStorageKey: string,
  raw: string,
): void => {
  if (!migratedFromLegacy) return;
  try {
    localStorage.setItem(prefilterStorageKey, raw);
    localStorage.removeItem(legacyPrefilterStorageKey);
  } catch {
    // ignore storage failures
  }
};

const hasPrefilterOwnerSelection = (
  prefilters: ManagerPrefilterState,
  options: {
    isCaseworkerView: boolean;
    isQcView: boolean;
    isQcAssign: boolean;
    hasImplicitOwner?: boolean;
  },
): boolean => {
  const { isCaseworkerView, isQcView, isQcAssign, hasImplicitOwner = false } = options;

  if (isCaseworkerView || isQcView) {
    return prefilters.caseworkers.length > 0 || hasImplicitOwner;
  }

  if (isQcAssign) {
    return prefilters.searchBy === 'task' || prefilters.caseworkers.length > 0;
  }

  if (prefilters.searchBy === 'billingAuthority') {
    return prefilters.billingAuthorities.length > 0;
  }

  return prefilters.caseworkers.length > 0;
};

interface ColumnHeaderTooltipProps {
  tooltipProps?: IDetailsColumnRenderTooltipProps;
}

const ColumnHeaderTooltip: React.FC<ColumnHeaderTooltipProps> = ({ tooltipProps }) => {
  if (!tooltipProps) {
    return null;
  }

  const column = tooltipProps.column as IGridColumn | undefined;
  const tooltipContent = column?.headerTooltip || tooltipProps.column?.name || tooltipProps.tooltipProps?.content;

  return (
    <TooltipHost content={tooltipContent}>
      {tooltipProps.children}
    </TooltipHost>
  );
};

interface ColumnFilterMenuContentProps {
  content: React.ReactNode;
  isDateRangeIncomplete: boolean;
  incompleteText: string;
  applyText: string;
  applyDisabled: boolean;
  applyUnavailableReason?: string;
  applyAriaLabel: string;
  onApply: () => void;
  clearText: string;
  clearAriaLabel: string;
  onClear: () => void;
}

const ColumnFilterMenuContent: React.FC<ColumnFilterMenuContentProps> = ({
  content,
  isDateRangeIncomplete,
  incompleteText,
  applyText,
  applyDisabled,
  applyUnavailableReason,
  applyAriaLabel,
  onApply,
  clearText,
  clearAriaLabel,
  onClear,
}) => (
  <div style={{ padding: '0 12px 12px', width: 280 }}>
    {content}
    {isDateRangeIncomplete && (
      <Text variant="small" styles={{ root: { marginTop: 8 } }}>
        {incompleteText}
      </Text>
    )}
    <Stack horizontal tokens={{ childrenGap: 8 }} style={{ marginTop: 8 }}>
      <FocusableActionButton
        buttonType="primary"
        text={applyText}
        onClick={onApply}
        unavailable={applyDisabled}
        unavailableReason={applyUnavailableReason}
        unavailableReasonId="voa-column-filter-apply-unavailable"
        ariaLabel={applyAriaLabel}
      />
      <DefaultButton text={clearText} onClick={onClear} ariaLabel={clearAriaLabel} />
    </Stack>
  </div>
);

const normalizeComboSearchText = (value?: string): string => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  const parts = trimmed.split(',');
  return (parts[parts.length - 1] ?? '').trim();
};

const getComboInputValue = (event: React.KeyboardEvent<IComboBox>): string => {
  const target = event.target as HTMLInputElement | null;
  return typeof target?.value === 'string' ? target.value : '';
};

const normalizeMultiSelectSearchText = (
  value: string | undefined,
  options: IComboBoxOption[],
  selectedKeys: string[],
): string => {
  const raw = value ?? '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (selectedKeys.length > 0) {
    const selectedText = selectedKeys
      .map((key) => {
        const match = options.find((opt) => String(opt.key) === key);
        return String(match?.text ?? match?.key ?? '');
      })
      .filter((text) => text !== '')
      .join(', ');
    if (selectedText && trimmed === selectedText) {
      return '';
    }
  }
  return normalizeComboSearchText(raw);
};

const normalizeSingleSelectSearchText = (
  value: string | undefined,
  _options: IComboBoxOption[],
): string => {
  const raw = value ?? '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return normalizeComboSearchText(raw);
};

const formatTemplate = (template: string, tokens: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (match: string, key: string) => (
    Object.prototype.hasOwnProperty.call(tokens, key) ? String(tokens[key]) : match
  ));

const filterComboOptions = (options: IComboBoxOption[], query: string): IComboBoxOption[] => {
  const term = query.trim().toLowerCase();
  if (!term) return options;
  return options.filter((opt) => {
    const key = String(opt.key ?? '');
    if (key.startsWith('__') && key !== BILLING_AUTHORITY_ALL_KEY && key !== CASEWORKER_ALL_KEY) {
      return true;
    }
    const text = String(opt.text ?? opt.key ?? '').toLowerCase();
    return text.includes(term) || key.toLowerCase().includes(term);
  });
};

const resolveComboOptionKey = (options: IComboBoxOption[], value?: string): string | undefined => {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return undefined;
  const target = trimmed.toLowerCase();
  const match = options.find((opt) => {
    const text = String(opt.text ?? opt.key ?? '').trim().toLowerCase();
    const key = String(opt.key ?? '').trim().toLowerCase();
    return text === target || key === target;
  });
  return match ? String(match.key) : undefined;
};

const resolveComboKeyFromSearch = (
  options: IComboBoxOption[],
  value?: string,
  preferredKey?: string | number | boolean,
): string | undefined => {
  const exact = resolveComboOptionKey(options, value);
  if (exact) return exact;
  const filtered = filterComboOptions(options, value ?? '');
  const enabled = filtered.filter((opt) => !opt.disabled);
  if (enabled.length === 1) return String(enabled[0].key);
  if (preferredKey !== undefined) {
    const preferred = String(preferredKey);
    if (options.some((opt) => String(opt.key) === preferred && !opt.disabled)) {
      return preferred;
    }
  }
  return undefined;
};

const getOptionText = (options: IComboBoxOption[], key: string): string => {
  const match = options.find((opt) => String(opt.key) === key);
  return String(match?.text ?? match?.key ?? key);
};

const getSelectedOptionLabels = (selectedKeys: string[], options: IComboBoxOption[]): string[] =>
  selectedKeys.map((key) => getOptionText(options, key)).filter((text) => text.trim().length > 0);

const buildSelectedTooltip = (
  selectedKeys: string[],
  options: IComboBoxOption[],
  emptyHint?: string,
): string | undefined => {
  if (!selectedKeys || selectedKeys.length === 0) return emptyHint;
  const labels = getSelectedOptionLabels(selectedKeys, options);
  if (labels.length === 0) return emptyHint;
  const prefix = labels.length > 1 ? `Selected (${labels.length}): ` : 'Selected: ';
  return `${prefix}${labels.join(', ')}`;
};

const buildCompactSelectedSummary = (
  selectedKeys: string[],
  options: IComboBoxOption[],
): string | undefined => {
  if (!selectedKeys || selectedKeys.length === 0) return undefined;
  const labels = getSelectedOptionLabels(selectedKeys, options);
  if (labels.length <= 1) return undefined;
  if (labels.some((label) => label.trim().toLowerCase() === 'all')) {
    return 'All selected';
  }
  return `${labels.length} selected`;
};

const buildValueTooltip = (value: string | undefined, emptyHint?: string): string | undefined => {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return emptyHint;
  return `Selected: ${trimmed}`;
};

const COMBO_DISAMBIGUATION_HINT = 'Type more or use arrow keys to choose.';
const SEARCH_BY_RESET_NOTICE = 'Changing Search by cleared the previous search values.';
const COLUMN_FILTER_RESET_NOTICE = 'New search criteria cleared existing column filters.';
const PREFILTER_RESET_NOTICE = 'Changing Search by cleared dependent filters.';

const normalizeSignatureText = (value?: string): string => (value ?? '').trim().toLowerCase();
const normalizeSignatureList = (values?: string[]): string[] =>
  (values ?? [])
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0)
    .sort((left, right) => left.localeCompare(right));

const buildSummarySignature = (summaryFlag: GridFilterState['summaryFlag']): unknown => {
  if (typeof summaryFlag === 'string') {
    return { type: 'string', value: normalizeSignatureText(summaryFlag) };
  }

  if (summaryFlag && typeof summaryFlag === 'object') {
    return {
      type: 'object',
      operator: summaryFlag.operator,
      values: normalizeSignatureList(summaryFlag.values),
    };
  }

  return undefined;
};

const buildSearchSubmissionSignature = (filters: GridFilterState): string => {
  const summarySignature = buildSummarySignature(filters.summaryFlag);

  return JSON.stringify({
    searchBy: filters.searchBy,
    saleId: normalizeSignatureText(filters.saleId),
    taskId: normalizeSignatureText(filters.taskId),
    uprn: normalizeSignatureText(filters.uprn),
    bacode: normalizeSignatureText(filters.bacode),
    address: normalizeSignatureText(filters.address),
    buildingNameNumber: normalizeSignatureText(filters.buildingNameNumber),
    street: normalizeSignatureText(filters.street),
    townCity: normalizeSignatureText(filters.townCity),
    postcode: normalizeUkPostcode(filters.postcode ?? '').replace(/\s+/g, ''),
    billingAuthority: normalizeSignatureList(filters.billingAuthority),
    source: normalizeSignatureText(filters.source),
    summaryFlag: summarySignature,
  });
};

const getComboDisambiguationHint = (options: IComboBoxOption[], value?: string): string | undefined => {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return undefined;
  if (resolveComboOptionKey(options, trimmed)) return undefined;
  const filtered = filterComboOptions(options, trimmed).filter((opt) => !opt.disabled);
  return filtered.length > 1 ? COMBO_DISAMBIGUATION_HINT : undefined;
};

interface LengthErrors {
  address?: string;
  postcode?: string;
  summaryFlag?: string;
  saleId?: string;
  taskId?: string;
  searchField?: string;
  street?: string;
  townCity?: string;
  uprn?: string;
  billingAuthority?: string;
  bacode?: string;
}

const getSaleIdValidationError = (searchBy: SearchByOption, saleId: string): string | undefined => {
  if (searchBy !== 'saleId' || saleId.length === 0) {
    return undefined;
  }
  if (saleId.length < 3) {
    return 'Enter at least 3 characters';
  }
  return SALE_ID_REGEX.test(saleId) ? undefined : 'Please enter a valid Sale ID';
};

const getTaskIdValidationError = (searchBy: SearchByOption, taskId: string): string | undefined => {
  if (searchBy !== 'taskId' || taskId.length === 0) {
    return undefined;
  }
  if (taskId.length < TASK_ID_MIN_LENGTH) {
    return `Enter at least ${TASK_ID_MIN_LENGTH} characters`;
  }
  return TASK_ID_REGEX.test(taskId)
    ? undefined
    : 'Please enter a valid Task ID Use A- or M- prefix (e.g. A-1000001) or numbers only.';
};

const getPostcodeValidationError = (
  searchBy: SearchByOption,
  postcode: string,
  isValidPostcode: (value: string, allowPartial?: boolean) => boolean,
): string | undefined => {
  if (searchBy !== 'postcode' || postcode.length === 0) {
    return undefined;
  }
  if (postcode.length < 2) {
    return 'Enter at least 2 characters';
  }
  return isValidPostcode(postcode, true) ? undefined : 'Enter a valid UK postcode';
};

const getNonSalesLengthErrors = (
  fs: GridFilterState,
  normalizePostcode: (value: string) => string,
  isValidPostcode: (value: string, allowPartial?: boolean) => boolean,
): LengthErrors => {
  const cfg = SEARCH_FIELD_CONFIGS[fs.searchBy];
  let searchField: string | undefined;
  if (cfg?.minLength && typeof cfg.stateKey === 'string') {
    const val = getFilterField(fs, cfg.stateKey);
    const text = typeof val === 'string' ? val.trim() : '';
    if (text.length > 0 && text.length < cfg.minLength) {
      searchField = `Enter at least ${cfg.minLength} characters`;
    }
  }

  const saleId = sanitizeAlphaNumHyphen(fs.saleId, ID_FIELD_MAX_LENGTH).trim();
  const taskId = sanitizeTaskIdInput(fs.taskId, ID_FIELD_MAX_LENGTH).trim();
  const postcode = normalizePostcode(fs.postcode ?? '');
  const address = (fs.address ?? '').trim();
  const summary = typeof fs.summaryFlag === 'string' ? fs.summaryFlag.trim() : '';

  return {
    address: fs.searchBy === 'address' && address.length > 0 && address.length < 3 ? 'Enter at least 3 characters' : undefined,
    postcode: getPostcodeValidationError(fs.searchBy, postcode, isValidPostcode),
    summaryFlag: fs.searchBy === 'summaryFlag' && summary.length > 0 && summary.length < 3 ? 'Enter at least 3 characters' : undefined,
    saleId: getSaleIdValidationError(fs.searchBy, saleId),
    taskId: getTaskIdValidationError(fs.searchBy, taskId),
    searchField,
  };
};

const canSalesAddressSearch = (
  filters: GridFilterState,
  normalizePostcode: (value: string) => string,
  isValidPostcode: (value: string, allowPartial?: boolean) => boolean,
): boolean => {
  const building = (filters.buildingNameNumber ?? '').trim();
  const street = (filters.street ?? '').trim();
  const town = (filters.townCity ?? '').trim();
  const postcode = normalizePostcode(filters.postcode ?? '').trim();
  const hasPostcode = postcode.length > 0;
  if (hasPostcode) {
    return isValidPostcode(postcode, false);
  }
  const criteriaCount = (building.length > 0 ? 1 : 0)
    + (street.length >= MIN_ADDRESS_TEXT_LENGTH ? 1 : 0)
    + (town.length >= MIN_ADDRESS_TEXT_LENGTH ? 1 : 0);
  return criteriaCount >= 2;
};

const canExecuteSalesSearch = (
  filters: GridFilterState,
  normalizePostcode: (value: string) => string,
  isValidPostcode: (value: string, allowPartial?: boolean) => boolean,
): boolean => {
  const saleId = sanitizeAlphaNumHyphen(filters.saleId, ID_FIELD_MAX_LENGTH).trim();
  const taskId = sanitizeTaskIdInput(filters.taskId, ID_FIELD_MAX_LENGTH).trim();
  const uprnRaw = (filters.uprn ?? '').trim();
  const billingAuthority = (filters.billingAuthority?.[0] ?? '').trim();
  const billingAuthorityReference = (filters.bacode ?? '').trim();

  if (filters.searchBy === 'saleId') {
    return saleId.length >= 3 && SALE_ID_REGEX.test(saleId);
  }
  if (filters.searchBy === 'taskId') {
    return taskId.length >= TASK_ID_MIN_LENGTH && TASK_ID_REGEX.test(taskId);
  }
  if (filters.searchBy === 'uprn') {
    return uprnRaw.length > 0 && uprnRaw.length <= UPRN_MAX_LENGTH && /^[0-9]+$/.test(uprnRaw);
  }
  if (filters.searchBy === 'billingAuthority') {
    return billingAuthority.length > 0 && billingAuthorityReference.length > 0;
  }
  if (filters.searchBy === 'address') {
    return canSalesAddressSearch(filters, normalizePostcode, isValidPostcode);
  }
  return false;
};

const getAddressInvalidSalesFieldId = (
  postcodeValue: string,
  errors: {
    postcodeError?: string;
    streetError?: string;
    townError?: string;
    addressError?: string;
  },
): string | undefined => {
  if (postcodeValue.length > 0 && errors.postcodeError) return 'sales-postcode';
  if (errors.streetError) return 'sales-street';
  if (errors.townError) return 'sales-towncity';
  return errors.addressError ? 'sales-buildingnamenumber' : undefined;
};

const getFirstInvalidSalesFieldId = (
  filters: GridFilterState,
  errors: {
    saleIdError?: string;
    taskIdError?: string;
    uprnError?: string;
    billingAuthorityOptionsError?: string;
    postcodeError?: string;
    streetError?: string;
    townError?: string;
    addressError?: string;
  },
  normalizePostcode: (value: string) => string,
): string | undefined => {
  const saleIdValue = sanitizeAlphaNumHyphen(filters.saleId, ID_FIELD_MAX_LENGTH).trim();
  const taskIdValue = sanitizeTaskIdInput(filters.taskId, ID_FIELD_MAX_LENGTH).trim();
  const uprnValue = (filters.uprn ?? '').trim();
  const billingAuthorityValue = (filters.billingAuthority?.[0] ?? '').trim();
  const billingAuthorityRefValue = (filters.bacode ?? '').trim();
  const postcodeValue = normalizePostcode(filters.postcode ?? '').trim();

  if (filters.searchBy === 'saleId') {
    return saleIdValue.length === 0 || !!errors.saleIdError ? 'sales-saleid' : undefined;
  }
  if (filters.searchBy === 'taskId') {
    return taskIdValue.length === 0 || !!errors.taskIdError ? 'sales-taskid' : undefined;
  }
  if (filters.searchBy === 'uprn') {
    return uprnValue.length === 0 || !!errors.uprnError ? 'sales-uprn' : undefined;
  }
  if (filters.searchBy === 'billingAuthority') {
    if (!!errors.billingAuthorityOptionsError || billingAuthorityValue.length === 0) {
      return 'sales-billingauthority';
    }
    return billingAuthorityRefValue.length === 0 ? 'sales-bacode' : undefined;
  }
  if (filters.searchBy === 'address') {
    return getAddressInvalidSalesFieldId(postcodeValue, errors);
  }
  return undefined;
};

const applySalesSearchSubmissionValues = (
  next: GridFilterState,
  filters: GridFilterState,
  normalizePostcode: (value: string) => string,
): void => {
  if (filters.searchBy === 'saleId') {
    next.saleId = sanitizeAlphaNumHyphen(filters.saleId, ID_FIELD_MAX_LENGTH).trim() || undefined;
    return;
  }
  if (filters.searchBy === 'taskId') {
    next.taskId = sanitizeTaskIdInput(filters.taskId, ID_FIELD_MAX_LENGTH).trim() || undefined;
    return;
  }
  if (filters.searchBy === 'uprn') {
    next.uprn = sanitizeDigits(filters.uprn, UPRN_MAX_LENGTH).trim() || undefined;
    return;
  }
  if (filters.searchBy === 'billingAuthority') {
    const authority = (filters.billingAuthority?.[0] ?? '').trim();
    next.billingAuthority = authority ? [authority] : undefined;
    next.bacode = (filters.bacode ?? '').trim() || undefined;
    return;
  }
  if (filters.searchBy === 'address') {
    next.buildingNameNumber = (filters.buildingNameNumber ?? '').trim() || undefined;
    next.street = (filters.street ?? '').trim() || undefined;
    next.townCity = (filters.townCity ?? '').trim() || undefined;
    next.postcode = normalizePostcode(filters.postcode ?? '').trim() || undefined;
  }
};

const buildSalesSearchSubmission = (
  filters: GridFilterState,
  normalizePostcode: (value: string) => string,
): GridFilterState => {
  const sanitized = sanitizeFilters(filters);
  const next: GridFilterState = {
    ...sanitized,
    searchBy: filters.searchBy,
  };
  applySalesSearchSubmissionValues(next, filters, normalizePostcode);

  return next;
};

const getSalesSearchUnavailableReason = (searchBy: GridFilterState['searchBy']): string => {
  if (searchBy === 'saleId') {
    return 'Enter a valid Sale ID before searching.';
  }
  if (searchBy === 'taskId') {
    return 'Enter a valid Task ID before searching.';
  }
  if (searchBy === 'uprn') {
    return 'Enter a valid UPRN before searching.';
  }
  if (searchBy === 'billingAuthority') {
    return 'Select a Billing Authority and enter a Billing Authority Reference before searching.';
  }
  if (searchBy === 'address') {
    return 'Enter a valid postcode, or at least two address fields, before searching.';
  }
  return 'Enter valid search criteria before searching.';
};

const getColumnClassMetadata = (lowerName: string): { className?: string; headerClassName?: string } => {
  const columnClassNames: string[] = [];
  let headerClassName: string | undefined;

  if (lowerName === 'saleid') {
    columnClassNames.push('voa-col-saleid-cell');
    headerClassName = 'voa-col-saleid-header';
  }
  if (lowerName === 'saleprice' || lowerName === 'ratio' || lowerName === 'outlierratio') {
    columnClassNames.push('voa-col-numeric-cell');
    headerClassName = headerClassName ? `${headerClassName} voa-col-numeric-header` : 'voa-col-numeric-header';
  }

  const usesTabularNumerals = [
    'saleid',
    'taskid',
    'uprn',
    'transactiondate',
    'saleprice',
    'ratio',
    'outlierratio',
    'assigneddate',
    'taskcompleteddate',
    'qcassigneddate',
    'qccompleteddate',
  ].includes(lowerName);
  if (usesTabularNumerals) {
    columnClassNames.push('voa-col-tabular-cell');
    headerClassName = headerClassName ? `${headerClassName} voa-col-tabular-header` : 'voa-col-tabular-header';
  }
  if (lowerName === 'ratio' || lowerName === 'outlierratio') {
    columnClassNames.push('voa-col-numeric-gap-right-cell');
    headerClassName = headerClassName
      ? `${headerClassName} voa-col-numeric-gap-right-header`
      : 'voa-col-numeric-gap-right-header';
  }
  if (lowerName === 'dwellingtype' || lowerName === 'overallflag') {
    columnClassNames.push('voa-col-gap-left-cell');
    headerClassName = headerClassName
      ? `${headerClassName} voa-col-gap-left-header`
      : 'voa-col-gap-left-header';
  }
  if (lowerName === 'reviewflags' || lowerName === 'overallflag' || lowerName === 'summaryflags' || lowerName === 'taskstatus') {
    columnClassNames.push('voa-col-tag-dense');
  }

  return {
    className: columnClassNames.length > 0 ? columnClassNames.join(' ') : undefined,
    headerClassName,
  };
};

const isSummaryFlagField = (normalizedField: string): boolean => (
  normalizedField === 'summaryflags' || normalizedField === 'summaryflag'
);

const buildMenuTextLikeInitialState = (existing: ColumnFilterValue | undefined): {
  initialValue: ColumnFilterValue;
  minText: string;
  maxText: string;
} => ({
  initialValue: typeof existing === 'string' ? existing : '',
  minText: '',
  maxText: '',
});

const resolveSummaryObjectMultiValues = (
  existing: ColumnFilterValue | undefined,
  normalizedField: string,
): string[] | undefined => {
  if (!isSummaryFlagField(normalizedField)) {
    return undefined;
  }
  if (typeof existing !== 'object' || existing === null || Array.isArray(existing) || !('values' in existing)) {
    return undefined;
  }

  const rawValues = (existing as { values?: unknown }).values;
  return Array.isArray(rawValues) ? rawValues as string[] : [];
};

const buildMenuMultiSelectInitialState = (
  existing: ColumnFilterValue | undefined,
  normalizedField: string,
): {
  initialValue: ColumnFilterValue;
  minText: string;
  maxText: string;
} => {
  // All operators (contains, notContains, eq) use multi-select ComboBox which expects an array.
  const summaryObjectValues = resolveSummaryObjectMultiValues(existing, normalizedField);
  if (summaryObjectValues !== undefined) {
    return {
      initialValue: summaryObjectValues,
      minText: '',
      maxText: '',
    };
  }

  if (Array.isArray(existing)) {
    return { initialValue: existing, minText: '', maxText: '' };
  }
  if (isSummaryFlagField(normalizedField) && typeof existing === 'string' && existing.trim().length > 0) {
    return { initialValue: [existing], minText: '', maxText: '' };
  }
  return { initialValue: [], minText: '', maxText: '' };
};

const resolveMenuInitialValue = (
  cfg: ColumnFilterConfig | undefined,
  existing: ColumnFilterValue | undefined,
  normalizedField: string,
): {
  initialValue: ColumnFilterValue;
  minText: string;
  maxText: string;
} => {
  if (!cfg) {
    return buildMenuTextLikeInitialState(existing);
  }

  switch (cfg.control) {
    case 'textEq':
    case 'textPrefix':
    case 'textContains':
    case 'singleSelect':
      return buildMenuTextLikeInitialState(existing);
    case 'multiSelect':
      return buildMenuMultiSelectInitialState(existing, normalizedField);
    case 'numeric': {
      const existingNum = existing as NumericFilter | undefined;
      return {
        initialValue: existingNum ?? { mode: '>=' },
        minText: existingNum?.min !== undefined ? String(existingNum.min) : '',
        maxText: existingNum?.max !== undefined ? String(existingNum.max) : '',
      };
    }
    case 'dateRange':
      return {
        initialValue: (existing as DateRangeFilter) ?? {},
        minText: '',
        maxText: '',
      };
    default:
      return buildMenuTextLikeInitialState(existing);
  }
};

const resolveMenuSummaryOperator = (
  normalizedField: string,
  existing: ColumnFilterValue | undefined,
): 'contains' | 'notContains' | 'eq' => {
  if (!isSummaryFlagField(normalizedField)) {
    return 'contains';
  }
  if (typeof existing === 'object' && existing !== null && !Array.isArray(existing) && 'operator' in existing) {
    const opValue = (existing as { operator?: unknown }).operator;
    if (opValue === 'notContains' || opValue === 'eq') {
      return opValue;
    }
  }
  return 'contains';
};

const getMenuTextValidationError = (
  normalizedField: string,
  menuFilterText: string,
  normalizePostcode: (value: string) => string,
  isValidPostcode: (value: string, allowPartial?: boolean) => boolean,
): string | undefined => {
  if (normalizedField === 'postcode') {
    const trimmed = normalizePostcode(String(menuFilterText ?? ''));
    if (trimmed && !isValidPostcode(trimmed, true)) {
      return 'Enter a valid UK postcode';
    }
  }
  if (normalizedField === 'taskid') {
    const trimmed = sanitizeTaskIdInput(menuFilterText, ID_FIELD_MAX_LENGTH).trim();
    if (trimmed && trimmed.length < TASK_ID_MIN_LENGTH) {
      return `Enter at least ${TASK_ID_MIN_LENGTH} characters`;
    }
    if (trimmed && !TASK_ID_REGEX.test(trimmed)) {
      return 'Use A- or M- prefix (e.g. A-1000001) or numbers only.';
    }
  }
  return undefined;
};

const normalizeTextFilterValue = (
  normalizedField: string,
  menuFilterText: string,
  normalizePostcode: (value: string) => string,
): string => {
  if (normalizedField === 'taskid') {
    return sanitizeTaskIdInput(menuFilterText, ID_FIELD_MAX_LENGTH).trim();
  }
  if (normalizedField === 'postcode') {
    return normalizePostcode(String(menuFilterText ?? ''));
  }
  return String(menuFilterText ?? '').trim();
};

const resolveMenuMultiValues = (
  value: ColumnFilterValue,
  isSummary: boolean,
  operator: 'contains' | 'notContains' | 'eq',
): string[] => {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter((v) => v !== '');
  }
  if (typeof value === 'string' && value.trim() !== '') {
    if (!isSummary || operator === 'eq') {
      return [value.trim()];
    }
  }
  return [];
};

const shouldKeepNumericFilter = (value: NumericFilter): boolean => {
  if (value.mode === 'between') return value.min !== undefined || value.max !== undefined;
  if (value.mode === '<=') return value.max !== undefined;
  return value.min !== undefined;
};

const hasActiveColumnFilter = (existingFilter: ColumnFilterValue | undefined): boolean => {
  if (existingFilter === undefined || existingFilter === null) return false;
  if (Array.isArray(existingFilter)) return existingFilter.length > 0;
  if (typeof existingFilter === 'string') return existingFilter.trim().length > 0;
  if (typeof existingFilter === 'object') {
    const maybeRange = existingFilter as DateRangeFilter;
    if (typeof maybeRange.from === 'string' || typeof maybeRange.to === 'string') {
      return !!(maybeRange.from ?? maybeRange.to);
    }
    const maybeNumeric = existingFilter as NumericFilter;
    if (typeof maybeNumeric.mode === 'string') {
      if (maybeNumeric.mode === 'between') return maybeNumeric.min !== undefined || maybeNumeric.max !== undefined;
      if (maybeNumeric.mode === '<=') return maybeNumeric.max !== undefined;
      return maybeNumeric.min !== undefined;
    }
    return JSON.stringify(existingFilter) !== '{}';
  }
  return false;
};

const resolveFilterTextLength = (
  isPostcodeField: boolean,
  menuFilterText: string,
  normalizePostcode: (value: string) => string,
): number => (isPostcodeField
  ? normalizePostcode(String(menuFilterText ?? '')).length
  : (menuFilterText ?? '').trim().length);

const isTextApplyDisabled = (
  minLen: number,
  hasExistingFilter: boolean,
  isPostcodeField: boolean,
  menuFilterText: string,
  normalizePostcode: (value: string) => string,
): boolean => {
  const len = resolveFilterTextLength(isPostcodeField, menuFilterText, normalizePostcode);
  return len < minLen && !hasExistingFilter;
};

const isNumericApplyDisabled = (
  menuFilterValue: ColumnFilterValue,
  hasExistingFilter: boolean,
): boolean => {
  const v = (menuFilterValue as NumericFilter) ?? { mode: '>=' };
  if (v.mode === 'between') return v.min === undefined && v.max === undefined && !hasExistingFilter;
  if (v.mode === '<=') return v.max === undefined && !hasExistingFilter;
  return v.min === undefined && !hasExistingFilter;
};

const isColumnFilterApplyDisabled = (args: {
  cfg?: ColumnFilterConfig;
  isPostcodeField: boolean;
  minLen: number;
  menuFilterText: string;
  menuFilterValue: ColumnFilterValue;
  menuSummaryOperator: 'contains' | 'notContains' | 'eq';
  isSummaryFlagField: boolean;
  hasExistingFilter: boolean;
  normalizePostcode: (value: string) => string;
  isDateRangeIncomplete: boolean;
  isDateRangeInvalidOrder: boolean;
}): boolean => {
  const {
    cfg,
    isPostcodeField,
    minLen,
    menuFilterText,
    menuFilterValue,
    menuSummaryOperator,
    isSummaryFlagField: isSummary,
    hasExistingFilter,
    normalizePostcode,
    isDateRangeIncomplete,
    isDateRangeInvalidOrder,
  } = args;

  if (!cfg) {
    return isTextApplyDisabled(minLen, hasExistingFilter, isPostcodeField, menuFilterText, normalizePostcode);
  }

  switch (cfg.control) {
    case 'textEq':
    case 'textPrefix':
    case 'textContains':
      return isTextApplyDisabled(minLen, hasExistingFilter, isPostcodeField, menuFilterText, normalizePostcode);
    case 'singleSelect': {
      const val = typeof menuFilterValue === 'string' ? menuFilterValue.trim() : '';
      return val.length < minLen && !hasExistingFilter;
    }
    case 'multiSelect': {
      const vals = resolveMenuMultiValues(menuFilterValue, isSummary, menuSummaryOperator);
      return vals.length < minLen && !hasExistingFilter;
    }
    case 'numeric':
      return isNumericApplyDisabled(menuFilterValue, hasExistingFilter);
    case 'dateRange':
      return isDateRangeIncomplete || isDateRangeInvalidOrder;
    default:
      return false;
  }
};

const applyStringColumnFilter = (
  updated: Record<string, ColumnFilterValue>,
  fieldName: string,
  value: string,
): Record<string, ColumnFilterValue> => {
  if (value === '') {
    delete updated[fieldName];
  } else {
    updated[fieldName] = value;
  }
  return updated;
};

const applyNumericColumnFilter = (
  updated: Record<string, ColumnFilterValue>,
  fieldName: string,
  menuFilterValue: ColumnFilterValue,
): Record<string, ColumnFilterValue> => {
  const val = (menuFilterValue as NumericFilter) ?? { mode: '>=' };
  const sanitized: NumericFilter = {
    mode: val.mode ?? '>=',
    min: val.min ?? undefined,
    max: val.max ?? undefined,
  };
  if (!shouldKeepNumericFilter(sanitized)) {
    delete updated[fieldName];
  } else {
    updated[fieldName] = sanitized;
  }
  return updated;
};

const applyDateRangeColumnFilter = (
  updated: Record<string, ColumnFilterValue>,
  fieldName: string,
  menuFilterValue: ColumnFilterValue,
): Record<string, ColumnFilterValue> => {
  const val = (menuFilterValue as DateRangeFilter) ?? {};
  const normalized: DateRangeFilter = {
    from: val.from && val.from.trim() !== '' ? val.from : undefined,
    to: val.to && val.to.trim() !== '' ? val.to : undefined,
  };
  if (!normalized.from && !normalized.to) {
    delete updated[fieldName];
  } else {
    updated[fieldName] = normalized;
  }
  return updated;
};

const buildUpdatedColumnFilters = (args: {
  previous: Record<string, ColumnFilterValue>;
  fieldName: string;
  cfg?: ColumnFilterConfig;
  normalizedField: string;
  menuFilterText: string;
  menuFilterValue: ColumnFilterValue;
  menuSummaryOperator: 'contains' | 'notContains' | 'eq';
  normalizePostcode: (value: string) => string;
}): Record<string, ColumnFilterValue> => {
  const {
    previous,
    fieldName,
    cfg,
    normalizedField,
    menuFilterText,
    menuFilterValue,
    menuSummaryOperator,
    normalizePostcode,
  } = args;

  const updated: Record<string, ColumnFilterValue> = { ...previous };

  if (!cfg) {
    return applyStringColumnFilter(updated, fieldName, String(menuFilterText ?? '').trim());
  }

  switch (cfg.control) {
    case 'textEq':
    case 'textPrefix':
    case 'textContains': {
      const trimmed = normalizeTextFilterValue(normalizedField, menuFilterText, normalizePostcode);
      return applyStringColumnFilter(updated, fieldName, trimmed);
    }
    case 'singleSelect': {
      const val = typeof menuFilterValue === 'string' ? menuFilterValue : '';
      return applyStringColumnFilter(updated, fieldName, val);
    }
    case 'multiSelect':
      return applyMultiSelectColumnFilter(updated, fieldName, cfg, normalizedField, menuFilterValue, menuSummaryOperator);
    case 'numeric':
      return applyNumericColumnFilter(updated, fieldName, menuFilterValue);
    case 'dateRange':
      return applyDateRangeColumnFilter(updated, fieldName, menuFilterValue);
    default:
      return updated;
  }
};

const computeClearFilterValue = (
  cfg: ColumnFilterConfig,
  currentValue: ColumnFilterValue,
): { value: ColumnFilterValue; minText?: string; maxText?: string } => {
  if (cfg.control === 'multiSelect') {
    return { value: [] };
  }
  if (cfg.control === 'numeric') {
    const current = (currentValue as NumericFilter) ?? { mode: '>=' };
    return { value: { mode: current.mode ?? '>=', min: undefined, max: undefined }, minText: '', maxText: '' };
  }
  if (cfg.control === 'dateRange') {
    const current = (currentValue as DateRangeFilter) ?? {};
    return { value: { ...current, from: undefined, to: undefined } };
  }
  return { value: '' };
};

const applyMultiSelectColumnFilter = (
  updated: Record<string, ColumnFilterValue>,
  fieldName: string,
  cfg: ColumnFilterConfig,
  normalizedField: string,
  menuFilterValue: ColumnFilterValue,
  menuSummaryOperator: 'contains' | 'notContains' | 'eq',
): Record<string, ColumnFilterValue> => {
  const summaryField = isSummaryFlagField(normalizedField);
  const vals = resolveMenuMultiValues(menuFilterValue, summaryField, menuSummaryOperator);
  const isSingleAll = !!cfg.selectAllValues
    && cfg.selectAllValues.length === 1
    && String(cfg.selectAllValues[0] ?? '').toUpperCase() === 'ALL';
  const allKey = isSingleAll ? String(cfg.selectAllValues?.[0] ?? 'ALL') : '';
  const normalizedVals = allKey && vals.includes(allKey) ? [allKey] : vals;
  const hasSingleAllSelection = isSingleAll
    && normalizedVals.some((value) => isAllToken(value) || String(value) === allKey);
  if (normalizedVals.length === 0 || hasSingleAllSelection) {
    delete updated[fieldName];
  } else if (summaryField) {
    updated[fieldName] = { operator: menuSummaryOperator, values: normalizedVals };
  } else {
    updated[fieldName] = normalizedVals;
  }
  return updated;
};

export function getRecordKey(record: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord): string {
  const customKey = record.getValue(RecordsColumns.RecordKey);
  const trimmed = typeof customKey === 'string' ? customKey.trim() : '';
  return trimmed !== '' ? trimmed : record.getRecordId();
}

const resolveGridScreenKind = (
  normalizedId: string,
  name: string,
  propKind: GridScreenKind | undefined,
): GridScreenKind => {
  if (propKind) return propKind;
  switch (normalizedId) {
    case 'salesrecordsearch':
      return 'salesSearch';
    case 'managerassignment':
      return 'managerAssign';
    case 'caseworkerview':
      return 'caseworkerView';
    case 'qualitycontrolassignment':
      return 'qcAssign';
    case 'qualitycontrolview':
      return 'qcView';
    default:
      break;
  }

  const hasAssignment = name.includes('assignment');
  if (hasAssignment && name.includes('manager')) return 'managerAssign';
  if (hasAssignment && (name.includes('qc') || name.includes('quality'))) return 'qcAssign';
  if (name.includes('caseworker')) return 'caseworkerView';
  if (!hasAssignment && (name.includes('qc') || name.includes('quality'))) return 'qcView';
  if (name.includes('sales') || name.includes('record search') || name.includes('recordsearch')) return 'salesSearch';
  return 'unknown';
};

const deriveGridScreenFlags = (derivedScreenKind: GridScreenKind, tableKey: string) => {
  const isManagerAssign = derivedScreenKind === 'managerAssign';
  const isQcAssign = derivedScreenKind === 'qcAssign';
  const isCaseworkerView = derivedScreenKind === 'caseworkerView';
  const isQcView = derivedScreenKind === 'qcView';
  const isSalesSearch = derivedScreenKind === 'salesSearch';
  const isAllSalesTable = tableKey === 'allsales';

  return {
    isManagerAssign,
    isQcAssign,
    isCaseworkerView,
    isQcView,
    isSalesSearch,
    isAllSalesTable,
    isAssignment: isManagerAssign || isQcAssign,
    showAssign: isManagerAssign || isQcAssign,
    showCreateTask: isAllSalesTable || isSalesSearch,
    showMarkPassedQc: isQcView,
    useAssignmentLayout: isManagerAssign || isCaseworkerView || isQcAssign || isQcView,
  };
};

const resolveAssignButtonState = (args: {
  selectedCount: number;
  isAssignment: boolean;
  isManagerAssign: boolean;
  selection: ISelection<IObjectWithKey>;
  selectWarning: string;
  invalidStatusMessage: string;
}): { disabled: boolean; tooltip?: string } => {
  const {
    selectedCount,
    isAssignment,
    isManagerAssign,
    selection,
    selectWarning,
    invalidStatusMessage,
  } = args;

  if (selectedCount === 0) {
    return { disabled: true, tooltip: selectWarning };
  }
  if (!isAssignment) {
    return { disabled: false };
  }

  const selected = selection.getSelection() as Record<string, unknown>[];
  if (selected.length === 0) {
    return { disabled: false };
  }

  const config: AssignmentConfig = CONTROL_CONFIG.taskAssignment ?? {
    allowedStatusesManager: [] as string[],
    allowedStatusesQc: [] as string[],
    allowedStatuses: [] as string[],
  };
  const screenKindForAssign: ScreenKind = isManagerAssign ? 'managerAssign' : 'qcAssign';
  const result = resolveAssignmentStatusValidation(
    selected,
    screenKindForAssign,
    config,
    invalidStatusMessage,
  );
  if (result.error) {
    return { disabled: true, tooltip: result.error };
  }
  return { disabled: false };
};

export const Grid = React.memo((props: GridProps) => {
  const {
    showSearchPanel = true,
    screenKind: screenKindProp,
    tableKey = 'sales',
    taskCount,
    selectedCount = 0,
    datasetColumns,
    columnConfigs,
    records,
    sortedRecordIds,
    shimmer,
    itemsLoading,
    selectionType,
    selection,
    onNavigate,
    onSort,
    sorting,
    componentRef,
    compact,
    themeJSON,
    isHeaderVisible,
    resources,
    columnDatasetNotDefined,
    height,
    onSearch,
    onNextPage,
    onPrevPage,
    onSetPage,
    currentPage,
    totalPages,
    pageSize,
    canNext,
    canPrev,
    searchFilters,
    billingAuthorityOptions = [],
    billingAuthorityOptionsLoading = false,
    billingAuthorityOptionsError,
    caseworkerOptions = [],
    caseworkerOptionsLoading = false,
    caseworkerOptionsError,
    qcUserOptions = [],
    qcUserOptionsLoading = false,
    qcUserOptionsError,
    errorMessage,
    statusMessage,
    onStatusMessageDismiss,
    showResults,
    onLoadFilterOptions,
    columnFilterOptions = {},
    onColumnFiltersChange,
  columnFilters,
  disableClientFiltering,
    canvasScreenName,
    onAssignTasks,
    onPrefilterApply,
    prefilterApplied,
    onPrefilterClear,
    onPrefilterDirty,
    onSearchDirty,
    onBackRequested,
    contextSubtitle,
    onEditContext,
    contextScopeKey,
    disableViewSalesRecordAction = false,
    rowInvokeEnabled = true,
    assignUsers: assignUsersProp,
    assignUsersLoading = false,
    assignUsersError,
    assignUsersInfo,
    onAssignPanelToggle,
    currentUserId,
    onMarkPassedQc,
    onBulkCreateTask,
    canCreateManualTask = false,
  } = props;

  const theme = useTheme(themeJSON);
  const topRef = React.useRef<HTMLDivElement>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);
  const [horizontalOverflowState, setHorizontalOverflowState] = React.useState({
    hasOverflow: false,
    canScrollLeft: false,
    canScrollRight: false,
  });
  const hasSelectionColumn = selectionType !== SelectionMode.none;
  const paginationButtonStyles = React.useMemo(
    () => ({
      root: {
        height: 32,
        minWidth: 32,
        padding: '0 10px',
        borderRadius: 6,
        borderColor: theme.semanticColors.inputBorder,
      },
    }),
    [theme.semanticColors.inputBorder],
  );
  const activePaginationButtonStyles = React.useMemo(
    () => ({
      root: {
        height: 32,
        minWidth: 32,
        padding: '0 10px',
        borderRadius: 6,
        backgroundColor: theme.palette.themePrimary,
        borderColor: theme.palette.themePrimary,
        color: theme.palette.white,
        fontWeight: 600,
      },
      rootHovered: {
        backgroundColor: theme.palette.themeDark,
        borderColor: theme.palette.themeDark,
        color: theme.palette.white,
      },
    }),
    [theme.palette.themePrimary, theme.palette.themeDark, theme.palette.white],
  );

  const [columns, setColumns] = React.useState<IGridColumn[]>([]);
  const [columnFiltersState, setColumnFilters] = React.useState<Record<string, ColumnFilterValue>>(columnFilters ?? {});
  const [menuState, setMenuState] = React.useState<{
    target: HTMLElement;
    column: IGridColumn;
  }>();
  const [menuFilterValue, setMenuFilterValue] = React.useState<ColumnFilterValue>('');
  const [menuFilterText, setMenuFilterText] = React.useState('');
  const [menuFilterError, setMenuFilterError] = React.useState<string | undefined>();
  const [menuFilterSearch, setMenuFilterSearch] = React.useState('');
  const [menuSummaryOperator, setMenuSummaryOperator] = React.useState<'contains' | 'notContains' | 'eq'>('contains');
  const [menuNumericMinText, setMenuNumericMinText] = React.useState('');
  const [menuNumericMaxText, setMenuNumericMaxText] = React.useState('');
  const [menuExtraOptions, setMenuExtraOptions] = React.useState<Array<string | { key: string; text: string }>>([]); 
  const menuOptionsFieldRef = React.useRef<string>('');
  const liveFilterTimer = React.useRef<number | undefined>(undefined);
  const [filters, setFilters] = React.useState<GridFilterState>(searchFilters);
  const lastSubmittedSearchSignatureRef = React.useRef<string>(buildSearchSubmissionSignature(searchFilters));
  const autoSearchEnabled = false;
  const [billingAuthoritySearch, setBillingAuthoritySearch] = React.useState('');
  const [managerBillingSearch, setManagerBillingSearch] = React.useState('');
  const [caseworkerSearch, setCaseworkerSearch] = React.useState('');
  const [searchBySearch, setSearchBySearch] = React.useState('');
  const [prefilterSearchBySearch, setPrefilterSearchBySearch] = React.useState('');
  const [prefilterWorkThatSearch, setPrefilterWorkThatSearch] = React.useState('');
  const [comboSearchText, setComboSearchText] = React.useState<Record<string, string>>({});
  const [assignPanelOpen, setAssignPanelOpen] = React.useState(false);
  const [assignSearch, setAssignSearch] = React.useState('');
  const [selectFirstInput, setSelectFirstInput] = React.useState('');
  const [selectFirstError, setSelectFirstError] = React.useState<string | undefined>(undefined);
  const [assignLoading, setAssignLoading] = React.useState(false);
  const [assignSelectedUserId, setAssignSelectedUserId] = React.useState<string | undefined>();
  const [viewSaleLoading, setViewSaleLoading] = React.useState(false);
  const viewSaleRequestSeq = React.useRef(0);
  const viewSaleNavigationLockRef = React.useRef(false);
  const [viewSaleNavigationPending, setViewSaleNavigationPending] = React.useState(false);
  const [markPassedQcLoading, setMarkPassedQcLoading] = React.useState(false);
  const [prefilters, setPrefilters] = React.useState<ManagerPrefilterState>(MANAGER_PREFILTER_DEFAULT);
  const [prefilterExpanded, setPrefilterExpanded] = React.useState(true);
  const [prefilterContainerWidth, setPrefilterContainerWidth] = React.useState<number | null>(null);
  const [viewportMetrics, setViewportMetrics] = React.useState<ViewportMetrics>({
    width: 0,
    height: 0,
    zoomPercent: DEFAULT_ZOOM_PERCENT,
  });
  const [searchPanelExpanded, setSearchPanelExpanded] = React.useState(true);
  const [comboEditing, setComboEditing] = React.useState<Record<string, boolean>>({});
  const comboIgnoreNextInputRef = React.useRef<Record<string, boolean>>({});
  const comboIgnoreNextChangeRef = React.useRef<Record<string, boolean>>({});
  const comboExpectedSelectionRef = React.useRef<Record<string, { key: string; expiresAt: number }>>({});
  const comboCancelNextDismissRef = React.useRef<Record<string, boolean>>({});
  const lastManagerBillingSelectionRef = React.useRef<string>('');
  const lastCaseworkerSelectionRef = React.useRef<string>('');
  const [dismissedColumnConfigMessage, setDismissedColumnConfigMessage] = React.useState(false);
  const [dismissedErrorMessage, setDismissedErrorMessage] = React.useState(false);
  const [dismissedAssignUsersInfo, setDismissedAssignUsersInfo] = React.useState(false);
  const [dismissedAssignUsersError, setDismissedAssignUsersError] = React.useState(false);
  const [dismissedCreateTaskInfo, setDismissedCreateTaskInfo] = React.useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = React.useState(false);
  const [createTaskBusy, setCreateTaskBusy] = React.useState(false);
  const [createTaskError, setCreateTaskError] = React.useState<string | undefined>(undefined);
  const [searchResetNotice, setSearchResetNotice] = React.useState<string | undefined>();
  const [salesSearchTouched, setSalesSearchTouched] = React.useState<Partial<Record<SalesSearchFieldKey, boolean>>>({});
  const [salesSearchAttempted, setSalesSearchAttempted] = React.useState(false);
  const [prefilterResetNotice, setPrefilterResetNotice] = React.useState<string | undefined>();

  const setComboEditingFor = React.useCallback((key: string, isEditing: boolean) => {
    setComboEditing((prev) => (prev[key] === isEditing ? prev : { ...prev, [key]: isEditing }));
  }, []);
  const setComboIgnoreNextInput = React.useCallback((key: string) => {
    comboIgnoreNextInputRef.current[key] = true;
  }, []);
  const consumeComboIgnoreNextInput = React.useCallback((key: string) => {
    if (comboIgnoreNextInputRef.current[key]) {
      comboIgnoreNextInputRef.current[key] = false;
      return true;
    }
    return false;
  }, []);
  const setComboIgnoreNextChange = React.useCallback((key: string) => {
    comboIgnoreNextChangeRef.current[key] = true;
  }, []);
  const consumeComboIgnoreNextChange = React.useCallback((key: string, option?: IComboBoxOption) => {
    if (!comboIgnoreNextChangeRef.current[key]) return false;
    comboIgnoreNextChangeRef.current[key] = false;
    const expected = comboExpectedSelectionRef.current[key];
    const optKey = option?.key !== undefined ? String(option.key) : '';
    if (!expected) {
      return optKey === '';
    }
    if (optKey === '' || optKey === expected.key) {
      delete comboExpectedSelectionRef.current[key];
      return true;
    }
    delete comboExpectedSelectionRef.current[key];
    return false;
  }, []);
  const setComboExpectedSelection = React.useCallback((key: string, expectedKey: string) => {
    comboExpectedSelectionRef.current[key] = {
      key: expectedKey,
      expiresAt: Date.now() + 500,
    };
  }, []);
  const setComboCancelNextDismiss = React.useCallback((key: string) => {
    comboCancelNextDismissRef.current[key] = true;
  }, []);
  const consumeComboCancelNextDismiss = React.useCallback((key: string) => {
    if (!comboCancelNextDismissRef.current[key]) return false;
    delete comboCancelNextDismissRef.current[key];
    return true;
  }, []);
  const shouldIgnoreComboChange = React.useCallback((key: string, option?: IComboBoxOption) => {
    const expected = comboExpectedSelectionRef.current[key];
    if (!expected) return false;
    if (Date.now() > expected.expiresAt) {
      delete comboExpectedSelectionRef.current[key];
      return false;
    }
    const optKey = option?.key !== undefined ? String(option.key) : '';
    if (optKey === expected.key) {
      delete comboExpectedSelectionRef.current[key];
      return true;
    }
    if (!optKey) {
      return true;
    }
    delete comboExpectedSelectionRef.current[key];
    return false;
  }, []);
  const commitPrefilterMultiSelect = React.useCallback(
    (
      event: React.KeyboardEvent<IComboBox>,
      searchValue: string,
      options: IComboBoxOption[],
      selectedKeys: string[],
      onChange: (ev: React.FormEvent<IComboBox>, option?: IComboBoxOption) => void,
      ignoreKey: string,
      clearSearch: (value: string) => void,
    ) => {
      const isEnter = event.key === 'Enter';
      const isTab = event.key === 'Tab';
      if (!isEnter && !isTab) return;
      const resolvedKey = resolveComboKeyFromSearch(options, searchValue);
      if (!resolvedKey) return;
      const match = options.find((opt) => String(opt.key) === resolvedKey);
      if (!match || match.disabled) return;
      if (isEnter) {
        event.preventDefault();
      }
      const selected = selectedKeys.map(String).includes(String(resolvedKey));
      const nextOption: IComboBoxOption = { ...match, selected: !selected };
      onChange(event as unknown as React.FormEvent<IComboBox>, nextOption);
      setComboIgnoreNextInput(ignoreKey);
      clearSearch('');
    },
    [setComboIgnoreNextInput],
  );

  const commitComboSingleSelect = React.useCallback(
    (
      event: React.KeyboardEvent<IComboBox>,
      searchValue: string,
      options: IComboBoxOption[],
      selectedKey: string | number | boolean | undefined,
      onSelect: (option: IComboBoxOption) => void,
      ignoreKey?: string,
    ) => {
      const isEnter = event.key === 'Enter';
      const isTab = event.key === 'Tab';
      if (!isEnter && !isTab) return;
      const resolvedKey = resolveComboKeyFromSearch(options, searchValue, selectedKey);
      if (!resolvedKey) {
        if (isEnter) {
          event.preventDefault();
        }
        return;
      }
      const match = options.find((opt) => String(opt.key) === resolvedKey);
      if (!match || match.disabled) return;
      if (isEnter) {
        event.preventDefault();
      }
      if (ignoreKey) {
        setComboCancelNextDismiss(ignoreKey);
        setComboIgnoreNextChange(ignoreKey);
        setComboExpectedSelection(ignoreKey, String(resolvedKey));
      }
      onSelect(match);
    },
    [setComboCancelNextDismiss, setComboExpectedSelection, setComboIgnoreNextChange],
  );

  const commitComboSingleSelectOnDismiss = React.useCallback(
    (
      searchValue: string,
      options: IComboBoxOption[],
      selectedKey: string | number | boolean | undefined,
      onSelect: (option: IComboBoxOption) => void,
    ) => {
      const trimmed = searchValue.trim();
      if (!trimmed) return false;
      const resolvedKey = resolveComboKeyFromSearch(options, trimmed, selectedKey);
      if (!resolvedKey) return false;
      if (selectedKey !== undefined && String(selectedKey) === String(resolvedKey)) {
        return true;
      }
      const match = options.find((opt) => String(opt.key) === String(resolvedKey));
      if (!match || match.disabled) return false;
      onSelect(match);
      return true;
    },
    [],
  );

  React.useEffect(() => {
    setDismissedColumnConfigMessage(false);
  }, [columnDatasetNotDefined]);

  React.useEffect(() => {
    setDismissedErrorMessage(false);
  }, [errorMessage]);

  React.useEffect(() => {
    setDismissedAssignUsersInfo(false);
  }, [assignUsersInfo]);

  React.useEffect(() => {
    setDismissedAssignUsersError(false);
  }, [assignUsersError]);

  React.useEffect(() => {
    if (createTaskModalOpen) {
      setDismissedCreateTaskInfo(false);
      setCreateTaskError(undefined);
    }
  }, [createTaskModalOpen]);

  const dismissResultMessages = React.useCallback(() => {
    if (statusMessage) {
      onStatusMessageDismiss?.();
    }
    if (errorMessage && !dismissedErrorMessage) {
      setDismissedErrorMessage(true);
    }
  }, [dismissedErrorMessage, errorMessage, onStatusMessageDismiss, statusMessage]);

  const openAssignPanel = React.useCallback(() => {
    const allowOpen = onAssignPanelToggle?.(true);
    if (allowOpen === false) return;
    setAssignSelectedUserId(undefined);
    setAssignPanelOpen(true);
  }, [onAssignPanelToggle]);
  const closeAssignPanel = React.useCallback(() => {
    setAssignSelectedUserId(undefined);
    setAssignPanelOpen(false);
    onAssignPanelToggle?.(false);
  }, [onAssignPanelToggle]);
  const toggleSearchPanel = React.useCallback(() => {
    setSearchPanelExpanded((prev) => !prev);
  }, []);

  const screenName = (canvasScreenName ?? '').toLowerCase();
  const normalizedScreenId = React.useMemo(() => screenName.replace(/[^a-z0-9]/g, ''), [screenName]);
  const derivedScreenKind = React.useMemo<GridScreenKind>(
    () => resolveGridScreenKind(normalizedScreenId, screenName, screenKindProp),
    [normalizedScreenId, screenKindProp, screenName],
  );

  const {
    isManagerAssign,
    isQcAssign,
    isCaseworkerView,
    isQcView,
    isSalesSearch,
    isAllSalesTable,
    isAssignment,
    showAssign,
    showCreateTask,
    showMarkPassedQc,
    useAssignmentLayout,
  } = React.useMemo(() => deriveGridScreenFlags(derivedScreenKind, tableKey), [derivedScreenKind, tableKey]);
  const commonText = SCREEN_TEXT.common;
  const managerText = SCREEN_TEXT.managerAssignment;
  const qcText = SCREEN_TEXT.qcAssignment;
  const qcViewText = SCREEN_TEXT.qcView;
  const assignTasksText = SCREEN_TEXT.assignTasks;
  const viewSaleLoadingText = commonText.messages.loadingSaleRecord ?? assignTasksText.loadingText;
  const createTaskActionText = 'Create Task';

  const assignButtonState = React.useMemo((): { disabled: boolean; tooltip?: string } => {
    return resolveAssignButtonState({
      selectedCount,
      isAssignment,
      isManagerAssign,
      selection,
      selectWarning: assignTasksText.messages.selectTasksWarning,
      invalidStatusMessage: assignTasksText.messages.invalidStatus,
    });
  }, [selectedCount, isAssignment, isManagerAssign, selection, assignTasksText.messages]);
  const salesSearchText = SCREEN_TEXT.salesSearch;
  const caseworkerText = SCREEN_TEXT.caseworkerView;
  const markPassedQcText = SCREEN_TEXT.qcView.markPassedQc;

  const REASSIGNED_TO_QC_STATUS_NORMALIZED = 'reassigned to qc';
  const markPassedQcButtonState = React.useMemo((): { disabled: boolean; tooltip?: string } => {
    if (selectedCount === 0) {
      return { disabled: true, tooltip: markPassedQcText.messages.noSelection };
    }
    const selected = selection.getSelection() as Record<string, unknown>[];
    const allReassigned = selected.length > 0 && selected.every((rec) => {
      const statusRaw = (rec.taskstatus ?? rec.taskStatus ?? '') as string;
      return String(statusRaw).trim().toLowerCase() === REASSIGNED_TO_QC_STATUS_NORMALIZED;
    });
    if (!allReassigned) {
      return { disabled: true, tooltip: markPassedQcText.messages.invalidStatus };
    }
    return { disabled: false };
  }, [markPassedQcText.messages, selectedCount, selection]);

  const prefilterText = isQcAssign ? qcText.prefilter : isQcView ? qcViewText.prefilter : managerText.prefilter;
  const prefilterTooltips: PrefilterTooltips = isQcAssign
    ? qcText.prefilter.tooltips
    : isQcView
      ? qcViewText.prefilter.tooltips
      : managerText.prefilter.tooltips;
  const assignActionText = isQcAssign ? qcText.assignActionText : managerText.assignActionText;
  const assignHeaderText = assignTasksText.title;
  const assignUserListTitle = isQcAssign ? qcText.assignUserListTitle : managerText.assignUserListTitle;
  let pageHeaderText: string | undefined;
  if (isManagerAssign) {
    pageHeaderText = managerText.title;
  } else if (isQcAssign) {
    pageHeaderText = qcText.title;
  } else if (isCaseworkerView) {
    pageHeaderText = SCREEN_TEXT.caseworkerView.title;
  } else if (isQcView) {
    pageHeaderText = SCREEN_TEXT.qcView.title;
  } else if (isSalesSearch) {
    pageHeaderText = salesSearchText.title;
  }

  let emptyStateText = commonText.emptyState;
  if (isCaseworkerView && caseworkerText.emptyState) {
    emptyStateText = caseworkerText.emptyState;
  } else if (isQcAssign && qcText.emptyState) {
    emptyStateText = qcText.emptyState;
  } else if (isQcView && qcViewText.emptyState) {
    emptyStateText = qcViewText.emptyState;
  }
  const prefilterStorageKey = React.useMemo(
    () => buildPrefilterStorageKey(tableKey, derivedScreenKind, contextScopeKey),
    [contextScopeKey, derivedScreenKind, tableKey],
  );
  const legacyPrefilterStorageKey = React.useMemo(
    () => `voa-prefilters:${tableKey}:${screenName || 'default'}`,
    [screenName, tableKey],
  );
  const prefilterAutoAppliedRef = React.useRef<string>('');
  const prefilterAutoApplyDebugRef = React.useRef<string>('');
  const prefilterHydratedKeyRef = React.useRef<string>('');
  const prefilterManualApplyRef = React.useRef(false);
  const prefilterDirtyRef = React.useRef(false);
  const prefilterClearedRef = React.useRef(false);
  const prefilterHydratingRef = React.useRef(false);
  const prefilterHydrationTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const prefilterAutoApplyInFlightRef = React.useRef(false);
  const prefilterAutoApplyTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const schedulePrefilterHydrationClear = React.useCallback(() => {
    if (prefilterHydrationTimeoutRef.current !== undefined) {
      clearTimeout(prefilterHydrationTimeoutRef.current);
    }
    prefilterHydrationTimeoutRef.current = setTimeout(() => {
      prefilterHydrationTimeoutRef.current = undefined;
      prefilterHydratingRef.current = false;
    }, 0);
  }, []);
  const markPrefilterHydrating = React.useCallback(() => {
    prefilterHydratingRef.current = true;
    schedulePrefilterHydrationClear();
  }, [schedulePrefilterHydrationClear]);
  const clearAutoApplyInFlight = React.useCallback(() => {
    prefilterAutoApplyInFlightRef.current = false;
    if (prefilterAutoApplyTimeoutRef.current !== undefined) {
      clearTimeout(prefilterAutoApplyTimeoutRef.current);
      prefilterAutoApplyTimeoutRef.current = undefined;
    }
  }, []);
  const markAutoApplyInFlight = React.useCallback(() => {
    prefilterAutoApplyInFlightRef.current = true;
    if (prefilterAutoApplyTimeoutRef.current !== undefined) {
      clearTimeout(prefilterAutoApplyTimeoutRef.current);
    }
    prefilterAutoApplyTimeoutRef.current = setTimeout(() => {
      prefilterAutoApplyTimeoutRef.current = undefined;
      prefilterAutoApplyInFlightRef.current = false;
    }, 1000);
  }, []);
  const getPrefiltersForStorage = React.useCallback(
    (state: ManagerPrefilterState): ManagerPrefilterState => {
      const userId = (currentUserId ?? '').trim();
      if (!userId) return state;
      if (isCaseworkerView && state.searchBy === 'caseworker' && state.caseworkers.length === 0) {
        return { ...state, caseworkers: [userId] };
      }
      if (isQcView && state.searchBy === 'qcUser' && state.caseworkers.length === 0) {
        return { ...state, caseworkers: [userId] };
      }
      return state;
    },
    [currentUserId, isCaseworkerView, isQcView],
  );
  React.useEffect(() => {
    prefilterAutoAppliedRef.current = '';
    prefilterAutoApplyDebugRef.current = '';
    prefilterHydratedKeyRef.current = '';
    prefilterDirtyRef.current = false;
    prefilterClearedRef.current = false;
    prefilterHydratingRef.current = false;
    prefilterAutoApplyInFlightRef.current = false;
    if (prefilterHydrationTimeoutRef.current !== undefined) {
      clearTimeout(prefilterHydrationTimeoutRef.current);
      prefilterHydrationTimeoutRef.current = undefined;
    }
    if (prefilterAutoApplyTimeoutRef.current !== undefined) {
      clearTimeout(prefilterAutoApplyTimeoutRef.current);
      prefilterAutoApplyTimeoutRef.current = undefined;
    }
  }, [prefilterStorageKey]);

  React.useEffect(() => {
    if (!prefilterApplied) {
      prefilterAutoAppliedRef.current = '';
    } else {
      prefilterManualApplyRef.current = false;
      clearAutoApplyInFlight();
    }
  }, [clearAutoApplyInFlight, prefilterApplied]);

  React.useEffect(() => {
    if (columnFilters) {
      setColumnFilters(columnFilters);
    }
  }, [columnFilters]);

  const hasPrefilterExpectedUser = React.useCallback((selectedUsers: string[], expectedUser: string): boolean => {
    if (!expectedUser) {
      return selectedUsers.length === 0;
    }
    return selectedUsers.length === 1 && selectedUsers[0] === expectedUser;
  }, []);

  const hasNoPrefilterDateRange = React.useCallback((state: ManagerPrefilterState): boolean => {
    return !state.completedFrom && !state.completedTo;
  }, []);

  const isUserScopedPrefilterDefault = React.useCallback((
    state: ManagerPrefilterState,
    searchBy: ManagerSearchBy,
    workThat: ManagerWorkThat | undefined,
  ): boolean => {
    const expectedUser = (currentUserId ?? '').trim();
    return state.searchBy === searchBy
      && state.billingAuthorities.length === 0
      && hasPrefilterExpectedUser(state.caseworkers, expectedUser)
      && state.workThat === workThat
      && hasNoPrefilterDateRange(state);
  }, [currentUserId, hasNoPrefilterDateRange, hasPrefilterExpectedUser]);

  const isUnassignedPrefilterDefault = React.useCallback((state: ManagerPrefilterState, searchBy: ManagerSearchBy): boolean => {
    return state.searchBy === searchBy
      && state.billingAuthorities.length === 0
      && state.caseworkers.length === 0
      && !state.workThat
      && hasNoPrefilterDateRange(state);
  }, [hasNoPrefilterDateRange]);

  const isPrefilterDefault = React.useCallback((state: ManagerPrefilterState): boolean => {
    if (isCaseworkerView) {
      return isUserScopedPrefilterDefault(state, 'caseworker', CASEWORKER_PREFILTER_DEFAULT.workThat);
    }
    if (isQcView) {
      return isUserScopedPrefilterDefault(state, 'qcUser', QC_VIEW_PREFILTER_DEFAULT.workThat);
    }
    if (isQcAssign) {
      return isUnassignedPrefilterDefault(state, QC_PREFILTER_DEFAULT.searchBy);
    }
    return isUnassignedPrefilterDefault(state, 'billingAuthority');
  }, [isCaseworkerView, isQcAssign, isQcView, isUnassignedPrefilterDefault, isUserScopedPrefilterDefault]);
  const markPrefilterDirty = React.useCallback(() => {
    if (prefilterHydratingRef.current || prefilterAutoApplyInFlightRef.current) {
      return;
    }
    // User-driven edits must always invalidate the applied prefilter state,
    // even if hydration/auto-apply timers are currently active.
    prefilterDirtyRef.current = true;
    onPrefilterDirty?.();
  }, [onPrefilterDirty]);

  const lastScreenKindRef = React.useRef<GridScreenKind | undefined>(undefined);

  React.useEffect(() => {
    setSearchPanelExpanded(true);
  }, [derivedScreenKind]);

  React.useEffect(() => {
    if (!useAssignmentLayout) return;
    if (prefilterDirtyRef.current) return;
    if (prefilterApplied) return;
    if (shouldSkipPrefilterAutoApply(prefilterManualApplyRef.current, !!prefilterApplied)) {
      console.debug('[Prefilter] auto-apply skipped (manual apply pending)', {
        screen: derivedScreenKind,
        prefilterApplied,
      });
      return;
    }
    const stored = loadStoredPrefilterState(prefilterStorageKey, legacyPrefilterStorageKey);
    if (!stored) return;

    const normalizedNext = getPrefiltersForStorage(toManagerPrefilterState(stored.parsed, derivedScreenKind));
    const hydrationKey = `${prefilterStorageKey}|${derivedScreenKind}`;
    if (prefilterHydratedKeyRef.current !== hydrationKey) {
      prefilterHydratedKeyRef.current = hydrationKey;
      markPrefilterHydrating();
      setPrefilters(normalizedNext);
    }

    const decision = evaluatePrefilterAutoApplyDecision({
      normalizedNext,
      derivedScreenKind,
      isCaseworkerView,
      isQcAssign,
      isQcView,
      prefilterApplied,
      caseworkerOptionsLoading,
      caseworkerOptionsError,
      caseworkerOptions,
      qcUserOptionsLoading,
      qcUserOptionsError,
      qcUserOptions,
      storedApplied: typeof stored.parsed.applied === 'boolean' ? stored.parsed.applied : undefined,
    });

    if (prefilterAutoApplyDebugRef.current !== hydrationKey) {
      prefilterAutoApplyDebugRef.current = hydrationKey;
      console.debug('[Prefilter] auto-apply check', {
        screen: derivedScreenKind,
        storedApplied: decision.storedApplied,
        hasOwner: decision.hasOwner,
        hasWorkThat: decision.hasWorkThat,
        hasFromDate: decision.hasFromDate,
        userResolutionReady: decision.userResolutionReady,
        canAutoApply: decision.canAutoApply,
        shouldAutoApply: decision.shouldAutoApply,
        prefilterApplied,
        prefilterStorageKey,
        prefilters: normalizedNext,
      });
    }

    const shouldRunAutoApply = decision.shouldAutoApply
      && !prefilterApplied
      && !!onPrefilterApply
      && prefilterAutoAppliedRef.current !== hydrationKey;
    if (shouldRunAutoApply) {
      prefilterAutoAppliedRef.current = hydrationKey;
      markAutoApplyInFlight();
      runPrefilterAutoApply(onPrefilterApply, normalizedNext, derivedScreenKind);
    }

    migrateLegacyPrefilterState(
      stored.migratedFromLegacy,
      prefilterStorageKey,
      legacyPrefilterStorageKey,
      stored.raw,
    );
  }, [
    derivedScreenKind,
    isCaseworkerView,
    isQcAssign,
    isQcView,
    markAutoApplyInFlight,
    onPrefilterApply,
    prefilterApplied,
    prefilterStorageKey,
    caseworkerOptions,
    caseworkerOptionsError,
    caseworkerOptionsLoading,
    qcUserOptions,
    qcUserOptionsError,
    qcUserOptionsLoading,
    markPrefilterHydrating,
    getPrefiltersForStorage,
    useAssignmentLayout,
  ]);

  React.useEffect(() => {
    if (!useAssignmentLayout) return;
    try {
      const storedPrefilters = getPrefiltersForStorage(prefilters);
      const shouldRemove = shouldRemoveStoredPrefilter(
        isPrefilterDefault(storedPrefilters),
        !!prefilterApplied,
        prefilterClearedRef.current,
      );
      if (shouldRemove) {
        localStorage.removeItem(prefilterStorageKey);
      } else if (prefilterApplied) {
        const payload: StoredPrefilterState = { ...storedPrefilters, applied: true };
        localStorage.setItem(prefilterStorageKey, JSON.stringify(payload));
      } else if (!isPrefilterDefault(storedPrefilters) && prefilterDirtyRef.current) {
        const payload: StoredPrefilterState = { ...storedPrefilters, applied: false };
        localStorage.setItem(prefilterStorageKey, JSON.stringify(payload));
      }
    } catch {
      // ignore storage failures
    } finally {
      prefilterClearedRef.current = false;
    }
  }, [isPrefilterDefault, prefilterApplied, prefilterStorageKey, prefilters, useAssignmentLayout]);

  React.useEffect(() => {
    const element = topRef.current;
    if (!element) return;
    const readZoomPercent = (): number => {
      const scale = window.visualViewport?.scale;
      if (typeof scale === 'number' && Number.isFinite(scale) && scale > 0) {
        const zoomFromScale = Math.round(scale * 100);
        if (Math.abs(zoomFromScale - DEFAULT_ZOOM_PERCENT) > 1) {
          return zoomFromScale;
        }
      }
      const outerWidth = window.outerWidth;
      const innerWidth = window.innerWidth;
      if (Number.isFinite(outerWidth) && Number.isFinite(innerWidth) && innerWidth > 0) {
        const ratio = outerWidth / innerWidth;
        if (Number.isFinite(ratio) && ratio > 0.5 && ratio < 4) {
          return Math.round(ratio * 100);
        }
      }
      return DEFAULT_ZOOM_PERCENT;
    };
    const updateMetrics = (width: number, height: number) => {
      if (!Number.isFinite(width) || !Number.isFinite(height)) return;
      const nextWidth = Math.round(width);
      const nextHeight = Math.round(height);
      const nextZoomPercent = readZoomPercent();
      setViewportMetrics((prev) => (
        prev.width === nextWidth
        && prev.height === nextHeight
        && prev.zoomPercent === nextZoomPercent
          ? prev
          : {
            width: nextWidth,
            height: nextHeight,
            zoomPercent: nextZoomPercent,
          }
      ));
      if (useAssignmentLayout) {
        setPrefilterContainerWidth((prev) => (prev === nextWidth ? prev : nextWidth));
      }
    };
    const updateFromElement = () => updateMetrics(element.clientWidth, element.clientHeight);
    updateFromElement();
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return;
        const { width, height } = entries[0].contentRect;
        updateMetrics(width, height);
      });
      observer.observe(element);
    } else {
      window.addEventListener('resize', updateFromElement);
    }
    const visualViewport = window.visualViewport;
    visualViewport?.addEventListener('resize', updateFromElement);
    return () => {
      observer?.disconnect();
      if (typeof ResizeObserver === 'undefined') {
        window.removeEventListener('resize', updateFromElement);
      }
      visualViewport?.removeEventListener('resize', updateFromElement);
    };
  }, [useAssignmentLayout]);

  const updateHorizontalOverflowState = React.useCallback(() => {
    const element = resultsRef.current;
    if (!element) {
      setHorizontalOverflowState((prev) => (
        prev.hasOverflow || prev.canScrollLeft || prev.canScrollRight
          ? { hasOverflow: false, canScrollLeft: false, canScrollRight: false }
          : prev
      ));
      return;
    }
    const maxScrollLeft = Math.max(element.scrollWidth - element.clientWidth, 0);
    const hasOverflow = maxScrollLeft > 1;
    const canScrollLeft = hasOverflow && element.scrollLeft > 1;
    const canScrollRight = hasOverflow && element.scrollLeft < maxScrollLeft - 1;
    setHorizontalOverflowState((prev) => (
      prev.hasOverflow === hasOverflow
      && prev.canScrollLeft === canScrollLeft
      && prev.canScrollRight === canScrollRight
        ? prev
        : { hasOverflow, canScrollLeft, canScrollRight }
    ));
  }, []);

  const isPrefilterNarrow = useAssignmentLayout
    && prefilterContainerWidth !== null
    && prefilterContainerWidth < PREFILTER_COLLAPSE_BREAKPOINT;

  const togglePrefilters = React.useCallback(() => {
    setPrefilterExpanded((prev) => !prev);
  }, []);

  const dateStrings: IDatePickerStrings = React.useMemo(
    () => ({
      months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
      shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      goToToday: 'Go to today',
      prevMonthAriaLabel: 'Go to previous month',
      nextMonthAriaLabel: 'Go to next month',
      prevYearAriaLabel: 'Go to previous year',
      nextYearAriaLabel: 'Go to next year',
      prevYearRangeAriaLabel: 'Go to previous year range',
      nextYearRangeAriaLabel: 'Go to next year range',
      closeButtonAriaLabel: 'Close date picker',
      isRequiredErrorMessage: 'This field is required.',
      invalidInputErrorMessage: 'Invalid date format. Use DD/MM/YYYY.',
    }),
    [],
  );

  const toISODateString = React.useCallback((date?: Date | null): string | undefined => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const parseISODate = React.useCallback((value?: string): Date | undefined => {
    if (!value) return undefined;
    const [y, m, d] = value.split('-').map((v) => Number(v));
    if (!y || !m || !d) return undefined;
    return new Date(y, m - 1, d);
  }, []);

  const formatDisplayDate = React.useCallback((date?: Date | null): string => {
    if (!date) return '';
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const prefilterFromDateError = React.useMemo(
    () => getPrefilterFromDateError(prefilters.completedFrom, today),
    [prefilters.completedFrom, today],
  );

  const caseworkerPrefilterDefaults = React.useMemo<ManagerPrefilterState>(
    () => ({
      ...CASEWORKER_PREFILTER_DEFAULT,
      caseworkers: currentUserId ? [currentUserId] : [],
    }),
    [currentUserId],
  );
  const qcViewPrefilterDefaults = React.useMemo<ManagerPrefilterState>(
    () => ({
      ...QC_VIEW_PREFILTER_DEFAULT,
      caseworkers: currentUserId ? [currentUserId] : [],
    }),
    [currentUserId],
  );

  React.useEffect(() => {
    if (!isCaseworkerView) return;
    markPrefilterHydrating();
    setPrefilters((prev) => {
      if (prev.searchBy !== 'caseworker') {
        return caseworkerPrefilterDefaults;
      }
      const needsUser = caseworkerPrefilterDefaults.caseworkers.length > 0
        && (prev.caseworkers.length !== 1 || prev.caseworkers[0] !== caseworkerPrefilterDefaults.caseworkers[0]);
      const needsWorkThat = !prev.workThat;
      const needsCleanup = prev.billingAuthorities.length > 0;
      if (!needsUser && !needsWorkThat && !needsCleanup) return prev;
      return {
        ...prev,
        searchBy: 'caseworker',
        billingAuthorities: [],
        caseworkers: needsUser ? caseworkerPrefilterDefaults.caseworkers : prev.caseworkers,
        workThat: needsWorkThat ? caseworkerPrefilterDefaults.workThat : prev.workThat,
      };
    });
  }, [caseworkerPrefilterDefaults, isCaseworkerView, markPrefilterHydrating]);
  React.useEffect(() => {
    if (!isQcView) return;
    markPrefilterHydrating();
    setPrefilters((prev) => {
      if (prev.searchBy !== 'qcUser') {
        return qcViewPrefilterDefaults;
      }
      const needsUser = qcViewPrefilterDefaults.caseworkers.length > 0
        && (prev.caseworkers.length !== 1 || prev.caseworkers[0] !== qcViewPrefilterDefaults.caseworkers[0]);
      const needsWorkThat = !prev.workThat;
      const needsCleanup = prev.billingAuthorities.length > 0;
      if (!needsUser && !needsWorkThat && !needsCleanup) return prev;
      return {
        ...prev,
        searchBy: 'qcUser',
        billingAuthorities: [],
        caseworkers: needsUser ? qcViewPrefilterDefaults.caseworkers : prev.caseworkers,
        workThat: needsWorkThat ? qcViewPrefilterDefaults.workThat : prev.workThat,
      };
    });
  }, [isQcView, markPrefilterHydrating, qcViewPrefilterDefaults]);

  React.useEffect(() => {
    const prev = lastScreenKindRef.current;
    const next = derivedScreenKind;

    let hasStoredPrefilter = false;
    try {
      hasStoredPrefilter = !!localStorage.getItem(prefilterStorageKey);
    } catch {
      hasStoredPrefilter = false;
    }
    if (shouldResetPrefiltersOnScreenChange(prev, next, hasStoredPrefilter)) {
      markPrefilterHydrating();
      if (next === 'managerAssign') {
        setPrefilters(MANAGER_PREFILTER_DEFAULT);
        setPrefilterExpanded(true);
      } else if (next === 'caseworkerView') {
        setPrefilters(caseworkerPrefilterDefaults);
        setPrefilterExpanded(true);
      } else if (next === 'qcAssign') {
        setPrefilters(QC_PREFILTER_DEFAULT);
        setPrefilterExpanded(true);
      } else if (next === 'qcView') {
        setPrefilters(qcViewPrefilterDefaults);
        setPrefilterExpanded(true);
      }
    }

    lastScreenKindRef.current = next;
  }, [caseworkerPrefilterDefaults, derivedScreenKind, markPrefilterHydrating, prefilterStorageKey, qcViewPrefilterDefaults]);

  const onPrefilterSearchByChange = React.useCallback(
    (_: React.FormEvent<IComboBox>, option?: IComboBoxOption, _index?: number, value?: string) => {
      const options = (isQcAssign ? QC_SEARCH_BY_OPTIONS : MANAGER_SEARCH_BY_OPTIONS) as IComboBoxOption[];
      const resolvedKey = option?.key ?? resolveComboOptionKey(options, value);
      if (!resolvedKey) return;
      let showResetNotice = false;
      if (isQcAssign) {
        const next = String(resolvedKey) as ManagerSearchBy;
        setPrefilters((prev) => {
          const sameSearchBy = prev.searchBy === next;
          const keepUsers = sameSearchBy && (next === 'qcUser' || next === 'caseworker');
          const nextState: ManagerPrefilterState = {
            ...prev,
            searchBy: next,
            billingAuthorities: [],
            caseworkers: keepUsers ? prev.caseworkers : [],
            workThat: undefined,
            completedFrom: undefined,
            completedTo: undefined,
          };
          showResetNotice = prev.searchBy !== next && (
            prev.billingAuthorities.length > 0
            || (!keepUsers && prev.caseworkers.length > 0)
            || !!prev.workThat
            || !!prev.completedFrom
            || !!prev.completedTo
          );
          return nextState;
        });
      } else {
        const next = resolvedKey === 'caseworker' ? 'caseworker' : 'billingAuthority';
        setPrefilters((prev) => {
          const nextState: ManagerPrefilterState = {
            ...prev,
            searchBy: next as ManagerSearchBy,
            billingAuthorities: next === 'billingAuthority' ? prev.billingAuthorities : [],
            caseworkers: next === 'caseworker' ? prev.caseworkers : [],
            workThat: undefined,
            completedFrom: undefined,
            completedTo: undefined,
          };
          showResetNotice = prev.searchBy !== next && (
            (next !== 'billingAuthority' && prev.billingAuthorities.length > 0)
            || (next !== 'caseworker' && prev.caseworkers.length > 0)
            || !!prev.workThat
            || !!prev.completedFrom
            || !!prev.completedTo
          );
          return nextState;
        });
      }
      setPrefilterResetNotice(showResetNotice ? PREFILTER_RESET_NOTICE : undefined);
      setComboEditingFor('prefilterWorkThat', false);
      setPrefilterWorkThatSearch('');
      markPrefilterDirty();
    },
    [isQcAssign, markPrefilterDirty, setComboEditingFor],
  );

  const normalizedCaseworkerOptions = React.useMemo<IDropdownOption[]>(() => {
    const seen = new Set<string>();
    return (Array.isArray(caseworkerOptions) ? caseworkerOptions : [])
      .filter((value) => typeof value === 'string')
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .filter((value) => {
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
      })
      .map((value) => ({ key: value, text: value }));
  }, [caseworkerOptions]);

  const normalizedQcUserOptions = React.useMemo<IDropdownOption[]>(() => {
    const seen = new Set<string>();
    return (Array.isArray(qcUserOptions) ? qcUserOptions : [])
      .filter((value) => typeof value === 'string')
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .filter((value) => {
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
      })
      .map((value) => ({ key: value, text: value }));
  }, [qcUserOptions]);

  const caseworkerOptionsList = React.useMemo<IDropdownOption[]>(() => {
    if (caseworkerOptionsLoading) {
      return [{ key: '__loading__', text: 'Loading caseworkers...', disabled: true }];
    }
    if (caseworkerOptionsError) {
      return [{ key: '__error__', text: caseworkerOptionsError, disabled: true }];
    }
    if (normalizedCaseworkerOptions.length === 0) {
      return [{ key: '__empty__', text: 'No caseworkers found', disabled: true }];
    }
    return [{ key: CASEWORKER_ALL_KEY, text: 'All' }, ...normalizedCaseworkerOptions];
  }, [caseworkerOptionsError, caseworkerOptionsLoading, normalizedCaseworkerOptions]);

  const qcUserOptionsList = React.useMemo<IDropdownOption[]>(() => {
    if (qcUserOptionsLoading) {
      return [{ key: '__loading__', text: 'Loading QC users...', disabled: true }];
    }
    if (qcUserOptionsError) {
      return [{ key: '__error__', text: qcUserOptionsError, disabled: true }];
    }
    if (normalizedQcUserOptions.length === 0) {
      return [{ key: '__empty__', text: 'No QC users found', disabled: true }];
    }
    return isQcAssign
      ? [{ key: CASEWORKER_ALL_KEY, text: 'All' }, ...normalizedQcUserOptions]
      : normalizedQcUserOptions;
  }, [isQcAssign, normalizedQcUserOptions, qcUserOptionsError, qcUserOptionsLoading]);

  const filteredCaseworkerOptionsList = React.useMemo(
    () => filterComboOptions(caseworkerOptionsList as IComboBoxOption[], caseworkerSearch),
    [caseworkerOptionsList, caseworkerSearch],
  );

  const filteredQcUserOptionsList = React.useMemo(
    () => filterComboOptions(qcUserOptionsList as IComboBoxOption[], caseworkerSearch),
    [caseworkerSearch, qcUserOptionsList],
  );

  const setComboSearchTextFor = React.useCallback((key: string, value?: string) => {
    setComboSearchText((prev) => ({
      ...prev,
      [key]: normalizeComboSearchText(value),
    }));
  }, []);

  const caseworkerSelectedKeys = React.useMemo<string[]>(() => {
    const selected = prefilters.caseworkers ?? [];
    if (selected.length === 0) return [];
    const withoutAll = selected.filter((v) => v !== CASEWORKER_ALL_KEY);
    if (withoutAll.length > 0) {
      return withoutAll;
    }
    return selected.includes(CASEWORKER_ALL_KEY) ? [CASEWORKER_ALL_KEY] : selected;
  }, [prefilters.caseworkers]);

  const onPrefilterCaseworkerChange = React.useCallback(
    (_: React.FormEvent<IComboBox>, option?: IComboBoxOption) => {
      if (!option || option.disabled) return;
      setPrefilterResetNotice(undefined);
      const key = String(option.key);
      if (key === CASEWORKER_ALL_KEY) {
        setPrefilters((prev) => ({
          ...prev,
          caseworkers: option.selected ? [CASEWORKER_ALL_KEY] : [],
        }));
        markPrefilterDirty();
        return;
      }
      if (key.startsWith('__')) return;
      setPrefilters((prev) => {
        const current = prev.caseworkers.filter((v) => v !== CASEWORKER_ALL_KEY);
        const next = option.selected ? [...current, key] : current.filter((v) => v !== key);
        return { ...prev, caseworkers: next };
      });
      markPrefilterDirty();
    },
    [markPrefilterDirty],
  );

  const getPrefilterWorkThatOptions = React.useCallback((): IComboBoxOption[] => {
    if (isCaseworkerView) {
      return CASEWORKER_WORKTHAT_SELF_OPTIONS as IComboBoxOption[];
    }
    if (isQcView) {
      return QC_WORKTHAT_SELF_OPTIONS as IComboBoxOption[];
    }
    if (isQcAssign) {
      return getQcWorkThatOptions(prefilters.searchBy as QcSearchBy) as IComboBoxOption[];
    }
    return getManagerWorkThatOptions(prefilters.searchBy) as IComboBoxOption[];
  }, [isCaseworkerView, isQcAssign, isQcView, prefilters.searchBy]);

  const shouldRetainPrefilterCompletedDates = React.useCallback((workThat: ManagerWorkThat | undefined): boolean => {
    return (isQcAssign || isQcView)
      ? isQcCompletedWorkThat(workThat)
      : isManagerCompletedWorkThat(workThat);
  }, [isQcAssign, isQcView]);

  const resetPrefilterComboTracking = React.useCallback((): void => {
    comboIgnoreNextInputRef.current = {};
    comboIgnoreNextChangeRef.current = {};
    comboExpectedSelectionRef.current = {};
  }, []);

  const getPrefilterClearDefaults = React.useCallback((): ManagerPrefilterState => {
    if (isCaseworkerView) {
      return caseworkerPrefilterDefaults;
    }
    if (isQcView) {
      return qcViewPrefilterDefaults;
    }
    if (isQcAssign) {
      return QC_PREFILTER_DEFAULT;
    }
    return MANAGER_PREFILTER_DEFAULT;
  }, [caseworkerPrefilterDefaults, isCaseworkerView, isQcAssign, isQcView, qcViewPrefilterDefaults]);

  const onPrefilterWorkThatChange = React.useCallback(
    (_: React.FormEvent<IComboBox>, option?: IComboBoxOption, _index?: number, value?: string) => {
      const options = getPrefilterWorkThatOptions();
      const resolvedKey = option?.key ?? resolveComboOptionKey(options, value);
      const nextWork = resolvedKey as ManagerWorkThat | undefined;
      const needsCompleted = shouldRetainPrefilterCompletedDates(nextWork);
      setPrefilterResetNotice(undefined);
      setPrefilters((prev) => ({
        ...prev,
        workThat: nextWork,
        completedFrom: needsCompleted ? prev.completedFrom : undefined,
        completedTo: needsCompleted ? prev.completedTo : undefined,
      }));
      markPrefilterDirty();
    },
    [getPrefilterWorkThatOptions, markPrefilterDirty, shouldRetainPrefilterCompletedDates],
  );

  const onPrefilterFromDateChange = React.useCallback(
    (date?: Date | null) => {
      const fromIso = date ? toISODateString(date) : undefined;
      const toIso = computeCompletedToDateIso(date, today);
      setPrefilterResetNotice(undefined);
      setPrefilters((prev) => ({
        ...prev,
        completedFrom: fromIso,
        completedTo: toIso,
      }));
      markPrefilterDirty();
    },
    [markPrefilterDirty, toISODateString, today],
  );

  const handlePrefilterSearch = React.useCallback(() => {
    if (!onPrefilterApply) return;

    const normalizePrefiltersForApply = (state: ManagerPrefilterState): ManagerPrefilterState => {
      const needsCompleted = shouldRetainPrefilterCompletedDates(state.workThat);
      return {
        ...state,
        completedFrom: needsCompleted ? state.completedFrom : undefined,
        completedTo: needsCompleted ? state.completedTo : undefined,
      };
    };

    const persistAppliedPrefilters = (state: ManagerPrefilterState): void => {
      try {
        const storedPrefilters = getPrefiltersForStorage(state);
        const payload: StoredPrefilterState = { ...storedPrefilters, applied: true };
        localStorage.setItem(prefilterStorageKey, JSON.stringify(payload));
      } catch {
        // ignore storage failures
      }
    };

    const normalized = normalizePrefiltersForApply(prefilters);
    dismissResultMessages();
    prefilterManualApplyRef.current = true;
    persistAppliedPrefilters(normalized);
    onPrefilterApply(normalized, { source: 'user' });
    setPrefilterResetNotice(undefined);
    prefilterDirtyRef.current = false;
    clearAutoApplyInFlight();
    resetPrefilterComboTracking();
    if (isPrefilterNarrow) {
      setPrefilterExpanded(false);
    }
  }, [clearAutoApplyInFlight, dismissResultMessages, getPrefiltersForStorage, isPrefilterNarrow, onPrefilterApply, prefilterStorageKey, prefilters, resetPrefilterComboTracking, shouldRetainPrefilterCompletedDates]);

  const handlePrefilterClear = React.useCallback(() => {
    dismissResultMessages();
    setPrefilterResetNotice(undefined);
    prefilterDirtyRef.current = true;
    prefilterClearedRef.current = true;
    clearAutoApplyInFlight();
    resetPrefilterComboTracking();
    setPrefilters(getPrefilterClearDefaults());
    setComboEditingFor('prefilterSearchBy', false);
    setComboEditingFor('prefilterWorkThat', false);
    setPrefilterSearchBySearch('');
    setPrefilterWorkThatSearch('');
    setManagerBillingSearch('');
    setCaseworkerSearch('');
    onPrefilterClear?.();
  }, [
    clearAutoApplyInFlight,
    dismissResultMessages,
    getPrefilterClearDefaults,
    onPrefilterClear,
    resetPrefilterComboTracking,
    setComboEditingFor,
  ]);

  const getLengthErrors = React.useCallback(
    (fs: GridFilterState): LengthErrors => {
      if (isSalesSearch) {
        return getSalesSearchErrors(fs) as LengthErrors;
      }
      return getNonSalesLengthErrors(fs, normalizeUkPostcode, isValidUkPostcode);
    },
    [isSalesSearch, isValidUkPostcode, normalizeUkPostcode],
  );

  // Debounced search when typing in non-UPRN text fields
  const searchTimer = React.useRef<number | undefined>(undefined);
  const scheduleSearch = React.useCallback(() => {
    if (!autoSearchEnabled) {
      return;
    }
    if (searchTimer.current) {
      window.clearTimeout(searchTimer.current);
    }
    searchTimer.current = window.setTimeout(() => {
      const lengthErrors = getLengthErrors(filters);
      if (lengthErrors.address || lengthErrors.postcode || lengthErrors.summaryFlag) {
        return;
      }
      const sanitized = sanitizeFilters(filters);
      if (
        !isSalesSearch &&
        sanitized.searchBy === 'uprn' &&
        sanitized.uprn &&
        (sanitized.uprn.length < 8 || sanitized.uprn.length > 10)
      ) {
        return;
      }
      setFilters(sanitized);
      onSearch(sanitized);
    }, 350);
  }, [autoSearchEnabled, filters, getLengthErrors, isSalesSearch, onSearch]);

  React.useEffect(() => () => {
    if (searchTimer.current) {
      window.clearTimeout(searchTimer.current);
    }
  }, []);

  React.useEffect(() => {
    setFilters(searchFilters);
    lastSubmittedSearchSignatureRef.current = buildSearchSubmissionSignature(searchFilters);
  }, [searchFilters]);

  React.useEffect(() => {
    setMenuFilterSearch('');
  }, [menuState]);

  const searchByOptions = React.useMemo<IDropdownOption[]>(() => {
    const keys = isSalesSearch ? SALES_SEARCH_OPTIONS : getSearchByOptionsFor(tableKey);
    return keys.map((k) => {
      const cfg = SEARCH_FIELD_CONFIGS[k];
      const label = cfg?.label ?? k.charAt(0).toUpperCase() + k.slice(1);
      return { key: k, text: label };
    });
  }, [isSalesSearch, tableKey]);
  const filteredSearchByOptions = React.useMemo(
    () => filterComboOptions(searchByOptions as IComboBoxOption[], searchBySearch),
    [searchByOptions, searchBySearch],
  );
  const searchByHint = comboEditing.searchBy
    ? getComboDisambiguationHint(filteredSearchByOptions, searchBySearch)
    : undefined;
  const searchByTitle = buildSelectedTooltip(
    [String(filters.searchBy)],
    searchByOptions as IComboBoxOption[],
    isSalesSearch ? salesSearchText.searchPanel.searchByLabel : commonText.labels.searchBy,
  );
  const resolveSearchByOptions = (searchValue: string): IComboBoxOption[] => {
    return filterComboOptions(searchByOptions as IComboBoxOption[], searchValue);
  };
  const commitSearchBySingleSelect = (event: React.KeyboardEvent<IComboBox>, inputValue: string): void => {
    const resolvedOptions = resolveSearchByOptions(inputValue);
    commitComboSingleSelect(event, inputValue, resolvedOptions, filters.searchBy, (opt) => {
      onSearchByChange(event as unknown as React.FormEvent<IComboBox>, opt);
      setComboEditingFor('searchBy', false);
      setSearchBySearch('');
    }, 'searchBy');
  };
  const handleSearchByComboChange = (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    _index?: number,
    value?: string,
  ): void => {
    if (consumeComboIgnoreNextChange('searchBy', option)) return;
    if (shouldIgnoreComboChange('searchBy', option)) return;
    const searchValue = typeof value === 'string' ? value : searchBySearch;
    const resolvedOptions = resolveSearchByOptions(searchValue);
    const resolvedKey = option?.key ?? resolveComboKeyFromSearch(resolvedOptions, searchValue, filters.searchBy);
    if (!resolvedKey) return;
    setComboCancelNextDismiss('searchBy');
    onSearchByChange(event, { key: resolvedKey } as IComboBoxOption);
    setComboEditingFor('searchBy', false);
    setSearchBySearch('');
  };
  const handleSearchByComboKeyDownCapture = (event: React.KeyboardEvent<IComboBox>): void => {
    if (event.key === 'Escape') {
      setComboCancelNextDismiss('searchBy');
      return;
    }
    const isEnter = event.key === 'Enter' || event.key === 'NumpadEnter';
    if (!isEnter) return;
    const inputValue = getComboInputValue(event) || searchBySearch;
    if (!inputValue.trim()) return;
    commitSearchBySingleSelect(event, inputValue);
  };
  const handleSearchByComboInputValueChange = (value: string): void => {
    const next = normalizeSingleSelectSearchText(
      value,
      searchByOptions as IComboBoxOption[],
    );
    if (!next) {
      setComboEditingFor('searchBy', false);
      setSearchBySearch('');
      return;
    }
    setComboEditingFor('searchBy', true);
    setSearchBySearch(next);
  };
  const handleSearchByComboKeyDown = (event: React.KeyboardEvent<IComboBox>): void => {
    if (event.defaultPrevented) return;
    const inputValue = getComboInputValue(event) || searchBySearch;
    if (!inputValue.trim()) return;
    commitSearchBySingleSelect(event, inputValue);
  };
  const handleSearchByComboDismissed = (): void => {
    if (!consumeComboCancelNextDismiss('searchBy')) {
      commitComboSingleSelectOnDismiss(
        searchBySearch,
        searchByOptions as IComboBoxOption[],
        filters.searchBy,
        (opt) => onSearchByChange({} as React.FormEvent<IComboBox>, opt),
      );
    }
    setComboEditingFor('searchBy', false);
    setSearchBySearch('');
  };

  const lengthErrors = React.useMemo(() => getLengthErrors(filters), [filters, getLengthErrors]);
  const addressError = lengthErrors.address;
  const postcodeError = lengthErrors.postcode;
  const streetError = lengthErrors.street;
  const townError = lengthErrors.townCity;
  const saleIdError = lengthErrors.saleId;
  const taskIdError = lengthErrors.taskId;
  const billingAuthorityError = lengthErrors.billingAuthority;
  const billingAuthorityRefError = lengthErrors.bacode;
  const normalizedBillingAuthorityOptions = React.useMemo<IComboBoxOption[]>(() => {
    const seen = new Set<string>();
    return (Array.isArray(billingAuthorityOptions) ? billingAuthorityOptions : [])
      .filter((value) => typeof value === 'string')
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .filter((value) => {
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
      })
      .map((value) => ({ key: value, text: value }));
  }, [billingAuthorityOptions]);

  const billingAuthorityOptionsList = React.useMemo<IComboBoxOption[]>(() => {
    if (billingAuthorityOptionsLoading) {
      return [{ key: '__loading__', text: 'Loading...', disabled: true }];
    }
    if (billingAuthorityOptionsError) {
      return [{ key: '__error__', text: billingAuthorityOptionsError, disabled: true }];
    }
    return normalizedBillingAuthorityOptions;
  }, [billingAuthorityOptionsError, billingAuthorityOptionsLoading, normalizedBillingAuthorityOptions]);

  const filteredBillingAuthorityOptionsList = React.useMemo(
    () => filterComboOptions(billingAuthorityOptionsList, billingAuthoritySearch),
    [billingAuthorityOptionsList, billingAuthoritySearch],
  );
  const salesSearchRequiredErrors = React.useMemo(() => {
    if (!isSalesSearch) {
      return {
        saleId: undefined,
        taskId: undefined,
        uprn: undefined,
        billingAuthority: undefined,
        bacode: undefined,
      };
    }

    const shouldShow = (key: SalesSearchFieldKey): boolean => salesSearchAttempted || !!salesSearchTouched[key];
    const saleIdValue = sanitizeAlphaNumHyphen(filters.saleId, ID_FIELD_MAX_LENGTH).trim();
    const taskIdValue = sanitizeTaskIdInput(filters.taskId, ID_FIELD_MAX_LENGTH).trim();
    const uprnValue = (filters.uprn ?? '').trim();
    const billingAuthorityValue = (filters.billingAuthority?.[0] ?? '').trim();
    const billingAuthorityRefValue = (filters.bacode ?? '').trim();

    return {
      saleId: filters.searchBy === 'saleId' && shouldShow('saleId') && saleIdValue.length === 0
        ? 'Sale ID is required'
        : undefined,
      taskId: filters.searchBy === 'taskId' && shouldShow('taskId') && taskIdValue.length === 0
        ? 'Task ID is required'
        : undefined,
      uprn: filters.searchBy === 'uprn' && shouldShow('uprn') && uprnValue.length === 0
        ? 'UPRN is required'
        : undefined,
      billingAuthority: filters.searchBy === 'billingAuthority' && shouldShow('billingAuthority') && billingAuthorityValue.length === 0
        ? 'Billing Authority is required'
        : undefined,
      bacode: filters.searchBy === 'billingAuthority'
        && shouldShow('bacode')
        && billingAuthorityValue.length > 0
        && billingAuthorityRefValue.length === 0
        ? 'Billing Authority Reference is required'
        : undefined,
    };
  }, [filters.bacode, filters.billingAuthority, filters.saleId, filters.searchBy, filters.taskId, filters.uprn, isSalesSearch, salesSearchAttempted, salesSearchTouched]);

  const managerBillingAuthorityOptions = React.useMemo<IDropdownOption[]>(() => {
    if (billingAuthorityOptionsLoading) {
      return [{ key: '__loading__', text: 'Loading...', disabled: true }];
    }
    if (billingAuthorityOptionsError) {
      return [{ key: '__error__', text: billingAuthorityOptionsError, disabled: true }];
    }
    const base = normalizedBillingAuthorityOptions;
    return base.length > 0 ? [{ key: BILLING_AUTHORITY_ALL_KEY, text: 'All' }, ...base] : base;
  }, [billingAuthorityOptionsError, billingAuthorityOptionsLoading, normalizedBillingAuthorityOptions]);

  const filteredManagerBillingAuthorityOptions = React.useMemo(
    () => filterComboOptions(managerBillingAuthorityOptions as IComboBoxOption[], managerBillingSearch),
    [managerBillingAuthorityOptions, managerBillingSearch],
  );
  const prefilterBillingHint = managerBillingSearch.trim()
    ? getComboDisambiguationHint(filteredManagerBillingAuthorityOptions, managerBillingSearch)
    : undefined;

  const prefilterSearchByOptions = React.useMemo(
    () => (isQcAssign ? QC_SEARCH_BY_OPTIONS : MANAGER_SEARCH_BY_OPTIONS),
    [isQcAssign],
  );
  const filteredPrefilterSearchByOptions = React.useMemo(
    () => filterComboOptions(
      prefilterSearchByOptions as IComboBoxOption[],
      prefilterSearchBySearch,
    ),
    [prefilterSearchByOptions, prefilterSearchBySearch],
  );
  const prefilterSearchByHint = comboEditing.prefilterSearchBy
    ? getComboDisambiguationHint(filteredPrefilterSearchByOptions, prefilterSearchBySearch)
    : undefined;
  const prefilterSearchByTitle = buildSelectedTooltip(
    [String(prefilters.searchBy)],
    prefilterSearchByOptions as IComboBoxOption[],
    prefilterTooltips.searchBy,
  );
  const resolvePrefilterSearchByOptions = (searchValue: string): IComboBoxOption[] => {
    return filterComboOptions(
      prefilterSearchByOptions as IComboBoxOption[],
      searchValue,
    );
  };
  const commitPrefilterSearchBySingleSelect = (event: React.KeyboardEvent<IComboBox>, inputValue: string): void => {
    const resolvedOptions = resolvePrefilterSearchByOptions(inputValue);
    commitComboSingleSelect(
      event,
      inputValue,
      resolvedOptions,
      prefilters.searchBy,
      (opt) => {
        onPrefilterSearchByChange(event as unknown as React.FormEvent<IComboBox>, opt);
        setComboEditingFor('prefilterSearchBy', false);
        setPrefilterSearchBySearch('');
      },
      'prefilterSearchBy',
    );
  };
  const handlePrefilterSearchByComboChange = (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    _index?: number,
    value?: string,
  ): void => {
    if (consumeComboIgnoreNextChange('prefilterSearchBy', option)) return;
    if (shouldIgnoreComboChange('prefilterSearchBy', option)) return;
    const searchValue = typeof value === 'string' ? value : prefilterSearchBySearch;
    const resolvedOptions = resolvePrefilterSearchByOptions(searchValue);
    const resolvedKey = option?.key ?? resolveComboKeyFromSearch(resolvedOptions, searchValue, prefilters.searchBy);
    if (!resolvedKey) return;
    setComboCancelNextDismiss('prefilterSearchBy');
    onPrefilterSearchByChange(event, { key: resolvedKey } as IComboBoxOption);
    setComboEditingFor('prefilterSearchBy', false);
    setPrefilterSearchBySearch('');
  };
  const handlePrefilterSearchByComboKeyDownCapture = (event: React.KeyboardEvent<IComboBox>): void => {
    if (event.key === 'Escape') {
      setComboCancelNextDismiss('prefilterSearchBy');
      return;
    }
    const isEnter = event.key === 'Enter' || event.key === 'NumpadEnter';
    if (!isEnter) return;
    const inputValue = getComboInputValue(event) || prefilterSearchBySearch;
    if (!inputValue.trim()) return;
    commitPrefilterSearchBySingleSelect(event, inputValue);
  };
  const handlePrefilterSearchByComboInputValueChange = (value: string): void => {
    const next = normalizeSingleSelectSearchText(
      value,
      prefilterSearchByOptions as IComboBoxOption[],
    );
    if (!next) {
      setComboEditingFor('prefilterSearchBy', false);
      setPrefilterSearchBySearch('');
      return;
    }
    setComboEditingFor('prefilterSearchBy', true);
    setPrefilterSearchBySearch(next);
  };
  const handlePrefilterSearchByComboKeyDown = (event: React.KeyboardEvent<IComboBox>): void => {
    if (event.defaultPrevented) return;
    const inputValue = getComboInputValue(event) || prefilterSearchBySearch;
    if (!inputValue.trim()) return;
    commitPrefilterSearchBySingleSelect(event, inputValue);
  };
  const handlePrefilterSearchByComboDismissed = (): void => {
    if (!consumeComboCancelNextDismiss('prefilterSearchBy')) {
      commitComboSingleSelectOnDismiss(
        prefilterSearchBySearch,
        prefilterSearchByOptions as IComboBoxOption[],
        prefilters.searchBy,
        (opt) => onPrefilterSearchByChange({} as React.FormEvent<IComboBox>, opt),
      );
    }
    setComboEditingFor('prefilterSearchBy', false);
    setPrefilterSearchBySearch('');
  };

  const managerBillingSelectedKeys = React.useMemo<string[]>(() => {
    const selected = prefilters.billingAuthorities ?? [];
    if (selected.length === 0) return [];
    const withoutAll = selected.filter((v) => v !== BILLING_AUTHORITY_ALL_KEY);
    if (withoutAll.length > 0) {
      return withoutAll;
    }
    return selected.includes(BILLING_AUTHORITY_ALL_KEY) ? [BILLING_AUTHORITY_ALL_KEY] : selected;
  }, [prefilters.billingAuthorities]);

  React.useEffect(() => {
    const selectionKey = managerBillingSelectedKeys.join('|');
    if (lastManagerBillingSelectionRef.current === selectionKey) return;
    lastManagerBillingSelectionRef.current = selectionKey;
    if (managerBillingSearch) {
      setManagerBillingSearch('');
    }
  }, [managerBillingSelectedKeys, managerBillingSearch]);

  React.useEffect(() => {
    const selectionKey = caseworkerSelectedKeys.join('|');
    if (lastCaseworkerSelectionRef.current === selectionKey) return;
    lastCaseworkerSelectionRef.current = selectionKey;
    if (caseworkerSearch) {
      setCaseworkerSearch('');
    }
  }, [caseworkerSelectedKeys, caseworkerSearch]);

  const onPrefilterBillingChange = React.useCallback(
    (_: React.FormEvent<IComboBox>, option?: IComboBoxOption) => {
      if (!option) return;
      setPrefilterResetNotice(undefined);
      const key = String(option.key);
      if (key === '__loading__' || key === '__error__') return;
      if (key === BILLING_AUTHORITY_ALL_KEY) {
        setPrefilters((prev) => ({
          ...prev,
          billingAuthorities: option.selected ? [BILLING_AUTHORITY_ALL_KEY] : [],
        }));
        markPrefilterDirty();
        return;
      }
      setPrefilters((prev) => {
        const current = prev.billingAuthorities.filter((v) => v !== BILLING_AUTHORITY_ALL_KEY);
        const next = option.selected ? [...current, key] : current.filter((v) => v !== key);
        return { ...prev, billingAuthorities: next };
      });
      markPrefilterDirty();
    },
    [markPrefilterDirty],
  );
  const summaryFlagError = lengthErrors.summaryFlag;
  const searchFieldError = lengthErrors.searchField;
  const resetSalesSearchValidationUi = React.useCallback(() => {
    setSalesSearchTouched({});
    setSalesSearchAttempted(false);
  }, []);
  const markSalesSearchFieldTouched = React.useCallback((key: SalesSearchFieldKey) => {
    setSalesSearchTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);

  const updateFilters = React.useCallback(
    (key: keyof GridFilterState, value: GridFilterState[keyof GridFilterState]) => {
      if (key !== 'searchBy') {
        setSearchResetNotice(undefined);
      }
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const onSearchByChange = React.useCallback(
    (_: React.FormEvent<IComboBox>, option?: IComboBoxOption, _index?: number, value?: string) => {
      const resolvedKey = option?.key ?? resolveComboOptionKey(searchByOptions as IComboBoxOption[], value);
      if (!resolvedKey) {
        return;
      }
      const selected = resolvedKey as SearchByOption;
      if (isSalesSearch) {
        onSearchDirty?.();
        resetSalesSearchValidationUi();
        const nextFilters = {
          ...createDefaultGridFilters(),
          searchBy: selected,
        };
        const hasSalesSearchValues =
          !!(filters.saleId ?? '').trim()
          || !!(filters.taskId ?? '').trim()
          || !!(filters.uprn ?? '').trim()
          || !!(filters.address ?? '').trim()
          || !!(filters.buildingNameNumber ?? '').trim()
          || !!(filters.street ?? '').trim()
          || !!(filters.townCity ?? '').trim()
          || !!(filters.postcode ?? '').trim()
          || (filters.billingAuthority?.length ?? 0) > 0
          || !!(filters.bacode ?? '').trim();
        setSearchResetNotice(
          filters.searchBy !== selected && hasSalesSearchValues
            ? SEARCH_BY_RESET_NOTICE
            : undefined,
        );
        setFilters({
          ...nextFilters,
        });
        return;
      }
      setSearchResetNotice(undefined);
      setFilters((prev) => ({
        ...prev,
        searchBy: selected,
      }));
    },
    [filters, isSalesSearch, onSearchDirty, resetSalesSearchValidationUi, searchByOptions],
  );

  type NumericFilterKey = 'salePrice' | 'ratio' | 'outlierRatio';

  const updateNumericFilter = React.useCallback(
    (key: NumericFilterKey, part: 'mode' | 'min' | 'max', value: string) => {
      setFilters((prev) => {
        const current: NumericFilter = prev[key] ?? { mode: '>=' };
        const updated: NumericFilter = { ...current };
        if (part === 'mode') {
          const nextMode: NumericFilterMode = value === '<=' || value === 'between' ? value : '>=';
          updated.mode = nextMode;
        } else {
          const parsed = value === '' ? undefined : Number(value);
          updated[part] = typeof parsed === 'number' && !Number.isNaN(parsed) ? parsed : undefined;
        }
        return { ...prev, [key]: updated };
      });
    },
    [],
  );

  const isNumericFilterKey = (key: SearchByOption): key is NumericFilterKey =>
    key === 'salePrice' || key === 'ratio' || key === 'outlierRatio';

  type DateFilterKey = 'transactionDate' | 'assignedDate' | 'taskCompletedDate' | 'qcAssignedDate' | 'qcCompletedDate';

  const updateDateRange = React.useCallback(
    (key: DateFilterKey, part: 'from' | 'to', value?: Date | null) => {
      setFilters((prev) => {
        const existing = prev[key] ?? {};
        const existingFrom = parseISODate(existing.from);
        const existingTo = parseISODate(existing.to);

        if (part === 'from') {
          const nextFrom = value ?? undefined;
          const nextFromIso = toISODateString(nextFrom);

          // Keep range valid: if start moves after current end, clear end.
          const nextToIso = nextFrom && existingTo && existingTo < nextFrom
            ? undefined
            : existing.to;

          return { ...prev, [key]: { ...existing, from: nextFromIso, to: nextToIso } };
        }

        const nextTo = value ?? undefined;
        if (nextTo && existingFrom && nextTo < existingFrom) {
          // Reject invalid end date (earlier than start).
          return prev;
        }

        return { ...prev, [key]: { ...existing, to: toISODateString(nextTo) } };
      });
    },
    [parseISODate, toISODateString],
  );

  const updateMultiSelect = React.useCallback(
    (key: keyof GridFilterState, option?: IComboBoxOption, limit?: number) => {
      if (!option) return;
      setFilters((prev) => {
        const current = (prev[key] as string[] | undefined) ?? [];
        let next: string[] = [...current];
        const optKey = String(option.key);
        const exists = next.includes(optKey);
        if (option.selected) {
          if (!exists) next.push(optKey);
        } else {
          next = next.filter((v) => v !== optKey);
        }
        if (limit && next.length > limit) next = next.slice(next.length - limit);
        return { ...prev, [key]: next };
      });
    },
    [],
  );

  const updateSingleSelect = React.useCallback(
    (key: keyof GridFilterState, option?: IComboBoxOption) => {
      setFilters((prev) => ({ ...prev, [key]: (option?.key as string) ?? undefined }));
    },
    [],
  );

  const uprnError = React.useMemo(() => {
    if (isSalesSearch) {
      return lengthErrors.uprn;
    }
    if (filters.searchBy !== 'uprn' || !filters.uprn || filters.uprn.length === 0) {
      return undefined;
    }
    if (filters.uprn.length >= 8 && filters.uprn.length <= 10) {
      return undefined;
    }
    return 'UPRN must be 8 to 10 digits';
  }, [filters.searchBy, filters.uprn, isSalesSearch, lengthErrors.uprn]);
  const displaySaleIdError = salesSearchRequiredErrors.saleId ?? saleIdError;
  const displayTaskIdError = salesSearchRequiredErrors.taskId ?? taskIdError;
  const displayUprnError = salesSearchRequiredErrors.uprn ?? uprnError;
  const displayBillingAuthorityError = billingAuthorityOptionsError ?? salesSearchRequiredErrors.billingAuthority ?? billingAuthorityError;
  const displayBillingAuthorityRefError = salesSearchRequiredErrors.bacode ?? billingAuthorityRefError;

  const salesSearchCanSearch = React.useMemo(() => {
    if (!isSalesSearch) return true;
    return canExecuteSalesSearch(filters, normalizeUkPostcode, isValidUkPostcode);
  }, [filters, isSalesSearch, isValidUkPostcode, normalizeUkPostcode]);
  const getFirstInvalidSalesSearchFieldId = React.useCallback((): string | undefined => {
    if (!isSalesSearch) return undefined;

    return getFirstInvalidSalesFieldId(
      filters,
      {
        saleIdError,
        taskIdError,
        uprnError,
        billingAuthorityOptionsError,
        postcodeError,
        streetError,
        townError,
        addressError,
      },
      normalizeUkPostcode,
    );
  }, [addressError, billingAuthorityOptionsError, filters.bacode, filters.billingAuthority, filters.postcode, filters.saleId, filters.searchBy, filters.taskId, filters.uprn, isSalesSearch, normalizeUkPostcode, postcodeError, saleIdError, streetError, taskIdError, townError, uprnError]);
  const handleSalesSearchUnavailableAttempt = React.useCallback(() => {
    if (!isSalesSearch) return;
    setSalesSearchAttempted(true);
    const fieldId = getFirstInvalidSalesSearchFieldId();
    if (!fieldId) return;
    window.setTimeout(() => {
      focusSalesSearchFieldById(fieldId);
    }, 0);
  }, [getFirstInvalidSalesSearchFieldId, isSalesSearch]);

  const salesSearchHasErrors = React.useMemo(() => {
    if (!isSalesSearch) return false;
    return [
      saleIdError,
      taskIdError,
      uprnError,
      addressError,
      postcodeError,
      streetError,
      townError,
      billingAuthorityError,
      billingAuthorityRefError,
    ].some((err) => Boolean(err));
  }, [
    addressError,
    billingAuthorityError,
    billingAuthorityRefError,
    isSalesSearch,
    postcodeError,
    saleIdError,
    streetError,
    taskIdError,
    townError,
    uprnError,
  ]);

  const isSearchDisabled = React.useMemo(
    () => {
      if (isSalesSearch) {
        return salesSearchHasErrors || !salesSearchCanSearch;
      }
      return !!uprnError || !!addressError || !!postcodeError || !!summaryFlagError || !!saleIdError || !!taskIdError || !!searchFieldError;
    },
    [
      addressError,
      isSalesSearch,
      postcodeError,
      saleIdError,
      salesSearchCanSearch,
      salesSearchHasErrors,
      searchFieldError,
      summaryFlagError,
      taskIdError,
      uprnError,
    ],
  );

  const handleSearch = React.useCallback(() => {
    const clearColumnFiltersOnNewSearch = (nextFilters: GridFilterState): boolean => {
      const nextSignature = buildSearchSubmissionSignature(nextFilters);
      const previousSignature = lastSubmittedSearchSignatureRef.current;
      const didSearchChange = previousSignature !== '' && previousSignature !== nextSignature;
      if (didSearchChange && Object.keys(columnFiltersState).length > 0) {
        setColumnFilters(() => {
          const cleared: Record<string, ColumnFilterValue> = {};
          onColumnFiltersChange?.(cleared);
          return cleared;
        });
        setSearchResetNotice(COLUMN_FILTER_RESET_NOTICE);
      } else {
        setSearchResetNotice(undefined);
      }
      lastSubmittedSearchSignatureRef.current = nextSignature;
      return didSearchChange;
    };

    if (isSalesSearch) {
      if (salesSearchHasErrors || !salesSearchCanSearch) {
        return;
      }
      const next = buildSalesSearchSubmission(filters, normalizeUkPostcode);
      clearColumnFiltersOnNewSearch(next);
      setFilters(next);
      setSalesSearchAttempted(false);
      dismissResultMessages();
      onSearch(next);
      return;
    }

    if (uprnError || addressError || postcodeError || summaryFlagError || saleIdError || taskIdError || searchFieldError) {
      return;
    }
    const sanitized = sanitizeFilters(filters);
    if (sanitized.searchBy === 'uprn' && sanitized.uprn && (sanitized.uprn.length < 8 || sanitized.uprn.length > 10)) {
      return;
    }
    clearColumnFiltersOnNewSearch(sanitized);
    setFilters(sanitized);
    dismissResultMessages();
    onSearch(sanitized);
  }, [
    addressError,
    columnFiltersState,
    dismissResultMessages,
    filters,
    isSalesSearch,
    normalizeUkPostcode,
    onColumnFiltersChange,
    onSearch,
    postcodeError,
    saleIdError,
    salesSearchCanSearch,
    salesSearchHasErrors,
    searchFieldError,
    summaryFlagError,
    taskIdError,
    uprnError,
  ]);

  const handleClear = React.useCallback(() => {
    const defaults = isSalesSearch
      ? { ...createDefaultGridFilters(), searchBy: 'address' as SearchByOption }
      : createDefaultGridFilters();
    if (isSalesSearch) {
      resetSalesSearchValidationUi();
    }
    lastSubmittedSearchSignatureRef.current = buildSearchSubmissionSignature(defaults);
    setFilters(defaults);
    setSearchResetNotice(undefined);
    dismissResultMessages();
    onSearch(defaults);
  }, [dismissResultMessages, isSalesSearch, onSearch, resetSalesSearchValidationUi]);

  const showPostcodeHint = React.useMemo(() => {
    if (isSalesSearch) {
      return false;
    }
    if (!filters.postcode || filters.postcode.length === 0) {
      return false;
    }
    return filters.searchBy === 'postcode' || filters.searchBy === 'address';
  }, [filters.postcode, filters.searchBy, isSalesSearch]);

  const handleNavigate = React.useCallback(
    async (
      item?: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord,
      column?: IColumn,
      _forceLoader = false,
    ) => {
      if (!item) return;
      if (viewSaleNavigationLockRef.current) {
        return;
      }
      viewSaleNavigationLockRef.current = true;
      viewSaleRequestSeq.current += 1;
      const requestId = viewSaleRequestSeq.current;
      setViewSaleNavigationPending(true);
      // Canvas owns the navigation loader for sales-record transitions.
      // Keep the PCF responsive but ignore repeat activations until the current
      // navigation attempt settles.
      try {
        await Promise.resolve(onNavigate(item));
      } finally {
        if (viewSaleRequestSeq.current === requestId) {
          viewSaleNavigationLockRef.current = false;
          setViewSaleNavigationPending(false);
          setViewSaleLoading(false);
        }
      }
    },
    [onNavigate],
  );

  const mapDatasetColumnToGridColumn = React.useCallback((c: ComponentFramework.PropertyHelper.DataSetApi.Column): IGridColumn => {
    const lowerName = c.name.toLowerCase();
    const cfg =
      columnConfigs[lowerName]
      || (c.alias ? columnConfigs[c.alias.toLowerCase()] : undefined)
      || {};
    const datasetCellType = (c as { cellType?: string }).cellType;
    const sort = sorting?.find((s) => s.name === c.name);
    const visualSize = typeof c.visualSizeFactor === 'number' && !Number.isNaN(c.visualSizeFactor)
      ? c.visualSizeFactor
      : 100;
    const width = typeof cfg.ColWidth === 'number' ? cfg.ColWidth : visualSize;
    const resolvedCellType = (cfg.ColCellType ?? datasetCellType)?.toLowerCase();
    const effectiveCellType = cfg.ColCellType ?? datasetCellType;
    const classMeta = getColumnClassMetadata(lowerName);
    const baseColumnName = cfg.ColDisplayName ?? c.displayName;
    const newTabCue = SCREEN_TEXT.common.links.opensInNewTab;
    const hasNewTabCue = String(baseColumnName ?? '').toLowerCase().includes(String(newTabCue).toLowerCase());
    const resolvedColumnName = lowerName === 'address' && !hasNewTabCue
      ? `${String(baseColumnName ?? '')} ${newTabCue}`.trim()
      : baseColumnName;

    const col: IGridColumn = {
      key: c.name,
      name: resolvedColumnName,
      headerTooltip: cfg.ColHeaderTooltip,
      fieldName: c.name,
      className: classMeta.className,
      headerClassName: classMeta.headerClassName,
      minWidth: width,
      maxWidth: cfg.ColWidth,
      isResizable: cfg.ColResizable ?? true,
      isSorted: !!sort,
      isSortedDescending: sort ? Number(sort.sortDirection) === 1 : undefined,
      isBold: cfg.ColIsBold,
      cellType: effectiveCellType,
      tagColor: cfg.ColTagColor ?? cfg.ColTagColorColumn,
      tagBorderColor: cfg.ColTagBorderColor ?? cfg.ColTagBorderColorColumn,
      isMultiline: cfg.ColMultiLine,
      horizontalAligned: cfg.ColHorizontalAlign,
      verticalAligned: cfg.ColVerticalAlign,
      headerPaddingLeft: cfg.ColHeaderPaddingLeft,
      showAsSubTextOf: cfg.ColShowAsSubTextOf,
      paddingTop: cfg.ColPaddingTop,
      paddingLeft: cfg.ColPaddingLeft,
      isLabelAbove: cfg.ColLabelAbove,
      multiValuesDelimiter: cfg.ColMultiValueDelimiter,
      firstMultiValueBold: cfg.ColFirstMultiValueBold,
      inlineLabel: cfg.ColInlineLabel,
      hideWhenBlank: cfg.ColHideWhenBlank,
      subTextRow: cfg.ColSubTextRow,
      ariaTextColumn: cfg.ColAriaTextColumn,
      cellActionDisabledColumn: cfg.ColCellActionDisabledColumn,
      imageWidth: cfg.ColImageWidth ? String(cfg.ColImageWidth) : undefined,
      imagePadding: cfg.ColImagePadding,
      sortable: cfg.ColSortable !== false,
      columnActionsMode: cfg.ColSortable !== false ? ColumnActionsMode.hasDropdown : ColumnActionsMode.disabled,
      sortBy: cfg.ColSortBy,
      format: cfg.ColFormat,
      childColumns: [],
    };

    const configuredHorizontalAlign = (cfg.ColHorizontalAlign ?? '').trim().toLowerCase();
    const hasConfiguredAlignment = ['left', 'center', 'right'].includes(configuredHorizontalAlign) || !!cfg.ColVerticalAlign;
    const shouldUseGridCellRenderer = [
      'tag',
      'indicatortag',
      'link',
      'image',
      'clickableimage',
      'expand',
    ].includes(resolvedCellType ?? '') || hasConfiguredAlignment || !!cfg.ColFormat;

    if (shouldUseGridCellRenderer) {
      col.onRender = (
        item: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord,
        _?: number,
        column?: IColumn,
      ) => <GridCell item={item} column={column} onCellAction={(i, col) => navigateSafely(i, col)} />;
    }

    return col;
  }, [columnConfigs, handleNavigate, sorting]);

  React.useEffect(() => {
    setColumns(datasetColumns.map(mapDatasetColumnToGridColumn));
  }, [datasetColumns, mapDatasetColumnToGridColumn]);

  const handleColumnReorder = React.useCallback((draggedIndex: number, targetIndex: number) => {
    setColumns((prev) => {
      const newCols = [...prev];
      const [moved] = newCols.splice(draggedIndex, 1);
      newCols.splice(targetIndex, 0, moved);
      return newCols;
    });
  }, []);

  const columnReorderOptions = React.useMemo<IColumnReorderOptions>(
    () => ({
      handleColumnReorder,
    }),
    [handleColumnReorder],
  );

  const items = React.useMemo<DataSet[]>(() => {
    const mapped = sortedRecordIds.map((id) => {
      const record = records[id];
      (record as DataSet).key = getRecordKey(record);
      return record as DataSet;
    });
    return mapped;
  }, [records, sortedRecordIds]);
  const pageItemCount = items.length;

  const applySelectionChange = React.useCallback((action: () => void) => {
    selection.setChangeEvents(false);
    action();
    selection.setChangeEvents(true);
  }, [selection]);

  const clearPageSelection = React.useCallback(() => {
    applySelectionChange(() => {
      selection.setItems(items, true);
    });
    setSelectFirstError(undefined);
  }, [applySelectionChange, items]);

  const selectFirstOnPage = React.useCallback(() => {
    if (pageItemCount === 0) return;
    const raw = selectFirstInput.trim();
    const parsed = Number(raw);
    const max = pageItemCount;
    if (!raw || Number.isNaN(parsed) || !Number.isFinite(parsed) || parsed <= 0) {
      const template = commonText.selectionControls.selectFirstErrorText;
      setSelectFirstError(formatTemplate(template, { max }));
      return;
    }
    const clamped = Math.min(Math.floor(parsed), max);
    if (clamped !== parsed) {
      setSelectFirstInput(String(clamped));
    }
    setSelectFirstError(undefined);
    applySelectionChange(() => {
      selection.setItems(items, true);
      for (let i = 0; i < clamped; i += 1) {
        selection.setIndexSelected(i, true, false);
      }
    });
  }, [applySelectionChange, commonText.selectionControls.selectFirstErrorText, items, pageItemCount, selectFirstInput, selection]);

  const lastPageRef = React.useRef(currentPage);
  React.useEffect(() => {
    if (lastPageRef.current !== currentPage) {
      lastPageRef.current = currentPage;
      applySelectionChange(() => {
        selection.setItems(items, true);
      });
      setSelectFirstError(undefined);
    }
  }, [applySelectionChange, currentPage, items, selection]);

  const getFilterableText = React.useCallback((raw: unknown): string => {
    if (Array.isArray(raw)) {
      return raw
        .map((v) => (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? String(v) : ''))
        .filter((s) => s !== '')
        .join(', ');
    }
    if (typeof raw === 'string') {
      return raw;
    }
    if (typeof raw === 'number' || typeof raw === 'boolean') {
      return raw.toString();
    }
    return '';
  }, []);

  // Identify columns that should use a value dropdown (lookup/choice-like fields)
  const isLookupField = React.useCallback((field: string | undefined): boolean => {
    return isLookupFieldFor(tableKey, field);
  }, [tableKey]);

  const isTextOnlyField = React.useCallback((field: string | undefined): boolean => {
    if (!field) return false;
    const f = field.replace(/[^a-z0-9]/gi, '').toLowerCase();
    return (
      f === 'saleid' ||
      f === 'taskid' ||
      f === 'uprn' ||
      f === 'address' ||
      f === 'transactiondate' ||
      f === 'saleprice' ||
      f === 'marketvalue' ||
      f === 'ratio'
    );
  }, [isLookupField]);

  // Derive icons each render to reflect current sort/filter state
  const columnsWithIcons = React.useMemo<IGridColumn[]>(() => {
    return columns.map((c) => {
      const field = c.fieldName ?? c.key;
      const activeFilter = columnFiltersState[(field ?? '').toString()] !== undefined;
      const sort = sorting?.find((s) => s.name === field);
      const columnName = c.name ?? String(field ?? '');
      const sortState = sort ? (Number(sort.sortDirection) === 1 ? 'sorted descending' : 'sorted ascending') : 'not sorted';
      const filterState = activeFilter ? 'filtered' : 'not filtered';
      const hasActiveColumnState = sort !== undefined || activeFilter;
      const headerClassName = joinClassNames(
        c.headerClassName,
        hasActiveColumnState && 'voa-col-header--active',
        sort && 'voa-col-header--sorted',
        activeFilter && 'voa-col-header--filtered',
      );
      return {
        ...c,
        headerClassName,
        isFiltered: activeFilter,
        isSorted: !!sort,
        isSortedDescending: sort ? Number(sort.sortDirection) === 1 : undefined,
        ariaLabel: `${columnName} column, ${sortState}, ${filterState}`,
        ariaLabelItemName: columnName,
      } as IGridColumn;
    });
  }, [columns, columnFiltersState, sorting]);

  const onRenderDetailsHeader = React.useCallback(
    (
      headerProps?: IDetailsHeaderProps,
      defaultRender?: (props?: IDetailsHeaderProps) => JSX.Element | null,
    ): JSX.Element | null => {
      if (!headerProps || !defaultRender) {
        return null;
      }
      const renderColumnHeaderTooltip = (tooltipProps?: IDetailsColumnRenderTooltipProps): JSX.Element | null => (
        <ColumnHeaderTooltip tooltipProps={tooltipProps} />
      );
      return defaultRender({
        ...headerProps,
        onRenderColumnHeaderTooltip: renderColumnHeaderTooltip,
      });
    },
    [],
  );

  const filteredItems = React.useMemo(() => {
    if (disableClientFiltering) {
      return items;
    }
    return filterItemsByColumnFilters(
      items,
      columnFiltersState,
      tableKey,
      getFilterableText,
      (item, field) => (item as unknown as Record<string, unknown>)[field],
    );
  }, [columnFiltersState, disableClientFiltering, getFilterableText, items, tableKey]);

  React.useEffect(() => {
    if (!showResults) {
      setHorizontalOverflowState((prev) => (
        prev.hasOverflow || prev.canScrollLeft || prev.canScrollRight
          ? { hasOverflow: false, canScrollLeft: false, canScrollRight: false }
          : prev
      ));
      return;
    }
    const element = resultsRef.current;
    if (!element) return;
    const handleScroll = () => updateHorizontalOverflowState();
    handleScroll();
    element.addEventListener('scroll', handleScroll, { passive: true });
    let observer: ResizeObserver | undefined;
    const content = element.querySelector('.voa-grid-list');
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => handleScroll());
      observer.observe(element);
      if (content instanceof HTMLElement) {
        observer.observe(content);
      }
    } else {
      window.addEventListener('resize', handleScroll);
    }
    return () => {
      element.removeEventListener('scroll', handleScroll);
      observer?.disconnect();
      if (!observer) {
        window.removeEventListener('resize', handleScroll);
      }
    };
  }, [
    columnsWithIcons.length,
    currentPage,
    filteredItems.length,
    itemsLoading,
    shimmer,
    showResults,
    updateHorizontalOverflowState,
  ]);

  const resultTotal = React.useMemo(
    () => (typeof taskCount === 'number' ? taskCount : filteredItems.length),
    [filteredItems.length, taskCount],
  );

  const selectionSummaryText = React.useMemo(() => {
    const template = commonText.selectionControls.selectionSummaryText;
    return formatTemplate(template, {
      selected: selectedCount,
      pageTotal: pageItemCount,
      resultTotal,
    });
  }, [commonText.selectionControls.selectionSummaryText, pageItemCount, resultTotal, selectedCount]);

  const resultsSummaryText = React.useMemo(() => {
    if (resultTotal === 0 || pageItemCount === 0) {
      return commonText.selectionControls.resultsSummaryEmptyText;
    }
    const effectivePageSize = Math.max(pageSize ?? pageItemCount, pageItemCount);
    const from = currentPage * effectivePageSize + 1;
    const to = Math.min(from + pageItemCount - 1, resultTotal);
    return formatTemplate(commonText.selectionControls.resultsSummaryText, {
      from,
      to,
      total: resultTotal,
    });
  }, [
    commonText.selectionControls.resultsSummaryEmptyText,
    commonText.selectionControls.resultsSummaryText,
    currentPage,
    pageItemCount,
    pageSize,
    resultTotal,
  ]);

  const clearAllColumnFilters = React.useCallback(() => {
    setColumnFilters(() => {
      const cleared: Record<string, ColumnFilterValue> = {};
      onColumnFiltersChange?.(cleared);
      return cleared;
    });
  }, [onColumnFiltersChange]);
  const handleClearAllColumnFiltersClick = React.useCallback(() => {
    clearAllColumnFilters();
  }, [clearAllColumnFilters]);
  const handleDismissColumnConfigMessage = React.useCallback(() => {
    setDismissedColumnConfigMessage(true);
  }, []);
  const handleDismissErrorMessage = React.useCallback(() => {
    setDismissedErrorMessage(true);
  }, []);
  const shouldVirtualizeResults = React.useCallback(() => true, []);
  const handleDismissColumnFilterMenu = React.useCallback(() => {
    setMenuState(undefined);
  }, []);
  const handleDismissAssignUsersInfo = React.useCallback(() => {
    setDismissedAssignUsersInfo(true);
  }, []);
  const handleDismissAssignUsersError = React.useCallback(() => {
    setDismissedAssignUsersError(true);
  }, []);
  const handleDismissCreateTaskInfo = React.useCallback(() => {
    setDismissedCreateTaskInfo(true);
  }, []);

  const getDistinctOptions = React.useCallback(
    (candidates: string[]): IDropdownOption[] => {
      const t0 = performance.now();
      const set = new Set<string>();
      Object.values(records).forEach((it) => {
        const rec = it as unknown as Record<string, unknown>;
        for (const c of candidates) {
          const raw = rec[c];
          if (Array.isArray(raw)) {
            raw.forEach((v) => {
              const s = typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? String(v).trim() : '';
              if (s) set.add(s);
            });
            if (raw.length > 0) break;
          } else {
            const v = getFilterableText(raw);
            if (v) {
              set.add(v.trim());
              break;
            }
          }
        }
      });
      const arr = Array.from(set)
        .filter((v) => v !== '')
        .sort((a, b) => a.localeCompare(b))
        .map((v) => ({ key: v, text: v }));
      const t1 = performance.now();
      console.log('[Grid Perf] Distinct options (ms):', Math.round(t1 - t0), 'candidates:', candidates.join(','), 'records:', Object.keys(records).length, 'options:', arr.length);
      return arr;
    },
    [getFilterableText, records],
  );

  const buildDropdownOptions = React.useCallback(
    (cfg: SearchFieldConfig): IComboBoxOption[] => {
      const deduped: IComboBoxOption[] = [];
      const seen = new Set<string>();
      const push = (opt?: IComboBoxOption) => {
        if (!opt) return;
        const key = String(opt.key);
        if (seen.has(key)) return;
        seen.add(key);
        deduped.push(opt);
      };
      (cfg.options ?? []).forEach(push);
      if (cfg.optionFields) {
        getDistinctOptions(cfg.optionFields).forEach(push);
      }
      let combined = deduped;
      const hasAllOrOther = hasAllOrOtherOption(combined);
      if (cfg.selectAll && !hasAllOrOther) {
        combined = [{ key: SELECT_ALL_KEY, text: commonText.selectionControls.selectAllText }, ...combined];
      }
      return combined;
    },
    [commonText.selectionControls.selectAllText, getDistinctOptions],
  );

  const renderComboHint = (hint?: string, hintId?: string): React.ReactNode => {
    if (!hint) {
      return null;
    }
    return (
      <Text id={hintId} variant="small" styles={{ root: { marginTop: 4 } }}>
        {hint}
      </Text>
    );
  };

  const renderSalesBillingAuthoritySearch = (): React.ReactNode => {
    const authority = filters.billingAuthority?.[0] ?? '';
    const billingAuthorityHint = comboEditing.salesBillingAuthority
      ? getComboDisambiguationHint(filteredBillingAuthorityOptionsList, billingAuthoritySearch)
      : undefined;
    const billingAuthorityHintId = 'voa-sales-billingauthority-hint';
    const billingAuthorityControlKey = 'salesBillingAuthority';
    const applyBillingAuthoritySelection = (resolvedKey: unknown, closeEditor = true): void => {
      if (
        resolvedKey === null
        || resolvedKey === undefined
        || resolvedKey === ''
        || resolvedKey === '__loading__'
        || resolvedKey === '__error__'
      ) {
        return;
      }
      if (typeof resolvedKey !== 'string' && typeof resolvedKey !== 'number' && typeof resolvedKey !== 'boolean') {
        return;
      }
      const next = String(resolvedKey);
      updateFilters('billingAuthority', next ? [next] : undefined);
      if (closeEditor) {
        setComboEditingFor(billingAuthorityControlKey, false);
        setBillingAuthoritySearch('');
      }
    };
    const commitBillingAuthoritySelection = (
      opt: IComboBoxOption | undefined,
      searchValue: string,
      selectedKey: string,
      shouldSetDismissFlag = false,
    ): void => {
      const resolvedOptions = filterComboOptions(billingAuthorityOptionsList, searchValue);
      const resolvedKey = opt?.key ?? resolveComboKeyFromSearch(resolvedOptions, searchValue, selectedKey);
      if (!resolvedKey || resolvedKey === '__loading__' || resolvedKey === '__error__') {
        return;
      }
      if (shouldSetDismissFlag) {
        setComboCancelNextDismiss(billingAuthorityControlKey);
      }
      applyBillingAuthoritySelection(resolvedKey);
    };
    const handleBillingAuthorityOptionSelect = (opt?: IComboBoxOption): void => {
      const optionKey = opt?.key;
      applyBillingAuthoritySelection(optionKey);
    };
    const handleBillingAuthorityDismissSelect = (opt?: IComboBoxOption): void => {
      const optionKey = opt?.key;
      applyBillingAuthoritySelection(optionKey, false);
    };
    const handleBillingAuthorityComboChange = (
      _event: React.FormEvent<IComboBox>,
      opt?: IComboBoxOption,
      _index?: number,
      value?: string,
    ): void => {
      if (consumeComboIgnoreNextChange(billingAuthorityControlKey, opt)) return;
      if (shouldIgnoreComboChange(billingAuthorityControlKey, opt)) return;
      const searchValue = typeof value === 'string' ? value : billingAuthoritySearch;
      commitBillingAuthoritySelection(opt, searchValue, authority, true);
    };
    const handleBillingAuthorityComboKeyDownCapture = (event: React.KeyboardEvent<IComboBox>): void => {
      if (event.key === 'Escape') {
        setComboCancelNextDismiss(billingAuthorityControlKey);
        return;
      }
      const isEnter = event.key === 'Enter' || event.key === 'NumpadEnter';
      if (!isEnter) return;
      const inputValue = getComboInputValue(event) || billingAuthoritySearch;
      if (!inputValue.trim()) return;
      const resolvedOptions = filterComboOptions(billingAuthorityOptionsList, inputValue);
      commitComboSingleSelect(
        event,
        inputValue,
        resolvedOptions,
        authority,
        handleBillingAuthorityOptionSelect,
        billingAuthorityControlKey,
      );
    };
    const handleBillingAuthorityComboInputValueChange = (value: string): void => {
      const next = normalizeSingleSelectSearchText(value, billingAuthorityOptionsList);
      if (!next) {
        setComboEditingFor(billingAuthorityControlKey, false);
        setBillingAuthoritySearch('');
        return;
      }
      setComboEditingFor(billingAuthorityControlKey, true);
      setBillingAuthoritySearch(next);
    };
    const handleBillingAuthorityComboKeyDown = (event: React.KeyboardEvent<IComboBox>): void => {
      if (event.defaultPrevented) return;
      const inputValue = getComboInputValue(event) || billingAuthoritySearch;
      if (!inputValue.trim()) return;
      const resolvedOptions = filterComboOptions(billingAuthorityOptionsList, inputValue);
      commitComboSingleSelect(
        event,
        inputValue,
        resolvedOptions,
        authority,
        handleBillingAuthorityOptionSelect,
        billingAuthorityControlKey,
      );
    };
    const handleBillingAuthorityComboDismissed = (): void => {
      if (!consumeComboCancelNextDismiss(billingAuthorityControlKey)) {
        commitComboSingleSelectOnDismiss(
          billingAuthoritySearch,
          billingAuthorityOptionsList,
          authority,
          handleBillingAuthorityDismissSelect,
        );
      }
      setComboEditingFor(billingAuthorityControlKey, false);
      setBillingAuthoritySearch('');
    };
    const handleBillingAuthorityBlur = (): void => {
      markSalesSearchFieldTouched('billingAuthority');
    };
    const billingAuthorityTitle = buildSelectedTooltip(
      authority ? [authority] : [],
      billingAuthorityOptionsList,
      salesSearchText.tooltips?.billingAuthority,
    );
    const billingAuthorityRefTitle = buildValueTooltip(filters.bacode, salesSearchText.tooltips?.billingAuthorityReference);
    const renderBillingAuthorityRequiredLabel = (): JSX.Element => renderSalesSearchLabel(salesSearchText.fields.billingAuthority, true);
    const renderBillingAuthorityReferenceRequiredLabel = (): JSX.Element => renderSalesSearchLabel(salesSearchText.fields.billingAuthorityReference, true);
    const handleBillingAuthorityReferenceChange = (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string): void => {
      updateFilters('bacode', (value ?? '').slice(0, ADDRESS_FIELD_MAX_LENGTH));
    };
    const handleBillingAuthorityReferenceBlur = (): void => {
      markSalesSearchFieldTouched('bacode');
    };
    return (
      <SalesBillingAuthoritySearchControl
        salesSearchText={salesSearchText}
        billingAuthorityHint={billingAuthorityHint}
        billingAuthorityHintId={billingAuthorityHintId}
        billingAuthorityTitle={billingAuthorityTitle}
        billingAuthorityRefTitle={billingAuthorityRefTitle}
        filteredBillingAuthorityOptionsList={filteredBillingAuthorityOptionsList}
        comboEditingSalesBillingAuthority={comboEditing.salesBillingAuthority}
        authority={authority}
        billingAuthoritySearch={billingAuthoritySearch}
        bacodeValue={filters.bacode ?? ''}
        displayBillingAuthorityError={displayBillingAuthorityError}
        displayBillingAuthorityRefError={displayBillingAuthorityRefError}
        addressFieldMaxLength={ADDRESS_FIELD_MAX_LENGTH}
        onRenderBillingAuthorityRequiredLabel={renderBillingAuthorityRequiredLabel}
        onRenderBillingAuthorityReferenceRequiredLabel={renderBillingAuthorityReferenceRequiredLabel}
        onBillingAuthorityComboChange={handleBillingAuthorityComboChange}
        onBillingAuthorityComboKeyDownCapture={handleBillingAuthorityComboKeyDownCapture}
        onBillingAuthorityComboInputValueChange={handleBillingAuthorityComboInputValueChange}
        onBillingAuthorityComboKeyDown={handleBillingAuthorityComboKeyDown}
        onBillingAuthorityComboDismissed={handleBillingAuthorityComboDismissed}
        onBillingAuthorityBlur={handleBillingAuthorityBlur}
        onBillingAuthorityReferenceChange={handleBillingAuthorityReferenceChange}
        onBillingAuthorityReferenceBlur={handleBillingAuthorityReferenceBlur}
        hintNode={renderComboHint(billingAuthorityHint, billingAuthorityHintId)}
      />
    );
  };

  const renderSearchControl = React.useCallback(() => {
    const cfg = SEARCH_FIELD_CONFIGS[filters.searchBy];
    if (!cfg) return null;

    const renderSalesAddressSearch = (): React.ReactNode => {
      const buildingTitle = buildValueTooltip(filters.buildingNameNumber, salesSearchText.tooltips?.buildingNameNumber);
      const streetTitle = buildValueTooltip(filters.street, salesSearchText.tooltips?.street);
      const townTitle = buildValueTooltip(filters.townCity, salesSearchText.tooltips?.townCity);
      const postcodeTitle = buildValueTooltip(filters.postcode, salesSearchText.tooltips?.postcode);
      const handleSalesBuildingNameChange = (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string): void => {
        updateFilters('buildingNameNumber', (value ?? '').slice(0, ADDRESS_FIELD_MAX_LENGTH));
      };
      const handleSalesStreetChange = (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string): void => {
        updateFilters('street', (value ?? '').slice(0, ADDRESS_FIELD_MAX_LENGTH));
      };
      const handleSalesTownCityChange = (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string): void => {
        updateFilters('townCity', (value ?? '').slice(0, ADDRESS_FIELD_MAX_LENGTH));
      };
      const handleSalesPostcodeChange = (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string): void => {
        updateFilters('postcode', (value ?? '').toUpperCase().slice(0, 12));
      };
      return (
        <SalesAddressSearchControl
          salesSearchText={salesSearchText}
          buildingTitle={buildingTitle}
          streetTitle={streetTitle}
          townTitle={townTitle}
          postcodeTitle={postcodeTitle}
          buildingValue={filters.buildingNameNumber ?? ''}
          streetValue={filters.street ?? ''}
          townValue={filters.townCity ?? ''}
          postcodeValue={filters.postcode ?? ''}
          addressError={addressError}
          streetError={streetError}
          townError={townError}
          postcodeError={postcodeError}
          addressFieldMaxLength={ADDRESS_FIELD_MAX_LENGTH}
          onBuildingNameChange={handleSalesBuildingNameChange}
          onStreetChange={handleSalesStreetChange}
          onTownCityChange={handleSalesTownCityChange}
          onPostcodeChange={handleSalesPostcodeChange}
        />
      );
    };

    const renderSalesSaleIdSearch = (): React.ReactNode => {
      const saleIdTitle = buildValueTooltip(filters.saleId, salesSearchText.tooltips?.saleId);
      const renderSaleIdRequiredLabel = (): JSX.Element => renderSalesSearchLabel(salesSearchText.fields.saleId, true);
      const handleSaleIdChange = (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string): void => {
        updateFilters('saleId', sanitizeAlphaNumHyphen(value, ID_FIELD_MAX_LENGTH));
      };
      const handleSaleIdBlur = (): void => {
        markSalesSearchFieldTouched('saleId');
      };
      return (
        <SalesIdentifierSearchControl
          id="sales-saleid"
          label={salesSearchText.fields.saleId}
          placeholder={salesSearchText.placeholders.saleId}
          title={saleIdTitle}
          value={filters.saleId ?? ''}
          errorMessage={displaySaleIdError}
          maxLength={ID_FIELD_MAX_LENGTH}
          onRenderRequiredLabel={renderSaleIdRequiredLabel}
          onChange={handleSaleIdChange}
          onBlur={handleSaleIdBlur}
        />
      );
    };

    const renderSalesTaskIdSearch = (): React.ReactNode => {
      const taskIdTitle = buildValueTooltip(filters.taskId, salesSearchText.tooltips?.taskId);
      const renderTaskIdRequiredLabel = (): JSX.Element => renderSalesSearchLabel(salesSearchText.fields.taskId, true);
      const handleTaskIdChange = (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string): void => {
        updateFilters('taskId', sanitizeTaskIdInput(value, ID_FIELD_MAX_LENGTH));
      };
      const handleTaskIdBlur = (): void => {
        markSalesSearchFieldTouched('taskId');
      };
      return (
        <SalesIdentifierSearchControl
          id="sales-taskid"
          label={salesSearchText.fields.taskId}
          placeholder={salesSearchText.placeholders.taskId}
          title={taskIdTitle}
          value={filters.taskId ?? ''}
          errorMessage={displayTaskIdError}
          maxLength={ID_FIELD_MAX_LENGTH}
          onRenderRequiredLabel={renderTaskIdRequiredLabel}
          onChange={handleTaskIdChange}
          onBlur={handleTaskIdBlur}
        />
      );
    };

    const renderSalesUprnSearch = (): React.ReactNode => {
      const uprnTitle = buildValueTooltip(filters.uprn, salesSearchText.tooltips?.uprn);
      const renderUprnRequiredLabel = (): JSX.Element => renderSalesSearchLabel(salesSearchText.fields.uprn, true);
      const handleUprnChange = (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string): void => {
        updateFilters('uprn', sanitizeDigits(value, UPRN_MAX_LENGTH));
      };
      const handleUprnBlur = (): void => {
        markSalesSearchFieldTouched('uprn');
      };
      return (
        <Stack.Item styles={{ root: { minWidth: 260 } }}>
          <>
            <TextField
              id="sales-uprn"
              label={salesSearchText.fields.uprn}
              ariaLabel={formatRequiredAriaLabel(salesSearchText.fields.uprn, true)}
              placeholder={salesSearchText.placeholders.uprn}
              title={uprnTitle}
              onRenderLabel={renderUprnRequiredLabel}
              value={filters.uprn ?? ''}
              onChange={handleUprnChange}
              onBlur={handleUprnBlur}
              errorMessage={displayUprnError}
              inputMode="numeric"
              maxLength={UPRN_MAX_LENGTH}
              aria-describedby={buildAriaDescribedBy('voa-sales-uprn-hint')}
            />
            <Text id="voa-sales-uprn-hint" variant="small" className="voa-search-field-hint">
              {salesSearchText.hints.uprnInput}
            </Text>
          </>
        </Stack.Item>
      );
    };

    const renderSalesSearchControl = (): React.ReactNode => {
      if (filters.searchBy === 'address') {
        return renderSalesAddressSearch();
      }
      if (filters.searchBy === 'billingAuthority') {
        return renderSalesBillingAuthoritySearch();
      }
      if (filters.searchBy === 'saleId') {
        return renderSalesSaleIdSearch();
      }
      if (filters.searchBy === 'taskId') {
        return renderSalesTaskIdSearch();
      }
      if (filters.searchBy === 'uprn') {
        return renderSalesUprnSearch();
      }
      return null;
    };

    if (isSalesSearch) {
      return renderSalesSearchControl();
    }

    const textError =
      cfg.key === 'address'
        ? addressError
        : cfg.key === 'postcode'
        ? postcodeError
        : cfg.key === 'summaryFlag'
        ? summaryFlagError
        : cfg.key === 'saleId'
        ? saleIdError
        : cfg.key === 'taskId'
        ? taskIdError
        : cfg.key === 'uprn'
        ? uprnError
        : filters.searchBy === cfg.key
        ? searchFieldError
        : undefined;

    const renderGenericTextSearch = (): React.ReactNode => {
      const val = getFilterField(filters, cfg.stateKey);
      const value = typeof val === 'string' ? val : '';
      const hintText = cfg.tooltip ?? cfg.placeholder ?? cfg.label;
      const tooltip = buildValueTooltip(value, hintText);
      const handleTextFilterChange = (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, inputValue?: string): void => {
        const next = cfg.transform ? cfg.transform(inputValue) : inputValue ?? '';
        updateFilters(cfg.stateKey, next);
        if (cfg.key === 'taskId' || cfg.key === 'postcode') {
          scheduleSearch();
        }
      };
      return (
        <GenericTextSearchControl
          label={cfg.label}
          placeholder={cfg.placeholder}
          title={tooltip}
          value={value}
          onChange={handleTextFilterChange}
          errorMessage={textError}
          inputMode={cfg.inputMode}
          controlType={cfg.control as 'text' | 'textContains' | 'textPrefix'}
          showPostcodeHint={cfg.key === 'postcode' && showPostcodeHint}
          postcodeHintText={commonText.hints.postcodePartial}
        />
      );
    };

    const renderGenericNumericSearch = (): React.ReactNode => {
      const numericKey = cfg.stateKey as NumericFilterKey;
      const numericFilter = filters[numericKey] ?? { mode: '>=' };
      const mode = numericFilter.mode ?? '>=';
      const minValue = mode === '<=' ? numericFilter.max : numericFilter.min;
      const maxValue = numericFilter.max;
      const numericModeOptions: IComboBoxOption[] = [
        { key: '>=', text: commonText.filters.numericModes.gte },
        { key: '<=', text: commonText.filters.numericModes.lte },
        { key: 'between', text: commonText.filters.numericModes.between },
      ];
      const modeTitle = buildSelectedTooltip([mode], numericModeOptions, commonText.labels.options);
      const minLabel = mode === '<=' ? commonText.labels.max : commonText.labels.min;
      const minTitle = buildValueTooltip(minValue === undefined ? '' : String(minValue), minLabel);
      const maxTitle = buildValueTooltip(maxValue === undefined ? '' : String(maxValue), commonText.labels.max);
      const handleNumericModeChange = (_event: React.FormEvent<IComboBox>, option?: IComboBoxOption): void => {
        updateNumericFilter(numericKey, 'mode', typeof option?.key === 'string' ? option.key : mode);
      };
      const handleNumericPrimaryValueChange = (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string): void => {
        updateNumericFilter(numericKey, mode === '<=' ? 'max' : 'min', value ?? '');
      };
      const handleNumericMaxValueChange = (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string): void => {
        updateNumericFilter(numericKey, 'max', value ?? '');
      };
      return (
        <GenericNumericSearchControl
          optionsLabel={commonText.labels.options}
          options={numericModeOptions}
          modeTitle={modeTitle}
          selectedMode={mode}
          minLabel={minLabel}
          minTitle={minTitle}
          minValue={String(minValue ?? '')}
          maxLabel={commonText.labels.max}
          maxTitle={maxTitle}
          maxValue={String(maxValue ?? '')}
          showMaxInput={mode === 'between'}
          onModeChange={handleNumericModeChange}
          onMinChange={handleNumericPrimaryValueChange}
          onMaxChange={handleNumericMaxValueChange}
        />
      );
    };

    const renderGenericDateRangeSearch = (): React.ReactNode => {
      const dateVal = getFilterField<{ from?: string; to?: string }>(filters, cfg.stateKey);
      const from = parseISODate(dateVal?.from);
      const to = parseISODate(dateVal?.to);
      const isDateRangeInvalidOrder = Boolean(from && to && to < from);
      const fromTitle = buildValueTooltip(from ? formatDisplayDate(from) : '', `${cfg.label} start`);
      const toTitle = buildValueTooltip(to ? formatDisplayDate(to) : '', `${cfg.label} end`);
      const handleDateRangeFromSelect = (date: Date | null | undefined): void => {
        updateDateRange(cfg.stateKey as DateFilterKey, 'from', date);
      };
      const handleDateRangeToSelect = (date: Date | null | undefined): void => {
        updateDateRange(cfg.stateKey as DateFilterKey, 'to', date);
      };
      return (
        <GenericDateRangeSearchControl
          startLabel={`${cfg.label} start`}
          endLabel={`${cfg.label} end`}
          from={from}
          to={to}
          fromTitle={fromTitle}
          toTitle={toTitle}
          dateStrings={dateStrings}
          formatDate={formatDisplayDate}
          parseDateFromString={(dateStr) => parseDateInput(dateStr)}
          invalidOrder={isDateRangeInvalidOrder}
          invalidOrderMessage="End date must be on or after start date."
          onFromSelect={handleDateRangeFromSelect}
          onToSelect={handleDateRangeToSelect}
        />
      );
    };

    const renderGenericSingleSelectSearch = (): React.ReactNode => {
      const options = buildDropdownOptions(cfg);
      const selectedKey = getFilterField<string>(filters, cfg.stateKey);
      const searchText = comboSearchText[cfg.key] ?? '';
      const isEditing = comboEditing[cfg.key] === true;
      const filteredOptions = filterComboOptions(
        options,
        searchText,
      );
      const disambiguationHint = isEditing ? getComboDisambiguationHint(filteredOptions, searchText) : undefined;
      const hintId = `voa-search-${cfg.key}-hint`;
      const singleSelectTitle = buildSelectedTooltip(
        selectedKey ? [String(selectedKey)] : [],
        options,
        cfg.tooltip ?? cfg.placeholder ?? cfg.label,
      );
      const applySearchSingleSelectOption = (opt?: IComboBoxOption): void => {
        updateSingleSelect(cfg.stateKey, opt);
        setComboEditingFor(cfg.key, false);
        setComboSearchTextFor(cfg.key, '');
      };
      const applySearchSingleSelectDismissOption = (opt?: IComboBoxOption): void => {
        updateSingleSelect(cfg.stateKey, opt);
      };
      const commitSearchSingleSelect = (event: React.KeyboardEvent<IComboBox>, inputValue: string): void => {
        const resolvedOptions = filterComboOptions(options, inputValue);
        commitComboSingleSelect(
          event,
          inputValue,
          resolvedOptions,
          selectedKey,
          applySearchSingleSelectOption,
          cfg.key,
        );
      };
      const handleSearchSingleSelectChange = (
        event: React.FormEvent<IComboBox>,
        opt?: IComboBoxOption,
        _index?: number,
        value?: string,
      ): void => {
        if (consumeComboIgnoreNextChange(cfg.key, opt)) return;
        if (shouldIgnoreComboChange(cfg.key, opt)) return;
        const searchValue = typeof value === 'string' ? value : searchText;
        const resolvedOptions = filterComboOptions(options, searchValue);
        const resolvedKey = opt?.key ?? resolveComboKeyFromSearch(resolvedOptions, searchValue, selectedKey);
        if (!resolvedKey) return;
        setComboCancelNextDismiss(cfg.key);
        updateFilters(cfg.stateKey, String(resolvedKey));
        setComboEditingFor(cfg.key, false);
        setComboSearchTextFor(cfg.key, '');
      };
      const handleSearchSingleSelectKeyDownCapture = (event: React.KeyboardEvent<IComboBox>): void => {
        if (event.key === 'Escape') {
          setComboCancelNextDismiss(cfg.key);
          return;
        }
        const isEnter = event.key === 'Enter' || event.key === 'NumpadEnter';
        if (!isEnter) return;
        const inputValue = getComboInputValue(event) || searchText;
        if (!inputValue.trim()) return;
        commitSearchSingleSelect(event, inputValue);
      };
      const handleSearchSingleSelectInputValueChange = (value: string): void => {
        const next = normalizeSingleSelectSearchText(value, options);
        if (!next) {
          setComboEditingFor(cfg.key, false);
          setComboSearchTextFor(cfg.key, '');
          return;
        }
        setComboEditingFor(cfg.key, true);
        setComboSearchTextFor(cfg.key, next);
      };
      const handleSearchSingleSelectKeyDown = (event: React.KeyboardEvent<IComboBox>): void => {
        if (event.defaultPrevented) return;
        const inputValue = getComboInputValue(event) || searchText;
        if (!inputValue.trim()) return;
        commitSearchSingleSelect(event, inputValue);
      };
      const handleSearchSingleSelectDismissed = (): void => {
        if (!consumeComboCancelNextDismiss(cfg.key)) {
          commitComboSingleSelectOnDismiss(
            searchText,
            options,
            selectedKey,
            applySearchSingleSelectDismissOption,
          );
        }
        setComboEditingFor(cfg.key, false);
        setComboSearchTextFor(cfg.key, '');
      };
      return (
        <GenericSingleSelectControl
          label={cfg.label}
          title={singleSelectTitle}
          ariaDescribedBy={buildAriaDescribedBy(disambiguationHint ? hintId : undefined)}
          options={filteredOptions}
          selectedKey={isEditing ? null : selectedKey}
          isEditing={isEditing}
          searchText={searchText}
          disambiguationHint={disambiguationHint}
          onChange={handleSearchSingleSelectChange}
          onKeyDownCapture={handleSearchSingleSelectKeyDownCapture}
          onInputValueChange={handleSearchSingleSelectInputValueChange}
          onKeyDown={handleSearchSingleSelectKeyDown}
          onMenuDismissed={handleSearchSingleSelectDismissed}
        />
      );
    };

    const commitMultiSelectChange = (
      opt: IComboBoxOption | undefined,
      opts: IComboBoxOption[],
      hasSelectAll: boolean,
    ): void => {
      if (!opt) return;
      if (hasSelectAll && String(opt.key) === SELECT_ALL_KEY) {
        const values =
          cfg.selectAllValues ??
          opts
            .filter((o) => String(o.key) !== SELECT_ALL_KEY)
            .map((o) => String(o.key));
        updateFilters(cfg.stateKey, cfg.multiLimit ? values.slice(Math.max(0, values.length - cfg.multiLimit)) : values);
        setComboIgnoreNextInput(cfg.key);
        setComboSearchTextFor(cfg.key, '');
        return;
      }
      updateMultiSelect(cfg.stateKey, opt, cfg.multiLimit);
      setComboIgnoreNextInput(cfg.key);
      setComboSearchTextFor(cfg.key, '');
    };

    const renderGenericMultiSelectSearch = (): React.ReactNode => {
      const options = buildDropdownOptions(cfg);
      const selected = getFilterField<string[]>(filters, cfg.stateKey);
      const searchText = comboSearchText[cfg.key] ?? '';
      const selectedKeys = (selected ?? []).map((key) => String(key));
      const hasSelectAll = options.some((opt) => String(opt.key) === SELECT_ALL_KEY);
      const filteredOptions = filterComboOptions(options, searchText);
      const disambiguationHint = searchText.trim()
        ? getComboDisambiguationHint(filteredOptions, searchText)
        : undefined;
      const hintId = `voa-search-${cfg.key}-hint`;
      const multiSelectTitle = buildSelectedTooltip(
        selectedKeys,
        options,
        cfg.tooltip ?? cfg.placeholder ?? cfg.label,
      );
      const handleMultiSelectChange = (opt?: IComboBoxOption): void => {
        commitMultiSelectChange(opt, options, hasSelectAll);
      };
      const handleSearchMultiSelectChange = (_event: React.FormEvent<IComboBox>, opt?: IComboBoxOption): void => {
        handleMultiSelectChange(opt);
      };
      const handleSearchMultiInputValueChange = (value: string): void => {
        if (consumeComboIgnoreNextInput(cfg.key)) {
          return;
        }
        setComboSearchTextFor(
          cfg.key,
          normalizeMultiSelectSearchText(
            value,
            options,
            selectedKeys,
          ),
        );
      };
      const applyMultiSelectFromKeyDown = (_ev: React.FormEvent<IComboBox>, opt?: IComboBoxOption): void => {
        handleMultiSelectChange(opt);
      };
      const clearMultiSearchText = (value: string): void => {
        setComboSearchTextFor(cfg.key, value);
      };
      const handleSearchMultiKeyDown = (event: React.KeyboardEvent<IComboBox>): void => {
        if (!searchText.trim()) return;
        commitPrefilterMultiSelect(
          event,
          searchText,
          filteredOptions,
          selectedKeys,
          applyMultiSelectFromKeyDown,
          cfg.key,
          clearMultiSearchText,
        );
      };
      const handleSearchMultiMenuDismissed = (): void => {
        setComboSearchTextFor(cfg.key, '');
      };
      return (
        <GenericMultiSelectControl
          label={cfg.label}
          ariaDescribedBy={buildAriaDescribedBy(disambiguationHint ? hintId : undefined)}
          title={multiSelectTitle}
          options={filteredOptions}
          selectedKeys={selectedKeys}
          searchText={searchText}
          disambiguationHint={disambiguationHint}
          hintId={hintId}
          onChange={handleSearchMultiSelectChange}
          onInputValueChange={handleSearchMultiInputValueChange}
          onKeyDown={handleSearchMultiKeyDown}
          onMenuDismissed={handleSearchMultiMenuDismissed}
        />
      );
    };

    if (cfg.control === 'text' || cfg.control === 'textContains' || cfg.control === 'textPrefix') {
      return renderGenericTextSearch();
    }
    if (cfg.control === 'numeric') {
      return renderGenericNumericSearch();
    }
    if (cfg.control === 'dateRange') {
      return renderGenericDateRangeSearch();
    }
    if (cfg.control === 'singleSelect') {
      return renderGenericSingleSelectSearch();
    }
    if (cfg.control === 'multiSelect') {
      return renderGenericMultiSelectSearch();
    }

    return null;
  }, [
    filters,
    addressError,
    billingAuthorityError,
    billingAuthorityOptionsError,
    filteredBillingAuthorityOptionsList,
    billingAuthorityOptionsList,
    billingAuthorityOptionsLoading,
    billingAuthorityRefError,
    postcodeError,
    saleIdError,
    summaryFlagError,
    searchFieldError,
    streetError,
    taskIdError,
    townError,
    uprnError,
    updateFilters,
    scheduleSearch,
    showPostcodeHint,
    updateNumericFilter,
    parseISODate,
    dateStrings,
    formatDisplayDate,
    updateDateRange,
    buildDropdownOptions,
    commonText,
    isSalesSearch,
    normalizeUkPostcode,
    salesSearchText,
    updateSingleSelect,
    updateMultiSelect,
    comboSearchText,
    comboEditing,
    billingAuthoritySearch,
    setComboSearchTextFor,
    setComboEditingFor,
    setComboIgnoreNextInput,
    setComboCancelNextDismiss,
    consumeComboIgnoreNextInput,
    consumeComboIgnoreNextChange,
    consumeComboCancelNextDismiss,
    shouldIgnoreComboChange,
    commitComboSingleSelect,
    commitComboSingleSelectOnDismiss,
    commitPrefilterMultiSelect,
    parseDateInput,
  ]);

  const scheduleLiveTextFilter = React.useCallback((fieldName: string, value: string) => {
    if (liveFilterTimer.current) {
      window.clearTimeout(liveFilterTimer.current);
    }
    liveFilterTimer.current = window.setTimeout(() => {
      setColumnFilters((prev) => {
        const updated: Record<string, ColumnFilterValue> = { ...prev };
        const trimmed = value.trim();
        if (trimmed === '') {
          delete updated[fieldName];
        } else {
          updated[fieldName] = trimmed;
        }
        return updated;
      });
    }, 300);
  }, []);

  React.useEffect(() => () => {
    if (liveFilterTimer.current) {
      window.clearTimeout(liveFilterTimer.current);
    }
  }, []);

  const navigateSafely = React.useCallback((
    item?: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord,
    column?: IColumn,
    forceViewSaleRecordAction?: boolean,
  ): void => {
    handleNavigate(item, column, forceViewSaleRecordAction).catch(() => undefined);
  }, [handleNavigate]);

  const onViewSelected = React.useCallback(() => {
    if (disableViewSalesRecordAction) {
      return;
    }
    const selected = selection.getSelection();
    if (selected.length !== 1) return;
    const first = selected[0] as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord | undefined;
    if (first) {
      navigateSafely(first, undefined, true);
    }
  }, [disableViewSalesRecordAction, navigateSafely, selection]);

  const onOpenFirstSaleForTest = React.useCallback(() => {
    if (disableViewSalesRecordAction) return;
    const first = filteredItems[0] as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord | undefined;
    if (first) {
      navigateSafely(first, undefined, true);
    }
  }, [disableViewSalesRecordAction, filteredItems, navigateSafely]);

  const onItemInvoked = React.useCallback(
    (item?: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord) => {
      navigateSafely(item);
    },
    [navigateSafely],
  );

  const handleSort = React.useCallback(
    (column: IGridColumn, descending: boolean) => {
      if (column.sortable === false) {
        return;
      }
      const sortField = column.sortBy ?? column.key;
      dismissResultMessages();
      onSort(sortField, descending);
      setMenuState(undefined);
    },
    [dismissResultMessages, onSort],
  );

  const pushRawColumnFilterOption = React.useCallback(
    (option: unknown, push: (key: string, text?: string) => void): void => {
      if (option && typeof option === 'object') {
        const candidate = option as { key?: unknown; text?: string };
        const key = candidate.key;
        if (typeof key === 'string' || typeof key === 'number' || typeof key === 'boolean') {
          push(String(key), candidate.text);
        }
        return;
      }
      if (typeof option === 'string' || typeof option === 'number' || typeof option === 'boolean') {
        const text = String(option).trim();
        if (text) {
          push(text, text);
        }
      }
    },
    [],
  );

  const pushAnyColumnFilterOption = React.useCallback(
    (option: string | { key: string | number; text?: string }, push: (key: string, text?: string) => void): void => {
      if (typeof option === 'string') {
        push(option, option);
        return;
      }
      push(String(option.key ?? ''), option.text);
    },
    [],
  );

  const addDynamicColumnFilterOptions = React.useCallback(
    (
      cfg: ColumnFilterConfig | undefined,
      normalizedField: string,
      push: (key: string, text?: string) => void,
    ): void => {
      if (!cfg?.optionFields) return;
      if (menuExtraOptions.length > 0) {
        menuExtraOptions.forEach((option) => pushRawColumnFilterOption(option, push));
        return;
      }
      const cached = columnFilterOptions[normalizedField] ?? [];
      if (cached.length > 0) {
        cached.forEach((option) => pushRawColumnFilterOption(option, push));
        return;
      }
      getDistinctOptions(cfg.optionFields).forEach((option) => pushAnyColumnFilterOption(option, push));
    },
    [columnFilterOptions, getDistinctOptions, menuExtraOptions, pushAnyColumnFilterOption, pushRawColumnFilterOption],
  );

  const prependSelectAllColumnFilterOption = React.useCallback(
    (opts: IComboBoxOption[], cfg?: ColumnFilterConfig): void => {
      if (!cfg?.selectAllValues) return;
      const isSingleAll = cfg.selectAllValues.length === 1
        && String(cfg.selectAllValues[0] ?? '').toUpperCase() === 'ALL';
      const hasAll = hasAllOption(opts);
      const hasOther = hasOtherOption(opts);
      if (isSingleAll) {
        if (!hasAll) {
          const allKey = String(cfg.selectAllValues[0] ?? 'ALL');
          opts.unshift({ key: allKey, text: 'All' });
        }
        return;
      }
      if (!hasAll && !hasOther) {
        opts.unshift({ key: SELECT_ALL_KEY, text: 'Select all' });
      }
    },
    [],
  );

  const extractSelectedColumnFilterValues = React.useCallback((existing: unknown): string[] => {
    let selectedValues: unknown[] = [];
    if (Array.isArray(existing)) {
      selectedValues = existing;
    } else if (typeof existing === 'string') {
      selectedValues = [existing];
    } else if (typeof existing === 'object' && existing !== null && Array.isArray((existing as { values?: unknown }).values)) {
      selectedValues = (existing as { values: unknown[] }).values;
    }
    return selectedValues
      .map((value) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          return String(value).trim();
        }
        return '';
      })
      .filter((value) => value !== '');
  }, []);

  const sortSummaryLikeColumnFilterOptions = React.useCallback((opts: IComboBoxOption[]): void => {
    opts.sort((a, b) => {
      const aIsAll = isAllToken(a.key) || isAllToken(a.text ?? a.key);
      const bIsAll = isAllToken(b.key) || isAllToken(b.text ?? b.key);
      if (aIsAll && !bIsAll) return -1;
      if (!aIsAll && bIsAll) return 1;
      const aText = String(a.text ?? a.key).trim();
      const bText = String(b.text ?? b.key).trim();
      return aText.localeCompare(bText, undefined, { sensitivity: 'base' });
    });
  }, []);

  const buildColumnFilterOptions = React.useCallback(
    (fieldName: string, cfg?: ColumnFilterConfig): IComboBoxOption[] => {
      const seen = new Set<string>();
      const opts: IComboBoxOption[] = [];
      const normalizedField = normalizeColumnFilterOptionKey(fieldName);
      const push = (key: string, text?: string): void => {
        if (!key || seen.has(key)) return;
        seen.add(key);
        opts.push({ key, text: text ?? key });
      };

      (cfg?.options ?? []).forEach((option) => pushAnyColumnFilterOption(option, push));
      addDynamicColumnFilterOptions(cfg, normalizedField, push);
      prependSelectAllColumnFilterOption(opts, cfg);
      extractSelectedColumnFilterValues(columnFiltersState[fieldName]).forEach((value) => push(value, value));

      const isSummaryLikeField = (
        normalizedField === 'summaryflags'
        || normalizedField === 'summaryflag'
        || normalizedField === 'reviewflags'
        || normalizedField === 'overallflag'
      );
      if (isSummaryLikeField) {
        sortSummaryLikeColumnFilterOptions(opts);
      }

      return opts;
    },
    [
      addDynamicColumnFilterOptions,
      columnFiltersState,
      extractSelectedColumnFilterValues,
      prependSelectAllColumnFilterOption,
      pushAnyColumnFilterOption,
      sortSummaryLikeColumnFilterOptions,
    ],
  );

  const openMenuForColumn = React.useCallback(
    (gridCol: IGridColumn, target?: HTMLElement) => {
      if (!target) {
        return;
      }
      const fieldName = (gridCol.fieldName ?? gridCol.key) ?? '';
      const menuFilterKey = `menuFilter-${gridCol.key ?? gridCol.fieldName ?? 'column'}`;
      const cfg = getColumnFilterConfigFor(tableKey, fieldName);
      const normalizedField = String(fieldName ?? '').toLowerCase();
      const normalizedOptionField = normalizeColumnFilterOptionKey(fieldName);
      const preloadedOptions = columnFilterOptions[normalizedOptionField] ?? [];
      menuOptionsFieldRef.current = normalizedField;
      const existing = columnFiltersState[fieldName];
      const resolvedInitial = resolveMenuInitialValue(cfg, existing, normalizedField);
      const initialValue = resolvedInitial.initialValue;
      setMenuFilterValue(initialValue);
      setMenuFilterText(typeof initialValue === 'string' ? initialValue : '');
      setMenuFilterSearch('');
      setMenuNumericMinText(resolvedInitial.minText);
      setMenuNumericMaxText(resolvedInitial.maxText);
      comboIgnoreNextInputRef.current[menuFilterKey] = false;
      comboIgnoreNextChangeRef.current[menuFilterKey] = false;
      delete comboExpectedSelectionRef.current[menuFilterKey];
      setMenuFilterError(undefined);
      setMenuExtraOptions(preloadedOptions);
      setMenuSummaryOperator(resolveMenuSummaryOperator(normalizedField, existing));
      setMenuState({ target, column: gridCol });
      if (onLoadFilterOptions && (cfg?.control === 'singleSelect' || cfg?.control === 'multiSelect')) {
        void onLoadFilterOptions(fieldName ?? '', '')
          .then((vals) => {
            if (menuOptionsFieldRef.current !== normalizedField) return;
            setMenuExtraOptions(vals ?? []);
            return undefined;
          })
          .catch(() => {
            if (menuOptionsFieldRef.current !== normalizedField) return;
            setMenuExtraOptions([]);
            return undefined;
          });
      }
    },
    [columnFilterOptions, columnFiltersState, onLoadFilterOptions, tableKey],
  );

  const onColumnHeaderClick = React.useCallback(
    (ev?: React.MouseEvent<HTMLElement>, column?: IColumn) => {
      if (!column) {
        return;
      }
      ev?.preventDefault();
      ev?.stopPropagation();
      const gridCol = column as IGridColumn;
      const target = ev?.currentTarget as HTMLElement | undefined;
      openMenuForColumn(gridCol, target);
    },
    [openMenuForColumn],
  );

  const onColumnHeaderContextMenu = React.useCallback(
    (column?: IColumn, ev?: React.MouseEvent<HTMLElement>) => {
      if (!column) {
        return;
      }
      ev?.preventDefault();
      const gridCol = column as IGridColumn;
      const target = (ev?.currentTarget ?? ev?.target) as HTMLElement | undefined;
      openMenuForColumn(gridCol, target);
    },
    [openMenuForColumn],
  );

  const applyFilter = React.useCallback(() => {
    if (!menuState) return;
    const fieldName = (menuState.column.fieldName ?? menuState.column.key) ?? '';
    const normalizedField = fieldName.replace(/[^a-z0-9]/gi, '').toLowerCase();
    const validationError = getMenuTextValidationError(
      normalizedField,
      menuFilterText,
      normalizeUkPostcode,
      isValidUkPostcode,
    );
    if (validationError) {
      setMenuFilterError(validationError);
      return;
    }
    dismissResultMessages();
    const cfg: ColumnFilterConfig | undefined = getColumnFilterConfigFor(tableKey, fieldName);
    if (menuFilterError) {
      setMenuFilterError(undefined);
    }
    setColumnFilters((prev) => {
      const updated = buildUpdatedColumnFilters({
        previous: prev,
        fieldName,
        cfg,
        normalizedField,
        menuFilterText,
        menuFilterValue,
        menuSummaryOperator,
        normalizePostcode: normalizeUkPostcode,
      });
      onColumnFiltersChange?.(updated);
      return updated;
    });
    setMenuState(undefined);
    menuState.target?.focus?.();
  }, [
    dismissResultMessages,
    isValidUkPostcode,
    menuFilterError,
    menuFilterText,
    menuFilterValue,
    menuState,
    normalizeUkPostcode,
    onColumnFiltersChange,
    tableKey,
  ]);

  const clearFilter = React.useCallback(() => {
    if (!menuState) {
      return;
    }
    const fieldName = (menuState.column.fieldName ?? menuState.column.key) ?? '';
    setColumnFilters((prev) => {
      if (!Object.prototype.hasOwnProperty.call(prev, fieldName)) {
        return prev;
      }
      const updated: Record<string, ColumnFilterValue> = { ...prev };
      delete updated[fieldName];
      onColumnFiltersChange?.(updated);
      return updated;
    });
    const cfg: ColumnFilterConfig | undefined = getColumnFilterConfigFor(tableKey, fieldName);
    if (!cfg) {
      setMenuFilterValue('');
      setMenuFilterText('');
      setMenuFilterSearch('');
      setMenuFilterError(undefined);
      return;
    }
    const { value: clearValue, minText, maxText } = computeClearFilterValue(cfg, menuFilterValue);
    setMenuFilterValue(clearValue);
    setMenuFilterText('');
    if (minText !== undefined) setMenuNumericMinText(minText);
    if (maxText !== undefined) setMenuNumericMaxText(maxText);
    setMenuFilterSearch('');
    setMenuSummaryOperator('contains');
    setMenuFilterError(undefined);
    setMenuExtraOptions([]);
    setMenuState(undefined);
    menuState.target?.focus?.();
  }, [menuFilterValue, menuState, tableKey]);

  const onGoToTop = React.useCallback(() => {
    if (resultsRef.current) {
      resultsRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    topRef.current?.focus?.();
  }, []);

  const assignUsers = React.useMemo(() => assignUsersProp ?? [], [assignUsersProp]);
  const selectedAssignmentRecords = React.useMemo(
    () => (selection.getSelection() as Record<string, unknown>[]),
    [selectedCount, selection],
  );
  const selectedCreateTaskSaleIds = React.useMemo(
    () => Array.from(new Set(
      (selection.getSelection() as Record<string, unknown>[])
        .map((record) => {
          const raw = record.saleid ?? record.saleId;
          if (typeof raw === 'string') return raw.trim();
          if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw).trim();
          return '';
        })
        .filter((saleId) => saleId !== ''),
    )),
    [selectedCount, selection],
  );
  const selectedCreateTaskRecords = React.useMemo(
    () => (selection.getSelection() as Record<string, unknown>[]),
    [selectedCount, selection],
  );
  const disabledAssignUserIds = React.useMemo(
    () => new Set(resolveAssignedUserIdsToDisable(selectedAssignmentRecords, assignUsers, derivedScreenKind)),
    [assignUsers, derivedScreenKind, selectedAssignmentRecords],
  );
  const createTaskButtonState = React.useMemo((): { disabled: boolean; tooltip?: string } => {
    if (!canCreateManualTask) {
      return {
        disabled: true,
        tooltip: 'Create task is available only to users with both manager and caseworker role/team access.',
      };
    }
    if (selectedCount === 0) {
      return { disabled: true, tooltip: 'Select one or more sales to create tasks.' };
    }
    if (selectedCreateTaskSaleIds.length === 0) {
      return { disabled: true, tooltip: 'Selected rows do not contain sale IDs.' };
    }
    const hasNonEmptyTaskId = selectedCreateTaskRecords.some((record) => {
      const raw = record.taskid ?? record.taskId;
      if (typeof raw === 'string') return raw.trim().length > 0;
      if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw).trim().length > 0;
      return false;
    });
    if (hasNonEmptyTaskId) {
      return { disabled: true, tooltip: 'Create Task is enabled only when selected Task ID is empty or null.' };
    }
    return { disabled: false };
  }, [canCreateManualTask, selectedCount, selectedCreateTaskRecords, selectedCreateTaskSaleIds.length]);
  const createTaskPreviewSaleIds = React.useMemo(
    () => selectedCreateTaskSaleIds.slice(0, 20),
    [selectedCreateTaskSaleIds],
  );
  const createTaskRemainingCount = Math.max(0, selectedCreateTaskSaleIds.length - createTaskPreviewSaleIds.length);
  const assignAlreadyAssignedReason = isQcAssign
    ? 'User is already QC assigned to at least one selected task.'
    : 'User is already assigned to at least one selected task.';
  const isAssignUserDisabled = React.useCallback(
    (userId: string): boolean => disabledAssignUserIds.has(userId),
    [disabledAssignUserIds],
  );
  const assignFilteredUsers = React.useMemo(() => {
    const term = assignSearch.trim().toLowerCase();
    return assignUsers.filter((u) => {
      if (!term) return true;
      return (
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    });
  }, [assignUsers, assignSearch]);
  const assignListItems = React.useMemo(() => {
    if (assignUsersLoading) {
      return [{
        id: ASSIGN_LOADING_ROW_ID,
        firstName: assignTasksText.loadingUsersText,
        lastName: '',
        email: '',
        team: '',
        role: '',
      }];
    }
    return assignFilteredUsers;
  }, [assignFilteredUsers, assignTasksText.loadingUsersText, assignUsersLoading]);

  const selectedAssignUser = React.useMemo(
    () => assignUsers.find((u) => u.id === assignSelectedUserId),
    [assignSelectedUserId, assignUsers],
  );

  React.useEffect(() => {
    if (!assignSelectedUserId) return;
    if (!isAssignUserDisabled(assignSelectedUserId)) return;
    setAssignSelectedUserId(undefined);
  }, [assignSelectedUserId, isAssignUserDisabled]);

  React.useEffect(() => {
    if (selectedCount > 0) return;
    setCreateTaskBusy(false);
    setCreateTaskError(undefined);
    setCreateTaskModalOpen(false);
  }, [selectedCount]);

  const handleAssignUserSelect = React.useCallback((userId: string) => {
    if (assignLoading || isAssignUserDisabled(userId)) return;
    setAssignSelectedUserId(userId);
  }, [assignLoading, isAssignUserDisabled]);

  const handleAssignSearchChange = React.useCallback((value: string) => {
    if (assignLoading || assignUsersLoading) return;
    setAssignSearch(value);
  }, [assignLoading, assignUsersLoading]);

  const openCreateTaskModal = React.useCallback(() => {
    if (createTaskButtonState.disabled) return;
    setCreateTaskError(undefined);
    setCreateTaskModalOpen(true);
  }, [createTaskButtonState.disabled]);

  const closeCreateTaskModal = React.useCallback(() => {
    if (createTaskBusy) return;
    setCreateTaskError(undefined);
    setCreateTaskModalOpen(false);
  }, [createTaskBusy]);

  const handleConfirmCreateTask = React.useCallback(async () => {
    if (!onBulkCreateTask || createTaskBusy) return;
    setCreateTaskBusy(true);
    setCreateTaskError(undefined);
    try {
      await onBulkCreateTask(selectedCreateTaskSaleIds);
      setCreateTaskModalOpen(false);
    } catch (error) {
      const message = error instanceof Error && error.message.trim().length > 0
        ? error.message
        : 'Manual task creation failed. Please try again.';
      setCreateTaskError(message);
    } finally {
      setCreateTaskBusy(false);
    }
  }, [createTaskBusy, onBulkCreateTask, selectedCreateTaskSaleIds]);

  const handleAssignClick = React.useCallback(async (user: AssignUser) => {
    if (!onAssignTasks || assignLoading || isAssignUserDisabled(user.id)) return;
    setAssignSelectedUserId(user.id);
    setAssignLoading(true);
    try {
      const ok = await onAssignTasks(user);
      if (ok) {
        closeAssignPanel();
        return;
      }
      closeAssignPanel();
    } finally {
      setAssignLoading(false);
    }
  }, [assignLoading, closeAssignPanel, isAssignUserDisabled, onAssignTasks]);

  const handleMarkPassedQcClick = React.useCallback(async () => {
    if (!onMarkPassedQc || markPassedQcLoading) return;
    setMarkPassedQcLoading(true);
    try {
      await onMarkPassedQc();
    } finally {
      setMarkPassedQcLoading(false);
    }
  }, [markPassedQcLoading, onMarkPassedQc]);

  const onMarkPassedQcActionClick = React.useCallback((): void => {
    handleMarkPassedQcClick().catch(() => undefined);
  }, [handleMarkPassedQcClick]);

  const handleAssignConfirmClick = React.useCallback((): void => {
    if (!selectedAssignUser) {
      return;
    }
    handleAssignClick(selectedAssignUser).catch(() => undefined);
  }, [handleAssignClick, selectedAssignUser]);

  const renderAssignSelectCell = React.useCallback((item: AssignUser): JSX.Element | null => {
    if (item.id === ASSIGN_LOADING_ROW_ID) {
      return null;
    }

    const disabled = assignLoading || isAssignUserDisabled(item.id);
    const disabledReason = assignLoading ? assignTasksText.loadingText : assignAlreadyAssignedReason;
    const fullName = `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim();
    const selectLabel = disabled
      ? `Select ${fullName}. Unavailable. ${disabledReason}`
      : `Select ${fullName}`;

    const handleChange = (): void => {
      if (disabled) {
        return;
      }
      handleAssignUserSelect(item.id);
    };

    return (
      <input
        className={joinClassNames('voa-assign-radio', disabled ? 'voa-focusable-disabled-radio' : undefined)}
        type="radio"
        name="assign-user"
        aria-label={selectLabel}
        disabled={disabled}
        checked={assignSelectedUserId === item.id}
        title={disabled ? disabledReason : undefined}
        onChange={handleChange}
      />
    );
  }, [assignAlreadyAssignedReason, assignLoading, assignSelectedUserId, assignTasksText.loadingText, handleAssignUserSelect, isAssignUserDisabled]);

  const assignColumns = React.useMemo<IColumn[]>(
    () => [
      {
        key: 'select',
        name: '',
        ariaLabel: 'Select user',
        minWidth: 40,
        maxWidth: 40,
        onRender: renderAssignSelectCell,
      },
      { key: 'firstName', name: 'First Name', fieldName: 'firstName', minWidth: 100, maxWidth: 160, isResizable: true },
      { key: 'lastName', name: 'Last Name', fieldName: 'lastName', minWidth: 100, maxWidth: 160, isResizable: true },
      { key: 'email', name: 'Email', fieldName: 'email', minWidth: 240, isResizable: true },
    ],
    [renderAssignSelectCell],
  );

  const isAssignRowDisabled = React.useCallback((record?: AssignUser): boolean => {
    if (!record || record.id === ASSIGN_LOADING_ROW_ID) {
      return false;
    }
    return isAssignUserDisabled(record.id);
  }, [isAssignUserDisabled]);

  const onRenderAssignUserRow = React.useCallback(
    (
      rowProps?: IDetailsRowProps,
      defaultRender?: (props?: IDetailsRowProps) => JSX.Element | null,
    ): JSX.Element | null => {
      if (!rowProps || !defaultRender) {
        return null;
      }

      const record = rowProps.item as AssignUser | undefined;
      const isDisabled = isAssignRowDisabled(record);
      const nextProps = {
        ...rowProps,
        className: joinClassNames(
          rowProps.className,
          isDisabled ? 'voa-assign-row-disabled' : undefined,
        ),
      } as IDetailsRowProps & { 'aria-disabled'?: boolean };
      if (isDisabled) {
        nextProps['aria-disabled'] = true;
      }
      return defaultRender(nextProps);
    },
    [isAssignRowDisabled],
  );

  const handleAssignItemInvoked = React.useCallback((item?: AssignUser) => {
    const record = item;
    if (!record || record.id === ASSIGN_LOADING_ROW_ID) return;
    if (assignLoading || isAssignUserDisabled(record.id)) return;
    handleAssignUserSelect(record.id);
  }, [assignLoading, handleAssignUserSelect, isAssignUserDisabled]);

  const prefilterWorkThatOptions = React.useMemo(() => {
    if (isCaseworkerView) {
      return CASEWORKER_WORKTHAT_SELF_OPTIONS;
    }
    if (isQcView) {
      return QC_WORKTHAT_SELF_OPTIONS;
    }
    if (isQcAssign) {
      return getQcWorkThatOptions(prefilters.searchBy as QcSearchBy);
    }
    return getManagerWorkThatOptions(prefilters.searchBy);
  }, [isCaseworkerView, isQcAssign, isQcView, prefilters.searchBy]);
  const filteredPrefilterWorkThatOptions = React.useMemo(
    () => filterComboOptions(
      prefilterWorkThatOptions as IComboBoxOption[],
      prefilterWorkThatSearch,
    ),
    [prefilterWorkThatOptions, prefilterWorkThatSearch],
  );
  const prefilterWorkThatHint = comboEditing.prefilterWorkThat
    ? getComboDisambiguationHint(filteredPrefilterWorkThatOptions, prefilterWorkThatSearch)
    : undefined;
  const resolvePrefilterWorkThatOptions = (searchValue: string): IComboBoxOption[] => {
    return filterComboOptions(
      prefilterWorkThatOptions as IComboBoxOption[],
      searchValue,
    );
  };
  const commitPrefilterWorkThatSingleSelect = (event: React.KeyboardEvent<IComboBox>, inputValue: string): void => {
    const resolvedOptions = resolvePrefilterWorkThatOptions(inputValue);
    commitComboSingleSelect(
      event,
      inputValue,
      resolvedOptions,
      prefilters.workThat,
      (opt) => {
        onPrefilterWorkThatChange(event as unknown as React.FormEvent<IComboBox>, opt);
        setComboEditingFor('prefilterWorkThat', false);
        setPrefilterWorkThatSearch('');
      },
      'prefilterWorkThat',
    );
  };
  const handlePrefilterWorkThatComboChange = (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    _index?: number,
    value?: string,
  ): void => {
    if (consumeComboIgnoreNextChange('prefilterWorkThat', option)) return;
    if (shouldIgnoreComboChange('prefilterWorkThat', option)) return;
    const searchValue = typeof value === 'string' ? value : prefilterWorkThatSearch;
    const resolvedOptions = resolvePrefilterWorkThatOptions(searchValue);
    const resolvedKey = option?.key ?? resolveComboKeyFromSearch(resolvedOptions, searchValue, prefilters.workThat);
    if (!resolvedKey) return;
    setComboCancelNextDismiss('prefilterWorkThat');
    onPrefilterWorkThatChange(event, { key: resolvedKey } as IComboBoxOption);
    setComboEditingFor('prefilterWorkThat', false);
    setPrefilterWorkThatSearch('');
  };
  const handlePrefilterWorkThatComboKeyDownCapture = (event: React.KeyboardEvent<IComboBox>): void => {
    if (event.key === 'Escape') {
      setComboCancelNextDismiss('prefilterWorkThat');
      return;
    }
    const isEnter = event.key === 'Enter' || event.key === 'NumpadEnter';
    if (!isEnter) return;
    const inputValue = getComboInputValue(event) || prefilterWorkThatSearch;
    if (!inputValue.trim()) return;
    commitPrefilterWorkThatSingleSelect(event, inputValue);
  };
  const handlePrefilterWorkThatComboInputValueChange = (value: string): void => {
    const next = normalizeSingleSelectSearchText(
      value,
      prefilterWorkThatOptions as IComboBoxOption[],
    );
    if (!next) {
      setComboEditingFor('prefilterWorkThat', false);
      setPrefilterWorkThatSearch('');
      return;
    }
    setComboEditingFor('prefilterWorkThat', true);
    setPrefilterWorkThatSearch(next);
  };
  const handlePrefilterWorkThatComboKeyDown = (event: React.KeyboardEvent<IComboBox>): void => {
    if (event.defaultPrevented) return;
    const inputValue = getComboInputValue(event) || prefilterWorkThatSearch;
    if (!inputValue.trim()) return;
    const isEnter = event.key === 'Enter' || event.key === 'NumpadEnter';
    if (isEnter) {
      const enabledOptions = filteredPrefilterWorkThatOptions.filter((opt) => !opt.disabled);
      if (enabledOptions.length === 1) {
        event.preventDefault();
        setComboCancelNextDismiss('prefilterWorkThat');
        onPrefilterWorkThatChange(event as unknown as React.FormEvent<IComboBox>, enabledOptions[0]);
        setComboEditingFor('prefilterWorkThat', false);
        setPrefilterWorkThatSearch('');
        return;
      }
    }
    commitPrefilterWorkThatSingleSelect(event, inputValue);
  };
  const handlePrefilterWorkThatComboDismissed = (): void => {
    if (!consumeComboCancelNextDismiss('prefilterWorkThat')) {
      commitComboSingleSelectOnDismiss(
        prefilterWorkThatSearch,
        prefilterWorkThatOptions as IComboBoxOption[],
        prefilters.workThat,
        (opt) => onPrefilterWorkThatChange({} as React.FormEvent<IComboBox>, opt),
      );
    }
    setComboEditingFor('prefilterWorkThat', false);
    setPrefilterWorkThatSearch('');
  };
  React.useEffect(() => {
    if ((!isCaseworkerView && !isQcView) || prefilters.workThat) return;
    const firstOption = prefilterWorkThatOptions.find((opt) => opt?.key !== undefined);
    if (!firstOption) return;
    const nextWork = String(firstOption.key) as ManagerWorkThat;
    markPrefilterHydrating();
    setPrefilters((prev) => {
      if (prev.workThat) return prev;
      const needsCompleted = (isQcAssign || isQcView) ? isQcCompletedWorkThat(nextWork) : isManagerCompletedWorkThat(nextWork);
      return {
        ...prev,
        workThat: nextWork,
        completedFrom: needsCompleted ? prev.completedFrom : undefined,
        completedTo: needsCompleted ? prev.completedTo : undefined,
      };
    });
  }, [isCaseworkerView, isManagerAssign, isQcAssign, isQcView, markPrefilterHydrating, prefilterWorkThatOptions, prefilters.workThat]);
  const prefilterUserOptions = isQcAssign && prefilters.searchBy === 'qcUser'
    ? qcUserOptionsList
    : caseworkerOptionsList;
  const prefilterUserOptionsFiltered = isQcAssign && prefilters.searchBy === 'qcUser'
    ? filteredQcUserOptionsList
    : filteredCaseworkerOptionsList;
  const prefilterUserHint = caseworkerSearch.trim()
    ? getComboDisambiguationHint(prefilterUserOptionsFiltered, caseworkerSearch)
    : undefined;
  const prefilterUserOptionsError = isQcAssign && prefilters.searchBy === 'qcUser'
    ? qcUserOptionsError
    : caseworkerOptionsError;
  const prefilterUserLabel = isQcAssign && prefilters.searchBy === 'qcUser'
    ? qcText.prefilter.labels.qcUser
    : prefilterText.labels.caseworker;
  const prefilterUserPlaceholder = isQcAssign && prefilters.searchBy === 'qcUser'
    ? qcText.prefilter.placeholders.qcUser
    : prefilterText.placeholders.caseworker;
  const prefilterUserTooltip = isQcAssign && prefilters.searchBy === 'qcUser'
    ? prefilterTooltips.qcUser
    : prefilterTooltips.caseworker;
  const prefilterUserTitle = buildSelectedTooltip(caseworkerSelectedKeys, prefilterUserOptions as IComboBoxOption[], prefilterUserTooltip);
  const prefilterUserSelectionSummary = buildCompactSelectedSummary(
    caseworkerSelectedKeys,
    prefilterUserOptions as IComboBoxOption[],
  );
  const prefilterWorkThatTitle = buildSelectedTooltip(
    prefilters.workThat ? [String(prefilters.workThat)] : [],
    prefilterWorkThatOptions as IComboBoxOption[],
    prefilterTooltips.workThat,
  );
  const prefilterBillingTitle = buildSelectedTooltip(
    managerBillingSelectedKeys,
    managerBillingAuthorityOptions as IComboBoxOption[],
    prefilterTooltips.billingAuthority,
  );
  const prefilterBillingSelectionSummary = buildCompactSelectedSummary(
    managerBillingSelectedKeys,
    managerBillingAuthorityOptions as IComboBoxOption[],
  );
  const handlePrefilterBillingComboChange = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption): void => {
    if (!option) return;
    onPrefilterBillingChange(event, option);
    setComboIgnoreNextInput('prefilterBilling');
    setManagerBillingSearch('');
  };
  const handlePrefilterBillingComboKeyDown = (event: React.KeyboardEvent<IComboBox>): void => {
    if (!managerBillingSearch.trim()) return;
    commitPrefilterMultiSelect(
      event,
      managerBillingSearch,
      managerBillingAuthorityOptions as IComboBoxOption[],
      managerBillingSelectedKeys.map((key) => String(key)),
      onPrefilterBillingChange,
      'prefilterBilling',
      setManagerBillingSearch,
    );
  };
  const handlePrefilterBillingComboInputValueChange = (value: string): void => {
    if (consumeComboIgnoreNextInput('prefilterBilling')) {
      return;
    }
    setManagerBillingSearch(
      normalizeMultiSelectSearchText(
        value,
        managerBillingAuthorityOptions as IComboBoxOption[],
        managerBillingSelectedKeys.map((key) => String(key)),
      ),
    );
  };
  const handlePrefilterBillingComboDismissed = (): void => {
    setManagerBillingSearch('');
  };
  const handlePrefilterUserComboChange = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption): void => {
    if (!option) return;
    onPrefilterCaseworkerChange(event, option);
    setComboIgnoreNextInput('prefilterCaseworker');
    setCaseworkerSearch('');
  };
  const handlePrefilterUserComboKeyDown = (event: React.KeyboardEvent<IComboBox>): void => {
    if (!caseworkerSearch.trim()) return;
    commitPrefilterMultiSelect(
      event,
      caseworkerSearch,
      prefilterUserOptions as IComboBoxOption[],
      caseworkerSelectedKeys.map((key) => String(key)),
      onPrefilterCaseworkerChange,
      'prefilterCaseworker',
      setCaseworkerSearch,
    );
  };
  const handlePrefilterUserComboInputValueChange = (value: string): void => {
    if (consumeComboIgnoreNextInput('prefilterCaseworker')) {
      return;
    }
    setCaseworkerSearch(
      normalizeMultiSelectSearchText(
        value,
        prefilterUserOptions as IComboBoxOption[],
        caseworkerSelectedKeys.map((key) => String(key)),
      ),
    );
  };
  const handlePrefilterUserComboDismissed = (): void => {
    setCaseworkerSearch('');
  };
  const prefilterFromTitle = buildValueTooltip(
    formatDisplayDate(parseISODate(prefilters.completedFrom)),
    prefilterTooltips.fromDate,
  );
  const prefilterToTitle = buildValueTooltip(
    formatDisplayDate(parseISODate(prefilters.completedTo)),
    prefilterTooltips.toDate,
  );
  const prefilterUserId = isQcAssign && prefilters.searchBy === 'qcUser' ? 'prefilter-qcuser' : 'prefilter-caseworker';
  const prefilterOwnerHidden = isQcView || (isQcAssign && prefilters.searchBy === 'task');
  const prefilterNeedsCompletedDates = (isQcAssign || isQcView)
    ? isQcCompletedWorkThat(prefilters.workThat)
    : isManagerCompletedWorkThat(prefilters.workThat);
  const hasImplicitOwner = !!currentUserId?.trim();
  const prefilterHasOwner = hasPrefilterOwnerSelection(prefilters, {
    isCaseworkerView,
    isQcView,
    isQcAssign,
    hasImplicitOwner,
  });
  const prefilterHasWorkThat = !!prefilters.workThat;
  const prefilterHasFromDate = !prefilterNeedsCompletedDates || !!prefilters.completedFrom;
  const prefilterSearchDisabled = !onPrefilterApply
    || !prefilterHasOwner
    || !prefilterHasWorkThat
    || !prefilterHasFromDate
    || !!prefilterFromDateError;
  const prefilterRequiredLegendId = 'voa-prefilter-required-key';
  const prefilterIsDefault = isPrefilterDefault(prefilters);
  const hasColumnFilters = Object.keys(columnFiltersState).length > 0;
  const showViewSalesRecord = isViewSalesRecordEnabledFor(tableKey);
  const showPrefilterToggle = useAssignmentLayout && !!showResults && !!prefilterApplied;
  const prefilterToggleText = prefilterExpanded ? commonText.toggles.hidePrefilter : commonText.toggles.showPrefilter;
  const showSearchPanelToggle = showSearchPanel && !useAssignmentLayout;
  const searchPanelToggleText = searchPanelExpanded ? commonText.toggles.hideFilters : commonText.toggles.showFilters;
  const showSelectionControls = !!showResults && selectionType === SelectionMode.multiple;
  const selectionToolbarLabel = commonText.selectionControls.toolbarAriaLabel;
  const selectionGroupLabel = commonText.selectionControls.groupAriaLabel;
  const clearSelectionText = commonText.selectionControls.clearSelectionText;
  const selectFirstLabel = commonText.selectionControls.selectFirstLabel;
  const selectFirstPlaceholder = commonText.selectionControls.selectFirstPlaceholder;
  const selectFirstSuffix = commonText.selectionControls.selectFirstSuffix;
  const selectFirstButtonText = commonText.selectionControls.selectFirstButtonText;
  const selectFirstHelperText = commonText.selectionControls.selectFirstHelperText;
  const handleSelectFirstInputChange = (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string): void => {
    if (selectionControlsDisabled) return;
    setSelectFirstInput(value ?? '');
    if (selectFirstError) {
      setSelectFirstError(undefined);
    }
  };
  const handleSelectFirstInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    if (selectionControlsDisabled) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      selectFirstOnPage();
    }
  };
  const assignLoadingText = assignTasksText.loadingText;
  const selectionControlsDisabled = pageItemCount === 0;
  const selectionControlsUnavailableReason = selectionControlsDisabled ? 'No rows are available on this page.' : undefined;
  const clearSelectionUnavailableReason = selectionControlsDisabled
    ? selectionControlsUnavailableReason
    : selectedCount === 0
      ? 'No rows are currently selected.'
      : undefined;
  const viewSalesRecordUnavailableReason = viewSaleNavigationPending
    ? 'Opening the sales record. Please wait.'
    : disableViewSalesRecordAction
    ? 'Viewing the sales record is not available in this context.'
    : selectedCount !== 1
      ? 'Select exactly one row to view its sales record.'
      : undefined;
  const assignActionUnavailableReason = assignButtonState.tooltip;
  const createTaskUnavailableReason = createTaskButtonState.tooltip;
  const markPassedQcUnavailableReason = markPassedQcLoading
    ? 'Mark Passed QC is currently in progress. Please wait.'
    : markPassedQcButtonState.tooltip;
  const markPassedQcActionText = markPassedQcLoading
    ? 'Marking as Passed QC...'
    : markPassedQcText.buttonText;
  const previousPageUnavailableReason = canPrev ? undefined : 'You are already on the first page.';
  const nextPageUnavailableReason = canNext ? undefined : 'You are already on the last page.';
  const assignSearchUnavailableReason = assignLoading
    ? assignTasksText.loadingAssignText
    : assignUsersLoading
      ? assignTasksText.loadingUsersText
      : undefined;
  const assignConfirmUnavailableReason = assignLoading
    ? 'Assignment is currently in progress. Please wait.'
    : !selectedAssignUser
      ? 'Select a user before assigning tasks.'
      : undefined;
  const prefilterSearchUnavailableReason = React.useMemo(() => {
    if (!prefilterSearchDisabled) return undefined;
    if (!onPrefilterApply) return 'Prefilter search is not available on this screen.';
    if (!prefilterHasOwner) {
      if (isManagerAssign && prefilters.searchBy === 'billingAuthority') {
        return `Select ${managerText.prefilter.labels.billingAuthority} before searching.`;
      }
      return `Select ${prefilterUserLabel} before searching.`;
    }
    if (!prefilterHasWorkThat) {
      return `Select ${prefilterText.labels.workThat} before searching.`;
    }
    if (!prefilterHasFromDate) {
      return `Select ${prefilterText.labels.fromDate} before searching.`;
    }
    if (prefilterFromDateError) {
      return prefilterFromDateError;
    }
    return 'Complete the required prefilter fields before searching.';
  }, [
    isManagerAssign,
    managerText.prefilter.labels.billingAuthority,
    onPrefilterApply,
    prefilterFromDateError,
    prefilterHasFromDate,
    prefilterHasOwner,
    prefilterHasWorkThat,
    prefilterSearchDisabled,
    prefilterText.labels.fromDate,
    prefilterText.labels.workThat,
    prefilterUserLabel,
    prefilters.searchBy,
  ]);
  const searchUnavailableReason = React.useMemo(() => {
    if (!isSearchDisabled) return undefined;
    if (isSalesSearch) {
      const validationMessage = displaySaleIdError
        ?? displayTaskIdError
        ?? displayUprnError
        ?? addressError
        ?? postcodeError
        ?? streetError
        ?? townError
        ?? displayBillingAuthorityError
        ?? displayBillingAuthorityRefError;
      if (validationMessage) {
        return validationMessage;
      }
      return getSalesSearchUnavailableReason(filters.searchBy);
    }
    return uprnError
      ?? addressError
      ?? postcodeError
      ?? summaryFlagError
      ?? saleIdError
      ?? taskIdError
      ?? searchFieldError
      ?? 'Enter valid search criteria before searching.';
  }, [
    addressError,
    displayBillingAuthorityError,
    displayBillingAuthorityRefError,
    displaySaleIdError,
    displayTaskIdError,
    displayUprnError,
    filters.searchBy,
    isSalesSearch,
    isSearchDisabled,
    postcodeError,
    searchFieldError,
    streetError,
    summaryFlagError,
    townError,
  ]);
  const salesSearchShowsRequiredFields = React.useMemo(
    () => isSalesSearch && ['billingAuthority', 'saleId', 'taskId', 'uprn'].includes(filters.searchBy),
    [filters.searchBy, isSalesSearch],
  );
  const showSalesSearchUnavailableNote = isSalesSearch && isSearchDisabled && !!searchUnavailableReason;
  const compactViewport = viewportMetrics.width > 0
    && viewportMetrics.zoomPercent > COMPACT_MODE_ZOOM_THRESHOLD_PERCENT;
  const ultraCompactViewport = viewportMetrics.width > 0
    && (viewportMetrics.width <= 640 || viewportMetrics.height <= 520);
  const microViewport = viewportMetrics.width > 0
    && (viewportMetrics.width <= 420 || viewportMetrics.height <= 360);
  const isLocalHarness = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    const host = window.location?.hostname ?? '';
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  }, []);
  const showBulkSelectionControls = showSelectionControls;
  const showCompactClearSelection = false;
  const showClearFiltersButton = hasColumnFilters && !microViewport;
  const showViewSalesRecordButton = !microViewport
    && showResults
    && showViewSalesRecord
    && (!compactViewport || (!viewSaleNavigationPending && !disableViewSalesRecordAction && selectedCount === 1));
  const showAssignButton = !microViewport && Boolean(showAssign
    && (!compactViewport || !assignButtonState.disabled));
  const showCreateTaskButton = !microViewport && Boolean(showCreateTask
    && (!compactViewport || !createTaskButtonState.disabled));
  const showMarkPassedQcButton = !microViewport && Boolean(showMarkPassedQc
    && (!compactViewport || (!markPassedQcButtonState.disabled && !markPassedQcLoading)));
  const showOpenFirstSaleTestButton = isLocalHarness
    && showResults
    && filteredItems.length > 0
    && !viewSaleNavigationPending
    && !disableViewSalesRecordAction;
  const compactActionMenuItems = React.useMemo<IContextualMenuItem[]>(() => {
    if (!microViewport) return [];
    const items: IContextualMenuItem[] = [];
    if (selectedCount > 0) {
      items.push({
        key: 'clearSelection',
        text: clearSelectionText,
        iconProps: { iconName: 'Clear' },
        onClick: clearPageSelection,
      });
    }
    if (hasColumnFilters) {
      items.push({
        key: 'clearFilters',
        text: commonText.buttons.clearFilters,
        iconProps: { iconName: 'ClearFilter' },
        onClick: () => clearAllColumnFilters(),
      });
    }
    if (showResults && showViewSalesRecord && !viewSaleNavigationPending && !disableViewSalesRecordAction && selectedCount === 1) {
      items.push({
        key: 'viewSalesRecord',
        text: commonText.tableActions.viewSalesRecord,
        iconProps: { iconName: 'View' },
        onClick: onViewSelected,
      });
    }
    if (showAssign && !assignButtonState.disabled) {
      items.push({
        key: 'assignTasks',
        text: assignActionText,
        iconProps: { iconName: 'AddFriend' },
        onClick: openAssignPanel,
      });
    }
    if (showCreateTask && !createTaskButtonState.disabled) {
      items.push({
        key: 'createTask',
        text: createTaskActionText,
        iconProps: { iconName: 'Add' },
        onClick: openCreateTaskModal,
      });
    }
    if (showMarkPassedQc && !markPassedQcButtonState.disabled && !markPassedQcLoading) {
      items.push({
        key: 'markPassedQc',
        text: markPassedQcText.buttonText,
        iconProps: { iconName: 'CompletedSolid' },
        onClick: onMarkPassedQcActionClick,
      });
    }
    return items;
  }, [
    assignActionText,
    assignButtonState.disabled,
    clearPageSelection,
    clearSelectionText,
    clearAllColumnFilters,
    commonText.buttons.clearFilters,
    commonText.tableActions.viewSalesRecord,
    createTaskActionText,
    createTaskButtonState.disabled,
    disableViewSalesRecordAction,
    handleMarkPassedQcClick,
    hasColumnFilters,
    markPassedQcButtonState.disabled,
    markPassedQcLoading,
    markPassedQcText.buttonText,
    microViewport,
    onMarkPassedQcActionClick,
    onViewSelected,
    openCreateTaskModal,
    openAssignPanel,
    selectedCount,
    showCreateTask,
    showAssign,
    showMarkPassedQc,
    showResults,
    showViewSalesRecord,
    viewSaleNavigationPending,
  ]);
  const showCompactActionMenu = microViewport && compactActionMenuItems.length > 0;
  const showGridToolbar = !!showResults
    && [
      showBulkSelectionControls,
      showCompactClearSelection,
      showClearFiltersButton,
      showViewSalesRecordButton,
      showCreateTaskButton,
      showAssignButton,
      showMarkPassedQcButton,
    ].some(Boolean);

  const renderPrefilterLabel = React.useCallback((
    text: string,
    options?: {
      htmlFor?: string;
      id?: string;
      className?: string;
      required?: boolean;
    },
  ) => renderLabelWithRequired(text, options), []);

  const renderSalesSearchLabel = React.useCallback((
    text: string,
    required?: boolean,
  ) => renderLabelWithRequired(text, { required: required ?? false }), []);

  const createMenuNumericHandlers = React.useCallback((numVal: NumericFilter) => ({
    handleMenuNumericModeChange: (_event: React.FormEvent<IComboBox>, opt?: IComboBoxOption): void => {
      setMenuFilterValue((prev) => {
        const current = (prev as NumericFilter) ?? { mode: '>=' };
        const mode = typeof opt?.key === 'string' ? (opt.key as NumericFilter['mode']) : current.mode ?? '>=';
        setMenuNumericMinText(current.min !== undefined ? String(current.min) : '');
        setMenuNumericMaxText(current.max !== undefined ? String(current.max) : '');
        return { ...current, mode };
      });
    },
    handleMenuNumericValueChange: (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value = ''): void => {
      const text = value;
      if (!isValidNumericFilterInput(text)) return;
      if (numVal.mode === '<=') {
        setMenuNumericMaxText(text);
      } else {
        setMenuNumericMinText(text);
      }
      setMenuFilterValue((prev) => {
        const current = (prev as NumericFilter) ?? { mode: '>=' };
        const currentMode = current.mode ?? '>=';
        const parsed = Number.parseFloat(text);
        const num = text === '' || Number.isNaN(parsed) ? undefined : parsed;
        if (currentMode === '<=') return { ...current, max: num };
        return { ...current, min: num };
      });
    },
    handleMenuNumericMaxChange: (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value = ''): void => {
      const text = value;
      if (!isValidNumericFilterInput(text)) return;
      setMenuNumericMaxText(text);
      setMenuFilterValue((prev) => {
        const current = (prev as NumericFilter) ?? { mode: 'between' };
        const parsed = Number.parseFloat(text);
        const num = text === '' || Number.isNaN(parsed) ? undefined : parsed;
        return { ...current, max: num };
      });
    },
  }), [menuNumericMaxText, menuNumericMinText]);

  const createMenuDateRangeHandlers = React.useCallback(() => ({
    handleMenuDateRangeFromSelect: (date: Date | null | undefined): void => {
      setMenuFilterValue((prev) => {
        const current = (prev as DateRangeFilter) ?? {};
        const nextFrom = toISODateString(date);
        if (!nextFrom) {
          return { ...current, from: undefined, to: undefined };
        }
        return { ...current, from: nextFrom };
      });
    },
    handleMenuDateRangeToSelect: (date: Date | null | undefined): void => {
      setMenuFilterValue((prev) => {
        const current = (prev as DateRangeFilter) ?? {};
        const fromDate = parseISODate(current.from);
        if (date && fromDate && date < fromDate) {
          return current;
        }
        return { ...current, to: toISODateString(date) };
      });
    },
  }), [toISODateString, parseISODate]);

  const createMenuSingleSelectHandlers = React.useCallback((menuFilterKey: string, options: IComboBoxOption[]) => {
    const applyMenuSingleSelectOption = (opt?: IComboBoxOption): void => {
      setMenuFilterValue((opt?.key as string) ?? '');
      setComboEditingFor(menuFilterKey, false);
      setMenuFilterSearch('');
    };
    const commitMenuSingleSelect = (event: React.KeyboardEvent<IComboBox>, inputValue: string): void => {
      const resolvedOptions = filterComboOptions(options, inputValue);
      commitComboSingleSelect(
        event,
        inputValue,
        resolvedOptions,
        typeof menuFilterValue === 'string' ? menuFilterValue : undefined,
        applyMenuSingleSelectOption,
        menuFilterKey,
      );
    };

    return {
      commitMenuSingleSelect,
      handleMenuSingleSelectChange: (
        _event: React.FormEvent<IComboBox>,
        opt?: IComboBoxOption,
        _index?: number,
        value?: string,
      ): void => {
        if (consumeComboIgnoreNextChange(menuFilterKey, opt)) return;
        if (shouldIgnoreComboChange(menuFilterKey, opt)) return;
        const searchValue = typeof value === 'string' ? value : menuFilterSearch;
        const resolvedOptions = filterComboOptions(options, searchValue);
        const resolvedKey = opt?.key ?? resolveComboKeyFromSearch(
          resolvedOptions,
          searchValue,
          typeof menuFilterValue === 'string' ? menuFilterValue : undefined,
        );
        if (!resolvedKey) return;
        setMenuFilterValue(String(resolvedKey));
        setComboEditingFor(menuFilterKey, false);
        setMenuFilterSearch('');
      },
      handleMenuSingleSelectKeyDownCapture: (event: React.KeyboardEvent<IComboBox>): void => {
        const isEnter = event.key === 'Enter' || event.key === 'NumpadEnter';
        if (!isEnter) return;
        const inputValue = getComboInputValue(event) || menuFilterSearch;
        if (!inputValue.trim()) return;
        commitMenuSingleSelect(event, inputValue);
      },
      handleMenuSingleSelectInputValueChange: (value: string): void => {
        const next = normalizeSingleSelectSearchText(value, options);
        if (!next) {
          setComboEditingFor(menuFilterKey, false);
          setMenuFilterSearch('');
          return;
        }
        setComboEditingFor(menuFilterKey, true);
        setMenuFilterSearch(next);
      },
      handleMenuSingleSelectKeyDown: (event: React.KeyboardEvent<IComboBox>): void => {
        if (event.defaultPrevented) return;
        const inputValue = getComboInputValue(event) || menuFilterSearch;
        if (!inputValue.trim()) return;
        commitMenuSingleSelect(event, inputValue);
      },
      handleMenuSingleSelectDismissed: (): void => {
        setComboEditingFor(menuFilterKey, false);
        setMenuFilterSearch('');
      },
    };
  }, [
    commitComboSingleSelect,
    consumeComboIgnoreNextChange,
    filterComboOptions,
    getComboInputValue,
    menuFilterSearch,
    menuFilterValue,
    normalizeSingleSelectSearchText,
    resolveComboKeyFromSearch,
    setComboEditingFor,
    setMenuFilterSearch,
    setMenuFilterValue,
    shouldIgnoreComboChange,
  ]);

  const computeMultiSelectState = React.useCallback((
    cfg: ColumnFilterConfig,
    options: IComboBoxOption[],
    rawSearch: string,
    menuFilterValue: ColumnFilterValue,
  ) => {
    const selectAllValues = cfg.selectAllValues ?? [];
    const hasAll = hasAllOption(options);
    const hasOther = hasOtherOption(options);
    const isSingleAll = selectAllValues.length === 1 && String(selectAllValues[0] ?? '').toUpperCase() === 'ALL';
    const hasSelectAll = selectAllValues.length > 0 && (isSingleAll || (!hasAll && !hasOther));
    const allKey = isSingleAll ? (resolveAllOptionKey(options) ?? String(selectAllValues[0] ?? 'ALL')) : '';
    const selectAllKey = hasSelectAll ? (isSingleAll ? allKey : SELECT_ALL_KEY) : '';
    const selectedKeys = Array.isArray(menuFilterValue) ? menuFilterValue.map((key) => String(key)) : [];
    const normalizedSearch = normalizeMultiSelectSearchText(rawSearch ?? '', options, selectedKeys);
    const filteredMultiOptions = filterComboOptions(options, normalizedSearch);
    const exactMatchKey = normalizedSearch.trim() ? resolveComboOptionKey(options, normalizedSearch) : undefined;

    return {
      selectAllValues,
      hasSelectAll,
      selectAllKey,
      isSingleAll,
      selectedKeys,
      normalizedSearch,
      filteredMultiOptions,
      exactMatchKey,
    };
  }, [
    hasAllOption,
    hasOtherOption,
    resolveAllOptionKey,
    normalizeMultiSelectSearchText,
    filterComboOptions,
    resolveComboOptionKey,
    SELECT_ALL_KEY,
  ]);

  const renderMenuFilterControl = React.useCallback((args: {
    menuState: { target: HTMLElement; column: IGridColumn };
    cfg?: ColumnFilterConfig;
    filterColumnName: string;
    textVal: string;
    isPostcodeField: boolean;
    isTaskIdField: boolean;
    isSummaryFlagField: boolean;
    options: IComboBoxOption[];
    filteredColumnOptions: IComboBoxOption[];
    dateVal: DateRangeFilter;
    hasDateRangeStart: boolean;
  }): React.ReactNode => {
    const {
      menuState,
      cfg,
      filterColumnName,
      textVal,
      isPostcodeField,
      isTaskIdField,
      isSummaryFlagField,
      options,
      filteredColumnOptions,
      dateVal,
      hasDateRangeStart,
    } = args;

    const renderTextFilterUI = (): React.ReactNode => {
      return (
        <>
          <TextField
            label={`Filter ${filterColumnName}`}
            placeholder={`Filter ${filterColumnName}`}
            value={textVal}
            onChange={handleMenuTextFilterChange}
            errorMessage={(isPostcodeField || isTaskIdField) ? menuFilterError : undefined}
          />
          {isTaskIdField && (
            <Text variant="small" styles={{ root: { marginTop: 4 } }}>
              Use A- or M- prefix (e.g. A-1000001) or numbers only.
            </Text>
          )}
          {isSummaryFlagField && (
            <Text variant="small" styles={{ root: { marginTop: 4 } }}>
              Type the full summary flag text to filter results.
            </Text>
          )}
        </>
      );
    };

    const renderSingleSelectUI = (): React.ReactNode => {
      const menuFilterKey = `menuFilter-${menuState.column.key ?? menuState.column.fieldName ?? 'column'}`;
      const isEditing = comboEditing[menuFilterKey] === true;
      const menuHint = isEditing ? getComboDisambiguationHint(filteredColumnOptions, menuFilterSearch) : undefined;
      const menuHintId = `${menuFilterKey}-hint`;
      let selectedSingleFilterKey: string | undefined;
      if (!isEditing && typeof menuFilterValue === 'string') {
        selectedSingleFilterKey = menuFilterValue;
      }
      const {
        handleMenuSingleSelectChange,
        handleMenuSingleSelectKeyDownCapture,
        handleMenuSingleSelectInputValueChange,
        handleMenuSingleSelectKeyDown,
        handleMenuSingleSelectDismissed,
      } = createMenuSingleSelectHandlers(menuFilterKey, options);
      return (
        <>
          <ComboBox
            label={`Filter ${filterColumnName}`}
            placeholder={`Select ${filterColumnName}`}
            aria-describedby={buildAriaDescribedBy(menuHint ? menuHintId : undefined)}
            options={filteredColumnOptions}
            allowFreeform={false}
            allowFreeInput
            autoComplete="off"
            text={isEditing ? menuFilterSearch : undefined}
            selectedKey={isEditing ? null : selectedSingleFilterKey}
            calloutProps={{ directionalHint: DirectionalHint.bottomLeftEdge, directionalHintFixed: true }}
            onChange={handleMenuSingleSelectChange}
            onKeyDownCapture={handleMenuSingleSelectKeyDownCapture}
            onInputValueChange={handleMenuSingleSelectInputValueChange}
            onKeyDown={handleMenuSingleSelectKeyDown}
            onMenuDismissed={handleMenuSingleSelectDismissed}
            styles={comboBoxStyles240x200}
          />
          {menuHint && (
            <Text id={menuHintId} variant="small" styles={{ root: { marginTop: 4 } }}>
              {menuHint}
            </Text>
          )}
        </>
      );
    };

    const renderMultiSelectUI = (): React.ReactNode => {
      if (!cfg) return null;
      const menuFilterKey = `menuFilter-${menuState.column.key ?? menuState.column.fieldName ?? 'column'}`;
      const {
        selectAllValues,
        hasSelectAll,
        selectAllKey,
        isSingleAll,
        selectedKeys: computedSelectedKeys,
        normalizedSearch,
        filteredMultiOptions,
        exactMatchKey,
      } = computeMultiSelectState(cfg, options, menuFilterSearch, menuFilterValue);

      // For summary flag field with eq operator, convert string value to array for multi-select
      const selectedKeys = isSummaryFlagField && menuSummaryOperator === 'eq' && typeof menuFilterValue === 'string'
        ? [menuFilterValue.trim()].filter((v) => v !== '')
        : computedSelectedKeys;

      const highlightBorder = theme.semanticColors.focusBorder ?? theme.palette.themePrimary;
      const resetMenuFilterSearch = (): void => {
        setMenuFilterSearch('');
      };
      const applySummaryOperatorChange = (opt?: IComboBoxOption): void => {
        const key = String(opt?.key ?? 'contains');
        let nextOperator: 'contains' | 'notContains' | 'eq' = 'contains';
        if (key === 'notContains') {
          nextOperator = 'notContains';
        } else if (key === 'eq') {
          nextOperator = 'eq';
        }
        setMenuSummaryOperator(nextOperator);
        setMenuFilterValue('');
        resetMenuFilterSearch();
      };
      const handleMultiSelectInputValueChange = (value?: string): void => {
        if (consumeComboIgnoreNextInput(menuFilterKey)) {
          return;
        }
        const next = normalizeMultiSelectSearchText(value, options, selectedKeys);
        setMenuFilterSearch(next);
      };
      const exactMatchOptions = buildExactMatchHighlightedOptions(
        filteredMultiOptions,
        exactMatchKey,
        highlightBorder,
        theme.semanticColors.menuItemBackgroundHovered,
      );
      const menuHint = normalizedSearch.trim()
        ? getComboDisambiguationHint(filteredMultiOptions, normalizedSearch)
        : undefined;
      const menuHintId = `${menuFilterKey}-hint`;
      const handleMenuFilterMultiChange = (opt?: IComboBoxOption) => {
        if (!opt) return;
        const nextMenuFilterValue = resolveMenuMultiSelectValue(
          menuFilterValue,
          opt,
          hasSelectAll,
          selectAllKey,
          isSingleAll,
          selectAllValues,
          cfg.multiLimit,
        );
        setMenuFilterValue(nextMenuFilterValue);
        setComboIgnoreNextInput(menuFilterKey);
        resetMenuFilterSearch();
      };
      const applyMenuFilterMultiChange = (_event: React.FormEvent<IComboBox>, opt?: IComboBoxOption): void => {
        handleMenuFilterMultiChange(opt);
      };
      const clearMenuFilterSearch = (value: string): void => {
        setMenuFilterSearch(value);
      };
      const handleMenuMultiSelectKeyDown = (event: React.KeyboardEvent<IComboBox>): void => {
        if (!normalizedSearch.trim()) return;
        commitPrefilterMultiSelect(
          event,
          normalizedSearch,
          filteredMultiOptions,
          selectedKeys,
          applyMenuFilterMultiChange,
          menuFilterKey,
          clearMenuFilterSearch,
        );
      };
      const handleSummaryOperatorComboChange = (_event: React.FormEvent<IComboBox>, opt?: IComboBoxOption): void => {
        applySummaryOperatorChange(opt);
      };
      const handleSummaryFlagMultiComboChange = (_event: React.FormEvent<IComboBox>, opt?: IComboBoxOption): void => {
        handleMenuFilterMultiChange(opt);
      };
      const handleSummaryFlagMultiInputChange = (value: string): void => {
        handleMultiSelectInputValueChange(value);
      };
      const handleMenuFilterComboDismissed = (): void => {
        setMenuFilterSearch('');
      };
      const renderSummaryOperator = (): React.ReactNode => {
        if (!isSummaryFlagField) {
          return null;
        }
        return (
          <ComboBox
            label="Operator"
            options={[
              { key: 'contains', text: 'Contains' },
              { key: 'notContains', text: 'Does not contain' },
              { key: 'eq', text: 'Equals' },
            ]}
            selectedKey={menuSummaryOperator}
            allowFreeform={false}
            autoComplete="off"
            onChange={handleSummaryOperatorComboChange}
            styles={{
              ...comboBoxStyles240x200,
              root: { ...comboBoxStyles240x200.root, marginBottom: 8 },
            }}
          />
        );
      };

      const renderHintAndSummaryNote = (): React.ReactNode => (
        <>
          {menuHint && (
            <Text id={menuHintId} variant="small" styles={{ root: { marginTop: 4 } }}>
              {menuHint}
            </Text>
          )}
          {isSummaryFlagField && (
            <Text variant="small" styles={{ root: { marginTop: 4 } }}>
              {'Select one or more summary flags from the current page.'}
            </Text>
          )}
        </>
      );

      return (
        <>
          {renderSummaryOperator()}
          <ComboBox
            label={`Filter ${filterColumnName}`}
            placeholder={`Select ${filterColumnName}`}
            aria-describedby={buildAriaDescribedBy(menuHint ? menuHintId : undefined)}
            options={exactMatchOptions}
            multiSelect
            allowFreeform={false}
            allowFreeInput
            autoComplete="off"
            text={normalizedSearch.trim() ? normalizedSearch : undefined}
            persistMenu
            selectedKey={selectedKeys}
            calloutProps={{ directionalHint: DirectionalHint.bottomLeftEdge, directionalHintFixed: true }}
            onChange={handleSummaryFlagMultiComboChange}
            onInputValueChange={handleSummaryFlagMultiInputChange}
            onKeyDown={handleMenuMultiSelectKeyDown}
            onMenuDismissed={handleMenuFilterComboDismissed}
            styles={comboBoxStyles240x200}
          />
          {renderHintAndSummaryNote()}
        </>
      );
    };

    const renderNumericFilterUI = (): React.ReactNode => {
      const numVal = (menuFilterValue as NumericFilter) ?? { mode: '>=' };
      const { handleMenuNumericModeChange, handleMenuNumericValueChange, handleMenuNumericMaxChange } = createMenuNumericHandlers(numVal);
      return (
        <Stack tokens={{ childrenGap: 8 }}>
          <ComboBox
            label={commonText.labels.options}
            options={[
              { key: '>=', text: commonText.filters.numericModes.gte },
              { key: '<=', text: commonText.filters.numericModes.lte },
              { key: 'between', text: commonText.filters.numericModes.between },
            ]}
            selectedKey={numVal.mode ?? '>='}
            allowFreeform={false}
            autoComplete="off"
            onChange={handleMenuNumericModeChange}
            styles={comboBoxStyles240x200}
          />
          <TextField
            label={`${menuState.column.name} ${numVal.mode === '<=' ? 'max' : 'min'}`}
            type="text"
            inputMode="decimal"
            value={numVal.mode === '<=' ? menuNumericMaxText : menuNumericMinText}
            onChange={handleMenuNumericValueChange}
          />
          {numVal.mode === 'between' && (
            <TextField
              label={`${menuState.column.name} max`}
              type="text"
              inputMode="decimal"
              value={menuNumericMaxText}
              onChange={handleMenuNumericMaxChange}
            />
          )}
        </Stack>
      );
    };

    const renderDateRangeFilterUI = (): React.ReactNode => {
      const menuFromDate = parseISODate(dateVal.from);
      const menuToDate = parseISODate(dateVal.to);
      const menuDateRangeInvalidOrder = Boolean(menuFromDate && menuToDate && menuToDate < menuFromDate);
      const { handleMenuDateRangeFromSelect, handleMenuDateRangeToSelect } = createMenuDateRangeHandlers();
      return (
        <Stack tokens={{ childrenGap: 8 }}>
          <DatePicker
            label={`${menuState.column.name} start`}
            firstDayOfWeek={DayOfWeek.Monday}
            strings={dateStrings}
            value={parseISODate(dateVal.from)}
            formatDate={formatDisplayDate}
            allowTextInput
            parseDateFromString={parseDateInput}
            onSelectDate={handleMenuDateRangeFromSelect}
          />
          <DatePicker
            label={`${menuState.column.name} end`}
            firstDayOfWeek={DayOfWeek.Monday}
            strings={dateStrings}
            value={menuToDate}
            formatDate={formatDisplayDate}
            allowTextInput
            parseDateFromString={parseDateInput}
            minDate={menuFromDate}
            disabled={!hasDateRangeStart}
            onSelectDate={handleMenuDateRangeToSelect}
          />
          {menuDateRangeInvalidOrder && (
            <Text variant="small" styles={{ root: { color: '#d4351c' } }} role="alert">
              End date must be on or after start date.
            </Text>
          )}
        </Stack>
      );
    };

    const handleMenuTextFilterChange = (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string): void => {
      const next = isTaskIdField ? sanitizeTaskIdInput(value, ID_FIELD_MAX_LENGTH) : (value ?? '');
      setMenuFilterValue(next);
      setMenuFilterText(next);
      if (menuFilterError) setMenuFilterError(undefined);
    };

    if (!cfg) {
      return (
        <>
          <TextField
            label={`Filter ${filterColumnName}`}
            placeholder={`Filter ${filterColumnName}`}
            value={textVal}
            onChange={handleMenuTextFilterChange}
            errorMessage={(isPostcodeField || isTaskIdField) ? menuFilterError : undefined}
          />
          {isTaskIdField && (
            <Text variant="small" styles={{ root: { marginTop: 4 } }}>
              Use A- or M- prefix (e.g. A-1000001) or numbers only.
            </Text>
          )}
        </>
      );
    }

    if (cfg.control === 'textEq' || cfg.control === 'textPrefix' || cfg.control === 'textContains') {
      return renderTextFilterUI();
    }
    if (cfg.control === 'singleSelect') {
      return renderSingleSelectUI();
    }
    if (cfg.control === 'multiSelect') {
      return renderMultiSelectUI();
    }
    if (cfg.control === 'numeric') {
      return renderNumericFilterUI();
    }
    if (cfg.control === 'dateRange') {
      return renderDateRangeFilterUI();
    }
    return null;
  }, [
    comboEditing,
    commitComboSingleSelect,
    commitPrefilterMultiSelect,
    commonText.filters.numericModes.between,
    commonText.filters.numericModes.gte,
    commonText.filters.numericModes.lte,
    commonText.labels.options,
    computeMultiSelectState,
    consumeComboIgnoreNextChange,
    consumeComboIgnoreNextInput,
    createMenuDateRangeHandlers,
    createMenuNumericHandlers,
    createMenuSingleSelectHandlers,
    dateStrings,
    formatDisplayDate,
    menuFilterError,
    menuFilterSearch,
    menuFilterValue,
    menuNumericMaxText,
    menuNumericMinText,
    menuSummaryOperator,
    parseDateInput,
    parseISODate,
    setComboEditingFor,
    setComboIgnoreNextChange,
    setComboIgnoreNextInput,
    shouldIgnoreComboChange,
    theme.palette.themePrimary,
    theme.semanticColors.focusBorder,
    theme.semanticColors.menuItemBackgroundHovered,
    toISODateString,
  ]);

  const resolveMenuFieldContext = React.useCallback((menuStateColumn: IGridColumn) => {
    const fieldName = (menuStateColumn.fieldName ?? menuStateColumn.key) ?? '';
    const rawFilterColumnName = String(menuStateColumn.name ?? menuStateColumn.fieldName ?? 'column');
    const opensInNewTabSuffix = SCREEN_TEXT.common.links.opensInNewTab.toLowerCase();
    const normalizedFilterColumnName = rawFilterColumnName.trim();
    const filterColumnName = normalizedFilterColumnName.toLowerCase().endsWith(opensInNewTabSuffix)
      ? normalizedFilterColumnName.slice(0, -SCREEN_TEXT.common.links.opensInNewTab.length).trim()
      : normalizedFilterColumnName;
    const normalizedField = fieldName.replace(/[^a-z0-9]/gi, '').toLowerCase();
    const isPostcodeField = normalizedField === 'postcode';
    const isTaskIdField = normalizedField === 'taskid';
    const isSummaryFlagField = normalizedField === 'summaryflags' || normalizedField === 'summaryflag';
    return {
      fieldName,
      filterColumnName,
      columnName: filterColumnName,
      isPostcodeField,
      isTaskIdField,
      isSummaryFlagField,
    };
  }, []);

  const resolveMenuDateRangeState = React.useCallback((cfg: ColumnFilterConfig | undefined, dateVal: DateRangeFilter) => {
    const hasDateRangeStart = !!(dateVal.from && dateVal.from.trim().length > 0);
    const hasDateRangeEnd = !!(dateVal.to && dateVal.to.trim().length > 0);
    const dateRangeStart = parseISODate(dateVal.from);
    const dateRangeEnd = parseISODate(dateVal.to);
    const isDateRangeInvalidOrder = cfg?.control === 'dateRange'
      && Boolean(dateRangeStart && dateRangeEnd && dateRangeEnd < dateRangeStart);
    const isDateRangeIncomplete = cfg?.control === 'dateRange'
      && (!hasDateRangeStart || !hasDateRangeEnd);
    const isDateRangeMissingEndDate = cfg?.control === 'dateRange'
      && hasDateRangeStart && !hasDateRangeEnd;
    return {
      hasDateRangeStart,
      hasDateRangeEnd,
      isDateRangeInvalidOrder,
      isDateRangeIncomplete,
      isDateRangeMissingEndDate,
    };
  }, [parseISODate]);

  const getApplyUnavailableReason = React.useCallback((
    columnName: string,
    isDateRangeMissingEndDate: boolean,
    isDateRangeIncomplete: boolean,
    isDateRangeInvalidOrder: boolean,
  ): string => {
    if (isDateRangeMissingEndDate) {
      return `Select an end date for ${columnName} to apply this filter.`;
    }
    if (isDateRangeIncomplete) {
      return `Select a start date for ${columnName} to enable filtering.`;
    }
    if (isDateRangeInvalidOrder) {
      return `End date for ${columnName} must be on or after the start date.`;
    }
    return 'Enter or select a filter value before applying.';
  }, []);

  const menuItems = React.useMemo<IContextualMenuItem[]>(() => {
    if (!menuState) return [];
    const {
      fieldName,
      filterColumnName,
      columnName,
      isPostcodeField,
      isTaskIdField,
      isSummaryFlagField,
    } = resolveMenuFieldContext(menuState.column);
    const cfg = getColumnFilterConfigFor(tableKey, fieldName);
    const options = cfg?.control === 'multiSelect' || cfg?.control === 'singleSelect'
      ? buildColumnFilterOptions(fieldName, cfg)
      : [];
    const filteredColumnOptions = cfg?.control === 'multiSelect' || cfg?.control === 'singleSelect'
      ? filterComboOptions(
        options,
        menuFilterSearch,
      )
      : options;
    const textVal = typeof menuFilterValue === 'string' ? menuFilterValue : '';
    const dateVal = (menuFilterValue as DateRangeFilter) ?? {};
    const minLen = cfg?.minLength ?? 1;
    const existingFilter = columnFiltersState[fieldName];
    const hasExistingFilter = hasActiveColumnFilter(existingFilter);
    const {
      hasDateRangeStart,
      isDateRangeInvalidOrder,
      isDateRangeIncomplete,
      isDateRangeMissingEndDate,
    } = resolveMenuDateRangeState(cfg, dateVal);

    const applyDisabled = isColumnFilterApplyDisabled({
      cfg,
      isPostcodeField,
      minLen,
      menuFilterText,
      menuFilterValue,
      menuSummaryOperator,
      isSummaryFlagField,
      hasExistingFilter,
      normalizePostcode: normalizeUkPostcode,
      isDateRangeIncomplete,
      isDateRangeInvalidOrder,
    });

    const isSummaryFlagMultiSelect = true;
    const applyUnavailableReason = getApplyUnavailableReason(
      columnName,
      isDateRangeMissingEndDate,
      isDateRangeIncomplete,
      isDateRangeInvalidOrder,
    );
    return [
      ...buildSortMenuItems(
        { columnMenu: commonText.columnMenu },
        () => handleSort(menuState.column, false),
        () => handleSort(menuState.column, true),
      ),
      buildDividerMenuItem(),
      {
        key: 'filterInput',
        onRender: () => (
          // text={commonText.columnMenu.apply}
          <ColumnFilterMenuContent
            content={renderMenuFilterControl({
              menuState,
              cfg,
              filterColumnName,
              textVal,
              isPostcodeField,
              isTaskIdField,
              isSummaryFlagField,
              options,
              filteredColumnOptions,
              dateVal,
              hasDateRangeStart,
            })}
            isDateRangeIncomplete={isDateRangeIncomplete}
            incompleteText={computeDateRangeIncompleteText(!hasDateRangeStart, columnName)}
            applyText={commonText.columnMenu.apply}
            applyDisabled={applyDisabled}
            applyUnavailableReason={applyUnavailableReason}
            applyAriaLabel={`Apply filter for ${columnName}`}
            onApply={applyFilter}
            clearText={commonText.columnMenu.clear}
            clearAriaLabel={`Clear filter for ${columnName}`}
            onClear={clearFilter}
          />
        ),
      },
    ];
  }, [
    menuState,
    tableKey,
    commonText,
    menuSummaryOperator,
    menuNumericMinText,
    menuNumericMaxText,
    menuFilterError,
    menuFilterValue,
    menuFilterText,
    menuFilterSearch,
    columnFiltersState,
    comboEditing,
    getApplyUnavailableReason,
    handleSort,
    buildColumnFilterOptions,
    applyFilter,
    clearFilter,
    resolveMenuDateRangeState,
    resolveMenuFieldContext,
    setComboEditingFor,
    setComboIgnoreNextInput,
    consumeComboIgnoreNextInput,
    consumeComboIgnoreNextChange,
    shouldIgnoreComboChange,
    commitComboSingleSelect,
    commitPrefilterMultiSelect,
    dateStrings,
    parseDateInput,
    parseISODate,
    formatDisplayDate,
    toISODateString,
  ]);

  if (datasetColumns.length === 0) {
    return <NoFields resources={resources} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <div
        className={joinClassNames(
          'voa-grid-shell',
          useAssignmentLayout && 'voa-grid-shell--assignment',
          hasSelectionColumn && 'voa-grid-shell--selection',
          compactViewport && 'voa-grid-shell--compact',
        )}
        style={{ height, display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}
        ref={topRef}
        tabIndex={-1}
        aria-label={commonText.aria.resultsTable}
        data-view-sale-loading={viewSaleLoading ? 'true' : 'false'}
      >
        <div className="voa-skip-links">
          <a href="#voa-grid-results">{commonText.aria.skipToResults}</a>
          <a href="#voa-grid-pagination">{commonText.aria.skipToPagination}</a>
        </div>
        {viewSaleNavigationPending && (
          <div className="voa-view-sale-pending-note" role="status" aria-live="polite" aria-label={viewSaleLoadingText}>
            <Spinner size={SpinnerSize.small} aria-hidden />
            <span>{viewSaleLoadingText}</span>
          </div>
        )}
        {viewSaleLoading && (
          <div className="voa-view-sale-overlay" role="status" aria-live="polite" aria-label={viewSaleLoadingText}>
            <Spinner size={SpinnerSize.large} label={viewSaleLoadingText} />
          </div>
        )}
        {columnDatasetNotDefined && !dismissedColumnConfigMessage && (
          <MessageBar
            messageBarType={MessageBarType.error}
            style={{ marginBottom: 16 }}
            onDismiss={handleDismissColumnConfigMessage}
            dismissButtonAriaLabel={commonText.buttons.clear}
          >
            {commonText.messages.columnConfigMissing}
          </MessageBar>
        )}
        {errorMessage && !dismissedErrorMessage && (
          <MessageBar
            messageBarType={MessageBarType.error}
            style={{ marginBottom: 16 }}
            onDismiss={handleDismissErrorMessage}
            dismissButtonAriaLabel={commonText.buttons.clear}
          >
            {errorMessage}
          </MessageBar>
        )}
        {statusMessage && (
          <MessageBar
            messageBarType={statusMessage.type}
            style={{ marginBottom: 16 }}
            onDismiss={onStatusMessageDismiss}
            dismissButtonAriaLabel={commonText.buttons.clear}
          >
            {statusMessage.text}
          </MessageBar>
        )}
          {pageHeaderText && (
            <div className="voa-command-bar">
              <div className="voa-command-bar__left">
                {onBackRequested && (
                  <DefaultButton
                    className="voa-back-button"
                    text={commonText.buttons.back}
                    iconProps={{ iconName: 'Back' }}
                    ariaLabel={commonText.aria.back}
                    title={commonText.buttons.back}
                    onClick={onBackRequested}
                  />
                )}
                <div className="voa-command-bar__title-group">
                  <Text as="h1" variant={ultraCompactViewport ? 'mediumPlus' : 'large'} className="voa-command-bar__title">
                    {pageHeaderText}
                  </Text>
                  {contextSubtitle && (
                    <Text variant="small" className="voa-command-bar__context">
                      {contextSubtitle}
                    </Text>
                  )}

                </div>
              </div>
              <div className="voa-command-bar__actions">
                {onEditContext && (
                  <DefaultButton
                    className="voa-edit-context-button"
                    text={HOME_JOURNEY_COPY.changeContextButton}
                    iconProps={{ iconName: 'Edit' }}
                    ariaLabel={HOME_JOURNEY_COPY.changeContextButton}
                    onClick={onEditContext}
                  />
                )}
                {showSearchPanelToggle && (
                  <DefaultButton
                    className="voa-prefilter-toggle"
                    text={searchPanelToggleText}
                    iconProps={{ iconName: searchPanelExpanded ? 'FilterSolid' : 'Filter' }}
                    ariaLabel={searchPanelToggleText}
                    title={searchPanelToggleText}
                    aria-expanded={searchPanelExpanded}
                    onClick={toggleSearchPanel}
                  />
                )}
                {useAssignmentLayout && showPrefilterToggle && (
                  <DefaultButton
                    className="voa-prefilter-toggle"
                    text={prefilterToggleText}
                    iconProps={{ iconName: prefilterExpanded ? 'FilterSolid' : 'Filter' }}
                    ariaLabel={prefilterToggleText}
                    title={prefilterToggleText}
                    aria-expanded={prefilterExpanded}
                    aria-controls="voa-prefilter-panel"
                    onClick={togglePrefilters}
                  />
                )}
                {showCompactActionMenu && (
                  <DefaultButton
                    className="voa-compact-actions-toggle"
                    text={commonText.buttons.moreActions}
                    iconProps={{ iconName: 'More' }}
                    ariaLabel={commonText.buttons.moreActions}
                    title={commonText.buttons.moreActions}
                    menuProps={{
                      items: compactActionMenuItems,
                      directionalHint: DirectionalHint.bottomRightEdge,
                    }}
                  />
                )}
              </div>
            </div>
          )}
          {(isManagerAssign || isCaseworkerView || isQcAssign || isQcView) && prefilterExpanded && (
        <div id="voa-prefilter-panel">
        <Text id={prefilterRequiredLegendId} variant="small" className="voa-prefilter-required-key">
          {prefilterText.accessibility.requiredFieldKey}
        </Text>
        {prefilterResetNotice && (
          <Text variant="small" className="voa-prefilter-reset-note">
            {prefilterResetNotice}
          </Text>
        )}
        <Stack
          horizontal
          wrap
          verticalAlign="end"
          tokens={{ childrenGap: 16 }}
          className={`voa-prefilter-bar${useAssignmentLayout ? ' voa-prefilter-bar--inline' : ''}${prefilterNeedsCompletedDates ? '' : ' voa-prefilter-bar--no-date'}${isCaseworkerView ? ' voa-prefilter-bar--caseworker' : ''}${prefilterOwnerHidden ? ' voa-prefilter-bar--no-owner' : ''}${isQcView ? ' voa-prefilter-bar--qcview' : ''}`}
        >
          {(isManagerAssign || isQcAssign) && (
            <>
              <Stack.Item className="voa-prefilter-col voa-prefilter-col-searchby-label">
                <div className="voa-prefilter-field">
                  {renderPrefilterLabel(prefilterText.labels.searchBy, {
                    htmlFor: 'prefilter-searchby',
                    className: 'voa-prefilter-label',
                  })}
                </div>
              </Stack.Item>
              <Stack.Item className="voa-prefilter-col voa-prefilter-col-searchby-field">
                <div className="voa-prefilter-field">
                  <SearchByComboField
                    id="prefilter-searchby"
                    ariaLabel={prefilterText.labels.searchBy}
                    ariaDescribedBy={buildAriaDescribedBy(prefilterSearchByHint ? 'prefilter-searchby-hint' : undefined)}
                    placeholder={prefilterText.placeholders.searchBy}
                    title={prefilterSearchByTitle}
                    options={filteredPrefilterSearchByOptions}
                    selectedKey={comboEditing.prefilterSearchBy ? null : prefilters.searchBy}
                    text={comboEditing.prefilterSearchBy ? prefilterSearchBySearch : undefined}
                    hintText={prefilterSearchByHint}
                    hintId="prefilter-searchby-hint"
                    onChange={handlePrefilterSearchByComboChange}
                    onKeyDownCapture={handlePrefilterSearchByComboKeyDownCapture}
                    onInputValueChange={handlePrefilterSearchByComboInputValueChange}
                    onKeyDown={handlePrefilterSearchByComboKeyDown}
                    onMenuDismissed={handlePrefilterSearchByComboDismissed}
                  />
                </div>
              </Stack.Item>
              {isManagerAssign && prefilters.searchBy === 'billingAuthority' && (
                <>
                  <Stack.Item className="voa-prefilter-col voa-prefilter-col-owner-label">
                    <div className="voa-prefilter-field">
                      {renderPrefilterLabel(managerText.prefilter.labels.billingAuthority, {
                        htmlFor: 'prefilter-billing',
                        className: 'voa-prefilter-label',
                        required: true,
                      })}
                    </div>
                  </Stack.Item>
                  <Stack.Item className="voa-prefilter-col voa-prefilter-col-owner-field">
                    <div className="voa-prefilter-field">
                      <PrefilterMultiSelectComboField
                        id="prefilter-billing"
                        ariaLabel={formatRequiredAriaLabel(managerText.prefilter.labels.billingAuthority, true)}
                        ariaDescribedBy={buildAriaDescribedBy(
                          prefilterBillingHint ? 'prefilter-billing-hint' : undefined,
                          billingAuthorityOptionsError ? 'prefilter-billing-error' : undefined,
                        )}
                        placeholder={managerText.prefilter.placeholders.billingAuthority}
                        title={prefilterBillingTitle}
                        options={filteredManagerBillingAuthorityOptions}
                        selectedKeys={managerBillingSelectedKeys}
                        searchText={managerBillingSearch}
                        hintText={prefilterBillingHint}
                        hintId="prefilter-billing-hint"
                        errorText={billingAuthorityOptionsError}
                        errorId="prefilter-billing-error"
                        errorColor={theme.palette.redDark}
                        selectionSummary={prefilterBillingSelectionSummary}
                        selectionSummaryTooltip={prefilterBillingTitle ?? prefilterBillingSelectionSummary}
                        selectionSummaryClassName="voa-prefilter-selection-summary"
                        onChange={handlePrefilterBillingComboChange}
                        onKeyDown={handlePrefilterBillingComboKeyDown}
                        onInputValueChange={handlePrefilterBillingComboInputValueChange}
                        onMenuDismissed={handlePrefilterBillingComboDismissed}
                      />
                    </div>
                  </Stack.Item>
                </>
              )}
              {((isManagerAssign && prefilters.searchBy === 'caseworker') || (isQcAssign && prefilters.searchBy !== 'task')) && (
                <>
                  <Stack.Item className="voa-prefilter-col voa-prefilter-col-owner-label">
                    <div className="voa-prefilter-field">
                      {renderPrefilterLabel(prefilterUserLabel, {
                        htmlFor: prefilterUserId,
                        className: 'voa-prefilter-label',
                        required: true,
                      })}
                    </div>
                  </Stack.Item>
                  <Stack.Item className="voa-prefilter-col voa-prefilter-col-owner-field">
                    <div className="voa-prefilter-field">
                      <PrefilterMultiSelectComboField
                        id={prefilterUserId}
                        ariaLabel={formatRequiredAriaLabel(prefilterUserLabel, true)}
                        ariaDescribedBy={buildAriaDescribedBy(
                          prefilterUserHint ? 'prefilter-user-hint' : undefined,
                          prefilterUserOptionsError ? 'prefilter-user-error' : undefined,
                        )}
                        placeholder={prefilterUserPlaceholder}
                        title={prefilterUserTitle}
                        options={prefilterUserOptionsFiltered}
                        selectedKeys={caseworkerSelectedKeys}
                        searchText={caseworkerSearch}
                        hintText={prefilterUserHint}
                        hintId="prefilter-user-hint"
                        errorText={prefilterUserOptionsError}
                        errorId="prefilter-user-error"
                        errorColor={theme.palette.redDark}
                        selectionSummary={prefilterUserSelectionSummary}
                        selectionSummaryTooltip={prefilterUserTitle ?? prefilterUserSelectionSummary}
                        selectionSummaryClassName="voa-prefilter-selection-summary"
                        onChange={handlePrefilterUserComboChange}
                        onKeyDown={handlePrefilterUserComboKeyDown}
                        onInputValueChange={handlePrefilterUserComboInputValueChange}
                        onMenuDismissed={handlePrefilterUserComboDismissed}
                      />
                    </div>
                  </Stack.Item>
                </>
              )}
            </>
          )}
          <Stack.Item className="voa-prefilter-col voa-prefilter-col-workthat-label">
            <div className="voa-prefilter-field">
              {renderPrefilterLabel(prefilterText.labels.workThat, {
                htmlFor: 'prefilter-workthat',
                className: 'voa-prefilter-label',
                required: true,
              })}
            </div>
          </Stack.Item>
          <Stack.Item className="voa-prefilter-col voa-prefilter-col-workthat-field">
            <div className="voa-prefilter-field">
              <SearchByComboField
                id="prefilter-workthat"
                ariaLabel={formatRequiredAriaLabel(prefilterText.labels.workThat, true)}
                ariaDescribedBy={buildAriaDescribedBy(prefilterWorkThatHint ? 'prefilter-workthat-hint' : undefined)}
                placeholder={prefilterText.placeholders.workThat}
                title={prefilterWorkThatTitle}
                options={filteredPrefilterWorkThatOptions}
                selectedKey={comboEditing.prefilterWorkThat ? null : (prefilters.workThat ?? null)}
                calloutProps={{ setInitialFocus: false }}
                text={comboEditing.prefilterWorkThat ? prefilterWorkThatSearch : undefined}
                hintText={prefilterWorkThatHint}
                hintId="prefilter-workthat-hint"
                onChange={handlePrefilterWorkThatComboChange}
                onKeyDownCapture={handlePrefilterWorkThatComboKeyDownCapture}
                onInputValueChange={handlePrefilterWorkThatComboInputValueChange}
                onKeyDown={handlePrefilterWorkThatComboKeyDown}
                onMenuDismissed={handlePrefilterWorkThatComboDismissed}
              />
            </div>
          </Stack.Item>
          {prefilterNeedsCompletedDates && (
            <>
              <Stack.Item className="voa-prefilter-col voa-prefilter-col-daterange-label">
                <div className="voa-prefilter-field">
                  {renderPrefilterLabel(prefilterText.labels.completedDateRange, {
                    id: 'voa-prefilter-date-range',
                    className: 'voa-prefilter-label voa-prefilter-label--daterange',
                    required: true,
                  })}
                </div>
              </Stack.Item>
              <Stack.Item className="voa-prefilter-col voa-prefilter-col-daterange-fields">
                <div role="group" aria-labelledby="voa-prefilter-date-range" className="voa-prefilter-field">
                  <PrefilterCompletedDateFields
                    fromPlaceholder={prefilterText.placeholders.completedFrom}
                    fromValue={parseISODate(prefilters.completedFrom)}
                    toFormattedValue={formatDisplayDate(parseISODate(prefilters.completedTo))}
                    fromAriaLabel={formatRequiredAriaLabel(prefilterText.labels.fromDate, true)}
                    fromTitle={prefilterFromTitle}
                    toAriaLabel={`${prefilterText.labels.toDate}, calculated automatically`}
                    toTitle={prefilterToTitle}
                    fromDateError={prefilterFromDateError}
                    errorColor={theme.palette.redDark}
                    toDateNote={prefilterTooltips.toDate}
                    maxDate={today}
                    dateStrings={dateStrings}
                    formatDate={formatDisplayDate}
                    parseDateFromString={parseDateInput}
                    onSelectDate={onPrefilterFromDateChange}
                  />
                </div>
              </Stack.Item>
            </>
          )}
          <Stack.Item className="voa-prefilter-col voa-prefilter-col-actions">
            <PrefilterActionsRow
              searchText={prefilterText.buttons.search}
              searchAriaLabel={prefilterText.buttons.search}
              searchUnavailable={prefilterSearchDisabled}
              searchUnavailableReason={prefilterSearchUnavailableReason}
              searchUnavailableReasonId="voa-prefilter-search-unavailable"
              clearText={prefilterText.buttons.clearSearch}
              clearAriaLabel={commonText.aria.clearSearchFilters}
              showClear={!prefilterIsDefault}
              clearClassName="voa-prefilter-clear"
              onSearch={handlePrefilterSearch}
              onClear={handlePrefilterClear}
            />
          </Stack.Item>
        </Stack>
        </div>
        )}
        {showSearchPanel && searchPanelExpanded && (
        <>
        {searchResetNotice && (
          <Text variant="small" className="voa-search-reset-note">
            {searchResetNotice}
          </Text>
        )}
        <Stack
          className="voa-search-panel"
          horizontal
          wrap
          horizontalAlign="start"
          verticalAlign="start"
          tokens={{ childrenGap: 16 }}
          styles={{ root: { marginBottom: 16 } }}
        >
          <Stack.Item styles={{ root: { minWidth: 200 } }}>
            <Label htmlFor="searchby-input">{salesSearchText.searchPanel.searchByLabel}</Label>
            <SearchByComboField
              id="searchby"
              ariaLabel={salesSearchText.searchPanel.searchByLabel}
              ariaDescribedBy={buildAriaDescribedBy(searchByHint ? 'voa-searchby-hint' : undefined)}
              title={searchByTitle}
              options={filteredSearchByOptions}
              selectedKey={comboEditing.searchBy ? null : filters.searchBy}
              text={comboEditing.searchBy ? searchBySearch : undefined}
              hintText={searchByHint}
              hintId="voa-searchby-hint"
              onChange={handleSearchByComboChange}
              onKeyDownCapture={handleSearchByComboKeyDownCapture}
              onInputValueChange={handleSearchByComboInputValueChange}
              onKeyDown={handleSearchByComboKeyDown}
              onMenuDismissed={handleSearchByComboDismissed}
            />
          </Stack.Item>
          {renderSearchControl()}
          <Stack.Item className="voa-search-panel__actions">
            <SalesSearchActionsRow
              isLoading={shimmer || itemsLoading}
              loadingAriaLabel={commonText.aria.loadingFilterResults}
              searchText={commonText.buttons.search}
              searchAriaLabel={commonText.buttons.search}
              searchUnavailable={isSearchDisabled}
              searchUnavailableReason={searchUnavailableReason}
              searchUnavailableReasonId="voa-search-unavailable"
              onSearch={handleSearch}
              onUnavailableClick={isSalesSearch ? handleSalesSearchUnavailableAttempt : undefined}
              clearText={commonText.buttons.clearAll}
              clearAriaLabel={commonText.aria.clearAllFilters}
              onClear={handleClear}
            />
          </Stack.Item>
        </Stack>
        {salesSearchShowsRequiredFields && !showResults && (
          <div className="voa-search-required-key" role="note">
            {salesSearchText.accessibility.requiredFieldKey}
          </div>
        )}
        {showSalesSearchUnavailableNote && (
          <div className="voa-search-unavailable-note" role="status" aria-live="polite">
            {searchUnavailableReason}
          </div>
        )}
        </>
        )}
          {showGridToolbar && (
            <div className="voa-grid-toolbar" role="toolbar" aria-label={selectionToolbarLabel}>
              <div className="voa-grid-toolbar__left">
                {showBulkSelectionControls && (
                  <div className="voa-selection-controls" role="group" aria-label={selectionGroupLabel}>
                    <BulkSelectionField
                      selectFirstLabel={selectFirstLabel}
                      selectFirstPlaceholder={selectFirstPlaceholder}
                      selectFirstHelperText={selectFirstHelperText}
                      selectFirstSuffix={selectFirstSuffix}
                      selectFirstButtonText={selectFirstButtonText}
                      clearSelectionText={clearSelectionText}
                      selectFirstInput={selectFirstInput}
                      selectFirstError={selectFirstError}
                      pageItemCount={pageItemCount}
                      selectedCount={selectedCount}
                      selectionControlsDisabled={selectionControlsDisabled}
                      selectionControlsUnavailableReason={selectionControlsUnavailableReason}
                      clearSelectionUnavailableReason={clearSelectionUnavailableReason}
                      onSelectFirstInputChange={handleSelectFirstInputChange}
                      onSelectFirstInputKeyDown={handleSelectFirstInputKeyDown}
                      onSelectFirstOnPage={selectFirstOnPage}
                      onClearPageSelection={clearPageSelection}
                    />
                  </div>
                )}
                {showCompactClearSelection && (
                  <CompactClearSelectionButton
                    text={clearSelectionText}
                    selectedCount={selectedCount}
                    unavailableReason={clearSelectionUnavailableReason}
                    unavailableReasonId="voa-clear-selection-unavailable"
                    ariaLabel={clearSelectionText}
                    onClear={clearPageSelection}
                  />
                )}
                {showClearFiltersButton && (
                  <DefaultButton
                    text={commonText.buttons.clearFilters}
                    iconProps={{ iconName: 'ClearFilter' }}
                    onClick={handleClearAllColumnFiltersClick}
                    ariaLabel={commonText.aria.clearColumnFilters}
                  />
                )}
                <Text variant="small" className="voa-grid-toolbar__selection-summary" role="status" aria-live="polite">
                  {selectionSummaryText}
                </Text>
              </div>
              <div className="voa-grid-toolbar__right">
                {showViewSalesRecordButton && (
                  <FocusableActionButton
                    text={commonText.tableActions.viewSalesRecord}
                    iconProps={{ iconName: 'View' }}
                    onClick={onViewSelected}
                    dataTestId="voa-view-sales-record-button"
                    unavailable={viewSaleNavigationPending || disableViewSalesRecordAction || selectedCount !== 1}
                    unavailableReason={viewSalesRecordUnavailableReason}
                    unavailableReasonId="voa-view-sales-record-unavailable"
                    ariaLabel={commonText.aria.viewSelectedSalesRecord}
                  />
                )}
                {showOpenFirstSaleTestButton && (
                  <FocusableActionButton
                    text="Open First Sale (Test)"
                    onClick={onOpenFirstSaleForTest}
                    dataTestId="voa-open-first-sale-test"
                    ariaLabel="Open first sale record for local automation testing"
                  />
                )}
                {showAssignButton && (
                  <TooltipHost content={assignButtonState.tooltip}>
                    <FocusableActionButton
                      text={assignActionText}
                      iconProps={{ iconName: 'AddFriend' }}
                      onClick={openAssignPanel}
                      unavailable={assignButtonState.disabled}
                      unavailableReason={assignActionUnavailableReason}
                      unavailableReasonId="voa-assign-action-unavailable"
                      ariaLabel={assignActionText}
                    />
                  </TooltipHost>
                )}
                {showCreateTaskButton && (
                  <TooltipHost content={createTaskButtonState.tooltip}>
                    <FocusableActionButton
                      text={createTaskActionText}
                      iconProps={{ iconName: 'Add' }}
                      onClick={openCreateTaskModal}
                      unavailable={createTaskButtonState.disabled}
                      unavailableReason={createTaskUnavailableReason}
                      unavailableReasonId="voa-create-task-unavailable"
                      ariaLabel={createTaskActionText}
                    />
                  </TooltipHost>
                )}
                {showMarkPassedQcButton && (
                  <TooltipHost content={markPassedQcButtonState.tooltip}>
                    <FocusableActionButton
                      text={markPassedQcActionText}
                      iconProps={{ iconName: 'CompletedSolid' }}
                      onClick={onMarkPassedQcActionClick}
                      unavailable={markPassedQcButtonState.disabled || markPassedQcLoading}
                      unavailableReason={markPassedQcUnavailableReason}
                      unavailableReasonId="voa-mark-passed-qc-unavailable"
                      ariaLabel={markPassedQcActionText}
                    />
                  </TooltipHost>
                )}
                {markPassedQcLoading && (
                  <div role="status" aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Spinner size={SpinnerSize.small} aria-hidden />
                    <Text variant="small">Marking as Passed QC...</Text>
                  </div>
                )}
              </div>
            </div>
          )}
          {showResults && (
            <>
              {horizontalOverflowState.hasOverflow && (
                <span id="voa-grid-results-scroll-hint" className="voa-sr-only">
                  This table scrolls horizontally. Use Shift and mouse wheel, a trackpad, or the scrollbar at the bottom to view more columns.
                </span>
              )}
              <div
                style={{
                  position: 'relative',
                  flex: 1,
                  minHeight: 0,
                  minWidth: 0,
                  width: '100%',
                  maxWidth: '100%',
                }}
              >
                {horizontalOverflowState.hasOverflow && horizontalOverflowState.canScrollRight && (
                  <div className="voa-grid-results__overflow-hint" aria-hidden="true">
                    {commonText.selectionControls.resultsScrollHintText}
                  </div>
                )}
                <div
                  id="voa-grid-results"
                  ref={resultsRef}
                  className={joinClassNames(
                    'voa-grid-results',
                    horizontalOverflowState.canScrollLeft && 'voa-grid-results--scroll-left',
                    horizontalOverflowState.canScrollRight && 'voa-grid-results--scroll-right',
                  )}
                  data-is-scrollable="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    overflowY: 'scroll',
                    overflowX: 'auto',
                  }}
                  role="region"
                  aria-label={commonText.aria.resultsScrollRegion}
                  aria-describedby={horizontalOverflowState.hasOverflow ? 'voa-grid-results-scroll-hint' : undefined}
                  tabIndex={0}
                >
                <div className="voa-grid-list">
                  <ShimmeredDetailsList
                    className={ClassNames.PowerCATFluentDetailsList}
                    componentRef={componentRef}
                    items={filteredItems}
                    columns={columnsWithIcons}
                    setKey="grid"
                    enableShimmer={itemsLoading || shimmer}
                    onShouldVirtualize={shouldVirtualizeResults}
                    useReducedRowRenderer={true}
                    enableUpdateAnimations={false}
                    selectionMode={selectionType}
                    selection={selection}
                    checkboxVisibility={selectionType === SelectionMode.none ? CheckboxVisibility.hidden : CheckboxVisibility.always}
                    constrainMode={ConstrainMode.unconstrained}
                    layoutMode={DetailsListLayoutMode.fixedColumns}
                    onColumnHeaderClick={onColumnHeaderClick}
                    onColumnHeaderContextMenu={onColumnHeaderContextMenu}
                    onRenderDetailsHeader={onRenderDetailsHeader}
                    onItemInvoked={rowInvokeEnabled ? onItemInvoked : undefined}
                    columnReorderOptions={props.allowColumnReorder ? columnReorderOptions : undefined}
                    compact={compact === true || compactViewport}
                    isHeaderVisible={isHeaderVisible}
                  />
                </div>
                {!itemsLoading && !shimmer && filteredItems.length === 0 && (
                  <div className="voa-empty-state" role="status" aria-live="polite">
                    <div className="voa-empty-state__icon" aria-hidden="true">
                      <Icon iconName="PageList" />
                    </div>
                    <Text variant="mediumPlus" className="voa-empty-state__title">
                      {emptyStateText.title}
                    </Text>
                    {!!emptyStateText.message && (
                      <Text variant="small" className="voa-empty-state__text">
                        {emptyStateText.message}
                      </Text>
                    )}
                  </div>
                )}
              </div>
              </div>
            </>
          )}
        <ColumnFilterContextMenu
          isVisible={Boolean(showResults && menuState)}
          target={menuState?.target}
          items={menuItems}
          onDismiss={handleDismissColumnFilterMenu}
        />
        {showResults && (!compactViewport || totalPages > 0) && (
          <Stack
            id="voa-grid-pagination"
            horizontal
            wrap
            tokens={{ childrenGap: 6 }}
            className="voa-grid-pagination"
            style={{ width: '100%' }}
            verticalAlign="center"
            role="navigation"
            aria-label={commonText.aria.pagination}
            tabIndex={-1}
          >
            {!compactViewport && (
              <Text variant="small" className="voa-grid-pagination__summary">
                {resultsSummaryText}
              </Text>
            )}
            {totalPages > 0 && (
              <>
                <FocusableActionButton
                  text={commonText.buttons.previous}
                  iconProps={{ iconName: 'ChevronLeft' }}
                  onClick={onPrevPage}
                  unavailable={!canPrev}
                  unavailableReason={previousPageUnavailableReason}
                  unavailableReasonId="voa-pagination-previous-unavailable"
                  ariaLabel={commonText.aria.previousPage}
                  styles={paginationButtonStyles}
                />
                {(() => {
                  const pageItems: (number | 'ellipsis')[] = [];
                  if (totalPages <= 11) {
                    pageItems.push(...Array.from({ length: totalPages }, (_, i) => i));
                  } else if (currentPage <= 4) {
                    pageItems.push(0, 1, 2, 3, 4, 5, 6, 'ellipsis', totalPages - 1);
                  } else if (currentPage >= totalPages - 5) {
                    pageItems.push(0, 'ellipsis', totalPages - 6, totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
                  } else {
                    pageItems.push(0, 'ellipsis', currentPage - 3, currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2, currentPage + 3, 'ellipsis', totalPages - 1);
                  }

                  return pageItems.map((item, index) => {
                    if (item === 'ellipsis') {
                      return (
                        <Text key={`page-ellipsis-${index}`} style={{ fontSize: 14, padding: '0 6px' }} aria-hidden="true">
                          ...
                        </Text>
                      );
                    }

                    const isCurrent = item === currentPage;
                    const handlePageButtonClick = (): void => {
                      onSetPage(item);
                    };
                    return (
                      <DefaultButton
                        key={`page-${item}`}
                        aria-label={`Page ${item + 1}`}
                        aria-current={isCurrent ? 'page' : undefined}
                        styles={isCurrent ? activePaginationButtonStyles : paginationButtonStyles}
                        onClick={handlePageButtonClick}
                      >
                        {item + 1}
                      </DefaultButton>
                    );
                  });
                })()}
                <FocusableActionButton
                  text={commonText.buttons.next}
                  iconProps={{ iconName: 'ChevronRight' }}
                  onClick={onNextPage}
                  unavailable={!canNext}
                  unavailableReason={nextPageUnavailableReason}
                  unavailableReasonId="voa-pagination-next-unavailable"
                  ariaLabel={commonText.aria.nextPage}
                  styles={paginationButtonStyles}
                />
              </>
            )}
            {!compactViewport && (
              <Stack.Item styles={{ root: { marginLeft: 'auto' } }}>
                <DefaultButton
                  text={commonText.buttons.top}
                  iconProps={{ iconName: 'ChevronUp' }}
                  aria-label={commonText.aria.goToTop}
                  onClick={onGoToTop}
                  styles={paginationButtonStyles}
                />
              </Stack.Item>
            )}
          </Stack>
        )}
        {assignPanelOpen && (
          <AssignTasksOverlay
            isOpen={assignPanelOpen}
            assignLoading={assignLoading}
            assignUsersLoading={assignUsersLoading}
            assignHeaderText={assignHeaderText}
            assignTasksText={assignTasksText}
            commonBackText={commonText.buttons.back}
            commonCloseText={commonText.buttons.close}
            commonClearText={commonText.buttons.clear}
            assignSearch={assignSearch}
            assignSearchUnavailableReason={assignSearchUnavailableReason}
            assignSearchAriaDescribedBy={buildAriaDescribedBy(
              assignSearchUnavailableReason ? 'voa-assign-search-unavailable' : undefined,
            )}
            assignLoadingText={assignLoadingText}
            assignUsersInfo={assignUsersInfo}
            dismissedAssignUsersInfo={dismissedAssignUsersInfo}
            assignUsersError={assignUsersError}
            dismissedAssignUsersError={dismissedAssignUsersError}
            assignUserListTitle={assignUserListTitle}
            showDisabledNote={disabledAssignUserIds.size > 0}
            assignAlreadyAssignedReason={assignAlreadyAssignedReason}
            assignListItems={assignListItems}
            assignColumns={assignColumns}
            onRenderAssignUserRow={onRenderAssignUserRow}
            onAssignSearchChange={handleAssignSearchChange}
            onAssignItemInvoked={handleAssignItemInvoked}
            onDismissAssignUsersInfo={handleDismissAssignUsersInfo}
            onDismissAssignUsersError={handleDismissAssignUsersError}
            onBack={closeAssignPanel}
            onClose={closeAssignPanel}
            assignConfirmButton={(
              <FocusableActionButton
                text={assignActionText}
                iconProps={{ iconName: 'AddFriend' }}
                onClick={handleAssignConfirmClick}
                unavailable={!selectedAssignUser || assignLoading}
                unavailableReason={assignConfirmUnavailableReason}
                unavailableReasonId="voa-assign-confirm-unavailable"
                ariaLabel={assignActionText}
              />
            )}
          />
        )}
        <CreateTaskDialog
          isOpen={createTaskModalOpen}
          createTaskActionText={createTaskActionText}
          selectedCreateTaskSaleIds={selectedCreateTaskSaleIds}
          createTaskPreviewSaleIds={createTaskPreviewSaleIds}
          createTaskRemainingCount={createTaskRemainingCount}
          dismissedCreateTaskInfo={dismissedCreateTaskInfo}
          canCreateTask={!!onBulkCreateTask}
          isSubmitting={createTaskBusy}
          errorMessage={createTaskError}
          closeText={commonText.buttons.close}
          onDismiss={closeCreateTaskModal}
          onDismissInfo={handleDismissCreateTaskInfo}
          onConfirm={handleConfirmCreateTask}
        />
      </div>
    </ThemeProvider>
  );
});

Grid.displayName = 'Grid';
