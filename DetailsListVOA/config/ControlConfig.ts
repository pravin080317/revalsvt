import { MDA_APP_ID_BY_ENVIRONMENT } from './MdaAppIdConfig';

export const CONTROL_CONFIG = {
  // Environment-specific MDA app id for building main.aspx links.
  // Keep empty by default and provide via per-environment configuration.
  // Fallback parsing is attempted from host URLs when available.
  mdaAppId: '',
  // Per-environment fallback map when mdaAppId input/env var is unavailable.
  // Keys are Dataverse hosts (or full URLs) and values are MDA app ids.
  mdaAppIdByEnvironment: { ...MDA_APP_ID_BY_ENVIRONMENT } as Record<string, string>,
  apiBaseUrl: '',
  customApiName: 'voa_GetAllSalesRecord',
  customApiType: 'function',
  metadataApiName: 'voa_SvtGetSalesMetadata',
  metadataApiType: 'function',
  userContextApiName: 'voa_SvtGetUserContext',
  userContextApiType: 'function',
  viewSaleRecordApiName: 'voa_GetViewSaleRecordById',
  viewSaleRecordApiType: 'function',
  hereditamentRelatedRequestsApiName: 'voa_GetHereditamentRelatedRequests',
  hereditamentRelatedRequestsApiType: 'action',
  auditLogsApiName: 'voa_SvtGetAuditLogs',
  auditLogsApiType: 'action',
  manualTaskCreationApiName: 'voa_SvtManualTaskCreation',
  manualTaskCreationApiType: 'action',
  modifyTaskApiName: 'voa_SvtModifyTask',
  modifyTaskApiType: 'action',
  submitSalesVerificationApiName: 'voa_SvtSubmitSalesVerification',
  submitSalesVerificationApiType: 'action',
  enableCountryListYearApiParams: true,
  enablePcfViewSalesDetails: true,
  tableKey: 'sales',
  serverDrivenThreshold: 2000,
  taskAssignmentApiName: 'voa_SvtTaskAssignment',
  taskAssignmentApiType: 'action',
  submitQcRemarksApiName: 'voa_SvtSubmitQcRemarks',
  submitQcRemarksApiType: 'action',
  assignableUsersApiName: 'voa_SvtGetAssignableUsers',
  assignableUsersApiType: 'function',
  taskAssignment: {
    maxBatchSize: 500,
    allowedStatusesManager: [
      'New',
      'Assigned',
      'Assigned QC failed',
      'QC requested',
    ],
    allowedStatusesQc: [
      'QC requested',
      'Complete',
      'Assigned QC failed',
      'Assigned To QC',
      'Reassigned To QC',
    ],
    // Fallback for non-assignment screens if needed.
    allowedStatuses: [],
  },
};

