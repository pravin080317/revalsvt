import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  Stack,
  Text,
} from '@fluentui/react';
import * as React from 'react';

import { comboBoxStyles240x200 } from '../../utils/GridComboUtils';
import { buildAriaDescribedBy } from '../../utils/GridUiUtils';

interface GenericSingleSelectControlProps {
  label: string;
  title?: string;
  ariaDescribedBy?: string;
  options: IComboBoxOption[];
  selectedKey: string | number | undefined | null;
  isEditing: boolean;
  searchText: string;
  disambiguationHint?: string;
  onChange: (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    _index?: number,
    value?: string,
  ) => void;
  onKeyDownCapture: (event: React.KeyboardEvent<IComboBox>) => void;
  onInputValueChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<IComboBox>) => void;
  onMenuDismissed: () => void;
}

export const GenericSingleSelectControl = ({
  label,
  title,
  ariaDescribedBy,
  options,
  selectedKey,
  isEditing,
  searchText,
  disambiguationHint,
  onChange,
  onKeyDownCapture,
  onInputValueChange,
  onKeyDown,
  onMenuDismissed,
}: GenericSingleSelectControlProps): JSX.Element => {
  const hintId = disambiguationHint ? `voa-search-hint-${Math.random().toString(36).slice(2, 9)}` : undefined;

  return (
    <Stack.Item styles={{ root: { minWidth: 200 } }}>
      <>
        <ComboBox
          label={label}
          aria-describedby={buildAriaDescribedBy(ariaDescribedBy ?? (disambiguationHint ? hintId : undefined))}
          title={title}
          options={options}
          selectedKey={isEditing ? (null as any) : selectedKey}
          allowFreeform={false}
          allowFreeInput
          autoComplete="off"
          text={isEditing ? searchText : undefined}
          onChange={onChange}
          onKeyDownCapture={onKeyDownCapture}
          onInputValueChange={onInputValueChange}
          onKeyDown={onKeyDown}
          onMenuDismissed={onMenuDismissed}
          styles={comboBoxStyles240x200}
        />
        {disambiguationHint && hintId && (
          <Text id={hintId} variant="small" styles={{ root: { marginTop: 4 } }}>
            {disambiguationHint}
          </Text>
        )}
      </>
    </Stack.Item>
  );
};
