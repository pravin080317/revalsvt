import { 
  CheckboxVisibility,
  ColumnActionsMode,
  ContextualMenu,
  ContextualMenuItemType,
  createTheme,
  DirectionalHint,
  IColumn,
  IColumnReorderOptions,
  IContextualMenuItem,
  IDetailsList,
  IObjectWithKey,
  IRefObject,
  ISelection,
  IPartialTheme,
  IDropdownOption,
  PrimaryButton,
  SelectionMode,
  ShimmeredDetailsList,
  Overlay,
  ThemeProvider,
  TextField,
  Stack,
  Text,
  DefaultButton,
  MessageBar,
  MessageBarType,
  Dropdown,
  ComboBox,
  IComboBoxOption,
  Spinner,
  SpinnerSize,
  Link,
  DatePicker,
  DayOfWeek,
  IDatePickerStrings,
} from '@fluentui/react';
import * as React from 'react';
import { NoFields } from '../DetailsListVOA/grid/NoFields';
import { RecordsColumns } from '../DetailsListVOA/config/ManifestConstants';
import { IGridColumn, ColumnConfig } from './Component.types';
import { GridCell } from '../DetailsListVOA/grid/GridCell';
import { ClassNames } from '../DetailsListVOA/grid/Grid.styles';
import { GridFilterState, NumericFilter, NumericFilterMode, createDefaultGridFilters, sanitizeFilters, SearchByOption } from './Filters';
import { getSearchByOptionsFor, isLookupFieldFor } from '../DetailsListVOA/config/TableConfigs';

type DataSet = ComponentFramework.PropertyHelper.DataSetApi.EntityRecord & IObjectWithKey;

export interface GridProps {
  // When false, hides the built-in top search panel
  showSearchPanel?: boolean;
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
  onNavigate: (item?: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord) => void;
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
  canNext: boolean;
  canPrev: boolean;
  overlayOnSort?: boolean;
  searchFilters: GridFilterState;
  errorMessage?: string;
  showResults?: boolean;
  onLoadFilterOptions?: (field: string, query: string) => Promise<string[]>;
  onColumnFiltersChange?: (filters: Record<string, string | string[]>) => void;
  allowColumnReorder?: boolean;
  columnFilters?: Record<string, string | string[]>;
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

export function getRecordKey(record: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord): string {
  const customKey = record.getValue(RecordsColumns.RecordKey);
  const trimmed = typeof customKey === 'string' ? customKey.trim() : '';
  return trimmed !== '' ? trimmed : record.getRecordId();
}

export const Grid = React.memo((props: GridProps) => {
  const {
    showSearchPanel = true,
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
    canNext,
    canPrev,
    overlayOnSort,
    searchFilters,
    errorMessage,
    showResults,
    onLoadFilterOptions,
    onColumnFiltersChange,
    columnFilters,
  } = props;

  const theme = useTheme(themeJSON);

  const [columns, setColumns] = React.useState<IGridColumn[]>([]);
  const [isComponentLoading, setIsLoading] = React.useState(false);
  const [columnFiltersState, setColumnFilters] = React.useState<Record<string, string | string[]>>(columnFilters ?? {});
  const [menuState, setMenuState] = React.useState<{
    target: HTMLElement;
    column: IGridColumn;
  }>();
  const [menuFilterValue, setMenuFilterValue] = React.useState<string | string[]>('');
  const [menuFilterText, setMenuFilterText] = React.useState('');
  const [menuExtraOptions, setMenuExtraOptions] = React.useState<string[]>([]);
  const [menuOptionsLoading, setMenuOptionsLoading] = React.useState(false);
  const menuOptionsTimer = React.useRef<number | undefined>(undefined);
  const liveFilterTimer = React.useRef<number | undefined>(undefined);
  const [filters, setFilters] = React.useState<GridFilterState>(searchFilters);

  React.useEffect(() => {
    if (columnFilters) {
      setColumnFilters(columnFilters);
    }
  }, [columnFilters]);

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
      invalidInputErrorMessage: 'Invalid date format.',
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

  const getLengthErrors = React.useCallback(
    (fs: GridFilterState) => {
      const address = (fs.address ?? '').trim();
      const postcode = (fs.postcode ?? '').trim();
      const summary = (fs.summaryFlag ?? '').trim();
      return {
        address: fs.searchBy === 'address' && address.length > 0 && address.length < 3 ? 'Enter at least 3 characters' : undefined,
        postcode: fs.searchBy === 'postcode' && postcode.length > 0 && postcode.length < 2 ? 'Enter at least 2 characters' : undefined,
        summaryFlag: fs.searchBy === 'summaryFlag' && summary.length > 0 && summary.length < 3 ? 'Enter at least 3 characters' : undefined,
      };
    },
    [],
  );

  // Debounced search when typing in non-UPRN text fields
  const searchTimer = React.useRef<number | undefined>(undefined);
  const scheduleSearch = React.useCallback(() => {
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
        sanitized.searchBy === 'uprn' &&
        sanitized.uprn &&
        (sanitized.uprn.length < 8 || sanitized.uprn.length > 10)
      ) {
        return;
      }
      setFilters(sanitized);
      onSearch(sanitized);
    }, 350);
  }, [filters, getLengthErrors, onSearch]);

  React.useEffect(() => () => {
    if (searchTimer.current) {
      window.clearTimeout(searchTimer.current);
    }
  }, []);

  React.useEffect(() => {
    setFilters(searchFilters);
  }, [searchFilters]);

  const searchByOptions = React.useMemo<IDropdownOption[]>(() => {
    const keys = getSearchByOptionsFor(tableKey);
    const toLabel = (k: string): string => {
      switch (k) {
        case 'uprn':
          return 'UPRN';
        case 'taskId':
          return 'Task ID';
        case 'address':
          return 'Address';
        case 'postcode':
          return 'Postcode';
        case 'billingAuthority':
          return 'Billing Authority';
        case 'transactionDate':
          return 'Transaction Date';
        case 'salePrice':
          return 'Sale Price';
        case 'ratio':
          return 'Ratio';
        case 'dwellingType':
          return 'Dwelling Type';
        case 'flaggedForReview':
          return 'Flagged for review';
        case 'reviewFlags':
          return 'Review Flags';
        case 'outlierKeySale':
          return 'Outlier / Key sale';
        case 'outlierRatio':
          return 'Outlier Ratio';
        case 'overallFlag':
          return 'Overall flag';
        case 'summaryFlag':
          return 'Summary flag';
        case 'taskStatus':
          return 'Task status';
        case 'assignedTo':
          return 'Assigned to';
        case 'assignedDate':
          return 'Assigned date';
        case 'qcAssignedTo':
          return 'QC Assigned to';
        case 'qcAssignedDate':
          return 'QC Assigned date';
        case 'completedDate':
          return 'Completed date';
        default:
          return k.charAt(0).toUpperCase() + k.slice(1);
      }
    };
    return keys.map((k) => ({ key: k, text: toLabel(k) }));
  }, [tableKey]);

  const lengthErrors = React.useMemo(() => getLengthErrors(filters), [filters, getLengthErrors]);
  const addressError = lengthErrors.address;
  const postcodeError = lengthErrors.postcode;
  const summaryFlagError = lengthErrors.summaryFlag;

  const onFieldEnter = React.useCallback(
    (ev: React.KeyboardEvent<HTMLElement>) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        const sanitized = sanitizeFilters(filters);
        const uprnInvalid = sanitized.searchBy === 'uprn' && !!sanitized.uprn && (sanitized.uprn.length < 8 || sanitized.uprn.length > 10);
        if (uprnInvalid || addressError || postcodeError || summaryFlagError) {
          return;
        }
        setFilters(sanitized);
        onSearch(sanitized);
      }
    },
    [filters, onSearch, addressError, postcodeError, summaryFlagError],
  );

  const updateFilters = React.useCallback(
    (key: keyof GridFilterState, value: GridFilterState[keyof GridFilterState]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const onSearchByChange = React.useCallback(
    (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
      if (!option) {
        return;
      }
      const selected = option.key as SearchByOption;
      setFilters((prev) => ({
        ...prev,
        searchBy: selected,
      }));
    },
    [],
  );

  const onUprnChange = React.useCallback(
    (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
      const digits = (value ?? '').replace(/\D/g, '');
      updateFilters('uprn', digits);
    },
    [updateFilters],
  );

  const onTaskIdChange = React.useCallback(
    (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
      updateFilters('taskId', value ?? '');
      scheduleSearch();
    },
    [updateFilters, scheduleSearch],
  );

  const onPostcodeChange = React.useCallback(
    (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
      updateFilters('postcode', (value ?? '').toUpperCase());
      scheduleSearch();
    },
    [updateFilters, scheduleSearch],
  );

  const onAddressChange = React.useCallback(
    (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
      updateFilters('address', value ?? '');
    },
    [updateFilters],
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

  const updateDateRange = React.useCallback(
    (key: 'transactionDate' | 'assignedDate' | 'qcAssignedDate' | 'completedDate', part: 'from' | 'to', value?: Date | null) => {
      setFilters((prev) => {
        const existing = prev[key] ?? {};
        return { ...prev, [key]: { ...existing, [part]: toISODateString(value) } };
      });
    },
    [toISODateString],
  );

  const updateMultiSelect = React.useCallback(
    (key: keyof GridFilterState, option?: IDropdownOption, limit?: number) => {
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
    (key: keyof GridFilterState, option?: IDropdownOption) => {
      setFilters((prev) => ({ ...prev, [key]: (option?.key as string) ?? undefined }));
    },
    [],
  );

  const onSummaryFlagChange = React.useCallback(
    (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
      updateFilters('summaryFlag', value ?? '');
    },
    [updateFilters],
  );

  const uprnError = React.useMemo(() => {
    if (filters.searchBy !== 'uprn' || !filters.uprn || filters.uprn.length === 0) {
      return undefined;
    }
    if (filters.uprn.length >= 8 && filters.uprn.length <= 10) {
      return undefined;
    }
    return 'UPRN must be 8 to 10 digits';
  }, [filters.searchBy, filters.uprn]);

  const isSearchDisabled = React.useMemo(
    () => !!uprnError || !!addressError || !!postcodeError || !!summaryFlagError,
    [uprnError, addressError, postcodeError, summaryFlagError],
  );

  const handleSearch = React.useCallback(() => {
    if (uprnError || addressError || postcodeError || summaryFlagError) {
      return;
    }
    const sanitized = sanitizeFilters(filters);
    if (sanitized.searchBy === 'uprn' && sanitized.uprn && (sanitized.uprn.length < 8 || sanitized.uprn.length > 10)) {
      return;
    }
    setFilters(sanitized);
    onSearch(sanitized);
  }, [addressError, filters, onSearch, postcodeError, summaryFlagError, uprnError]);

  const handleClear = React.useCallback(() => {
    const defaults = createDefaultGridFilters();
    setFilters(defaults);
    onSearch(defaults);
  }, [onSearch]);

  const showPostcodeHint = React.useMemo(() => {
    if (!filters.postcode || filters.postcode.length === 0) {
      return false;
    }
    return filters.searchBy === 'postcode' || filters.searchBy === 'address';
  }, [filters.postcode, filters.searchBy]);

  React.useEffect(() => {
    setColumns(
      datasetColumns.map((c) => {
        const lowerName = c.name.toLowerCase();
        const cfg =
          columnConfigs[lowerName] ||
          (c.alias ? columnConfigs[c.alias.toLowerCase()] : undefined) ||
          {};
        const datasetCellType = (c as { cellType?: string }).cellType;
        const sort = sorting?.find((s) => s.name === c.name);
        const visualSize =
          typeof c.visualSizeFactor === 'number' && !isNaN(c.visualSizeFactor)
            ? c.visualSizeFactor
            : 100;
        const width = typeof cfg.ColWidth === 'number' ? cfg.ColWidth : visualSize;
        const resolvedCellType = (cfg.ColCellType ?? datasetCellType)?.toLowerCase();
        const effectiveCellType = cfg.ColCellType ?? datasetCellType;
        const col: IGridColumn = {
          key: c.name,
          name: cfg.ColDisplayName ?? c.displayName,
          fieldName: c.name,
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
          columnActionsMode:
            cfg.ColSortable !== false ? ColumnActionsMode.hasDropdown : ColumnActionsMode.disabled,
          sortBy: cfg.ColSortBy,
          childColumns: [],
        };
        if (
          resolvedCellType === 'tag' ||
          resolvedCellType === 'indicatortag' ||
          resolvedCellType === 'link' ||
          resolvedCellType === 'image' ||
          resolvedCellType === 'clickableimage' ||
          resolvedCellType === 'expand'
        ) {
          col.onRender = (
            item: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord,
            _?: number,
            column?: IColumn,
          ) => (
            <GridCell item={item} column={column} onCellAction={(i) => onNavigate(i)} />
          );
        }
        return col;
      }),
    );
  }, [datasetColumns, sorting, columnConfigs, onNavigate]);

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
    setIsLoading(false);
    return mapped;
  }, [records, sortedRecordIds]);

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
      const activeFilter = !!columnFiltersState[(field ?? '').toString()];
      const sort = sorting?.find((s) => s.name === field);
      const sortIcon = sort ? (Number(sort.sortDirection) === 1 ? 'SortDown' : 'SortUp') : undefined;
      const iconName = sortIcon ?? (activeFilter ? 'Filter' : undefined);
      return { ...c, iconName } as IGridColumn;
    });
  }, [columns, columnFiltersState, sorting]);

  const filteredItems = React.useMemo(() => {
    const t0 = performance.now();
    const filterEntries = Object.entries(columnFiltersState).filter(([, value]) =>
      Array.isArray(value) ? value.length > 0 : value.trim() !== '',
    );
    if (filterEntries.length === 0) {
      const t1 = performance.now();
      console.log('[Grid Perf] Client filteredItems (no filters) (ms):', Math.round(t1 - t0), 'items:', items.length);
      return items;
    }
    const out = items.filter((item) => {
      const record = item as unknown as Record<string, unknown>;
      return filterEntries.every(([fieldName, filterValue]) => {
        const raw = record[fieldName];
        if (Array.isArray(filterValue)) {
          const needles = filterValue.map((v) => String(v).trim().toLowerCase()).filter((v) => v !== '');
          if (needles.length === 0) return true;
          if (Array.isArray(raw)) {
            const hay = raw
              .map((v) => (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? String(v).trim().toLowerCase() : ''))
              .filter((s) => s !== '');
            return needles.some((n) => hay.includes(n));
          }
          const text = getFilterableText(raw).trim().toLowerCase();
          return needles.some((n) => text === n);
        }
        const needle = filterValue.trim().toLowerCase();
        if (Array.isArray(raw)) {
          return raw.some((v) => (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') && String(v).toLowerCase().includes(needle));
        }
        const text = getFilterableText(raw).trim().toLowerCase();
        return text.includes(needle);
      });
    });
    const t1 = performance.now();
    console.log('[Grid Perf] Client filteredItems (ms):', Math.round(t1 - t0), 'items:', items.length, 'filters:', filterEntries.length, 'result:', out.length);
    return out;
  }, [columnFiltersState, getFilterableText, items]);

  const clearAllColumnFilters = React.useCallback(() => {
    setColumnFilters(() => {
      const cleared: Record<string, string | string[]> = {};
      if (onColumnFiltersChange) {
        onColumnFiltersChange(cleared);
      }
      return cleared;
    });
  }, [onColumnFiltersChange]);

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

  const scheduleLiveTextFilter = React.useCallback((fieldName: string, value: string) => {
    if (liveFilterTimer.current) {
      window.clearTimeout(liveFilterTimer.current);
    }
    liveFilterTimer.current = window.setTimeout(() => {
      setColumnFilters((prev) => {
        const updated = { ...prev };
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

  const onItemInvoked = React.useCallback(
    (item?: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord) => {
      onNavigate(item);
    },
    [onNavigate],
  );

  const handleSort = React.useCallback(
    (column: IGridColumn, descending: boolean) => {
      if (column.sortable === false) {
        return;
      }
      if (overlayOnSort) {
        setIsLoading(true);
      }
      const sortField = column.sortBy ?? column.key;
      onSort(sortField, descending);
      setMenuState(undefined);
    },
    [onSort, overlayOnSort],
  );

  const openMenuForColumn = React.useCallback(
    (gridCol: IGridColumn, target?: HTMLElement) => {
      if (!target) {
        return;
      }
      const fieldName = gridCol.fieldName ?? gridCol.key;
      const existing = columnFiltersState[fieldName];
      if (Array.isArray(existing)) {
        setMenuFilterValue(existing);
        setMenuFilterText('');
      } else {
        setMenuFilterValue(existing ?? '');
        setMenuFilterText(typeof existing === 'string' ? existing : '');
      }
      setMenuExtraOptions([]);
      setMenuOptionsLoading(false);
      setMenuState({ target, column: gridCol });
    },
    [columnFiltersState],
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
    if (!menuState) {
      return;
    }
    const fieldName = menuState.column.fieldName ?? menuState.column.key;
    setColumnFilters((prev) => {
      const updated = { ...prev };
      // If any values are selected in the list, prefer them (exact match semantics).
      if (Array.isArray(menuFilterValue)) {
        const vals = menuFilterValue.map((v) => String(v).trim()).filter((v) => v !== '');
        if (vals.length > 0) {
          updated[fieldName] = vals;
          return updated;
        }
      }
      // Otherwise, apply free‑text contains
      const trimmed = String(menuFilterText ?? '').trim();
      if (trimmed === '') {
        delete updated[fieldName];
      } else {
        updated[fieldName] = trimmed;
      }
      if (onColumnFiltersChange) {
        onColumnFiltersChange(updated);
      }
      return updated;
    });
    setMenuState(undefined);
  }, [menuFilterValue, menuFilterText, menuState, onColumnFiltersChange]);

  const clearFilter = React.useCallback(() => {
    if (!menuState) {
      return;
    }
    const fieldName = menuState.column.fieldName ?? menuState.column.key;
    setColumnFilters((prev) => {
      if (!(fieldName in prev)) {
        return prev;
      }
      const updated = { ...prev };
      delete updated[fieldName];
      if (onColumnFiltersChange) {
        onColumnFiltersChange(updated);
      }
      return updated;
    });
    const lookup = isLookupField(fieldName);
    setMenuFilterValue(lookup ? [] : '');
    setMenuFilterText('');
    setMenuState(undefined);
  }, [menuState, isLookupField, onColumnFiltersChange]);

  const menuItems = React.useMemo<IContextualMenuItem[]>(() => {
    if (!menuState) {
      return [];
    }
    const fieldName = menuState.column.fieldName ?? menuState.column.key;
    const lookup = isLookupField(fieldName);
    const baseOptions: IDropdownOption[] = getDistinctOptions([fieldName ?? '']);
    const extraOptions: IDropdownOption[] = menuExtraOptions
      .filter((v) => v && !baseOptions.some((b) => b.text.toLowerCase() === v.toLowerCase()))
      .map((v) => ({ key: v, text: v }));
    const valueOptions: IDropdownOption[] = [...baseOptions, ...extraOptions];
    const filteredValueOptions = valueOptions.filter((o) =>
      o.text.toLowerCase().includes(menuFilterText.toLowerCase()),
    );
    return [
      {
        key: 'sortAsc',
        text: 'Sort Ascending',
        iconProps: { iconName: 'SortUp' },
        onClick: () => handleSort(menuState.column, false),
      },
      {
        key: 'sortDesc',
        text: 'Sort Descending',
        iconProps: { iconName: 'SortDown' },
        onClick: () => handleSort(menuState.column, true),
      },
      {
        key: 'divider',
        itemType: ContextualMenuItemType.Divider,
      },
      {
        key: 'filterHeader',
        text: 'Filter',
        iconProps: { iconName: 'Filter' },
        disabled: true,
        style: { fontWeight: 600 },
      },
      {
        key: 'filterInput',
        onRender: () => (
          <div style={{ padding: '0 12px 12px', width: 260 }}>
            <Text variant="small" style={{ marginBottom: 4, display: 'block' }}>
              Contains
            </Text>
            {lookup ? (
              <>
                <TextField
                  placeholder={`Filter ${menuState.column.name}`}
                  value={menuFilterText}
                  onChange={(_, v) => {
                    const next = v ?? '';
                    setMenuFilterText(next);
                    if (onLoadFilterOptions && !isTextOnlyField(fieldName)) {
                      if (menuOptionsTimer.current) {
                        window.clearTimeout(menuOptionsTimer.current);
                      }
                      menuOptionsTimer.current = window.setTimeout(() => {
                        setMenuOptionsLoading(true);
                        void onLoadFilterOptions(fieldName ?? '', next)
                          .then((vals) => setMenuExtraOptions(vals ?? []))
                          .finally(() => setMenuOptionsLoading(false));
                      }, 350);
                    }
                  }}
                />
                {menuOptionsLoading && (
                  <Stack horizontal verticalAlign="center" style={{ margin: '6px 0' }}>
                    <Spinner size={SpinnerSize.small} />
                    <Text variant="small" style={{ marginLeft: 8 }}>Searching…</Text>
                  </Stack>
                )}
                <Dropdown
                  placeholder={`Select ${menuState.column.name}`}
                  options={filteredValueOptions}
                  multiSelect
                  selectedKeys={Array.isArray(menuFilterValue) ? menuFilterValue : []}
                  onChange={(_, opt) => {
                    const key = String(opt?.key ?? '');
                    setMenuFilterValue((prev) => {
                      const current = Array.isArray(prev) ? prev.slice() : [];
                      const idx = current.indexOf(key);
                      if (opt?.selected) {
                        if (idx === -1) current.push(key);
                      } else {
                        if (idx !== -1) current.splice(idx, 1);
                      }
                      return current;
                    });
                  }}
                  styles={{ dropdown: { width: '100%' } }}
                />
              </>
            ) : (
              <>
                <TextField
                  placeholder={`Filter ${menuState.column.name}`}
                  value={menuFilterText}
                  onChange={(_, v) => {
                    const next = v ?? '';
                    setMenuFilterText(next);
                    if (onLoadFilterOptions && !isTextOnlyField(fieldName)) {
                      if (menuOptionsTimer.current) {
                        window.clearTimeout(menuOptionsTimer.current);
                      }
                      menuOptionsTimer.current = window.setTimeout(() => {
                        setMenuOptionsLoading(true);
                        void onLoadFilterOptions(fieldName ?? '', next)
                          .then((vals) => setMenuExtraOptions(vals ?? []))
                          .finally(() => setMenuOptionsLoading(false));
                      }, 350);
                    }
                  }}
                />
                {menuOptionsLoading && (
                  <Stack horizontal verticalAlign="center" style={{ margin: '6px 0' }}>
                    <Spinner size={SpinnerSize.small} />
                    <Text variant="small" style={{ marginLeft: 8 }}>Searching…</Text>
                  </Stack>
                )}
                {!isTextOnlyField(fieldName) && (
                <Dropdown
                  placeholder={`Select ${menuState.column.name}`}
                  options={filteredValueOptions}
                  multiSelect
                  selectedKeys={Array.isArray(menuFilterValue) ? menuFilterValue : (menuFilterValue ? [menuFilterValue] : [])}
                  onChange={(_, opt) => {
                    const key = String(opt?.key ?? '');
                    setMenuFilterValue((prev) => {
                      const current = Array.isArray(prev) ? prev.slice() : (prev ? [String(prev)] : []);
                      const idx = current.indexOf(key);
                      if (opt?.selected) {
                        if (idx === -1) current.push(key);
                      } else {
                        if (idx !== -1) current.splice(idx, 1);
                      }
                      return current;
                    });
                  }}
                  styles={{ dropdown: { width: '100%' } }}
                />)}
              </>
            )}
            <Stack horizontal tokens={{ childrenGap: 8 }} style={{ marginTop: 8 }}>
              <PrimaryButton text="Apply" onClick={applyFilter} />
              <DefaultButton text="Clear" onClick={clearFilter} />
            </Stack>
          </div>
        ),
      },
    ];
  }, [applyFilter, clearFilter, handleSort, menuFilterValue, menuState, isLookupField, getDistinctOptions, scheduleLiveTextFilter]);

  if (datasetColumns.length === 0) {
    return <NoFields resources={resources} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <div style={{ height }}>
        {columnDatasetNotDefined && (
          <MessageBar messageBarType={MessageBarType.error} style={{ marginBottom: 16 }}>
            One or more column configurations reference fields that do not exist in the dataset.
          </MessageBar>
        )}
        {errorMessage && (
          <MessageBar messageBarType={MessageBarType.error} style={{ marginBottom: 16 }}>
            {errorMessage}
          </MessageBar>
        )}
        {showSearchPanel && (
        <Stack
          horizontal
          wrap
          verticalAlign="end"
          tokens={{ childrenGap: 16 }}
          style={{ marginBottom: 16 }}
        >
          <Stack.Item grow styles={{ root: { minWidth: 0 } }}>
            <Stack
              horizontal
              wrap
              verticalAlign="end"
              tokens={{ childrenGap: 16 }}
              styles={{ root: { rowGap: 12 } }}
            >
              <Stack.Item styles={{ root: { minWidth: 200 } }}>
                <Dropdown
                  label="Search by"
                  options={searchByOptions}
                  selectedKey={filters.searchBy}
                  onChange={onSearchByChange}
                  styles={{ dropdown: { width: '100%' } }}
                />
              </Stack.Item>
              {filters.searchBy === 'taskId' && (
                <Stack.Item styles={{ root: { minWidth: 200 } }}>
                  <TextField label="Task ID (Sale ID)" value={filters.taskId ?? ''} onChange={onTaskIdChange} />
                </Stack.Item>
              )}
              {filters.searchBy === 'uprn' && (
                <Stack.Item styles={{ root: { minWidth: 200 } }}>
                  <TextField
                    label="UPRN"
                    value={filters.uprn ?? ''}
                    onChange={onUprnChange}
                    errorMessage={uprnError}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </Stack.Item>
              )}
              {filters.searchBy === 'address' && (
                <Stack.Item styles={{ root: { minWidth: 260 } }}>
                  <TextField label="Address" value={filters.address ?? ''} onChange={onAddressChange} errorMessage={addressError} />
                </Stack.Item>
              )}
              {filters.searchBy === 'postcode' && (
                <Stack.Item styles={{ root: { minWidth: 160 } }}>
                  <TextField label="Post code" value={filters.postcode ?? ''} onChange={onPostcodeChange} errorMessage={postcodeError} />
                  {showPostcodeHint && (
                    <Text variant="small" styles={{ root: { marginTop: 4 } }}>
                      Partial postcodes return all matching entries.
                    </Text>
                  )}
                </Stack.Item>
              )}
              {filters.searchBy === 'billingAuthority' && (
                <Stack.Item styles={{ root: { minWidth: 220 } }}>
                  <Dropdown
                    label="Billing Authority"
                    multiSelect
                    options={getDistinctOptions(['billingauthority'])}
                    selectedKeys={filters.billingAuthority ?? []}
                    onChange={(_, opt) => updateMultiSelect('billingAuthority', opt, 3)}
                    styles={{ dropdown: { width: '100%' } }}
                  />
                </Stack.Item>
              )}
              {filters.searchBy === 'transactionDate' && (
                <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
                  <Stack.Item styles={{ root: { minWidth: 160 } }}>
                    <DatePicker
                      label="Start date"
                      firstDayOfWeek={DayOfWeek.Monday}
                      strings={dateStrings}
                      value={parseISODate(filters.transactionDate?.from)}
                      formatDate={formatDisplayDate}
                      onSelectDate={(d) => updateDateRange('transactionDate', 'from', d)}
                    />
                  </Stack.Item>
                  <Stack.Item styles={{ root: { minWidth: 160 } }}>
                    <DatePicker
                      label="End date"
                      firstDayOfWeek={DayOfWeek.Monday}
                      strings={dateStrings}
                      value={parseISODate(filters.transactionDate?.to)}
                      formatDate={formatDisplayDate}
                      onSelectDate={(d) => updateDateRange('transactionDate', 'to', d)}
                    />
                  </Stack.Item>
                </Stack>
              )}
              {isNumericFilterKey(filters.searchBy) && (
                <Stack horizontal wrap tokens={{ childrenGap: 8 }}>
                  {(() => {
                    const numericKey = filters.searchBy;
                    const numericFilter = filters[numericKey] ?? { mode: '>=' };
                    const mode = numericFilter.mode ?? '>=';
                    const minValue = mode === '<=' ? numericFilter.max : numericFilter.min;
                    const maxValue = numericFilter.max;
                    return (
                      <>
                      <Stack.Item styles={{ root: { minWidth: 140 } }}>
                        <Dropdown
                          label="Mode"
                          options={[
                            { key: '>=', text: '>=' },
                            { key: '<=', text: '<=' },
                            { key: 'between', text: 'Between' },
                          ]}
                          selectedKey={mode}
                          onChange={(_, o) =>
                            updateNumericFilter(
                              numericKey,
                              'mode',
                              typeof o?.key === 'string' ? o.key : mode,
                            )
                          }
                        />
                      </Stack.Item>
                      <Stack.Item styles={{ root: { minWidth: 140 } }}>
                        <TextField
                          label={mode === '<=' ? 'Max' : 'Min'}
                          type="number"
                          value={String(minValue ?? '')}
                          onChange={(_, v) => updateNumericFilter(numericKey, mode === '<=' ? 'max' : 'min', v ?? '')}
                        />
                      </Stack.Item>
                      {mode === 'between' && (
                        <Stack.Item styles={{ root: { minWidth: 140 } }}>
                          <TextField
                            label="Max"
                            type="number"
                            value={String(maxValue ?? '')}
                            onChange={(_, v) => updateNumericFilter(numericKey, 'max', v ?? '')}
                          />
                        </Stack.Item>
                      )}
                      </>
                    );
                  })()}
                </Stack>
              )}
              {filters.searchBy === 'dwellingType' && (
                <Stack.Item styles={{ root: { minWidth: 200 } }}>
                  <Dropdown
                    label="Dwelling Type"
                    multiSelect
                    options={[{ key: 'all', text: 'Select all' }, ...getDistinctOptions(['dwellingtype'])]}
                    selectedKeys={filters.dwellingType ?? []}
                    onChange={(_, opt) => {
                      if (!opt) return;
                      if (opt.key === 'all') {
                        updateFilters('dwellingType', getDistinctOptions(['dwellingtype']).map((o) => String(o.key)));
                        return;
                      }
                      updateMultiSelect('dwellingType', opt);
                    }}
                    styles={{ dropdown: { width: '100%' } }}
                  />
                </Stack.Item>
              )}
              {filters.searchBy === 'flaggedForReview' && (
                <Stack.Item styles={{ root: { minWidth: 160 } }}>
                  <Dropdown
                    label="Flagged for review"
                    options={[
                      { key: 'yes', text: 'Yes' },
                      { key: 'no', text: 'No' },
                    ]}
                    selectedKey={filters.flaggedForReview}
                    onChange={(_, opt) => updateSingleSelect('flaggedForReview', opt)}
                  />
                </Stack.Item>
              )}
              {filters.searchBy === 'reviewFlags' && (
                <Stack.Item styles={{ root: { minWidth: 200 } }}>
                  <Dropdown
                    label="Review Flags"
                    multiSelect
                    options={[{ key: 'all', text: 'Select all' }, ...getDistinctOptions(['reviewflags'])]}
                    selectedKeys={filters.reviewFlags ?? []}
                    onChange={(_, opt) => {
                      if (!opt) return;
                      if (opt.key === 'all') {
                        updateFilters('reviewFlags', getDistinctOptions(['reviewflags']).map((o) => String(o.key)));
                        return;
                      }
                      updateMultiSelect('reviewFlags', opt);
                    }}
                    styles={{ dropdown: { width: '100%' } }}
                  />
                </Stack.Item>
              )}
              {filters.searchBy === 'outlierKeySale' && (
                <Stack.Item styles={{ root: { minWidth: 200 } }}>
                  <Dropdown
                    label="Outlier / Key sale"
                    multiSelect
                    options={[
                      { key: 'all', text: 'Select all' },
                      { key: 'Outlier', text: 'Outlier' },
                      { key: 'Key sale', text: 'Key sale' },
                    ]}
                    selectedKeys={filters.outlierKeySale ?? []}
                    onChange={(_, opt) => {
                      if (!opt) return;
                      if (opt.key === 'all') {
                        updateFilters('outlierKeySale', ['Outlier', 'Key sale']);
                        return;
                      }
                      updateMultiSelect('outlierKeySale', opt);
                    }}
                  />
                </Stack.Item>
              )}
              {filters.searchBy === 'overallFlag' && (
                <Stack.Item styles={{ root: { minWidth: 220 } }}>
                  <Dropdown
                    label="Overall flag"
                    multiSelect
                    options={[
                      { key: 'all', text: 'Select all' },
                      { key: 'Exclude', text: 'Exclude' },
                      { key: 'Exclude potential false', text: 'Exclude potential false' },
                      { key: 'Investigate can use', text: 'Investigate can use' },
                      { key: 'Investigate do not use', text: 'Investigate do not use' },
                      { key: 'No flag', text: 'No flag' },
                      { key: 'Not fully HPI adjusted', text: 'Not fully HPI adjusted' },
                      { key: 'Remove', text: 'Remove' },
                    ]}
                    selectedKeys={filters.overallFlag ?? []}
                    onChange={(_, opt) => {
                      if (!opt) return;
                      if (opt.key === 'all') {
                        updateFilters('overallFlag', [
                          'Exclude',
                          'Exclude potential false',
                          'Investigate can use',
                          'Investigate do not use',
                          'No flag',
                          'Not fully HPI adjusted',
                          'Remove',
                        ]);
                        return;
                      }
                      updateMultiSelect('overallFlag', opt);
                    }}
                  />
                </Stack.Item>
              )}
              {filters.searchBy === 'summaryFlag' && (
                <Stack.Item styles={{ root: { minWidth: 200 } }}>
                  <TextField label="Summary flag" value={filters.summaryFlag ?? ''} onChange={onSummaryFlagChange} errorMessage={summaryFlagError} />
                </Stack.Item>
              )}
              {filters.searchBy === 'taskStatus' && (
                <Stack.Item styles={{ root: { minWidth: 200 } }}>
                  <Dropdown
                    label="Task status"
                    multiSelect
                    options={[{ key: 'all', text: 'Select all' }, ...getDistinctOptions(['taskstatus', 'status', 'statuscode'])]}
                    selectedKeys={filters.taskStatus ?? []}
                    onChange={(_, opt) => {
                      if (!opt) return;
                      if (opt.key === 'all') {
                        updateFilters('taskStatus', getDistinctOptions(['taskstatus', 'status', 'statuscode']).map((o) => String(o.key)));
                        return;
                      }
                      updateMultiSelect('taskStatus', opt);
                    }}
                  />
                </Stack.Item>
              )}
              {filters.searchBy === 'assignedTo' && (
                <Stack.Item styles={{ root: { minWidth: 200 } }}>
                  <Dropdown
                    label="Assigned to"
                    options={getDistinctOptions(['assignedto'])}
                    selectedKey={filters.assignedTo}
                    onChange={(_, opt) => updateSingleSelect('assignedTo', opt)}
                  />
                </Stack.Item>
              )}
              {filters.searchBy === 'assignedDate' && (
                <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
                  <Stack.Item styles={{ root: { minWidth: 160 } }}>
                    <DatePicker
                      label="Assigned start"
                      firstDayOfWeek={DayOfWeek.Monday}
                      strings={dateStrings}
                      value={parseISODate(filters.assignedDate?.from)}
                      formatDate={formatDisplayDate}
                      onSelectDate={(d) => updateDateRange('assignedDate', 'from', d)}
                    />
                  </Stack.Item>
                  <Stack.Item styles={{ root: { minWidth: 160 } }}>
                    <DatePicker
                      label="Assigned end"
                      firstDayOfWeek={DayOfWeek.Monday}
                      strings={dateStrings}
                      value={parseISODate(filters.assignedDate?.to)}
                      formatDate={formatDisplayDate}
                      onSelectDate={(d) => updateDateRange('assignedDate', 'to', d)}
                    />
                  </Stack.Item>
                </Stack>
              )}
              {filters.searchBy === 'qcAssignedTo' && (
                <Stack.Item styles={{ root: { minWidth: 200 } }}>
                  <Dropdown
                    label="QC Assigned to"
                    options={getDistinctOptions(['qcassignedto'])}
                    selectedKey={filters.qcAssignedTo}
                    onChange={(_, opt) => updateSingleSelect('qcAssignedTo', opt)}
                  />
                </Stack.Item>
              )}
              {filters.searchBy === 'qcAssignedDate' && (
                <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
                  <Stack.Item styles={{ root: { minWidth: 160 } }}>
                    <DatePicker
                      label="QC Assigned start"
                      firstDayOfWeek={DayOfWeek.Monday}
                      strings={dateStrings}
                      value={parseISODate(filters.qcAssignedDate?.from)}
                      formatDate={formatDisplayDate}
                      onSelectDate={(d) => updateDateRange('qcAssignedDate', 'from', d)}
                    />
                  </Stack.Item>
                  <Stack.Item styles={{ root: { minWidth: 160 } }}>
                    <DatePicker
                      label="QC Assigned end"
                      firstDayOfWeek={DayOfWeek.Monday}
                      strings={dateStrings}
                      value={parseISODate(filters.qcAssignedDate?.to)}
                      formatDate={formatDisplayDate}
                      onSelectDate={(d) => updateDateRange('qcAssignedDate', 'to', d)}
                    />
                  </Stack.Item>
                </Stack>
              )}
              {filters.searchBy === 'completedDate' && (
                <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
                  <Stack.Item styles={{ root: { minWidth: 160 } }}>
                    <DatePicker
                      label="Completed start"
                      firstDayOfWeek={DayOfWeek.Monday}
                      strings={dateStrings}
                      value={parseISODate(filters.completedDate?.from)}
                      formatDate={formatDisplayDate}
                      onSelectDate={(d) => updateDateRange('completedDate', 'from', d)}
                    />
                  </Stack.Item>
                  <Stack.Item styles={{ root: { minWidth: 160 } }}>
                    <DatePicker
                      label="Completed end"
                      firstDayOfWeek={DayOfWeek.Monday}
                      strings={dateStrings}
                      value={parseISODate(filters.completedDate?.to)}
                      formatDate={formatDisplayDate}
                      onSelectDate={(d) => updateDateRange('completedDate', 'to', d)}
                    />
                  </Stack.Item>
                </Stack>
              )}
            </Stack>
          </Stack.Item>
          <Stack.Item styles={{ root: { display: 'flex', alignItems: 'flex-end' } }}>
            <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }}>
              {(shimmer || itemsLoading || isComponentLoading) && (
                <Spinner size={SpinnerSize.small} ariaLabel="Loading filter results" />
              )}
              <PrimaryButton text="Search" onClick={handleSearch} disabled={isSearchDisabled} />
              <Link
                onClick={(ev) => {
                  ev.preventDefault();
                  handleClear();
                }}
                aria-label="Clear all filters"
                styles={{ root: { fontSize: 14 } }}
              >
                Clear all
              </Link>
            </Stack>
          </Stack.Item>
        </Stack>
        )}
        {showResults && (
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }} style={{ margin: '4px 0 8px 0' }}>
            <Text variant="medium" styles={{ root: { fontWeight: 600 } }}>
              {selectedCount} selected of {typeof taskCount === 'number' ? taskCount : filteredItems.length}
            </Text>
              <DefaultButton
                text="Clear filters"
                iconProps={{ iconName: 'ClearFilter' }}
                onClick={() => clearAllColumnFilters()}
                disabled={Object.keys(columnFiltersState).length === 0}
                styles={{ root: { height: 28 } }}
              />
          </Stack>
        )}
        {showResults && (
        <ShimmeredDetailsList
          className={ClassNames.PowerCATFluentDetailsList}
          componentRef={componentRef}
          items={filteredItems}
          columns={columnsWithIcons}
          setKey="grid"
          enableShimmer={itemsLoading || shimmer}
          selectionMode={selectionType}
          selection={selection}
          checkboxVisibility={selectionType === SelectionMode.none ? CheckboxVisibility.hidden : CheckboxVisibility.always}
          onColumnHeaderClick={onColumnHeaderClick}
          onColumnHeaderContextMenu={onColumnHeaderContextMenu}
          onItemInvoked={onItemInvoked}
          columnReorderOptions={props.allowColumnReorder ? columnReorderOptions : undefined}
          compact={compact}
          isHeaderVisible={isHeaderVisible}
        />)}
        {showResults && menuState && (
          <ContextualMenu
            target={menuState.target}
            items={menuItems}
            onDismiss={() => setMenuState(undefined)}
            directionalHint={DirectionalHint.bottomLeftEdge}
            calloutProps={{ setInitialFocus: true }}
          />
        )}
        {showResults && (itemsLoading || isComponentLoading) && <Overlay />}
        {showResults && (
        <Stack
          horizontal
          tokens={{ childrenGap: 8 }}
          style={{ marginTop: 8 }}
          verticalAlign="center"
        >
          <DefaultButton
            text="Previous"
            onClick={onPrevPage}
            disabled={!canPrev}
            styles={{ root: { height: 32, padding: '0 8px' } }}
          />
          {Array.from({ length: totalPages }, (_, i) => (
            <Text
              key={`page-${i}`}
              style={{
                cursor: 'pointer',
                fontWeight: i === currentPage ? 600 : undefined,
                fontSize: 14,
              }}
              onClick={() => (i === currentPage ? undefined : onSetPage(i))}
            >
              {i + 1}
            </Text>
          ))}
          <DefaultButton
            text="Next"
            onClick={onNextPage}
            disabled={!canNext}
            styles={{ root: { height: 32, padding: '0 8px' } }}
          />
        </Stack>
        )}
      </div>
    </ThemeProvider>
  );
});

Grid.displayName = 'Grid';

