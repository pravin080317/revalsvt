import {
  Label,
  Text,
  TextField,
} from '@fluentui/react';
import * as React from 'react';

import { FocusableActionButton } from './GridSharedControls';
import { buildAriaDescribedBy } from '../../utils/GridUiUtils';

interface BulkSelectionFieldProps {
  selectFirstLabel: string;
  selectFirstPlaceholder: string;
  selectFirstHelperText: string;
  selectFirstSuffix: string;
  selectFirstButtonText: string;
  clearSelectionText: string;
  selectFirstInput: string;
  selectFirstError?: string;
  pageItemCount: number;
  selectedCount: number;
  selectionControlsDisabled: boolean;
  selectionControlsUnavailableReason?: string;
  clearSelectionUnavailableReason?: string;
  onSelectFirstInputChange: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => void;
  onSelectFirstInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectFirstOnPage: () => void;
  onClearPageSelection: () => void;
}

export const BulkSelectionField = ({
  selectFirstLabel,
  selectFirstPlaceholder,
  selectFirstHelperText,
  selectFirstSuffix,
  selectFirstButtonText,
  clearSelectionText,
  selectFirstInput,
  selectFirstError,
  pageItemCount,
  selectedCount,
  selectionControlsDisabled,
  selectionControlsUnavailableReason,
  clearSelectionUnavailableReason,
  onSelectFirstInputChange,
  onSelectFirstInputKeyDown,
  onSelectFirstOnPage,
  onClearPageSelection,
}: BulkSelectionFieldProps): JSX.Element => {
  return (
    <>
      <div className="voa-selection-controls__field">
        <Label htmlFor="voa-select-first" className="voa-selection-controls__label">
          {selectFirstLabel}
        </Label>
        <TextField
          id="voa-select-first"
          ariaLabel={selectFirstLabel}
          aria-describedby={buildAriaDescribedBy(
            'voa-select-first-help',
            selectionControlsDisabled ? 'voa-select-first-unavailable' : undefined,
          )}
          value={selectFirstInput}
          placeholder={selectFirstPlaceholder}
          type="number"
          min={1}
          max={pageItemCount}
          inputMode="numeric"
          disabled={selectionControlsDisabled}
          className={selectionControlsDisabled ? 'voa-focusable-disabled-field' : undefined}
          title={selectionControlsUnavailableReason}
          onChange={onSelectFirstInputChange}
          onKeyDown={onSelectFirstInputKeyDown}
          errorMessage={selectFirstError}
          styles={{ root: { maxWidth: 160 } }}
        />
        {selectionControlsDisabled && (
          <span id="voa-select-first-unavailable" className="voa-sr-only">
            {selectionControlsUnavailableReason}
          </span>
        )}
        <span id="voa-select-first-help" className="voa-sr-only">
          {selectFirstHelperText}
        </span>
        <Text variant="small" className="voa-selection-controls__suffix">
          {selectFirstSuffix}
        </Text>
      </div>
      <FocusableActionButton
        text={selectFirstButtonText}
        iconProps={{ iconName: 'Accept' }}
        onClick={onSelectFirstOnPage}
        unavailable={selectionControlsDisabled}
        unavailableReason={selectionControlsUnavailableReason}
        unavailableReasonId="voa-select-first-apply-unavailable"
        ariaLabel={selectFirstButtonText}
      />
      <FocusableActionButton
        text={clearSelectionText}
        iconProps={{ iconName: 'Clear' }}
        onClick={onClearPageSelection}
        unavailable={selectionControlsDisabled || selectedCount === 0}
        unavailableReason={clearSelectionUnavailableReason}
        unavailableReasonId="voa-clear-selection-unavailable"
        ariaLabel={clearSelectionText}
      />
    </>
  );
};
