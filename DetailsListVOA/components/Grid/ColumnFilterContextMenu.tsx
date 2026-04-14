import * as React from 'react';
import { ContextualMenu, DirectionalHint, IContextualMenuItem } from '@fluentui/react';

export interface ColumnFilterContextMenuProps {
  isVisible: boolean;
  target?: HTMLElement;
  items: IContextualMenuItem[];
  onDismiss: () => void;
}

export const ColumnFilterContextMenu: React.FC<ColumnFilterContextMenuProps> = ({
  isVisible,
  target,
  items,
  onDismiss,
}) => {
  if (!isVisible || !target) return null;

  return (
    <ContextualMenu
      target={target}
      items={items}
      onDismiss={onDismiss}
      directionalHint={DirectionalHint.bottomLeftEdge}
      calloutProps={{ setInitialFocus: true }}
    />
  );
};
