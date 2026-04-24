import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..', '..');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('WRT-308 Manual Task Creation AC', () => {
  const shellSource = readRepoFile('DetailsListVOA/components/SaleDetailsShell/SaleDetailsShell.tsx');
  const sectionSource = readRepoFile('DetailsListVOA/components/SaleDetailsShell/sections/SalesVerificationTaskSection.tsx');
  const rulesSource = readRepoFile('DetailsListVOA/components/SaleDetailsShell/rules/ViewSaleActionRules.ts');
  const runtimeSource = readRepoFile('DetailsListVOA/services/DetailsListRuntimeController.ts');
  const actionsSource = readRepoFile('DetailsListVOA/services/runtime/actions.ts');
  const indexSource = readRepoFile('DetailsListVOA/index.ts');
  const configSource = readRepoFile('DetailsListVOA/config/ControlConfig.ts');
  const gridSource = readRepoFile('DetailsListVOA/Grid.tsx');
  const detailsHostSource = readRepoFile('DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx');
  const controlShellSource = readRepoFile('DetailsListVOA/components/ControlShell/DetailsListControlShell.tsx');
  const managerJourneySource = readRepoFile('DetailsListVOA/components/HomeShell/ManagerJourneyShell.tsx');

  test('AC1: clicking Create Task from Sales Record details routes to manual task creation and auto-assignment context', () => {
    expect(shellSource).toContain('onCreateTask={onCreateManualTask');
    expect(shellSource).toContain('canCreateTask={canCreateManualTask}');
    expect(indexSource).toContain('onCreateManualTask: (saleId) => this.runtime.createManualTask([saleId])');
    expect(runtimeSource).toContain("sourceType: 'M'");
    expect(runtimeSource).toContain('createdBy: this.entraObjectId');
    expect(runtimeSource).toContain('assignedTo: resolveCurrentUserDisplayName(this._context)');
    expect(runtimeSource).toContain('await this.onTaskClick(this.selectedTaskId, normalizedSaleId);');
    expect(configSource).toContain("manualTaskCreationApiName: 'voa_SvtManualTaskCreation'");
  });

  test('AC2: Create Task is disabled when a task ID already exists and without manager+caseworker access', () => {
    expect(sectionSource).toContain('getCreateTaskActionRule({');
    expect(sectionSource).toContain('const createTaskDisabled = disableInternalActions || createTaskActionRule.disabled;');
    expect(rulesSource).toContain('export const getCreateTaskActionRule = ({');
    expect(rulesSource).toContain("reason: 'A task ID already exists for this sale record.'");
    expect(rulesSource).toContain("reason: 'Create task is available only to users with both manager and caseworker role/team access.'");
    expect(runtimeSource).toContain('const existingTaskId = resolveCurrentTaskIdFromDetails(this._saleDetails, this.selectedTaskId);');
    expect(runtimeSource).toContain('if (!this.hasManagerAccess || !this.hasCaseworkerAccess) {');
    expect(runtimeSource).toContain("throw new Error('Manual task creation is restricted to users with both manager and caseworker role/team access.');");
  });

  test('AC3: manual task IDs use the M- prefix path', () => {
    expect(runtimeSource).toContain("sourceType: 'M'");
    expect(actionsSource).toContain('/\\bM-\\d+\\b/i');
    // Trigger button always shows static label; busy text is on the dialog confirm button
    expect(sectionSource).toContain('text="Create Task"');
    expect(sectionSource).toContain("text={createTaskBusy ? 'Creating...' : 'Create Task'}");
    expect(sectionSource).toContain('aria-label="Task actions"');
  });

  test('AC3b: clicking Create Task opens a confirmation dialog before creating', () => {
    // Button click must open dialog rather than calling the API directly
    expect(sectionSource).toContain('onClick={handleOpenCreateTaskConfirmation}');
    expect(sectionSource).toContain('showCreateTaskConfirmation');
    expect(sectionSource).toContain("title: 'Create SVT Task'");
    expect(sectionSource).toContain(
      "subText: 'Are you sure you want to create an SVT task for this sale record? The task will be assigned to you.'",
    );
    expect(sectionSource).toContain('handleConfirmCreateTask');
    expect(sectionSource).toContain('handleCancelCreateTask');
    expect(sectionSource).toContain('ariaLabel="Confirm create SVT task"');
    expect(sectionSource).toContain('ariaLabel="Cancel create SVT task"');
  });

  test('AC3c: Create Task success notification auto-dismisses (short-lived, stays on details view)', () => {
    expect(sectionSource).toContain('setTimeout(() => setCreateTaskMessage(undefined), 3000)');
    expect(sectionSource).toContain("{createTaskMessage && (");
  });

  test('AC4: all-sales bulk Create Task uses the same manager+caseworker access gate', () => {
    expect(gridSource).toContain('canCreateManualTask?: boolean;');
    expect(gridSource).toContain('canCreateManualTask = false');
    expect(gridSource).toContain('if (!canCreateManualTask) {');
    expect(gridSource).toContain("tooltip: 'Create task is available only to users with both manager and caseworker role/team access.'");
    expect(detailsHostSource).toContain('canCreateManualTask?: boolean;');
    expect(detailsHostSource).toContain('canCreateManualTask = false');
    expect(detailsHostSource).toContain('canCreateManualTask,');
    expect(controlShellSource).toContain('canCreateManualTask?: boolean;');
    expect(controlShellSource).toContain('canCreateManualTask = false');
    expect(controlShellSource).toContain('canCreateManualTask={canCreateManualTask}');
    expect(managerJourneySource).toContain('canCreateManualTask?: boolean;');
    expect(managerJourneySource).toContain('canCreateManualTask = false');
    expect(managerJourneySource).toContain('canCreateManualTask={canCreateManualTask}');
    expect(indexSource).toContain('canCreateManualTask: this.runtime.canCreateManualTask');
  });
});
