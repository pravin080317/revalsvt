import {
  Stack,
  Text,
  TextField,
} from '@fluentui/react';
import * as React from 'react';

interface GenericTextSearchControlProps {
  label: string;
  placeholder?: string;
  title?: string;
  value: string;
  errorMessage?: string;
  inputMode?: 'decimal' | 'numeric' | 'search' | 'tel' | 'text' | 'url' | 'email';
  controlType?: 'text' | 'textContains' | 'textPrefix';
  showPostcodeHint?: boolean;
  postcodeHintText?: string;
  onChange: (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value?: string,
  ) => void;
}

export const GenericTextSearchControl = ({
  label,
  placeholder,
  title,
  value,
  errorMessage,
  inputMode,
  controlType = 'text',
  showPostcodeHint = false,
  postcodeHintText,
  onChange,
}: GenericTextSearchControlProps): JSX.Element => {
  const minWidth = controlType === 'textContains' ? 260 : 200;

  return (
    <>
      <Stack.Item styles={{ root: { minWidth } }}>
        <TextField
          label={label}
          placeholder={placeholder}
          title={title}
          value={value}
          onChange={onChange}
          errorMessage={errorMessage}
          inputMode={inputMode}
        />
      </Stack.Item>
      {showPostcodeHint && postcodeHintText && (
        <Text variant="small" styles={{ root: { marginTop: 4 } }}>
          {postcodeHintText}
        </Text>
      )}
    </>
  );
};
