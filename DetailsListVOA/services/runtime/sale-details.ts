import { QcOutcomeActionPayload, SalesParticularDraftPayload, SalesVerificationActionPayload } from '../../components/SaleDetailsShell/types';
import { hasDisplayText, normalizeTextValue } from './text';

export type AuditType = 'QC' | 'SL';

export const toRecord = (value: unknown): Record<string, unknown> | undefined => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
};

export const getEmptySaleRecord = (): Record<string, unknown> => ({
  salesVerificationTaskDetails: {},
  links: {},
  propertyAndBandingDetails: {},
  masterSale: {},
  repeatsSaleInfo: {},
  welshLandTax: [],
  landRegistryData: [],
  salesParticularDetails: {},
  salesVerificationDetails: {},
  qualityControlOutcome: {},
  auditHistory: {},
  qcAuditHistory: {},
  auditLogs: {
    sl: {},
    qc: {},
  },
  // Legacy keys retained for backward compatibility during migration.
  taskDetails: {},
  bandingInfo: {},
  repeatSaleInfo: {},
  salesParticularInfo: {},
  salesVerificationInfo: {},
});

export const getSaleDetailsRoot = (saleDetailsJson: string): Record<string, unknown> => {
  if (saleDetailsJson) {
    try {
      const parsed = JSON.parse(saleDetailsJson) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // Fall through to empty record.
    }
  }

  return getEmptySaleRecord();
};

const normalizeTaskIdValue = (value: unknown): string => {
  const normalized = normalizeTextValue(value);
  if (!hasDisplayText(normalized)) {
    return '';
  }
  return normalized;
};

const normalizePromotedMasterSource = (value: unknown): 'WLTT' | 'LRPPD' | '' => {
  const normalized = normalizeTextValue(value).toLowerCase();
  if (!normalized) {
    return '';
  }

  if (normalized.includes('wltt') || normalized.includes('welsh') || normalized.includes('stamp')) {
    return 'WLTT';
  }

  if (normalized.includes('lrppd') || normalized.includes('land registry') || normalized.includes('price paid')) {
    return 'LRPPD';
  }

  return '';
};

const toSalesParticularStatusText = (reviewStatusKey?: SalesParticularDraftPayload['reviewStatusKey']): string => {
  if (reviewStatusKey === 'details-available') {
    return 'Details available';
  }

  if (reviewStatusKey === 'details-not-available') {
    return 'Details not available';
  }

  if (reviewStatusKey === 'not-reviewed') {
    return 'Not reviewed';
  }

  return '';
};

const toPadConfirmationText = (key?: string): string => {
  const normalized = normalizeTextValue(key).toLowerCase();
  if (!normalized) {
    return '';
  }

  if (normalized === 'job-created') {
    return 'Data enhancement job created';
  }

  if (normalized === 'job-not-required') {
    return 'Data enhancement job not required';
  }

  if (normalized === 'pads-not-reviewed') {
    return 'PADs not reviewed';
  }

  return normalizeTextValue(key);
};

const emptyToNull = (value: unknown): unknown =>
  typeof value === 'string' && value.trim() === '' ? null : value;

const mergeSalesParticularDraftDetails = (
  existing: Record<string, unknown>,
  draft: SalesParticularDraftPayload,
  padConfirmationKey?: string,
): Record<string, unknown> => {
  const padConfirmationText = toPadConfirmationText(padConfirmationKey);

  return {
    ...existing,
    salesParticular: toSalesParticularStatusText(draft.reviewStatusKey),
    linkParticulars: emptyToNull(draft.linkParticulars),
    kitchenAge: emptyToNull(draft.kitchenAge),
    kitchenSpecification: emptyToNull(draft.kitchenSpecification),
    bathroomAge: emptyToNull(draft.bathroomAge),
    bathroomSpecification: emptyToNull(draft.bathroomSpecification),
    glazing: emptyToNull(draft.glazing),
    heating: emptyToNull(draft.heating),
    decorativeFinishes: emptyToNull(draft.decorativeFinishes),
    conditionScore: emptyToNull(draft.conditionScore),
    conditionCategory: emptyToNull(draft.conditionCategory),
    particularNotes: emptyToNull(draft.particularsNotes),
    particularsNotes: emptyToNull(draft.particularsNotes),
    padConfirmation: padConfirmationText,
  };
};


export const resolveCurrentTaskIdFromDetails = (saleDetailsJson: string, selectedTaskId?: string): string => {
  const root = getSaleDetailsRoot(saleDetailsJson);
  const primaryTaskDetails = toRecord(root.salesVerificationTaskDetails);
  const legacyTaskDetails = toRecord(root.taskDetails);
  return normalizeTaskIdValue(primaryTaskDetails?.taskId)
    || normalizeTaskIdValue(legacyTaskDetails?.taskId)
    || normalizeTaskIdValue(selectedTaskId);
};

export const resolveCurrentSaleIdFromDetails = (saleDetailsJson: string, selectedSaleId?: string): string => {
  const root = getSaleDetailsRoot(saleDetailsJson);
  const primaryTaskDetails = toRecord(root.salesVerificationTaskDetails);
  const legacyTaskDetails = toRecord(root.taskDetails);
  return normalizeTextValue(primaryTaskDetails?.saleId)
    || normalizeTextValue(primaryTaskDetails?.saleid)
    || normalizeTextValue(legacyTaskDetails?.saleId)
    || normalizeTextValue(legacyTaskDetails?.saleid)
    || normalizeTextValue(root.saleId)
    || normalizeTextValue(root.saleid)
    || normalizeTextValue(selectedSaleId);
};

export const stripTaskIdPrefix = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '');
  return digitsOnly || value.trim();
};

export const resolveTaskIdForAuditLogs = (saleDetailsJson: string, selectedTaskId?: string): string => {
  const selected = normalizeTextValue(selectedTaskId);
  if (selected) {
    return stripTaskIdPrefix(selected);
  }

  const root = getSaleDetailsRoot(saleDetailsJson);
  const primaryTaskDetails = toRecord(root.salesVerificationTaskDetails);
  const legacyTaskDetails = toRecord(root.taskDetails);
  const taskIdRaw = primaryTaskDetails?.taskId ?? legacyTaskDetails?.taskId;
  if (typeof taskIdRaw === 'string' && taskIdRaw.trim()) {
    return stripTaskIdPrefix(taskIdRaw.trim());
  }

  return '';
};

export const mergeManualTaskCreationDetails = (
  saleDetailsJson: string,
  payload: { saleId: string; taskId?: string; assignedTo?: string },
): string => {
  const root = getSaleDetailsRoot(saleDetailsJson);

  const salesVerificationTaskDetails = toRecord(root.salesVerificationTaskDetails) ?? {};
  const legacyTaskDetails = toRecord(root.taskDetails) ?? {};

  const saleId = normalizeTextValue(payload.saleId)
    || normalizeTextValue(salesVerificationTaskDetails.saleId)
    || normalizeTextValue(legacyTaskDetails.saleId);
  const taskId = normalizeTaskIdValue(payload.taskId)
    || normalizeTaskIdValue(salesVerificationTaskDetails.taskId)
    || normalizeTaskIdValue(legacyTaskDetails.taskId);
  const assignedTo = normalizeTextValue(payload.assignedTo)
    || normalizeTextValue(salesVerificationTaskDetails.assignedTo)
    || normalizeTextValue(legacyTaskDetails.assignedTo);
  const taskStatus = normalizeTextValue(salesVerificationTaskDetails.taskStatus)
    || normalizeTextValue(legacyTaskDetails.taskStatus)
    || (taskId ? 'Assigned' : '');

  const nextTaskDetails: Record<string, unknown> = {
    ...salesVerificationTaskDetails,
    sourceType: 'M',
  };
  if (saleId) {
    nextTaskDetails.saleId = saleId;
  }
  if (taskId) {
    nextTaskDetails.taskId = taskId;
  }
  if (taskStatus) {
    nextTaskDetails.taskStatus = taskStatus;
  }
  if (assignedTo) {
    nextTaskDetails.assignedTo = assignedTo;
  }
  root.salesVerificationTaskDetails = nextTaskDetails;

  const nextLegacyTaskDetails: Record<string, unknown> = {
    ...legacyTaskDetails,
    sourceType: 'M',
  };
  if (saleId) {
    nextLegacyTaskDetails.saleId = saleId;
  }
  if (taskId) {
    nextLegacyTaskDetails.taskId = taskId;
  }
  if (taskStatus) {
    nextLegacyTaskDetails.taskStatus = taskStatus;
  }
  if (assignedTo) {
    nextLegacyTaskDetails.assignedTo = assignedTo;
  }
  root.taskDetails = nextLegacyTaskDetails;

  return JSON.stringify(root);
};
interface ModifyTaskDetailsPayload {
  taskStatus: string;
  assignedTo?: string;
  assignedToUserId?: string;
  assignedDateIso?: string;
}

const applyModifyTaskDetails = (
  existing: Record<string, unknown>,
  payload: ModifyTaskDetailsPayload,
): Record<string, unknown> => {
  const next: Record<string, unknown> = {
    ...existing,
    taskStatus: payload.taskStatus,
    taskstatus: payload.taskStatus,
    status: payload.taskStatus,
  };

  const assignedTo = normalizeTextValue(payload.assignedTo);
  if (assignedTo) {
    next.assignedTo = assignedTo;
    next.assignedto = assignedTo;
    next.assignedToName = assignedTo;
    next.assignedtoname = assignedTo;
    next.caseworkerAssignedTo = assignedTo;
    next.caseworkerassignedto = assignedTo;
  }

  const assignedToUserId = normalizeTextValue(payload.assignedToUserId);
  if (assignedToUserId) {
    next.assignedToUserId = assignedToUserId;
    next.assignedtouserid = assignedToUserId;
    next.assignedToId = assignedToUserId;
    next.assignedtoid = assignedToUserId;
    next.caseworkerAssignedToUserId = assignedToUserId;
    next.caseworkerassignedtouserid = assignedToUserId;
  }

  const assignedDateIso = normalizeTextValue(payload.assignedDateIso);
  if (assignedDateIso) {
    next.assignedDate = assignedDateIso;
    next.assigneddate = assignedDateIso;
    next.caseworkerAssignedDate = assignedDateIso;
    next.caseworkerassigneddate = assignedDateIso;
    next.caseworkerAssignedOn = assignedDateIso;
    next.caseworkerassignedon = assignedDateIso;
  }

  next.taskCompletedDate = null;
  next.taskcompleteddate = null;
  next.completedDate = null;
  next.completeddate = null;

  return next;
};

export const mergeModifyTaskDetails = (
  saleDetailsJson: string,
  payload: ModifyTaskDetailsPayload,
): string => {
  const root = getSaleDetailsRoot(saleDetailsJson);

  root.salesVerificationTaskDetails = applyModifyTaskDetails(
    toRecord(root.salesVerificationTaskDetails) ?? {},
    payload,
  );
  root.taskDetails = applyModifyTaskDetails(
    toRecord(root.taskDetails) ?? {},
    payload,
  );

  return JSON.stringify(root);
};

export type SalesVerificationTaskActionType =
  | 'completeSalesVerificationTask'
  | 'submitSalesVerificationTaskForQc';

const normalizeTaskStatus = (value: unknown): string => normalizeTextValue(value).toLowerCase();

const resolveTaskStatusForSalesVerificationAction = (
  actionType?: SalesVerificationTaskActionType,
  currentStatus?: unknown,
): string | undefined => {
  if (actionType === 'completeSalesVerificationTask') {
    return 'Complete';
  }

  if (actionType === 'submitSalesVerificationTaskForQc') {
    return normalizeTaskStatus(currentStatus) === 'assigned qc failed'
      ? 'Reassigned To QC'
      : 'QC Requested';
  }

  return undefined;
};

const applySalesVerificationTaskStatus = (
  existing: Record<string, unknown>,
  taskStatus?: string,
): Record<string, unknown> => {
  if (!taskStatus) {
    return existing;
  }

  return {
    ...existing,
    taskStatus,
    taskstatus: taskStatus,
    status: taskStatus,
  };
};

export const mergeSalesVerificationDetails = (
  saleDetailsJson: string,
  payload: SalesVerificationActionPayload,
  actionType?: SalesVerificationTaskActionType,
): string => {
  const root = getSaleDetailsRoot(saleDetailsJson);

  const salesVerificationDetailsRaw = root.salesVerificationDetails;
  const salesVerificationDetails =
    salesVerificationDetailsRaw && typeof salesVerificationDetailsRaw === 'object' && !Array.isArray(salesVerificationDetailsRaw)
      ? salesVerificationDetailsRaw as Record<string, unknown>
      : {};

  root.salesVerificationDetails = {
    ...salesVerificationDetails,
    isSaleUseful: emptyToNull(payload.isSaleUseful),
    whyNotUseful: emptyToNull(payload.whyNotUseful),
    additionalNotes: emptyToNull(payload.additionalNotes),
    remarks: emptyToNull(payload.remarks ?? salesVerificationDetails.remarks ?? ''),
  };


  if (payload.salesParticularDraft) {
    root.salesParticularDetails = mergeSalesParticularDraftDetails(
      toRecord(root.salesParticularDetails) ?? {},
      payload.salesParticularDraft,
      payload.padConfirmationKey,
    );
    root.salesParticularInfo = mergeSalesParticularDraftDetails(
      toRecord(root.salesParticularInfo) ?? {},
      payload.salesParticularDraft,
      payload.padConfirmationKey,
    );
  }

  if (payload.padConfirmationKey !== undefined) {
    const padConfirmationText = toPadConfirmationText(payload.padConfirmationKey);
    root.propertyAndBandingDetails = {
      ...(toRecord(root.propertyAndBandingDetails) ?? {}),
      padConfirmation: padConfirmationText,
    };
    root.bandingInfo = {
      ...(toRecord(root.bandingInfo) ?? {}),
      padConfirmation: padConfirmationText,
    };
  }

  const salesTaskDetails = toRecord(root.salesVerificationTaskDetails) ?? {};
  const legacyTaskDetails = toRecord(root.taskDetails) ?? {};
  const currentTaskStatus = normalizeTextValue(salesTaskDetails.taskStatus)
    || normalizeTextValue(salesTaskDetails.taskstatus)
    || normalizeTextValue(legacyTaskDetails.taskStatus)
    || normalizeTextValue(legacyTaskDetails.taskstatus);
  const nextTaskStatus = resolveTaskStatusForSalesVerificationAction(actionType, currentTaskStatus);

  const promotedMasterRecord = payload.promotedMasterRecord;
  if (promotedMasterRecord) {
    const source = normalizePromotedMasterSource(promotedMasterRecord.source);
    const promotedId = normalizeTextValue(promotedMasterRecord.id);

    if (source && promotedId) {
      const updateTaskDetails = (existing: Record<string, unknown>): Record<string, unknown> => {
        const next: Record<string, unknown> = {
          ...existing,
          salesSource: source,
          saleSource: source,
        };

        if (source === 'WLTT') {
          next.wltId = promotedId;
          next.wlttId = promotedId;
          next.lrpddId = null;
          next.lrppdId = null;
        } else {
          next.lrpddId = promotedId;
          next.lrppdId = promotedId;
          next.wltId = null;
          next.wlttId = null;
        }

        return next;
      };

      root.salesVerificationTaskDetails = updateTaskDetails(toRecord(root.salesVerificationTaskDetails) ?? {});
      root.taskDetails = updateTaskDetails(toRecord(root.taskDetails) ?? {});
    }
  }


  root.salesVerificationTaskDetails = applySalesVerificationTaskStatus(
    toRecord(root.salesVerificationTaskDetails) ?? {},
    nextTaskStatus,
  );
  root.taskDetails = applySalesVerificationTaskStatus(
    toRecord(root.taskDetails) ?? {},
    nextTaskStatus,
  );

  return JSON.stringify(root);
};


const normalizeQcOutcomeValue = (value: unknown): 'Pass' | 'Fail' | '' => {
  const normalized = normalizeTextValue(value).toLowerCase();
  if (!normalized) {
    return '';
  }

  if (normalized === 'pass' || normalized === 'passed') {
    return 'Pass';
  }

  if (normalized === 'fail' || normalized === 'failed') {
    return 'Fail';
  }

  return '';
};

const applyQcOutcomeTaskDetails = (
  existing: Record<string, unknown>,
  taskStatus: string,
  outcomeTimestampIso: string,
  outcome: 'Pass' | 'Fail',
): Record<string, unknown> => {
  const next = applySalesVerificationTaskStatus(existing, taskStatus);
  next.qcCompletedDate = outcomeTimestampIso;
  next.qccompleteddate = outcomeTimestampIso;

  if (outcome === 'Pass') {
    next.taskCompletedDate = outcomeTimestampIso;
    next.taskcompleteddate = outcomeTimestampIso;
    next.completedDate = outcomeTimestampIso;
    next.completeddate = outcomeTimestampIso;
  } else {
    next.taskCompletedDate = null;
    next.taskcompleteddate = null;
    next.completedDate = null;
    next.completeddate = null;
  }

  return next;
};

export const mergeQcOutcomeDetails = (
  saleDetailsJson: string,
  payload: QcOutcomeActionPayload,
): string => {
  const root = getSaleDetailsRoot(saleDetailsJson);
  const qcOutcome = normalizeQcOutcomeValue(payload.qcOutcome);

  if (!qcOutcome) {
    return JSON.stringify(root);
  }

  const qcReviewedBy = normalizeTextValue(payload.qcReviewedBy);
  const qcRemark = normalizeTextValue(payload.qcRemark);
  const qcReviewedOn = new Date().toISOString();

  const qualityControlOutcome = toRecord(root.qualityControlOutcome) ?? {};
  root.qualityControlOutcome = {
    ...qualityControlOutcome,
    qcOutcome,
    qcRemark,
    qcReviewedBy,
    qcReviewedOn,
  };

  const nextTaskStatus = qcOutcome === 'Fail' ? 'Assigned QC Failed' : 'Complete Passed QC';
  root.salesVerificationTaskDetails = applyQcOutcomeTaskDetails(
    toRecord(root.salesVerificationTaskDetails) ?? {},
    nextTaskStatus,
    qcReviewedOn,
    qcOutcome,
  );
  root.taskDetails = applyQcOutcomeTaskDetails(
    toRecord(root.taskDetails) ?? {},
    nextTaskStatus,
    qcReviewedOn,
    qcOutcome,
  );

  return JSON.stringify(root);
};

export const preserveQcOutcomeDetails = (
  incomingSaleDetailsJson: string,
  existingSaleDetailsJson: string,
): string => {
  const incomingRoot = getSaleDetailsRoot(incomingSaleDetailsJson);
  const existingRoot = getSaleDetailsRoot(existingSaleDetailsJson);

  const incomingTaskId = resolveCurrentTaskIdFromDetails(incomingSaleDetailsJson);
  const existingTaskId = resolveCurrentTaskIdFromDetails(existingSaleDetailsJson);
  const incomingSaleId = resolveCurrentSaleIdFromDetails(incomingSaleDetailsJson);
  const existingSaleId = resolveCurrentSaleIdFromDetails(existingSaleDetailsJson);

  if (incomingTaskId && existingTaskId && incomingTaskId !== existingTaskId) {
    return incomingSaleDetailsJson;
  }

  if (incomingSaleId && existingSaleId && incomingSaleId !== existingSaleId) {
    return incomingSaleDetailsJson;
  }

  const incomingOutcomeRecord = toRecord(incomingRoot.qualityControlOutcome) ?? {};
  const existingOutcomeRecord = toRecord(existingRoot.qualityControlOutcome) ?? {};

  const incomingQcOutcome = normalizeTextValue(incomingOutcomeRecord.qcOutcome);
  const incomingQcRemark = normalizeTextValue(incomingOutcomeRecord.qcRemark);
  const incomingQcReviewedBy = normalizeTextValue(incomingOutcomeRecord.qcReviewedBy);
  const incomingQcReviewedOn = normalizeTextValue(incomingOutcomeRecord.qcReviewedOn);

  const existingQcOutcome = normalizeTextValue(existingOutcomeRecord.qcOutcome);
  const existingQcRemark = normalizeTextValue(existingOutcomeRecord.qcRemark);
  const existingQcReviewedBy = normalizeTextValue(existingOutcomeRecord.qcReviewedBy);
  const existingQcReviewedOn = normalizeTextValue(existingOutcomeRecord.qcReviewedOn);

  const nextQcOutcome = incomingQcOutcome || existingQcOutcome;
  const nextQcRemark = incomingQcRemark || existingQcRemark;
  const nextQcReviewedBy = incomingQcReviewedBy || existingQcReviewedBy;
  const nextQcReviewedOn = incomingQcReviewedOn || existingQcReviewedOn;

  const changed = nextQcOutcome !== incomingQcOutcome
    || nextQcRemark !== incomingQcRemark
    || nextQcReviewedBy !== incomingQcReviewedBy
    || nextQcReviewedOn !== incomingQcReviewedOn;

  if (!changed) {
    return incomingSaleDetailsJson;
  }

  incomingRoot.qualityControlOutcome = {
    ...incomingOutcomeRecord,
    qcOutcome: nextQcOutcome,
    qcRemark: nextQcRemark,
    qcReviewedBy: nextQcReviewedBy,
    qcReviewedOn: nextQcReviewedOn,
  };

  return JSON.stringify(incomingRoot);
};
export const mergeAuditHistoryDetails = (
  saleDetailsJson: string,
  auditType: AuditType,
  payload: Record<string, unknown>,
): string => {
  const root = getSaleDetailsRoot(saleDetailsJson);

  const auditLogsRaw = root.auditLogs;
  const auditLogs = auditLogsRaw && typeof auditLogsRaw === 'object' && !Array.isArray(auditLogsRaw)
    ? auditLogsRaw as Record<string, unknown>
    : {};

  const scopeKey = auditType === 'QC' ? 'qc' : 'sl';
  auditLogs[scopeKey] = payload;
  root.auditLogs = auditLogs;

  if (auditType === 'QC') {
    root.qcAuditHistory = payload;
  } else {
    root.auditHistory = payload;
  }

  return JSON.stringify(root);
};

