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
        <KvpRow label="Sale Price" value={masterSale.salePrice} highlighted={highlighted} labelTitle="The sale price recorded at the point of transaction" />
        <KvpRow label="Transaction Date" value={masterSale.transactionDate} highlighted={highlighted} labelTitle="Date the property sale was completed" />
        <KvpRow label="Model Value" value={masterSale.modelValue} labelTitle="Automated valuation model estimate for this property" />
      </div>

      <div className="voa-master-sale-grid__column">
        <KvpRow label="Sale Source" value={masterSale.saleSource} highlighted={highlighted} labelTitle="Origin of the sale data (e.g. LRPPD, SDLT)" />
        <KvpRow label="Overall Flag" value={masterSale.overallFlag} labelTitle="Aggregated assessment flag for this sale record" />
        <KvpRow label="Ratio" labelTitle="Ratio = Model Value ÷ HPI Adjusted Price" value={masterSale.ratio} highlighted={highlighted} />
      </div>

      <div className="voa-master-sale-grid__column">
        <KvpRow label="Review Flags" value={toMultilineValue(masterSale.reviewFlags)} labelTitle="Flags indicating specific review conditions" />
        <KvpRow label="HPI Adjusted Price" value={masterSale.hpiAdjustedPrice} highlighted={highlighted} labelTitle="Sale price adjusted using the House Price Index (HPI)" />
        <KvpRow label="Summary Flags" value={toMultilineValue(masterSale.summaryFlags)} labelTitle="Summary indicator flags for this sale" />
      </div>
    </div>

    <div className="voa-master-sale-repeat">
      <h3 className="voa-master-sale-repeat__title">Repeat Sales</h3>
      <div className="voa-master-sale-repeat__grid">
        <KvpRow label="Previous Ratio Range" value={masterSale.previousRatioRange} labelTitle="Historical ratio range from earlier repeat sale evidence" />
        <KvpRow label="Latest Ratio Range" value={masterSale.latestRatioRange} labelTitle="Most recent ratio range derived from repeat sale evidence" />
      </div>
    </div>
  </section>
);

MasterSaleSection.displayName = 'MasterSaleSection';
