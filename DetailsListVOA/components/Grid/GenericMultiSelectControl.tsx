import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  Stack,
  Text,
} from '@fluentui/react';
import * as React from 'react';

import { comboBoxStyles240x200 } from '../../utils/GridComboUtils';

interface GenericMultiSelectControlProps {
  label: string;
  title?: string;
  ariaDescribedBy?: string;
  options: IComboBoxOption[];
  selectedKeys: string[];
  searchText: string;
  disambiguationHint?: string;
  hintId?: string;
  onChange: (event: React.FormEvent<IComboBox>, option?: IComboBoxOption) => void;
  onInputValueChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<IComboBox>) => void;
  onMenuDismissed: () => void;
}

export const GenericMultiSelectControl = ({
  label,
  title,
  ariaDescribedBy,
  options,
  selectedKeys,
  searchText,
  disambiguationHint,
  hintId,
  onChange,
  onInputValueChange,
  onKeyDown,
  onMenuDismissed,
}: GenericMultiSelectControlProps): JSX.Element => {
  return (
    <Stack.Item styles={{ root: { minWidth: 200 } }}>
      <>
        <ComboBox
          label={label}
          aria-describedby={ariaDescribedBy}
          multiSelect
          allowFreeform={false}
          allowFreeInput
          autoComplete="on"
          text={searchText.trim() ? searchText : undefined}
          persistMenu
          options={options}
          selectedKey={selectedKeys}
          title={title}
          onChange={onChange}
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
