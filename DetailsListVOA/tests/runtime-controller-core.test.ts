import { DetailsListRuntimeController } from '../services/DetailsListRuntimeController';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Internal = Record<string, unknown>;

const makeNotify = (): jest.Mock => jest.fn();

const makeContext = (
  params: Record<string, { raw?: string }> = {},
  userSettings: Record<string, string> = {},
) =>
  ({
    parameters: params as unknown,
    userSettings: userSettings as unknown,
  }) as ComponentFramework.Context<never>;

const createController = (
  flags: { hasCaseworkerAccess?: boolean; hasQaAccess?: boolean; hasManagerAccess?: boolean } = {},
  ctx?: ComponentFramework.Context<never>,
) => {
  const controller = new DetailsListRuntimeController();
  const i = controller as unknown as Internal;
  const notify = makeNotify();
  i._notifyOutputChanged = notify;
  i._context = ctx ?? makeContext();
  if (flags.hasCaseworkerAccess !== undefined) i.hasCaseworkerAccess = flags.hasCaseworkerAccess;
  if (flags.hasQaAccess !== undefined) i.hasQaAccess = flags.hasQaAccess;
  if (flags.hasManagerAccess !== undefined) i.hasManagerAccess = flags.hasManagerAccess;
  return { controller, notify, internal: i };
};

// ---------------------------------------------------------------------------
// init / setContext / getOutputs
// ---------------------------------------------------------------------------

describe('init and setContext', () => {
  test('init sets context and notifyOutputChanged', () => {
    const controller = new DetailsListRuntimeController();
    const ctx = makeContext();
    const notify = jest.fn();
    controller.init(ctx as never, notify);
    expect((controller as unknown as Internal)._context).toBe(ctx);
    expect((controller as unknown as Internal)._notifyOutputChanged).toBe(notify);
  });

  test('setContext replaces context', () => {
    const { controller } = createController();
    const newCtx = makeContext({ foo: { raw: 'bar' } });
    controller.setContext(newCtx as never);
    expect((controller as unknown as Internal)._context).toBe(newCtx);
  });

  test('getOutputs includes expected keys', () => {
    const { controller } = createController();
    const outputs = controller.getOutputs();
    expect(outputs).toHaveProperty('selectedTaskId');
    expect(outputs).toHaveProperty('selectedSaleId');
    expect(outputs).toHaveProperty('saleDetails');
    expect(outputs).toHaveProperty('viewSalePending');
  });
});

// ---------------------------------------------------------------------------
// handleSelectionChange / handleSelectionCountChange
// ---------------------------------------------------------------------------

describe('handleSelectionChange', () => {
  test('sets selectedTaskId and selectedSaleId', () => {
    const { controller, internal } = createController();
    controller.handleSelectionChange({ taskId: 'T-1', saleId: 'S-1', selectedTaskIds: ['T-1'], selectedSaleIds: ['S-1'] });
    expect(internal.selectedTaskId).toBe('T-1');
    expect(internal.selectedSaleId).toBe('S-1');
  });

  test('converts selectedTaskIds array to JSON', () => {
    const { controller, internal } = createController();
    controller.handleSelectionChange({ taskId: 'T-1', selectedTaskIds: ['T-1', 'T-2'], selectedSaleIds: [] });
    expect(internal.selectedTaskIdsJson).toBe('["T-1","T-2"]');
  });

  test('filters empty values from selectedTaskIds', () => {
    const { controller, internal } = createController();
    controller.handleSelectionChange({ selectedTaskIds: ['T-1', '', 'T-3'], selectedSaleIds: [] });
    expect(internal.selectedTaskIdsJson).toBe('["T-1","T-3"]');
  });

  test('sets selectedCount from taskIds length', () => {
    const { controller, internal } = createController();
    controller.handleSelectionChange({ selectedTaskIds: ['T-1', 'T-2', 'T-3'], selectedSaleIds: [] });
    expect(internal.selectedCount).toBe(3);
  });

  test('uses saleIds length when no tasks', () => {
    const { controller, internal } = createController();
    controller.handleSelectionChange({ selectedTaskIds: [], selectedSaleIds: ['S-1', 'S-2'] });
    expect(internal.selectedCount).toBe(2);
  });
});

describe('handleSelectionCountChange', () => {
  test('updates selectedCount when changed', () => {
    const { controller, internal } = createController();
    controller.handleSelectionCountChange(7);
    expect(internal.selectedCount).toBe(7);
  });

  test('does not mutate when count is same', () => {
    const { controller, internal } = createController();
    internal.selectedCount = 5;
    controller.handleSelectionCountChange(5);
    expect(internal.selectedCount).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// handleBackToCanvas / handleDetailsBack
// ---------------------------------------------------------------------------

describe('handleBackToCanvas', () => {
  test('resets sale details and emits back action', () => {
    const { controller, internal, notify } = createController();
    internal._saleDetails = '{"some":"data"}';
    internal.showPcfSaleDetails = true;
    controller.handleBackToCanvas();
    expect(internal._saleDetails).toBe('');
    expect(internal.showPcfSaleDetails).toBe(false);
    expect(notify).toHaveBeenCalled();
  });

  test('emits back action type', () => {
    const { controller, internal } = createController();
    controller.handleBackToCanvas();
    expect(internal.actionType).toBe('back');
  });
});

describe('handleDetailsBack', () => {
  test('resets PCF details state and emits back action', () => {
    const { controller, internal, notify } = createController();
    internal._saleDetails = '{"data":"present"}';
    internal.showPcfSaleDetails = true;
    internal.viewSalePending = true;
    controller.handleDetailsBack();
    expect(internal._saleDetails).toBe('');
    expect(internal.showPcfSaleDetails).toBe(false);
    expect(internal.viewSalePending).toBe(false);
    expect(notify).toHaveBeenCalled();
  });

  test('emits back action type', () => {
    const { controller, internal } = createController();
    controller.handleDetailsBack();
    expect(internal.actionType).toBe('back');
  });
});

// ---------------------------------------------------------------------------
// closeDetailsAfterSubmit / clearSubmitSuccessMessage
// ---------------------------------------------------------------------------

describe('closeDetailsAfterSubmit', () => {
  test('clears all detail state', () => {
    const { controller, internal } = createController();
    internal._saleDetails = '{"x":1}';
    internal.showPcfSaleDetails = true;
    internal.saleDetailsReadOnly = true;
    controller.closeDetailsAfterSubmit();
    expect(internal._saleDetails).toBe('');
    expect(internal.showPcfSaleDetails).toBe(false);
    expect(internal.saleDetailsReadOnly).toBe(false);
  });

  test('emits back action', () => {
    const { controller, internal } = createController();
    controller.closeDetailsAfterSubmit();
    expect(internal.actionType).toBe('back');
  });
});

describe('clearSubmitSuccessMessage', () => {
  test('clears notification and calls notifyOutputChanged', () => {
    const { controller, internal, notify } = createController();
    internal.submitSuccessNotification = 'Task submitted';
    controller.clearSubmitSuccessMessage();
    expect(internal.submitSuccessNotification).toBeUndefined();
    expect(notify).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Getters
// ---------------------------------------------------------------------------

describe('property getters', () => {
  test('isViewSalePending returns true when viewSalePending is true', () => {
    const { controller, internal } = createController();
    internal.viewSalePending = true;
    expect(controller.isViewSalePending).toBe(true);
  });

  test('shouldShowPcfSaleDetails reflects showPcfSaleDetails', () => {
    const { controller, internal } = createController();
    internal.showPcfSaleDetails = true;
    expect(controller.shouldShowPcfSaleDetails).toBe(true);
  });

  test('isSaleDetailsReadOnly returns true for internal readOnly flag', () => {
    const { controller, internal } = createController();
    internal.saleDetailsReadOnly = true;
    expect(controller.isSaleDetailsReadOnly).toBe(true);
  });

  test('isSaleDetailsReadOnly returns true for external readonly mode', () => {
    const { controller, internal } = createController();
    internal.externalReadOnlyMode = true;
    expect(controller.isSaleDetailsReadOnly).toBe(true);
  });

  test('saleDetailsReadOnlyReason returns external message when external readonly active', () => {
    const { controller, internal } = createController();
    internal.externalReadOnlyMode = true;
    expect(controller.saleDetailsReadOnlyReason).toContain('readonly mode');
  });

  test('saleDetailsReadOnlyReason returns internal message otherwise', () => {
    const { controller, internal } = createController();
    internal.saleDetailsReadOnlyMessage = 'Caseworker view';
    expect(controller.saleDetailsReadOnlyReason).toBe('Caseworker view');
  });

  test('areInternalSaleDetailsActionsDisabled reflects flag', () => {
    const { controller, internal } = createController();
    internal.disableInternalDetailsActions = true;
    expect(controller.areInternalSaleDetailsActionsDisabled).toBe(true);
  });

  test('submitSuccessMessage returns undefined when not set', () => {
    const { controller } = createController();
    expect(controller.submitSuccessMessage).toBeUndefined();
  });

  test('canCreateManualTask requires both manager and caseworker', () => {
    const { controller } = createController({ hasCaseworkerAccess: true, hasManagerAccess: true });
    expect(controller.canCreateManualTask).toBe(true);
  });

  test('canCreateManualTask false when only caseworker', () => {
    const { controller } = createController({ hasCaseworkerAccess: true, hasManagerAccess: false });
    expect(controller.canCreateManualTask).toBe(false);
  });

  test('canModifySvtTask reflects caseworkerAccess', () => {
    const { controller } = createController({ hasCaseworkerAccess: true });
    expect(controller.canModifySvtTask).toBe(true);
  });

  test('canProgressSalesVerificationTask reflects caseworkerAccess', () => {
    const { controller } = createController({ hasCaseworkerAccess: false });
    expect(controller.canProgressSalesVerificationTask).toBe(false);
  });

  test('canSubmitQcOutcome reflects saleDetailsCanSubmitQcOutcome', () => {
    const { controller, internal } = createController();
    internal.saleDetailsCanSubmitQcOutcome = true;
    expect(controller.canSubmitQcOutcome).toBe(true);
  });

  test('shouldShowQcSection reflects saleDetailsShowQcSection', () => {
    const { controller, internal } = createController();
    internal.saleDetailsShowQcSection = true;
    expect(controller.shouldShowQcSection).toBe(true);
  });

  test('entraObjectId returns empty string when not set', () => {
    const { controller } = createController();
    expect(controller.entraObjectId).toBe('');
  });

  test('entraObjectId returns stored value', () => {
    const { controller, internal } = createController();
    internal._entraObjectId = 'oid-abc-123';
    expect(controller.entraObjectId).toBe('oid-abc-123');
  });
});

// ---------------------------------------------------------------------------
// activeWorkspaceName
// ---------------------------------------------------------------------------

describe('activeWorkspaceName', () => {
  const cases: Array<{ screenKind: string; expected: string }> = [
    { screenKind: 'managerAssign', expected: 'Manager Assignment' },
    { screenKind: 'qcAssign', expected: 'QC Assignment' },
    { screenKind: 'caseworkerView', expected: 'Caseworker View' },
    { screenKind: 'qcView', expected: 'QC View' },
    { screenKind: 'salesSearch', expected: 'Sales Search' },
    { screenKind: 'custom', expected: 'custom' },
    { screenKind: '', expected: '' },
  ];

  cases.forEach(({ screenKind, expected }) => {
    test(`screenKind "${screenKind}" → "${expected}"`, () => {
      const { controller, internal } = createController();
      internal.selectedScreenKind = screenKind;
      expect(controller.activeWorkspaceName).toBe(expected);
    });
  });
});

// ---------------------------------------------------------------------------
// syncPcfViewSalesEnabled
// ---------------------------------------------------------------------------

describe('syncPcfViewSalesEnabled', () => {
  test('hides PCF details when disabled and currently shown', () => {
    const { controller, internal } = createController();
    internal.showPcfSaleDetails = true;
    controller.syncPcfViewSalesEnabled(false);
    expect(internal.showPcfSaleDetails).toBe(false);
  });

  test('does nothing when enabled', () => {
    const { controller, internal } = createController();
    internal.showPcfSaleDetails = true;
    controller.syncPcfViewSalesEnabled(true);
    expect(internal.showPcfSaleDetails).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getActiveRequestContext / setManagerJourneyActive / updateManagerJourneyContext
// ---------------------------------------------------------------------------

describe('manager journey context', () => {
  test('setManagerJourneyActive(false) clears journey context', () => {
    const { controller, internal } = createController();
    internal.managerJourneyContext = { country: 'EW', listYear: '2024' } as unknown;
    controller.setManagerJourneyActive(false);
    expect(internal.managerJourneyActive).toBe(false);
    expect(internal.managerJourneyContext).toBeUndefined();
  });

  test('setManagerJourneyActive(true) activates journey', () => {
    const { controller, internal } = createController();
    controller.setManagerJourneyActive(true);
    expect(internal.managerJourneyActive).toBe(true);
  });

  test('updateManagerJourneyContext stores normalized context', () => {
    const { controller, internal } = createController();
    controller.updateManagerJourneyContext({ country: 'EW', listYear: '2024' });
    const ctx = internal.managerJourneyContext as { country: string; listYear: string };
    expect(ctx.country).toBe('EW');
    expect(ctx.listYear).toBe('2024');
  });
});

// ---------------------------------------------------------------------------
// getMdaAppId / getVmsBaseUrl / getFxEnvironmentUrl
// ---------------------------------------------------------------------------

describe('URL and ID getters from context', () => {
  test('getMdaAppId returns value from context param', () => {
    const { controller } = createController({}, makeContext({ mdaAppId: { raw: 'app-123' } }) as never);
    expect(controller.getMdaAppId()).toBe('app-123');
  });

  test('getVmsBaseUrl returns value from context param', () => {
    const { controller } = createController({}, makeContext({ vmsBaseUrl: { raw: 'https://vms.example.com' } }) as never);
    expect(controller.getVmsBaseUrl()).toBe('https://vms.example.com');
  });

  test('getFxEnvironmentUrl falls back to context param when no page.getClientUrl', () => {
    const { controller } = createController({}, makeContext({ fxEnvironmentUrl: { raw: 'https://env.example.com' } }) as never);
    expect(controller.getFxEnvironmentUrl()).toBe('https://env.example.com');
  });

  test('getFxEnvironmentUrl returns empty string when both sources absent', () => {
    const { controller } = createController();
    expect(controller.getFxEnvironmentUrl()).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Private helper methods via casting
// ---------------------------------------------------------------------------

describe('normalizeTaskIdForModifyTask (private)', () => {
  type WithPrivate = {
    normalizeTaskIdForModifyTask: (taskId: string) => string;
  };

  test('extracts digits from M-1234 format', () => {
    const { controller } = createController();
    const p = controller as unknown as WithPrivate;
    expect(p.normalizeTaskIdForModifyTask('M-1234')).toBe('1234');
  });

  test('returns empty string for empty input', () => {
    const { controller } = createController();
    const p = controller as unknown as WithPrivate;
    expect(p.normalizeTaskIdForModifyTask('')).toBe('');
  });

  test('returns digits from numeric-only id', () => {
    const { controller } = createController();
    const p = controller as unknown as WithPrivate;
    expect(p.normalizeTaskIdForModifyTask('9876')).toBe('9876');
  });
});

describe('toBooleanFlag (private)', () => {
  type WithPrivate = {
    toBooleanFlag: (value: unknown) => boolean | undefined;
  };

  test.each([
    [true, true],
    [false, false],
    [1, true],
    [0, false],
    ['true', true],
    ['1', true],
    ['yes', true],
    ['y', true],
    ['false', false],
    ['0', false],
    ['no', false],
    ['n', false],
    ['', undefined],
    [null, undefined],
    ['maybe', undefined],
  ])('toBooleanFlag(%p) → %p', (input, expected) => {
    const { controller } = createController();
    const p = controller as unknown as WithPrivate;
    expect(p.toBooleanFlag(input)).toBe(expected);
  });
});

describe('resolveHereditamentId (private)', () => {
  type WithPrivate = {
    resolveHereditamentId: (details: Record<string, unknown>) => string;
  };

  const GUID = '11111111-1111-1111-1111-111111111111';

  test('returns hereditamentId from top-level details', () => {
    const { controller } = createController();
    const p = controller as unknown as WithPrivate;
    expect(p.resolveHereditamentId({ hereditamentId: GUID })).toBe(GUID);
  });

  test('returns suId when hereditamentId absent', () => {
    const { controller } = createController();
    const p = controller as unknown as WithPrivate;
    expect(p.resolveHereditamentId({ suId: GUID })).toBe(GUID);
  });

  test('returns hereditamentId from nested propertyAndBandingDetails', () => {
    const { controller } = createController();
    const p = controller as unknown as WithPrivate;
    expect(p.resolveHereditamentId({ propertyAndBandingDetails: { hereditamentId: GUID } })).toBe(GUID);
  });

  test('returns empty string when no candidates present', () => {
    const { controller } = createController();
    const p = controller as unknown as WithPrivate;
    expect(p.resolveHereditamentId({ otherField: 'value' })).toBe('');
  });
});
