/**
 * Tests: Navigating between sale detail records resets all section state,
 * preventing stale draft values from causing false mandatory validation errors.
 *
 * Root-cause fix: A React `key` prop on the sections Stack forces a full
 * remount whenever model.saleId or model.taskId changes, guaranteeing
 * fresh useState initialisations and eliminating multi-layer sync bugs.
 */
import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..', '..');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const shellSource = readRepoFile('DetailsListVOA/components/SaleDetailsShell/SaleDetailsShell.tsx');
const salesParticularSource = readRepoFile('DetailsListVOA/components/SaleDetailsShell/sections/SalesParticularSection.tsx');
const salesVerificationSource = readRepoFile('DetailsListVOA/components/SaleDetailsShell/sections/SalesVerificationSection.tsx');
const runtimeSource = readRepoFile('DetailsListVOA/services/DetailsListRuntimeController.ts');

/* ================================================================== */
/*  1. Key-based remount on sale/task change                          */
/* ================================================================== */

describe('sections Stack uses a key that changes per sale/task', () => {
  test('sections Stack has key built from model.saleId and model.taskId', () => {
    // The key must combine both identifiers so navigating to a different sale
    // or a different task on the same sale forces a full remount.
    expect(shellSource).toMatch(/key=\{`\$\{model\.saleId\}.*\$\{model\.taskId\}`\}/);
  });

  test('key appears on the Stack wrapper that contains all detail sections', () => {
    // The key must be on the element that wraps SalesParticularSection and
    // SalesVerificationSection so both remount together.
    const keyIndex = shellSource.indexOf('key={`${model.saleId}');
    const salesParticularIndex = shellSource.indexOf('<SalesParticularSection');
    const salesVerificationIndex = shellSource.indexOf('<SalesVerificationSection');
    expect(keyIndex).toBeGreaterThan(-1);
    expect(keyIndex).toBeLessThan(salesParticularIndex);
    expect(keyIndex).toBeLessThan(salesVerificationIndex);
  });

  test('key is on the Stack that also contains PadSection so padConfirmationKey resets', () => {
    const keyIndex = shellSource.indexOf('key={`${model.saleId}');
    const padSectionIndex = shellSource.indexOf('<PadSection');
    expect(keyIndex).toBeGreaterThan(-1);
    expect(keyIndex).toBeLessThan(padSectionIndex);
  });
});

/* ================================================================== */
/*  2. SalesParticularSection initialises state from model            */
/* ================================================================== */

describe('SalesParticularSection state initialisation', () => {
  const REQUIRED_FIELDS = [
    'kitchenAge',
    'kitchenSpecification',
    'bathroomAge',
    'bathroomSpecification',
    'glazing',
    'heating',
    'decorativeFinishes',
  ];

  test('each required field has useState initialised from model', () => {
    REQUIRED_FIELDS.forEach((field) => {
      expect(salesParticularSource).toContain(`React.useState(model.${field})`);
    });
  });

  test('onDraftChange effect fires whenever field values change', () => {
    // The effect that updates the shell draft must depend on all required fields
    REQUIRED_FIELDS.forEach((field) => {
      const draftEffectRegion = salesParticularSource.slice(
        salesParticularSource.indexOf('onDraftChange?.({'),
        salesParticularSource.indexOf('], [') > salesParticularSource.indexOf('onDraftChange?.({')
          ? salesParticularSource.indexOf('], [', salesParticularSource.indexOf('onDraftChange?.({')) + 200
          : salesParticularSource.indexOf('onDraftChange?.({') + 500,
      );
      expect(draftEffectRegion).toContain(field);
    });
  });
});

/* ================================================================== */
/*  3. SalesVerificationSection validates from salesParticularModel   */
/* ================================================================== */

describe('cross-section mandatory validation', () => {
  test('collectCrossSectionMandatoryErrors checks salesParticularModel (the draft)', () => {
    expect(salesVerificationSource).toContain('salesParticularModel.reviewStatusKey');
    expect(salesVerificationSource).toContain('salesParticularModel[key]');
  });

  test('all 8 required fields are validated (including condition score)', () => {
    const FIELDS = [
      'kitchenAge',
      'kitchenSpecification',
      'bathroomAge',
      'bathroomSpecification',
      'glazing',
      'heating',
      'decorativeFinishes',
      'conditionScore',
    ];
    FIELDS.forEach((field) => {
      expect(salesVerificationSource).toContain(`key: '${field}'`);
    });
  });

  test('padConfirmation is also validated cross-section', () => {
    expect(salesVerificationSource).toContain('trimValue(padConfirmationKey)');
  });
});

/* ================================================================== */
/*  4. Runtime retainSaleDetails flag behaviour                       */
/* ================================================================== */

describe('retainSaleDetails behaviour in runtime controller', () => {
  test('retainSaleDetails is true only when PCF view is already showing', () => {
    expect(runtimeSource).toContain('retainSaleDetails: pcfViewSalesEnabled && this.showPcfSaleDetails');
  });

  test('beginViewSaleRequest clears _saleDetails when NOT retaining', () => {
    // When retainSaleDetails is false, old data is cleared immediately
    expect(runtimeSource).toContain("if (!options?.retainSaleDetails)");
    expect(runtimeSource).toContain("this._saleDetails = ''");
  });

  test('finishViewSaleRequest always sets _saleDetails to the new payload', () => {
    expect(runtimeSource).toContain('this._saleDetails = detailsPayload');
  });

  test('handleDetailsBack clears _saleDetails', () => {
    // Going back to grid clears sale details so next navigation starts fresh
    const backMethod = runtimeSource.slice(
      runtimeSource.indexOf('handleDetailsBack'),
      runtimeSource.indexOf('}', runtimeSource.indexOf('handleDetailsBack') + 200),
    );
    expect(backMethod).toContain("this._saleDetails = ''");
  });
});

/* ================================================================== */
/*  5. Shell draft resync effects still exist as safety net           */
/* ================================================================== */

describe('shell draft resync effects', () => {
  test('salesParticularDraft resync effect exists with saleId, taskId dependencies', () => {
    expect(shellSource).toContain('[model.saleId, model.taskId, model.salesParticular]');
  });

  test('padConfirmationKey resync effect exists', () => {
    expect(shellSource).toContain('[model.initialPadConfirmationKey]');
  });

  test('promotedMasterRecord resync effect exists', () => {
    expect(shellSource).toContain('[model.saleId, model.taskId, model.initialPromotedMasterRecord]');
  });
});

/* ================================================================== */
/*  6. SalesVerificationSection clears errors on model/prop change    */
/* ================================================================== */

describe('error clearing on model change', () => {
  test('SalesVerificationSection clears mandatoryErrorMessages when model changes', () => {
    expect(salesVerificationSource).toContain('setMandatoryErrorMessages([]);');
  });

  test('SalesVerificationSection clears mandatory errors when salesParticularModel changes', () => {
    expect(salesVerificationSource).toContain('[salesParticularModel, padConfirmationKey]');
  });

  test('SalesParticularSection clears validationErrors when model changes', () => {
    expect(salesParticularSource).toContain('setValidationErrors({});');
  });
});

/* ================================================================== */
/*  7. QC section stale state covered by key-based remount            */
/* ================================================================== */

describe('QC section state is reset by key-based remount', () => {
  test('SalesVerificationSection with QC section is inside the keyed Stack', () => {
    const keyIndex = shellSource.indexOf('key={`${model.saleId}');
    const svSectionIndex = shellSource.indexOf('<SalesVerificationSection');
    const stackCloseIndex = shellSource.indexOf('</Stack>', keyIndex);
    expect(keyIndex).toBeGreaterThan(-1);
    expect(svSectionIndex).toBeGreaterThan(keyIndex);
    expect(svSectionIndex).toBeLessThan(stackCloseIndex);
  });

  test('QC local state (qcOutcomeKey, qcOutcomeRemarks, qcRemarks) is useState in SalesVerificationSection', () => {
    expect(salesVerificationSource).toContain('useState<string | undefined>(toQcOutcomeKey(model.qcOutcome))');
    expect(salesVerificationSource).toContain('useState(model.qcRemark)');
    expect(salesVerificationSource).toContain('useState(model.remarks)');
  });

  test('QC props (canSubmitQcOutcome, showQcSection) are passed to SalesVerificationSection from shell', () => {
    expect(shellSource).toContain('canSubmitQcOutcome={canSubmitQcOutcome');
    expect(shellSource).toContain('showQcSection={showQcSection');
  });

  test('runtime controller recalculates QC access in finishViewSaleRequest', () => {
    expect(runtimeSource).toContain('resolveQcSectionAccess(detailsPayload)');
  });
});

/* ================================================================== */
/*  8. Condition score is mandatory when details are available         */
/* ================================================================== */

describe('condition score mandatory validation', () => {
  test('conditionScore is in the SALES_PARTICULAR_REQUIRED_FIELDS array', () => {
    expect(salesVerificationSource).toContain("key: 'conditionScore'");
    expect(salesVerificationSource).toContain("message: 'Calculate the condition score'");
  });

  test('condition score validation only triggers for details-available', () => {
    // The conditionScore check sits inside the `reviewStatusKey === 'details-available'` branch
    expect(salesVerificationSource).toContain("salesParticularModel.reviewStatusKey === 'details-available'");
  });

  test('calculate button exists in SalesParticularSection', () => {
    expect(salesParticularSource).toContain('text="Calculate"');
    expect(salesParticularSource).toContain('ariaLabel="Calculate condition score and category"');
  });

  test('condition score field placeholder indicates auto-calculation', () => {
    expect(salesParticularSource).toContain('placeholder="Auto calculated on click of Calculate..."');
  });
});

/* ================================================================== */
/*  9. Back from details triggers emitAction for grid auto-refresh    */
/* ================================================================== */

describe('grid auto-refresh on back from details', () => {
  test('handleDetailsBack calls emitAction(back) to signal the host', () => {
    const backMethod = runtimeSource.slice(
      runtimeSource.indexOf('handleDetailsBack'),
      runtimeSource.indexOf('}', runtimeSource.indexOf('handleDetailsBack') + 300),
    );
    expect(backMethod).toContain("this.emitAction('back')");
  });

  test('handleDetailsBack does NOT call _notifyOutputChanged directly (emitAction handles it)', () => {
    const backMethodStart = runtimeSource.indexOf('handleDetailsBack');
    const backMethodEnd = runtimeSource.indexOf('}', backMethodStart + 300);
    const backMethod = runtimeSource.slice(backMethodStart, backMethodEnd);
    expect(backMethod).not.toContain('this._notifyOutputChanged()');
  });

  test('handleDetailsBack is consistent with handleBackToCanvas in using emitAction', () => {
    const canvasBackStart = runtimeSource.indexOf('handleBackToCanvas');
    const canvasBackEnd = runtimeSource.indexOf('}', canvasBackStart + 200);
    const canvasBack = runtimeSource.slice(canvasBackStart, canvasBackEnd);
    expect(canvasBack).toContain("this.emitAction('back')");

    const detailsBackStart = runtimeSource.indexOf('handleDetailsBack');
    const detailsBackEnd = runtimeSource.indexOf('}', detailsBackStart + 300);
    const detailsBack = runtimeSource.slice(detailsBackStart, detailsBackEnd);
    expect(detailsBack).toContain("this.emitAction('back')");
  });

  test('emitAction(back) clears selection and bumps actionRequestId for host-driven searchTrigger', () => {
    const emitStart = runtimeSource.indexOf('private emitAction');
    const emitEnd = runtimeSource.indexOf('\n  }', emitStart);
    const emitBody = runtimeSource.slice(emitStart, emitEnd);
    // Clears selection on back
    expect(emitBody).toContain("this.selectedTaskId = ''");
    expect(emitBody).toContain("this.selectedSaleId = ''");
    // Bumps action outputs so the host can respond
    expect(emitBody).toContain('this.actionRequestId');
    expect(emitBody).toContain('this._notifyOutputChanged()');
  });

  test('APIM load effect uses searchTrigger from context to detect host-driven refresh', () => {
    const hostSource = readRepoFile('DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx');
    expect(hostSource).toContain('searchTrigger');
    expect(hostSource).toContain("lastRef.current.trigger !== trigger");
  });
});

/* ================================================================== */
/*  10. refreshNonce: grid auto-re-fetches when returning from details */
/* ================================================================== */

describe('refreshNonce mechanism for grid auto-refresh on back', () => {
  const controlShellSource = readRepoFile('DetailsListVOA/components/ControlShell/DetailsListControlShell.tsx');
  const hostSource = readRepoFile('DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx');
  const managerShellSource = readRepoFile('DetailsListVOA/components/HomeShell/ManagerJourneyShell.tsx');

  test('DetailsListControlShell tracks showPcfDetails transitions and bumps refreshNonce', () => {
    expect(controlShellSource).toContain('prevShowPcfDetailsRef.current && !showPcfDetails');
    expect(controlShellSource).toContain('setRefreshNonce');
  });

  test('DetailsListControlShell passes refreshNonce to DetailsListHost', () => {
    expect(controlShellSource).toContain('refreshNonce={refreshNonce}');
  });

  test('DetailsListControlShell passes refreshNonce to ManagerJourneyShell', () => {
    expect(controlShellSource).toContain('refreshNonce={refreshNonce}');
    const managerBlock = controlShellSource.slice(
      controlShellSource.indexOf('ManagerJourneyShell'),
      controlShellSource.indexOf('/>', controlShellSource.indexOf('ManagerJourneyShell')) + 2,
    );
    expect(managerBlock).toContain('refreshNonce');
  });

  test('DetailsListHost accepts refreshNonce and bumps searchNonce on change', () => {
    expect(hostSource).toContain('refreshNonce');
    expect(hostSource).toContain('setSearchNonce');
    // Verify it detects refreshNonce change via ref comparison
    expect(hostSource).toContain('refreshNonceRef');
  });

  test('ManagerJourneyShell passes refreshNonce through to DetailsListHost', () => {
    expect(managerShellSource).toContain('refreshNonce');
    const hostBlock = managerShellSource.slice(
      managerShellSource.indexOf('<DetailsListHost'),
      managerShellSource.indexOf('/>', managerShellSource.indexOf('<DetailsListHost')) + 2,
    );
    expect(hostBlock).toContain('refreshNonce');
  });
});
