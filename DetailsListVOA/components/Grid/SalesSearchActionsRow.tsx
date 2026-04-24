import {
  DefaultButton,
  Spinner,
  SpinnerSize,
  Stack,
} from '@fluentui/react';
import * as React from 'react';

import { FocusableActionButton } from './GridSharedControls';

interface SalesSearchActionsRowProps {
  isLoading: boolean;
  loadingAriaLabel: string;
  searchText: string;
  searchAriaLabel: string;
  searchUnavailable: boolean;
  searchUnavailableReason?: string;
  searchUnavailableReasonId: string;
  onSearch: () => void;
  onUnavailableClick?: () => void;
  clearText: string;
  clearAriaLabel: string;
  onClear: () => void;
}

export const SalesSearchActionsRow = ({
  isLoading,
  loadingAriaLabel,
  searchText,
  searchAriaLabel,
  searchUnavailable,
  searchUnavailableReason,
  searchUnavailableReasonId,
  onSearch,
  onUnavailableClick,
  clearText,
  clearAriaLabel,
  onClear,
}: SalesSearchActionsRowProps): JSX.Element => {
  return (
    <Stack horizontal wrap verticalAlign="center" tokens={{ childrenGap: 12 }}>
      {isLoading && (
        <Spinner size={SpinnerSize.small} ariaLabel={loadingAriaLabel} />
      )}
      <FocusableActionButton
        text={searchText}
        iconProps={{ iconName: 'Search' }}
        onClick={onSearch}
        onUnavailableClick={onUnavailableClick}
        unavailable={searchUnavailable}
        unavailableReason={searchUnavailableReason}
        unavailableReasonId={searchUnavailableReasonId}
        ariaLabel={searchAriaLabel}
      />
      <DefaultButton
        text={clearText}
        iconProps={{ iconName: 'ClearFilter' }}
        onClick={onClear}
        ariaLabel={clearAriaLabel}
        className="voa-prefilter-clear"
      />
    </Stack>
  );
};
