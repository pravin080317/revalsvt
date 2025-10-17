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
  Spinner,
  SpinnerSize,
  Link,
} from '@fluentui/react';
import * as React from 'react';
import { NoFields } from './NoFields';
import { RecordsColumns } from './ManifestConstants';
import { IGridColumn, ColumnConfig } from './Component.types';
import { GridCell } from './GridCell';
import { ClassNames } from './Grid.styles';
import {
  GridFilterState,
  createDefaultGridFilters,
  sanitizeFilters,
  SearchByOption,
  ManualCheckFilter,
} from './Filters';

type DataSet = ComponentFramework.PropertyHelper.DataSetApi.EntityRecord & IObjectWithKey;

export interface GridProps {
  height?: number;
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
  return typeof customKey === 'string' ? customKey : record.getRecordId();
}

export const Grid = React.memo((props: GridProps) => {
  const {
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
  } = props;

  const theme = useTheme(themeJSON);

  const [columns, setColumns] = React.useState<IGridColumn[]>([]);
  const [isComponentLoading, setIsLoading] = React.useState(false);
  const [columnFilters, setColumnFilters] = React.useState<Record<string, string>>({});
  const [menuState, setMenuState] = React.useState<{
    target: HTMLElement;
    column: IGridColumn;
  }>();
  const [menuFilterValue, setMenuFilterValue] = React.useState('');
  const [filters, setFilters] = React.useState<GridFilterState>(searchFilters);

  React.useEffect(() => {
    setFilters(searchFilters);
  }, [searchFilters]);

  const searchByOptions = React.useMemo<IDropdownOption[]>(
    () => [
      { key: 'uprn', text: 'UPRN' },
      { key: 'taskId', text: 'Task ID' },
      { key: 'address', text: 'Address' },
      { key: 'manualCheck', text: 'Manual Check' },
      { key: 'postcode', text: 'Postcode' },
    ],
    [],
  );

  const manualCheckOptions = React.useMemo<IDropdownOption[]>(
    () => [
      { key: 'all', text: 'All' },
      { key: 'yes', text: 'Yes' },
      { key: 'no', text: 'No' },
    ],
    [],
  );

  const onFieldEnter = React.useCallback(
    (ev: React.KeyboardEvent<HTMLElement>) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        const sanitized = sanitizeFilters(filters);
        const uprnInvalid = sanitized.searchBy === 'uprn' && !!sanitized.uprn && (sanitized.uprn.length < 8 || sanitized.uprn.length > 10);
        if (!uprnInvalid) {
          setFilters(sanitized);
          onSearch(sanitized);
        }
      }
    },
    [filters, onSearch],
  );

  const updateFilters = React.useCallback(
    (key: keyof GridFilterState, value: GridFilterState[keyof GridFilterState]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // No ref needed; use TextField inputProps to set native attributes

  const onSearchByChange = React.useCallback(
    (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
      if (!option) {
        return;
      }
      const selected = option.key as SearchByOption;
      setFilters((prev) => ({
        ...prev,
        searchBy: selected,
        manualCheck: prev.manualCheck ?? 'all',
      }));
    },
    [],
  );

  const onManualCheckChange = React.useCallback(
    (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
      if (!option) {
        return;
      }
      updateFilters('manualCheck', option.key as ManualCheckFilter);
    },
    [updateFilters],
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
    },
    [updateFilters],
  );

  const onBuildingNameChange = React.useCallback(
    (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
      updateFilters('buildingNameNumber', value ?? '');
    },
    [updateFilters],
  );

  const onStreetChange = React.useCallback(
    (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
      updateFilters('street', value ?? '');
    },
    [updateFilters],
  );

  const onTownChange = React.useCallback(
    (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
      updateFilters('townCity', value ?? '');
    },
    [updateFilters],
  );

  const onPostcodeChange = React.useCallback(
    (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
      updateFilters('postcode', (value ?? '').toUpperCase());
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

  const isSearchDisabled = React.useMemo(() => !!uprnError, [uprnError]);

  const handleSearch = React.useCallback(() => {
    const sanitized = sanitizeFilters(filters);
    if (sanitized.searchBy === 'uprn' && sanitized.uprn && (sanitized.uprn.length < 8 || sanitized.uprn.length > 10)) {
      return;
    }
    setFilters(sanitized);
    onSearch(sanitized);
  }, [filters, onSearch]);

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
        const cfg =
          columnConfigs[c.name.toLowerCase()] ||
          (c.alias ? columnConfigs[c.alias.toLowerCase()] : undefined) ||
          {};
        const sort = sorting?.find((s) => s.name === c.name);
        const visualSize =
          typeof c.visualSizeFactor === 'number' && !isNaN(c.visualSizeFactor)
            ? c.visualSizeFactor
            : 100;
        const width = typeof cfg.ColWidth === 'number' ? cfg.ColWidth : visualSize;
        const cellType = cfg.ColCellType?.toLowerCase();
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
          cellType: cfg.ColCellType,
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
        if (cellType === 'tag' || cellType === 'indicatortag') {
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
    if (typeof raw === 'string') {
      return raw;
    }
    if (typeof raw === 'number' || typeof raw === 'boolean') {
      return raw.toString();
    }
    return '';
  }, []);

  const filteredItems = React.useMemo(() => {
    const filterEntries = Object.entries(columnFilters).filter(([, value]) => value.trim() !== '');
    if (filterEntries.length === 0) {
      return items;
    }
    return items.filter((item) => {
      const record = item as unknown as Record<string, unknown>;
      return filterEntries.every(([fieldName, filterValue]) => {
        const raw = record[fieldName];
        const text = getFilterableText(raw).trim().toLowerCase();
        return text === filterValue.trim().toLowerCase();
      });
    });
  }, [columnFilters, getFilterableText, items]);

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
      setMenuFilterValue(columnFilters[fieldName] ?? '');
      setMenuState({ target, column: gridCol });
    },
    [columnFilters],
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
      const trimmed = menuFilterValue.trim();
      if (trimmed === '') {
        delete updated[fieldName];
      } else {
        updated[fieldName] = trimmed;
      }
      return updated;
    });
    setMenuState(undefined);
  }, [menuFilterValue, menuState]);

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
      return updated;
    });
    setMenuFilterValue('');
    setMenuState(undefined);
  }, [menuState]);

  const menuItems = React.useMemo<IContextualMenuItem[]>(() => {
    if (!menuState) {
      return [];
    }
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
        disabled: true,
        style: { fontWeight: 600 },
      },
      {
        key: 'filterInput',
        onRender: () => (
          <div style={{ padding: '0 12px 12px', width: 220 }}>
            <Text variant="small" style={{ marginBottom: 4, display: 'block' }}>
              Equal to
            </Text>
            <TextField
              placeholder={`Filter ${menuState.column.name}`}
              value={menuFilterValue}
              onChange={(_, value) => setMenuFilterValue(value ?? '')}
            />
            <Stack horizontal tokens={{ childrenGap: 8 }} style={{ marginTop: 8 }}>
              <PrimaryButton text="Apply" onClick={applyFilter} />
              <DefaultButton text="Clear" onClick={clearFilter} />
            </Stack>
          </div>
        ),
      },
    ];
  }, [applyFilter, clearFilter, handleSort, menuFilterValue, menuState]);

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
              {filters.searchBy === 'uprn' && (
                <Stack.Item styles={{ root: { minWidth: 200 } }}>
                  <TextField
                    label="UPRN"
                    value={filters.uprn ?? ''}
                    onChange={onUprnChange}
                    onKeyDown={onFieldEnter}
                    errorMessage={uprnError}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </Stack.Item>
              )}
              {filters.searchBy === 'taskId' && (
                <Stack.Item styles={{ root: { minWidth: 200 } }}>
                  <TextField
                    label="Task ID"
                    value={filters.taskId ?? ''}
                    onChange={onTaskIdChange}
                    onKeyDown={onFieldEnter}
                  />
                </Stack.Item>
              )}
              {filters.searchBy === 'manualCheck' && (
                <Stack.Item styles={{ root: { minWidth: 180 } }}>
                  <Dropdown
                    label="Manual check"
                    options={manualCheckOptions}
                    selectedKey={filters.manualCheck ?? 'all'}
                    onChange={onManualCheckChange}
                    styles={{ dropdown: { width: '100%' } }}
                  />
                </Stack.Item>
              )}
              {filters.searchBy === 'address' && (
                <>
                  <Stack.Item styles={{ root: { minWidth: 200 } }}>
                    <TextField
                      label="Building name/number"
                      value={filters.buildingNameNumber ?? ''}
                      onChange={onBuildingNameChange}
                      onKeyDown={onFieldEnter}
                    />
                  </Stack.Item>
                  <Stack.Item styles={{ root: { minWidth: 200 } }}>
                    <TextField
                      label="Street"
                      value={filters.street ?? ''}
                      onChange={onStreetChange}
                      onKeyDown={onFieldEnter}
                    />
                  </Stack.Item>
                  <Stack.Item styles={{ root: { minWidth: 200 } }}>
                    <TextField
                      label="Town or city"
                      value={filters.townCity ?? ''}
                      onChange={onTownChange}
                      onKeyDown={onFieldEnter}
                    />
                  </Stack.Item>
                  <Stack.Item styles={{ root: { minWidth: 160 } }}>
                    <TextField
                      label="Postcode"
                      value={filters.postcode ?? ''}
                      onChange={onPostcodeChange}
                      onKeyDown={onFieldEnter}
                    />
                    {showPostcodeHint && (
                      <Text variant="small" styles={{ root: { marginTop: 4 } }}>
                        Partial postcodes return all matching entries.
                      </Text>
                    )}
                  </Stack.Item>
                </>
              )}
              {filters.searchBy === 'postcode' && (
                <Stack.Item styles={{ root: { minWidth: 160 } }}>
                  <TextField
                    label="Postcode"
                    value={filters.postcode ?? ''}
                    onChange={onPostcodeChange}
                    onKeyDown={onFieldEnter}
                  />
                  {showPostcodeHint && (
                    <Text variant="small" styles={{ root: { marginTop: 4 } }}>
                      Partial postcodes return all matching entries.
                    </Text>
                  )}
                </Stack.Item>
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
        {showResults && (
        <ShimmeredDetailsList
          className={ClassNames.PowerCATFluentDetailsList}
          componentRef={componentRef}
          items={filteredItems}
          columns={columns}
          setKey="grid"
          enableShimmer={itemsLoading || shimmer}
          selectionMode={selectionType}
          selection={selection}
          checkboxVisibility={CheckboxVisibility.hidden}
          onColumnHeaderClick={onColumnHeaderClick}
          onColumnHeaderContextMenu={onColumnHeaderContextMenu}
          onItemInvoked={onItemInvoked}
          columnReorderOptions={columnReorderOptions}
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

