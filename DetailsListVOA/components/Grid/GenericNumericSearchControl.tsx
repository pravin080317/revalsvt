import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  Stack,
  TextField,
} from '@fluentui/react';
import * as React from 'react';

import { comboBoxStyles240x200 } from '../../utils/GridComboUtils';

interface GenericNumericSearchControlProps {
  optionsLabel: string;
  options: IComboBoxOption[];
  modeTitle?: string;
  selectedMode: string;
  minLabel: string;
  minTitle?: string;
  minValue: string;
  maxLabel: string;
  maxTitle?: string;
  maxValue: string;
  showMaxInput: boolean;
  onModeChange: (event: React.FormEvent<IComboBox>, option?: IComboBoxOption) => void;
  onMinChange: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => void;
  onMaxChange: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => void;
}

export const GenericNumericSearchControl = ({
  optionsLabel,
  options,
  modeTitle,
  selectedMode,
  minLabel,
  minTitle,
  minValue,
  maxLabel,
  maxTitle,
  maxValue,
  showMaxInput,
  onModeChange,
  onMinChange,
  onMaxChange,
}: GenericNumericSearchControlProps): JSX.Element => {
  return (
    <Stack horizontal wrap tokens={{ childrenGap: 8 }}>
      <Stack.Item styles={{ root: { minWidth: 140 } }}>
        <ComboBox
          label={optionsLabel}
          options={options}
          title={modeTitle}
          selectedKey={selectedMode}
          allowFreeform={false}
          autoComplete="off"
          onChange={onModeChange}
          styles={comboBoxStyles240x200}
        />
      </Stack.Item>
      <Stack.Item styles={{ root: { minWidth: 140 } }}>
        <TextField
          label={minLabel}
          type="number"
          title={minTitle}
          value={minValue}
          onChange={onMinChange}
        />
      </Stack.Item>
      {showMaxInput && (
        <Stack.Item styles={{ root: { minWidth: 140 } }}>
          <TextField
            label={maxLabel}
            type="number"
            title={maxTitle}
            value={maxValue}
            onChange={onMaxChange}
          />
        </Stack.Item>
      )}
    </Stack>
  );
};
