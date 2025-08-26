/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    taskIdField: ComponentFramework.PropertyTypes.StringProperty;
    taskEntity: ComponentFramework.PropertyTypes.StringProperty;
    navigationTarget: ComponentFramework.PropertyTypes.StringProperty;
    pageSize: ComponentFramework.PropertyTypes.WholeNumberProperty;
    columnDisplayNames: ComponentFramework.PropertyTypes.StringProperty;
    columnMetadata: ComponentFramework.PropertyTypes.StringProperty;
    revalSalesDataset: ComponentFramework.PropertyTypes.DataSet;
}
export interface IOutputs {
    selectedTaskId?: string;
}
