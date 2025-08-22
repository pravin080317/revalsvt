/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import * as React from 'react';
import { IColumn } from '@fluentui/react/lib/DetailsList';
import { ShimmeredDetailsList } from '@fluentui/react/lib/ShimmeredDetailsList';
import { ThemeProvider, ITheme } from '@fluentui/react';
import { initializeIcons } from '@fluentui/font-icons-mdl2';

// Cast to a typed function to satisfy lint rules.
(initializeIcons as () => void)();

/** Props accepted by the Grid component. */
export interface IGridProps {
  /** Display name shown above the list. */
  name: string;
  /** Optional theme applied to the list. */
  theme?: ITheme;
}

interface IItem {
  key: string;
  name: string;
  value: number;
}

export class Grid extends React.Component<IGridProps> {
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
      <ThemeProvider theme={this.props.theme}>
        <div>
          <h3>{this.props.name}</h3>
          <ShimmeredDetailsList items={this._items} columns={this._columns} />
        </div>
      </ThemeProvider>
    );
  }
}
