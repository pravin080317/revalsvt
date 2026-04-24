import {
  DefaultButton,
  IButtonStyles,
  Label,
  PrimaryButton,
} from '@fluentui/react';
import * as React from 'react';

import { buildAriaDescribedBy, joinClassNames } from '../../utils/GridUiUtils';

export interface FocusableActionButtonProps {
  ariaCurrent?: 'page';
  ariaDescribedBy?: string;
  ariaLabel: string;
  buttonType?: 'default' | 'primary';
  children?: React.ReactNode;
  className?: string;
  iconProps?: { iconName: string };
  onClick: () => void;
  onUnavailableClick?: () => void;
  styles?: IButtonStyles;
  dataTestId?: string;
  text?: string;
  title?: string;
  unavailable?: boolean;
  unavailableReason?: string;
  unavailableReasonId?: string;
}

export const FocusableActionButton = ({
  ariaCurrent,
  ariaDescribedBy,
  ariaLabel,
  buttonType = 'default',
  children,
  className,
  iconProps,
  onClick,
  onUnavailableClick,
  styles,
  dataTestId,
  text,
  title,
  unavailable = false,
  unavailableReason,
  unavailableReasonId,
}: FocusableActionButtonProps): JSX.Element => {
  const ButtonComponent = buttonType === 'primary' ? PrimaryButton : DefaultButton;
  const handleClick = React.useCallback((event?: React.MouseEvent<unknown>) => {
    if (unavailable) {
      onUnavailableClick?.();
      event?.preventDefault();
      event?.stopPropagation();
      return;
    }

    onClick();
  }, [onClick, onUnavailableClick, unavailable]);

  const describedBy = buildAriaDescribedBy(
    ariaDescribedBy,
    unavailable && unavailableReason ? unavailableReasonId : undefined,
  );

  return (
    <>
      {unavailable && unavailableReason && unavailableReasonId && (
        <span id={unavailableReasonId} className="voa-sr-only">
          {unavailableReason}
        </span>
      )}
      <ButtonComponent
        disabled={unavailable}
        text={text}
        iconProps={iconProps}
        onClick={handleClick}
        data-testid={dataTestId}
        aria-describedby={describedBy}
        ariaLabel={ariaLabel}
        aria-current={ariaCurrent}
        className={joinClassNames(className, unavailable ? 'voa-focusable-disabled-button' : undefined)}
        styles={styles}
        title={unavailable ? unavailableReason ?? title : title}
      >
        {children}
      </ButtonComponent>
    </>
  );
};

export const renderLabelWithRequired = (
  text: string,
  options?: {
    htmlFor?: string;
    id?: string;
    className?: string;
    required?: boolean;
  },
): JSX.Element => (
  <Label htmlFor={options?.htmlFor} id={options?.id} className={options?.className}>
    <span>{text}</span>
    {options?.required && (
      <>
        <span className="voa-required-indicator" aria-hidden="true"> *</span>
        <span className="voa-sr-only"> required</span>
      </>
    )}
  </Label>
);
