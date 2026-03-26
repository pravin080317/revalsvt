import * as React from 'react';
import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  Dropdown,
  IDropdownOption,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Spinner,
  SpinnerSize,
  Text,
  TextField,
} from '@fluentui/react';
import {
  PromotedMasterRecordViewModel,
  QcOutcomeActionPayload,
  SalesParticularDraftPayload,
  SalesVerificationActionPayload,
  SalesVerificationViewModel,
} from '../types';
import {
  getSalesVerificationMandatoryValidation,
  getCompleteSalesVerificationTaskActionRule,
  getSalesVerificationEditRule,
  SALES_PARTICULAR_EDITABLE_MANDATORY_FIELD_RULES,
  getSubmitForQcActionRule,
  getSubmitQcOutcomeActionRule,
} from '../rules/ViewSaleActionRules';

interface SalesVerificationSectionProps {
  model: SalesVerificationViewModel;
  taskStatus: string;
  salesParticularModel: SalesParticularDraftPayload;
  padConfirmationKey?: string;
  onCompleteTask?: (payload: SalesVerificationActionPayload) => void | Promise<void>;
  onSubmitForQc?: (payload: SalesVerificationActionPayload) => void | Promise<void>;
  onSubmitQcOutcome?: (payload: QcOutcomeActionPayload) => void | Promise<void>;
  promotedMasterRecord?: PromotedMasterRecordViewModel;
  readOnly?: boolean;
  canProgressTask?: boolean;
  canSubmitQcOutcome?: boolean;
  showQcSection?: boolean;
  isQcView?: boolean;
  qcAssignedTo?: string;
  currentUserDisplayName?: string;
  onReturnToTableAfterSubmit?: () => void;
  onCrossSectionValidationChange?: (errors: {
    salesParticularReviewStatusError?: string;
    salesParticularFieldErrors: Partial<Record<keyof SalesParticularDraftPayload, string>>;
    padConfirmationError?: string;
  }) => void;
}

const USEFUL_OPTIONS: IDropdownOption[] = [
  { key: 'yes', text: 'Yes' },
  { key: 'no', text: 'No' },
];

const WHY_NOT_OPTIONS: IDropdownOption[] = [
  { key: 'connected-parties', text: 'Connected parties' },
  { key: 'dilapidated-property', text: 'Dilapidated property' },
  { key: 'exchange-of-property', text: 'Exchange of property' },
  { key: 'includes-other-property', text: 'Includes other property' },
  { key: 'market-value-not-useful-specialist-property', text: 'Market value but not useful for modelling - Specialist property' },
  { key: 'market-value-not-useful-other', text: 'Market value but not useful for modelling - Other' },
  { key: 'not-market-value', text: 'Not market value' },
  { key: 'reflects-development-potential', text: 'Reflects development potential' },
  { key: 'sale-linked-to-incorrect-property', text: 'Sale linked to incorrect property' },
  { key: 'special-purchaser', text: 'Special purchaser' },
  { key: 'tenant-purchase', text: 'Tenant purchase' },
  { key: 'undivided-share', text: 'Undivided share' },
];


const QC_OUTCOME_OPTIONS: IDropdownOption[] = [
  { key: 'pass', text: 'Pass' },
  { key: 'fail', text: 'Fail' },
];

const toQcOutcomeKey = (value: string): string | undefined => {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'pass' || normalized === 'passed') {
    return 'pass';
  }

  if (normalized === 'fail' || normalized === 'failed') {
    return 'fail';
  }

  return undefined;
};

const toQcOutcomeValue = (value?: string): 'Pass' | 'Fail' | '' => {
  const normalized = (value ?? '').trim().toLowerCase();
  if (normalized === 'pass') {
    return 'Pass';
  }

  if (normalized === 'fail') {
    return 'Fail';
  }

  return '';
};

const resolveQcSubmitButtonText = (outcomeKey?: string): string => {
  if (outcomeKey === 'pass') { return 'Submit QC pass'; }
  if (outcomeKey === 'fail') { return 'Submit QC fail'; }
  return 'Submit QC outcome';
};

const isInlineQcValidationReason = (reason?: string): boolean => {
  if (!reason) {
    return false;
  }

  return reason === 'Select QC outcome before submitting.'
    || reason === 'Please provide QC remarks before submitting';
};

const SECTION_ERROR_HIGHLIGHT_CLASS = 'voa-section-error-highlight';
const SECTION_PARTICULARS_ID = 'section-particulars';
const SECTION_PAD_ID = 'section-pad';
const SECTION_VERIFICATION_ID = 'section-verification';

const trimValue = (value: string | undefined): string => (value ?? '').trim();

const renderRequiredLabel = (label: string, required: boolean): React.ReactNode => (
  <>
    {label}
    {required && (
      <>
        <span className="voa-required-marker" aria-hidden="true"> *</span>
        <span className="voa-visually-hidden"> (required)</span>
      </>
    )}
  </>
);

const toUsefulKey = (raw: string): string | undefined => {
  const normalized = raw.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  if (normalized === 'no' || normalized === 'notuseful' || normalized === 'not useful sale' || normalized === 'not useful') {
    return 'no';
  }

  if (normalized === 'yes' || normalized === 'useful' || normalized === 'useful sale' || normalized === 'investigate can use') {
    return 'yes';
  }

  return undefined;
};

const toUsefulValue = (key?: string): string => {
  if (!key) {
    return '';
  }
  const match = USEFUL_OPTIONS.find((option) => String(option.key) === key);
  return match?.text ?? key;
};

const toWhyKey = (raw: string): string | undefined => {
  const normalized = raw.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  const match = WHY_NOT_OPTIONS.find((option) => option.text.toLowerCase() === normalized || option.key.toString().toLowerCase() === normalized);
  return (match?.key as string | undefined) ?? undefined;
};

const toWhyValue = (key?: string): string => {
  if (!key) {
    return '';
  }
  const match = WHY_NOT_OPTIONS.find((option) => String(option.key) === key);
  return match?.text ?? key;
};

const getWhyOptions = (rawWhyNotUseful: string): IDropdownOption[] => {
  const trimmed = rawWhyNotUseful.trim();
  if (!trimmed) {
    return WHY_NOT_OPTIONS;
  }

  const exists = WHY_NOT_OPTIONS.some((option) => option.text.toLowerCase() === trimmed.toLowerCase());
  if (exists) {
    return WHY_NOT_OPTIONS;
  }

  return [{ key: trimmed, text: trimmed }, ...WHY_NOT_OPTIONS];
};

export const SalesVerificationSection: React.FC<SalesVerificationSectionProps> = ({
  model,
  taskStatus,
  salesParticularModel,
  padConfirmationKey,
  onCompleteTask,
  onSubmitForQc,
  onSubmitQcOutcome,
  promotedMasterRecord,
  readOnly = false,
  canProgressTask = false,
  canSubmitQcOutcome = false,
  showQcSection = false,
  isQcView = false,
  qcAssignedTo = '',
  currentUserDisplayName = '',
  onReturnToTableAfterSubmit,
  onCrossSectionValidationChange,
}) => {
  const [isSaleUsefulKey, setIsSaleUsefulKey] = React.useState<string | undefined>(toUsefulKey(model.isSaleUseful));
  const [whyNotUsefulKey, setWhyNotUsefulKey] = React.useState<string | undefined>(toWhyKey(model.whyNotUseful) ?? (model.whyNotUseful || undefined));
  const [additionalNotes, setAdditionalNotes] = React.useState(model.additionalNotes);
  const [isSaleUsefulError, setIsSaleUsefulError] = React.useState<string | undefined>(undefined);
  const [whyNotUsefulError, setWhyNotUsefulError] = React.useState<string | undefined>(undefined);
  const [mandatoryErrorMessages, setMandatoryErrorMessages] = React.useState<string[]>([]);
  const [busyAction, setBusyAction] = React.useState<'complete' | 'submit' | 'qclog' | 'qcsubmit' | undefined>(undefined);
  const [showSubmitForQcDialog, setShowSubmitForQcDialog] = React.useState(false);
  const [qcRemarks, setQcRemarks] = React.useState(model.remarks);
  const [submitForQcRemarksError, setSubmitForQcRemarksError] = React.useState<string | undefined>(undefined);
  const [qcOutcomeKey, setQcOutcomeKey] = React.useState<string | undefined>(toQcOutcomeKey(model.qcOutcome));
  const [qcOutcomeRemarks, setQcOutcomeRemarks] = React.useState(model.qcRemark);
  const [qcOutcomeSelectionError, setQcOutcomeSelectionError] = React.useState<string | undefined>(undefined);
  const [qcOutcomeRemarksError, setQcOutcomeRemarksError] = React.useState<string | undefined>(undefined);
  const [actionError, setActionError] = React.useState<string | undefined>(undefined);
  const [submitForQcDialogError, setSubmitForQcDialogError] = React.useState<string | undefined>(undefined);
  const [qcOutcomeDialogError, setQcOutcomeDialogError] = React.useState<string | undefined>(undefined);
  const [showConfirmQcOutcomeDialog, setShowConfirmQcOutcomeDialog] = React.useState(false);
  const [showCompleteConfirmDialog, setShowCompleteConfirmDialog] = React.useState(false);
  const [completeDialogSuccessMessage, setCompleteDialogSuccessMessage] = React.useState<string | undefined>(undefined);
  const [submitForQcDialogSuccessMessage, setSubmitForQcDialogSuccessMessage] = React.useState<string | undefined>(undefined);
  const [qcOutcomeDialogSuccessMessage, setQcOutcomeDialogSuccessMessage] = React.useState<string | undefined>(undefined);
  const returnToTableTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearReturnToTableTimeout = React.useCallback(() => {
    if (!returnToTableTimeoutRef.current) {
      return;
    }

    clearTimeout(returnToTableTimeoutRef.current);
    returnToTableTimeoutRef.current = undefined;
  }, []);

  const scheduleReturnToTable = React.useCallback((setMessage: React.Dispatch<React.SetStateAction<string | undefined>>, message: string) => {
    clearReturnToTableTimeout();
    setMessage(message);
    returnToTableTimeoutRef.current = setTimeout(() => {
      returnToTableTimeoutRef.current = undefined;
      onReturnToTableAfterSubmit?.();
    }, 1200);
  }, [clearReturnToTableTimeout, onReturnToTableAfterSubmit]);

  const clearCrossSectionFieldErrors = React.useCallback(() => {
    onCrossSectionValidationChange?.({
      salesParticularReviewStatusError: undefined,
      salesParticularFieldErrors: {},
      padConfirmationError: undefined,
    });
  }, [onCrossSectionValidationChange]);

  React.useEffect(() => {
    clearReturnToTableTimeout();
    setIsSaleUsefulKey(toUsefulKey(model.isSaleUseful));
    setWhyNotUsefulKey(toWhyKey(model.whyNotUseful) ?? (model.whyNotUseful || undefined));
    setAdditionalNotes(model.additionalNotes);
    setQcRemarks(model.remarks);
    setQcOutcomeKey(toQcOutcomeKey(model.qcOutcome));
    setQcOutcomeRemarks(model.qcRemark);
    setIsSaleUsefulError(undefined);
    setWhyNotUsefulError(undefined);
    setMandatoryErrorMessages([]);
    setSubmitForQcRemarksError(undefined);
    setQcOutcomeSelectionError(undefined);
    setQcOutcomeRemarksError(undefined);
    setActionError(undefined);
    setSubmitForQcDialogError(undefined);
    setQcOutcomeDialogError(undefined);
    setShowSubmitForQcDialog(false);
    setShowConfirmQcOutcomeDialog(false);
    setShowCompleteConfirmDialog(false);
    setCompleteDialogSuccessMessage(undefined);
    setSubmitForQcDialogSuccessMessage(undefined);
    setQcOutcomeDialogSuccessMessage(undefined);
    clearCrossSectionFieldErrors();
  }, [clearCrossSectionFieldErrors, clearReturnToTableTimeout, model]);

  React.useEffect(() => clearReturnToTableTimeout, [clearReturnToTableTimeout]);

  // Also clear mandatory errors when cross-section props change (fixes stale
  // "select the value" errors after Submit for QC → OK → refresh → resubmit).
  React.useEffect(() => {
    setMandatoryErrorMessages([]);
    clearCrossSectionFieldErrors();
  }, [clearCrossSectionFieldErrors, salesParticularModel, padConfirmationKey]);

  const isNotUseful = isSaleUsefulKey === 'no';

  // Guard against stale-closure scenarios: only show the inline error if the
  // corresponding field is actually still empty in the current render.
  const effectiveIsSaleUsefulError = isSaleUsefulError && !isSaleUsefulKey ? isSaleUsefulError : undefined;
  const effectiveWhyNotUsefulError = whyNotUsefulError && isNotUseful && !whyNotUsefulKey ? whyNotUsefulError : undefined;

  // Similarly, filter any top-level mandatory messages that no longer apply
  // (e.g. "Select whether the sale is useful" when the user has since picked Yes).
  // Section-prefixed messages (Sales Particulars:, Property Attribute Details:) are always kept.
  const derivedMandatoryMessages = React.useMemo(() =>
    mandatoryErrorMessages.filter((msg) => {
      if (msg.startsWith('Sales Particulars:') || msg.startsWith('Property Attribute Details:')) {
        return true;
      }
      // Top-level: re-evaluate whether the condition is still true
      if (!isSaleUsefulKey) return true; // saleUseful field is still empty
      if (isNotUseful && !whyNotUsefulKey) return true; // whyNotUseful field still empty
      return false;
    }),
    [mandatoryErrorMessages, isSaleUsefulKey, whyNotUsefulKey, isNotUseful],
  );

  const maxNotesLength = 2000;
  const notesRemaining = Math.max(0, maxNotesLength - additionalNotes.length);

  const whyNotOptions = React.useMemo(() => getWhyOptions(model.whyNotUseful), [model.whyNotUseful]);

  const qcRemarksMaxLength = 2000;
  const qcRemarksRemaining = Math.max(0, qcRemarksMaxLength - qcOutcomeRemarks.length);
  const qcOutcomeIsFail = qcOutcomeKey === 'fail';
  const qcRemarksRequiredMessage = 'Please provide QC remarks before submitting';
  const shouldShowQcRemarksRequiredMessage = canSubmitQcOutcome && qcOutcomeIsFail && !trimValue(qcOutcomeRemarks);
  const effectiveQcOutcomeRemarksError = qcOutcomeRemarksError ?? (shouldShowQcRemarksRequiredMessage ? qcRemarksRequiredMessage : undefined);
  const qcUndertakenByDisplay = trimValue(
    qcAssignedTo
    || model.qcReviewedBy,
  ) || '-';
  const showCaseworkerActions = !canSubmitQcOutcome && !isQcView;
  const qcSubmitButtonText = resolveQcSubmitButtonText(qcOutcomeKey);

  const payload: SalesVerificationActionPayload = React.useMemo(() => ({
    isSaleUseful: toUsefulValue(isSaleUsefulKey),
    whyNotUseful: isNotUseful ? toWhyValue(whyNotUsefulKey) : '',
    additionalNotes,
    remarks: model.remarks,
    promotedMasterRecord,
    salesParticularDraft: salesParticularModel,
    padConfirmationKey,
  }), [additionalNotes, isNotUseful, isSaleUsefulKey, model.remarks, padConfirmationKey, promotedMasterRecord, salesParticularModel, whyNotUsefulKey]);

  const busy = Boolean(busyAction);
  const salesVerificationEditRule = React.useMemo(
    () => getSalesVerificationEditRule({ busy, readOnly, canProgressTask }),
    [busy, canProgressTask, readOnly],
  );
  const completeTaskActionRule = React.useMemo(
    () => getCompleteSalesVerificationTaskActionRule({
      busy,
      readOnly,
      canProgressTask,
      hasHandler: Boolean(onCompleteTask),
      taskStatus,
    }),
    [busy, canProgressTask, onCompleteTask, readOnly, taskStatus],
  );
  const submitForQcActionRule = React.useMemo(
    () => getSubmitForQcActionRule({
      busy,
      readOnly,
      canProgressTask,
      hasHandler: Boolean(onSubmitForQc),
      taskStatus,
    }),
    [busy, canProgressTask, onSubmitForQc, readOnly, taskStatus],
  );
  const submitQcOutcomeActionRule = React.useMemo(
    () => getSubmitQcOutcomeActionRule({
      busy,
      hasHandler: Boolean(onSubmitQcOutcome),
      canSubmitQcOutcome,
      showQcSection,
      selectedOutcome: toQcOutcomeValue(qcOutcomeKey),
      remarks: qcOutcomeRemarks,
    }),
    [busy, canSubmitQcOutcome, onSubmitQcOutcome, qcOutcomeKey, qcOutcomeRemarks, showQcSection],
  );
  const qcSubmitButtonTitle = isInlineQcValidationReason(submitQcOutcomeActionRule.reason)
    ? undefined
    : submitQcOutcomeActionRule.reason;
  const editingDisabled = salesVerificationEditRule.disabled;

  const validate = React.useCallback((): boolean => {
    const validation = getSalesVerificationMandatoryValidation({
      isSaleUsefulKey,
      whyNotUsefulKey,
      padConfirmationKey,
      salesParticularModel,
    });

    setIsSaleUsefulError(validation.saleUsefulError);
    setWhyNotUsefulError(validation.whyNotUsefulError);
    setMandatoryErrorMessages(validation.mandatoryMessages);

    const crossSectionFieldErrors: Partial<Record<keyof SalesParticularDraftPayload, string>> = {};
    SALES_PARTICULAR_EDITABLE_MANDATORY_FIELD_RULES.forEach(({ key }) => {
      const error = validation.salesParticularFieldErrors[key];
      if (error) {
        crossSectionFieldErrors[key] = error;
      }
    });

    onCrossSectionValidationChange?.({
      salesParticularReviewStatusError: validation.salesParticularReviewStatusError,
      salesParticularFieldErrors: crossSectionFieldErrors,
      padConfirmationError: validation.padConfirmationError,
    });

    return validation.mandatoryMessages.length === 0;
  }, [
    isSaleUsefulKey,
    whyNotUsefulKey,
    onCrossSectionValidationChange,
    padConfirmationKey,
    salesParticularModel,
  ]);

  const handleComplete = React.useCallback(() => {
    if (!onCompleteTask || completeTaskActionRule.disabled) {
      return;
    }
    if (!validate()) {
      return;
    }
    setShowCompleteConfirmDialog(true);
  }, [completeTaskActionRule.disabled, onCompleteTask, validate]);

  const handleConfirmComplete = React.useCallback(async () => {
    if (!onCompleteTask || completeTaskActionRule.disabled) {
      return;
    }

    if (!validate()) {
      setShowCompleteConfirmDialog(false);
      return;
    }

    setActionError(undefined);
    setCompleteDialogSuccessMessage(undefined);
    setBusyAction('complete');
    try {
      await Promise.resolve(onCompleteTask(payload));
      setMandatoryErrorMessages([]);
      setIsSaleUsefulError(undefined);
      setWhyNotUsefulError(undefined);
      clearCrossSectionFieldErrors();
      scheduleReturnToTable(
        setCompleteDialogSuccessMessage,
        'Sales verification task completed successfully. Returning to table...',
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to complete sales verification task.');
    } finally {
      setBusyAction(undefined);
    }
  }, [clearCrossSectionFieldErrors, completeTaskActionRule.disabled, onCompleteTask, payload, scheduleReturnToTable, validate]);

  const handleCancelComplete = React.useCallback(() => {
    if (busyAction === 'complete' || completeDialogSuccessMessage) {
      return;
    }
    setShowCompleteConfirmDialog(false);
  }, [busyAction, completeDialogSuccessMessage]);

  const handleSubmitForQc = React.useCallback(() => {
    if (!onSubmitForQc || submitForQcActionRule.disabled) {
      return;
    }
    if (!validate()) {
      return;
    }

    setSubmitForQcRemarksError(undefined);
    setShowSubmitForQcDialog(true);
  }, [onSubmitForQc, submitForQcActionRule.disabled, validate]);

  const handleCancelSubmitForQc = React.useCallback(() => {
    if (busyAction === 'submit' || submitForQcDialogSuccessMessage) {
      return;
    }

    setShowSubmitForQcDialog(false);
    setSubmitForQcRemarksError(undefined);
  }, [busyAction, submitForQcDialogSuccessMessage]);

  const handleConfirmSubmitForQc = React.useCallback(async () => {
    if (!onSubmitForQc || submitForQcActionRule.disabled) {
      return;
    }

    if (!validate()) {
      setShowSubmitForQcDialog(false);
      return;
    }

    const normalizedRemarks = qcRemarks.trim();
    if (!normalizedRemarks) {
      setSubmitForQcRemarksError('Enter remarks before submitting for QC');
      return;
    }

    setSubmitForQcDialogError(undefined);
    setSubmitForQcDialogSuccessMessage(undefined);
    setBusyAction('submit');
    try {
      await Promise.resolve(onSubmitForQc({
        ...payload,
        remarks: normalizedRemarks,
      }));
      setSubmitForQcRemarksError(undefined);
      setMandatoryErrorMessages([]);
      setIsSaleUsefulError(undefined);
      setWhyNotUsefulError(undefined);
      clearCrossSectionFieldErrors();
      scheduleReturnToTable(
        setSubmitForQcDialogSuccessMessage,
        'Sales verification task submitted for QC successfully. Returning to table...',
      );
    } catch (err) {
      setSubmitForQcDialogError(err instanceof Error ? err.message : 'Failed to submit sales verification task for QC.');
    } finally {
      setBusyAction(undefined);
    }
  }, [clearCrossSectionFieldErrors, onSubmitForQc, payload, qcRemarks, scheduleReturnToTable, submitForQcActionRule.disabled, validate]);

  React.useEffect(() => {
    const highlightedSections = new Set<string>();

    if (mandatoryErrorMessages.some((error) => error.startsWith('Sales Particulars:'))) {
      highlightedSections.add(SECTION_PARTICULARS_ID);
    }

    if (mandatoryErrorMessages.some((error) => error.startsWith('Property Attribute Details:'))) {
      highlightedSections.add(SECTION_PAD_ID);
    }

    if ((isSaleUsefulError && !isSaleUsefulKey) || (whyNotUsefulError && isNotUseful && !whyNotUsefulKey)) {
      highlightedSections.add(SECTION_VERIFICATION_ID);
    }

    const sectionIds = [SECTION_PARTICULARS_ID, SECTION_PAD_ID, SECTION_VERIFICATION_ID];
    sectionIds.forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      if (!section) {
        return;
      }

      if (highlightedSections.has(sectionId)) {
        section.classList.add(SECTION_ERROR_HIGHLIGHT_CLASS);
      } else {
        section.classList.remove(SECTION_ERROR_HIGHLIGHT_CLASS);
      }
    });

    return () => {
      sectionIds.forEach((sectionId) => {
        const section = document.getElementById(sectionId);
        section?.classList.remove(SECTION_ERROR_HIGHLIGHT_CLASS);
      });
    };
  }, [isSaleUsefulError, isSaleUsefulKey, isNotUseful, mandatoryErrorMessages, whyNotUsefulError, whyNotUsefulKey]);


  const handleSubmitQcOutcome = React.useCallback(() => {
    if (!onSubmitQcOutcome || submitQcOutcomeActionRule.disabled) {
      return;
    }

    const normalizedOutcome = toQcOutcomeValue(qcOutcomeKey);
    const normalizedRemarks = qcOutcomeRemarks.trim();

    if (!normalizedOutcome) {
      setQcOutcomeSelectionError('Select QC outcome before submitting.');
      return;
    }

    if (normalizedOutcome === 'Fail' && !normalizedRemarks) {
      setQcOutcomeRemarksError(qcRemarksRequiredMessage);
      return;
    }

    setQcOutcomeSelectionError(undefined);
    setQcOutcomeRemarksError(undefined);
    setShowConfirmQcOutcomeDialog(true);
  }, [
    onSubmitQcOutcome,
    qcOutcomeKey,
    qcOutcomeRemarks,
    qcRemarksRequiredMessage,
    submitQcOutcomeActionRule.disabled,
  ]);

  const handleCancelQcOutcomeDialog = React.useCallback(() => {
    if (busyAction === 'qcsubmit' || qcOutcomeDialogSuccessMessage) {
      return;
    }
    setShowConfirmQcOutcomeDialog(false);
  }, [busyAction, qcOutcomeDialogSuccessMessage]);

  const handleConfirmQcOutcome = React.useCallback(async () => {
    if (!onSubmitQcOutcome || submitQcOutcomeActionRule.disabled) {
      return;
    }

    const normalizedOutcome = toQcOutcomeValue(qcOutcomeKey);
    if (!normalizedOutcome) {
      setShowConfirmQcOutcomeDialog(false);
      return;
    }
    const normalizedRemarks = qcOutcomeRemarks.trim();
    const reviewedBy = trimValue(qcAssignedTo)
      || trimValue(model.qcReviewedBy)
      || trimValue(currentUserDisplayName)
      || 'QC User';

    setQcOutcomeDialogError(undefined);
    setQcOutcomeDialogSuccessMessage(undefined);
    setBusyAction('qcsubmit');
    try {
      await Promise.resolve(onSubmitQcOutcome({
        qcOutcome: normalizedOutcome,
        qcRemark: normalizedRemarks,
        qcReviewedBy: reviewedBy,
      }));
      scheduleReturnToTable(
        setQcOutcomeDialogSuccessMessage,
        'QC outcome submitted successfully. Returning to table...',
      );
    } catch (err) {
      setQcOutcomeDialogError(err instanceof Error ? err.message : 'Failed to submit QC outcome.');
    } finally {
      setBusyAction(undefined);
    }
  }, [
    currentUserDisplayName,
    model.qcReviewedBy,
    onSubmitQcOutcome,
    qcAssignedTo,
    qcOutcomeKey,
    qcOutcomeRemarks,
    scheduleReturnToTable,
    submitQcOutcomeActionRule.disabled,
  ]);

  const scrollToSection = React.useCallback((error: string) => {
    let targetId = 'section-verification';
    if (error.startsWith('Sales Particulars:')) { targetId = 'section-particulars'; }
    else if (error.startsWith('Property Attribute Details:')) { targetId = 'section-pad'; }
    const el = document.getElementById(targetId);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }, []);

  return (
    <section className="voa-sale-details-card voa-sales-verification-card" aria-labelledby="sales-verification-heading">
      <div className="voa-sale-details-card__header">
        <Text as="h2" id="sales-verification-heading" variant="large" className="voa-sale-details-card__title">
          Sales Verification
        </Text>
        <Text className="voa-required-key">Fields marked with * are required</Text>
      </div>

      <div className="voa-sales-verification-layout">
        <div className="voa-sales-verification-fields">
          <div className="voa-sales-verification-row">
            <label htmlFor="voa-sale-useful" className="voa-sales-verification-row__label">{renderRequiredLabel('Is this sale useful?', true)}</label>
            <div className="voa-sales-verification-row__control">
              <Dropdown
                id="voa-sale-useful"
                placeholder="Select whether the sale is useful"
                selectedKey={isSaleUsefulKey}
                options={USEFUL_OPTIONS}
                disabled={editingDisabled}
                onChange={(_, option) => {
                  const nextKey = option?.key as string | undefined;
                  setIsSaleUsefulKey(nextKey);
                  setIsSaleUsefulError(undefined);
                  // Only remove the top-level saleUseful/whyNotUseful messages;
                  // preserve any Sales Particulars / PAD errors that are still relevant.
                  setMandatoryErrorMessages((prev) =>
                    prev.filter((msg) => msg.startsWith('Sales Particulars:') || msg.startsWith('Property Attribute Details:')),
                  );
                  clearCrossSectionFieldErrors();
                  if (nextKey !== 'no') {
                    setWhyNotUsefulKey(undefined);
                    setWhyNotUsefulError(undefined);
                  }
                }}
                ariaLabel="Is this sale useful"
                className={`voa-sales-verification-row__dropdown${effectiveIsSaleUsefulError ? ' voa-sales-verification-row__dropdown--error' : ''}`}
              />
              {effectiveIsSaleUsefulError && <span className="voa-sales-verification-row__error" role="alert">{effectiveIsSaleUsefulError}</span>}
            </div>
          </div>

          <div className="voa-sales-verification-row">
            <label htmlFor="voa-why-not-useful" className="voa-sales-verification-row__label">{renderRequiredLabel('Why is the sale not useful?', isNotUseful)}</label>
            <div className="voa-sales-verification-row__control">
              <Dropdown
                id="voa-why-not-useful"
                placeholder="Select why the sale is not useful"
                selectedKey={whyNotUsefulKey}
                options={whyNotOptions}
                disabled={editingDisabled || !isNotUseful}
                onChange={(_, option) => {
                  setWhyNotUsefulKey(option?.key as string | undefined);
                  setWhyNotUsefulError(undefined);
                  setMandatoryErrorMessages((prev) =>
                    prev.filter((msg) => msg.startsWith('Sales Particulars:') || msg.startsWith('Property Attribute Details:')),
                  );
                  clearCrossSectionFieldErrors();
                }}
                ariaLabel="Why is the sale not useful"
                className={`voa-sales-verification-row__dropdown${effectiveWhyNotUsefulError ? ' voa-sales-verification-row__dropdown--error' : ''}`}
              />
              {effectiveWhyNotUsefulError && <span className="voa-sales-verification-row__error" role="alert">{effectiveWhyNotUsefulError}</span>}
            </div>
          </div>
        </div>

        <div className="voa-sales-verification-notes">
          <label htmlFor="voa-additional-notes" className="voa-sales-verification-notes__label">Additional Notes</label>
          <TextField
            id="voa-additional-notes"
            value={additionalNotes}
            placeholder="Enter additional notes"
            multiline
            rows={5}
            maxLength={maxNotesLength}
            disabled={editingDisabled}
            onChange={(_, nextValue) => setAdditionalNotes((nextValue ?? '').slice(0, maxNotesLength))}
            ariaLabel="Additional Notes"
            className="voa-sales-verification-notes__field"
          />
          <div className="voa-sales-verification-notes__count" aria-live="polite">
            Character(s) remaining: {notesRemaining.toLocaleString('en-GB')}
          </div>
        </div>
      </div>

      {actionError && (
        <MessageBar
          messageBarType={MessageBarType.error}
          className="voa-sales-verification-mandatory"
          role="alert"
          onDismiss={() => setActionError(undefined)}
          dismissButtonAriaLabel="Close"
        >
          {actionError}
        </MessageBar>
      )}

      {derivedMandatoryMessages.length > 0 && (
        <MessageBar
          messageBarType={MessageBarType.warning}
          className="voa-sales-verification-mandatory"
          role="alert"
          onDismiss={() => setMandatoryErrorMessages([])}
          dismissButtonAriaLabel="Close"
        >
          <strong>Please complete the following mandatory fields:</strong>
          <ul className="voa-sales-verification-mandatory__list">
            {derivedMandatoryMessages.map((error) => (
              <li key={error}>
                <button type="button" className="voa-error-section-link" onClick={() => scrollToSection(error)}>
                  {error}
                </button>
              </li>
            ))}
          </ul>
        </MessageBar>
      )}

      {showCaseworkerActions && (
        <div className="voa-sales-verification-actions" role="group" aria-label="Sales verification actions">
          <DefaultButton
            text="Complete Sales Verification Task"
            ariaLabel="Complete Sales Verification Task"
            className="voa-sales-verification-action-btn"
            disabled={completeTaskActionRule.disabled}
            title={completeTaskActionRule.reason}
            onClick={handleComplete}
          />
          <DefaultButton
            text="Submit Sales Verification Task for QC"
            ariaLabel="Submit Sales Verification Task for QC"
            className="voa-sales-verification-action-btn"
            disabled={submitForQcActionRule.disabled}
            title={submitForQcActionRule.reason}
            onClick={() => { void handleSubmitForQc(); }}
          />
          {(busyAction === 'complete' || busyAction === 'submit') && (
            <div role="status" aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Spinner size={SpinnerSize.small} aria-hidden />
              <Text variant="small">{busyAction === 'complete' ? 'Completing task...' : 'Submitting for QC...'}</Text>
            </div>
          )}
        </div>
      )}

      {showQcSection && (
        <section className="voa-sales-verification-qc-section" aria-label="Quality Control">
          <Text as="h3" variant="mediumPlus" className="voa-sales-verification-qc-section__title"
            title="QC review of the caseworker's sales verification decision">
            Quality Control
          </Text>

          <div className="voa-sales-verification-row">
            <label htmlFor="voa-qc-undertaken-by" className="voa-sales-verification-row__label">QC undertaken by</label>
            <div className="voa-sales-verification-row__control">
              <TextField
                id="voa-qc-undertaken-by"
                value={qcUndertakenByDisplay}
                readOnly
                disabled
                ariaLabel="QC undertaken by"
              />
            </div>
          </div>

          <div className="voa-sales-verification-row">
            <label htmlFor="voa-qc-outcome" className="voa-sales-verification-row__label">{renderRequiredLabel('QC outcome', true)}</label>
            <div className="voa-sales-verification-row__control">
              <Dropdown
                id="voa-qc-outcome"
                placeholder="Select Outcome"
                selectedKey={qcOutcomeKey}
                options={QC_OUTCOME_OPTIONS}
                disabled={!canSubmitQcOutcome || busy}
                onChange={(_, option) => {
                  setQcOutcomeKey(option?.key as string | undefined);
                  setQcOutcomeSelectionError(undefined);
                  setQcOutcomeRemarksError(undefined);
                }}
                ariaLabel="QC outcome"
                className={`voa-sales-verification-row__dropdown${qcOutcomeSelectionError ? ' voa-sales-verification-row__dropdown--error' : ''}`}
              />
              {qcOutcomeSelectionError && (
                <span className="voa-sales-verification-row__error" role="alert">{qcOutcomeSelectionError}</span>
              )}
            </div>
          </div>

          <div className="voa-sales-verification-row voa-sales-verification-row--top">
            <label htmlFor="voa-qc-remarks" className="voa-sales-verification-row__label">{renderRequiredLabel('QC remarks', qcOutcomeIsFail)}</label>
            <div className="voa-sales-verification-row__control">
              <TextField
                id="voa-qc-remarks"
                value={qcOutcomeRemarks}
                placeholder="Enter QC remarks"
                multiline
                rows={4}
                maxLength={qcRemarksMaxLength}
                disabled={!canSubmitQcOutcome || busy}
                required={qcOutcomeIsFail}
                errorMessage={effectiveQcOutcomeRemarksError}
                onChange={(_, nextValue) => {
                  setQcOutcomeRemarks((nextValue ?? '').slice(0, qcRemarksMaxLength));
                  setQcOutcomeRemarksError(undefined);
                }}
                ariaLabel="QC remarks"
                className={`voa-sales-verification-notes__field${effectiveQcOutcomeRemarksError ? ' voa-sales-verification-notes__field--error' : ''}`}
              />
              <div className="voa-sales-verification-notes__count" aria-live="polite">
                Character(s) remaining: {qcRemarksRemaining.toLocaleString('en-GB')}
              </div>
            </div>
          </div>

          <div className="voa-sales-verification-qc-section__actions" role="group" aria-label="Quality control actions">
            <DefaultButton
              text={qcSubmitButtonText}
              ariaLabel={qcSubmitButtonText}
              className="voa-sales-verification-action-btn"
              disabled={submitQcOutcomeActionRule.disabled}
              title={qcSubmitButtonTitle}
              onClick={handleSubmitQcOutcome}
            />
            {busyAction === 'qcsubmit' && (
              <div role="status" aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Spinner size={SpinnerSize.small} aria-hidden />
                <Text variant="small">Submitting QC outcome...</Text>
              </div>
            )}
          </div>
        </section>
      )}

      <Dialog
        hidden={!showCompleteConfirmDialog}
        onDismiss={handleCancelComplete}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Complete Sales Verification Task',
          subText: 'Are you sure you want to complete this task? This action cannot be undone.',
        }}
        modalProps={{ isBlocking: true, className: 'voa-confirm-dialog' }}
        minWidth={480}
        maxWidth={560}
      >
        {completeDialogSuccessMessage && (
          <MessageBar
            messageBarType={MessageBarType.success}
            role="status"
            dismissButtonAriaLabel="Close"
            styles={{ root: { marginBottom: 8 } }}
          >
            {completeDialogSuccessMessage}
          </MessageBar>
        )}
        <DialogFooter>
          {busyAction === 'complete' && !completeDialogSuccessMessage && (
            <div role="status" aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}>
              <Spinner size={SpinnerSize.small} aria-hidden />
              <Text variant="small">Completing task...</Text>
            </div>
          )}
          <PrimaryButton
            text={completeDialogSuccessMessage ? 'Returning...' : busyAction === 'complete' ? 'Completing...' : 'Complete'}
            ariaLabel="Confirm complete sales verification task"
            disabled={busyAction === 'complete' || Boolean(completeDialogSuccessMessage)}
            onClick={() => { void handleConfirmComplete(); }}
          />
          <DefaultButton
            text="Cancel"
            ariaLabel="Cancel complete sales verification task"
            disabled={busyAction === 'complete' || Boolean(completeDialogSuccessMessage)}
            onClick={handleCancelComplete}
          />
        </DialogFooter>
      </Dialog>

      <Dialog
        hidden={!showConfirmQcOutcomeDialog}
        onDismiss={handleCancelQcOutcomeDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Submit QC Outcome',
          subText: 'Are you sure you want to submit this QC outcome? This action cannot be undone.',
        }}
        modalProps={{ isBlocking: true, className: 'voa-confirm-dialog' }}
        minWidth={480}
        maxWidth={560}
      >
        {qcOutcomeDialogSuccessMessage && (
          <MessageBar
            messageBarType={MessageBarType.success}
            role="status"
            dismissButtonAriaLabel="Close"
            styles={{ root: { marginBottom: 8 } }}
          >
            {qcOutcomeDialogSuccessMessage}
          </MessageBar>
        )}
        {qcOutcomeDialogError && (
          <MessageBar
            messageBarType={MessageBarType.error}
            role="alert"
            onDismiss={() => setQcOutcomeDialogError(undefined)}
            dismissButtonAriaLabel="Close"
            styles={{ root: { marginBottom: 8 } }}
          >
            {qcOutcomeDialogError}
          </MessageBar>
        )}
        <DialogFooter>
          {busyAction === 'qcsubmit' && !qcOutcomeDialogSuccessMessage && (
            <div role="status" aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}>
              <Spinner size={SpinnerSize.small} aria-hidden />
              <Text variant="small">Submitting QC outcome...</Text>
            </div>
          )}
          <PrimaryButton
            text={qcOutcomeDialogSuccessMessage ? 'Returning...' : busyAction === 'qcsubmit' ? 'Submitting...' : 'Confirm'}
            ariaLabel="Confirm QC outcome submission"
            disabled={busyAction === 'qcsubmit' || Boolean(qcOutcomeDialogSuccessMessage)}
            onClick={() => { void handleConfirmQcOutcome(); }}
          />
          <DefaultButton
            text="Cancel"
            ariaLabel="Cancel QC outcome submission"
            disabled={busyAction === 'qcsubmit' || Boolean(qcOutcomeDialogSuccessMessage)}
            onClick={handleCancelQcOutcomeDialog}
          />
        </DialogFooter>
      </Dialog>

      <Dialog
        hidden={!showSubmitForQcDialog}
        onDismiss={handleCancelSubmitForQc}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Submit Sales Verification Task for QC',
          subText: 'Remarks are mandatory before submitting this task for Quality Control.',
        }}
        modalProps={{ isBlocking: true, className: 'voa-confirm-dialog' }}
        minWidth={560}
        maxWidth={640}
      >
        <TextField
          id="voa-submit-qc-remarks"
          label="Remarks"
          value={qcRemarks}
          multiline
          rows={6}
          required
          errorMessage={submitForQcRemarksError}
          disabled={busyAction === 'submit' || Boolean(submitForQcDialogSuccessMessage)}
          onChange={(_, nextValue) => {
            setQcRemarks(nextValue ?? '');
            setSubmitForQcRemarksError(undefined);
          }}
        />
        {submitForQcDialogSuccessMessage && (
          <MessageBar
            messageBarType={MessageBarType.success}
            role="status"
            dismissButtonAriaLabel="Close"
            styles={{ root: { marginBottom: 8 } }}
          >
            {submitForQcDialogSuccessMessage}
          </MessageBar>
        )}
        {submitForQcDialogError && (
          <MessageBar
            messageBarType={MessageBarType.error}
            role="alert"
            onDismiss={() => setSubmitForQcDialogError(undefined)}
            dismissButtonAriaLabel="Close"
            styles={{ root: { marginBottom: 8 } }}
          >
            {submitForQcDialogError}
          </MessageBar>
        )}
        <DialogFooter>
          {busyAction === 'submit' && !submitForQcDialogSuccessMessage && (
            <div role="status" aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}>
              <Spinner size={SpinnerSize.small} aria-hidden />
              <Text variant="small">Submitting for QC...</Text>
            </div>
          )}
          <PrimaryButton
            text={submitForQcDialogSuccessMessage ? 'Returning...' : busyAction === 'submit' ? 'Submitting...' : 'Submit for QC'}
            ariaLabel="Submit sales verification task for quality control"
            disabled={busyAction === 'submit' || Boolean(submitForQcDialogSuccessMessage)}
            onClick={() => { void handleConfirmSubmitForQc(); }}
          />
          <DefaultButton
            text="Cancel"
            ariaLabel="Cancel submit for quality control"
            disabled={busyAction === 'submit' || Boolean(submitForQcDialogSuccessMessage)}
            onClick={handleCancelSubmitForQc}
          />
        </DialogFooter>
      </Dialog>
    </section>
  );
};

SalesVerificationSection.displayName = 'SalesVerificationSection';
