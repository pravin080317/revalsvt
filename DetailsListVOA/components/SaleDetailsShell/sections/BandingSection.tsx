import * as React from 'react';
import { Link, Text } from '@fluentui/react';
import { KvpRow } from '../shared/KvpRow';

interface BandingSectionProps {
  address: string;
  addressLink: string;
  billingAuthority: string;
  band: string;
  bandingEffectiveDate: string;
  composite: string;
  newTabHintId: string;
}

export const BandingSection: React.FC<BandingSectionProps> = ({
  address,
  addressLink,
  billingAuthority,
  band,
  bandingEffectiveDate,
  composite,
  newTabHintId,
}) => (
  <section className="voa-sale-details-card voa-banding-card" aria-labelledby="banding-heading">
    <div className="voa-sale-details-card__header">
      <Text as="h2" id="banding-heading" variant="large" className="voa-sale-details-card__title">
        Hereditament and Banding Details
      </Text>
    </div>

    <div className="voa-banding-layout">
      <div className="voa-banding-layout__address">
        <KvpRow
          label="Address"
          labelTitle="Hereditament address linked to this sale"
          value={
            addressLink ? (
              <Link
                href={addressLink}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open address ${address} in new tab`}
                aria-describedby={newTabHintId}
              >
                {address}
              </Link>
            ) : (
              address
            )
          }
        />
      </div>
      <div className="voa-banding-layout__grid">
        <KvpRow label="Billing Authority" value={billingAuthority} labelTitle="Local authority responsible for council tax billing" />
        <KvpRow label="Band" value={band} labelTitle="Council tax band (A–I) based on property value" />
        <KvpRow label="Banding Effective Date" value={bandingEffectiveDate} labelTitle="Date from which the current band applies" />
        <KvpRow label="Composite" value={composite} labelTitle="Whether the property has a composite (mixed domestic/non-domestic) element" />
      </div>
    </div>
  </section>
);

BandingSection.displayName = 'BandingSection';
