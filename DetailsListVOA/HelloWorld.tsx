import * as React from 'react';
import { DetailsList, IColumn } from '@fluentui/react/lib/DetailsList';
import { initializeIcons } from '@fluentui/font-icons-mdl2';

// Cast to a typed function to satisfy lint rules.
(initializeIcons as () => void)();

/** Props accepted by the HelloWorld component. */
export interface IHelloWorldProps {
  /** Display name shown above the list. */
  name: string;
}

interface IItem {
  key: string;
  name: string;
  value: number;
}

export class HelloWorld extends React.Component<IHelloWorldProps> {
  private readonly _columns: IColumn[] = [
    { key: 'name', name: 'Name', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'value', name: 'Value', fieldName: 'value', minWidth: 50, maxWidth: 100, isResizable: true }
  ];

  private readonly _items: IItem[] = [
    { key: '1', name: 'Item 1', value: 1 },
    { key: '2', name: 'Item 2', value: 2 }
  ];

  public render(): React.ReactNode {
    return (
      <div>
        <h3>{this.props.name}</h3>
        <DetailsList items={this._items} columns={this._columns} />
      </div>
    );
  }
}
