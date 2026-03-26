import * as React from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react';
import { IInputs } from '../../generated/ManifestTypes';
import { PCFContext } from '../context/PCFContext';
import { DetailsListHost } from '../DetailsListHost/DetailsListHost';
import { ManagerJourneyShell } from '../HomeShell/ManagerJourneyShell';
import { SaleDetailsShell } from '../SaleDetailsShell/SaleDetailsShell';
import { QcOutcomeActionPayload, SalesVerificationActionPayload, SharePointCatalogChunks } from '../SaleDetailsShell/types';

interface DetailsListControlShellProps {
  context: ComponentFramework.Context<IInputs>;
  useManagerJourney: boolean;
  pcfViewSalesEnabled: boolean;
  showPcfDetails: boolean;
  saleDetailsJson: string;
  saleDetailsReadOnly: boolean;
  saleDetailsReadOnlyReason?: string;
  saleDetailsCanCreateManualTask: boolean;
  saleDetailsCanModifyTask: boolean;
  saleDetailsCanProgressTask: boolean;
  saleDetailsCanSubmitQcOutcome: boolean;
  saleDetailsShowQcSection: boolean;
  activeWorkspaceName: string;
  currentUserDisplayName: string;
  loading: boolean;
  entraObjectId?: string;
  requestContext: {
    country: string;
    listYear: string;
  };
  sharePointCatalogChunks: SharePointCatalogChunks;
  fxEnvironmentUrl: string;
  vmsBaseUrl: string;
  onRowInvoke: (args: { taskId?: string; saleId?: string; screenKind?: string; tableKey?: string }) => void | Promise<void>;
  onSelectionChange: (args: {
    taskId?: string;
    saleId?: string;
    selectedTaskIds?: string[];
    selectedSaleIds?: string[];
  }) => void;
  onSelectionCountChange: (count: number) => void;
  onBackToCanvas: () => void;
  onContextChange: (args: { country: string; listYear: string }) => void;
  onDetailsBack: () => void;
  onReturnToTableAfterSubmit: () => void;
  onDetailsRefresh: () => Promise<void>;
  onCreateManualTask: (saleId: string) => Promise<void>;
  onModifySvtTask: () => Promise<void>;
  onCompleteSalesVerificationTask: (payload: SalesVerificationActionPayload) => void | Promise<void>;
  onSubmitSalesVerificationTaskForQc: (payload: SalesVerificationActionPayload) => void | Promise<void>;
  onSubmitQcOutcome: (payload: QcOutcomeActionPayload) => void | Promise<void>;
  onOpenQcLog: () => Promise<void>;
  onOpenAuditHistory: () => Promise<void>;
  submitSuccessMessage?: string;
  onDismissSubmitSuccess?: () => void;
}

export const DetailsListControlShell: React.FC<DetailsListControlShellProps> = ({
  context,
  useManagerJourney,
  pcfViewSalesEnabled,
  showPcfDetails,
  saleDetailsJson,
  saleDetailsReadOnly,
  saleDetailsReadOnlyReason,
  saleDetailsCanCreateManualTask,
  saleDetailsCanModifyTask,
  saleDetailsCanProgressTask,
  saleDetailsCanSubmitQcOutcome,
  saleDetailsShowQcSection,
  activeWorkspaceName,
  currentUserDisplayName,
  entraObjectId,
  loading,
  requestContext,
  sharePointCatalogChunks,
  fxEnvironmentUrl,
  vmsBaseUrl,
  onRowInvoke,
  onSelectionChange,
  onSelectionCountChange,
  onBackToCanvas,
  onContextChange,
  onDetailsBack,
  onReturnToTableAfterSubmit,
  onDetailsRefresh,
  onCreateManualTask,
  onModifySvtTask,
  onCompleteSalesVerificationTask,
  onSubmitSalesVerificationTaskForQc,
  onSubmitQcOutcome,
  onOpenQcLog,
  onOpenAuditHistory,
  submitSuccessMessage,
  onDismissSubmitSuccess,
}) => {
  const sharedHostProps = React.useMemo(
    () => ({
      context,
      onRowInvoke,
      onSelectionChange,
      onSelectionCountChange,
    }),
    [context, onRowInvoke, onSelectionChange, onSelectionCountChange],
  );

  const [userDisplayNameMap, setUserDisplayNameMap] = React.useState<Record<string, string>>({});
  const handleUserDisplayNameMapChange = React.useCallback((map: Record<string, string>) => {
    setUserDisplayNameMap(map);
  }, []);

  // Bump refreshNonce when returning from details so the grid re-fetches data.
  const [refreshNonce, setRefreshNonce] = React.useState(0);
  const prevShowPcfDetailsRef = React.useRef(showPcfDetails);
  React.useEffect(() => {
    if (prevShowPcfDetailsRef.current && !showPcfDetails) {
      setRefreshNonce((n) => n + 1);
    }
    prevShowPcfDetailsRef.current = showPcfDetails;
  }, [showPcfDetails]);

  const gridElement = React.useMemo(
    () => (
      useManagerJourney
        ? (
          <ManagerJourneyShell
            {...sharedHostProps}
            initialCountry={requestContext.country}
            initialListYear={requestContext.listYear}
            onContextChange={onContextChange}
            refreshNonce={refreshNonce}
            entraObjectId={entraObjectId}
          />
        ) : (
          <DetailsListHost
            {...sharedHostProps}
            onBackRequested={onBackToCanvas}
            countryOverride={requestContext.country}
            listYearOverride={requestContext.listYear}
            onUserDisplayNameMapChange={handleUserDisplayNameMapChange}
            refreshNonce={refreshNonce}
            entraObjectId={entraObjectId}
          />
        )
    ),
    [handleUserDisplayNameMapChange, onBackToCanvas, onContextChange, refreshNonce, requestContext.country, requestContext.listYear, sharedHostProps, useManagerJourney],
  );

  const detailElement = React.useMemo(
    () => (
      <SaleDetailsShell
        saleDetailsJson={saleDetailsJson}
        sharePointCatalogChunks={sharePointCatalogChunks}
        fxEnvironmentUrl={fxEnvironmentUrl}
        vmsBaseUrl={vmsBaseUrl}
        readOnly={saleDetailsReadOnly}
        readOnlyReason={saleDetailsReadOnlyReason}
        canCreateManualTask={saleDetailsCanCreateManualTask}
        canModifyTask={saleDetailsCanModifyTask}
        canProgressTask={saleDetailsCanProgressTask}
        canSubmitQcOutcome={saleDetailsCanSubmitQcOutcome}
        showQcSection={saleDetailsShowQcSection}
        activeWorkspaceName={activeWorkspaceName}
        country={requestContext.country}
        listYear={requestContext.listYear}
        currentUserDisplayName={currentUserDisplayName}
        loading={loading}
        userLookup={userDisplayNameMap}
        onBack={onDetailsBack}
        onReturnToTableAfterSubmit={onReturnToTableAfterSubmit}
        onRefresh={onDetailsRefresh}
        onCreateManualTask={onCreateManualTask}
        onModifySvtTask={onModifySvtTask}
        onCompleteSalesVerificationTask={onCompleteSalesVerificationTask}
        onSubmitSalesVerificationTaskForQc={onSubmitSalesVerificationTaskForQc}
        onSubmitQcOutcome={onSubmitQcOutcome}
        onOpenQcLog={onOpenQcLog}
        onOpenAuditHistory={onOpenAuditHistory}
      />
    ),
    [
      loading,
      onCompleteSalesVerificationTask,
      onCreateManualTask,
      onModifySvtTask,
      onDetailsBack,
      onReturnToTableAfterSubmit,
      onDetailsRefresh,
      onOpenAuditHistory,
      onOpenQcLog,
      onSubmitSalesVerificationTaskForQc,
      onSubmitQcOutcome,
      saleDetailsJson,
      sharePointCatalogChunks,
      fxEnvironmentUrl,
      vmsBaseUrl,
      saleDetailsReadOnly,
      saleDetailsReadOnlyReason,
      saleDetailsCanCreateManualTask,
      saleDetailsCanModifyTask,
      saleDetailsCanProgressTask,
      saleDetailsCanSubmitQcOutcome,
      saleDetailsShowQcSection,
      currentUserDisplayName,
      userDisplayNameMap,
      requestContext.country,
      requestContext.listYear,
    ],
  );

  // Auto-dismiss the success notification after 5 seconds
  React.useEffect(() => {
    if (!submitSuccessMessage) return;
    const timer = setTimeout(() => {
      onDismissSubmitSuccess?.();
    }, 5000);
    return () => clearTimeout(timer);
  }, [submitSuccessMessage, onDismissSubmitSuccess]);

  return (
    <PCFContext.Provider value={context}>
      <>
        <div style={{ display: showPcfDetails ? 'none' : 'block', height: '100%' }}>
          {submitSuccessMessage && (
            <div className="voa-submit-success-banner" role="status" aria-live="polite">
              <MessageBar
                messageBarType={MessageBarType.success}
                onDismiss={onDismissSubmitSuccess}
                dismissButtonAriaLabel="Dismiss"
                style={{ marginBottom: 8 }}
              >
                {submitSuccessMessage}
              </MessageBar>
            </div>
          )}
          {gridElement}
        </div>
        {pcfViewSalesEnabled ? (
          <div
            className={showPcfDetails ? 'voa-details-view-wrap voa-details-view-wrap--active' : 'voa-details-view-wrap'}
            style={{ display: showPcfDetails ? 'block' : 'none', height: '100%' }}
          >
            {detailElement}
          </div>
        ) : null}
      </>
    </PCFContext.Provider>
  );
};










