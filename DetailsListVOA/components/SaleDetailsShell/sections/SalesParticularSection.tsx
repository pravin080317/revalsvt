import * as React from 'react';
import {
  ChoiceGroup,
  DefaultButton,
  IChoiceGroupOption,
  IDropdownOption,
  Text,
  TextField,
  TooltipHost,
} from '@fluentui/react';
import {
  SalesParticularAttributeKey,
  SalesParticularReviewStatus,
  SalesParticularScoringModelRow,
  SalesParticularViewModel,
  SalesParticularDraftPayload,
} from '../types';
import { SalesParticularDropdownRow } from '../shared/SalesParticularDropdownRow';
import { getSalesParticularCalculateActionRule } from '../rules/ViewSaleActionRules';

interface SalesParticularSectionProps {
  model: SalesParticularViewModel;
  onOpenReference?: (attributeKey: string) => void;
  onDraftChange?: (draft: SalesParticularDraftPayload) => void;
  readOnly?: boolean;
  externalFieldErrors?: Partial<Record<SalesParticularAttributeKey, string>>;
  externalReviewStatusError?: string;
}

interface SalesParticularValidationErrors extends Partial<Record<SalesParticularAttributeKey, string>> {
  reviewStatus?: string;
}

const REVIEW_OPTIONS: IChoiceGroupOption[] = [
  { key: 'details-available', text: 'Details available' },
  { key: 'details-not-available', text: 'Details not available' },
  { key: 'not-reviewed', text: 'Not reviewed' },
];

const REQUIRED_FIELD_ERRORS: Record<SalesParticularAttributeKey, string> = {
  kitchenAge: 'Select the kitchen age',
  kitchenSpecification: 'Select the kitchen spec',
  bathroomAge: 'Select the bathroom age',
  bathroomSpecification: 'Select the bathroom spec',
  glazing: 'Select the glazing',
  heating: 'Select the heating',
  decorativeFinishes: 'Select the decorative finishes',
};

const REQUIRED_FIELDS: SalesParticularAttributeKey[] = [
  'kitchenAge',
  'kitchenSpecification',
  'bathroomAge',
  'bathroomSpecification',
  'glazing',
  'heating',
  'decorativeFinishes',
];

const MAX_NOTES_LENGTH = 2000;

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

const toOptions = (values: string[], currentValue: string): IDropdownOption[] => {
  const normalizedCurrent = currentValue.trim();
  const hasCurrent = normalizedCurrent.length > 0
    && values.some((option) => option.toLowerCase() === normalizedCurrent.toLowerCase());

  const options = values.map((value) => ({ key: value, text: value }));

  if (normalizedCurrent.length > 0 && !hasCurrent) {
    return [{ key: normalizedCurrent, text: normalizedCurrent }, ...options];
  }

  return options;
};

const normalizeLookupValue = (raw: string): string => raw.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const toComponentScore = (row: SalesParticularScoringModelRow): number | undefined => {
  const weightedScore = row.scoreInComponent * row.componentWeight;
  if (Number.isFinite(weightedScore)) {
    return weightedScore;
  }

  if (Number.isFinite(row.componentScore)) {
    return row.componentScore;
  }

  return undefined;
};

const buildScoringLookup = (rows: SalesParticularScoringModelRow[]): Map<string, number> => {
  const lookup = new Map<string, number>();

  rows.forEach((row) => {
    const componentScore = toComponentScore(row);
    if (componentScore === undefined) {
      return;
    }

    const normalizedCategory = normalizeLookupValue(row.conditionCategory);
    if (!normalizedCategory) {
      return;
    }

    const key = `${row.componentKey}|${normalizedCategory}`;
    if (!lookup.has(key)) {
      lookup.set(key, componentScore);
    }
  });

  return lookup;
};

const toScoreText = (score: number): string => {
  const rounded = Math.round((score + Number.EPSILON) * 100) / 100;
  return rounded.toFixed(2);
};

const normalizeOverallScore = (score: number): number => Math.min(1, Math.max(0, score));

const toConditionCategory = (score: number): string => {
  if (score >= 0.73) {
    return 'Above Average';
  }

  if (score <= 0.34) {
    return 'Below Average';
  }

  return 'Average';
};

const toConditionCategoryTone = (category: string): 'above-average' | 'average' | 'below-average' | 'neutral' => {
  const normalized = category.trim().toLowerCase();
  if (normalized === 'above average') {
    return 'above-average';
  }

  if (normalized === 'below average') {
    return 'below-average';
  }

  if (normalized === 'average') {
    return 'average';
  }

  return 'neutral';
};

export const SalesParticularSection: React.FC<SalesParticularSectionProps> = ({
  model,
  onOpenReference,
  onDraftChange,
  readOnly = false,
  externalFieldErrors,
  externalReviewStatusError,
}) => {
  const [reviewStatusKey, setReviewStatusKey] = React.useState<SalesParticularReviewStatus | undefined>(model.reviewStatusKey);
  const [linkParticulars, setLinkParticulars] = React.useState(model.linkParticulars);
  const [kitchenAge, setKitchenAge] = React.useState(model.kitchenAge);
  const [kitchenSpecification, setKitchenSpecification] = React.useState(model.kitchenSpecification);
  const [bathroomAge, setBathroomAge] = React.useState(model.bathroomAge);
  const [bathroomSpecification, setBathroomSpecification] = React.useState(model.bathroomSpecification);
  const [glazing, setGlazing] = React.useState(model.glazing);
  const [heating, setHeating] = React.useState(model.heating);
  const [decorativeFinishes, setDecorativeFinishes] = React.useState(model.decorativeFinishes);
  const [conditionScore, setConditionScore] = React.useState(model.conditionScore);
  const [conditionCategory, setConditionCategory] = React.useState(model.conditionCategory);
  const [particularsNotes, setParticularsNotes] = React.useState(model.particularsNotes);
  const [validationErrors, setValidationErrors] = React.useState<SalesParticularValidationErrors>({});

  React.useEffect(() => {
    setReviewStatusKey(model.reviewStatusKey);
    setLinkParticulars(model.linkParticulars);
    setKitchenAge(model.kitchenAge);
    setKitchenSpecification(model.kitchenSpecification);
    setBathroomAge(model.bathroomAge);
    setBathroomSpecification(model.bathroomSpecification);
    setGlazing(model.glazing);
    setHeating(model.heating);
    setDecorativeFinishes(model.decorativeFinishes);
    setConditionScore(model.conditionScore);
    setConditionCategory(model.conditionCategory);
    setParticularsNotes(model.particularsNotes);
    setValidationErrors({});
  }, [model]);

  const draftPayload = React.useMemo((): SalesParticularDraftPayload => ({
    reviewStatusKey,
    linkParticulars,
    kitchenAge,
    kitchenSpecification,
    bathroomAge,
    bathroomSpecification,
    glazing,
    heating,
    decorativeFinishes,
    conditionScore,
    conditionCategory,
    particularsNotes,
  }), [
    bathroomAge,
    bathroomSpecification,
    conditionCategory,
    conditionScore,
    decorativeFinishes,
    glazing,
    heating,
    kitchenAge,
    kitchenSpecification,
    linkParticulars,
    particularsNotes,
    reviewStatusKey,
  ]);

  // Keep the parent draft in sync before the user can trigger cross-section
  // validation from Sales Verification. This avoids one-render lag when the
  // last particulars field is selected immediately before Complete/Submit.
  React.useLayoutEffect(() => {
    onDraftChange?.({
      ...draftPayload,
    });
  }, [draftPayload, onDraftChange]);

  const notesRemaining = Math.max(0, MAX_NOTES_LENGTH - particularsNotes.length);
  const conditionCategoryTone = toConditionCategoryTone(conditionCategory);
  const detailsAvailable = reviewStatusKey === 'details-available';
  const reviewStatusLabelId = 'voa-sales-particular-review-status-label';

  const canEditInputs = !readOnly;
  const calculateActionRule = getSalesParticularCalculateActionRule({ readOnly, reviewStatusKey });
  const canCalculate = !calculateActionRule.disabled;

  const optionsByAttribute = model.optionsByAttribute;
  const scoringLookup = React.useMemo(() => buildScoringLookup(model.scoringRows), [model.scoringRows]);
  const effectiveValidationErrors = React.useMemo<SalesParticularValidationErrors>(() => ({
    reviewStatus: validationErrors.reviewStatus ?? externalReviewStatusError,
    kitchenAge: validationErrors.kitchenAge ?? externalFieldErrors?.kitchenAge,
    kitchenSpecification: validationErrors.kitchenSpecification ?? externalFieldErrors?.kitchenSpecification,
    bathroomAge: validationErrors.bathroomAge ?? externalFieldErrors?.bathroomAge,
    bathroomSpecification: validationErrors.bathroomSpecification ?? externalFieldErrors?.bathroomSpecification,
    glazing: validationErrors.glazing ?? externalFieldErrors?.glazing,
    heating: validationErrors.heating ?? externalFieldErrors?.heating,
    decorativeFinishes: validationErrors.decorativeFinishes ?? externalFieldErrors?.decorativeFinishes,
  }), [externalFieldErrors, externalReviewStatusError, validationErrors]);

  const clearFieldError = React.useCallback((fieldKey: keyof SalesParticularValidationErrors): void => {
    setValidationErrors((previous) => {
      if (!previous[fieldKey]) {
        return previous;
      }
      const next = { ...previous };
      delete next[fieldKey];
      return next;
    });
  }, []);

  const validateBeforeCalculate = React.useCallback((): SalesParticularValidationErrors => {
    const nextErrors: SalesParticularValidationErrors = {};

    if (!reviewStatusKey) {
      nextErrors.reviewStatus = 'Enter the sales particulars';
      return nextErrors;
    }

    if (reviewStatusKey !== 'details-available') {
      return nextErrors;
    }

    const selectedValues: Record<SalesParticularAttributeKey, string> = {
      kitchenAge,
      kitchenSpecification,
      bathroomAge,
      bathroomSpecification,
      glazing,
      heating,
      decorativeFinishes,
    };

    REQUIRED_FIELDS.forEach((field) => {
      if (!selectedValues[field].trim()) {
        nextErrors[field] = REQUIRED_FIELD_ERRORS[field];
      }
    });

    return nextErrors;
  }, [
    bathroomAge,
    bathroomSpecification,
    decorativeFinishes,
    glazing,
    heating,
    kitchenAge,
    kitchenSpecification,
    reviewStatusKey,
  ]);

  const onCalculate = React.useCallback(() => {
    const nextErrors = validateBeforeCalculate();
    setValidationErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || reviewStatusKey !== 'details-available') {
      return;
    }

    const selectedValues: Record<SalesParticularAttributeKey, string> = {
      kitchenAge,
      kitchenSpecification,
      bathroomAge,
      bathroomSpecification,
      glazing,
      heating,
      decorativeFinishes,
    };

    const totalScore = REQUIRED_FIELDS.reduce((sum, field) => {
      const lookupKey = `${field}|${normalizeLookupValue(selectedValues[field])}`;
      return sum + (scoringLookup.get(lookupKey) ?? 0);
    }, 0);

    const normalizedTotalScore = normalizeOverallScore(totalScore);
    setConditionScore(toScoreText(normalizedTotalScore));
    setConditionCategory(toConditionCategory(normalizedTotalScore));
  }, [
    bathroomAge,
    bathroomSpecification,
    decorativeFinishes,
    glazing,
    heating,
    kitchenAge,
    kitchenSpecification,
    reviewStatusKey,
    scoringLookup,
    validateBeforeCalculate,
  ]);

  return (
    <section className="voa-sale-details-card voa-sales-particular-card" aria-labelledby="sales-particular-heading">
      <div className="voa-sale-details-card__header">
        <Text as="h2" id="sales-particular-heading" variant="large" className="voa-sale-details-card__title"
          title="Internal and external property condition attributes used for scoring">
          Sales Particulars
        </Text>
        <Text className="voa-required-key">Fields marked with * are required</Text>
      </div>

      <div className="voa-sales-particular-layout">
        <div className="voa-sales-particular-form">
          <div className={`voa-sales-particular-review${effectiveValidationErrors.reviewStatus ? ' voa-sales-particular-review--error' : ''}`}>
            <label id={reviewStatusLabelId} className="voa-sales-particular-review__label">{renderRequiredLabel('Review Status:', true)}</label>
            <ChoiceGroup
              ariaLabelledBy={reviewStatusLabelId}
              selectedKey={reviewStatusKey}
              options={REVIEW_OPTIONS}
              disabled={readOnly}
              onChange={(_, option) => {
                const nextStatus = option?.key as SalesParticularReviewStatus | undefined;
                setReviewStatusKey(nextStatus);
                clearFieldError('reviewStatus');
                if (nextStatus !== 'details-available') {
                  setValidationErrors((previous) => {
                    const next = { ...previous };
                    delete next.kitchenAge;
                    delete next.kitchenSpecification;
                    delete next.bathroomAge;
                    delete next.bathroomSpecification;
                    delete next.glazing;
                    delete next.heating;
                    delete next.decorativeFinishes;
                    return next;
                  });
                }
              }}
            />
          </div>
          {effectiveValidationErrors.reviewStatus && (
            <span className="voa-sales-particular-review__error" role="alert">{effectiveValidationErrors.reviewStatus}</span>
          )}

          <div className="voa-sales-particular-row voa-sales-particular-row--text">
            <label htmlFor="voa-link-particulars" className="voa-sales-particular-row__label">Link Particulars:</label>
            <TextField
              id="voa-link-particulars"
              value={linkParticulars}
              placeholder="Enter link particulars"
              onChange={(_, nextValue) => setLinkParticulars(nextValue ?? '')}
              disabled={!canEditInputs}
              ariaLabel="Link Particulars"
              className="voa-sales-particular-row__textfield"
            />
          </div>

          <SalesParticularDropdownRow
            id="voa-kitchen-age"
            label="Kitchen Age:"
            required={detailsAvailable}
            selectedKey={kitchenAge || undefined}
            options={toOptions(optionsByAttribute.kitchenAge, kitchenAge)}
            disabled={!canEditInputs}
            infoDisabled={!canEditInputs}
            infoTooltip={model.attributeTooltips.kitchenAge}
            onInfoClick={onOpenReference ? () => onOpenReference('kitchenAge') : undefined}
            errorMessage={effectiveValidationErrors.kitchenAge}
            onChange={(nextValue) => {
              setKitchenAge(nextValue);
              clearFieldError('kitchenAge');
            }}
          />

          <SalesParticularDropdownRow
            id="voa-kitchen-specification"
            label="Kitchen Spec:"
            required={detailsAvailable}
            selectedKey={kitchenSpecification || undefined}
            options={toOptions(optionsByAttribute.kitchenSpecification, kitchenSpecification)}
            disabled={!canEditInputs}
            infoDisabled={!canEditInputs}
            infoTooltip={model.attributeTooltips.kitchenSpecification}
            onInfoClick={onOpenReference ? () => onOpenReference('kitchenSpecification') : undefined}
            errorMessage={effectiveValidationErrors.kitchenSpecification}
            onChange={(nextValue) => {
              setKitchenSpecification(nextValue);
              clearFieldError('kitchenSpecification');
            }}
          />

          <SalesParticularDropdownRow
            id="voa-bathroom-age"
            label="Bathroom Age:"
            required={detailsAvailable}
            selectedKey={bathroomAge || undefined}
            options={toOptions(optionsByAttribute.bathroomAge, bathroomAge)}
            disabled={!canEditInputs}
            infoDisabled={!canEditInputs}
            infoTooltip={model.attributeTooltips.bathroomAge}
            onInfoClick={onOpenReference ? () => onOpenReference('bathroomAge') : undefined}
            errorMessage={effectiveValidationErrors.bathroomAge}
            onChange={(nextValue) => {
              setBathroomAge(nextValue);
              clearFieldError('bathroomAge');
            }}
          />

          <SalesParticularDropdownRow
            id="voa-bathroom-specification"
            label="Bathroom Spec:"
            required={detailsAvailable}
            selectedKey={bathroomSpecification || undefined}
            options={toOptions(optionsByAttribute.bathroomSpecification, bathroomSpecification)}
            disabled={!canEditInputs}
            infoDisabled={!canEditInputs}
            infoTooltip={model.attributeTooltips.bathroomSpecification}
            onInfoClick={onOpenReference ? () => onOpenReference('bathroomSpecification') : undefined}
            errorMessage={effectiveValidationErrors.bathroomSpecification}
            onChange={(nextValue) => {
              setBathroomSpecification(nextValue);
              clearFieldError('bathroomSpecification');
            }}
          />

          <SalesParticularDropdownRow
            id="voa-glazing"
            label="Glazing:"
            required={detailsAvailable}
            selectedKey={glazing || undefined}
            options={toOptions(optionsByAttribute.glazing, glazing)}
            disabled={!canEditInputs}
            infoDisabled={!canEditInputs}
            infoTooltip={model.attributeTooltips.glazing}
            onInfoClick={onOpenReference ? () => onOpenReference('glazing') : undefined}
            errorMessage={effectiveValidationErrors.glazing}
            onChange={(nextValue) => {
              setGlazing(nextValue);
              clearFieldError('glazing');
            }}
          />

          <SalesParticularDropdownRow
            id="voa-heating"
            label="Heating:"
            required={detailsAvailable}
            selectedKey={heating || undefined}
            options={toOptions(optionsByAttribute.heating, heating)}
            disabled={!canEditInputs}
            infoDisabled={!canEditInputs}
            infoTooltip={model.attributeTooltips.heating}
            onInfoClick={onOpenReference ? () => onOpenReference('heating') : undefined}
            errorMessage={effectiveValidationErrors.heating}
            onChange={(nextValue) => {
              setHeating(nextValue);
              clearFieldError('heating');
            }}
          />

          <SalesParticularDropdownRow
            id="voa-decorative-finishes"
            label="Decorative Finishes:"
            required={detailsAvailable}
            selectedKey={decorativeFinishes || undefined}
            options={toOptions(optionsByAttribute.decorativeFinishes, decorativeFinishes)}
            disabled={!canEditInputs}
            infoDisabled={!canEditInputs}
            infoTooltip={model.attributeTooltips.decorativeFinishes}
            onInfoClick={onOpenReference ? () => onOpenReference('decorativeFinishes') : undefined}
            errorMessage={effectiveValidationErrors.decorativeFinishes}
            onChange={(nextValue) => {
              setDecorativeFinishes(nextValue);
              clearFieldError('decorativeFinishes');
            }}
          />

          <div className="voa-sales-particular-actions">
            <TooltipHost content={calculateActionRule.reason}>
              <DefaultButton
                text="Calculate"
                ariaLabel="Calculate condition score and category"
                className="voa-sales-particular-calculate"
                disabled={!canCalculate}
                onClick={onCalculate}
              />
            </TooltipHost>
          </div>
        </div>

        <div className="voa-sales-particular-outcomes">
          <div className="voa-sales-particular-outcomes__row">
            <label htmlFor="voa-condition-score" className="voa-sales-particular-outcomes__label" title="Weighted sum of component scores (0–1)">Condition Score:</label>
            <TextField
              id="voa-condition-score"
              value={conditionScore}
              placeholder="Auto calculated on click of Calculate..."
              readOnly
              ariaLabel="Condition Score"
              className="voa-sales-particular-outcomes__readonly"
            />
          </div>

          <div className="voa-sales-particular-outcomes__row">
            <label htmlFor="voa-condition-category" className="voa-sales-particular-outcomes__label" title="Above Average (≥0.73), Average (0.35–0.72), Below Average (≤0.34)">Condition Category:</label>
            <TextField
              id="voa-condition-category"
              value={conditionCategory}
              placeholder="Auto calculated on click of Calculate..."
              readOnly
              ariaLabel="Condition Category"
              className={`voa-sales-particular-outcomes__readonly voa-sales-particular-outcomes__readonly--${conditionCategoryTone}`}
            />
          </div>

          <div className="voa-sales-particular-outcomes__row voa-sales-particular-outcomes__row--notes">
            <label htmlFor="voa-particulars-notes" className="voa-sales-particular-outcomes__label">Particulars Notes:</label>
            <TextField
              id="voa-particulars-notes"
              value={particularsNotes}
              placeholder="Enter particulars notes"
              multiline
              rows={7}
              maxLength={MAX_NOTES_LENGTH}
              onChange={(_, nextValue) => setParticularsNotes((nextValue ?? '').slice(0, MAX_NOTES_LENGTH))}
              disabled={readOnly}
              ariaLabel="Particulars Notes"
              className="voa-sales-particular-outcomes__notes"
            />
            <div className="voa-sales-particular-outcomes__count" aria-live="polite">
              Character(s) remaining: {notesRemaining.toLocaleString('en-GB')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

SalesParticularSection.displayName = 'SalesParticularSection';







