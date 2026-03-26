import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..', '..');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('WRT-205 Sales Verification Complete/Submit AC', () => {
  const shellSource = readRepoFile('DetailsListVOA/components/SaleDetailsShell/SaleDetailsShell.tsx');
  const sectionSource = readRepoFile('DetailsListVOA/components/SaleDetailsShell/sections/SalesVerificationSection.tsx');
  const taskSectionSource = readRepoFile('DetailsListVOA/components/SaleDetailsShell/sections/SalesVerificationTaskSection.tsx');
  const rulesSource = readRepoFile('DetailsListVOA/components/SaleDetailsShell/rules/ViewSaleActionRules.ts');
  const cssSource = readRepoFile('DetailsListVOA/components/SaleDetailsShell/SaleDetailsShell.css');
  const runtimeSource = readRepoFile('DetailsListVOA/services/DetailsListRuntimeController.ts');
  const saleDetailsSource = readRepoFile('DetailsListVOA/services/runtime/sale-details.ts');
  const viewModelSource = readRepoFile('DetailsListVOA/components/SaleDetailsShell/useSaleDetailsViewModel.ts');

  test('AC1: section exposes Complete and Submit for QC actions', () => {
    expect(shellSource).toContain('<SalesVerificationSection');
    expect(sectionSource).toContain('text="Complete Sales Verification Task"');
    expect(sectionSource).toContain('text="Submit Sales Verification Task for QC"');
    expect(sectionSource).toContain('aria-label="Sales verification actions"');
    expect(sectionSource).toContain('title={completeTaskActionRule.reason}');
    expect(sectionSource).toContain('title={submitForQcActionRule.reason}');
  });

  test('AC2: complete action uses submit API path and sets complete status merge rule', () => {
    expect(runtimeSource).toContain("type: 'completeSalesVerificationTask' | 'submitSalesVerificationTaskForQc'");
    expect(runtimeSource).toContain('const nextSaleDetails = mergeSalesVerificationDetails(this._saleDetails, payload, type);');
    expect(runtimeSource).toContain('this._saleDetails = nextSaleDetails;');
    expect(runtimeSource).toContain("'submitSalesVerificationApiName'");
    expect(runtimeSource).toContain("parseApiMutationResult(response, 'Submit sales verification task failed.')");
    expect(saleDetailsSource).toContain("if (actionType === 'completeSalesVerificationTask') {");
    expect(saleDetailsSource).toContain("return 'Complete';");
  });

  test('AC3: mandatory validation prompt and required field checks are enforced before complete/submit', () => {
    expect(sectionSource).toContain('Please complete the following mandatory fields');
    expect(rulesSource).toContain("saleUseful: 'Select whether the sale is useful or not'");
    expect(rulesSource).toContain("whyNotUseful: 'Enter why the sale is not useful'");
    expect(rulesSource).toContain('SALES_PARTICULAR_EDITABLE_MANDATORY_FIELD_RULES');
    expect(rulesSource).toContain("salesParticularReviewStatus: 'Enter the sales particulars'");
    expect(rulesSource).toContain("padConfirmation: 'Select PAD confirmation'");
    expect(sectionSource).toContain('getSalesVerificationMandatoryValidation({');
    expect(shellSource).toContain('onCrossSectionValidationChange={handleCrossSectionValidationChange}');
    expect(sectionSource).toContain('const SECTION_ERROR_HIGHLIGHT_CLASS = \'voa-section-error-highlight\';');
    expect(cssSource).toContain('.voa-section-error-highlight > .voa-sale-details-card');
  });


  test('AC3b: complete/submit payload includes live sales-particular draft and PAD confirmation', () => {
    expect(shellSource).toContain('onDraftChange={setSalesParticularDraft}');
    expect(shellSource).toContain('salesParticularModel={salesParticularDraft}');
    expect(sectionSource).toContain('salesParticularDraft: salesParticularModel,');
    expect(sectionSource).toContain('padConfirmationKey,');
    expect(saleDetailsSource).toContain('if (payload.salesParticularDraft) {');
    expect(saleDetailsSource).toContain('mergeSalesParticularDraftDetails(');
    expect(saleDetailsSource).toContain('if (payload.padConfirmationKey !== undefined) {');
  });
  test('AC4: submit-for-QC requires remarks via mandatory dialog before calling submit handler', () => {
    expect(sectionSource).toContain('showSubmitForQcDialog');
    expect(sectionSource).toContain("title: 'Submit Sales Verification Task for QC'");
    expect(sectionSource).toContain("'Remarks are mandatory before submitting this task for Quality Control.'");
    expect(sectionSource).toContain(": 'Submit for QC'");
    expect(sectionSource).toContain('ariaLabel="Submit sales verification task for quality control"');
    expect(sectionSource).toContain('ariaLabel="Cancel submit for quality control"');
    expect(sectionSource).toContain("setSubmitForQcRemarksError('Enter remarks before submitting for QC');");
    expect(sectionSource).toContain('remarks: normalizedRemarks,');
    expect(sectionSource).toContain('if (!validate()) {');
    expect(saleDetailsSource).toContain("if (actionType === 'submitSalesVerificationTaskForQc') {");
    expect(saleDetailsSource).toContain(": 'QC Requested';");
  });

  test('AC4b: QC action cluster is grouped and labelled for assistive technology', () => {
    expect(sectionSource).toContain('aria-label="Quality control actions"');
  });

  test('AC7: complete action is disabled when status is Assigned QC Failed', () => {
    expect(shellSource).toContain('taskStatus={model.statusText}');
    expect(rulesSource).toContain('taskStatus?: string;');
    expect(rulesSource).toContain("if (taskStatus?.trim().toLowerCase() === 'assigned qc failed') {");
    expect(rulesSource).toContain("reason: 'Complete task is disabled after QC failure. Submit for QC instead.'");
  });

  test('AC8: resubmission after QC fail maps to Reassigned To QC status', () => {
    expect(saleDetailsSource).toContain("normalizeTaskStatus(currentStatus) === 'assigned qc failed'");
    expect(saleDetailsSource).toContain("? 'Reassigned To QC'");
    expect(saleDetailsSource).toContain('const applySalesVerificationTaskStatus = (');
    expect(saleDetailsSource).toContain('taskstatus: taskStatus,');
  });

  test('AC9: QC Audit History action and ordering by most recent change are preserved', () => {
    expect(taskSectionSource).toContain('text="QC Audit History"');
    expect(runtimeSource).toContain("await this.handleAuditHistoryOpen('QC');");
    expect(rulesSource).toContain("'QC log is available to the assigned caseworker, QC users, and managers.'");
    expect(viewModelSource).toContain('.sort((left, right) => right.sortValue - left.sortValue)');
  });

  test('AC10: submit success is shown in the dialog before returning to the table', () => {
    const sectionSource = readRepoFile('DetailsListVOA/components/SaleDetailsShell/sections/SalesVerificationSection.tsx');
    expect(sectionSource).toContain('Sales verification task completed successfully. Returning to table...');
    expect(sectionSource).toContain('Sales verification task submitted for QC successfully. Returning to table...');
    expect(sectionSource).toContain('onReturnToTableAfterSubmit?.();');
  });
});

