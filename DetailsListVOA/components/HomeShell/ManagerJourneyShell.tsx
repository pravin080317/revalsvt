import * as React from 'react';
import {
  ComboBox,
  DefaultButton,
  IComboBox,
  IComboBoxOption,
  Icon,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Text,
} from '@fluentui/react';
import { IInputs } from '../../generated/ManifestTypes';
import { CONTROL_CONFIG } from '../../config/ControlConfig';
import { executeUnboundCustomApi, normalizeCustomApiName, resolveCustomApiOperationType } from '../../services/CustomApi';
import { DetailsListHost } from '../DetailsListHost/DetailsListHost';
import { normalizeUserId } from '../../utils/IdentifierUtils';
import {
  HOME_JOURNEY_AUTOMATION_IDS,
  HOME_JOURNEY_COPY,
  HOME_JOURNEY_COUNTRY_BASE_VALUES,
  HOME_JOURNEY_LIST_YEAR_BASE_VALUES,
  HOME_JOURNEY_PERSONA_LABELS,
  HOME_JOURNEY_TILE_DEFINITIONS,
  HOME_JOURNEY_VISIBLE_TILE_KEYS_BY_PERSONA,
  type HomeJourneyPersona,
  type HomeJourneyTileDefinition,
  type HomeJourneyTileKey,
} from '../../constants/HomeJourney';

type JourneyStep = 'tiles' | 'table';
type SvtPersona = HomeJourneyPersona;

interface ParsedUserContext {
  persona: SvtPersona;
  resolutionSource: string;
  hasSvtAccess: boolean;
  entraObjectId: string;
}

export interface ManagerJourneyShellProps {
  context: ComponentFramework.Context<IInputs>;
  onRowInvoke?: (args: { taskId?: string; saleId?: string; screenKind?: string; tableKey?: string }) => void | Promise<void>;
  onSelectionChange?: (args: { taskId?: string; saleId?: string; selectedTaskIds?: string[]; selectedSaleIds?: string[] }) => void;
  onSelectionCountChange?: (count: number) => void;
  initialCountry?: string;
  initialListYear?: string;
  onContextChange?: (args: { country: string; listYear: string }) => void;
  refreshNonce?: number;
  entraObjectId?: string;
  onBulkCreateTask?: (saleIds: string[]) => Promise<void>;
  canCreateManualTask?: boolean;
}



const normalizeText = (value: unknown): string => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
  return '';
};

const normalizePersona = (value: unknown): SvtPersona => {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === 'manager') return 'manager';
  if (normalized === 'qa') return 'qa';
  if (normalized === 'user') return 'user';
  if (normalized === 'none') return 'none';
  return 'unknown';
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  const normalized = normalizeText(value).toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
};

const findRecordValue = (record: Record<string, unknown>, ...candidates: string[]): unknown => {
  const keys = Object.keys(record);
  for (const candidate of candidates) {
    if (Object.prototype.hasOwnProperty.call(record, candidate)) {
      return record[candidate];
    }
    const match = keys.find((key) => key.toLowerCase() === candidate.toLowerCase());
    if (match) return record[match];
  }
  return undefined;
};

const tryParseJsonRecord = (value: unknown): Record<string, unknown> | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return undefined;
    }
    return undefined;
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
};

const parseUserContext = (payload: unknown): ParsedUserContext => {
  const rootRecord = tryParseJsonRecord(payload) ?? {};
  const nestedRecord = tryParseJsonRecord(findRecordValue(rootRecord, 'Result', 'result'));
  const record = nestedRecord ?? rootRecord;

  const personaValue = findRecordValue(record, 'svtPersona', 'persona');
  const sourceValue = findRecordValue(record, 'resolutionSource', 'source');
  const accessValue = findRecordValue(record, 'hasSvtAccess', 'hasAccess');
  const entraObjectIdValue = findRecordValue(record, 'entraObjectId');

  const persona = normalizePersona(personaValue);
  const hasSvtAccess = toBoolean(accessValue)
    || persona === 'manager'
    || persona === 'qa'
    || persona === 'user'
    || persona === 'none';

  return {
    persona,
    resolutionSource: normalizeText(sourceValue),
    hasSvtAccess,
    entraObjectId: normalizeUserId(normalizeText(entraObjectIdValue)),
  };
};

const buildCountryOptions = (currentValue: string): IComboBoxOption[] => {
  const values = [...HOME_JOURNEY_COUNTRY_BASE_VALUES];
  if (currentValue && !values.some((value) => value.toLowerCase() === currentValue.toLowerCase())) {
    values.push(currentValue);
  }
  return values.map((value) => ({ key: value, text: value }));
};

const buildListYearOptions = (currentValue: string): IComboBoxOption[] => {
  const yearValues = new Set<string>(HOME_JOURNEY_LIST_YEAR_BASE_VALUES);
  if (currentValue) {
    yearValues.add(currentValue);
  }

  return Array.from(yearValues)
    .sort((a, b) => Number(b) - Number(a))
    .map((value) => ({ key: value, text: value }));
};

const findComboBoxOption = (options: IComboBoxOption[], value: unknown): IComboBoxOption | undefined => {
  const normalizedValue = normalizeText(value).toLowerCase();
  if (!normalizedValue) {
    return undefined;
  }

  return options.find((option) => {
    const normalizedKey = normalizeText(option.key).toLowerCase();
    const normalizedText = normalizeText(option.text).toLowerCase();
    return normalizedKey === normalizedValue || normalizedText === normalizedValue;
  });
};

const getVisibleTilesForPersona = (persona: SvtPersona): HomeJourneyTileDefinition[] => {
  const visibleKeys = HOME_JOURNEY_VISIBLE_TILE_KEYS_BY_PERSONA[persona] ?? [];
  const visibleSet = new Set<HomeJourneyTileKey>(visibleKeys);
  return HOME_JOURNEY_TILE_DEFINITIONS.filter((tile) => visibleSet.has(tile.key));
};

const getPersonaLabel = (persona: SvtPersona): string =>
  HOME_JOURNEY_PERSONA_LABELS[persona] ?? HOME_JOURNEY_PERSONA_LABELS.unknown;

export const ManagerJourneyShell: React.FC<ManagerJourneyShellProps> = ({
  context,
  onRowInvoke,
  onSelectionChange,
  onSelectionCountChange,
  initialCountry,
  initialListYear,
  onContextChange,
  refreshNonce,
  entraObjectId,
  onBulkCreateTask,
  canCreateManualTask = false,
}) => {
  const initialCountryValue = React.useMemo(() => normalizeText(initialCountry), [initialCountry]);
  const initialListYearValue = React.useMemo(() => normalizeText(initialListYear), [initialListYear]);
  const [country, setCountry] = React.useState<string>(initialCountryValue);
  const [countryInput, setCountryInput] = React.useState<string>(initialCountryValue);
  const [countryEditing, setCountryEditing] = React.useState<boolean>(false);
  const [listYear, setListYear] = React.useState<string>(initialListYearValue);
  const [listYearInput, setListYearInput] = React.useState<string>(initialListYearValue);
  const [listYearEditing, setListYearEditing] = React.useState<boolean>(false);
  const [step, setStep] = React.useState<JourneyStep>('tiles');
  const [selectedTileKey, setSelectedTileKey] = React.useState<HomeJourneyTileKey | undefined>(undefined);
  const [contextValidationMessage, setContextValidationMessage] = React.useState<string | undefined>(undefined);
  const [userContextLoading, setUserContextLoading] = React.useState<boolean>(true);
  const [userContextError, setUserContextError] = React.useState<string | undefined>(undefined);
  const [dismissedUserContextError, setDismissedUserContextError] = React.useState(false);
  const [dismissedContextValidationMessage, setDismissedContextValidationMessage] = React.useState(false);
  const [dismissedNoTilesMessage, setDismissedNoTilesMessage] = React.useState(false);
  const [userContext, setUserContext] = React.useState<ParsedUserContext>({
    persona: 'unknown',
    resolutionSource: '',
    hasSvtAccess: false,
    entraObjectId: '',
  });

  const effectiveEntraObjectId = React.useMemo(
    () => normalizeUserId(userContext.entraObjectId || entraObjectId),
    [userContext.entraObjectId, entraObjectId],
  );

  React.useEffect(() => {
    if (initialCountryValue && !country) {
      setCountry(initialCountryValue);
      setCountryInput(initialCountryValue);
      setCountryEditing(false);
    }
  }, [country, initialCountryValue]);

  React.useEffect(() => {
    if (initialListYearValue && !listYear) {
      setListYear(initialListYearValue);
      setListYearInput(initialListYearValue);
      setListYearEditing(false);
    }
  }, [initialListYearValue, listYear]);

  React.useEffect(() => {
    if (country && listYear) {
      onContextChange?.({ country, listYear });
    }
  }, [country, listYear, onContextChange]);

  React.useEffect(() => {
    setDismissedUserContextError(false);
  }, [userContextError]);

  React.useEffect(() => {
    setDismissedContextValidationMessage(false);
  }, [contextValidationMessage]);

  const userContextApiName = React.useMemo(() => {
    const raw = (context.parameters as unknown as Record<string, { raw?: string }>).userContextApiName?.raw;
    const fromContext = normalizeCustomApiName(normalizeText(raw));
    const fallback = normalizeCustomApiName(CONTROL_CONFIG.userContextApiName);
    return fromContext || fallback || '';
  }, [context]);

  const userContextApiType = React.useMemo(() => {
    const raw = (context.parameters as unknown as Record<string, { raw?: string }>).userContextApiType?.raw;
    const fromContext = normalizeText(raw);
    const fallback = CONTROL_CONFIG.userContextApiType ?? CONTROL_CONFIG.customApiType;
    return resolveCustomApiOperationType(fromContext || fallback);
  }, [context]);

  React.useEffect(() => {
    let active = true;

    if (!userContextApiName) {
      setUserContext({
        persona: 'manager',
        resolutionSource: 'Fallback',
        hasSvtAccess: true,
        entraObjectId: '',
      });
      setUserContextError(HOME_JOURNEY_COPY.userContextApiMissingMessage);
      setUserContextLoading(false);
      return () => {
        active = false;
      };
    }

    setUserContextLoading(true);
    setUserContextError(undefined);

    const loadUserContext = async (): Promise<void> => {
      try {
        const payload = await executeUnboundCustomApi<unknown>(
          context,
          userContextApiName,
          {},
          { operationType: userContextApiType },
        );

        if (!active) return;
        const parsed = parseUserContext(payload);
        setUserContext(parsed);
        if (!parsed.hasSvtAccess) {
          setUserContextError(HOME_JOURNEY_COPY.noSvtAccessMessage);
        }
      } catch {
        if (!active) return;
        setUserContext({
          persona: 'manager',
          resolutionSource: 'Fallback',
          hasSvtAccess: true,
          entraObjectId: '',
        });
        setUserContextError(HOME_JOURNEY_COPY.userContextFallbackMessage);
      } finally {
        if (active) {
          setUserContextLoading(false);
        }
      }
    };

    loadUserContext().catch(() => undefined);

    return () => {
      active = false;
    };
  }, [context, userContextApiName, userContextApiType]);

  const countryOptions = React.useMemo(() => buildCountryOptions(country), [country]);
  const listYearOptions = React.useMemo(() => buildListYearOptions(listYear), [listYear]);
  const resolveHomeContextSelection = React.useCallback((
    value: string,
    options: IComboBoxOption[],
    setSelected: React.Dispatch<React.SetStateAction<string>>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    setEditing: React.Dispatch<React.SetStateAction<boolean>>,
  ): void => {
    const normalizedValue = normalizeText(value);
    const matchedOption = findComboBoxOption(options, normalizedValue);

    if (!normalizedValue) {
      setSelected('');
      setInput('');
      setEditing(false);
      return;
    }

    if (matchedOption) {
      const matchedValue = normalizeText(matchedOption.key);
      setSelected(matchedValue);
      setInput(normalizeText(matchedOption.text) || matchedValue);
      setEditing(false);
      return;
    }

    setSelected('');
    setInput(normalizedValue);
    setEditing(true);
  }, []);

  const handleCountryChange = React.useCallback((
    _event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    _index?: number,
    value?: string,
  ): void => {
    resolveHomeContextSelection(
      normalizeText(option?.key ?? value),
      countryOptions,
      setCountry,
      setCountryInput,
      setCountryEditing,
    );
    setContextValidationMessage(undefined);
  }, [countryOptions, resolveHomeContextSelection]);

  const handleCountryInputValueChange = React.useCallback((value?: string): void => {
    resolveHomeContextSelection(
      normalizeText(value),
      countryOptions,
      setCountry,
      setCountryInput,
      setCountryEditing,
    );
    setContextValidationMessage(undefined);
  }, [countryOptions, resolveHomeContextSelection]);

  const handleListYearChange = React.useCallback((
    _event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    _index?: number,
    value?: string,
  ): void => {
    resolveHomeContextSelection(
      normalizeText(option?.key ?? value),
      listYearOptions,
      setListYear,
      setListYearInput,
      setListYearEditing,
    );
    setContextValidationMessage(undefined);
  }, [listYearOptions, resolveHomeContextSelection]);

  const handleListYearInputValueChange = React.useCallback((value?: string): void => {
    resolveHomeContextSelection(
      normalizeText(value),
      listYearOptions,
      setListYear,
      setListYearInput,
      setListYearEditing,
    );
    setContextValidationMessage(undefined);
  }, [listYearOptions, resolveHomeContextSelection]);
  const visibleTiles = React.useMemo(() => getVisibleTilesForPersona(userContext.persona), [userContext.persona]);
  React.useEffect(() => {
    setDismissedNoTilesMessage(false);
  }, [visibleTiles.length]);

  const selectedTile = React.useMemo(
    () => HOME_JOURNEY_TILE_DEFINITIONS.find((tile) => tile.key === selectedTileKey),
    [selectedTileKey],
  );

  const canContinue = country !== '' && listYear !== '';
  const hasWorkspaceAccessBlock = !userContext.hasSvtAccess && visibleTiles.length === 0;
  const isTileSelectionDisabled = !canContinue || hasWorkspaceAccessBlock;
  const personaLabel = getPersonaLabel(userContext.persona);
  const personaSummary = userContext.resolutionSource
    ? `${personaLabel} (${userContext.resolutionSource})`
    : personaLabel;

  const changeContext = (): void => {
    setContextValidationMessage(undefined);
    setStep('tiles');
  };

  const openTile = (tile: HomeJourneyTileDefinition): void => {
    if (!canContinue) {
      setContextValidationMessage(HOME_JOURNEY_COPY.contextValidationMessage);
      return;
    }
    if (hasWorkspaceAccessBlock) return;
    setContextValidationMessage(undefined);
    setSelectedTileKey(tile.key);
    setStep('table');
  };

  const backToTiles = (): void => {
    setStep('tiles');
  };

  const isTableStep = step === 'table';
  const shellClassName = isTableStep ? 'voa-home-shell voa-home-shell--table' : 'voa-home-shell';

  return (
    <div className={shellClassName}>
      {!isTableStep && (
        <header className="voa-home-header">
          <Text as="h1" variant="large" className="voa-home-header__title">{HOME_JOURNEY_COPY.headerTitle}</Text>
          {!userContextLoading && (
            <div className="voa-home-context-summary voa-home-context-summary--persona" role="status" aria-live="polite">
              <Text variant="small">
                {HOME_JOURNEY_COPY.personaSummaryPrefix}: <strong>{personaSummary}</strong>
              </Text>
            </div>
          )}
        </header>
      )}

      {userContextError && !dismissedUserContextError && !isTableStep && (
        <MessageBar
          messageBarType={MessageBarType.warning}
          onDismiss={() => setDismissedUserContextError(true)}
          dismissButtonAriaLabel="Close"
        >
          {userContextError}
        </MessageBar>
      )}

      {userContextLoading ? (
        <div className="voa-home-loading" role="status" aria-live="polite">
          <Spinner size={SpinnerSize.medium} label={HOME_JOURNEY_COPY.loadingUserContext} />
        </div>
      ) : (
        <>
          {step === 'tiles' && (
            <section
              id={HOME_JOURNEY_AUTOMATION_IDS.tilesStage}
              className="voa-home-tiles-stage"
              aria-labelledby="voa-home-tiles-title"
              data-testid={HOME_JOURNEY_AUTOMATION_IDS.tilesStage}
            >
              <div className="voa-home-tiles-header">
                <div className="voa-home-tiles-heading">
                  <Text as="h2" id="voa-home-tiles-title" variant="large" className="voa-home-stage-title">
                    {HOME_JOURNEY_COPY.tilesStageTitle}
                  </Text>
                </div>
              </div>

              <div
                id={HOME_JOURNEY_AUTOMATION_IDS.contextStage}
                className="voa-home-context-stage voa-home-context-stage--inline"
                aria-labelledby="voa-home-context-title"
                data-testid={HOME_JOURNEY_AUTOMATION_IDS.contextStage}
              >
                <div className="voa-home-context-intro">
                  <div className="voa-home-context-intro-copy">
                    <Text as="h3" id="voa-home-context-title" variant="mediumPlus" className="voa-home-context-panel-title">
                      {HOME_JOURNEY_COPY.contextStageTitle}
                    </Text>
                  </div>
                </div>
                <div className="voa-home-context-grid">
                  <div className="voa-home-context-field" data-testid={HOME_JOURNEY_AUTOMATION_IDS.contextCountryField}>
                    <ComboBox
                      id={HOME_JOURNEY_AUTOMATION_IDS.contextCountryInput}
                      label={HOME_JOURNEY_COPY.countryLabel}
                      required
                      selectedKey={countryEditing ? null : country || undefined}
                      options={countryOptions}
                      placeholder={HOME_JOURNEY_COPY.countryPlaceholder}
                      ariaLabel={HOME_JOURNEY_COPY.countryLabel}
                      allowFreeform={false}
                      allowFreeInput
                      autoComplete="off"
                      useComboBoxAsMenuWidth
                      text={countryEditing ? countryInput : undefined}
                      onChange={handleCountryChange}
                      onInputValueChange={handleCountryInputValueChange}
                      styles={{
                        root: { width: '100%' },
                      }}
                    />
                  </div>
                  <div className="voa-home-context-field" data-testid={HOME_JOURNEY_AUTOMATION_IDS.contextListYearField}>
                    <ComboBox
                      id={HOME_JOURNEY_AUTOMATION_IDS.contextListYearInput}
                      label={HOME_JOURNEY_COPY.listYearLabel}
                      required
                      selectedKey={listYearEditing ? null : listYear || undefined}
                      options={listYearOptions}
                      placeholder={HOME_JOURNEY_COPY.listYearPlaceholder}
                      ariaLabel={HOME_JOURNEY_COPY.listYearLabel}
                      allowFreeform={false}
                      allowFreeInput
                      autoComplete="off"
                      useComboBoxAsMenuWidth
                      text={listYearEditing ? listYearInput : undefined}
                      onChange={handleListYearChange}
                      onInputValueChange={handleListYearInputValueChange}
                      styles={{
                        root: { width: '100%' },
                      }}
                    />
                  </div>
                </div>
                <Text
                  variant="small"
                  className={`voa-home-context-inline-status ${canContinue
                    ? 'voa-home-context-inline-status--ready'
                    : 'voa-home-context-inline-status--pending'}`}
                >
                  {canContinue
                    ? `${HOME_JOURNEY_COPY.contextSummaryPrefix}: ${country} | ${listYear}`
                    : HOME_JOURNEY_COPY.contextInlineHint}
                </Text>
              </div>

              {contextValidationMessage && !dismissedContextValidationMessage && (
                <MessageBar
                  messageBarType={MessageBarType.error}
                  onDismiss={() => setDismissedContextValidationMessage(true)}
                  dismissButtonAriaLabel="Close"
                >
                  {contextValidationMessage}
                </MessageBar>
              )}

              {visibleTiles.length === 0 && !dismissedNoTilesMessage ? (
                <MessageBar
                  messageBarType={MessageBarType.severeWarning}
                  onDismiss={() => setDismissedNoTilesMessage(true)}
                  dismissButtonAriaLabel="Close"
                >
                  {HOME_JOURNEY_COPY.noTilesMessage}
                </MessageBar>
              ) : (
                <div
                  className={`voa-home-tiles-grid${isTileSelectionDisabled ? ' voa-home-tiles-grid--locked' : ''}${visibleTiles.length === 1 ? ' voa-home-tiles-grid--single' : ''}`}
                  role="list"
                  aria-live="polite"
                >
                  {visibleTiles.map((tile) => (
                    <article key={tile.key} role="listitem" className="voa-home-tile-card">
                      <button
                        id={`${HOME_JOURNEY_AUTOMATION_IDS.tileButtonPrefix}-${tile.key}`}
                        type="button"
                        className="voa-home-tile-button"
                        aria-describedby={`voa-home-tile-desc-${tile.key}`}
                        disabled={isTileSelectionDisabled}
                        onClick={() => openTile(tile)}
                        data-testid={`${HOME_JOURNEY_AUTOMATION_IDS.tileButtonPrefix}-${tile.key}`}
                      >
                        <span className="voa-home-tile-icon" aria-hidden="true">
                          <Icon iconName={tile.iconName} />
                        </span>
                        <span className="voa-home-tile-title">{tile.title}</span>
                        <span id={`voa-home-tile-desc-${tile.key}`} className="voa-home-tile-desc">
                          {tile.description}
                        </span>
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {step === 'table' && selectedTile && (
            <section
              id={HOME_JOURNEY_AUTOMATION_IDS.tableStage}
              className="voa-home-table-stage"
              aria-label={`${selectedTile.title} ${HOME_JOURNEY_COPY.tableAriaLabelSuffix}`}
              data-testid={HOME_JOURNEY_AUTOMATION_IDS.tableStage}
            >
              <div className="voa-home-table-host">
                <DetailsListHost
                  context={context}
                  onRowInvoke={onRowInvoke}
                  onSelectionChange={onSelectionChange}
                  onSelectionCountChange={onSelectionCountChange}
                  onBackRequested={backToTiles}
                  screenNameOverride={selectedTile.canvasScreenName}
                  tableKeyOverride={selectedTile.tableKey}
                  countryOverride={country}
                  listYearOverride={listYear}
                  contextSubtitle={`${country} · ${listYear}`}
                  onEditContext={changeContext}
                  refreshNonce={refreshNonce}
                  entraObjectId={effectiveEntraObjectId}
                  onBulkCreateTask={onBulkCreateTask}
                  canCreateManualTask={canCreateManualTask}
                />
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

ManagerJourneyShell.displayName = 'ManagerJourneyShell';
























