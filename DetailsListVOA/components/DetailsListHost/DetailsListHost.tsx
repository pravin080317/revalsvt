import * as React from 'react';
import { Selection, SelectionMode, IDetailsList, IObjectWithKey } from '@fluentui/react';
import { Grid, GridProps } from '../../Grid';
import { PCFContext } from '../context/PCFContext';
import { ColumnConfig } from '../../Component.types';
import { GridFilterState, createDefaultGridFilters, sanitizeFilters } from '../../Filters';
import { getProfileConfigs } from '../../ColumnProfiles';
import { fetchFilterOptions } from '../../services/DataService';
import { buildColumns } from '../../utils/ColumnsBuilder';
import { ensureSampleColumns, buildSampleEntityRecords } from '../../utils/SampleHelpers';
import { loadGridData } from '../../services/GridDataController';
import { IInputs } from '../../generated/ManifestTypes';

export interface DetailsListHostProps {
  context: ComponentFramework.Context<IInputs>;
  onRowInvoke?: (args: { taskId?: string; saleId?: string }) => void;
}

export const DetailsListHost: React.FC<DetailsListHostProps> = ({ context, onRowInvoke }) => {
  // Parse basic params
  const pageSize = (context.parameters as unknown as Record<string, { raw?: number }>).pageSize?.raw ?? 10;
  const navigationTarget = (context.parameters as unknown as Record<string, { raw?: string }>).navigationTarget?.raw ?? '';
  const canvasScreenName = (context.parameters as unknown as Record<string, { raw?: string }>).canvasScreenName?.raw?.trim() ?? '';
  let tableKey = 'sales';
  try {
    const raw = (context.parameters as unknown as Record<string, { raw?: string }>).tableKey?.raw;
    tableKey = raw?.trim()?.toLowerCase() ?? 'sales';
  } catch {
    tableKey = 'sales';
  }

  // Column display names and configs
  const [columnDisplayNames, setColumnDisplayNames] = React.useState<Record<string, string>>({});
  const [columnConfigs, setColumnConfigs] = React.useState<Record<string, ColumnConfig>>({});

  React.useEffect(() => {
    const raw = (context.parameters as unknown as Record<string, { raw?: string }>).columnDisplayNames?.raw?.trim() ?? '{}';
    try {
      const parsed = JSON.parse(raw) as Record<string, string>;
      const map: Record<string, string> = {};
      Object.keys(parsed).forEach((k) => (map[k.toLowerCase()] = parsed[k]));
      setColumnDisplayNames(map);
    } catch {
      setColumnDisplayNames({});
    }
  }, [context]);

  React.useEffect(() => {
    const raw = (context.parameters as unknown as Record<string, { raw?: string }>).columnConfig?.raw?.trim() ?? '[]';
    try {
      const fromProfile = getProfileConfigs((context.parameters as unknown as Record<string, { raw?: string }>).columnConfigProfile?.raw?.trim()?.toLowerCase());
      const fromJson = JSON.parse(raw) as ColumnConfig[];
      const merged = [...fromProfile, ...fromJson];
      const map: Record<string, ColumnConfig> = {};
      merged.forEach((c) => {
        const n = c.ColName?.trim().toLowerCase();
        if (n) map[n] = c;
      });
      // Ensure multi-value flags render as tags by default
      if (!map.summaryflags) {
        map.summaryflags = { ColName: 'summaryflags', ColCellType: 'tag' } as ColumnConfig;
      }
      if (!map.reviewflags) {
        map.reviewflags = { ColName: 'reviewflags', ColCellType: 'tag' } as ColumnConfig;
      }
      setColumnConfigs(map);
    } catch {
      setColumnConfigs({});
    }
  }, [context]);

  // State
  const [currentPage, setCurrentPage] = React.useState(0);
  const [headerFilters, setHeaderFilters] = React.useState<Record<string, string | string[]>>({});
  const [clientSort, setClientSort] = React.useState<{ name: string; sortDirection: number } | undefined>({ name: 'saleid', sortDirection: 0 });
  const [searchFilters, setSearchFilters] = React.useState<GridFilterState>({ ...createDefaultGridFilters(), searchBy: 'taskStatus', taskStatus: 'New' });
  const [apimItems, setApimItems] = React.useState<unknown[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [serverDriven, setServerDriven] = React.useState(false);
  const [apimLoading, setApimLoading] = React.useState(false);
  const [hasLoadedApim, setHasLoadedApim] = React.useState(false);

  // Build columns (includes auto-add from API item)
  const datasetColumns = React.useMemo(() => {
    const sampleFromApi = hasLoadedApim && apimItems.length > 0 ? (apimItems[0] as Record<string, unknown>) : undefined;
    return buildColumns(columnDisplayNames, columnConfigs, sampleFromApi);
  }, [apimItems, columnConfigs, columnDisplayNames, hasLoadedApim]);

  // Records mapping
  const { records, ids } = React.useMemo(() => {
    const recs: Record<string, ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> = {};
    const all: string[] = [];
    const toText = (v: unknown) => (typeof v === 'string' ? v : typeof v === 'number' || typeof v === 'boolean' ? String(v) : '');
    if (hasLoadedApim && apimItems.length > 0) {
      apimItems.forEach((item, index) => {
        const base: Record<string, unknown> = {};
        const r = base as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord & Record<string, unknown>;
        const obj = item as Record<string, unknown>;
        const uprnVal = obj.uprn;
        const uprnStr = typeof uprnVal === 'string' || typeof uprnVal === 'number' ? String(uprnVal) : '';
        const id = (obj.taskId as string) || `${uprnStr}-${index}` || `apim-${index}`;
        r.getRecordId = () => id;
        r.getNamedReference = undefined as unknown as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord['getNamedReference'];
        r.getValue = ((columnName: string) => r[columnName] ?? '') as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord['getValue'];
        r.getFormattedValue = ((columnName: string) => toText(r[columnName])) as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord['getFormattedValue'];
        Object.keys(obj).forEach((k) => (r[k.toLowerCase()] = obj[k]));
        // some handy aliases
        r.saleid = r.saleid ?? (r as Record<string, unknown> & { saleId?: unknown }).saleId;
        all.push(id);
        recs[id] = r;
      });
    } else {
      ensureSampleColumns(datasetColumns, columnDisplayNames);
      const sample = buildSampleEntityRecords();
      Object.assign(recs, sample.records);
      all.push(...sample.ids);
    }
    return { records: recs, ids: all };
  }, [apimItems, columnDisplayNames, datasetColumns, hasLoadedApim]);

  const filteredIds = React.useMemo(() => {
    const ds = datasetColumns;
    const toText = (val: unknown): string => (typeof val === 'string' ? val : typeof val === 'number' || typeof val === 'boolean' ? String(val) : '');
    const entries = Object.entries(headerFilters).filter(([, v]) => (Array.isArray(v) ? v.length > 0 : (v ?? '').toString().trim() !== ''));
    if (entries.length === 0) return ids;
    return ids.filter((id) => {
      const rec = records[id] as unknown as Record<string, unknown>;
      return entries.every(([field, v]) => {
        const value = toText(rec[field]);
        if (Array.isArray(v)) {
          const needles = v.map((s) => String(s).trim().toLowerCase()).filter((s) => s !== '');
          if (needles.length === 0) return true;
          return needles.some((n) => value.trim().toLowerCase() === n);
        }
        return value.toLowerCase().includes(String(v).trim().toLowerCase());
      });
    });
  }, [headerFilters, ids, records, datasetColumns]);

  const sortedIds = React.useMemo(() => {
    if (!clientSort || serverDriven) return filteredIds;
    const field = clientSort.name?.toLowerCase?.() ?? '';
    const desc = clientSort.sortDirection === 1;
    const getVal = (id: string): string => {
      const rec = records[id] as unknown as Record<string, unknown>;
      const v = rec[field];
      if (typeof v === 'number') return String(v);
      if (typeof v === 'boolean') return v ? '1' : '0';
      if (typeof v === 'string') return v.toLowerCase();
      return '';
    };
    const arr = filteredIds.slice();
    arr.sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      const cmp = va.localeCompare(vb, undefined, { numeric: true, sensitivity: 'base' });
      return desc ? -cmp : cmp;
    });
    return arr;
  }, [clientSort, filteredIds, records, serverDriven]);

  const start = currentPage * pageSize;
  const pageIds = sortedIds.slice(start, start + pageSize);
  const canPrev = currentPage > 0;
  const canNext = serverDriven ? (currentPage + 1) * pageSize < totalCount : start + pageSize < filteredIds.length;
  const totalPages = serverDriven ? Math.ceil(totalCount / pageSize) : Math.ceil(filteredIds.length / pageSize);

  // Initial load and reloads when critical props change
  const lastRef = React.useRef<{ apim?: string; apiName?: string; table?: string }>({});
  React.useEffect(() => {
    const apim = (context.parameters as unknown as Record<string, { raw?: string }>).apimEndpoint?.raw?.trim() ?? '';
    const apiName = (context.parameters as unknown as Record<string, { raw?: string }>).customApiName?.raw?.trim() ?? '';
    const changed = lastRef.current.apim !== apim || lastRef.current.apiName !== apiName || lastRef.current.table !== tableKey || !hasLoadedApim;
    if (!changed) return;
    lastRef.current = { apim, apiName, table: tableKey };
    setApimLoading(true);
    void (async () => {
      const res = await loadGridData(context, {
        tableKey,
        filters: sanitizeFilters(searchFilters),
        currentPage,
        pageSize,
        headerFilters,
        clientSort,
      });
      setApimItems(res.items);
      setTotalCount(res.totalCount);
      setServerDriven(res.serverDriven);
      setApimLoading(false);
      setHasLoadedApim(true);
    })();
  }, [context, tableKey, searchFilters, currentPage, pageSize, headerFilters, clientSort, hasLoadedApim]);

  // Handlers
  const [selectedCount, setSelectedCount] = React.useState(0);
  const selection: Selection<IObjectWithKey> = new Selection<IObjectWithKey>({
    getKey: (item: IObjectWithKey) => (item as unknown as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord).getRecordId(),
    onSelectionChanged: () => {
      setSelectedCount((sel) => {
        const next = selection.getSelectedCount();
        return next !== sel ? next : sel;
      });
    },
  });
  const componentRef = React.createRef<IDetailsList>();

  const onNavigate = (item?: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord): void => {
    if (item) {
      const taskId = (item as unknown as { taskId?: string }).taskId;
      const saleId = (item as unknown as { saleId?: string }).saleId;
      onRowInvoke?.({ taskId, saleId });
      const targetName = canvasScreenName || navigationTarget;
      if (targetName) {
        const isUrl = /^https?:/i.test(navigationTarget);
        const navAny = context.navigation as unknown as {
          navigateTo?: (input: { pageName?: string } & Record<string, unknown>, options?: Record<string, unknown>) => Promise<void>;
          openUrl: (url: string) => void;
        };
        // Canvas App screen navigation (preferred): use pageName
        if (!isUrl && typeof navAny.navigateTo === 'function') {
          void navAny.navigateTo({ pageName: targetName });
        } else {
          // Fallback to URL navigation if a full URL is supplied
          const url = `${targetName}?saleId=${encodeURIComponent(String(saleId ?? ''))}&taskId=${encodeURIComponent(String(taskId ?? ''))}`;
          void navAny.openUrl(url);
        }
      }
    }
  };

  const onSort = (name: string, desc: boolean): void => {
    setClientSort({ name, sortDirection: desc ? 1 : 0 });
  };

  const props: GridProps = {
    showSearchPanel: false,
    tableKey,
    datasetColumns,
    columnConfigs,
    records,
    sortedRecordIds: pageIds,
    shimmer: apimLoading,
    itemsLoading: apimLoading,
    selectionType: SelectionMode.multiple,
    selection,
    onNavigate,
    onSort,
    sorting: (clientSort ? [{ name: clientSort.name, sortDirection: clientSort.sortDirection }] : []) as unknown as ComponentFramework.PropertyHelper.DataSetApi.SortStatus[],
    componentRef,
    resources: context.resources,
    columnDatasetNotDefined: false,
    onSearch: (fs) => {
      setSearchFilters(sanitizeFilters(fs));
      setCurrentPage(0);
    },
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
    canNext,
    canPrev,
    searchFilters,
    showResults: true,
    selectedCount,
    onLoadFilterOptions: async (field, query) => {
      const configuredEndpoint = (context.parameters as unknown as Record<string, { raw?: string }>).apimEndpoint?.raw?.trim();
      const customApiName = (context.parameters as unknown as Record<string, { raw?: string }>).customApiName?.raw?.trim();
      if (!query || query.trim().length === 0) return [];
      try {
        return await fetchFilterOptions(context, { tableKey, field, query, apimEndpoint: configuredEndpoint, customApiName });
      } catch {
        return [];
      }
    },
    onColumnFiltersChange: (f) => {
      setHeaderFilters(f);
      setCurrentPage(0);
    },
    taskCount: serverDriven ? totalCount : filteredIds.length,
  };

  return <Grid {...(props as unknown as GridProps)} />;
};

DetailsListHost.displayName = 'DetailsListHost';
