import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  Text,
  TooltipHost,
} from '@fluentui/react';
import * as React from 'react';

import { comboBoxStyles240x240 } from '../../utils/GridComboUtils';

interface PrefilterMultiSelectComboFieldProps {
  id: string;
  ariaLabel: string;
  ariaDescribedBy?: string;
  placeholder?: string;
  title?: string;
  options: IComboBoxOption[];
  selectedKeys: string[];
  searchText: string;
  hintText?: string;
  hintId?: string;
  errorText?: string;
  errorId?: string;
  errorColor?: string;
  selectionSummary?: string;
  selectionSummaryTooltip?: string;
  selectionSummaryClassName?: string;
  onChange: (event: React.FormEvent<IComboBox>, option?: IComboBoxOption) => void;
  onKeyDown: (event: React.KeyboardEvent<IComboBox>) => void;
  onInputValueChange: (value: string) => void;
  onMenuDismissed: () => void;
}

export const PrefilterMultiSelectComboField = ({
  id,
  ariaLabel,
  ariaDescribedBy,
  placeholder,
  title,
  options,
  selectedKeys,
  searchText,
  hintText,
  hintId,
  errorText,
  errorId,
  errorColor,
  selectionSummary,
  selectionSummaryTooltip,
  selectionSummaryClassName,
  onChange,
  onKeyDown,
  onInputValueChange,
  onMenuDismissed,
}: PrefilterMultiSelectComboFieldProps): JSX.Element => {
  return (
    <>
      <ComboBox
        id={id}
        ariaLabel={ariaLabel}
        aria-describedby={ariaDescribedBy}
        placeholder={placeholder}
        title={title}
        multiSelect
        options={options}
        selectedKey={selectedKeys}
        onChange={onChange}
        allowFreeform={false}
        allowFreeInput
        autoComplete="off"
        text={searchText.trim() ? searchText : undefined}
        persistMenu
        onKeyDown={onKeyDown}
        onInputValueChange={onInputValueChange}
        onMenuDismissed={onMenuDismissed}
        styles={comboBoxStyles240x240}
      />
      {hintText && hintId && (
        <Text id={hintId} variant="small" styles={{ root: { marginTop: 4 } }}>
          {hintText}
        </Text>
      )}
      {errorText && errorId && (
        <Text
          id={errorId}
          variant="small"
          role="alert"
          aria-live="assertive"
          styles={{ root: { color: errorColor, marginTop: 2 } }}
        >
          {errorText}
        </Text>
      )}
      {selectionSummary && (
        <TooltipHost content={selectionSummaryTooltip ?? selectionSummary}>
          <Text variant="small" className={selectionSummaryClassName}>
            {selectionSummary}
          </Text>
        </TooltipHost>
      )}
    </>
  );
};
