import * as React from 'react';
import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  Icon,
  IconButton,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Spinner,
  SpinnerSize,
  Text,
} from '@fluentui/react';
import { statusIconByTone } from '../constants';
import { StatusTone } from '../types';
import { KvpRow } from '../shared/KvpRow';
import { OwnershipRow } from '../shared/OwnershipRow';
import {
  canShowModifyTaskAction,
  getAuditHistoryActionRule,
  getCreateTaskActionRule,
  getModifyTaskActionRule,
  hasDisplayValue,
} from '../rules/ViewSaleActionRules';

const CopyablePill: React.FC<{ value: string; label: string }> = ({ value, label }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => undefined);
  }, [value]);

  return (
    <span className="voa-readonly-pill">
      {value}
      <IconButton
        iconProps={{ iconName: copied ? 'CheckMark' : 'Copy' }}
        title={copied ? 'Copied!' : `Copy ${label}`}
        ariaLabel={copied ? `${label} copied` : `Copy ${label}`}
        className={`voa-copy-btn${copied ? ' voa-copy-btn__tick' : ''}`}
        onClick={handleCopy}
      />
    </span>
  );
};

interface SalesVerificationTaskSectionProps {
  saleId: string;
  taskId: string;
  statusText: string;
  statusTone: StatusTone;
  assignedTo: string;
  qcAssignedTo: string;
  onOpenAuditHistory?: () => void | Promise<void>;
  onOpenQcLog?: () => void | Promise<void>;
  onCreateTask?: () => void | Promise<void>;
  onModifyTask?: () => void | Promise<void>;
  canCreateTask?: boolean;
  canModifyTask?: boolean;
  disableInternalActions?: boolean;
}

type ActionMessageState = { text: string; type: MessageBarType } | undefined;

const useDismissibleActionMessage = (): {
  dismissed: boolean;
  message: ActionMessageState;
  setMessage: React.Dispatch<React.SetStateAction<ActionMessageState>>;
  dismiss: () => void;
} => {
  const [message, setMessage] = React.useState<ActionMessageState>(undefined);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (!message || message.type !== MessageBarType.success) return undefined;
    const timer = setTimeout(() => {
      setDismissed(true);
      setMessage(undefined);
    }, 3000);
    return () => clearTimeout(timer);
  }, [message]);

  React.useEffect(() => {
    if (!message) return;
    setDismissed(false);
  }, [message]);

  const dismiss = React.useCallback(() => {
    setDismissed(true);
    setMessage(undefined);
  }, []);

  return { dismissed, message, setMessage, dismiss };
};

const runTaskAction = async (args: {
  handler?: () => void | Promise<void>;
  disabled: boolean;
  setBusy: React.Dispatch<React.SetStateAction<boolean>>;
  setMessage: React.Dispatch<React.SetStateAction<ActionMessageState>>;
  setShowConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
  successMessage: string;
  fallbackErrorMessage: string;
}): Promise<void> => {
  const {
    handler,
    disabled,
    setBusy,
    setMessage,
    setShowConfirmation,
    successMessage,
    fallbackErrorMessage,
  } = args;

  if (!handler || disabled) {
    return;
  }

  setBusy(true);
  setMessage(undefined);
  try {
    await Promise.resolve(handler());
    setShowConfirmation(false);
    setMessage({ text: successMessage, type: MessageBarType.success });
  } catch (error) {
    const message = error instanceof Error && error.message.trim().length > 0
      ? error.message.trim()
      : fallbackErrorMessage;
    setMessage({ text: message, type: MessageBarType.error });
  } finally {
    setBusy(false);
  }
};

export const SalesVerificationTaskSection: React.FC<SalesVerificationTaskSectionProps> = ({
  saleId,
  taskId,
  statusText,
  statusTone,
  assignedTo,
  qcAssignedTo,
  onOpenAuditHistory,
  onOpenQcLog,
  onCreateTask,
  onModifyTask,
  canCreateTask = false,
  canModifyTask = false,
  disableInternalActions = false,
}) => {
  const [createTaskBusy, setCreateTaskBusy] = React.useState(false);
  const [showCreateTaskConfirmation, setShowCreateTaskConfirmation] = React.useState(false);
  const [modifyTaskBusy, setModifyTaskBusy] = React.useState(false);
  const [showModifyTaskConfirmation, setShowModifyTaskConfirmation] = React.useState(false);
  const createTaskFeedback = useDismissibleActionMessage();
  const modifyTaskFeedback = useDismissibleActionMessage();

  const internalActionsDisabledReason = 'Internal SVT actions are disabled when opened from VT.';

  const hasTaskId = hasDisplayValue(taskId);
  const createTaskActionRule = React.useMemo(
    () => getCreateTaskActionRule({
      createTaskBusy,
      saleId,
      taskId,
      hasCreateTaskHandler: Boolean(onCreateTask),
      canCreateTask,
    }),
    [canCreateTask, createTaskBusy, onCreateTask, saleId, taskId],
  );
  const auditHistoryActionRule = React.useMemo(
    () => getAuditHistoryActionRule({
      hasHandler: Boolean(onOpenAuditHistory),
    }),
    [onOpenAuditHistory],
  );
  const qcAuditHistoryActionRule = React.useMemo(
    () => getAuditHistoryActionRule({
      hasHandler: Boolean(onOpenQcLog),
    }),
    [onOpenQcLog],
  );
  const canShowModifyTaskButton = React.useMemo(
    () => canShowModifyTaskAction(statusText) && assignedTo !== 'Unknown User',
    [statusText, assignedTo],
  );
  const modifyTaskActionRule = React.useMemo(
    () => getModifyTaskActionRule({
      canModifyTask,
      hasModifyTaskHandler: Boolean(onModifyTask),
      modifyTaskBusy,
    }),
    [canModifyTask, modifyTaskBusy, onModifyTask],
  );

  React.useEffect(() => {
    if (hasTaskId) {
      setCreateTaskBusy(false);
    }
  }, [hasTaskId, taskId]);

  const handleOpenCreateTaskConfirmation = React.useCallback(() => {
    if (!onCreateTask || disableInternalActions || createTaskActionRule.disabled) {
      return;
    }
    createTaskFeedback.setMessage(undefined);
    setShowCreateTaskConfirmation(true);
  }, [createTaskActionRule.disabled, createTaskFeedback, disableInternalActions, onCreateTask]);

  const handleCancelCreateTask = React.useCallback(() => {
    if (createTaskBusy) {
      return;
    }
    setShowCreateTaskConfirmation(false);
  }, [createTaskBusy]);

  const handleConfirmCreateTask = React.useCallback(async () => {
    await runTaskAction({
      handler: onCreateTask,
      disabled: createTaskActionRule.disabled,
      setBusy: setCreateTaskBusy,
      setMessage: createTaskFeedback.setMessage,
      setShowConfirmation: setShowCreateTaskConfirmation,
      successMessage: 'Manual SVT task created and assigned to you.',
      fallbackErrorMessage: 'Unable to create task. Please try again.',
    });
  }, [createTaskActionRule.disabled, createTaskFeedback.setMessage, onCreateTask]);

  const handleOpenModifyTaskConfirmation = React.useCallback(() => {
    if (!onModifyTask || disableInternalActions || modifyTaskActionRule.disabled) {
      return;
    }

    modifyTaskFeedback.setMessage(undefined);
    setShowModifyTaskConfirmation(true);
  }, [disableInternalActions, modifyTaskActionRule.disabled, modifyTaskFeedback, onModifyTask]);

  const handleCancelModifyTask = React.useCallback(() => {
    if (modifyTaskBusy) {
      return;
    }

    setShowModifyTaskConfirmation(false);
  }, [modifyTaskBusy]);

  const handleConfirmModifyTask = React.useCallback(async () => {
    await runTaskAction({
      handler: onModifyTask,
      disabled: modifyTaskActionRule.disabled,
      setBusy: setModifyTaskBusy,
      setMessage: modifyTaskFeedback.setMessage,
      setShowConfirmation: setShowModifyTaskConfirmation,
      successMessage: 'SVT task updated and assigned to you.',
      fallbackErrorMessage: 'Unable to modify SVT task. Please try again.',
    });
  }, [modifyTaskActionRule.disabled, modifyTaskFeedback.setMessage, onModifyTask]);

  const createTaskDisabled = disableInternalActions || createTaskActionRule.disabled;
  const createTaskUnavailableReason = disableInternalActions
    ? internalActionsDisabledReason
    : createTaskActionRule.reason;
  const modifyTaskUnavailableReason = disableInternalActions
    ? internalActionsDisabledReason
    : modifyTaskActionRule.reason;
  const modifyTaskDisabled = disableInternalActions || modifyTaskActionRule.disabled;
  const salesAuditHistoryDisabled = disableInternalActions || auditHistoryActionRule.disabled;
  const salesAuditHistoryReason = disableInternalActions
    ? internalActionsDisabledReason
    : auditHistoryActionRule.reason;
  const qcAuditHistoryDisabled = disableInternalActions || qcAuditHistoryActionRule.disabled;
  const qcAuditHistoryReason = disableInternalActions
    ? internalActionsDisabledReason
    : qcAuditHistoryActionRule.reason;
  const showCreateTaskMessage = Boolean(createTaskFeedback.message) && !createTaskFeedback.dismissed;
  const showModifyTaskMessage = Boolean(modifyTaskFeedback.message) && !modifyTaskFeedback.dismissed;

  return (
    <section className="voa-sale-details-card" aria-labelledby="svt-task-details-heading">
      <div className="voa-sale-details-card__header">
        <Text as="h2" id="svt-task-details-heading" variant="large" className="voa-sale-details-card__title">
          Sales Verification Task Details
        </Text>
      </div>

      <div className="voa-task-panel-grid">
        <article className="voa-task-panel" aria-labelledby="task-heading">
          <h3 id="task-heading" className="voa-task-panel__title">Task</h3>
          <KvpRow label="Task ID" value={<CopyablePill value={taskId} label="Task ID" />} labelTitle="Unique identifier for the verification task" />
          <KvpRow
            label="Status"
            labelTitle="Current workflow status of the verification task"
            value={
              <span className={`voa-status-badge voa-status-badge--${statusTone}`} aria-label={`Status: ${statusText}`}>
                <Icon iconName={statusIconByTone[statusTone]} className="voa-status-badge__icon" />
                <span>{statusText}</span>
              </span>
            }
          />
        </article>

        <article className="voa-task-panel" aria-labelledby="ownership-heading">
          <h3 id="ownership-heading" className="voa-task-panel__title">Ownership</h3>
          <OwnershipRow label="Caseworker" value={assignedTo} />
          <OwnershipRow label="QC Reviewer" value={qcAssignedTo} title="Quality Control reviewer assigned to this task" />
        </article>

        <article className="voa-task-panel voa-task-panel--actions" aria-labelledby="audit-history-heading">
          <h3 id="audit-history-heading" className="voa-task-panel__title">Audit History</h3>
          <div className="voa-task-actions" role="group" aria-label="Audit history actions">
            <DefaultButton
              text="Sales Audit History"
              ariaLabel={salesAuditHistoryDisabled
                ? salesAuditHistoryReason ?? 'Audit history is currently unavailable.'
                : 'Open sales audit history'}
              title={salesAuditHistoryReason}
              disabled={salesAuditHistoryDisabled}
              onClick={() => {
                Promise.resolve(onOpenAuditHistory?.()).catch(() => undefined);
              }}
            />
            <DefaultButton
              text="QC Audit History"
              ariaLabel={qcAuditHistoryDisabled
                ? qcAuditHistoryReason ?? 'QC audit history is currently unavailable.'
                : 'Open QC audit history'}
              title={qcAuditHistoryReason}
              disabled={qcAuditHistoryDisabled}
              onClick={() => {
                Promise.resolve(onOpenQcLog?.()).catch(() => undefined);
              }}
            />
          </div>
        </article>

        <article className="voa-task-panel voa-task-panel--actions" aria-labelledby="task-actions-heading">
          <h3 id="task-actions-heading" className="voa-task-panel__title">Task Actions</h3>
          <div className="voa-task-actions" role="group" aria-label="Task actions">
            {canShowModifyTaskButton && (
              <DefaultButton
                text="Modify SVT Task"
                disabled={modifyTaskDisabled}
                ariaLabel={modifyTaskDisabled
                  ? modifyTaskUnavailableReason ?? 'Modify task is currently unavailable.'
                  : 'Modify SVT Task'}
                title={modifyTaskDisabled
                  ? modifyTaskUnavailableReason ?? 'Modify task is currently unavailable.'
                  : undefined}
                onClick={handleOpenModifyTaskConfirmation}
              />
            )}
            <DefaultButton
              text="Create Task"
              disabled={createTaskDisabled}
              ariaLabel={createTaskDisabled
                ? createTaskUnavailableReason ?? 'Create task is currently unavailable.'
                : 'Create sales verification task'}
              title={createTaskUnavailableReason}
              onClick={handleOpenCreateTaskConfirmation}
            />
          </div>
          {(createTaskBusy || modifyTaskBusy) && (
            <div
              role="status"
              aria-live="polite"
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}
            >
              <Spinner size={SpinnerSize.small} aria-hidden />
              <Text variant="small">{createTaskBusy ? 'Creating task...' : 'Modifying task...'}</Text>
            </div>
          )}
          {createTaskUnavailableReason && (disableInternalActions || hasTaskId || !canCreateTask) && (
            <Text variant="small" className="voa-task-actions__note">{createTaskUnavailableReason}</Text>
          )}
          {showCreateTaskMessage && createTaskFeedback.message && (
            <MessageBar
              messageBarType={createTaskFeedback.message.type}
              isMultiline={false}
              dismissButtonAriaLabel="Dismiss"
              onDismiss={createTaskFeedback.dismiss}
            >
              {createTaskFeedback.message.text}
            </MessageBar>
          )}
          {showModifyTaskMessage && modifyTaskFeedback.message && (
            <MessageBar
              messageBarType={modifyTaskFeedback.message.type}
              isMultiline={false}
              dismissButtonAriaLabel="Dismiss"
              onDismiss={modifyTaskFeedback.dismiss}
            >
              {modifyTaskFeedback.message.text}
            </MessageBar>
          )}
        </article>
      </div>

      <Dialog
        hidden={!showCreateTaskConfirmation}
        onDismiss={handleCancelCreateTask}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Create SVT Task',
          subText: 'Are you sure you want to create an SVT task for this sale record? The task will be assigned to you.',
        }}
        modalProps={{
          isBlocking: true,
          className: 'voa-confirm-dialog',
        }}
        minWidth={480}
        maxWidth={560}
      >
        <DialogFooter>
          {createTaskBusy && (
            <div role="status" aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}>
              <Spinner size={SpinnerSize.small} aria-hidden />
              <Text variant="small">Creating task...</Text>
            </div>
          )}
          <PrimaryButton
            text={createTaskBusy ? 'Creating...' : 'Create Task'}
            ariaLabel="Confirm create SVT task"
            disabled={createTaskBusy}
            onClick={() => {
              handleConfirmCreateTask().catch(() => undefined);
            }}
          />
          <DefaultButton
            text="Cancel"
            ariaLabel="Cancel create SVT task"
            disabled={createTaskBusy}
            onClick={handleCancelCreateTask}
          />
        </DialogFooter>
      </Dialog>

      <Dialog
        hidden={!showModifyTaskConfirmation}
        onDismiss={handleCancelModifyTask}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Modify SVT Task',
          subText: 'Are you sure you want to modify this SVT Task? The task will be reassigned to you.',
        }}
        modalProps={{
          isBlocking: true,
          className: 'voa-confirm-dialog',
        }}
        minWidth={480}
        maxWidth={560}
      >
        <DialogFooter>
          {modifyTaskBusy && (
            <div role="status" aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}>
              <Spinner size={SpinnerSize.small} aria-hidden />
              <Text variant="small">Modifying task...</Text>
            </div>
          )}
          <PrimaryButton
            text={modifyTaskBusy ? 'Modifying...' : 'Confirm'}
            ariaLabel="Confirm modify SVT task"
            disabled={modifyTaskBusy}
            onClick={() => {
              handleConfirmModifyTask().catch(() => undefined);
            }}
          />
          <DefaultButton
            text="Cancel"
            ariaLabel="Cancel modify SVT task"
            disabled={modifyTaskBusy}
            onClick={handleCancelModifyTask}
          />
        </DialogFooter>
      </Dialog>
    </section>
  );
};

SalesVerificationTaskSection.displayName = 'SalesVerificationTaskSection';
