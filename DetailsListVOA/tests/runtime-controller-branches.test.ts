import { DetailsListRuntimeController } from '../services/DetailsListRuntimeController';
import { executeUnboundCustomApi } from '../services/CustomApi';

jest.mock('../services/CustomApi', () => ({
  executeUnboundCustomApi: jest.fn(),
  normalizeCustomApiName: (value?: string) => (value ?? '').trim().toLowerCase(),
  resolveCustomApiOperationType: () => 0,
}));

type AnyController = any;

const makeContext = (params: Record<string, { raw?: string }> = {}, userSettings: Record<string, string> = {}) => ({
  parameters: params as unknown,
  userSettings: userSettings as unknown,
}) as ComponentFramework.Context<never>;

const createController = () => {
  const controller = new DetailsListRuntimeController() as unknown as AnyController;
  const notify = jest.fn();
  controller._notifyOutputChanged = notify;
  controller._context = makeContext({}, { userId: '{USER-1}', userName: 'Case Worker', userDisplayName: 'Case Worker' });
  return { controller, notify };
};

const mockedExecuteUnboundCustomApi = executeUnboundCustomApi as jest.MockedFunction<typeof executeUnboundCustomApi>;

describe('runtime controller branch coverage helpers', () => {
  beforeEach(() => {
    mockedExecuteUnboundCustomApi.mockReset();
  });

  test('warmupAccessResolution exits early when already resolved', () => {
    const { controller } = createController();
    controller.hasResolvedCaseworkerAccess = true;
    controller.caseworkerAccessRequest = Promise.resolve(true);

    controller.warmupAccessResolution();

    expect(controller.caseworkerAccessRequest).toBeDefined();
  });

  test('syncExternalReadonlyLaunch resets launch state when not readonly launch', () => {
    const { controller } = createController();
    controller.externalLaunchKey = 'old-key';
    controller.externalLaunchInFlight = true;
    controller._context = makeContext({
      externalSaleId: { raw: '' },
      externalOpenMode: { raw: 'vt-readonly' },
    });

    controller.syncExternalReadonlyLaunch();

    expect(controller.externalReadOnlyMode).toBe(false);
    expect(controller.externalLaunchKey).toBeUndefined();
    expect(controller.externalLaunchInFlight).toBe(false);
  });

  test('syncExternalReadonlyLaunch starts readonly flow and calls onTaskClick once', async () => {
    const { controller } = createController();
    const onTaskClick = jest.fn().mockResolvedValue(undefined);
    controller.onTaskClick = onTaskClick;
    controller._context = makeContext({
      externalSaleId: { raw: 'S-100' },
      externalOpenMode: { raw: 'vt-readonly' },
      country: { raw: 'EW' },
      listYear: { raw: '2024' },
    });

    controller.syncExternalReadonlyLaunch();
    await Promise.resolve();
    await Promise.resolve();

    expect(controller.externalReadOnlyMode).toBe(true);
    expect(onTaskClick).toHaveBeenCalledWith(undefined, 'S-100');

    // Dedupe: same launch key should not invoke again.
    controller.syncExternalReadonlyLaunch();
    expect(onTaskClick).toHaveBeenCalledTimes(1);
  });

  test('getFxEnvironmentUrl prefers page.getClientUrl and falls back on throw', () => {
    const { controller } = createController();
    controller._context = {
      ...makeContext({ fxEnvironmentUrl: { raw: 'https://fallback.example.com' } }),
      page: { getClientUrl: () => 'https://host.example.com' },
    } as unknown;
    expect(controller.getFxEnvironmentUrl()).toBe('https://host.example.com');

    controller._context = {
      ...makeContext({ fxEnvironmentUrl: { raw: 'https://fallback.example.com' } }),
      page: { getClientUrl: () => { throw new Error('boom'); } },
    } as unknown;
    expect(controller.getFxEnvironmentUrl()).toBe('https://fallback.example.com');
  });

  test('toUserContextRecord handles nested Result wrappers and json string payload', () => {
    const { controller } = createController();

    const nested = controller.toUserContextRecord({
      Result: {
        result: {
          svtPersona: 'manager',
          matchedTeamName: 'manager assignment',
        },
      },
    });
    expect(nested.svtPersona).toBe('manager');

    const fromJson = controller.toUserContextRecord('{"svtPersona":"qa"}');
    expect(fromJson.svtPersona).toBe('qa');

    const invalid = controller.toUserContextRecord('not-json');
    expect(invalid).toEqual({});
  });

  test('normalizeUserContextValues parses arrays and delimited strings', () => {
    const { controller } = createController();
    expect(controller.normalizeUserContextValues([' Team A ', 'Team B'])).toEqual(['team a', 'team b']);
    expect(controller.normalizeUserContextValues('A; B|C, D')).toEqual(['a', 'b', 'c', 'd']);
    expect(controller.normalizeUserContextValues('')).toEqual([]);
  });

  test('hasCaseworkerEvidence detects persona, matched names, and explicit flag', () => {
    const { controller } = createController();
    expect(controller.hasCaseworkerEvidence({ svtPersona: 'caseworker' })).toBe(true);
    expect(controller.hasCaseworkerEvidence({ matchedTeamName: 'svt user team' })).toBe(true);
    expect(controller.hasCaseworkerEvidence({ hasCaseworkerAccess: 'yes' })).toBe(true);
    expect(controller.hasCaseworkerEvidence({ persona: 'unknown' })).toBe(false);
  });

  test('hasManagerEvidence and hasQaEvidence detect explicit flags', () => {
    const { controller } = createController();
    expect(controller.hasManagerEvidence({ hasManagerAccess: '1' })).toBe(true);
    expect(controller.hasQaEvidence({ hasQualityControlAccess: 'true' })).toBe(true);
    expect(controller.hasManagerEvidence({ hasManagerAccess: '0' })).toBe(false);
    expect(controller.hasQaEvidence({ hasQaAccess: 'no' })).toBe(false);
  });

  test('normalizeIdentityToken trims braces and lowercases', () => {
    const { controller } = createController();
    expect(controller.normalizeIdentityToken('{ABC-123}')).toBe('abc-123');
    expect(controller.normalizeIdentityToken('  User Name  ')).toBe('user name');
    expect(controller.normalizeIdentityToken('')).toBe('');
  });

  test('collectIdentityValues extracts nested ids/names from arrays and objects', () => {
    const { controller } = createController();
    const sink = new Set<string>();

    controller.collectIdentityValues([
      { id: '{USER-1}' },
      { displayName: 'Case Worker' },
      'extra-user',
      [{ userId: 'USER-2' }],
    ], sink);

    expect(Array.from(sink)).toEqual(expect.arrayContaining(['{USER-1}', 'Case Worker', 'extra-user', 'USER-2']));
  });

  test('resolveTaskStatusFromSaleRecord checks multiple key spellings', () => {
    const { controller } = createController();
    expect(controller.resolveTaskStatusFromSaleRecord('{"salesVerificationTaskDetails":{"taskStatus":"Assigned"}}')).toBe('assigned');
    expect(controller.resolveTaskStatusFromSaleRecord('{"taskDetails":{"taskstatus":"Complete"}}')).toBe('complete');
    expect(controller.resolveTaskStatusFromSaleRecord('{"status":"Assigned To QC"}')).toBe('assigned to qc');
    expect(controller.resolveTaskStatusFromSaleRecord('not-json')).toBe('');
  });

  test('hasQcSectionDetails detects qc values across alternate keys', () => {
    const { controller } = createController();
    expect(controller.hasQcSectionDetails('{"qualityControlOutcome":{"qcOutcome":"Pass"}}')).toBe(true);
    expect(controller.hasQcSectionDetails('{"qcOutcomeDetails":{"qcremark":"Needs review"}}')).toBe(true);
    expect(controller.hasQcSectionDetails('{"reviewedby":"QC User"}')).toBe(true);
    expect(controller.hasQcSectionDetails('{"qualityControlOutcome":{"qcOutcome":""}}')).toBe(false);
  });

  test('isManagerAssignmentContext detects from selected kind, table, and context screen', () => {
    const { controller } = createController();

    controller.selectedScreenKind = 'managerAssign';
    expect(controller.isManagerAssignmentContext()).toBe(true);

    controller.selectedScreenKind = 'other';
    controller.selectedTableKey = 'manager';
    expect(controller.isManagerAssignmentContext()).toBe(true);

    controller.selectedTableKey = 'sales';
    controller._context = makeContext({ canvasScreenName: { raw: 'Manager Assignment Workspace' } });
    expect(controller.isManagerAssignmentContext()).toBe(true);

    controller._context = makeContext({ canvasScreenName: { raw: 'Caseworker View' } });
    expect(controller.isManagerAssignmentContext()).toBe(false);
  });

  test('resolveSaleDetailsAccess branch outcomes', () => {
    const { controller } = createController();

    controller.hasCaseworkerAccess = true;
    controller.isManagerAssignmentContext = jest.fn().mockReturnValue(false);
    controller.hasTaskIdInSaleRecord = jest.fn().mockReturnValue(true);
    controller.isSaleRecordUnassigned = jest.fn().mockReturnValue(false);
    controller.canEditAsAssignedCaseworker = jest.fn().mockReturnValue(false);

    const nonManagerReadOnly = controller.resolveSaleDetailsAccess('{}');
    expect(nonManagerReadOnly.readOnly).toBe(true);
    expect(nonManagerReadOnly.reason).toContain('read-only unless it is assigned to you');

    controller.hasCaseworkerAccess = false;
    const noCaseworkerReadOnly = controller.resolveSaleDetailsAccess('{}');
    expect(noCaseworkerReadOnly).toEqual({ readOnly: true });

    controller.isManagerAssignmentContext = jest.fn().mockReturnValue(true);
    controller.isSaleRecordUnassigned = jest.fn().mockReturnValue(true);
    const managerUnassigned = controller.resolveSaleDetailsAccess('{}');
    expect(managerUnassigned.readOnly).toBe(true);
    expect(managerUnassigned.reason).toContain('Manager Assignment is view-only');

    controller.canEditAsAssignedCaseworker = jest.fn().mockReturnValue(true);
    const editable = controller.resolveSaleDetailsAccess('{}');
    expect(editable).toEqual({ readOnly: false });
  });

  test('resolveQcSectionAccess branch outcomes', () => {
    const { controller } = createController();

    // Non QA/manager + caseworker assigned with QC lifecycle => show read-only
    controller.hasQaAccess = false;
    controller.hasManagerAccess = false;
    controller.hasCaseworkerAccess = true;
    controller.isSaleRecordAssignedToCurrentUser = jest.fn().mockReturnValue(true);
    controller.hasQcSectionDetails = jest.fn().mockReturnValue(false);
    controller.resolveTaskStatusFromSaleRecord = jest.fn().mockReturnValue('assigned qc failed');
    expect(controller.resolveQcSectionAccess('{}')).toEqual({ canSubmit: false, showSection: true });

    // QA/manager but not assigned QC => no section
    controller.hasQaAccess = true;
    controller.hasManagerAccess = false;
    controller.isSaleRecordQcAssignedToCurrentUser = jest.fn().mockReturnValue(false);
    controller.isSaleRecordAssignedToCurrentUser = jest.fn().mockReturnValue(false);
    expect(controller.resolveQcSectionAccess('{}')).toEqual({ canSubmit: false, showSection: false });

    // Assigned QC user but status not editable => read-only section
    controller.isSaleRecordQcAssignedToCurrentUser = jest.fn().mockReturnValue(true);
    controller.isTaskStatusEditableByQc = jest.fn().mockReturnValue(false);
    expect(controller.resolveQcSectionAccess('{}')).toEqual({ canSubmit: false, showSection: true });

    // Assigned QC user and editable status => submit allowed
    controller.isTaskStatusEditableByQc = jest.fn().mockReturnValue(true);
    expect(controller.resolveQcSectionAccess('{}')).toEqual({ canSubmit: true, showSection: true });
  });

  test('beginViewSaleRequest resets state unless retainSaleDetails is true', () => {
    const { controller, notify } = createController();
    controller._saleDetails = '{"x":1}';
    controller.saleDetailsReadOnly = true;
    controller.saleDetailsReadOnlyMessage = 'read-only';

    const id1 = controller.beginViewSaleRequest();
    expect(id1).toBe(1);
    expect(controller._saleDetails).toBe('');
    expect(controller.viewSalePending).toBe(true);

    controller._saleDetails = '{"y":2}';
    const id2 = controller.beginViewSaleRequest({ retainSaleDetails: true });
    expect(id2).toBe(2);
    expect(controller._saleDetails).toBe('{"y":2}');
    expect(notify).toHaveBeenCalled();
  });

  test('finishViewSaleRequest ignores stale request id', () => {
    const { controller } = createController();
    controller.activeViewSaleRequestId = 2;
    controller._saleDetails = '{"before":true}';

    controller.finishViewSaleRequest(1, '{"after":true}', true, true);

    expect(controller._saleDetails).toBe('{"before":true}');
  });

  test('finishViewSaleRequest emits view action or notify depending on emitViewAction', () => {
    const { controller, notify } = createController();
    controller.activeViewSaleRequestId = 1;
    controller.applySaleDetailsAccess = jest.fn();
    controller.resolveQcSectionAccess = jest.fn().mockReturnValue({ canSubmit: false, showSection: false });

    controller.finishViewSaleRequest(1, '{"saleId":"S-1","taskDetails":{"taskId":"A-123"}}', true, true);
    expect(controller.actionType).toBe('viewSalePcf');

    controller.activeViewSaleRequestId = 2;
    controller.finishViewSaleRequest(2, '{"saleId":"S-2","taskDetails":{"taskId":"A-456"}}', false, false);
    expect(notify).toHaveBeenCalled();
  });

  test('emitAction back resets selection outputs', () => {
    const { controller, notify } = createController();
    controller.selectedTaskId = 'A-1';
    controller.selectedSaleId = 'S-1';
    controller.selectedTaskIdsJson = '["A-1"]';
    controller.selectedSaleIdsJson = '["S-1"]';
    controller.selectedCount = 1;

    controller.emitAction('back');

    expect(controller.selectedTaskId).toBe('');
    expect(controller.selectedSaleId).toBe('');
    expect(controller.selectedTaskIdsJson).toBe('[]');
    expect(controller.selectedSaleIdsJson).toBe('[]');
    expect(controller.selectedCount).toBe(0);
    expect(controller.actionType).toBe('back');
    expect(typeof controller.actionRequestId).toBe('string');
    expect(notify).toHaveBeenCalled();
  });

  test('createManualTask throws for empty/blank sale ids', async () => {
    const { controller } = createController();
    await expect(controller.createManualTask(['', '  '])).rejects.toThrow('Sale ID is not available for manual task creation.');
  });

  test('createManualTask throws when single sale already has task id', async () => {
    const { controller } = createController();
    controller.selectedSaleId = 'S-1';
    controller.selectedTaskId = 'A-999';
    controller._saleDetails = JSON.stringify({
      salesVerificationTaskDetails: { saleId: 'S-1', taskId: 'A-999' },
    });

    await expect(controller.createManualTask(['S-1'])).rejects.toThrow('Task ID already exists for this sale record.');
  });

  test('createManualTask throws when access role combination is insufficient', async () => {
    const { controller } = createController();
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    controller.hasManagerAccess = false;
    controller.hasCaseworkerAccess = true;

    await expect(controller.createManualTask(['S-2'])).rejects.toThrow(
      'Manual task creation is restricted to users with both manager and caseworker role/team access.',
    );
  });

  test('modifySvtTask throws for missing task id', async () => {
    const { controller } = createController();
    controller._saleDetails = JSON.stringify({ salesVerificationTaskDetails: { taskId: '' } });
    controller.selectedTaskId = '';

    await expect(controller.modifySvtTask()).rejects.toThrow('Task ID is not available for modify SVT task.');
  });

  test('modifySvtTask throws for disallowed task status', async () => {
    const { controller } = createController();
    controller._saleDetails = JSON.stringify({ salesVerificationTaskDetails: { taskId: 'A-123', taskStatus: 'Assigned' } });
    controller.selectedTaskId = 'A-123';

    await expect(controller.modifySvtTask()).rejects.toThrow(
      'Modify SVT task is available only when task status is Complete or Complete Passed QC.',
    );
  });

  test('modifySvtTask throws when caseworker access is false after resolution', async () => {
    const { controller } = createController();
    controller._saleDetails = JSON.stringify({ salesVerificationTaskDetails: { taskId: 'A-123', taskStatus: 'Complete' } });
    controller.selectedTaskId = 'A-123';
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(false);
    controller.hasCaseworkerAccess = false;

    await expect(controller.modifySvtTask()).rejects.toThrow('Modify SVT task is restricted to caseworker role/team.');
  });

  test('handleSalesVerificationTaskAction throws when caseworker access is missing', async () => {
    const { controller } = createController();
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(false);
    controller.hasCaseworkerAccess = false;

    await expect(
      controller.handleSalesVerificationTaskAction('completeSalesVerificationTask', {
        isSaleUseful: 'yes',
        whyNotUseful: '',
        additionalNotes: '',
      }),
    ).rejects.toThrow('Sales verification actions are restricted to caseworker role/team.');
  });

  test('handleSalesVerificationTaskAction throws when sale id is missing', async () => {
    const { controller } = createController();
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    controller.hasCaseworkerAccess = true;
    controller._saleDetails = JSON.stringify({ salesVerificationTaskDetails: { taskId: 'A-1' } });
    controller.selectedSaleId = '';

    await expect(
      controller.handleSalesVerificationTaskAction('submitSalesVerificationTaskForQc', {
        isSaleUseful: 'yes',
        whyNotUseful: '',
        additionalNotes: '',
      }),
    ).rejects.toThrow('Sale ID is not available for sales verification update.');
  });

  test('submitQcOutcome throws when caller is not QA or manager', async () => {
    const { controller } = createController();
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    controller.hasQaAccess = false;
    controller.hasManagerAccess = false;
    controller._saleDetails = JSON.stringify({ salesVerificationTaskDetails: { taskId: 'A-1' } });
    controller.selectedTaskId = 'A-1';

    await expect(
      controller.submitQcOutcome({ qcOutcome: 'Pass', qcReviewedBy: 'QC User', qcRemark: '' }),
    ).rejects.toThrow('Submit QC outcome is restricted to QA or manager role/team.');
  });

  test('submitQcOutcome throws when task id is missing', async () => {
    const { controller } = createController();
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    controller.hasQaAccess = true;
    controller.hasManagerAccess = false;
    controller._saleDetails = JSON.stringify({ salesVerificationTaskDetails: { taskId: '' } });
    controller.selectedTaskId = '';

    await expect(
      controller.submitQcOutcome({ qcOutcome: 'Fail', qcReviewedBy: 'QC User', qcRemark: 'remark' }),
    ).rejects.toThrow('Task ID is not available for QC outcome submission.');
  });

  test('buildSalesVerificationSubmitPayload normalizes task id and includes requestedBy', () => {
    const { controller } = createController();
    const payload = controller.buildSalesVerificationSubmitPayload(
      JSON.stringify({
        salesVerificationTaskDetails: {
          taskId: 'A-12345',
          taskStatus: 'Assigned',
          salesSource: 'WLTT',
          wlttId: 'W-1',
        },
        salesParticularDetails: {
          salesParticular: 'Details available',
          conditionScore: '5',
          padConfirmation: 'job-created',
        },
        salesVerificationDetails: {
          isSaleUseful: 'yes',
          additionalNotes: 'n',
          remarks: 'r',
        },
      }),
      'user-oid-1',
    );

    const parsed = JSON.parse(payload) as Record<string, Record<string, unknown>>;
    expect(parsed.salesVerificationTaskDetails.taskId).toBe('12345');
    expect(parsed.salesVerificationTaskDetails.requestedBy).toBe('user-oid-1');
    expect(parsed.salesParticularDetails.conditionScore).toBe('5');
    expect(parsed.salesVerificationDetails.isSaleUseful).toBe('yes');
  });

  test('extractAssignedToCandidates and user token matching resolve assigned user', () => {
    const { controller } = createController();
    controller._entraObjectId = '11111111-1111-1111-1111-111111111111';
    controller._context = makeContext({}, {
      userId: '{11111111-1111-1111-1111-111111111111}',
      userName: 'Case Worker',
      userDisplayName: 'Case Worker',
    });
    const payload = JSON.stringify({
      salesVerificationTaskDetails: {
        assignedToUserId: '{11111111-1111-1111-1111-111111111111}',
      },
    });

    expect(controller.extractAssignedToCandidates(payload)).toEqual(
      expect.arrayContaining(['{11111111-1111-1111-1111-111111111111}']),
    );
    expect(controller.isSaleRecordAssignedToCurrentUser(payload)).toBe(true);
  });

  test('isSaleRecordQcAssignedToCurrentUser falls back to assignedTo in editable QC status', () => {
    const { controller } = createController();
    controller._context = makeContext({}, { userId: '{user-2}', userName: 'QA User', userDisplayName: 'QA User' });
    const payload = JSON.stringify({
      salesVerificationTaskDetails: {
        taskStatus: 'Assigned To QC',
        assignedToUserId: '{user-2}',
      },
    });

    expect(controller.isSaleRecordQcAssignedToCurrentUser(payload)).toBe(true);
  });

  test('ensureCaseworkerAccess returns cached value when already resolved', async () => {
    const { controller } = createController();
    controller.hasResolvedCaseworkerAccess = true;
    controller.hasCaseworkerAccess = true;

    await expect(controller.ensureCaseworkerAccess()).resolves.toBe(true);
  });

  test('ensureCaseworkerAccess catch path clears access flags', async () => {
    const { controller } = createController();
    controller.hasResolvedCaseworkerAccess = false;
    controller.caseworkerAccessRequest = Promise.reject(new Error('boom'));
    controller.hasManagerAccess = true;
    controller.hasQaAccess = true;

    await expect(controller.ensureCaseworkerAccess()).resolves.toBe(false);
    expect(controller.hasCaseworkerAccess).toBe(false);
    expect(controller.hasManagerAccess).toBe(false);
    expect(controller.hasQaAccess).toBe(false);
  });

  test('refreshDetails delegates to onTaskClick with selected ids', async () => {
    const { controller } = createController();
    controller.selectedTaskId = 'A-5';
    controller.selectedSaleId = 'S-5';
    controller.onTaskClick = jest.fn().mockResolvedValue(undefined);

    await controller.refreshDetails();
    expect(controller.onTaskClick).toHaveBeenCalledWith('A-5', 'S-5');
  });

  test('createManualTask success for single sale updates details and navigates', async () => {
    const { controller, notify } = createController();
    controller._context = makeContext({ manualTaskCreationApiName: { raw: 'manual-api' } }, { userName: 'Case Worker' });
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    controller.hasManagerAccess = true;
    controller.hasCaseworkerAccess = true;
    controller._entraObjectId = 'oid-1';
    controller.onTaskClick = jest.fn().mockResolvedValue(undefined);
    mockedExecuteUnboundCustomApi.mockResolvedValue({
      success: true,
      message: 'ok',
      payload: '{"taskId":"M-1234"}',
    } as unknown);

    await controller.createManualTask(['S-100']);

    expect(mockedExecuteUnboundCustomApi).toHaveBeenCalled();
    expect(controller.selectedSaleId).toBe('S-100');
    expect(controller.selectedTaskId).toBe('M-1234');
    expect(controller.onTaskClick).toHaveBeenCalledWith('M-1234', 'S-100');
    expect(notify).toHaveBeenCalled();
  });

  test('createManualTask success for multi-sale does not navigate to details', async () => {
    const { controller, notify } = createController();
    controller._context = makeContext({ manualTaskCreationApiName: { raw: 'manual-api' } });
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    controller.hasManagerAccess = true;
    controller.hasCaseworkerAccess = true;
    controller.onTaskClick = jest.fn().mockResolvedValue(undefined);
    mockedExecuteUnboundCustomApi.mockResolvedValue({ success: true, message: 'ok', payload: '{}' } as unknown);

    await controller.createManualTask(['S-1', 'S-2'], { navigateToDetailsOnSingle: false });

    expect(controller.onTaskClick).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalled();
  });

  test('modifySvtTask success updates state and navigates', async () => {
    const { controller, notify } = createController();
    controller._context = makeContext({ modifyTaskApiName: { raw: 'modify-api' } }, { userName: 'Case Worker' });
    controller._entraObjectId = 'oid-2';
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    controller.hasCaseworkerAccess = true;
    controller.onTaskClick = jest.fn().mockResolvedValue(undefined);
    controller._saleDetails = JSON.stringify({
      salesVerificationTaskDetails: {
        taskId: 'A-900',
        taskStatus: 'Complete',
        saleId: 'S-900',
      },
    });
    controller.selectedTaskId = 'A-900';
    controller.selectedSaleId = 'S-900';
    mockedExecuteUnboundCustomApi.mockResolvedValue({ success: true, message: 'ok' } as unknown);

    await controller.modifySvtTask();

    expect(mockedExecuteUnboundCustomApi).toHaveBeenCalled();
    expect(controller.onTaskClick).toHaveBeenCalledWith('A-900', 'S-900');
    expect(controller.saleDetailsShowQcSection).toBeDefined();
    expect(notify).toHaveBeenCalled();
  });

  test('handleSalesVerificationTaskAction success emits action and updates ids', async () => {
    const { controller, notify } = createController();
    controller._context = makeContext({ submitSalesVerificationApiName: { raw: 'sv-api' } });
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    controller.hasCaseworkerAccess = true;
    controller._entraObjectId = 'oid-3';
    controller._saleDetails = JSON.stringify({
      salesVerificationTaskDetails: { taskId: 'A-10', saleId: 'S-10' },
      salesVerificationDetails: {},
      salesParticularDetails: {},
    });
    controller.selectedSaleId = 'S-10';
    controller.selectedTaskId = 'A-10';
    mockedExecuteUnboundCustomApi.mockResolvedValue({ success: true, message: 'submitted' } as unknown);

    await controller.handleSalesVerificationTaskAction('completeSalesVerificationTask', {
      isSaleUseful: 'yes',
      whyNotUseful: '',
      additionalNotes: 'note',
      remarks: 'done',
    });

    expect(controller.actionType).toBe('completeSalesVerificationTask');
    expect(controller.selectedSaleId).toBe('S-10');
    expect(notify).toHaveBeenCalled();
  });

  test('submitQcOutcome success emits action and updates details', async () => {
    const { controller, notify } = createController();
    controller._context = makeContext({ submitQcRemarksApiName: { raw: 'qc-api' } });
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    controller.hasQaAccess = true;
    controller.hasManagerAccess = false;
    controller._entraObjectId = 'oid-4';
    controller._saleDetails = JSON.stringify({
      salesVerificationTaskDetails: { taskId: 'A-22', taskStatus: 'Assigned To QC' },
      qualityControlOutcome: {},
    });
    controller.selectedTaskId = 'A-22';
    mockedExecuteUnboundCustomApi.mockResolvedValue({ success: true, message: 'ok' } as unknown);

    await controller.submitQcOutcome({ qcOutcome: 'Pass', qcReviewedBy: 'QA User', qcRemark: '' });

    expect(controller.actionType).toBe('submitQcOutcome');
    expect(controller.selectedTaskId).toBe('A-22');
    expect(notify).toHaveBeenCalled();
  });

  test('openAuditHistory and openQcLog emit action when task id is unavailable', async () => {
    const { controller, notify } = createController();
    controller._saleDetails = JSON.stringify({ salesVerificationTaskDetails: { taskId: '' } });
    controller.selectedTaskId = '';

    await controller.openAuditHistory();
    expect(controller.actionType).toBe('viewAuditHistory');

    await controller.openQcLog();
    expect(controller.actionType).toBe('viewQcLog');
    expect(notify).toHaveBeenCalled();
  });

  test('openAuditHistory merges API response when task id and api are available', async () => {
    const { controller, notify } = createController();
    controller._context = makeContext({ auditLogsApiName: { raw: 'audit-api' } });
    controller._saleDetails = JSON.stringify({ salesVerificationTaskDetails: { taskId: 'A-333' } });
    controller.selectedTaskId = 'A-333';
    mockedExecuteUnboundCustomApi.mockResolvedValue({
      Result: JSON.stringify({
        taskId: '333',
        auditHistory: [{ fieldName: 'taskStatus', oldValue: 'Assigned', newValue: 'Complete' }],
      }),
    } as unknown);

    await controller.openAuditHistory();

    expect(mockedExecuteUnboundCustomApi).toHaveBeenCalled();
    expect(controller.actionType).toBe('viewAuditHistory');
    expect(controller.saleDetailsJson).toContain('auditHistory');
    expect(notify).toHaveBeenCalled();
  });

  test('onTaskClick with missing saleId returns empty sale record and emits view action', async () => {
    const { controller } = createController();
    controller.beginViewSaleRequest = jest.fn().mockReturnValue(1);
    controller.finishViewSaleRequest = jest.fn();

    await controller.onTaskClick(undefined, undefined);

    expect(controller.finishViewSaleRequest).toHaveBeenCalled();
    const args = (controller.finishViewSaleRequest as jest.Mock).mock.calls[0];
    expect(args[0]).toBe(1);
    expect(typeof args[1]).toBe('string');
  });

  test('onTaskClick catches API failure and still completes view request', async () => {
    const { controller } = createController();
    controller._context = makeContext({ viewSaleRecordApiName: { raw: 'view-api' } });
    controller.finishViewSaleRequest = jest.fn();
    controller.beginViewSaleRequest = jest.fn().mockReturnValue(7);
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    mockedExecuteUnboundCustomApi.mockRejectedValue(new Error('view failed'));

    await controller.onTaskClick(undefined, 'S-88');

    expect(controller.finishViewSaleRequest).toHaveBeenCalledWith(7, expect.any(String), expect.any(Boolean), expect.any(Boolean));
  });

  test('onTaskClick successful path enriches payload and completes request', async () => {
    const { controller } = createController();
    controller._context = makeContext({ viewSaleRecordApiName: { raw: 'view-api' } });
    controller.beginViewSaleRequest = jest.fn().mockReturnValue(9);
    controller.finishViewSaleRequest = jest.fn();
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    controller.enrichWithHereditamentActiveRequest = jest.fn().mockImplementation(async (x: unknown) => x);
    controller.enrichWithResolvedUserNames = jest.fn().mockImplementation(async (x: unknown) => x);
    mockedExecuteUnboundCustomApi.mockResolvedValue({
      Result: JSON.stringify({ salesVerificationTaskDetails: { taskId: 'A-77' }, saleId: 'S-77' }),
    } as unknown);

    await controller.onTaskClick(undefined, 'S-77');

    expect(mockedExecuteUnboundCustomApi).toHaveBeenCalled();
    expect(controller.finishViewSaleRequest).toHaveBeenCalled();
  });

  test('resolveCaseworkerAccess sets persona flags and entra object id from response', async () => {
    const { controller } = createController();
    controller._context = makeContext({ userContextApiName: { raw: 'user-context-api' } });
    mockedExecuteUnboundCustomApi.mockResolvedValue({
      Result: JSON.stringify({
        svtPersona: 'caseworker',
        hasManagerAccess: 'true',
        hasQaAccess: 'yes',
        entraObjectId: 'oid-xyz',
      }),
    } as unknown);

    await expect(controller.resolveCaseworkerAccess()).resolves.toBe(true);
    expect(controller.hasManagerAccess).toBe(true);
    expect(controller.hasQaAccess).toBe(true);
    expect(controller.entraObjectId).toBe('oid-xyz');
  });

  test('resolveCaseworkerAccess returns false when no evidence in payload', async () => {
    const { controller } = createController();
    controller._context = makeContext({ userContextApiName: { raw: 'user-context-api' } });
    mockedExecuteUnboundCustomApi.mockResolvedValue({ Result: JSON.stringify({ persona: 'other' }) } as unknown);

    await expect(controller.resolveCaseworkerAccess()).resolves.toBe(false);
    expect(controller.hasManagerAccess).toBe(false);
    expect(controller.hasQaAccess).toBe(false);
  });

  test('enrichWithHereditamentActiveRequest sets all active-request aliases to true', async () => {
    const { controller } = createController();
    controller._context = makeContext({ hereditamentRelatedRequestsApiName: { raw: 'hereditament-api' } });
    mockedExecuteUnboundCustomApi.mockResolvedValue({ Result: JSON.stringify({ hereditamentActiveRequest: 'true' }) } as unknown);
    const details = {
      hereditamentId: '11111111-1111-1111-1111-111111111111',
      propertyAndBandingDetails: {},
    } as Record<string, unknown>;

    const result = await controller.enrichWithHereditamentActiveRequest(details);

    expect(result.hereditamentActiveRequest).toBe(true);
    expect(result.activeRequestInVos).toBe(true);
    expect((result.propertyAndBandingDetails as Record<string, unknown>).isActiveRequestPresent).toBe(true);
  });

  test('enrichWithResolvedUserNames populates missing name fields from resolution map', async () => {
    const { controller } = createController();
    controller.userResolutionService = {
      resolveUsers: jest.fn().mockResolvedValue(new Map<string, { id: string; name: string }>([
        ['11111111-1111-1111-1111-111111111111', { id: '11111111-1111-1111-1111-111111111111', name: 'Resolved User' }],
      ])),
    };
    const details = {
      salesVerificationTaskDetails: {
        assignedTo: '11111111-1111-1111-1111-111111111111',
        assignedToName: '',
      },
    } as Record<string, unknown>;

    const result = await controller.enrichWithResolvedUserNames(details);
    const svt = result.salesVerificationTaskDetails as Record<string, unknown>;
    expect(svt.assignedToName).toBe('Resolved User');
  });

  test('enrichWithResolvedUserNames returns original details when no salesVerificationTaskDetails', async () => {
    const { controller } = createController();
    const details = { other: 'value' } as Record<string, unknown>;
    await expect(controller.enrichWithResolvedUserNames(details)).resolves.toBe(details);
  });

  test('tryGetSaleDetailsRecord handles object, valid json string, and invalid string', () => {
    const { controller } = createController();
    expect(controller.tryGetSaleDetailsRecord({ saleId: 'S-1' })).toEqual({ saleId: 'S-1' });
    expect(controller.tryGetSaleDetailsRecord('{"saleId":"S-2"}')).toEqual({ saleId: 'S-2' });
    expect(controller.tryGetSaleDetailsRecord('not-json')).toBeUndefined();
  });

  test('createManualTask returns generic failure when API response is empty', async () => {
    const { controller } = createController();
    controller._context = makeContext({ manualTaskCreationApiName: { raw: '' } });
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    controller.hasManagerAccess = true;
    controller.hasCaseworkerAccess = true;

    mockedExecuteUnboundCustomApi.mockResolvedValue(undefined as unknown);

    await expect(controller.createManualTask(['S-200'])).rejects.toThrow('Manual task creation failed.');
  });

  test('createManualTask surfaces parsed API failure message', async () => {
    const { controller } = createController();
    controller._context = makeContext({ manualTaskCreationApiName: { raw: 'manual-api' } });
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    controller.hasManagerAccess = true;
    controller.hasCaseworkerAccess = true;
    mockedExecuteUnboundCustomApi.mockResolvedValue({ success: false, message: 'Backend rejected request' } as unknown);

    await expect(controller.createManualTask(['S-201'])).rejects.toThrow('Backend rejected request');
  });

  test('modifySvtTask returns generic failure when API response is empty', async () => {
    const { controller } = createController();
    controller._context = makeContext({ modifyTaskApiName: { raw: '' } });
    controller._saleDetails = JSON.stringify({ salesVerificationTaskDetails: { taskId: 'A-300', taskStatus: 'Complete' } });
    controller.selectedTaskId = 'A-300';
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    controller.hasCaseworkerAccess = true;

    mockedExecuteUnboundCustomApi.mockResolvedValue(undefined as unknown);

    await expect(controller.modifySvtTask()).rejects.toThrow('Modify SVT task failed.');
  });

  test('modifySvtTask throws when parsed API result is unsuccessful', async () => {
    const { controller } = createController();
    controller._context = makeContext({ modifyTaskApiName: { raw: 'modify-api' } });
    controller._saleDetails = JSON.stringify({ salesVerificationTaskDetails: { taskId: 'A-301', taskStatus: 'Complete' } });
    controller.selectedTaskId = 'A-301';
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    controller.hasCaseworkerAccess = true;
    mockedExecuteUnboundCustomApi.mockResolvedValue({ success: false, message: 'modify failed' } as unknown);

    await expect(controller.modifySvtTask()).rejects.toThrow('modify failed');
  });

  test('handleSalesVerificationTaskAction returns generic failure when mutation response is empty', async () => {
    const { controller } = createController();
    controller._context = makeContext({ submitSalesVerificationApiName: { raw: '' } });
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    controller.hasCaseworkerAccess = true;
    controller._saleDetails = JSON.stringify({ salesVerificationTaskDetails: { saleId: 'S-301', taskId: 'A-301' } });
    controller.selectedSaleId = 'S-301';

    mockedExecuteUnboundCustomApi.mockResolvedValue(undefined as unknown);

    await expect(
      controller.handleSalesVerificationTaskAction('completeSalesVerificationTask', {
        isSaleUseful: 'yes', whyNotUseful: '', additionalNotes: '',
      }),
    ).rejects.toThrow('Submit sales verification task failed.');
  });

  test('handleSalesVerificationTaskAction throws when mutation parse indicates failure', async () => {
    const { controller } = createController();
    controller._context = makeContext({ submitSalesVerificationApiName: { raw: 'sv-api' } });
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    controller.hasCaseworkerAccess = true;
    controller._saleDetails = JSON.stringify({ salesVerificationTaskDetails: { saleId: 'S-302', taskId: 'A-302' } });
    controller.selectedSaleId = 'S-302';
    mockedExecuteUnboundCustomApi.mockResolvedValue({ success: false, message: 'submit failed' } as unknown);

    await expect(
      controller.handleSalesVerificationTaskAction('submitSalesVerificationTaskForQc', {
        isSaleUseful: 'yes', whyNotUseful: '', additionalNotes: '', remarks: '',
      }),
    ).rejects.toThrow('submit failed');
  });

  test('submitQcOutcome returns generic failure when mutation response is empty', async () => {
    const { controller } = createController();
    controller._context = makeContext({ submitQcRemarksApiName: { raw: '' } });
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    controller.hasQaAccess = true;
    controller._saleDetails = JSON.stringify({ salesVerificationTaskDetails: { taskId: 'A-400' } });
    controller.selectedTaskId = 'A-400';

    mockedExecuteUnboundCustomApi.mockResolvedValue(undefined as unknown);

    await expect(
      controller.submitQcOutcome({ qcOutcome: 'Pass', qcReviewedBy: 'QA', qcRemark: '' }),
    ).rejects.toThrow('Submit QC outcome failed.');
  });

  test('submitQcOutcome throws when parsed mutation indicates failure', async () => {
    const { controller } = createController();
    controller._context = makeContext({ submitQcRemarksApiName: { raw: 'qc-api' } });
    controller.ensureCaseworkerAccess = jest.fn().mockResolvedValue(true);
    controller.hasQaAccess = true;
    controller._saleDetails = JSON.stringify({ salesVerificationTaskDetails: { taskId: 'A-401' } });
    controller.selectedTaskId = 'A-401';
    mockedExecuteUnboundCustomApi.mockResolvedValue({ success: false, message: 'qc failed' } as unknown);

    await expect(
      controller.submitQcOutcome({ qcOutcome: 'Fail', qcReviewedBy: 'QA', qcRemark: 'x' }),
    ).rejects.toThrow('qc failed');
  });

  test('openAuditHistory writes fallback error when API call fails for existing task', async () => {
    const { controller } = createController();
    controller._context = makeContext({ auditLogsApiName: { raw: '' } });
    controller._saleDetails = JSON.stringify({ salesVerificationTaskDetails: { taskId: 'A-500' } });
    controller.selectedTaskId = 'A-500';

    mockedExecuteUnboundCustomApi.mockRejectedValue(new Error('audit unavailable'));

    await controller.openAuditHistory();
    expect(controller.saleDetailsJson).toContain('Failed to fetch SL audit history.');
  });

  test('openQcLog handles API failure and writes fallback error message', async () => {
    const { controller } = createController();
    controller._context = makeContext({ auditLogsApiName: { raw: 'audit-api' } });
    controller._saleDetails = JSON.stringify({ salesVerificationTaskDetails: { taskId: 'A-501' } });
    controller.selectedTaskId = 'A-501';
    mockedExecuteUnboundCustomApi.mockRejectedValue(new Error('network down'));

    await controller.openQcLog();
    expect(controller.saleDetailsJson).toContain('Failed to fetch QC audit history.');
  });

  test('enrichWithHereditamentActiveRequest returns details unchanged when no hereditament id', async () => {
    const { controller } = createController();
    const details = { propertyAndBandingDetails: {} } as Record<string, unknown>;
    await expect(controller.enrichWithHereditamentActiveRequest(details)).resolves.toBe(details);
  });

  test('enrichWithHereditamentActiveRequest returns details unchanged when API is missing', async () => {
    const { controller } = createController();
    controller._context = makeContext({ hereditamentRelatedRequestsApiName: { raw: '' } });
    const details = { hereditamentId: '11111111-1111-1111-1111-111111111111' } as Record<string, unknown>;
    await expect(controller.enrichWithHereditamentActiveRequest(details)).resolves.toBe(details);
  });

  test('matchesKnownNameByContains supports exact, contains, reverse-contains and empty', () => {
    const { controller } = createController();
    const known = new Set(['svt manager team']);
    expect(controller.matchesKnownNameByContains('svt manager team', known)).toBe(true);
    expect(controller.matchesKnownNameByContains('my svt manager team alpha', known)).toBe(true);
    expect(controller.matchesKnownNameByContains('svt', known)).toBe(true);
    expect(controller.matchesKnownNameByContains('', known)).toBe(false);
  });
});
