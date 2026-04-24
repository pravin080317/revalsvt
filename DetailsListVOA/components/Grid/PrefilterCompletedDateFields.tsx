import {
  DatePicker,
  DayOfWeek,
  ICalendarStrings,
  Text,
  TextField,
} from '@fluentui/react';
import * as React from 'react';

interface PrefilterCompletedDateFieldsProps {
  fromPlaceholder: string;
  fromValue: Date | null | undefined;
  toFormattedValue: string;
  fromAriaLabel: string;
  fromTitle?: string;
  toAriaLabel: string;
  toTitle?: string;
  fromDateError?: string;
  errorColor: string;
  toDateNote?: string;
  maxDate: Date;
  dateStrings: ICalendarStrings;
  formatDate: (date?: Date) => string;
  parseDateFromString: (dateStr: string) => Date | null;
  onSelectDate: (date?: Date | null) => void;
}

export const PrefilterCompletedDateFields = ({
  fromPlaceholder,
  fromValue,
  toFormattedValue,
  fromAriaLabel,
  fromTitle,
  toAriaLabel,
  toTitle,
  fromDateError,
  errorColor,
  toDateNote,
  maxDate,
  dateStrings,
  formatDate,
  parseDateFromString,
  onSelectDate,
}: PrefilterCompletedDateFieldsProps): JSX.Element => {
  return (
    <div className="voa-prefilter-date-fields">
      <DatePicker
        placeholder={fromPlaceholder}
        firstDayOfWeek={DayOfWeek.Monday}
        strings={dateStrings}
        value={fromValue ?? undefined}
        formatDate={formatDate}
        allowTextInput
        parseDateFromString={parseDateFromString}
        onSelectDate={onSelectDate}
        maxDate={maxDate}
        styles={{ root: { width: 180 } }}
        ariaLabel={fromAriaLabel}
        title={fromTitle}
      />
      {fromDateError && (
        <Text
          variant="small"
          role="alert"
          aria-live="assertive"
          styles={{ root: { color: errorColor, marginTop: -2 } }}
        >
          {fromDateError}
        </Text>
      )}
      <span id="voa-prefilter-to-date-note" className="voa-sr-only">
        {toDateNote}
      </span>
      <TextField
        value={toFormattedValue}
        disabled
        aria-describedby="voa-prefilter-to-date-note"
        className="voa-focusable-disabled-field"
        styles={{ root: { width: 180 } }}
        ariaLabel={toAriaLabel}
        title={toTitle}
      />
    </div>
  );
};
