import {
  DatePicker,
  DayOfWeek,
  IDatePickerStrings,
  Stack,
  Text,
} from '@fluentui/react';
import * as React from 'react';

interface GenericDateRangeSearchControlProps {
  startLabel: string;
  endLabel: string;
  from?: Date;
  to?: Date;
  fromTitle?: string;
  toTitle?: string;
  dateStrings: IDatePickerStrings;
  formatDate: (date?: Date) => string;
  parseDateFromString: (dateStr: string) => Date | null;
  invalidOrder: boolean;
  invalidOrderMessage?: string;
  onFromSelect: (date: Date | null | undefined) => void;
  onToSelect: (date: Date | null | undefined) => void;
}

export const GenericDateRangeSearchControl = ({
  startLabel,
  endLabel,
  from,
  to,
  fromTitle,
  toTitle,
  dateStrings,
  formatDate,
  parseDateFromString,
  invalidOrder,
  invalidOrderMessage = 'End date must be on or after start date.',
  onFromSelect,
  onToSelect,
}: GenericDateRangeSearchControlProps): JSX.Element => {
  return (
    <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
      <Stack.Item styles={{ root: { minWidth: 160 } }}>
        <DatePicker
          label={startLabel}
          firstDayOfWeek={DayOfWeek.Monday}
          strings={dateStrings}
          value={from}
          formatDate={formatDate}
          allowTextInput
          parseDateFromString={parseDateFromString}
          title={fromTitle}
          onSelectDate={onFromSelect}
        />
      </Stack.Item>
      <Stack.Item styles={{ root: { minWidth: 160 } }}>
        <DatePicker
          label={endLabel}
          firstDayOfWeek={DayOfWeek.Monday}
          strings={dateStrings}
          value={to}
          formatDate={formatDate}
          allowTextInput
          parseDateFromString={parseDateFromString}
          minDate={from}
          title={toTitle}
          onSelectDate={onToSelect}
        />
        {invalidOrder && (
          <Text variant="small" styles={{ root: { marginTop: 6, color: '#d4351c' } }} role="alert">
            {invalidOrderMessage}
          </Text>
        )}
      </Stack.Item>
    </Stack>
  );
};
