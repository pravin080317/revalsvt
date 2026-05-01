import {
  toRecord,
  getEmptySaleRecord,
  getSaleDetailsRoot,
  resolveCurrentTaskIdFromDetails,
  resolveCurrentSaleIdFromDetails,
  stripTaskIdPrefix,
  resolveTaskIdForAuditLogs,
  mergeManualTaskCreationDetails,
  mergeModifyTaskDetails,
  mergeSalesVerificationDetails,
  mergeQcOutcomeDetails,
  preserveQcOutcomeDetails,
  mergeAuditHistoryDetails,
} from '../services/runtime/sale-details';

// ──────────────────────────────────────────────
// toRecord
// ──────────────────────────────────────────────
describe('toRecord', () => {
  test('returns the object when value is a plain object', () => {
    const obj = { a: 1 };
    expect(toRecord(obj)).toBe(obj);
  });

  test('returns undefined for null', () => {
    expect(toRecord(null)).toBeUndefined();
  });

  test('returns undefined for array', () => {
    expect(toRecord([1, 2, 3])).toBeUndefined();
  });

  test('returns undefined for primitive string', () => {
    expect(toRecord('hello')).toBeUndefined();
  });

  test('returns undefined for undefined', () => {
    expect(toRecord(undefined)).toBeUndefined();
  });
});

// ──────────────────────────────────────────────
// getEmptySaleRecord
// ──────────────────────────────────────────────
describe('getEmptySaleRecord', () => {
  test('returns a record with the expected keys', () => {
    const record = getEmptySaleRecord();
    expect(record).toHaveProperty('salesVerificationTaskDetails');
    expect(record).toHaveProperty('links');
    expect(record).toHaveProperty('propertyAndBandingDetails');
    expect(record).toHaveProperty('auditLogs');
    expect(record).toHaveProperty('taskDetails'); // legacy key
  });

  test('returns a new object each call', () => {
    expect(getEmptySaleRecord()).not.toBe(getEmptySaleRecord());
  });
});

// ──────────────────────────────────────────────
// getSaleDetailsRoot
// ──────────────────────────────────────────────
describe('getSaleDetailsRoot', () => {
  test('parses valid JSON object', () => {
    const json = JSON.stringify({ saleId: 'S-100', taskDetails: { taskId: 'A-1' } });
    const root = getSaleDetailsRoot(json);
    expect(root.saleId).toBe('S-100');
  });

  test('falls back to empty record for invalid JSON', () => {
    const root = getSaleDetailsRoot('not-json');
    expect(root).toHaveProperty('salesVerificationTaskDetails');
  });

  test('falls back to empty record for empty string', () => {
    const root = getSaleDetailsRoot('');
    expect(root).toHaveProperty('salesVerificationTaskDetails');
  });

  test('falls back to empty record when JSON parses to an array', () => {
    const root = getSaleDetailsRoot(JSON.stringify([{ saleId: 'S-1' }]));
    expect(root).toHaveProperty('salesVerificationTaskDetails');
  });

  test('falls back to empty record when JSON parses to a primitive', () => {
    const root = getSaleDetailsRoot(JSON.stringify(42));
    expect(root).toHaveProperty('salesVerificationTaskDetails');
  });
});

// ──────────────────────────────────────────────
// stripTaskIdPrefix
// ──────────────────────────────────────────────
describe('stripTaskIdPrefix', () => {
  test('strips alphabetic prefix from task ID', () => {
    expect(stripTaskIdPrefix('A-1001234')).toBe('1001234');
  });

  test('leaves digits-only value unchanged', () => {
    expect(stripTaskIdPrefix('1234567')).toBe('1234567');
  });

  test('returns trimmed non-digit value when no digits present', () => {
    expect(stripTaskIdPrefix('  no digits  ')).toBe('no digits');
  });

  test('strips M- prefix style from task IDs', () => {
    expect(stripTaskIdPrefix('M-9876543')).toBe('9876543');
  });
});

// ──────────────────────────────────────────────
// resolveCurrentTaskIdFromDetails
// ──────────────────────────────────────────────
describe('resolveCurrentTaskIdFromDetails', () => {
  test('resolves from salesVerificationTaskDetails.taskId', () => {
    const json = JSON.stringify({ salesVerificationTaskDetails: { taskId: 'A-5000001' } });
    expect(resolveCurrentTaskIdFromDetails(json)).toBe('A-5000001');
  });

  test('falls back to taskDetails.taskId when primary is absent', () => {
    const json = JSON.stringify({ salesVerificationTaskDetails: {}, taskDetails: { taskId: 'A-5000002' } });
    expect(resolveCurrentTaskIdFromDetails(json)).toBe('A-5000002');
  });

  test('falls back to selectedTaskId param when both detail nodes are empty', () => {
    const json = JSON.stringify({ salesVerificationTaskDetails: {}, taskDetails: {} });
    expect(resolveCurrentTaskIdFromDetails(json, 'A-5000003')).toBe('A-5000003');
  });

  test('returns empty string when no taskId can be resolved', () => {
    expect(resolveCurrentTaskIdFromDetails('', undefined)).toBe('');
  });

  test('prefers salesVerificationTaskDetails.taskId over taskDetails.taskId', () => {
    const json = JSON.stringify({
      salesVerificationTaskDetails: { taskId: 'A-PRIMARY' },
      taskDetails: { taskId: 'A-LEGACY' },
    });
    expect(resolveCurrentTaskIdFromDetails(json)).toBe('A-PRIMARY');
  });
});

// ──────────────────────────────────────────────
// resolveCurrentSaleIdFromDetails
// ──────────────────────────────────────────────
describe('resolveCurrentSaleIdFromDetails', () => {
  test('resolves saleId from salesVerificationTaskDetails', () => {
    const json = JSON.stringify({ salesVerificationTaskDetails: { saleId: 'S-1001' } });
    expect(resolveCurrentSaleIdFromDetails(json)).toBe('S-1001');
  });

  test('falls back to saleid (camelCase variant)', () => {
    const json = JSON.stringify({ salesVerificationTaskDetails: { saleid: 'S-1002' } });
    expect(resolveCurrentSaleIdFromDetails(json)).toBe('S-1002');
  });

  test('falls back to taskDetails.saleId', () => {
    const json = JSON.stringify({ taskDetails: { saleId: 'S-1003' } });
    expect(resolveCurrentSaleIdFromDetails(json)).toBe('S-1003');
  });

  test('falls back to root saleId', () => {
    const json = JSON.stringify({ saleId: 'S-1004' });
    expect(resolveCurrentSaleIdFromDetails(json)).toBe('S-1004');
  });

  test('falls back to selectedSaleId parameter', () => {
    expect(resolveCurrentSaleIdFromDetails('', 'S-1005')).toBe('S-1005');
  });

  test('returns empty string when nothing can be resolved', () => {
    expect(resolveCurrentSaleIdFromDetails('')).toBe('');
  });
});

// ──────────────────────────────────────────────
// resolveTaskIdForAuditLogs
// ──────────────────────────────────────────────
describe('resolveTaskIdForAuditLogs', () => {
  test('uses selectedTaskId with prefix stripped when provided', () => {
    expect(resolveTaskIdForAuditLogs('', 'A-9876543')).toBe('9876543');
  });

  test('falls back to taskId from salesVerificationTaskDetails', () => {
    const json = JSON.stringify({ salesVerificationTaskDetails: { taskId: 'M-1234567' } });
    expect(resolveTaskIdForAuditLogs(json)).toBe('1234567');
  });

  test('falls back to taskId from legacy taskDetails', () => {
    const json = JSON.stringify({ taskDetails: { taskId: 'A-7654321' } });
    expect(resolveTaskIdForAuditLogs(json)).toBe('7654321');
  });

  test('returns empty string when nothing resolves', () => {
    expect(resolveTaskIdForAuditLogs('')).toBe('');
  });

  test('ignores selectedTaskId when it is empty/whitespace', () => {
    const json = JSON.stringify({ salesVerificationTaskDetails: { taskId: 'A-9990001' } });
    expect(resolveTaskIdForAuditLogs(json, '   ')).toBe('9990001');
  });
});

// ──────────────────────────────────────────────
// mergeManualTaskCreationDetails
// ──────────────────────────────────────────────
describe('mergeManualTaskCreationDetails', () => {
  const baseJson = JSON.stringify({
    salesVerificationTaskDetails: { saleId: 'S-1000', taskId: '' },
    taskDetails: {},
  });

  test('writes saleId, taskId, and assignedTo from payload', () => {
    const result = mergeManualTaskCreationDetails(baseJson, {
      saleId: 'S-1001',
      taskId: 'A-2000001',
      assignedTo: 'Alice Smith',
    });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesVerificationTaskDetails.saleId).toBe('S-1001');
    expect(root.salesVerificationTaskDetails.taskId).toBe('A-2000001');
    expect(root.salesVerificationTaskDetails.assignedTo).toBe('Alice Smith');
  });

  test('sets sourceType M on both task details', () => {
    const result = mergeManualTaskCreationDetails(baseJson, { saleId: 'S-1001' });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesVerificationTaskDetails.sourceType).toBe('M');
    expect(root.taskDetails.sourceType).toBe('M');
  });

  test('derives taskStatus from existing taskStatus when taskId is already present', () => {
    const existingJson = JSON.stringify({
      salesVerificationTaskDetails: { saleId: 'S-1001', taskId: 'A-111', taskStatus: 'Assigned' },
      taskDetails: {},
    });
    const result = mergeManualTaskCreationDetails(existingJson, { saleId: 'S-1001', taskId: 'A-222' });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesVerificationTaskDetails.taskStatus).toBe('Assigned');
  });

  test('defaults taskStatus to Assigned when taskId is provided but no preexisting status', () => {
    const result = mergeManualTaskCreationDetails(JSON.stringify({}), {
      saleId: 'S-999',
      taskId: 'A-5555555',
    });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesVerificationTaskDetails.taskStatus).toBe('Assigned');
  });

  test('does not override taskStatus when no taskId present', () => {
    const result = mergeManualTaskCreationDetails(JSON.stringify({}), { saleId: 'S-999' });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesVerificationTaskDetails.taskStatus).toBeUndefined();
  });

  test('falls back to empty record for invalid JSON', () => {
    const result = mergeManualTaskCreationDetails('not-json', { saleId: 'S-001' });
    expect(() => JSON.parse(result)).not.toThrow();
  });
});

// ──────────────────────────────────────────────
// mergeModifyTaskDetails
// ──────────────────────────────────────────────
describe('mergeModifyTaskDetails', () => {
  const baseJson = JSON.stringify({
    salesVerificationTaskDetails: { taskId: 'A-555', taskStatus: 'Assigned' },
    taskDetails: { taskId: 'A-555', taskStatus: 'Assigned' },
  });

  test('writes updated taskStatus to both detail nodes', () => {
    const result = mergeModifyTaskDetails(baseJson, { taskStatus: 'Complete' });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesVerificationTaskDetails.taskStatus).toBe('Complete');
    expect(root.taskDetails.taskStatus).toBe('Complete');
  });

  test('writes all assignedTo aliases when assignedTo provided', () => {
    const result = mergeModifyTaskDetails(baseJson, {
      taskStatus: 'Assigned',
      assignedTo: 'Bob Jones',
    });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesVerificationTaskDetails.assignedTo).toBe('Bob Jones');
    expect(root.salesVerificationTaskDetails.caseworkerAssignedTo).toBe('Bob Jones');
  });

  test('writes all assignedToUserId aliases when provided', () => {
    const userId = 'aabbccdd-0000-0000-0000-000000000001';
    const result = mergeModifyTaskDetails(baseJson, {
      taskStatus: 'Assigned',
      assignedToUserId: userId,
    });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesVerificationTaskDetails.assignedToUserId).toBe(userId);
    expect(root.salesVerificationTaskDetails.assignedtouserid).toBe(userId);
    expect(root.salesVerificationTaskDetails.caseworkerAssignedToUserId).toBe(userId);
  });

  test('writes all assignedDate aliases when provided', () => {
    const date = '2024-06-15T09:00:00.000Z';
    const result = mergeModifyTaskDetails(baseJson, {
      taskStatus: 'Assigned',
      assignedDateIso: date,
    });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesVerificationTaskDetails.assignedDate).toBe(date);
    expect(root.salesVerificationTaskDetails.caseworkerAssignedDate).toBe(date);
  });

  test('nulls out task completed date fields on modify', () => {
    const jsonWithComplete = JSON.stringify({
      salesVerificationTaskDetails: { taskStatus: 'Complete', taskCompletedDate: '2024-01-01' },
      taskDetails: {},
    });
    const result = mergeModifyTaskDetails(jsonWithComplete, { taskStatus: 'Assigned' });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesVerificationTaskDetails.taskCompletedDate).toBeNull();
    expect(root.salesVerificationTaskDetails.completedDate).toBeNull();
  });
});

// ──────────────────────────────────────────────
// mergeSalesVerificationDetails
// ──────────────────────────────────────────────
describe('mergeSalesVerificationDetails', () => {
  const mkBase = () => JSON.stringify({
    salesVerificationTaskDetails: { taskId: 'A-1000', taskStatus: 'Assigned' },
    taskDetails: { taskId: 'A-1000', taskStatus: 'Assigned' },
  });

  test('writes isSaleUseful, whyNotUseful, additionalNotes to salesVerificationDetails', () => {
    const result = mergeSalesVerificationDetails(mkBase(), {
      isSaleUseful: 'yes',
      whyNotUseful: '',
      additionalNotes: 'Good sale',
    });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesVerificationDetails.isSaleUseful).toBe('yes');
    expect(root.salesVerificationDetails.additionalNotes).toBe('Good sale');
  });

  test('converts empty strings to null via emptyToNull', () => {
    const result = mergeSalesVerificationDetails(mkBase(), {
      isSaleUseful: '',
      whyNotUseful: '',
      additionalNotes: '',
    });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesVerificationDetails.isSaleUseful).toBeNull();
  });

  test('sets taskStatus to Complete for completeSalesVerificationTask action', () => {
    const result = mergeSalesVerificationDetails(
      mkBase(),
      { isSaleUseful: 'yes', whyNotUseful: '', additionalNotes: '' },
      'completeSalesVerificationTask',
    );
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesVerificationTaskDetails.taskStatus).toBe('Complete');
    expect(root.taskDetails.taskStatus).toBe('Complete');
  });

  test('sets taskStatus to QC Requested for submitSalesVerificationTaskForQc action', () => {
    const result = mergeSalesVerificationDetails(
      mkBase(),
      { isSaleUseful: 'yes', whyNotUseful: '', additionalNotes: '' },
      'submitSalesVerificationTaskForQc',
    );
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesVerificationTaskDetails.taskStatus).toBe('QC Requested');
  });

  test('sets taskStatus to Reassigned To QC when current status is Assigned QC Failed', () => {
    const failedJson = JSON.stringify({
      salesVerificationTaskDetails: { taskId: 'A-2000', taskStatus: 'Assigned QC Failed' },
      taskDetails: {},
    });
    const result = mergeSalesVerificationDetails(
      failedJson,
      { isSaleUseful: 'yes', whyNotUseful: '', additionalNotes: '' },
      'submitSalesVerificationTaskForQc',
    );
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesVerificationTaskDetails.taskStatus).toBe('Reassigned To QC');
  });

  test('merges salesParticularDraft when provided', () => {
    const result = mergeSalesVerificationDetails(mkBase(), {
      isSaleUseful: 'yes',
      whyNotUseful: '',
      additionalNotes: '',
      salesParticularDraft: {
        reviewStatusKey: 'details-available',
        linkParticulars: 'http://example.com',
        kitchenAge: '5-10 years',
        kitchenSpecification: 'Standard',
        bathroomAge: '5-10 years',
        bathroomSpecification: 'Standard',
        glazing: 'Double',
        heating: 'Gas',
        decorativeFinishes: 'Good',
        conditionScore: '3',
        conditionCategory: 'Average',
        particularsNotes: '',
      },
    });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesParticularDetails.salesParticular).toBe('Details available');
    expect(root.salesParticularDetails.kitchenAge).toBe('5-10 years');
  });

  test('writes padConfirmation text to propertyAndBandingDetails when padConfirmationKey provided', () => {
    const result = mergeSalesVerificationDetails(mkBase(), {
      isSaleUseful: 'yes',
      whyNotUseful: '',
      additionalNotes: '',
      padConfirmationKey: 'job-created',
    });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.propertyAndBandingDetails.padConfirmation).toBe('Data enhancement job created');
  });

  test('handles WLTT promotedMasterRecord', () => {
    const result = mergeSalesVerificationDetails(mkBase(), {
      isSaleUseful: 'yes',
      whyNotUseful: '',
      additionalNotes: '',
      promotedMasterRecord: {
        source: 'WLTT',
        id: 'W-999',
        salePrice: '250000',
        transactionDate: '2024-01-01',
        hpiAdjustedPrice: '255000',
        ratio: '0.75',
      },
    });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesVerificationTaskDetails.salesSource).toBe('WLTT');
    expect(root.salesVerificationTaskDetails.wltId).toBe('W-999');
    expect(root.salesVerificationTaskDetails.lrpddId).toBeNull();
  });

  test('handles LRPPD promotedMasterRecord', () => {
    const result = mergeSalesVerificationDetails(mkBase(), {
      isSaleUseful: 'yes',
      whyNotUseful: '',
      additionalNotes: '',
      promotedMasterRecord: {
        source: 'LRPPD',
        id: 'LR-1234',
        salePrice: '300000',
        transactionDate: '2024-02-01',
        hpiAdjustedPrice: '305000',
        ratio: '0.8',
      },
    });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesVerificationTaskDetails.salesSource).toBe('LRPPD');
    expect(root.salesVerificationTaskDetails.lrpddId).toBe('LR-1234');
    expect(root.salesVerificationTaskDetails.wltId).toBeNull();
  });

  test('skips promotedMasterRecord update when id is empty', () => {
    const result = mergeSalesVerificationDetails(mkBase(), {
      isSaleUseful: 'yes',
      whyNotUseful: '',
      additionalNotes: '',
      promotedMasterRecord: {
        source: 'WLTT',
        id: '',
        salePrice: '0',
        transactionDate: '2024-01-01',
        hpiAdjustedPrice: '0',
        ratio: '0',
      },
    });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.salesVerificationTaskDetails.salesSource).toBeUndefined();
  });
});

// ──────────────────────────────────────────────
// mergeQcOutcomeDetails
// ──────────────────────────────────────────────
describe('mergeQcOutcomeDetails', () => {
  const baseJson = JSON.stringify({
    salesVerificationTaskDetails: { taskId: 'A-3000', taskStatus: 'QC Requested' },
    taskDetails: {},
  });

  test('passes QC outcome sets taskStatus to Complete Passed QC', () => {
    const result = mergeQcOutcomeDetails(baseJson, {
      qcOutcome: 'Pass',
      qcReviewedBy: 'QC User',
    });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.qualityControlOutcome.qcOutcome).toBe('Pass');
    expect(root.salesVerificationTaskDetails.taskStatus).toBe('Complete Passed QC');
    expect(root.salesVerificationTaskDetails.taskCompletedDate).toBeTruthy();
  });

  test('fail QC outcome sets taskStatus to Assigned QC Failed and nulls completedDate', () => {
    const result = mergeQcOutcomeDetails(baseJson, {
      qcOutcome: 'Fail',
      qcReviewedBy: 'QC User',
      qcRemark: 'Needs rework',
    });
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.qualityControlOutcome.qcOutcome).toBe('Fail');
    expect(root.salesVerificationTaskDetails.taskStatus).toBe('Assigned QC Failed');
    expect(root.salesVerificationTaskDetails.taskCompletedDate).toBeNull();
    expect(root.qualityControlOutcome.qcRemark).toBe('Needs rework');
  });

  test('returns unmodified JSON when qcOutcome is not a valid Pass/Fail value', () => {
    const invalidJson = JSON.stringify({ salesVerificationTaskDetails: { taskId: 'A-3001' } });
    // TypeScript cast since qcOutcome type is 'Pass' | 'Fail' but we test runtime guard
    const result = mergeQcOutcomeDetails(invalidJson, {
      qcOutcome: '' as 'Pass',
      qcReviewedBy: 'QC User',
    });
    const root = JSON.parse(result) as Record<string, unknown>;
    expect(root.qualityControlOutcome).toBeUndefined();
  });
});

// ──────────────────────────────────────────────
// preserveQcOutcomeDetails
// ──────────────────────────────────────────────
describe('preserveQcOutcomeDetails', () => {
  const existingWithOutcome = JSON.stringify({
    salesVerificationTaskDetails: { taskId: 'A-4001', saleId: 'S-4001' },
    qualityControlOutcome: {
      qcOutcome: 'Pass',
      qcRemark: 'All good',
      qcReviewedBy: 'QC Reviewer',
      qcReviewedOn: '2024-06-01T10:00:00.000Z',
    },
  });

  test('preserves existing qcOutcome when incoming has no outcome', () => {
    const incoming = JSON.stringify({
      salesVerificationTaskDetails: { taskId: 'A-4001', saleId: 'S-4001' },
      qualityControlOutcome: {},
    });
    const result = preserveQcOutcomeDetails(incoming, existingWithOutcome);
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.qualityControlOutcome.qcOutcome).toBe('Pass');
    expect(root.qualityControlOutcome.qcReviewedBy).toBe('QC Reviewer');
  });

  test('returns the incoming JSON unchanged when incoming already has outcome data', () => {
    const incomingWithOutcome = JSON.stringify({
      salesVerificationTaskDetails: { taskId: 'A-4001', saleId: 'S-4001' },
      qualityControlOutcome: {
        qcOutcome: 'Fail',
        qcRemark: 'Rework',
        qcReviewedBy: 'New QC User',
        qcReviewedOn: '2024-07-01T10:00:00.000Z',
      },
    });
    const result = preserveQcOutcomeDetails(incomingWithOutcome, existingWithOutcome);
    expect(result).toBe(incomingWithOutcome);
  });

  test('returns incoming JSON unchanged when task IDs differ', () => {
    const incomingDiffTask = JSON.stringify({
      salesVerificationTaskDetails: { taskId: 'A-9999' },
      qualityControlOutcome: {},
    });
    const existingJson = JSON.stringify({
      salesVerificationTaskDetails: { taskId: 'A-1111' },
      qualityControlOutcome: { qcOutcome: 'Pass' },
    });
    const result = preserveQcOutcomeDetails(incomingDiffTask, existingJson);
    expect(result).toBe(incomingDiffTask);
  });

  test('returns incoming JSON unchanged when sale IDs differ', () => {
    const incomingDiffSale = JSON.stringify({
      salesVerificationTaskDetails: { saleId: 'S-9999' },
      qualityControlOutcome: {},
    });
    const existingJson = JSON.stringify({
      salesVerificationTaskDetails: { saleId: 'S-1111' },
      qualityControlOutcome: { qcOutcome: 'Pass' },
    });
    const result = preserveQcOutcomeDetails(incomingDiffSale, existingJson);
    expect(result).toBe(incomingDiffSale);
  });
});

// ──────────────────────────────────────────────
// mergeAuditHistoryDetails
// ──────────────────────────────────────────────
describe('mergeAuditHistoryDetails', () => {
  const baseJson = JSON.stringify({ salesVerificationTaskDetails: { taskId: 'A-6000' } });
  const slPayload = { entries: [{ field: 'taskStatus', old: 'Assigned', new: 'Complete' }] };
  const qcPayload = { entries: [{ field: 'qcOutcome', old: '', new: 'Pass' }] };

  test('stores SL audit payload into auditLogs.sl and auditHistory', () => {
    const result = mergeAuditHistoryDetails(baseJson, 'SL', slPayload);
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.auditLogs.sl).toEqual(slPayload);
    expect(root.auditHistory).toEqual(slPayload);
    expect(root.qcAuditHistory).toBeUndefined();
  });

  test('stores QC audit payload into auditLogs.qc and qcAuditHistory', () => {
    const result = mergeAuditHistoryDetails(baseJson, 'QC', qcPayload);
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.auditLogs.qc).toEqual(qcPayload);
    expect(root.qcAuditHistory).toEqual(qcPayload);
    expect(root.auditHistory).toBeUndefined();
  });

  test('falls back to empty record for invalid JSON', () => {
    const result = mergeAuditHistoryDetails('not-json', 'SL', slPayload);
    const root = JSON.parse(result) as Record<string, Record<string, unknown>>;
    expect(root.auditLogs.sl).toEqual(slPayload);
  });
});
