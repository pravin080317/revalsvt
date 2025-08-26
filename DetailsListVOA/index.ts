/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { Grid, GridProps } from "./Grid";
import { ColumnConfig } from "./Component.types";
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
                this.columnDisplayNames = JSON.parse(columnDisplayNamesRaw) as Record<string, string>;
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
                    if (c.ColName) {
                        this.columnConfigs[c.ColName] = c;
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

        const datasetColumns: ComponentFramework.PropertyHelper.DataSetApi.Column[] = dataset.columns.map((c) => ({
            ...c,
            displayName: this.columnDisplayNames[c.name] ?? c.displayName,
        }));

        datasetColumns.push({
            name: "taskstatus",
            displayName: this.columnDisplayNames.taskstatus ?? "Task Status",
            dataType: "SingleLine.Text",
            alias: "taskstatus",
            order: datasetColumns.length + 1,
            visualSizeFactor: 100,
        } as ComponentFramework.PropertyHelper.DataSetApi.Column);
        datasetColumns.push({
            name: "assignedto",
            displayName: this.columnDisplayNames.assignedto ?? "Assigned To",
            dataType: "SingleLine.Text",
            alias: "assignedto",
            order: datasetColumns.length + 1,
            visualSizeFactor: 100,
        } as ComponentFramework.PropertyHelper.DataSetApi.Column);
        datasetColumns.push({
            name: "tasktitle",
            displayName: this.columnDisplayNames.tasktitle ?? "Task Title",
            dataType: "SingleLine.Text",
            alias: "tasktitle",
            order: datasetColumns.length + 1,
            visualSizeFactor: 100,
        } as ComponentFramework.PropertyHelper.DataSetApi.Column);
        datasetColumns.push({
            name: "action",
            displayName: this.columnDisplayNames.action ?? "Action",
            dataType: "SingleLine.Text",
            alias: "action",
            order: datasetColumns.length + 1,
            visualSizeFactor: 100,
        } as ComponentFramework.PropertyHelper.DataSetApi.Column);

        const records: Record<string, ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> = {};
        const allIds: string[] = [];

        dataset.sortedRecordIds.forEach((id) => {
            const dsRecord = dataset.records[id];
            const newRecord = {} as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord & Record<string, unknown>;
            newRecord.getRecordId = dsRecord.getRecordId.bind(dsRecord);
            newRecord.getNamedReference = dsRecord.getNamedReference?.bind(dsRecord);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            newRecord.getValue = (columnName: string): any => (newRecord as Record<string, unknown>)[columnName];
            newRecord.getFormattedValue = (columnName: string): string => {
                const value = (newRecord as Record<string, unknown>)[columnName];
                return typeof value === "string" ? value : "";
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
