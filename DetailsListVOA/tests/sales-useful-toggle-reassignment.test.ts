import fs from 'fs';
import path from 'path';

import {
  getSalesVerificationEditRule,
  getSalesVerificationMandatoryValidation,
} from '../components/SaleDetailsShell/rules/ViewSaleActionRules';

const repoRoot = path.resolve(__dirname, '..', '..');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('sales useful toggle and reassignment regression checks', () => {
  const sectionSource = readRepoFile('DetailsListVOA/components/SaleDetailsShell/sections/SalesVerificationSection.tsx');
  const runtimeSource = readRepoFile('DetailsListVOA/services/DetailsListRuntimeController.ts');

  test('toggle No -> Yes does not keep why-not-useful as a required blocker', () => {
    const detailsAvailableDraft = {
      reviewStatusKey: 'details-not-available',
      linkParticulars: '',
      kitchenAge: '',
      kitchenSpecification: '',
      bathroomAge: '',
      bathroomSpecification: '',
      glazing: '',
      heating: '',
      decorativeFinishes: '',
      conditionScore: '',
      conditionCategory: '',
      particularsNotes: '',
    } as const;

    const noValidation = getSalesVerificationMandatoryValidation({
      isSaleUsefulKey: 'no',
      whyNotUsefulKey: undefined,
      padConfirmationKey: undefined,
      salesParticularModel: detailsAvailableDraft,
    });
    expect(noValidation.whyNotUsefulError).toBe('Enter why the sale is not useful');

    const yesValidation = getSalesVerificationMandatoryValidation({
      isSaleUsefulKey: 'yes',
      whyNotUsefulKey: undefined,
      padConfirmationKey: 'Data enhancement job not required',
      salesParticularModel: detailsAvailableDraft,
    });
    expect(yesValidation.whyNotUsefulError).toBeUndefined();
  });

  test('component explicitly clears why-not-useful selection when sale useful is not No', () => {
    expect(sectionSource).toContain("if (nextKey !== 'no') {");
    expect(sectionSource).toContain('setWhyNotUsefulKey(undefined);');
    expect(sectionSource).toContain('setWhyNotUsefulError(undefined);');
    expect(sectionSource).toContain("nextSaleUsefulKey === 'no'");
    expect(sectionSource).toContain('selectedKey={isNotUseful ? whyNotUsefulKey : undefined}');
  });

  test('component keeps Is this sale useful editable only when verification edit rule allows it', () => {
    expect(sectionSource).toContain('const editingDisabled = salesVerificationEditRule.disabled;');
    expect(sectionSource).toContain('id="voa-sale-useful"');
    expect(sectionSource).toContain('disabled={editingDisabled}');

    expect(getSalesVerificationEditRule({ busy: false, readOnly: false, canProgressTask: true })).toEqual({ disabled: false });
    expect(getSalesVerificationEditRule({ busy: false, readOnly: false, canProgressTask: false }).disabled).toBe(true);
    expect(getSalesVerificationEditRule({ busy: false, readOnly: true, canProgressTask: true }).disabled).toBe(true);
  });

  test('assigned back to caseworker path remains editable via Assigned QC Failed status gate', () => {
    expect(runtimeSource).toContain("const EDITABLE_CASEWORKER_STATUSES = new Set(['assigned', 'assigned qc failed']);");
    expect(runtimeSource).toContain('This task is read-only unless it is assigned to you and in status Assigned or Assigned QC Failed.');
  });
});
