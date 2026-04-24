import { IInputs, IOutputs } from '../generated/ManifestTypes';
import { QcOutcomeActionPayload, SalesVerificationActionPayload } from '../components/SaleDetailsShell/types';
import { CONTROL_CONFIG } from '../config/ControlConfig';
import {
  CASEWORKER_ROLE_NAMES,
  CASEWORKER_TEAM_NAMES,
  MANAGER_ROLE_NAMES,
  MANAGER_TEAM_NAMES,
  QA_ROLE_NAMES,
  QA_TEAM_NAMES,
} from '../constants/AccessControl';
import { executeUnboundCustomApi } from './CustomApi';
import { svtDebug } from '../utils/debug';
import {
  extractTaskIdFromUnknown,
  parseManualTaskCreationResult,
  parseModifyTaskResult,
  parseApiMutationResult,
  resolveConfiguredApiName,
  resolveConfiguredApiType,
  resolveCurrentUserDisplayName,
  resolveCurrentUserId,
  RuntimeActionType,
  unwrapCustomApiPayload,
} from './runtime/actions';
import {
  AuditType,
  getEmptySaleRecord,
  mergeAuditHistoryDetails,
  mergeManualTaskCreationDetails,
  mergeModifyTaskDetails,
  preserveQcOutcomeDetails,
  mergeQcOutcomeDetails,
  mergeSalesVerificationDetails,
  resolveCurrentSaleIdFromDetails,
  resolveCurrentTaskIdFromDetails,
  resolveTaskIdForAuditLogs,
  stripTaskIdPrefix,
  toRecord,
} from './runtime/sale-details';
import {
  JourneyContext,
  SharePointCatalogChunks,
  isManagerHomeJourneyScreen,
  isPcfViewSalesDetailsEnabled,
  normalizeJourneyContext,
  resolveActiveRequestContext,
  resolveSharePointCatalogChunks,
} from './runtime/context-routing';
import { hasDisplayText, normalizeGuidValue, normalizeTextValue } from './runtime/text';

const EDITABLE_CASEWORKER_STATUSES = new Set(['assigned', 'assigned qc failed']);
const EDITABLE_QC_STATUSES = new Set(['assigned to qc', 'reassigned to qc']);
const MODIFY_TASK_ALLOWED_STATUSES = new Set(['complete', 'complete passed qc']);
const MODIFY_TASK_API_STATUS_MAP: Record<string, string> = {
  complete: 'Complete',
  'complete passed qc': 'Complete Passed QC',
};
const PRE_QC_STATUSES = new Set(['assigned', 'complete']);
const ENABLE_COUNTRY_LIST_YEAR_API_PARAMS = CONTROL_CONFIG.enableCountryListYearApiParams === true;
const EXTERNAL_OPEN_MODE_VT_READONLY = 'vt-readonly';
const EXTERNAL_READONLY_REASON = 'Opened from VT in readonly mode. Internal SVT actions are disabled.';

export class DetailsListRuntimeController {
  private _notifyOutputChanged!: () => void;
  private _context!: ComponentFramework.Context<IInputs>;
  private _saleDetails = '';
  private selectedTaskId?: string;
  private selectedSaleId?: string;
  private selectedTaskIdsJson?: string;
  private selectedSaleIdsJson?: string;
  private selectedCount?: number;
  private backRequestId?: string;
  private actionType?: string;
  private actionRequestId?: string;
  private actionSequence = 0;
  private viewSalePending?: boolean;
  private viewSaleRequestSeq = 0;
  private activeViewSaleRequestId?: number;
  private showPcfSaleDetails = false;
  private managerJourneyActive = false;
  private managerJourneyContext?: JourneyContext;
  private selectedScreenKind?: string;
  private selectedTableKey?: string;
  private saleDetailsReadOnly = false;
  private saleDetailsReadOnlyMessage?: string;
  private disableInternalDetailsActions = false;
  private externalReadOnlyMode = false;
  private externalLaunchKey?: string;
  private externalLaunchInFlight = false;
  private hasCaseworkerAccess = false;
  private hasManagerAccess = false;
  private hasQaAccess = false;
  private saleDetailsCanSubmitQcOutcome = false;
  private saleDetailsShowQcSection = false;
  private hasResolvedCaseworkerAccess = false;
  private caseworkerAccessRequest?: Promise<boolean>;
  private submitSuccessNotification?: string;
  private _entraObjectId?: string;

  public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void): void {
    this._context = context;
    this._notifyOutputChanged = notifyOutputChanged;
  }

  public setContext(context: ComponentFramework.Context<IInputs>): void {
    this._context = context;
  }

  public warmupAccessResolution(): void {
    if (this.hasResolvedCaseworkerAccess || this.caseworkerAccessRequest) {
      return;
    }

    this.caseworkerAccessRequest = this.resolveCaseworkerAccess();
    void this.caseworkerAccessRequest
      .then((hasCaseworker) => {
        this.hasCaseworkerAccess = hasCaseworker;
        this.hasResolvedCaseworkerAccess = true;
        return hasCaseworker;
      })
      .catch((error) => {
        console.warn('Failed to warm up caseworker access.', error);
        this.hasCaseworkerAccess = false;
        this.hasManagerAccess = false;
        this.hasQaAccess = false;
      })
      .finally(() => {
        this.caseworkerAccessRequest = undefined;
        this._notifyOutputChanged?.();
      });
  }

  public getOutputs(): IOutputs {
    return {
      selectedTaskId: this.selectedTaskId,
      selectedSaleId: this.selectedSaleId,
      selectedTaskIdsJson: this.selectedTaskIdsJson,
      selectedSaleIdsJson: this.selectedSaleIdsJson,
      selectedCount: this.selectedCount,
      saleDetails: this._saleDetails,
      viewSalePending: this.viewSalePending,
      actionType: this.actionType,
      actionRequestId: this.actionRequestId,
      backRequestId: this.backRequestId,
    } as IOutputs;
  }

  public get saleDetailsJson(): string {
    return this._saleDetails;
  }

  public get isViewSalePending(): boolean {
    return this.viewSalePending === true;
  }

  public get shouldShowPcfSaleDetails(): boolean {
    return this.showPcfSaleDetails;
  }

  public get isSaleDetailsReadOnly(): boolean {
    return this.externalReadOnlyMode || this.saleDetailsReadOnly;
  }

  public get saleDetailsReadOnlyReason(): string | undefined {
    if (this.externalReadOnlyMode) {
      return EXTERNAL_READONLY_REASON;
    }
    return this.saleDetailsReadOnlyMessage;
  }

  public get areInternalSaleDetailsActionsDisabled(): boolean {
    return this.disableInternalDetailsActions;
  }

  public get isExternalReadonlyLaunchActive(): boolean {
    return this.externalReadOnlyMode;
  }

  public get submitSuccessMessage(): string | undefined {
    return this.submitSuccessNotification;
  }

  public clearSubmitSuccessMessage(): void {
    this.submitSuccessNotification = undefined;
    this._notifyOutputChanged?.();
  }

  public closeDetailsAfterSubmit(): void {
    this.activeViewSaleRequestId = undefined;
    this.showPcfSaleDetails = false;
    this.viewSalePending = false;
    this._saleDetails = '';
    this.saleDetailsReadOnly = false;
    this.saleDetailsReadOnlyMessage = undefined;
    this.saleDetailsCanSubmitQcOutcome = false;
    this.saleDetailsShowQcSection = false;
    this.emitAction('back');
  }

  public get canCreateManualTask(): boolean {
    return this.hasManagerAccess && this.hasCaseworkerAccess;
  }

  public get canModifySvtTask(): boolean {
    return this.hasCaseworkerAccess;
  }

  public get canProgressSalesVerificationTask(): boolean {
    return this.hasCaseworkerAccess;
  }

  public get canSubmitQcOutcome(): boolean {
    return this.saleDetailsCanSubmitQcOutcome;
  }

  public get shouldShowQcSection(): boolean {
    return this.saleDetailsShowQcSection;
  }

  public get activeWorkspaceName(): string {
    switch (this.selectedScreenKind) {
      case 'managerAssign': return 'Manager Assignment';
      case 'qcAssign': return 'QC Assignment';
      case 'caseworkerView': return 'Caseworker View';
      case 'qcView': return 'QC View';
      case 'salesSearch': return 'Sales Search';
      default: return this.selectedScreenKind ?? '';
    }
  }

  public get currentUserDisplayName(): string {
    return resolveCurrentUserDisplayName(this._context);
  }

  public get entraObjectId(): string {
    return this._entraObjectId ?? '';
  }

  public syncPcfViewSalesEnabled(enabled: boolean): void {
    if (!enabled && this.showPcfSaleDetails) {
      this.showPcfSaleDetails = false;
    }
  }

  public syncExternalReadonlyLaunch(): void {
    const contextParams = this._context.parameters as unknown as Record<string, { raw?: string }>;
    const externalSaleId = normalizeTextValue(contextParams.externalSaleId?.raw);
    const externalOpenMode = normalizeTextValue(contextParams.externalOpenMode?.raw).toLowerCase();
    const isExternalReadonlyLaunch = hasDisplayText(externalSaleId) && externalOpenMode === EXTERNAL_OPEN_MODE_VT_READONLY;

    this.externalReadOnlyMode = isExternalReadonlyLaunch;
    this.disableInternalDetailsActions = isExternalReadonlyLaunch;

    if (!isExternalReadonlyLaunch) {
      this.externalLaunchKey = undefined;
      this.externalLaunchInFlight = false;
      return;
    }

    const requestContext = this.getActiveRequestContext();
    const launchKey = [
      externalOpenMode,
      externalSaleId.toLowerCase(),
      normalizeTextValue(requestContext.country).toLowerCase(),
      normalizeTextValue(requestContext.listYear).toLowerCase(),
    ].join('|');

    if (this.externalLaunchKey === launchKey || this.externalLaunchInFlight) {
      return;
    }

    this.externalLaunchKey = launchKey;
    this.externalLaunchInFlight = true;
    this.selectedSaleId = externalSaleId;
    this.selectedTaskId = undefined;

    void this.onTaskClick(undefined, externalSaleId)
      .catch((error) => {
        console.warn('Failed to launch external readonly sale details.', error);
      })
      .finally(() => {
        this.externalLaunchInFlight = false;
        this._notifyOutputChanged?.();
      });
  }

  public isManagerHomeScreen(): boolean {
    return isManagerHomeJourneyScreen(this._context);
  }

  public setManagerJourneyActive(isActive: boolean): void {
    this.managerJourneyActive = isActive;
    if (!isActive) {
      this.managerJourneyContext = undefined;
    }
  }

  public updateManagerJourneyContext(args: { country: string; listYear: string }): void {
    this.managerJourneyContext = normalizeJourneyContext(args);
  }

  public getSharePointCatalogChunks(): SharePointCatalogChunks {
    return resolveSharePointCatalogChunks(this._context);
  }
  public getFxEnvironmentUrl(): string {
    // Prefer host context (Model-Driven App) over input property (Canvas App).
    const page = (this._context as unknown as { page?: { getClientUrl?: () => string } }).page;
    if (typeof page?.getClientUrl === 'function') {
      try {
        const hostUrl = page.getClientUrl();
        if (hostUrl) { return hostUrl; }
      } catch { /* fall through to input property */ }
    }
    const contextParams = this._context.parameters as unknown as Record<string, { raw?: string }>;
    return normalizeTextValue(contextParams.fxEnvironmentUrl?.raw);
  }

  public getMdaAppId(): string {
    const contextParams = this._context.parameters as unknown as Record<string, { raw?: string }>;
    const fromInput = normalizeTextValue(contextParams.mdaAppId?.raw);
    if (fromInput) {
      return fromInput;
    }
    return normalizeTextValue(CONTROL_CONFIG.mdaAppId);
  }

  public getVmsBaseUrl(): string {
    const contextParams = this._context.parameters as unknown as Record<string, { raw?: string }>;
    return normalizeTextValue(contextParams.vmsBaseUrl?.raw);
  }


  public getActiveRequestContext(): { country: string; listYear: string } {
    return resolveActiveRequestContext(this._context, this.managerJourneyActive, this.managerJourneyContext);
  }

  public isPcfViewSalesDetailsEnabledFlag(): boolean {
    return isPcfViewSalesDetailsEnabled(this._context);
  }

  public async handleRowInvoke(args: { taskId?: string; saleId?: string; screenKind?: string; tableKey?: string }): Promise<void> {
    svtDebug.log('Runtime', 'handleRowInvoke', args);
    this.selectedTaskId = args?.taskId;
    this.selectedSaleId = args?.saleId;
    this.selectedScreenKind = normalizeTextValue(args?.screenKind);
    this.selectedTableKey = normalizeTextValue(args?.tableKey);
    await this.onTaskClick(args?.taskId, args?.saleId);
  }

  public handleSelectionChange(args: {
    taskId?: string;
    saleId?: string;
    selectedTaskIds?: string[];
    selectedSaleIds?: string[];
  }): void {
    this.selectedTaskId = args?.taskId;
    this.selectedSaleId = args?.saleId;
    this.selectedTaskIdsJson = JSON.stringify((args?.selectedTaskIds ?? []).filter((v) => !!v));
    this.selectedSaleIdsJson = JSON.stringify((args?.selectedSaleIds ?? []).filter((v) => !!v));
    const taskCount = args?.selectedTaskIds?.length ?? 0;
    const saleCount = args?.selectedSaleIds?.length ?? 0;
    this.selectedCount = taskCount || saleCount;
  }

  public handleSelectionCountChange(count: number): void {
    if (this.selectedCount !== count) {
      this.selectedCount = count;
    }
  }

  public handleBackToCanvas(): void {
    svtDebug.log('Runtime', 'handleBackToCanvas');
    this._saleDetails = '';
    this.activeViewSaleRequestId = undefined;
    this.viewSalePending = false;
    this.showPcfSaleDetails = false;
    this.saleDetailsReadOnly = false;
    this.saleDetailsReadOnlyMessage = undefined;
    this.saleDetailsCanSubmitQcOutcome = false;
    this.saleDetailsShowQcSection = false;
    this.selectedScreenKind = undefined;
    this.selectedTableKey = undefined;
    this.emitAction('back');
  }

  public handleDetailsBack(): void {
    svtDebug.log('Runtime', 'handleDetailsBack');
    this.activeViewSaleRequestId = undefined;
    this.showPcfSaleDetails = false;
    this.viewSalePending = false;
    this._saleDetails = '';
    this.saleDetailsReadOnly = false;
    this.saleDetailsReadOnlyMessage = undefined;
    this.saleDetailsCanSubmitQcOutcome = false;
    this.saleDetailsShowQcSection = false;
    this.emitAction('back');
  }

  public async refreshDetails(): Promise<void> {
    await this.onTaskClick(this.selectedTaskId, this.selectedSaleId);
  }

  public async createManualTask(saleIds: string[]): Promise<void> {
    svtDebug.log('Runtime', 'createManualTask', { saleIds });
    const normalizedSaleIds = saleIds
      .map((id) => normalizeTextValue(id))
      .filter((id) => hasDisplayText(id));
    if (normalizedSaleIds.length === 0) {
      throw new Error('Sale ID is not available for manual task creation.');
    }

    const isSingle = normalizedSaleIds.length === 1;

    if (isSingle) {
      const existingTaskId = resolveCurrentTaskIdFromDetails(this._saleDetails, this.selectedTaskId);
      if (existingTaskId) {
        throw new Error('Task ID already exists for this sale record.');
      }
    }

    await this.ensureCaseworkerAccess();
    if (!this.hasManagerAccess || !this.hasCaseworkerAccess) {
      throw new Error('Manual task creation is restricted to users with both manager and caseworker role/team access.');
    }

    const apiName = resolveConfiguredApiName(
      this._context,
      'manualTaskCreationApiName',
      CONTROL_CONFIG.manualTaskCreationApiName,
    );
    if (!apiName) {
      throw new Error('Manual task creation API name is not configured.');
    }

    const response = await executeUnboundCustomApi<unknown>(
      this._context,
      apiName,
      {
        saleIds: normalizedSaleIds.join(','),
        sourceType: 'M',
        createdBy: this.entraObjectId,
      },
      {
        operationType: resolveConfiguredApiType(
          this._context,
          'manualTaskCreationApiType',
          CONTROL_CONFIG.manualTaskCreationApiType,
        ),
      },
    );

    const parsed = parseManualTaskCreationResult(response);
    if (!parsed.success) {
      throw new Error(parsed.message || 'Manual task creation failed.');
    }

    if (isSingle) {
      const normalizedSaleId = normalizedSaleIds[0];
      const createdTaskId = extractTaskIdFromUnknown(parsed.payload) || extractTaskIdFromUnknown(response);
      this._saleDetails = mergeManualTaskCreationDetails(this._saleDetails, {
        saleId: normalizedSaleId,
        taskId: createdTaskId,
        assignedTo: resolveCurrentUserDisplayName(this._context),
      });

      this.selectedSaleId = normalizedSaleId;
      if (createdTaskId) {
        this.selectedTaskId = createdTaskId;
      }

      this._notifyOutputChanged();
      await this.onTaskClick(this.selectedTaskId, normalizedSaleId);
    } else {
      this._notifyOutputChanged();
    }
  }

  public async modifySvtTask(): Promise<void> {
    svtDebug.log('Runtime', 'modifySvtTask', { selectedTaskId: this.selectedTaskId });
    const existingTaskId = resolveCurrentTaskIdFromDetails(this._saleDetails, this.selectedTaskId);
    if (!hasDisplayText(existingTaskId)) {
      throw new Error('Task ID is not available for modify SVT task.');
    }

    const taskStatus = this.resolveTaskStatusFromSaleRecord(this._saleDetails);
    if (!MODIFY_TASK_ALLOWED_STATUSES.has(taskStatus)) {
      throw new Error('Modify SVT task is available only when task status is Complete or Complete Passed QC.');
    }

    await this.ensureCaseworkerAccess();
    if (!this.hasCaseworkerAccess) {
      throw new Error('Modify SVT task is restricted to caseworker role/team.');
    }

    const apiName = resolveConfiguredApiName(
      this._context,
      'modifyTaskApiName',
      CONTROL_CONFIG.modifyTaskApiName,
    );
    if (!apiName) {
      throw new Error('Modify SVT task API name is not configured.');
    }

    const normalizedTaskId = this.normalizeTaskIdForModifyTask(existingTaskId);
    if (!normalizedTaskId) {
      throw new Error('Task ID is invalid for modify SVT task.');
    }

    // Use canonical status labels expected by SP/APIM (preserve QC acronym casing).
    const taskStatusForApi = MODIFY_TASK_API_STATUS_MAP[taskStatus] || 'Complete';
    const requestedBy = this.entraObjectId;
    const response = await executeUnboundCustomApi<unknown>(
      this._context,
      apiName,
      {
        source: 'VSRT',
        taskStatus: taskStatusForApi,
        taskList: JSON.stringify([normalizedTaskId]),
        requestedBy,
      },
      {
        operationType: resolveConfiguredApiType(
          this._context,
          'modifyTaskApiType',
          CONTROL_CONFIG.modifyTaskApiType,
        ),
      },
    );

    const parsed = parseModifyTaskResult(response);
    if (!parsed.success) {
      throw new Error(parsed.message || 'Modify SVT task failed.');
    }

    const assignedDateIso = new Date().toISOString();
    this._saleDetails = mergeModifyTaskDetails(this._saleDetails, {
      taskStatus: 'Assigned',
      assignedTo: resolveCurrentUserDisplayName(this._context),
      assignedToUserId: requestedBy,
      assignedDateIso,
    });

    const normalizedSaleId = resolveCurrentSaleIdFromDetails(this._saleDetails, this.selectedSaleId);
    if (normalizedSaleId) {
      this.selectedSaleId = normalizedSaleId;
    }
    this.selectedTaskId = normalizeTextValue(existingTaskId) || this.selectedTaskId;
    this.applySaleDetailsAccess(this._saleDetails);
    const qcAccess = this.resolveQcSectionAccess(this._saleDetails);
    this.saleDetailsCanSubmitQcOutcome = qcAccess.canSubmit;
    this.saleDetailsShowQcSection = qcAccess.showSection;
    this._notifyOutputChanged();

    if (normalizedSaleId) {
      await this.onTaskClick(this.selectedTaskId, normalizedSaleId);
    }
  }

  public async handleSalesVerificationTaskAction(
    type: 'completeSalesVerificationTask' | 'submitSalesVerificationTaskForQc',
    payload: SalesVerificationActionPayload,
  ): Promise<void> {
    svtDebug.log('Runtime', 'handleSalesVerificationTaskAction', { type, payload });
    await this.ensureCaseworkerAccess();
    if (!this.hasCaseworkerAccess) {
      throw new Error('Sales verification actions are restricted to caseworker role/team.');
    }

    const saleId = resolveCurrentSaleIdFromDetails(this._saleDetails, this.selectedSaleId);
    if (!hasDisplayText(saleId)) {
      throw new Error('Sale ID is not available for sales verification update.');
    }

    const apiName = resolveConfiguredApiName(
      this._context,
      'submitSalesVerificationApiName',
      CONTROL_CONFIG.submitSalesVerificationApiName,
    );
    if (!apiName) {
      throw new Error('Submit sales verification API name is not configured.');
    }

    const nextSaleDetails = mergeSalesVerificationDetails(this._saleDetails, payload, type);
    const payloadJson = this.buildSalesVerificationSubmitPayload(nextSaleDetails, this.entraObjectId);
    const saleSubmitRemarks = normalizeTextValue(payload.remarks);

    const response = await executeUnboundCustomApi<unknown>(
      this._context,
      apiName,
      {
        saleId,
        saleSubmitPayload: payloadJson,
        saleSubmitRemarks,
      },
      {
        operationType: resolveConfiguredApiType(
          this._context,
          'submitSalesVerificationApiType',
          CONTROL_CONFIG.submitSalesVerificationApiType,
        ),
      },
    );

    const parsed = parseApiMutationResult(response, 'Submit sales verification task failed.');
    if (!parsed.success) {
      throw new Error(parsed.message || 'Submit sales verification task failed.');
    }

    this._saleDetails = nextSaleDetails;
    this.selectedSaleId = normalizeTextValue(saleId) || this.selectedSaleId;
    this.selectedTaskId = resolveCurrentTaskIdFromDetails(nextSaleDetails, this.selectedTaskId);
    this.updateSaleDetailsAccessState();

    this.submitSuccessNotification = undefined;
    this.emitAction(type);
  }

  public async submitQcOutcome(payload: QcOutcomeActionPayload): Promise<void> {
    svtDebug.log('Runtime', 'submitQcOutcome', { payload });
    await this.ensureCaseworkerAccess();
    if (!this.hasQaAccess && !this.hasManagerAccess) {
      throw new Error('Submit QC outcome is restricted to QA or manager role/team.');
    }

    const taskId = resolveCurrentTaskIdFromDetails(this._saleDetails, this.selectedTaskId);
    if (!hasDisplayText(taskId)) {
      throw new Error('Task ID is not available for QC outcome submission.');
    }

    const apiName = resolveConfiguredApiName(
      this._context,
      'submitQcRemarksApiName',
      CONTROL_CONFIG.submitQcRemarksApiName,
    );
    if (!apiName) {
      throw new Error('Submit QC remarks API name is not configured.');
    }

    const normalizedTaskId = this.normalizeTaskIdForModifyTask(taskId);
    if (!normalizedTaskId) {
      throw new Error('Task ID is invalid for QC outcome submission.');
    }

    const qcParams: Record<string, string> = {
      taskId: JSON.stringify([normalizedTaskId]),
      qcOutcome: payload.qcOutcome,
      qcRemark: normalizeTextValue(payload.qcRemark),
      qcReviewedBy: this.entraObjectId,
    };

    const response = await executeUnboundCustomApi<unknown>(
      this._context,
      apiName,
      qcParams,
      {
        operationType: resolveConfiguredApiType(
          this._context,
          'submitQcRemarksApiType',
          CONTROL_CONFIG.submitQcRemarksApiType,
        ),
      },
    );

    const parsed = parseApiMutationResult(response, 'Submit QC outcome failed.');
    if (!parsed.success) {
      throw new Error(parsed.message || 'Submit QC outcome failed.');
    }

    this._saleDetails = mergeQcOutcomeDetails(this._saleDetails, payload);
    this.selectedTaskId = normalizeTextValue(taskId) || this.selectedTaskId;
    this.updateSaleDetailsAccessState();

    this.submitSuccessNotification = undefined;
    this.emitAction('submitQcOutcome');
  }

  private buildSalesVerificationSubmitPayload(detailsPayload: string, currentUserId?: string): string {
    const root = this.parseSaleRecordRoot(detailsPayload);
    const rawTask = toRecord(root.salesVerificationTaskDetails)
      ?? toRecord(root.taskDetails)
      ?? {};
    const rawTaskId = typeof rawTask.taskId === 'string' ? stripTaskIdPrefix(rawTask.taskId) : rawTask.taskId;
    rawTask.taskId = rawTaskId;
    if (currentUserId) {
      rawTask.requestedBy = currentUserId;
    }
    const rawParticulars = toRecord(root.salesParticularDetails)
      ?? toRecord(root.salesParticularInfo)
      ?? {};
    const rawVerification = toRecord(root.salesVerificationDetails)
      ?? toRecord(root.salesVerificationInfo)
      ?? {};

    const pick = (source: Record<string, unknown>, keys: string[]): Record<string, unknown> => {
      const result: Record<string, unknown> = {};
      for (const key of keys) {
        if (key in source) {
          result[key] = source[key];
        }
      }
      return result;
    };

    return JSON.stringify({
      salesVerificationTaskDetails: pick(rawTask, [
        'taskId', 'taskStatus', 'requestedBy', 'salesSource', 'wlttId', 'lrppdId',
      ]),
      salesParticularDetails: pick(rawParticulars, [
        'salesParticular', 'linkParticulars',
        'kitchenAge', 'kitchenSpecification', 'bathroomAge', 'bathroomSpecification',
        'glazing', 'heating', 'decorativeFinishes',
        'conditionScore', 'conditionCategory', 'particularNotes', 'padConfirmation',
      ]),
      salesVerificationDetails: pick(rawVerification, [
        'isSaleUseful', 'whyNotUseful', 'additionalNotes', 'remarks',
      ]),
    });
  }

  private updateSaleDetailsAccessState(): void {
    this.applySaleDetailsAccess(this._saleDetails);
    const qcAccess = this.resolveQcSectionAccess(this._saleDetails);
    this.saleDetailsCanSubmitQcOutcome = qcAccess.canSubmit;
    this.saleDetailsShowQcSection = qcAccess.showSection;
  }

  public async openQcLog(): Promise<void> {
    await this.handleAuditHistoryOpen('QC');
  }

  public async openAuditHistory(): Promise<void> {
    await this.handleAuditHistoryOpen('SL');
  }

  private async onTaskClick(taskId?: string, saleId?: string): Promise<void> {
    svtDebug.log('Runtime', 'onTaskClick', { taskId, saleId });
    const pcfViewSalesEnabled = isPcfViewSalesDetailsEnabled(this._context) || this.externalReadOnlyMode;
    const emitViewAction = !(pcfViewSalesEnabled && this.showPcfSaleDetails);
    const requestId = this.beginViewSaleRequest({ retainSaleDetails: pcfViewSalesEnabled && this.showPcfSaleDetails });

    if (!saleId) {
      this.finishViewSaleRequest(requestId, JSON.stringify(getEmptySaleRecord()), pcfViewSalesEnabled, emitViewAction);
      return;
    }

    let detailsPayload = '';
    try {
      const apiName = resolveConfiguredApiName(
        this._context,
        'viewSaleRecordApiName',
        CONTROL_CONFIG.viewSaleRecordApiName,
      );
      if (!apiName) {
        throw new Error('View sale record API name is not configured.');
      }

      const viewSaleApiType = resolveConfiguredApiType(
        this._context,
        'viewSaleRecordApiType',
        CONTROL_CONFIG.viewSaleRecordApiType ?? CONTROL_CONFIG.customApiType,
      );
      const { country, listYear } = resolveActiveRequestContext(
        this._context,
        this.managerJourneyActive,
        this.managerJourneyContext,
      );
      const viewSaleParams: Record<string, string> = { saleId };
      if (ENABLE_COUNTRY_LIST_YEAR_API_PARAMS) {
        if (country) viewSaleParams['country'] = country;
        if (listYear) viewSaleParams['listYear'] = listYear;
      }

      const rawPayload = await executeUnboundCustomApi<unknown>(
        this._context,
        apiName,
        viewSaleParams,
        { operationType: viewSaleApiType },
      );
      const payload = unwrapCustomApiPayload(rawPayload);
      const payloadRecord = this.tryGetSaleDetailsRecord(payload) ?? getEmptySaleRecord();
      const enrichedPayload = await this.enrichWithHereditamentActiveRequest(payloadRecord);
      detailsPayload = JSON.stringify(enrichedPayload);
    } catch (error) {
      console.warn('Failed to fetch SVT sale record.', error);
      detailsPayload = JSON.stringify(getEmptySaleRecord());
    }

    await this.ensureCaseworkerAccess();
    this.finishViewSaleRequest(requestId, detailsPayload, pcfViewSalesEnabled, emitViewAction);
  }

  private beginViewSaleRequest(options?: { retainSaleDetails?: boolean }): number {
    this.viewSaleRequestSeq += 1;
    const requestId = this.viewSaleRequestSeq;
    this.activeViewSaleRequestId = requestId;
    this.viewSalePending = true;
    if (!options?.retainSaleDetails) {
      this._saleDetails = '';
      this.saleDetailsReadOnly = false;
      this.saleDetailsReadOnlyMessage = undefined;
      this.saleDetailsCanSubmitQcOutcome = false;
      this.saleDetailsShowQcSection = false;
    }
    this._notifyOutputChanged();
    return requestId;
  }

  private finishViewSaleRequest(
    requestId: number,
    detailsPayload: string,
    showPcfDetails: boolean,
    emitViewAction: boolean,
  ): void {
    if (this.activeViewSaleRequestId !== requestId) {
      svtDebug.warn('Runtime', 'finishViewSaleRequest — stale request, ignoring', { requestId, activeId: this.activeViewSaleRequestId });
      return;
    }
    svtDebug.log('Runtime', 'finishViewSaleRequest', { requestId, showPcfDetails, emitViewAction, payloadLength: detailsPayload.length });
    this._saleDetails = preserveQcOutcomeDetails(detailsPayload, this._saleDetails);
    this.selectedSaleId = normalizeTextValue(resolveCurrentSaleIdFromDetails(this._saleDetails, this.selectedSaleId));
    this.selectedTaskId = normalizeTextValue(resolveCurrentTaskIdFromDetails(this._saleDetails, this.selectedTaskId));
    this.viewSalePending = false;
    this.showPcfSaleDetails = showPcfDetails;
    this.applySaleDetailsAccess(detailsPayload);
    const qcAccess = this.resolveQcSectionAccess(detailsPayload);
    this.saleDetailsCanSubmitQcOutcome = qcAccess.canSubmit;
    this.saleDetailsShowQcSection = qcAccess.showSection;
    if (emitViewAction) {
      this.emitAction(showPcfDetails ? 'viewSalePcf' : 'viewSale');
      return;
    }
    this._notifyOutputChanged();
  }

  private async handleAuditHistoryOpen(auditType: AuditType): Promise<void> {
    await this.fetchAuditHistory(auditType);
    this.emitAction(auditType === 'QC' ? 'viewQcLog' : 'viewAuditHistory');
  }

  private async fetchAuditHistory(auditType: AuditType): Promise<void> {
    svtDebug.log('Runtime', 'fetchAuditHistory', { auditType });
    const taskId = resolveTaskIdForAuditLogs(this._saleDetails, this.selectedTaskId);
    if (!taskId) {
      this._saleDetails = mergeAuditHistoryDetails(this._saleDetails, auditType, {
        taskId: '',
        auditHistory: [],
        errorMessage: 'Task ID is not available for audit lookup.',
      });
      this._notifyOutputChanged();
      return;
    }

    const apiName = resolveConfiguredApiName(this._context, 'auditLogsApiName', CONTROL_CONFIG.auditLogsApiName);
    if (!apiName) {
      this._saleDetails = mergeAuditHistoryDetails(this._saleDetails, auditType, {
        taskId,
        auditHistory: [],
        errorMessage: 'Audit logs API is not configured.',
      });
      this._notifyOutputChanged();
      return;
    }

    const customApiType = resolveConfiguredApiType(this._context, 'auditLogsApiType', CONTROL_CONFIG.auditLogsApiType);

    try {
      const rawPayload = await executeUnboundCustomApi<unknown>(
        this._context,
        apiName,
        { taskId, auditType },
        { operationType: customApiType },
      );

      const payload = unwrapCustomApiPayload(rawPayload);
      const payloadRecord = toRecord(payload) ?? {
        taskId,
        auditHistory: [],
      };
      this._saleDetails = mergeAuditHistoryDetails(this._saleDetails, auditType, payloadRecord);
    } catch (error) {
      console.warn(`Failed to fetch ${auditType} audit history.`, error);
      this._saleDetails = mergeAuditHistoryDetails(this._saleDetails, auditType, {
        taskId,
        auditHistory: [],
        errorMessage: `Failed to fetch ${auditType} audit history.`,
      });
    }

    this._notifyOutputChanged();
  }

  private async enrichWithHereditamentActiveRequest(details: Record<string, unknown>): Promise<Record<string, unknown>> {
    const hereditamentId = this.resolveHereditamentId(details);
    if (!hereditamentId) {
      return details;
    }

    const apiName = resolveConfiguredApiName(
      this._context,
      'hereditamentRelatedRequestsApiName',
      CONTROL_CONFIG.hereditamentRelatedRequestsApiName,
    );
    if (!apiName) {
      return details;
    }

    const customApiType = resolveConfiguredApiType(
      this._context,
      'hereditamentRelatedRequestsApiType',
      CONTROL_CONFIG.hereditamentRelatedRequestsApiType,
    );

    try {
      const rawPayload = await executeUnboundCustomApi<unknown>(
        this._context,
        apiName,
        { hereditamentId },
        { operationType: customApiType },
      );

      const response = unwrapCustomApiPayload(rawPayload);
      const responseRecord = toRecord(response);
      const hasActiveRequest = this.toBooleanFlag(responseRecord?.hereditamentActiveRequest);
      if (hasActiveRequest === undefined) {
        return details;
      }

      details.hereditamentActiveRequest = hasActiveRequest;
      details.activeRequestInVos = hasActiveRequest;
      details.isActiveRequestPresent = hasActiveRequest;

      const propertyAndBandingDetails = toRecord(details.propertyAndBandingDetails);
      if (propertyAndBandingDetails) {
        propertyAndBandingDetails.hereditamentActiveRequest = hasActiveRequest;
        propertyAndBandingDetails.activeRequestInVos = hasActiveRequest;
        propertyAndBandingDetails.isActiveRequestPresent = hasActiveRequest;
      }
    } catch (error) {
      console.warn('Failed to fetch hereditament related active-request status.', error);
    }

    return details;
  }

  private resolveHereditamentId(details: Record<string, unknown>): string {
    const candidates = [
      details.hereditamentId,
      details.suId,
      details.suid,
      toRecord(details.propertyAndBandingDetails)?.hereditamentId,
      toRecord(details.propertyAndBandingDetails)?.suId,
      toRecord(details.propertyAndBandingDetails)?.suid,
      toRecord(details.bandingInfo)?.hereditamentId,
      toRecord(details.bandingInfo)?.suId,
      toRecord(details.bandingInfo)?.suid,
    ];

    for (const candidate of candidates) {
      const normalized = normalizeGuidValue(normalizeTextValue(candidate));
      if (normalized) {
        return normalized;
      }
    }

    return '';
  }

  private toBooleanFlag(value: unknown): boolean | undefined {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      if (value === 1) return true;
      if (value === 0) return false;
      return undefined;
    }

    const normalized = normalizeTextValue(value).toLowerCase();
    if (!normalized) {
      return undefined;
    }

    if (['true', '1', 'yes', 'y'].includes(normalized)) {
      return true;
    }

    if (['false', '0', 'no', 'n'].includes(normalized)) {
      return false;
    }

    return undefined;
  }

  private tryGetSaleDetailsRecord(payload: unknown): Record<string, unknown> | undefined {
    if (typeof payload === 'string') {
      const trimmed = payload.trim();
      if (!trimmed) {
        return undefined;
      }
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        return toRecord(parsed);
      } catch {
        return undefined;
      }
    }

    return toRecord(payload);
  }

  private async ensureCaseworkerAccess(): Promise<boolean> {
    if (this.hasResolvedCaseworkerAccess) {
      return this.hasCaseworkerAccess;
    }

    this.caseworkerAccessRequest ??= this.resolveCaseworkerAccess();

    let resolvedSuccessfully = false;
    try {
      this.hasCaseworkerAccess = await this.caseworkerAccessRequest;
      resolvedSuccessfully = true;
    } catch (error) {
      console.warn('Failed to resolve caseworker access.', error);
      this.hasCaseworkerAccess = false;
      this.hasManagerAccess = false;
      this.hasQaAccess = false;
    } finally {
      this.hasResolvedCaseworkerAccess = resolvedSuccessfully;
      this.caseworkerAccessRequest = undefined;
    }

    return this.hasCaseworkerAccess;
  }

  private async resolveCaseworkerAccess(): Promise<boolean> {
    svtDebug.log('Runtime', 'resolveCaseworkerAccess — resolving user context');
    const apiName = resolveConfiguredApiName(
      this._context,
      'userContextApiName',
      CONTROL_CONFIG.userContextApiName,
    );
    if (!apiName) {
      this.hasManagerAccess = false;
      this.hasQaAccess = false;
      return false;
    }

    const customApiType = resolveConfiguredApiType(
      this._context,
      'userContextApiType',
      CONTROL_CONFIG.userContextApiType ?? CONTROL_CONFIG.customApiType,
    );

    const rawPayload = await executeUnboundCustomApi<unknown>(
      this._context,
      apiName,
      {},
      { operationType: customApiType },
    );
    const payload = unwrapCustomApiPayload(rawPayload);
    this.hasManagerAccess = this.hasManagerEvidence(payload);
    this.hasQaAccess = this.hasQaEvidence(payload);
    const hasCaseworker = this.hasCaseworkerEvidence(payload);

    // Extract Entra Object ID from user context response
    const root = this.toUserContextRecord(payload);
    const entraOid = typeof root.entraObjectId === 'string' ? root.entraObjectId : '';
    if (entraOid) {
      this._entraObjectId = entraOid;
    }

    svtDebug.log('Runtime', 'resolveCaseworkerAccess result', {
      hasCaseworker,
      hasManager: this.hasManagerAccess,
      hasQa: this.hasQaAccess,
      entraObjectId: this._entraObjectId,
      userId: resolveCurrentUserId(this._context),
      displayName: resolveCurrentUserDisplayName(this._context),
    });
    return hasCaseworker;
  }

  private hasCaseworkerEvidence(payload: unknown): boolean {
    const root = this.toUserContextRecord(payload);
    const persona = normalizeTextValue(root.svtPersona ?? root.persona).toLowerCase();
    if (persona === 'user' || persona === 'caseworker' || persona === 'svt user') {
      return true;
    }

    const matchedTeamName = normalizeTextValue(root.matchedTeamName).toLowerCase();
    if (CASEWORKER_TEAM_NAMES.has(matchedTeamName)) {
      return true;
    }

    const matchedRoleName = normalizeTextValue(root.matchedRoleName).toLowerCase();
    if (CASEWORKER_ROLE_NAMES.has(matchedRoleName)) {
      return true;
    }

    const matchedTeams = this.normalizeUserContextValues(root.matchedTeamNames);
    if (matchedTeams.some((team) => CASEWORKER_TEAM_NAMES.has(team))) {
      return true;
    }

    const matchedRoles = this.normalizeUserContextValues(root.matchedRoleNames);
    if (matchedRoles.some((role) => CASEWORKER_ROLE_NAMES.has(role))) {
      return true;
    }

    const explicitFlag = normalizeTextValue(root.hasCaseworkerAccess).toLowerCase();
    return explicitFlag === 'true' || explicitFlag === '1' || explicitFlag === 'yes';
  }

  private hasManagerEvidence(payload: unknown): boolean {
    const root = this.toUserContextRecord(payload);
    const persona = normalizeTextValue(root.svtPersona ?? root.persona).toLowerCase();
    if (persona === 'manager' || persona === 'svt manager') {
      return true;
    }

    const matchedTeamName = normalizeTextValue(root.matchedTeamName).toLowerCase();
    if (MANAGER_TEAM_NAMES.has(matchedTeamName)) {
      return true;
    }

    const matchedRoleName = normalizeTextValue(root.matchedRoleName).toLowerCase();
    if (MANAGER_ROLE_NAMES.has(matchedRoleName)) {
      return true;
    }

    const matchedTeams = this.normalizeUserContextValues(root.matchedTeamNames);
    if (matchedTeams.some((team) => MANAGER_TEAM_NAMES.has(team))) {
      return true;
    }

    const matchedRoles = this.normalizeUserContextValues(root.matchedRoleNames);
    if (matchedRoles.some((role) => MANAGER_ROLE_NAMES.has(role))) {
      return true;
    }

    const explicitFlag = normalizeTextValue(root.hasManagerAccess).toLowerCase();
    return explicitFlag === 'true' || explicitFlag === '1' || explicitFlag === 'yes';
  }


  private hasQaEvidence(payload: unknown): boolean {
    const root = this.toUserContextRecord(payload);
    const persona = normalizeTextValue(root.svtPersona ?? root.persona).toLowerCase();
    if (persona === 'qa' || persona === 'quality control' || persona === 'svt qa') {
      return true;
    }

    const matchedTeamName = normalizeTextValue(root.matchedTeamName).toLowerCase();
    if (QA_TEAM_NAMES.has(matchedTeamName)) {
      return true;
    }

    const matchedRoleName = normalizeTextValue(root.matchedRoleName).toLowerCase();
    if (QA_ROLE_NAMES.has(matchedRoleName)) {
      return true;
    }

    const matchedTeams = this.normalizeUserContextValues(root.matchedTeamNames);
    if (matchedTeams.some((team) => QA_TEAM_NAMES.has(team))) {
      return true;
    }

    const matchedRoles = this.normalizeUserContextValues(root.matchedRoleNames);
    if (matchedRoles.some((role) => QA_ROLE_NAMES.has(role))) {
      return true;
    }

    const explicitFlag = normalizeTextValue(root.hasQaAccess ?? root.hasQualityControlAccess).toLowerCase();
    return explicitFlag === 'true' || explicitFlag === '1' || explicitFlag === 'yes';
  }

  private toUserContextRecord(payload: unknown, depth = 0): Record<string, unknown> {
    if (depth > 4) {
      return {};
    }

    const record = toRecord(payload);
    if (record) {
      const nested = record.Result ?? record.result;
      const hasPersona = Object.prototype.hasOwnProperty.call(record, 'svtPersona')
        || Object.prototype.hasOwnProperty.call(record, 'persona');
      if (hasPersona || nested === undefined) {
        return record;
      }
      return this.toUserContextRecord(nested, depth + 1);
    }

    if (typeof payload === 'string') {
      const trimmed = payload.trim();
      if (!trimmed) {
        return {};
      }
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        return this.toUserContextRecord(parsed, depth + 1);
      } catch {
        return {};
      }
    }

    return {};
  }

  private normalizeUserContextValues(raw: unknown): string[] {
    if (Array.isArray(raw)) {
      return raw
        .map((value) => normalizeTextValue(value).toLowerCase())
        .filter((value) => value !== '');
    }

    const text = normalizeTextValue(raw);
    if (!text) {
      return [];
    }

    return text
      .split(/[;,|]/)
      .map((value) => value.trim().toLowerCase())
      .filter((value) => value !== '');
  }

  private normalizeTaskIdForModifyTask(taskId: string): string {
    const normalized = normalizeTextValue(taskId);
    if (!normalized) {
      return '';
    }

    const digitsOnly = normalized.replace(/\D/g, '');
    return digitsOnly || normalized;
  }
  private canEditAsAssignedCaseworker(detailsPayload: string): boolean {
    if (!this.hasCaseworkerAccess) {
      return false;
    }

    if (!this.isTaskStatusEditableByCaseworker(detailsPayload)) {
      return false;
    }

    return this.isSaleRecordAssignedToCurrentUser(detailsPayload);
  }

  private isTaskStatusEditableByCaseworker(detailsPayload: string): boolean {
    const status = this.resolveTaskStatusFromSaleRecord(detailsPayload);
    return EDITABLE_CASEWORKER_STATUSES.has(status);
  }


  private isTaskStatusEditableByQc(detailsPayload: string): boolean {
    const status = this.resolveTaskStatusFromSaleRecord(detailsPayload);
    return EDITABLE_QC_STATUSES.has(status);
  }

  private resolveTaskStatusFromSaleRecord(detailsPayload: string): string {
    const root = this.parseSaleRecordRoot(detailsPayload);
    const taskDetailsCandidates = [
      toRecord(root.salesVerificationTaskDetails),
      toRecord(root.taskDetails),
      root,
    ].filter((record): record is Record<string, unknown> => Boolean(record));

    const statusKeys = ['taskStatus', 'taskstatus', 'status'];

    for (const record of taskDetailsCandidates) {
      for (const key of statusKeys) {
        if (!Object.prototype.hasOwnProperty.call(record, key)) {
          continue;
        }

        const status = normalizeTextValue(record[key]).toLowerCase();
        if (status) {
          return status;
        }
      }
    }

    return '';
  }

  private isSaleRecordAssignedToCurrentUser(detailsPayload: string): boolean {
    const assignedToCandidates = this.extractAssignedToCandidates(detailsPayload)
      .map((value) => this.normalizeIdentityToken(value))
      .filter((value) => value !== '');
    if (assignedToCandidates.length === 0) {
      return false;
    }

    const currentUserTokens = this.resolveCurrentUserTokens();
    if (currentUserTokens.length === 0) {
      return false;
    }

    const assignedSet = new Set(assignedToCandidates);
    return currentUserTokens.some((token) => assignedSet.has(token));
  }


  private isSaleRecordQcAssignedToCurrentUser(detailsPayload: string): boolean {
    const qcAssignedCandidates = this.extractQcAssignedToCandidates(detailsPayload)
      .map((value) => this.normalizeIdentityToken(value))
      .filter((value) => value !== '');

    if (qcAssignedCandidates.length === 0 && this.isTaskStatusEditableByQc(detailsPayload)) {
      const fallbackAssigned = this.extractAssignedToCandidates(detailsPayload)
        .map((value) => this.normalizeIdentityToken(value))
        .filter((value) => value !== '');
      qcAssignedCandidates.push(...fallbackAssigned);
    }

    if (qcAssignedCandidates.length === 0) {
      return false;
    }

    const currentUserTokens = this.resolveCurrentUserTokens();
    if (currentUserTokens.length === 0) {
      return false;
    }

    const assignedSet = new Set(qcAssignedCandidates);
    return currentUserTokens.some((token) => assignedSet.has(token));
  }

  private resolveCurrentUserTokens(): string[] {
    const tokens = new Set<string>();
    this.addIdentityToken(tokens, resolveCurrentUserId(this._context));
    this.addIdentityToken(tokens, this._entraObjectId);
    this.addIdentityToken(tokens, resolveCurrentUserDisplayName(this._context));

    const contextSettings = this._context.userSettings as { userName?: string; userDisplayName?: string } | undefined;
    this.addIdentityToken(tokens, contextSettings?.userName);
    this.addIdentityToken(tokens, contextSettings?.userDisplayName);

    return Array.from(tokens);
  }

  private addIdentityToken(sink: Set<string>, value: unknown): void {
    const token = this.normalizeIdentityToken(value);
    if (token) {
      sink.add(token);
    }
  }

  private normalizeIdentityToken(value: unknown): string {
    const normalized = normalizeTextValue(value).toLowerCase();
    if (!normalized) {
      return '';
    }

    let start = 0;
    let end = normalized.length;

    while (start < end && normalized.charCodeAt(start) === 123) {
      start++;
    }
    while (end > start && normalized.charCodeAt(end - 1) === 125) {
      end--;
    }

    return normalized.slice(start, end);
  }

  private parseSaleRecordRoot(detailsPayload: string): Record<string, unknown> {
    if (!detailsPayload) {
      return {};
    }

    try {
      const parsed = JSON.parse(detailsPayload) as unknown;
      return toRecord(parsed) ?? {};
    } catch {
      return {};
    }
  }

  private resolveSaleDetailsAccess(detailsPayload: string): { readOnly: boolean; reason?: string } {
    const taskExists = this.hasTaskIdInSaleRecord(detailsPayload);
    const isUnassigned = this.isSaleRecordUnassigned(detailsPayload);
    const canEditAsCaseworker = taskExists && this.canEditAsAssignedCaseworker(detailsPayload);

    svtDebug.log('Runtime', 'resolveSaleDetailsAccess', {
      taskExists,
      isUnassigned,
      canEditAsCaseworker,
      hasCaseworkerAccess: this.hasCaseworkerAccess,
      hasManagerAccess: this.hasManagerAccess,
      hasQaAccess: this.hasQaAccess,
      isManagerContext: this.isManagerAssignmentContext(),
      taskStatus: this.resolveTaskStatusFromSaleRecord(detailsPayload),
    });

    if (canEditAsCaseworker) {
      return { readOnly: false };
    }

    if (!this.isManagerAssignmentContext()) {
      if (!taskExists) {
        return { readOnly: false };
      }

      if (this.hasCaseworkerAccess) {
        return {
          readOnly: true,
          reason: 'This task is read-only unless it is assigned to you and in status Assigned or Assigned QC Failed.',
        };
      }

      return { readOnly: true };
    }

    return {
      readOnly: true,
      reason: taskExists && isUnassigned
        ? 'This task is unassigned. Manager Assignment is view-only. Assign it to yourself to take ownership.'
        : undefined,
    };
  }

  private applySaleDetailsAccess(detailsPayload: string): void {
    const access = this.resolveSaleDetailsAccess(detailsPayload);
    this.saleDetailsReadOnly = this.externalReadOnlyMode || access.readOnly;
    this.saleDetailsReadOnlyMessage = this.externalReadOnlyMode ? EXTERNAL_READONLY_REASON : access.reason;
  }


  private resolveQcSectionAccess(detailsPayload: string): { canSubmit: boolean; showSection: boolean } {
    if (!this.hasQaAccess && !this.hasManagerAccess) {
      return { canSubmit: false, showSection: false };
    }

    const assignedToCurrentQcUser = this.isSaleRecordQcAssignedToCurrentUser(detailsPayload);
    if (!assignedToCurrentQcUser) {
      return { canSubmit: false, showSection: false };
    }

    if (!this.isTaskStatusEditableByQc(detailsPayload)) {
      return { canSubmit: false, showSection: true };
    }

    return { canSubmit: true, showSection: true };
  }

  private isManagerAssignmentContext(): boolean {
    const selectedKind = normalizeTextValue(this.selectedScreenKind).toLowerCase();
    if (selectedKind === 'managerassign') {
      return true;
    }

    const selectedTable = normalizeTextValue(this.selectedTableKey).toLowerCase();
    if (selectedTable === 'manager') {
      return true;
    }

    const contextParams = this._context.parameters as unknown as Record<string, { raw?: string }>;
    const contextTable = normalizeTextValue(contextParams.tableKey?.raw).toLowerCase();
    if (contextTable === 'manager') {
      return true;
    }

    const contextScreen = normalizeTextValue(contextParams.canvasScreenName?.raw).toLowerCase();
    return contextScreen.includes('manager') && contextScreen.includes('assignment');
  }

  private hasTaskIdInSaleRecord(detailsPayload: string): boolean {
    const taskId = resolveCurrentTaskIdFromDetails(detailsPayload, this.selectedTaskId);
    return hasDisplayText(taskId);
  }

  private isSaleRecordUnassigned(detailsPayload: string): boolean {
    const candidates = this.extractAssignedToCandidates(detailsPayload)
      .map((value) => normalizeTextValue(value))
      .filter((value) => hasDisplayText(value));
    return candidates.length === 0;
  }


  private extractQcAssignedToCandidates(detailsPayload: string): string[] {
    const values = new Set<string>();
    const root = this.parseSaleRecordRoot(detailsPayload);

    const taskDetailsCandidates = [
      toRecord(root.salesVerificationTaskDetails),
      toRecord(root.taskDetails),
      root,
    ].filter((record): record is Record<string, unknown> => Boolean(record));

    const qcAssignedKeys = [
      'qcAssignedTo',
      'qcassignedto',
      'assignedToQc',
      'assignedtoqc',
      'qcAssignedToUserId',
      'qcassignedtouserid',
      'qcAssignedToId',
      'qcassignedtoid',
      'qcAssignedToName',
      'qcassignedtoname',
      'qcAssignedToDisplayName',
      'qcassignedtodisplayname',
    ];

    for (const record of taskDetailsCandidates) {
      for (const key of qcAssignedKeys) {
        if (!Object.prototype.hasOwnProperty.call(record, key)) {
          continue;
        }
        this.collectIdentityValues(record[key], values);
      }
    }

    return Array.from(values);
  }

  private extractAssignedToCandidates(detailsPayload: string): string[] {
    const values = new Set<string>();
    const root = this.parseSaleRecordRoot(detailsPayload);

    const taskDetailsCandidates = [
      toRecord(root.salesVerificationTaskDetails),
      toRecord(root.taskDetails),
    ].filter((record): record is Record<string, unknown> => Boolean(record));

    const assignedToKeys = [
      'assignedTo',
      'assignedto',
      'assignedToUserId',
      'assignedtouserid',
      'assignedToId',
      'assignedtoid',
      'assignedToUser',
      'assignedtouser',
      'assignedToName',
      'assignedtoname',
      'assignedToUserName',
      'assignedtousername',
      'assignedToDisplayName',
      'assignedtodisplayname',
      'caseworkerAssignedTo',
      'caseworkerassignedto',
      'caseworkerAssignedToUserId',
      'caseworkerassignedtouserid',
      'caseworkerAssignedToId',
      'caseworkerassignedtoid',
      'caseworkerAssignedToName',
      'caseworkerassignedtoname',
      'caseworkerAssignedToDisplayName',
      'caseworkerassignedtodisplayname',
    ];

    for (const record of taskDetailsCandidates) {
      for (const key of assignedToKeys) {
        if (!Object.prototype.hasOwnProperty.call(record, key)) {
          continue;
        }
        this.collectIdentityValues(record[key], values);
      }
    }

    [
      'assignedTo',
      'assignedto',
      'assignedToName',
      'assignedtoname',
      'assignedToDisplayName',
      'assignedtodisplayname',
      'caseworkerAssignedTo',
      'caseworkerassignedto',
      'caseworkerAssignedToName',
      'caseworkerassignedtoname',
      'caseworkerAssignedToDisplayName',
      'caseworkerassignedtodisplayname',
    ].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(root, key)) {
        this.collectIdentityValues(root[key], values);
      }
    });

    return Array.from(values);
  }

  private collectIdentityValues(value: unknown, sink: Set<string>, depth = 0): void {
    if (depth > 3 || value === null || value === undefined) {
      return;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      const normalized = normalizeTextValue(value);
      if (normalized) {
        sink.add(normalized);
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => this.collectIdentityValues(entry, sink, depth + 1));
      return;
    }

    const record = toRecord(value);
    if (!record) {
      return;
    }

    const nestedKeys = [
      'id',
      'Id',
      'userId',
      'userid',
      'systemuserid',
      'name',
      'fullName',
      'fullname',
      'displayName',
      'displayname',
      'value',
    ];

    for (const key of nestedKeys) {
      if (!Object.prototype.hasOwnProperty.call(record, key)) {
        continue;
      }
      this.collectIdentityValues(record[key], sink, depth + 1);
    }
  }


  private emitAction(type: RuntimeActionType): void {
    svtDebug.log('Runtime', 'emitAction', { type, sequence: this.actionSequence + 1 });
    if (type === 'back') {
      this.selectedTaskId = '';
      this.selectedSaleId = '';
      this.selectedTaskIdsJson = '[]';
      this.selectedSaleIdsJson = '[]';
      this.selectedCount = 0;
    }
    this.actionType = type;
    this.actionSequence += 1;
    this.actionRequestId = `${this.actionSequence}-${Date.now()}`;
    this.backRequestId = this.actionRequestId;
    this._notifyOutputChanged();
  }
}

