import './initFluentIcons';
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { Grid, GridProps } from "./Grid";
import { PCFContext } from "./components/context/PCFContext";
import { SampleSearch } from "./components/SampleSearch";
import { ColumnConfig } from "./Component.types";
import { SAMPLE_COLUMNS, SAMPLE_RECORDS } from "./SampleData";
import { SAMPLE_TASK_RESULTS, TaskSearchItem, TaskSearchResponse } from "./TaskSearchSample";
import * as React from "react";
import { IDetailsList, ISelection, Selection, SelectionMode, IObjectWithKey } from '@fluentui/react';
import { GridFilterState, createDefaultGridFilters, sanitizeFilters } from "./Filters";
import { buildApiParamsFor } from "./TableConfigs";
import { fetchFilterOptions } from "./services/DataService";

export class DetailsListVOA implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;
    private taskCache: Record<string, { statuscode?: string; ownerid?: { name?: string }; subject?: string }> = {};
    private selectedTaskId?: string;
    private searchFilters: GridFilterState = createDefaultGridFilters();
    private currentPage = 0;
    private lastQuickNavigateKey?: string;
    private columnDisplayNames: Record<string, string> = {};
    private lastColumnDisplayNamesRaw = "";
    private columnConfigs: Record<string, ColumnConfig> = {};
    private lastColumnConfigRaw = "";
    private apimItems: TaskSearchItem[] = [];
    private apimLoading = false;
    private apimError?: string;
    private hasLoadedApim = false;
    private showResults = false;
    private headerFilters: Record<string, string | string[]> = {};
    private tableKey = 'sales';


    constructor() {
        // Empty
    }

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        // Allow quick switch to a sample search-driven grid for demo/testing
        const useSample = (context.parameters as unknown as Record<string, { raw?: boolean }>).useSampleSearch?.raw;
        if (useSample) {
            return React.createElement(
                PCFContext.Provider,
                { value: context },
                React.createElement(SampleSearch, {})
            );
        }
        const dataset = context.parameters.revalSalesDataset;
        // Allow screens to select a table profile for lookups and API mapping
        try {
            const raw = (context.parameters as unknown as Record<string, { raw?: string }>).tableKey?.raw;
            this.tableKey = raw?.trim()?.toLowerCase() ?? 'sales';
        } catch {
            this.tableKey = 'sales';
        }
        const taskIdField = context.parameters.taskIdField.raw ?? "taskid";
        const taskEntity = context.parameters.taskEntity.raw ?? "";
        const navigationTarget = context.parameters.navigationTarget.raw ?? "";
        // Column display name overrides are provided as JSON in the columnDisplayNames property.
        // Parse the property whenever it changes so makers can customize labels.
        const columnDisplayNamesRaw = context.parameters.columnDisplayNames?.raw?.trim() ?? "{}";
        if (this.lastColumnDisplayNamesRaw !== columnDisplayNamesRaw) {
            try {
                const parsed = JSON.parse(columnDisplayNamesRaw) as Record<string, string>;
                this.columnDisplayNames = {};
                Object.keys(parsed).forEach((k) => {
                    this.columnDisplayNames[k.toLowerCase()] = parsed[k];
                });
            } catch {
                this.columnDisplayNames = {};
            }
            this.lastColumnDisplayNamesRaw = columnDisplayNamesRaw;
        }

        const columnConfigRaw = context.parameters.columnConfig?.raw?.trim() ?? "[]";
        if (this.lastColumnConfigRaw !== columnConfigRaw) {
            try {
                const arr = JSON.parse(columnConfigRaw) as ColumnConfig[];
                this.columnConfigs = {};
                arr.forEach((c) => {
                    const normalizedName = c.ColName?.trim().toLowerCase();
                    if (normalizedName) {
                        this.columnConfigs[normalizedName] = c;
                    }
                });
            } catch {
                this.columnConfigs = {};
            }
            this.lastColumnConfigRaw = columnConfigRaw;
        }

        const selection: ISelection<IObjectWithKey> = new Selection<IObjectWithKey>({
            getKey: (item: IObjectWithKey) =>
                (item as unknown as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord).getRecordId(),
        });
        const componentRef = React.createRef<IDetailsList>();

        // Start from dataset columns but drop fields that should never be shown in the grid
        const columnsToExclude = new Set(["name", "telephone1", "address1_city"]);
        const datasetColumns: ComponentFramework.PropertyHelper.DataSetApi.Column[] = dataset.columns
            .filter((c) => {
                const n = c.name?.toLowerCase();
                const a = c.alias?.toLowerCase();
                return !(n && columnsToExclude.has(n)) && !(a && columnsToExclude.has(a));
            })
            .map((c) => {
            const lowerName = c.name?.toLowerCase();
            const lowerAlias = c.alias?.toLowerCase();
            const displayNameOverride =
                (lowerName ? this.columnDisplayNames[lowerName] : undefined) ??
                (lowerAlias ? this.columnDisplayNames[lowerAlias] : undefined);
            return {
                ...c,
                alias: c.alias ?? c.name,
                displayName: displayNameOverride ?? c.displayName,
            };
        });

        const ensureColumn = (name: string, defaultDisplayName: string, width = 100): void => {
            const lowerName = name.toLowerCase();
            if (datasetColumns.some((col) => col.name.toLowerCase() === lowerName)) {
                return;
            }
            datasetColumns.push({
                name,
                displayName: this.columnDisplayNames[lowerName] ?? defaultDisplayName,
                dataType: "SingleLine.Text",
                alias: name,
                order: datasetColumns.length + 1,
                visualSizeFactor: width,
            } as ComponentFramework.PropertyHelper.DataSetApi.Column);
        };

        ensureColumn("uprn", "UPRN", 120);
        ensureColumn("taskid", "Task ID", 120);
        ensureColumn("taskstatus", "Task Status", 120);
        ensureColumn("caseassignedto", "Case Assigned To", 160);
        ensureColumn("address", "Address", 240);
        ensureColumn("postcode", "Postcode", 110);
        ensureColumn("transactiondate", "Transaction Date", 160);
        ensureColumn("source", "Source", 120);
        // Ensure columns referenced in Column Config JSON are present
        Object.keys(this.columnConfigs).forEach((lowerName) => {
            const cfg = this.columnConfigs[lowerName];
            const colName = cfg.ColName || lowerName;
            const display = cfg.ColDisplayName ?? colName;
            const width = typeof cfg.ColWidth === 'number' ? cfg.ColWidth : 100;
            ensureColumn(colName, display, width);
        });
        // Auto-add any extra fields returned by APIM payload
        if (this.hasLoadedApim && this.apimItems.length > 0) {
            const existing = new Set<string>(datasetColumns.map((c) => (c.name ?? '').toLowerCase()));
            const sampleItem = this.apimItems[0] as unknown as Record<string, unknown>;
            Object.keys(sampleItem).forEach((key) => {
                const lower = key.toLowerCase();
                if (!existing.has(lower)) {
                    const display = key
                        .replace(/_/g, ' ')
                        .replace(/([a-z])([A-Z])/g, '$1 $2')
                        .replace(/^.|\s\w/g, (m) => m.toUpperCase());
                    ensureColumn(lower, display);
                    existing.add(lower);
                }
            });
        }

        const records: Record<string, ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> = {};
        const allIds: string[] = [];

        const formatValue = (value: unknown): string => {
            if (typeof value === "string") {
                return value;
            }
            if (typeof value === "number" || typeof value === "boolean") {
                return value.toString();
            }
            return "";
        };

        dataset.sortedRecordIds.forEach((id) => {
            const dsRecord = dataset.records[id];
            const newRecord = {} as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord & Record<string, unknown>;
            newRecord.getRecordId = dsRecord.getRecordId.bind(dsRecord);
            newRecord.getNamedReference = dsRecord.getNamedReference?.bind(dsRecord);
            newRecord.getValue = ((columnName: string) => (newRecord as Record<string, unknown>)[columnName] ?? '') as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord['getValue'];
            newRecord.getFormattedValue = (columnName: string): string => {
                const value = (newRecord as Record<string, unknown>)[columnName];
                return formatValue(value);
            };

            dataset.columns.forEach((c) => {
                (newRecord as Record<string, unknown>)[c.name] =
                    dsRecord.getFormattedValue(c.name) ?? dsRecord.getValue(c.name);
            });

            const taskId = dsRecord.getValue(taskIdField) as string | undefined;
            if (taskId) {
                (newRecord as Record<string, unknown>).taskId = taskId;
                if (!this.taskCache[taskId] && taskEntity) {
                    void context.webAPI
                        .retrieveRecord(taskEntity, taskId, "?$select=subject,ownerid,statuscode")
                        .then((task) => {
                            this.taskCache[taskId] = task as {
                                statuscode?: string;
                                ownerid?: { name?: string };
                                subject?: string;
                            };
                            this.notifyOutputChanged();
                            return undefined;
                        })
                        .catch(() => {
                            this.taskCache[taskId] = {};
                            this.notifyOutputChanged();
                            return undefined;
                        });
                }
                const task = this.taskCache[taskId];
                if (task) {
                    (newRecord as Record<string, unknown>).taskstatus = task.statuscode;
                    
                    
                }
            }
            
            (newRecord as Record<string, unknown>).saleId = dsRecord.getValue("saleId");
            records[id] = newRecord as unknown as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord;
            allIds.push(id);
        });

        if (allIds.length === 0 && !dataset.loading && !this.hasLoadedApim) {
            SAMPLE_COLUMNS.forEach((column) => ensureColumn(column.name, column.displayName, column.width));
            SAMPLE_RECORDS.forEach((sample, index) => {
                const recordBase: Record<string, unknown> = {};
                const sampleRecord = recordBase as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord & Record<string, unknown>;
                sampleRecord.getRecordId = () => `sample-${index}`;
                sampleRecord.getNamedReference = undefined as unknown as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord['getNamedReference'];
                sampleRecord.getValue = ((columnName: string) => sampleRecord[columnName] ?? '') as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord['getValue'];
                sampleRecord.getFormattedValue = ((columnName: string) => formatValue(sampleRecord[columnName])) as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord['getFormattedValue'];
                Object.keys(sample).forEach((key) => {
                    sampleRecord[key] = sample[key];
                });
                const sampleId = `sample-${index}`;
                records[sampleId] = sampleRecord;
                allIds.push(sampleId);
            });
        }

        let activeRecords = records;
        let activeIds = allIds;

        if (this.hasLoadedApim) {
            const remoteRecords: Record<string, ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> = {};
            const remoteIds: string[] = [];
            this.apimItems.forEach((item, index) => {
                const record = this.createRecordFromApim(item, index);
                const recordId = record.getRecordId();
                remoteRecords[recordId] = record as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord;
                remoteIds.push(recordId);
            });
            activeRecords = remoteRecords;
            activeIds = remoteIds;
        }

        const columnNamesSet = new Set<string>();
        datasetColumns.forEach((c) => {
            if (c.name) {
                columnNamesSet.add(c.name.toLowerCase());
            }
            if (c.alias) {
                columnNamesSet.add(c.alias.toLowerCase());
            }
        });
        const columnDatasetNotDefined = Object.keys(this.columnConfigs).some(
            (name) => !columnNamesSet.has(name),
        );

        const filters = sanitizeFilters(this.searchFilters);
        this.searchFilters = filters;
        const filteredIds = activeIds.filter((id) => {
            const record = activeRecords[id] as unknown as Record<string, unknown>;
            return this.matchesFilters(record, filters, datasetColumns) && this.matchesHeaderFilters(record, this.headerFilters, datasetColumns);
        });

        let quickNavigateRecord: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord | undefined;
        let quickNavigateKey: string | undefined;
        if (filters.searchBy === "taskId" && filters.taskId) {
            if (filteredIds.length === 1) {
                quickNavigateRecord = activeRecords[filteredIds[0]];
                quickNavigateKey = `${filters.taskId}:${filteredIds[0]}`;
            }
        }

        const pageSize = context.parameters.pageSize.raw ?? 10;
        if (dataset.paging.pageSize !== pageSize) {
            dataset.paging.setPageSize(pageSize);
        }
        const start = this.currentPage * pageSize;
        const pageIds = filteredIds.slice(start, start + pageSize);
        const canPrev = this.currentPage > 0;
        const datasetHasNext = this.hasLoadedApim ? false : dataset.paging.hasNextPage;
        const canNext = start + pageSize < filteredIds.length || datasetHasNext;
        const totalPages = Math.ceil(filteredIds.length / pageSize) + (datasetHasNext ? 1 : 0);

        const onNavigate = (
            item?: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord,
        ): void => {
            if (item) {
                const taskId = (item as unknown as { taskId?: string }).taskId;
                const saleId = (item as unknown as { saleId?: string }).saleId;
                this.selectedTaskId = taskId;
                this.notifyOutputChanged();
                if (navigationTarget) {
                    const url = `${navigationTarget}?saleId=${saleId}&taskId=${taskId}`;
                    void context.navigation.openUrl(url);
                }
            }
        };

        const onSearch = (filterState: GridFilterState): void => {
            this.searchFilters = sanitizeFilters(filterState);
            this.currentPage = 0;
            this.lastQuickNavigateKey = undefined;
            this.showResults = true;
            this.notifyOutputChanged();
            void this.loadTasks(context, this.searchFilters);
        };

        const onNextPage = (): void => {
            if (canNext) {
                const nextStart = (this.currentPage + 1) * pageSize;
                if (nextStart >= filteredIds.length && datasetHasNext) {
                    dataset.paging.loadNextPage();
                }
                this.currentPage += 1;
                this.notifyOutputChanged();
            }
        };

        const onPrevPage = (): void => {
            if (canPrev) {
                this.currentPage -= 1;
                this.notifyOutputChanged();
            }
        };

        const onSetPage = (page: number): void => {
            if (page >= 0 && page !== this.currentPage) {
                const targetStart = page * pageSize;
                if (targetStart >= filteredIds.length && datasetHasNext) {
                    dataset.paging.loadNextPage();
                }
                this.currentPage = page;
                this.notifyOutputChanged();
            }
        };

        const onSort = (name: string, desc: boolean): void => {
            const sortDirection = desc ? 1 : 0;
            type SortExt = { name: string; sortDirection: number }[] & {
                setSort?: (name: string, sortDirection: number) => void;
                sortByName?: (name: string, sortDirection: number) => void;
                addSort?: (name: string, sortDirection: number) => void;
                clear?: () => void;
            };
            const sorting = dataset.sorting as unknown as SortExt;
            if (sorting) {
                if (typeof sorting.setSort === "function") {
                    sorting.setSort(name, sortDirection);
                } else if (typeof sorting.sortByName === "function") {
                    sorting.sortByName(name, sortDirection);
                } else if (typeof sorting.addSort === "function") {
                    sorting.clear?.();
                    sorting.addSort(name, sortDirection);
                } else {
                    sorting.length = 0;
                    sorting.push({ name, sortDirection });
                }
            }
            dataset.refresh();
        };

        const props: GridProps = {
            tableKey: this.tableKey,
            datasetColumns,
            columnConfigs: this.columnConfigs,
            records: activeRecords,
            sortedRecordIds: pageIds,
            shimmer: dataset.loading || this.apimLoading,
            itemsLoading: dataset.loading || this.apimLoading,
            selectionType: SelectionMode.none,
            selection,
            onNavigate,
            onSort,
            sorting: dataset.sorting,
            componentRef,
            resources: context.resources,
            columnDatasetNotDefined,
            onSearch,
            onNextPage,
            onPrevPage,
            onSetPage,
            currentPage: this.currentPage,
            totalPages,
            canNext,
            canPrev,
            searchFilters: this.searchFilters,
            showResults: this.showResults,
            onColumnFiltersChange: (f) => {
                this.headerFilters = f;
                this.currentPage = 0;
                this.notifyOutputChanged();
            },
            onLoadFilterOptions: async (field, query) => {
                const configuredEndpoint = context.parameters.apimEndpoint?.raw?.trim();
                const customApiName = (context.parameters as unknown as Record<string, { raw?: string }>).customApiName?.raw?.trim();
                if (!query || query.trim().length === 0) {
                    return [];
                }
                try {
                    const values = await fetchFilterOptions(context, {
                        tableKey: this.tableKey,
                        field,
                        query,
                        apimEndpoint: configuredEndpoint,
                        customApiName,
                    });
                    return values;
                } catch {
                    return [];
                }
            },
        };

        const element = React.createElement(
            PCFContext.Provider,
            { value: context },
            React.createElement(Grid, props)
        );

        if (quickNavigateRecord && quickNavigateKey && this.lastQuickNavigateKey !== quickNavigateKey) {
            this.lastQuickNavigateKey = quickNavigateKey;
            onNavigate(quickNavigateRecord);
        } else if (!quickNavigateRecord) {
            this.lastQuickNavigateKey = undefined;
        }

        return element;
    }

    private createRecordFromApim(
        item: TaskSearchItem,
        index: number,
    ): ComponentFramework.PropertyHelper.DataSetApi.EntityRecord & Record<string, unknown> {
        const recordBase: Record<string, unknown> = {};
        const record = recordBase as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord & Record<string, unknown>;
        const recordId = item.taskId || `${item.uprn}-${index}` || `apim-${index}`;
        record.getRecordId = () => recordId;
        record.getNamedReference = undefined as unknown as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord['getNamedReference'];
        record.getValue = ((columnName: string) => record[columnName] ?? "") as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord['getValue'];
        record.getFormattedValue = ((columnName: string) => {
            const value = record[columnName];
            if (typeof value === "string") {
                return value;
            }
            if (typeof value === "number" || typeof value === "boolean") {
                return value.toString();
            }
            return "";
        }) as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord['getFormattedValue'];

        const formattedDate = this.tryFormatDate(item.transactionDate);

        record.uprn = item.uprn;
        record.taskid = item.taskId;
        record.taskId = item.taskId;
        record.taskstatus = item.taskStatus;
        record.taskStatus = item.taskStatus;
        record.caseassignedto = item.caseAssignedTo;
        record.caseAssignedTo = item.caseAssignedTo;
        record.address = item.address;
        record.postcode = item.postcode;
        record.transactiondate = formattedDate;
        record.transactionDate = formattedDate;
        record.source = item.source;
        record.saleId = "";
        

        return record;
    }

    private tryFormatDate(value?: string): string {
        if (!value) {
            return "";
        }
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return value;
        }
        return parsed.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    private async loadTasks(
        context: ComponentFramework.Context<IInputs>,
        filters: GridFilterState,
    ): Promise<void> {
        const configuredEndpoint = context.parameters.apimEndpoint?.raw?.trim();
        const baseUrl = configuredEndpoint && configuredEndpoint.length > 0
            ? configuredEndpoint
            : "https://api.contoso.gov.uk/revaluation/tasks";

        let requestUrl: URL;
        try {
            requestUrl = new URL(baseUrl);
        } catch {
            // On invalid URL, fall back to samples without surfacing an error
            this.apimError = undefined;
            this.hasLoadedApim = true;
            this.apimItems = SAMPLE_TASK_RESULTS;
            this.notifyOutputChanged();
            return;
        }

        const pageSize = context.parameters.pageSize.raw ?? 10;
        const apiParams = buildApiParamsFor(this.tableKey, filters, this.currentPage, pageSize);
        const headerFilterEntries = Object.entries(this.headerFilters).filter(([_, v]) =>
            Array.isArray(v) ? v.length > 0 : (v ?? '').trim() !== '',
        );

        this.apimLoading = true;
        this.apimError = undefined;
        this.notifyOutputChanged();

        // Prefer Dataverse Custom API if provided, else fallback to external endpoint
        const customApiName = (context.parameters as unknown as Record<string, { raw?: string }>).customApiName?.raw?.trim();
        try {
            if (customApiName) {
                // Build a dynamic request for an unbound Custom API with string parameters
                const request: Record<string, unknown> & {
                    getMetadata: () => {
                        boundParameter: null;
                        parameterTypes: Record<string, { typeName: string; structuralProperty: number }>;
                        operationType: number;
                        operationName: string;
                    };
                } = {
                    getMetadata: () => ({
                        boundParameter: null,
                        parameterTypes: Object.keys(apiParams).reduce((acc, key) => {
                            acc[key] = { typeName: 'Edm.String', structuralProperty: 1 };
                            return acc;
                        }, {} as Record<string, { typeName: string; structuralProperty: number }>),
                        operationType: 0, // Action
                        operationName: customApiName,
                    }),
                };
                Object.entries(apiParams).forEach(([k, v]) => {
                    (request as Record<string, unknown>)[k] = v;
                });
                if (headerFilterEntries.length > 0) {
                    try {
                        (request as Record<string, unknown>).columnFilters = JSON.stringify(this.headerFilters);
                    } catch {
                        // ignore
                    }
                }

                interface WebApiWithExecute { execute: (request: unknown) => Promise<Response>; }
                const result = await (context.webAPI as unknown as WebApiWithExecute).execute(request);
                const payload = (await result.json()) as TaskSearchResponse;
                this.apimItems = payload.items ?? [];
                this.apimError = undefined;
            } else {
                Object.entries(apiParams).forEach(([k, v]) => requestUrl.searchParams.set(k, v));
                // Serialize header filters using bracket notation: filter[field][]=v1
                if (headerFilterEntries.length > 0) {
                    headerFilterEntries.forEach(([field, val]) => {
                        if (Array.isArray(val)) {
                            val.forEach((v) => {
                                if ((v ?? '').trim() !== '') {
                                    requestUrl.searchParams.append(`filter[${field}][]`, String(v));
                                }
                            });
                        } else {
                            const trimmed = (val ?? '').toString().trim();
                            if (trimmed !== '') {
                                requestUrl.searchParams.append(`filter[${field}]`, trimmed);
                            }
                        }
                    });
                }
                const response = await fetch(requestUrl.toString(), { method: 'GET' });
                if (!response.ok) {
                    throw new Error(`APIM request failed with status ${response.status}`);
                }
                const payload = (await response.json()) as TaskSearchResponse;
                this.apimItems = payload.items ?? [];
                this.apimError = undefined;
            }
        } catch (error) {
            this.apimError = undefined;
            this.apimItems = SAMPLE_TASK_RESULTS;
        } finally {
            this.apimLoading = false;
            this.hasLoadedApim = true;
            this.notifyOutputChanged();
        }
    }

    private matchesFilters(
        record: Record<string, unknown>,
        filters: GridFilterState,
        datasetColumns: ComponentFramework.PropertyHelper.DataSetApi.Column[],
    ): boolean {
        switch (filters.searchBy) {
            case "uprn": {
                if (!filters.uprn) {
                    return true;
                }
                const uprn = this.getRecordValue(record, "uprn", datasetColumns);
                return uprn.includes(filters.uprn);
            }
            case "taskId": {
                if (!filters.taskId) {
                    return true;
                }
                const taskId = this.getRecordValue(record, "taskid", datasetColumns);
                return taskId.toLowerCase().includes(filters.taskId.toLowerCase());
            }
            case "manualCheck": {
                const desired = filters.manualCheck ?? "all";
                if (desired === "all") {
                    return true;
                }
                const manualCheck = this.getRecordValueFromCandidates(
                    record,
                    datasetColumns,
                    ["manualcheck", "manualcheckflag", "manualqa"],
                ).toLowerCase();
                if (desired === "yes") {
                    return manualCheck === "yes" || manualCheck === "true";
                }
                if (desired === "no") {
                    return manualCheck === "no" || manualCheck === "false";
                }
                return true;
            }
            case "postcode": {
                if (!filters.postcode) {
                    return true;
                }
                const postcode = this.getRecordValueFromCandidates(record, datasetColumns, ["postcode", "post_code"]).toUpperCase();
                return postcode.includes(filters.postcode);
            }
            case "address": {
                const postcodeValue = this.getRecordValueFromCandidates(
                    record,
                    datasetColumns,
                    ["postcode", "post_code"],
                ).toUpperCase();
                const postcodeFilter = filters.postcode
                    ? postcodeValue.includes(filters.postcode)
                    : true;
                const buildingValue = this.getRecordValueFromCandidates(
                    record,
                    datasetColumns,
                    ["buildingnamenumber", "buildingname", "buildingnumber"],
                ).toLowerCase();
                const buildingFilter = filters.buildingNameNumber
                    ? buildingValue.includes(filters.buildingNameNumber.toLowerCase())
                    : true;
                const streetValue = this.getRecordValueFromCandidates(
                    record,
                    datasetColumns,
                    ["street", "streetname", "addressline1"],
                ).toLowerCase();
                const streetFilter = filters.street
                    ? streetValue.includes(filters.street.toLowerCase())
                    : true;
                const townValue = this.getRecordValueFromCandidates(
                    record,
                    datasetColumns,
                    ["towncity", "town", "city"],
                ).toLowerCase();
                const townFilter = filters.townCity
                    ? townValue.includes(filters.townCity.toLowerCase())
                    : true;
                return postcodeFilter && buildingFilter && streetFilter && townFilter;
            }
            case "taskStatus": {
                if (!filters.taskStatus) {
                    return true;
                }
                const status = this.getRecordValueFromCandidates(
                    record,
                    datasetColumns,
                    ["taskstatus", "taskStatus", "status", "statuscode"],
                ).toLowerCase();
                return status.includes((filters.taskStatus ?? '').toLowerCase());
            }
            case "source": {
                if (!filters.source) {
                    return true;
                }
                const src = this.getRecordValueFromCandidates(
                    record,
                    datasetColumns,
                    ["source", "salesource", "sale_source"],
                ).toLowerCase();
                return src.includes((filters.source ?? '').toLowerCase());
            }
            default:
                return true;
        }
    }

    private matchesHeaderFilters(
        record: Record<string, unknown>,
        headerFilters: Record<string, string | string[]>,
        datasetColumns: ComponentFramework.PropertyHelper.DataSetApi.Column[],
    ): boolean {
        const entries = Object.entries(headerFilters).filter(([_, v]) => (Array.isArray(v) ? v.length > 0 : v.trim() !== ''));
        if (entries.length === 0) return true;
        return entries.every(([field, v]) => {
            const value = this.getRecordValue(record, field, datasetColumns).toLowerCase().trim();
            if (Array.isArray(v)) {
                const needles = v.map((s) => s.toLowerCase().trim()).filter((s) => s !== '');
                if (needles.length === 0) return true;
                return needles.some((n) => value === n);
            }
            const needle = v.toLowerCase().trim();
            return value.includes(needle);
        });
    }

    private getRecordValue(
        record: Record<string, unknown>,
        fieldName: string,
        datasetColumns: ComponentFramework.PropertyHelper.DataSetApi.Column[],
    ): string {
        const direct = record[fieldName];
        if (direct !== undefined) {
            return this.toText(direct);
        }
        const lower = fieldName.toLowerCase();
        const column = datasetColumns.find(
            (col) => col.name?.toLowerCase() === lower || col.alias?.toLowerCase() === lower,
        );
        if (column) {
            const value = record[column.name];
            if (value !== undefined) {
                return this.toText(value);
            }
        }
        return "";
    }

    private getRecordValueFromCandidates(
        record: Record<string, unknown>,
        datasetColumns: ComponentFramework.PropertyHelper.DataSetApi.Column[],
        candidates: string[],
    ): string {
        for (const candidate of candidates) {
            const value = this.getRecordValue(record, candidate, datasetColumns);
            if (value) {
                return value;
            }
        }
        return "";
    }

    private toText(value: unknown): string {
        if (typeof value === "string") {
            return value;
        }
        if (typeof value === "number" || typeof value === "boolean") {
            return value.toString();
        }
        return "";
    }

    public getOutputs(): IOutputs {
        return {
            selectedTaskId: this.selectedTaskId,
        };
    }

    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}


