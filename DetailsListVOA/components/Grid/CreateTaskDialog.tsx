import * as React from 'react';
import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Stack,
  Text,
} from '@fluentui/react';

export interface CreateTaskDialogProps {
  isOpen: boolean;
  createTaskActionText: string;
  selectedCreateTaskSaleIds: string[];
  createTaskPreviewSaleIds: string[];
  createTaskRemainingCount: number;
  dismissedCreateTaskInfo: boolean;
  canCreateTask: boolean;
  isSubmitting: boolean;
  errorMessage?: string;
  closeText: string;
  onDismiss: () => void;
  onDismissInfo: () => void;
  onConfirm: () => void | Promise<void>;
}

export const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  isOpen,
  createTaskActionText,
  selectedCreateTaskSaleIds,
  createTaskPreviewSaleIds,
  createTaskRemainingCount,
  dismissedCreateTaskInfo,
  canCreateTask,
  isSubmitting,
  errorMessage,
  closeText,
  onDismiss,
  onDismissInfo,
  onConfirm,
}) => {
  const handleConfirmClick = React.useCallback(() => {
    Promise.resolve(onConfirm()).catch(() => undefined);
  }, [onConfirm]);

  return (
    <Dialog
      hidden={!isOpen}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title: createTaskActionText,
        subText: `Create tasks for ${selectedCreateTaskSaleIds.length} selected sale${selectedCreateTaskSaleIds.length === 1 ? '' : 's'}.`,
      }}
      modalProps={{ isBlocking: true }}
      minWidth={560}
      maxWidth={720}
    >
      <Stack tokens={{ childrenGap: 12 }}>
        {errorMessage && (
          <MessageBar messageBarType={MessageBarType.error}>
            {errorMessage}
          </MessageBar>
        )}
        {!dismissedCreateTaskInfo && (
          <MessageBar
            messageBarType={MessageBarType.info}
            isMultiline={false}
            onDismiss={onDismissInfo}
            dismissButtonAriaLabel={closeText}
          >
            {selectedCreateTaskSaleIds.length} sale{selectedCreateTaskSaleIds.length === 1 ? '' : 's'} selected for task creation.
          </MessageBar>
        )}
        <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
          Selected Sale IDs
        </Text>
        <ul style={{ margin: 0, paddingLeft: 20, maxHeight: 220, overflowY: 'auto' }}>
          {createTaskPreviewSaleIds.map((saleId) => (
            <li key={saleId}>
              <Text>{saleId}</Text>
            </li>
          ))}
        </ul>
        {createTaskRemainingCount > 0 && (
          <Text variant="small">
            And {createTaskRemainingCount} more selected sale ID{createTaskRemainingCount === 1 ? '' : 's'}.
          </Text>
        )}
      </Stack>
      <DialogFooter>
        <PrimaryButton
          text={isSubmitting ? 'Creating...' : createTaskActionText}
          onClick={handleConfirmClick}
          disabled={!canCreateTask || isSubmitting}
        />
        <DefaultButton
          text={closeText}
          onClick={onDismiss}
          disabled={isSubmitting}
        />
      </DialogFooter>
    </Dialog>
  );
};
