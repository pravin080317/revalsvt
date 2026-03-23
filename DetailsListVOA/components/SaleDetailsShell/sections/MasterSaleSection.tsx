import * as React from 'react';
import { Text } from '@fluentui/react';
import { MasterSaleViewModel } from '../types';
import { KvpRow } from '../shared/KvpRow';

interface MasterSaleSectionProps {
  masterSale: MasterSaleViewModel;
  highlighted?: boolean;
}

const toMultilineValue = (value: string): React.ReactNode => {
  if (value.trim() === '-' || !value.includes('\n')) {
    return value;
  }

  const items = value.split('\n').map((v) => v.trim()).filter(Boolean);
  return (
    <span className="voa-summary-flag-chips">
      {items.map((item) => (
        <span key={item} className="voa-summary-flag-chip">{item}</span>
      ))}
    </span>
  );
};

export const MasterSaleSection: React.FC<MasterSaleSectionProps> = ({ masterSale, highlighted }) => (
  <section className="voa-sale-details-card voa-master-sale-card" aria-labelledby="master-sale-heading">
    <div className="voa-sale-details-card__header">
      <Text as="h2" id="master-sale-heading" variant="large" className="voa-sale-details-card__title">
        Master Sale Details and Calculated Values
      </Text>
    </div>

    <div className="voa-master-sale-grid">
      <div className="voa-master-sale-grid__column">
        <KvpRow label="Sale Price" value={masterSale.salePrice} highlighted={highlighted} />
        <KvpRow label="Transaction Date" value={masterSale.transactionDate} highlighted={highlighted} />
        <KvpRow label="Model Value" value={masterSale.modelValue} />
      </div>

      <div className="voa-master-sale-grid__column">
        <KvpRow label="Sale Source" value={masterSale.saleSource} highlighted={highlighted} />
        <KvpRow label="Overall Flag" value={masterSale.overallFlag} />
        <KvpRow label="Ratio" labelTitle="Ratio = Model Value / HPI Adjusted Price" value={masterSale.ratio} highlighted={highlighted} />
      </div>

      <div className="voa-master-sale-grid__column">
        <KvpRow label="Review Flags" value={toMultilineValue(masterSale.reviewFlags)} />
        <KvpRow label="HPI Adjusted Price" value={masterSale.hpiAdjustedPrice} highlighted={highlighted} />
        <KvpRow label="Summary Flags" value={toMultilineValue(masterSale.summaryFlags)} />
      </div>
    </div>

    <div className="voa-master-sale-repeat">
      <h3 className="voa-master-sale-repeat__title">Repeat Sales</h3>
      <div className="voa-master-sale-repeat__grid">
        <KvpRow label="Previous Ratio Range" value={masterSale.previousRatioRange} />
        <KvpRow label="Latest Ratio Range" value={masterSale.latestRatioRange} />
      </div>
    </div>
  </section>
);

MasterSaleSection.displayName = 'MasterSaleSection';
