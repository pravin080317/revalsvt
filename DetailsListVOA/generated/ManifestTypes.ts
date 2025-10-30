export interface IInputs {
    navigationTarget: ComponentFramework.PropertyTypes.StringProperty;
    canvasScreenName: ComponentFramework.PropertyTypes.StringProperty;
    pageSize: ComponentFramework.PropertyTypes.WholeNumberProperty;
    columnDisplayNames: ComponentFramework.PropertyTypes.StringProperty;
    columnConfig: ComponentFramework.PropertyTypes.StringProperty;
    columnConfigProfile: ComponentFramework.PropertyTypes.StringProperty;
    apiBaseUrl: ComponentFramework.PropertyTypes.StringProperty;
    apimEndpoint: ComponentFramework.PropertyTypes.StringProperty;
    customApiName: ComponentFramework.PropertyTypes.StringProperty;
    tableKey: ComponentFramework.PropertyTypes.StringProperty;
}

export interface IOutputs {
    selectedTaskId?: string;
    selectedSaleId?: string;
    saleDetails?: string;
}
