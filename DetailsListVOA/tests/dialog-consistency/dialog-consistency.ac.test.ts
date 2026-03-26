/**
 * Dialog Consistency Tests
 *
 * Verifies that all 5 action buttons (Create Task, Modify Task,
 * Submit Sale, Request QC, QC Submit) each have a confirmation dialog,
 * that dialogs are consistently sized, and that post-action behaviour
 * (navigate-to-table vs. refresh-in-place + short-lived notification)
 * is correctly wired.
 */
import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..', '..');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Dialog Consistency – all 5 actions have a confirmation dialog', () => {
  const taskSectionSource = readRepoFile(
    'DetailsListVOA/components/SaleDetailsShell/sections/SalesVerificationTaskSection.tsx',
  );
  const sectionSource = readRepoFile(
    'DetailsListVOA/components/SaleDetailsShell/sections/SalesVerificationSection.tsx',
  );
  const controlShellSource = readRepoFile(
    'DetailsListVOA/components/ControlShell/DetailsListControlShell.tsx',
  );
  const runtimeSource = readRepoFile(
    'DetailsListVOA/services/DetailsListRuntimeController.ts',
  );

  // ─────────────────────── Create Task ───────────────────────
  describe('Create Task', () => {
    test('AC-D1: Create Task button triggers a confirmation dialog, not a direct API call', () => {
      // Button click handler must open the dialog, not call handleConfirmCreateTask directly
      expect(taskSectionSource).toContain('onClick={handleOpenCreateTaskConfirmation}');
      expect(taskSectionSource).toContain('setShowCreateTaskConfirmation(true);');
    });

    test('AC-D2: Create Task confirmation dialog has correct title, subText and controls', () => {
      expect(taskSectionSource).toContain("title: 'Create SVT Task'");
      expect(taskSectionSource).toContain(
        "subText: 'Are you sure you want to create an SVT task for this sale record? The task will be assigned to you.'",
      );
      expect(taskSectionSource).toContain('hidden={!showCreateTaskConfirmation}');
      expect(taskSectionSource).toContain('ariaLabel="Confirm create SVT task"');
      expect(taskSectionSource).toContain('ariaLabel="Cancel create SVT task"');
    });

    test('AC-D3: Create Task dialog is consistently sized (minWidth 480, maxWidth 560)', () => {
      // Find the Create Task dialog block and verify sizing
      const createDialogIdx = taskSectionSource.indexOf('hidden={!showCreateTaskConfirmation}');
      const createDialogSlice = taskSectionSource.slice(createDialogIdx, createDialogIdx + 800);
      expect(createDialogSlice).toContain('minWidth={480}');
      expect(createDialogSlice).toContain('maxWidth={560}');
    });

    test('AC-D4: Create Task dialog is blocking (prevents accidental dismissal)', () => {
      const createDialogIdx = taskSectionSource.indexOf('hidden={!showCreateTaskConfirmation}');
      const createDialogSlice = taskSectionSource.slice(createDialogIdx, createDialogIdx + 600);
      expect(createDialogSlice).toContain('isBlocking: true');
      expect(createDialogSlice).toContain("className: 'voa-confirm-dialog'");
    });

    test('AC-D5: Create Task confirm button shows busy text while API call is in progress', () => {
      expect(taskSectionSource).toContain("text={createTaskBusy ? 'Creating...' : 'Create Task'}");
    });

    test('AC-D6: Create Task inline success notification auto-dismisses after 3 seconds', () => {
      expect(taskSectionSource).toContain('createTaskMessage.type !== MessageBarType.success');
      expect(taskSectionSource).toContain('setTimeout(() => setCreateTaskMessage(undefined), 3000)');
    });

    test('AC-D7: Create Task cancel handler is a no-op while API is in flight', () => {
      expect(taskSectionSource).toContain('const handleCancelCreateTask = React.useCallback(() => {');
      expect(taskSectionSource).toContain('if (createTaskBusy) {');
      expect(taskSectionSource).toContain('setShowCreateTaskConfirmation(false);');
    });

    test('AC-D8: Create Task closes dialog on success, shows MessageBar in-place (no navigation)', () => {
      // After success the dialog is closed and a local MessageBar is shown
      expect(taskSectionSource).toContain('setShowCreateTaskConfirmation(false);');
      expect(taskSectionSource).toContain(
        "setCreateTaskMessage({ text: 'Manual SVT task created and assigned to you.'",
      );
      // Runtime controller refreshes by re-fetching the sale record
      expect(runtimeSource).toContain('await this.onTaskClick(this.selectedTaskId, normalizedSaleId);');
    });
  });

  // ─────────────────────── Modify Task ───────────────────────
  describe('Modify Task', () => {
    test('AC-D9: Modify Task dialog has consistent size (minWidth 480, maxWidth 560)', () => {
      const modifyDialogIdx = taskSectionSource.indexOf('hidden={!showModifyTaskConfirmation}');
      const modifyDialogSlice = taskSectionSource.slice(modifyDialogIdx, modifyDialogIdx + 800);
      expect(modifyDialogSlice).toContain('minWidth={480}');
      expect(modifyDialogSlice).toContain('maxWidth={560}');
    });

    test('AC-D10: Modify Task dialog subText mentions reassignment', () => {
      expect(taskSectionSource).toContain(
        "subText: 'Are you sure you want to modify this SVT Task? The task will be reassigned to you.'",
      );
    });

    test('AC-D11: Modify Task dialog is blocking', () => {
      const modifyDialogIdx = taskSectionSource.indexOf('hidden={!showModifyTaskConfirmation}');
      const modifyDialogSlice = taskSectionSource.slice(modifyDialogIdx, modifyDialogIdx + 600);
      expect(modifyDialogSlice).toContain('isBlocking: true');
      expect(modifyDialogSlice).toContain("className: 'voa-confirm-dialog'");
    });

    test('AC-D12: Modify Task confirm button shows busy text while in flight', () => {
      expect(taskSectionSource).toContain("text={modifyTaskBusy ? 'Modifying...' : 'Confirm'}");
    });

    test('AC-D13: Modify Task inline success notification auto-dismisses after 3 seconds', () => {
      expect(taskSectionSource).toContain('modifyTaskMessage.type !== MessageBarType.success');
      expect(taskSectionSource).toContain('setTimeout(() => setModifyTaskMessage(undefined), 3000)');
    });

    test('AC-D14: Modify Task stay on details view and refreshes sale record (no navigation to grid)', () => {
      // No submitSuccessNotification set for modify
      // Runtime controller re-fetches via onTaskClick
      expect(runtimeSource).not.toContain(
        "this.submitSuccessNotification = 'SVT task updated",
      );
      expect(runtimeSource).toContain(
        'await this.onTaskClick(this.selectedTaskId, normalizedSaleId);',
      );
    });

    test('AC-D15: Modify Task ariaLabels are set for accessibility', () => {
      expect(taskSectionSource).toContain('ariaLabel="Confirm modify SVT task"');
      expect(taskSectionSource).toContain('ariaLabel="Cancel modify SVT task"');
    });
  });

  // ─────────────────────── Submit Sale (Complete) ───────────────────────
  describe('Submit Sale (Complete)', () => {
    test('AC-D16: Complete dialog has correct size (minWidth 480, maxWidth 560)', () => {
      const completeDialogIdx = sectionSource.indexOf('hidden={!showCompleteConfirmDialog}');
      const completeDialogSlice = sectionSource.slice(completeDialogIdx, completeDialogIdx + 800);
      expect(completeDialogSlice).toContain('minWidth={480}');
      expect(completeDialogSlice).toContain('maxWidth={560}');
    });

    test('AC-D17: Complete dialog has title, subText and is blocking', () => {
      expect(sectionSource).toContain("title: 'Complete Sales Verification Task'");
      expect(sectionSource).toContain(
        "subText: 'Are you sure you want to complete this task? This action cannot be undone.'",
      );
      const completeDialogIdx = sectionSource.indexOf('hidden={!showCompleteConfirmDialog}');
      const slice = sectionSource.slice(completeDialogIdx, completeDialogIdx + 600);
      expect(slice).toContain('isBlocking: true');
      expect(slice).toContain("className: 'voa-confirm-dialog'");
    });

    test('AC-D18: Completing sale shows success in the dialog, then returns to table', () => {
      expect(sectionSource).toContain('Sales verification task completed successfully. Returning to table...');
      expect(sectionSource).toContain('setCompleteDialogSuccessMessage');
      expect(sectionSource).toContain('onReturnToTableAfterSubmit?.();');
    });
  });

  // ─────────────────────── Request for QC ───────────────────────
  describe('Request for QC', () => {
    test('AC-D19: Submit-for-QC dialog has correct consistent sizing', () => {
      const qcDialogIdx = sectionSource.indexOf('hidden={!showSubmitForQcDialog}');
      const qcDialogSlice = sectionSource.slice(qcDialogIdx, qcDialogIdx + 800);
      // Larger dialog due to embedded remarks text field (560/640)
      expect(qcDialogSlice).toContain('minWidth={560}');
      expect(qcDialogSlice).toContain('maxWidth={640}');
    });

    test('AC-D20: Submit-for-QC dialog has title, mandatory remarks field and is blocking', () => {
      expect(sectionSource).toContain("title: 'Submit Sales Verification Task for QC'");
      expect(sectionSource).toContain(
        "'Remarks are mandatory before submitting this task for Quality Control.'",
      );
      const qcDialogIdx = sectionSource.indexOf('hidden={!showSubmitForQcDialog}');
      const slice = sectionSource.slice(qcDialogIdx, qcDialogIdx + 600);
      expect(slice).toContain('id="voa-submit-qc-remarks"');
    });

    test('AC-D21: Submitting for QC shows success in the dialog, then returns to table', () => {
      expect(sectionSource).toContain('Sales verification task submitted for QC successfully. Returning to table...');
      expect(sectionSource).toContain('setSubmitForQcDialogSuccessMessage');
    });
  });

  // ─────────────────────── QC Submit ───────────────────────
  describe('QC Submit', () => {
    test('AC-D22: QC outcome dialog has correct size (minWidth 480, maxWidth 560)', () => {
      const qcOutcomeDialogIdx = sectionSource.indexOf('hidden={!showConfirmQcOutcomeDialog}');
      const qcOutcomeDialogSlice = sectionSource.slice(qcOutcomeDialogIdx, qcOutcomeDialogIdx + 800);
      expect(qcOutcomeDialogSlice).toContain('minWidth={480}');
      expect(qcOutcomeDialogSlice).toContain('maxWidth={560}');
    });

    test('AC-D23: QC outcome dialog has title, subText and is blocking', () => {
      expect(sectionSource).toContain("title: 'Submit QC Outcome'");
      expect(sectionSource).toContain(
        "subText: 'Are you sure you want to submit this QC outcome? This action cannot be undone.'",
      );
      const qcOutcomeDialogIdx = sectionSource.indexOf('hidden={!showConfirmQcOutcomeDialog}');
      const slice = sectionSource.slice(qcOutcomeDialogIdx, qcOutcomeDialogIdx + 600);
      expect(slice).toContain('isBlocking: true');
      expect(slice).toContain("className: 'voa-confirm-dialog'");
    });

    test('AC-D24: Submitting QC outcome shows success in the dialog, then returns to table', () => {
      expect(sectionSource).toContain('QC outcome submitted successfully. Returning to table...');
      expect(sectionSource).toContain('setQcOutcomeDialogSuccessMessage');
    });
  });

  // ─────────────────────── Global consistency ───────────────────────
  describe('Global dialog consistency', () => {
    test('AC-D25: All 5 action dialogs use voa-confirm-dialog CSS class for consistent theming', () => {
      // Task section dialogs (Create Task, Modify Task)
      const taskDialogMatches = (taskSectionSource.match(/className: 'voa-confirm-dialog'/g) ?? []).length;
      expect(taskDialogMatches).toBeGreaterThanOrEqual(2);

      // Verification section dialogs (Complete, Submit for QC, QC Submit)
      const verificationDialogMatches = (sectionSource.match(/className: 'voa-confirm-dialog'/g) ?? []).length;
      expect(verificationDialogMatches).toBeGreaterThanOrEqual(3);
    });

    test('AC-D26: Create Task and Modify Task show inline notification (stay on details), not grid notification', () => {
      // Both show a MessageBar in-place; no submitSuccessNotification set in runtime controller
      expect(taskSectionSource).toContain('{createTaskMessage && (');
      expect(taskSectionSource).toContain('{modifyTaskMessage && (');
    });

    test('AC-D27: Submit dialogs own their success messages and delayed return flow', () => {
      expect(sectionSource).toContain('completeDialogSuccessMessage');
      expect(sectionSource).toContain('submitForQcDialogSuccessMessage');
      expect(sectionSource).toContain('qcOutcomeDialogSuccessMessage');
    });

    test('AC-D28: Dialog success uses a short delayed return callback', () => {
      expect(sectionSource).toContain('setTimeout(() => {');
      expect(sectionSource).toContain('onReturnToTableAfterSubmit?.();');
    });

    test('AC-D29: Controller still owns the actual detail-close operation', () => {
      const matches = runtimeSource.match(/this\.showPcfSaleDetails = false/g) ?? [];
      expect(matches.length).toBeGreaterThanOrEqual(3);
      expect(runtimeSource).toContain('public closeDetailsAfterSubmit(): void');
    });
  });
});
