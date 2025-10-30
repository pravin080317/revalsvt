import './initFluentIcons';
import { IInputs, IOutputs } from './generated/ManifestTypes';
import * as React from 'react';
import { PCFContext } from './components/context/PCFContext';
import { DetailsListHost } from './components/DetailsListHost/DetailsListHost';

export class DetailsListVOA implements ComponentFramework.ReactControl<IInputs, IOutputs> {
  private notifyOutputChanged: () => void;
  private selectedTaskId?: string;
  private selectedSaleId?: string;

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
  ): void {
    this.notifyOutputChanged = notifyOutputChanged;
  }

  public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
    return React.createElement(
      PCFContext.Provider,
      { value: context },
      React.createElement(DetailsListHost, {
        context,
        onRowInvoke: (args) => {
          this.selectedTaskId = args?.taskId;
          this.selectedSaleId = args?.saleId;
          this.notifyOutputChanged();
        },
      }),
    );
  }

  public getOutputs(): IOutputs {
    return { selectedTaskId: this.selectedTaskId, selectedSaleId: this.selectedSaleId } as IOutputs;
  }

  public destroy(): void { return; }
}
