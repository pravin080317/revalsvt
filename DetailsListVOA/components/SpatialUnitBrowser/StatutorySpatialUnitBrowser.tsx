import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  SelectionMode,
  Spinner,
  Stack,
  Text,
  TextField,
  DefaultButton,
} from '@fluentui/react';
import { DetailsListHost } from '../DetailsListHost/DetailsListHost';
import { PCFContext } from '../context/PCFContext';
import { IInputs } from '../../generated/ManifestTypes';

interface StatutorySpatialUnitLabel {
  statutorySpatialUnitLabelId: string;
  statutorySpatialUnitId: string;
  effectiveFromDate: string;
  effectiveToDate: string | null;
  addressString: string;
  labelStatusId: string;
  prevLabelVersionId: string | null;
  nextLabelversionId: string | null;
  isPrimaryLabel: boolean;
  labelSourceId: string;
  voaSsuDescription: string | null;
  accessDescription: string | null;
  uprn: number | string | null;
  uprnParent: string | null;
  voauprn: string | null;
  is8s7666Compliant: boolean | null;
  osopa: string | null;
  firmOrOccupier: string | null;
  buildingName: string | null;
  buildingNumber: string | null;
  street: string | null;
  locality: string | null;
  town: string | null;
  postcode: string | null;
  county: string | null;
  country: string | null;
  lpiAdministrativeArea: string | null;
  lpiPostcodeLocator: string | null;
  lpiLastUpdateDate?: string | null;
  createdDate?: string | null;
  [key: string]: unknown;
}

interface StatutorySpatialUnitResponse {
  results?: StatutorySpatialUnitLabel[];
  moreResultsAvailable?: boolean;
  page?: number;
}

interface FilterState {
  postcode: string;
  street: string;
  town: string;
  bacode: string;
}

const API_URL =
  '/v1/statutorySpatialUnitLabelAddressQuery';

const DEFAULT_HEADERS = new Headers({
  ActiveDirectoryObjectId: '',
  CorrelationId: '',
  CaseObjectType: '',
  CaseObjectId: '',
  'ocp-apim-subscription-key': '',
});

const defaultFilters: FilterState = {
  postcode: '',
  street: '',
  town: '',
  bacode: '',
};

const stackTokens = { childrenGap: 16 };
const rowStackTokens = { childrenGap: 12 };
const columnWidth = 180;

export const StatutorySpatialUnitBrowser: React.FC = () => {
  const context = React.useContext(PCFContext);
  const [filters, setFilters] = React.useState<FilterState>({ ...defaultFilters });
  const [items, setItems] = React.useState<StatutorySpatialUnitLabel[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const [hasSearched, setHasSearched] = React.useState(false);
  const [moreResultsAvailable, setMoreResultsAvailable] = React.useState(false);

  const onFilterChange = React.useCallback((key: keyof FilterState, value?: string) => {
    setFilters((prev) => ({ ...prev, [key]: value ?? '' }));
  }, []);

  const resetFilters = React.useCallback(() => {
    setFilters({ ...defaultFilters });
    setItems([]);
    setHasSearched(false);
    setMoreResultsAvailable(false);
    setError(undefined);
  }, []);

  const columns = React.useMemo<IColumn[]>(
    () => [
      {
        key: 'addressString',
        name: 'Address',
        fieldName: 'addressString',
        minWidth: 240,
        maxWidth: 360,
        isResizable: true,
      },
      {
        key: 'buildingNumber',
        name: 'Building No.',
        fieldName: 'buildingNumber',
        minWidth: 90,
        maxWidth: 120,
        isResizable: true,
      },
      {
        key: 'street',
        name: 'Street',
        fieldName: 'street',
        minWidth: columnWidth,
        maxWidth: columnWidth,
        isResizable: false,
      },
      {
        key: 'town',
        name: 'Town',
        fieldName: 'town',
        minWidth: columnWidth,
        isResizable: true,
      },
      {
        key: 'postcode',
        name: 'Postcode',
        fieldName: 'postcode',
        minWidth: 120,
        isResizable: true,
      },
      {
        key: 'uprn',
        name: 'UPRN',
        fieldName: 'uprn',
        minWidth: columnWidth,
        isResizable: true,
      },
      {
        key: 'isPrimaryLabel',
        name: 'Primary Label',
        fieldName: 'isPrimaryLabel',
        minWidth: 120,
        isResizable: true,
        onRender: (item?: StatutorySpatialUnitLabel) => (item?.isPrimaryLabel ? 'Yes' : 'No'),
      },
      {
        key: 'effectiveFromDate',
        name: 'Effective From',
        fieldName: 'effectiveFromDate',
        minWidth: columnWidth,
        isResizable: true,
      },
      {
        key: 'lpiAdministrativeArea',
        name: 'Administrative Area',
        fieldName: 'lpiAdministrativeArea',
        minWidth: columnWidth,
        isResizable: true,
      },
      {
        key: 'lpiPostcodeLocator',
        name: 'Postcode Locator',
        fieldName: 'lpiPostcodeLocator',
        minWidth: columnWidth,
        isResizable: true,
      },
    ],
    [],
  );

  const buildQueryString = React.useCallback((state: FilterState) => {
    const params = new URLSearchParams();
    (Object.keys(state) as (keyof FilterState)[]).forEach((key) => {
      const value = state[key]?.trim();
      if (value) {
        params.append(key, value);
      }
    });
    return params.toString();
  }, []);

  const fetchResults = React.useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    setHasSearched(true);

    try {
      const query = buildQueryString(filters);
      const url = query ? `${API_URL}?${query}` : API_URL;

      const t0 = performance.now();
      const response = await fetch(url, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
      });
      const t1 = performance.now();
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const t2 = performance.now();
      const data = (await response.json()) as StatutorySpatialUnitResponse;
      const t3 = performance.now();
      const results = Array.isArray(data?.results) ? data.results : [];
      setItems(results);
      setMoreResultsAvailable(Boolean(data?.moreResultsAvailable));
      console.log('[SSU Perf] API URL:', url);
      console.log('[SSU Perf] Network+server time (ms):', Math.round(t1 - t0));
      console.log('[SSU Perf] Time to first byte to JSON start (ms):', Math.round(t2 - t1));
      console.log('[SSU Perf] JSON parse time (ms):', Math.round(t3 - t2));
      console.log('[SSU Perf] Items returned:', results.length);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error calling VOA API';
      setError(message);
      setItems([]);
      setMoreResultsAvailable(false);
    } finally {
      setIsLoading(false);
    }
  }, [buildQueryString, filters]);

  return (
    <Stack tokens={stackTokens} styles={{ root: { marginTop: 24 } }}>
      <Text variant="xLarge">Statutory Spatial Unit Lookup</Text>
      <Stack horizontal wrap tokens={rowStackTokens}>
        <TextField
          label="Postcode"
          value={filters.postcode}
          onChange={(_, value) => onFilterChange('postcode', value)}
          styles={{ root: { maxWidth: 220 } }}
        />
        <TextField
          label="Street"
          value={filters.street}
          onChange={(_, value) => onFilterChange('street', value)}
          styles={{ root: { maxWidth: 220 } }}
        />
        <TextField
          label="Town"
          value={filters.town}
          onChange={(_, value) => onFilterChange('town', value)}
          styles={{ root: { maxWidth: 220 } }}
        />
        <TextField
          label="BA Code"
          value={filters.bacode}
          onChange={(_, value) => onFilterChange('bacode', value)}
          styles={{ root: { maxWidth: 220 } }}
        />
      </Stack>
      <Stack horizontal tokens={rowStackTokens}>
        <PrimaryButton text="Search" onClick={() => void fetchResults()} disabled={isLoading} />
        <DefaultButton text="Reset" onClick={resetFilters} disabled={isLoading} />
      </Stack>
      {error && (
        <MessageBar messageBarType={MessageBarType.error} isMultiline>
          {error}
        </MessageBar>
      )}
      {isLoading ? (
        <Spinner label="Loading statutory spatial unit labels..." />
      ) : (
        <DetailsList
          items={items}
          columns={columns}
          selectionMode={SelectionMode.none}
          layoutMode={DetailsListLayoutMode.justified}
          setKey="statutorySpatialUnits"
          styles={{ root: { maxHeight: 380, overflowY: 'auto' } }}
        />
      )}
      {hasSearched && !isLoading && !error && (
        <Text variant="smallPlus">
          {items.length === 0
            ? 'No records returned for the selected filters.'
            : `${items.length} record${items.length === 1 ? '' : 's'} returned${
                moreResultsAvailable ? ' (more results are available in the service).' : '.'
              }`}
        </Text>
      )}
      {/* Embedded standard grid with column filters */}
      <Stack tokens={{ childrenGap: 12 }} styles={{ root: { marginTop: 24 } }}>
        {context ? <DetailsListHost context={context} externalItems={items} /> : null}
      </Stack>
    </Stack>
  );
};
