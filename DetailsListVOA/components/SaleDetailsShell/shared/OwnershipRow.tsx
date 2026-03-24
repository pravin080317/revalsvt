import * as React from 'react';
import { formatValue, toInitials } from '../utils';

export const OwnershipRow = ({ label, value, title }: { label: string; value: string; title?: string }): JSX.Element => {
  const displayValue = formatValue(value);

  return (
    <div className="voa-ownership-row">
      <span className="voa-ownership-row__label" title={title}>{label}</span>
      <span className="voa-avatar" aria-hidden="true">{toInitials(displayValue)}</span>
      <span className="voa-ownership-row__name">{displayValue}</span>
    </div>
  );
};

OwnershipRow.displayName = 'OwnershipRow';
