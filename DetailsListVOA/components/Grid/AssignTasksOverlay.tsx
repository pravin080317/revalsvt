import * as React from 'react';
import {
  DefaultButton,
  DetailsList,
  FocusTrapZone,
  IColumn,
  IDetailsRowProps,
  MessageBar,
  MessageBarType,
  SearchBox,
  SelectionMode,
  Spinner,
  SpinnerSize,
  Stack,
  Text,
} from '@fluentui/react';
import { AssignUser } from '../../Component.types';

export interface AssignTasksOverlayProps {
  isOpen: boolean;
  assignLoading: boolean;
  assignUsersLoading: boolean;
  assignHeaderText: string;
  assignTasksText: {
    aria: { backToManager: string; closeAssign: string };
    searchPlaceholder: string;
    loadingUsersText: string;
  };
  commonCloseText: string;
  commonBackText: string;
  commonClearText: string;
  assignSearch: string;
  assignSearchUnavailableReason?: string;
  assignSearchAriaDescribedBy?: string;
  assignLoadingText: string;
  assignUsersInfo?: string;
  dismissedAssignUsersInfo: boolean;
  assignUsersError?: string;
  dismissedAssignUsersError: boolean;
  assignUserListTitle: string;
  showDisabledNote: boolean;
  assignAlreadyAssignedReason: string;
  assignListItems: AssignUser[];
  assignColumns: IColumn[];
  onRenderAssignUserRow: (rowProps?: IDetailsRowProps, defaultRender?: (props?: IDetailsRowProps) => JSX.Element | null) => JSX.Element | null;
  onAssignSearchChange: (value: string) => void;
  onAssignItemInvoked: (item?: AssignUser) => void;
  onDismissAssignUsersInfo: () => void;
  onDismissAssignUsersError: () => void;
  onBack: () => void;
  onClose: () => void;
  assignConfirmButton: React.ReactNode;
}

export const AssignTasksOverlay: React.FC<AssignTasksOverlayProps> = ({
  isOpen,
  assignLoading,
  assignUsersLoading,
  assignHeaderText,
  assignTasksText,
  commonCloseText,
  commonBackText,
  commonClearText,
  assignSearch,
  assignSearchUnavailableReason,
  assignSearchAriaDescribedBy,
  assignLoadingText,
  assignUsersInfo,
  dismissedAssignUsersInfo,
  assignUsersError,
  dismissedAssignUsersError,
  assignUserListTitle,
  showDisabledNote,
  assignAlreadyAssignedReason,
  assignListItems,
  assignColumns,
  onRenderAssignUserRow,
  onAssignSearchChange,
  onAssignItemInvoked,
  onDismissAssignUsersInfo,
  onDismissAssignUsersError,
  onBack,
  onClose,
  assignConfirmButton,
}) => {
  if (!isOpen) return null;

  return (
    <div className="voa-assign-overlay" role="dialog" aria-modal="true" aria-labelledby="assign-screen-title">
      <FocusTrapZone>
        <Stack tokens={{ childrenGap: 16 }} styles={{ root: { minHeight: '100%', padding: 20 } }}>
          <Stack horizontal verticalAlign="center" styles={{ root: { borderBottom: '1px solid #e1e1e1', paddingBottom: 12 } }}>
            <DefaultButton
              text={commonBackText}
              iconProps={{ iconName: 'Back' }}
              onClick={onBack}
              disabled={assignLoading}
              ariaLabel={assignTasksText.aria.backToManager}
            />
            <Text as="h1" id="assign-screen-title" variant="xLarge" styles={{ root: { marginLeft: 12, fontWeight: 600 } }}>
              {assignHeaderText}
            </Text>
            <Stack.Item styles={{ root: { marginLeft: 'auto' } }}>
              <DefaultButton
                text={commonCloseText}
                iconProps={{ iconName: 'Cancel' }}
                disabled={assignLoading}
                ariaLabel={assignTasksText.aria.closeAssign}
                onClick={onClose}
              />
            </Stack.Item>
          </Stack>
          <SearchBox
            placeholder={assignTasksText.searchPlaceholder}
            ariaLabel={assignTasksText.searchPlaceholder}
            aria-describedby={assignSearchAriaDescribedBy}
            disabled={!!assignSearchUnavailableReason}
            value={assignSearch}
            onChange={(_, v) => onAssignSearchChange(v ?? '')}
            className={assignSearchUnavailableReason ? 'voa-focusable-disabled-field' : undefined}
            title={assignSearchUnavailableReason}
          />
          {assignSearchUnavailableReason && (
            <span id="voa-assign-search-unavailable" className="voa-sr-only">
              {assignSearchUnavailableReason}
            </span>
          )}
          {assignUsersLoading && <Spinner size={SpinnerSize.small} ariaLabel={assignTasksText.loadingUsersText} />}
          {assignLoading && (
            <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
              <Spinner size={SpinnerSize.small} ariaLabel={assignLoadingText} />
              <Text>{assignLoadingText}</Text>
            </Stack>
          )}
          {assignUsersInfo && !dismissedAssignUsersInfo && (
            <MessageBar
              messageBarType={MessageBarType.info}
              onDismiss={onDismissAssignUsersInfo}
              dismissButtonAriaLabel={commonClearText}
            >
              {assignUsersInfo}
            </MessageBar>
          )}
          {assignUsersError && !dismissedAssignUsersError && (
            <MessageBar
              messageBarType={MessageBarType.error}
              onDismiss={onDismissAssignUsersError}
              dismissButtonAriaLabel={commonClearText}
            >
              {assignUsersError}
            </MessageBar>
          )}
          <Text as="h2" variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
            {assignUserListTitle}
          </Text>
          {showDisabledNote && (
            <Text variant="small" className="voa-assign-disabled-note">
              {assignAlreadyAssignedReason}
            </Text>
          )}
          <DetailsList
            items={assignListItems}
            columns={assignColumns}
            selectionMode={SelectionMode.none}
            isHeaderVisible
            onRenderRow={onRenderAssignUserRow}
            onItemInvoked={(item) => onAssignItemInvoked(item as AssignUser | undefined)}
          />
          <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 12 }}>
            {assignConfirmButton}
          </Stack>
        </Stack>
      </FocusTrapZone>
    </div>
  );
};
