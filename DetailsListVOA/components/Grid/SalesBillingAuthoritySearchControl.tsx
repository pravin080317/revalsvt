import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  Stack,
  TextField,
} from '@fluentui/react';
import * as React from 'react';

import { comboBoxStyles240x240 } from '../../utils/GridComboUtils';
import { buildAriaDescribedBy, formatRequiredAriaLabel } from '../../utils/GridUiUtils';

interface SalesSearchTextLike {
  fields: {
    billingAuthority: string;
    billingAuthorityReference: string;
  };
  placeholders: {
    billingAuthority: string;
    billingAuthorityReference: string;
  };
}

interface SalesBillingAuthoritySearchControlProps {
  salesSearchText: SalesSearchTextLike;
  billingAuthorityHint?: string;
  billingAuthorityHintId: string;
  billingAuthorityTitle?: string;
  billingAuthorityRefTitle?: string;
  filteredBillingAuthorityOptionsList: IComboBoxOption[];
  comboEditingSalesBillingAuthority: boolean;
  authority: string;
  billingAuthoritySearch: string;
  bacodeValue: string;
  displayBillingAuthorityError?: string;
  displayBillingAuthorityRefError?: string;
  addressFieldMaxLength: number;
  onRenderBillingAuthorityRequiredLabel: () => JSX.Element;
  onRenderBillingAuthorityReferenceRequiredLabel: () => JSX.Element;
  onBillingAuthorityComboChange: (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    index?: number,
    value?: string,
  ) => void;
  onBillingAuthorityComboKeyDownCapture: (event: React.KeyboardEvent<IComboBox>) => void;
  onBillingAuthorityComboInputValueChange: (value: string) => void;
  onBillingAuthorityComboKeyDown: (event: React.KeyboardEvent<IComboBox>) => void;
  onBillingAuthorityComboDismissed: () => void;
  onBillingAuthorityBlur: () => void;
  onBillingAuthorityReferenceChange: (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    value?: string,
  ) => void;
  onBillingAuthorityReferenceBlur: () => void;
  hintNode: React.ReactNode;
}

export const SalesBillingAuthoritySearchControl = ({
  salesSearchText,
  billingAuthorityHint,
  billingAuthorityHintId,
  billingAuthorityTitle,
  billingAuthorityRefTitle,
  filteredBillingAuthorityOptionsList,
  comboEditingSalesBillingAuthority,
  authority,
  billingAuthoritySearch,
  bacodeValue,
  displayBillingAuthorityError,
  displayBillingAuthorityRefError,
  addressFieldMaxLength,
  onRenderBillingAuthorityRequiredLabel,
  onRenderBillingAuthorityReferenceRequiredLabel,
  onBillingAuthorityComboChange,
  onBillingAuthorityComboKeyDownCapture,
  onBillingAuthorityComboInputValueChange,
  onBillingAuthorityComboKeyDown,
  onBillingAuthorityComboDismissed,
  onBillingAuthorityBlur,
  onBillingAuthorityReferenceChange,
  onBillingAuthorityReferenceBlur,
  hintNode,
}: SalesBillingAuthoritySearchControlProps): JSX.Element => {
  return (
    <>
      <Stack.Item styles={{ root: { minWidth: 240 } }}>
        <ComboBox
          id="sales-billingauthority"
          label={salesSearchText.fields.billingAuthority}
          ariaLabel={formatRequiredAriaLabel(salesSearchText.fields.billingAuthority, true)}
          aria-describedby={buildAriaDescribedBy(billingAuthorityHint ? billingAuthorityHintId : undefined)}
          placeholder={salesSearchText.placeholders.billingAuthority}
          title={billingAuthorityTitle}
          onRenderLabel={onRenderBillingAuthorityRequiredLabel}
          options={filteredBillingAuthorityOptionsList}
          selectedKey={comboEditingSalesBillingAuthority ? null : authority}
          allowFreeform={false}
          allowFreeInput
          autoComplete="off"
          text={comboEditingSalesBillingAuthority ? billingAuthoritySearch : undefined}
          onChange={onBillingAuthorityComboChange}
          onKeyDownCapture={onBillingAuthorityComboKeyDownCapture}
          onInputValueChange={onBillingAuthorityComboInputValueChange}
          onKeyDown={onBillingAuthorityComboKeyDown}
          onMenuDismissed={onBillingAuthorityComboDismissed}
          onBlur={onBillingAuthorityBlur}
          errorMessage={displayBillingAuthorityError}
          styles={comboBoxStyles240x240}
        />
        {hintNode}
      </Stack.Item>
      <Stack.Item styles={{ root: { minWidth: 240 } }}>
        <TextField
          id="sales-bacode"
          label={salesSearchText.fields.billingAuthorityReference}
          ariaLabel={formatRequiredAriaLabel(salesSearchText.fields.billingAuthorityReference, true)}
          placeholder={salesSearchText.placeholders.billingAuthorityReference}
          title={billingAuthorityRefTitle}
          onRenderLabel={onRenderBillingAuthorityReferenceRequiredLabel}
          value={bacodeValue}
          onChange={onBillingAuthorityReferenceChange}
          onBlur={onBillingAuthorityReferenceBlur}
          errorMessage={displayBillingAuthorityRefError}
          maxLength={addressFieldMaxLength}
        />
      </Stack.Item>
    </>
  );
};
