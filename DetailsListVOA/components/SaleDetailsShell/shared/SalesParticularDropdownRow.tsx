import * as React from 'react';
import { Dropdown, IconButton, IDropdownOption } from '@fluentui/react';

interface SalesParticularDropdownRowProps {
  id: string;
  label: string;
  selectedKey?: string;
  placeholder?: string;
  options: IDropdownOption[];
  disabled?: boolean;
  required?: boolean;
  infoTooltip?: string;
  onInfoClick?: () => void;
  errorMessage?: string;
  onChange: (nextValue: string) => void;
}

export const SalesParticularDropdownRow: React.FC<SalesParticularDropdownRowProps> = ({
  id,
  label,
  selectedKey,
  placeholder = 'Select item',
  options,
  disabled,
  required = false,
  infoTooltip,
  onInfoClick,
  errorMessage,
  onChange,
}) => (
  <div className="voa-sales-particular-row">
    <label htmlFor={id} className="voa-sales-particular-row__label">
      {label}
      {required && (
        <>
          <span className="voa-required-marker" aria-hidden="true"> *</span>
          <span className="voa-visually-hidden"> (required)</span>
        </>
      )}
    </label>
    <div className="voa-sales-particular-row__control">
      <div className="voa-sales-particular-row__control-wrap">
        <Dropdown
          id={id}
          placeholder={placeholder}
          selectedKey={selectedKey}
          options={options}
          disabled={disabled}
          onChange={(_, option) => onChange((option?.key as string) ?? '')}
          ariaLabel={label}
          className={`voa-sales-particular-row__dropdown${errorMessage ? ' voa-sales-particular-row__dropdown--error' : ''}`}
        />
        {infoTooltip && (
          <IconButton
            iconProps={{ iconName: 'Info' }}
            ariaLabel={`${label} information`}
            title={infoTooltip}
            className="voa-sales-particular-row__info"
            onClick={onInfoClick}
          />
        )}
      </div>
      {errorMessage && <span className="voa-sales-particular-row__error" role="alert">{errorMessage}</span>}
    </div>
  </div>
);

SalesParticularDropdownRow.displayName = 'SalesParticularDropdownRow';
