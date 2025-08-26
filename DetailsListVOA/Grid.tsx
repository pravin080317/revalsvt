/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-redundant-type-constituents, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import {
  CheckboxVisibility,
  createTheme,
  IColumn,
  IDetailsList,
  IObjectWithKey,
  IRefObject,
  ISelection,
  IPartialTheme,
  SelectionMode,
  ShimmeredDetailsList,
  ThemeProvider,
  TextField,
  Stack,
  Text,
  DefaultButton,
} from '@fluentui/react';
import * as React from 'react';
import { NoFields } from './NoFields';
import { RecordsColumns } from './ManifestConstants';

type DataSet = ComponentFramework.PropertyHelper.DataSetApi.EntityRecord & IObjectWithKey;

export interface GridProps {
  height?: number;
  datasetColumns: ComponentFramework.PropertyHelper.DataSetApi.Column[];
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
  onSearch: (text: string) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  onSetPage: (page: number) => void;
  currentPage: number;
  totalPages: number;
  canNext: boolean;
  canPrev: boolean;
  searchText?: string;
  onUpdateColumnDisplayName: (name: string, displayName: string) => void;
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
    searchText,
    onUpdateColumnDisplayName,
  } = props;

  const theme = useTheme(themeJSON);

  const columns = React.useMemo<IColumn[]>(
    () =>
      datasetColumns.map((c) => {
        const sort = sorting.find((s) => s.name === c.name);
        const visualSize =
          typeof c.visualSizeFactor === 'number' && !isNaN(c.visualSizeFactor)
            ? c.visualSizeFactor
            : 100;
        return {
          key: c.name,
          name: c.displayName,
          fieldName: c.name,
          minWidth: visualSize,
          isResizable: true,
          isSorted: !!sort,
          isSortedDescending: sort ? Number(sort.sortDirection) === 1 : undefined,
        } as IColumn;
      }),
    [datasetColumns, sorting],
  );

  const items = React.useMemo<DataSet[]>(() => {
    return sortedRecordIds.map((id) => {
      const record = records[id];
      (record as DataSet).key = getRecordKey(record);
      return record as DataSet;
    });
  }, [records, sortedRecordIds]);

  const onItemInvoked = React.useCallback(
    (item?: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord) => {
      onNavigate(item);
    },
    [onNavigate],
  );

  const onColumnHeaderClick = React.useCallback(
    (ev?: React.MouseEvent<HTMLElement>, column?: IColumn) => {
      if (column) {
        onSort(column.key, column.isSorted ? !column.isSortedDescending : false);
      }
    },
    [onSort],
  );

  if (columnDatasetNotDefined || datasetColumns.length === 0) {
    return <NoFields resources={resources} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <div style={{ height }}>
        <Stack tokens={{ childrenGap: 8 }}>
          {datasetColumns.map((col) => (
            <TextField
              key={col.name}
              label={`${col.name} Display Name`}
              value={col.displayName}
              onChange={(_, v) => onUpdateColumnDisplayName(col.name, v ?? '')}
            />
          ))}
        </Stack>
        <TextField
          placeholder="Search"
          value={searchText}
          onChange={(_, v) => onSearch(v ?? '')}
          style={{ marginBottom: 16 }}
        />
        <ShimmeredDetailsList
          componentRef={componentRef}
          items={items}
          columns={columns}
          setKey="grid"
          enableShimmer={itemsLoading || shimmer}
          selectionMode={selectionType}
          selection={selection}
          checkboxVisibility={CheckboxVisibility.hidden}
          onColumnHeaderClick={onColumnHeaderClick}
          onItemInvoked={onItemInvoked}
          compact={compact}
          isHeaderVisible={isHeaderVisible}
        />
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
              key={i}
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
      </div>
    </ThemeProvider>
  );
});

Grid.displayName = 'Grid';

