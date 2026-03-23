import * as React from 'react';

interface KvpRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  labelTitle?: string;
  highlighted?: boolean;
}

export const KvpRow: React.FC<KvpRowProps> = ({ label, value, labelTitle, highlighted }) => (
  <div className={`voa-kvp-row${highlighted ? ' voa-kvp-row--highlighted' : ''}`}>
    <span className="voa-kvp-row__label" title={labelTitle}>{label}</span>
    <span className="voa-kvp-row__value">{value}</span>
  </div>
);

KvpRow.displayName = 'KvpRow';
