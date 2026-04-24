import * as React from 'react';

import { FocusableActionButton } from './GridSharedControls';

interface CompactClearSelectionButtonProps {
  text: string;
  selectedCount: number;
  unavailableReason?: string;
  unavailableReasonId: string;
  ariaLabel: string;
  onClear: () => void;
}

export const CompactClearSelectionButton = ({
  text,
  selectedCount,
  unavailableReason,
  unavailableReasonId,
  ariaLabel,
  onClear,
}: CompactClearSelectionButtonProps): JSX.Element => {
  return (
    <FocusableActionButton
      text={text}
      iconProps={{ iconName: 'Clear' }}
      onClick={onClear}
      unavailable={selectedCount === 0}
      unavailableReason={unavailableReason}
      unavailableReasonId={unavailableReasonId}
      ariaLabel={ariaLabel}
    />
  );
};
