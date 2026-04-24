import {
  ComboBox,
  ICalloutProps,
  IComboBox,
  IComboBoxOption,
  Text,
} from '@fluentui/react';
import * as React from 'react';

import { comboBoxStyles240x200 } from '../../utils/GridComboUtils';

interface SearchByComboFieldProps {
  id: string;
  ariaLabel: string;
  ariaDescribedBy?: string;
  placeholder?: string;
  title?: string;
  options: IComboBoxOption[];
  selectedKey?: string | number | string[] | number[] | null;
  text?: string;
  hintText?: string;
  hintId?: string;
  calloutProps?: ICalloutProps;
  onChange: (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    index?: number,
    value?: string,
  ) => void;
  onKeyDownCapture: (event: React.KeyboardEvent<IComboBox>) => void;
  onInputValueChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<IComboBox>) => void;
  onMenuDismissed: () => void;
}

export const SearchByComboField = ({
  id,
  ariaLabel,
  ariaDescribedBy,
  placeholder,
  title,
  options,
  selectedKey,
  text,
  hintText,
  hintId,
  calloutProps,
  onChange,
  onKeyDownCapture,
  onInputValueChange,
  onKeyDown,
  onMenuDismissed,
}: SearchByComboFieldProps): JSX.Element => {
  return (
    <>
      <ComboBox
        id={id}
        ariaLabel={ariaLabel}
        aria-describedby={ariaDescribedBy}
        placeholder={placeholder}
        title={title}
        options={options}
        selectedKey={selectedKey}
        calloutProps={calloutProps}
        onChange={onChange}
        onKeyDownCapture={onKeyDownCapture}
        allowFreeform={false}
        allowFreeInput
        autoComplete="off"
        text={text}
        onInputValueChange={onInputValueChange}
        onKeyDown={onKeyDown}
        onMenuDismissed={onMenuDismissed}
        styles={comboBoxStyles240x200}
      />
      {hintText && hintId && (
        <Text id={hintId} variant="small" styles={{ root: { marginTop: 4 } }}>
          {hintText}
        </Text>
      )}
    </>
  );
};
