export interface IInputs {
    revalSalesDataset: ComponentFramework.PropertyTypes.DataSet;
    taskIdField: ComponentFramework.PropertyTypes.StringProperty;
    taskEntity: ComponentFramework.PropertyTypes.StringProperty;
    navigationTarget: ComponentFramework.PropertyTypes.StringProperty;
    pageSize: ComponentFramework.PropertyTypes.WholeNumberProperty;
    columnDisplayNames: ComponentFramework.PropertyTypes.StringProperty;
}

export interface IOutputs {
    selectedTaskId?: string;
    columnDisplayNames?: string;
}
