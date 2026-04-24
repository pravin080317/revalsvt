import {
  DefaultButton,
  Stack,
} from '@fluentui/react';
import * as React from 'react';

import { FocusableActionButton } from './GridSharedControls';

interface PrefilterActionsRowProps {
  searchText: string;
  searchAriaLabel: string;
  searchUnavailable: boolean;
  searchUnavailableReason?: string;
  searchUnavailableReasonId: string;
  clearText: string;
  clearAriaLabel: string;
  showClear: boolean;
  clearClassName: string;
  onSearch: () => void;
  onClear: () => void;
}

export const PrefilterActionsRow = ({
  searchText,
  searchAriaLabel,
  searchUnavailable,
  searchUnavailableReason,
  searchUnavailableReasonId,
  clearText,
  clearAriaLabel,
  showClear,
  clearClassName,
  onSearch,
  onClear,
}: PrefilterActionsRowProps): JSX.Element => {
  return (
    <div className="voa-prefilter-field voa-prefilter-actions">
      <span className="voa-prefilter-label-spacer" aria-hidden="true"></span>
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }}>
        <FocusableActionButton
          text={searchText}
          iconProps={{ iconName: 'Search' }}
          onClick={onSearch}
          unavailable={searchUnavailable}
          unavailableReason={searchUnavailableReason}
          unavailableReasonId={searchUnavailableReasonId}
          ariaLabel={searchAriaLabel}
        />
        {showClear && (
          <DefaultButton
            text={clearText}
            iconProps={{ iconName: 'ClearFilter' }}
            onClick={onClear}
            aria-label={clearAriaLabel}
            className={clearClassName}
          />
        )}
      </Stack>
    </div>
  );
};
