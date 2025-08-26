/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { Grid, GridProps } from "./Grid";
import { IGridColumn } from "./Component.types";
import * as React from "react";
import { IDetailsList, ISelection, Selection, SelectionMode, IObjectWithKey, IColumn } from '@fluentui/react';

export class DetailsListVOA implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;
    private taskCache: Record<string, { statuscode?: string; ownerid?: { name?: string }; subject?: string }> = {};
    private selectedTaskId?: string;
    private searchText = "";
    private currentPage = 0;
    private columnDisplayNames: Record<string, string> = {};
    private lastColumnDisplayNamesRaw = "";

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

        // Column metadata is supplied as a JSON array. Each entry describes a column's
        // configuration using the schema defined in the README.
        const columnMetadataRaw =
            (context.parameters as unknown as {
                columnMetadata?: ComponentFramework.PropertyTypes.StringProperty;
            }).columnMetadata?.raw ?? "[]";

        const parseBool = (value: unknown): boolean | undefined => {
            if (typeof value === "boolean") {
                return value;
            }
            if (typeof value === "string") {
                return value.toLowerCase() === "true";
            }
            return undefined;
        };
        const parseNumber = (value: unknown): number | undefined => {
            if (typeof value === "number") {
                return isNaN(value) ? undefined : value;
            }
            if (typeof value === "string") {
                const n = parseFloat(value);
                return isNaN(n) ? undefined : n;
            }
            return undefined;
        };

        let gridColumns: IGridColumn[] = [];
        try {
            const columnArray = JSON.parse(columnMetadataRaw) as Record<string, unknown>[];
            gridColumns = columnArray.map((c, i) => {
                const name = typeof c.ColName === "string" ? c.ColName : `col${i}`;
                const width =
                    typeof c.ColWidth === "number"
                        ? c.ColWidth
                        : typeof c.ColWidth === "string"
                            ? parseFloat(c.ColWidth)
                            : undefined;
                const displayNameOverride = this.columnDisplayNames[name];
                const finalName =
                    (typeof displayNameOverride === "string" ? displayNameOverride : undefined) ??
                    (typeof c.ColDisplayName === "string" ? c.ColDisplayName : undefined) ??
                    name;
                return {
                    key: name,
                    fieldName: name,
                    name: finalName,
                    minWidth: width,
                    maxWidth: width,
                    cellType: typeof c.ColCellType === "string" ? c.ColCellType : undefined,
                    tagColor: typeof c.ColTagColorColumn === "string" ? c.ColTagColorColumn : undefined,
                    tagBorderColor: typeof c.ColTagBorderColorColumn === "string" ? c.ColTagBorderColorColumn : undefined,
                    isBold: parseBool(c.ColIsBold),
                    isMultiline: parseBool(c.ColMultiLine),
                    isResizable: parseBool(c.ColResizable) ?? true,
                    headerPaddingLeft: parseNumber(c.ColHeaderPaddingLeft),
                    showAsSubTextOf: typeof c.ColShowAsSubTextOf === "string" ? c.ColShowAsSubTextOf : undefined,
                    paddingTop: parseNumber(c.ColPaddingTop),
                    paddingLeft: parseNumber(c.ColPaddingLeft),
                    isLabelAbove: parseBool(c.ColLabelAbove),
                    multiValuesDelimiter: typeof c.ColMultiValueDelimiter === "string" ? c.ColMultiValueDelimiter : undefined,
                    firstMultiValueBold: parseBool(c.ColFirstMultiValueBold),
                    inlineLabel: typeof c.ColInlineLabel === "string" ? c.ColInlineLabel : undefined,
                    hideWhenBlank: parseBool(c.ColHideWhenBlank),
                    subTextRow: parseNumber(c.ColSubTextRow),
                    ariaTextColumn: typeof c.ColAriaTextColumn === "string" ? c.ColAriaTextColumn : undefined,
                    cellActionDisabledColumn:
                        typeof c.ColCellActionDisabledColumn === "string"
                            ? c.ColCellActionDisabledColumn
                            : undefined,
                    imageWidth: typeof c.ColImageWidth === "string" ? c.ColImageWidth : undefined,
                    imagePadding: parseNumber(c.ColImagePadding),
                    verticalAligned: typeof c.ColVerticalAlign === "string" ? c.ColVerticalAlign : undefined,
                    horizontalAligned: typeof c.ColHorizontalAlign === "string" ? c.ColHorizontalAlign : undefined,
                    childColumns: [],
                } as IGridColumn;
            });
        } catch {
            gridColumns = [];
        }

        const ensureColumn = (col: IGridColumn): void => {
            if (!gridColumns.some((c) => c.fieldName === col.fieldName)) {
                gridColumns.push(col);
            }
        };

        ensureColumn({
            key: "taskstatus",
            fieldName: "taskstatus",
            name: this.columnDisplayNames.taskstatus ?? "Task Status",
            minWidth: 100,
            maxWidth: 100,
            childColumns: [],
        } as IGridColumn);
        ensureColumn({
            key: "assignedto",
            fieldName: "assignedto",
            name: this.columnDisplayNames.assignedto ?? "Assigned To",
            minWidth: 100,
            maxWidth: 100,
            childColumns: [],
        } as IGridColumn);
        ensureColumn({
            key: "tasktitle",
            fieldName: "tasktitle",
            name: this.columnDisplayNames.tasktitle ?? "Task Title",
            minWidth: 100,
            maxWidth: 100,
            childColumns: [],
        } as IGridColumn);
        ensureColumn({
            key: "action",
            fieldName: "action",
            name: this.columnDisplayNames.action ?? "Action",
            minWidth: 100,
            maxWidth: 100,
            childColumns: [],
        } as IGridColumn);
        const selection: ISelection<IObjectWithKey> = new Selection<IObjectWithKey>({
            getKey: (item: IObjectWithKey) =>
                (item as unknown as ComponentFramework.PropertyHelper.DataSetApi.EntityRecord).getRecordId(),
        });
        const componentRef = React.createRef<IDetailsList>();

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
                return gridColumns.some((c) => {
                    const field = (c as IColumn).fieldName ?? c.key;
                    const val = field ? rec[field] : undefined;
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
            columns: gridColumns,
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
            columnDatasetNotDefined: gridColumns.length === 0,
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
