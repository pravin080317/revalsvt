import {
  Stack,
  Text,
  TextField,
} from '@fluentui/react';
import * as React from 'react';

import { buildAriaDescribedBy, formatRequiredAriaLabel } from '../../utils/GridUiUtils';

interface SalesIdentifierSearchControlProps {
  id: string;
  label: string;
  placeholder: string;
  title?: string;
  value: string;
  errorMessage?: string;
  maxLength: number;
  onRenderRequiredLabel: () => JSX.Element;
  onChange: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => void;
  onBlur: () => void;
  minWidth?: number;
  inputMode?: 'numeric';
  hintId?: string;
  hintText?: string;
}

export const SalesIdentifierSearchControl = ({
  id,
  label,
  placeholder,
  title,
  value,
  errorMessage,
  maxLength,
  onRenderRequiredLabel,
  onChange,
  onBlur,
  minWidth = 260,
  inputMode,
  hintId,
  hintText,
}: SalesIdentifierSearchControlProps): JSX.Element => {
  return (
    <Stack.Item styles={{ root: { minWidth } }}>
      <>
        <TextField
          id={id}
          label={label}
          ariaLabel={formatRequiredAriaLabel(label, true)}
          placeholder={placeholder}
          title={title}
          onRenderLabel={onRenderRequiredLabel}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          errorMessage={errorMessage}
          inputMode={inputMode}
          maxLength={maxLength}
          aria-describedby={buildAriaDescribedBy(hintText ? hintId : undefined)}
        />
        {hintText && hintId && (
          <Text id={hintId} variant="small" className="voa-search-field-hint">
            {hintText}
          </Text>
        )}
      </>
    </Stack.Item>
  );
};
