import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { Grid, GridProps } from "./Grid";
import * as React from "react";
import { IDetailsList, Selection, SelectionMode } from '@fluentui/react';

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
        const selection = new Selection();
        const componentRef = React.createRef<IDetailsList>();

        const props: GridProps = {
            datasetColumns: [],
            columns: {},
            sortedColumnIds: [],
            records: {},
            sortedRecordIds: [],
            shimmer: false,
            itemsLoading: false,
            selectionType: SelectionMode.none,
            selection,
            onNavigate: () => undefined,
            onCellAction: () => undefined,
            onSort: () => undefined,
            sorting: [],
            componentRef,
            selectOnFocus: false,
            ariaLabel: null,
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
