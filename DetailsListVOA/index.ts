/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { Grid, GridProps } from "./Grid";
import { ColumnConfig } from "./Component.types";
import { SAMPLE_COLUMNS, SAMPLE_RECORDS } from "./SampleData";
import * as React from "react";
import { IDetailsList, ISelection, Selection, SelectionMode, IObjectWithKey } from '@fluentui/react';

export class DetailsListVOA implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;
    private taskCache: Record<string, { statuscode?: string; ownerid?: { name?: string }; subject?: string }> = {};
    private selectedTaskId?: string;
    private searchText = "";
    private currentPage = 0;
    private columnDisplayNames: Record<string, string> = {};
    private lastColumnDisplayNamesRaw = "";
    private columnConfigs: Record<string, ColumnConfig> = {};
    private lastColumnConfigRaw = "";

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
        const dataset = context.parameters.revalSalesDataset;
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

        const datasetColumns: ComponentFramework.PropertyHelper.DataSetApi.Column[] = dataset.columns.map((c) => {
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

        ensureColumn("taskstatus", "Task Status");
        ensureColumn("assignedto", "Assigned To");
        ensureColumn("tasktitle", "Task Title");
        ensureColumn("action", "Action");

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            newRecord.getValue = (columnName: string): any => (newRecord as Record<string, unknown>)[columnName];
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
                    (newRecord as Record<string, unknown>).assignedto = task.ownerid?.name;
                    (newRecord as Record<string, unknown>).tasktitle = task.subject;
                }
            }
            (newRecord as Record<string, unknown>).action = "🔍 View / Edit";
            (newRecord as Record<string, unknown>).saleId = dsRecord.getValue("saleId");
            records[id] = newRecord as unknown as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord;
            allIds.push(id);
        });

        if (allIds.length === 0 && !dataset.loading) {
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

        let filteredIds = allIds;
        if (this.searchText) {
            const search = this.searchText.toLowerCase();
            filteredIds = filteredIds.filter((id) => {
                const rec = records[id] as unknown as Record<string, unknown>;
                return datasetColumns.some((c) => {
                    const val = rec[c.name];
                    return typeof val === "string" && val.toLowerCase().includes(search);
                });
            });
        }

        const pageSize = context.parameters.pageSize.raw ?? 10;
        if (dataset.paging.pageSize !== pageSize) {
            dataset.paging.setPageSize(pageSize);
        }
        const start = this.currentPage * pageSize;
        const pageIds = filteredIds.slice(start, start + pageSize);
        const canPrev = this.currentPage > 0;
        const canNext = start + pageSize < filteredIds.length || dataset.paging.hasNextPage;
        const totalPages = Math.ceil(filteredIds.length / pageSize) + (dataset.paging.hasNextPage ? 1 : 0);

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

        const onSearch = (text: string): void => {
            this.searchText = text;
            this.currentPage = 0;
            this.notifyOutputChanged();
        };

        const onNextPage = (): void => {
            if (canNext) {
                const nextStart = (this.currentPage + 1) * pageSize;
                if (nextStart >= filteredIds.length && dataset.paging.hasNextPage) {
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
                if (targetStart >= filteredIds.length && dataset.paging.hasNextPage) {
                    dataset.paging.loadNextPage();
                }
                this.currentPage = page;
                this.notifyOutputChanged();
            }
        };

        const onSort = (name: string, desc: boolean): void => {
            const sortDirection = desc ? 1 : 0;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sorting = dataset.sorting as unknown as any;
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
            datasetColumns,
            columnConfigs: this.columnConfigs,
            records,
            sortedRecordIds: pageIds,
            shimmer: dataset.loading,
            itemsLoading: dataset.loading,
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
            searchText: this.searchText,
        };

        return React.createElement(Grid, props);
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
