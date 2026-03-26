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
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      return undefined;
    });
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
}

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
}) => {
  const [createTaskBusy, setCreateTaskBusy] = React.useState(false);
  const [createTaskMessage, setCreateTaskMessage] = React.useState<{ text: string; type: MessageBarType } | undefined>(undefined);
  const [showCreateTaskConfirmation, setShowCreateTaskConfirmation] = React.useState(false);
  const [modifyTaskBusy, setModifyTaskBusy] = React.useState(false);
  const [showModifyTaskConfirmation, setShowModifyTaskConfirmation] = React.useState(false);
  const [modifyTaskMessage, setModifyTaskMessage] = React.useState<{ text: string; type: MessageBarType } | undefined>(undefined);

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

  // Auto-dismiss success notifications after 3 seconds
  React.useEffect(() => {
    if (!createTaskMessage || createTaskMessage.type !== MessageBarType.success) return;
    const timer = setTimeout(() => setCreateTaskMessage(undefined), 3000);
    return () => clearTimeout(timer);
  }, [createTaskMessage]);

  React.useEffect(() => {
    if (!modifyTaskMessage || modifyTaskMessage.type !== MessageBarType.success) return;
    const timer = setTimeout(() => setModifyTaskMessage(undefined), 3000);
    return () => clearTimeout(timer);
  }, [modifyTaskMessage]);

  const handleOpenCreateTaskConfirmation = React.useCallback(() => {
    if (!onCreateTask || createTaskActionRule.disabled) {
      return;
    }
    setCreateTaskMessage(undefined);
    setShowCreateTaskConfirmation(true);
  }, [createTaskActionRule.disabled, onCreateTask]);

  const handleCancelCreateTask = React.useCallback(() => {
    if (createTaskBusy) {
      return;
    }
    setShowCreateTaskConfirmation(false);
  }, [createTaskBusy]);

  const handleConfirmCreateTask = React.useCallback(async () => {
    if (!onCreateTask || createTaskActionRule.disabled) {
      return;
    }

    setCreateTaskBusy(true);
    setCreateTaskMessage(undefined);
    try {
      await Promise.resolve(onCreateTask());
      setShowCreateTaskConfirmation(false);
      setCreateTaskMessage({ text: 'Manual SVT task created and assigned to you.', type: MessageBarType.success });
    } catch (error) {
      const message = error instanceof Error && error.message.trim().length > 0
        ? error.message.trim()
        : 'Unable to create task. Please try again.';
      setCreateTaskMessage({ text: message, type: MessageBarType.error });
    } finally {
      setCreateTaskBusy(false);
    }
  }, [createTaskActionRule.disabled, onCreateTask]);

  const handleOpenModifyTaskConfirmation = React.useCallback(() => {
    if (!onModifyTask || modifyTaskActionRule.disabled) {
      return;
    }

    setModifyTaskMessage(undefined);
    setShowModifyTaskConfirmation(true);
  }, [modifyTaskActionRule.disabled, onModifyTask]);

  const handleCancelModifyTask = React.useCallback(() => {
    if (modifyTaskBusy) {
      return;
    }

    setShowModifyTaskConfirmation(false);
  }, [modifyTaskBusy]);

  const handleConfirmModifyTask = React.useCallback(async () => {
    if (!onModifyTask || modifyTaskActionRule.disabled) {
      return;
    }

    setModifyTaskBusy(true);
    setModifyTaskMessage(undefined);
    try {
      await Promise.resolve(onModifyTask());
      setShowModifyTaskConfirmation(false);
      setModifyTaskMessage({ text: 'SVT task updated and assigned to you.', type: MessageBarType.success });
    } catch (error) {
      const message = error instanceof Error && error.message.trim().length > 0
        ? error.message.trim()
        : 'Unable to modify SVT task. Please try again.';
      setModifyTaskMessage({ text: message, type: MessageBarType.error });
    } finally {
      setModifyTaskBusy(false);
    }
  }, [modifyTaskActionRule.disabled, onModifyTask]);

  const createTaskDisabled = createTaskActionRule.disabled;
  const createTaskUnavailableReason = createTaskActionRule.reason;
  const modifyTaskUnavailableReason = modifyTaskActionRule.reason;

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
              ariaLabel={auditHistoryActionRule.disabled
                ? auditHistoryActionRule.reason ?? 'Audit history is currently unavailable.'
                : 'Open sales audit history'}
              title={auditHistoryActionRule.reason}
              disabled={auditHistoryActionRule.disabled}
              onClick={() => { void onOpenAuditHistory?.(); }}
            />
            <DefaultButton
              text="QC Audit History"
              ariaLabel={qcAuditHistoryActionRule.disabled
                ? qcAuditHistoryActionRule.reason ?? 'QC audit history is currently unavailable.'
                : 'Open QC audit history'}
              title={qcAuditHistoryActionRule.reason}
              disabled={qcAuditHistoryActionRule.disabled}
              onClick={() => { void onOpenQcLog?.(); }}
            />
          </div>
        </article>

        <article className="voa-task-panel voa-task-panel--actions" aria-labelledby="task-actions-heading">
          <h3 id="task-actions-heading" className="voa-task-panel__title">Task Actions</h3>
          <div className="voa-task-actions" role="group" aria-label="Task actions">
            {canShowModifyTaskButton && (
              <DefaultButton
                text="Modify SVT Task"
                disabled={modifyTaskActionRule.disabled}
                ariaLabel={modifyTaskActionRule.disabled
                  ? modifyTaskUnavailableReason ?? 'Modify task is currently unavailable.'
                  : 'Modify SVT Task'}
                title={modifyTaskActionRule.disabled
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
          {createTaskUnavailableReason && (hasTaskId || !canCreateTask) && (
            <Text variant="small" className="voa-task-actions__note">{createTaskUnavailableReason}</Text>
          )}
          {createTaskMessage && (
            <MessageBar
              messageBarType={createTaskMessage.type}
              isMultiline={false}
              dismissButtonAriaLabel="Close"
              onDismiss={() => setCreateTaskMessage(undefined)}
            >
              {createTaskMessage.text}
            </MessageBar>
          )}
          {modifyTaskMessage && (
            <MessageBar
              messageBarType={modifyTaskMessage.type}
              isMultiline={false}
              dismissButtonAriaLabel="Close"
              onDismiss={() => setModifyTaskMessage(undefined)}
            >
              {modifyTaskMessage.text}
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
            onClick={() => { void handleConfirmCreateTask(); }}
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
            onClick={() => { void handleConfirmModifyTask(); }}
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
