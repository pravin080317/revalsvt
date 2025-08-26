import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { Grid, GridProps } from "./Grid";
import * as React from "react";
import { IDetailsList, ISelection, Selection, SelectionMode } from '@fluentui/react';

export class DetailsListVOA implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const selection: ISelection = new Selection<ComponentFramework.PropertyHelper.DataSetApi.EntityRecord>();
        const componentRef = React.createRef<IDetailsList>();

        // Provide default columns and records so the grid renders with sample data on initial load
        const datasetColumns: ComponentFramework.PropertyHelper.DataSetApi.Column[] = [
            { name: 'col1', displayName: 'Column 1', dataType: 'SingleLine.Text', alias: 'col1', order: 1, visualSizeFactor: 100 },
            { name: 'col2', displayName: 'Column 2', dataType: 'SingleLine.Text', alias: 'col2', order: 2, visualSizeFactor: 100 },
            { name: 'col3', displayName: 'Column 3', dataType: 'SingleLine.Text', alias: 'col3', order: 3, visualSizeFactor: 100 },
            { name: 'col4', displayName: 'Column 4', dataType: 'SingleLine.Text', alias: 'col4', order: 4, visualSizeFactor: 100 },
            { name: 'col5', displayName: 'Column 5', dataType: 'SingleLine.Text', alias: 'col5', order: 5, visualSizeFactor: 100 },
        ];

        const records: Record<string, ComponentFramework.PropertyHelper.DataSetApi.EntityRecord> = {};
        const sortedRecordIds: string[] = [];

        interface RecordData {
            col1: string;
            col2: string;
            col3: string;
            col4: string;
            col5: string;
        }

        const dummyData: RecordData[] = [
            { col1: 'Row1-Col1', col2: 'Row1-Col2', col3: 'Row1-Col3', col4: 'Row1-Col4', col5: 'Row1-Col5' },
            { col1: 'Row2-Col1', col2: 'Row2-Col2', col3: 'Row2-Col3', col4: 'Row2-Col4', col5: 'Row2-Col5' },
        ];

        dummyData.forEach((data, index) => {
            const id = `row${index + 1}`;
            const record: ComponentFramework.PropertyHelper.DataSetApi.EntityRecord & RecordData = {
                ...data,
                getRecordId: () => id,
                getValue: (columnName: string) => data[columnName as keyof RecordData],
                getFormattedValue: (columnName: string) => data[columnName as keyof RecordData],
                getNamedReference: () => ({ id, name: data.col1, entityType: 'dummy' }),
            };
            records[id] = record;
            sortedRecordIds.push(id);
        });

        const props: GridProps = {
            datasetColumns,
            records,
            sortedRecordIds,
            shimmer: false,
            itemsLoading: false,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            selectionType: SelectionMode.none as SelectionMode,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            selection,
            onNavigate: () => undefined,
            onSort: () => undefined,
            sorting: [],
            componentRef,
            resources: context.resources,
        };
        return React.createElement(Grid, props);
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
