import { CONTROL_CONFIG } from '../config/ControlConfig';
import { TaskSearchItem, TaskSearchResponse } from '../data/TaskSearchSample';
import { SAMPLE_TASK_RESULTS } from '../data/TaskSearchSample';
import { SAMPLE_RECORDS } from '../data/SampleData';
import { IInputs } from '../generated/ManifestTypes';
import { executeUnboundCustomApi, normalizeCustomApiName, resolveCustomApiOperationType } from './CustomApi';
import { normalizeSearchResponse, SalesApiResponse, unwrapCustomApiPayload } from './DataService';
import { buildGridApiParams, type ClientSortState } from '../utils/GridDataParams';
import { svtDebug } from '../utils/debug';

export interface LoadResult {
  items: TaskSearchItem[];
  totalCount: number;
  serverDriven: boolean;
  filters?: Record<string, string | string[]>;
  errorMessage?: string;
  userLookup?: Record<string, string>;
  userFilterOptions?: Record<string, Array<{ key: string; text: string }>>;
}

const TECHNICAL_ERROR_MESSAGE = 'Technical error. Please try again in some time.';
const BAD_REQUEST_ERROR_MESSAGE = 'Unable to load results with the selected filters. Please clear some filters and try again.';
const GENERIC_LOAD_ERROR_MESSAGE = 'Unable to load results. Please try again.';

const isServerErrorMessage = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return normalized.includes('500')
    || normalized.includes('internal server error')
    || normalized.includes('status: 500')
    || normalized.includes('status code 500');
};

const isBadRequestStyleMessage = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return normalized.includes('400')
    || normalized.includes('bad request')
    || normalized.includes('invalid url')
    || normalized.includes('request uri is invalid')
    || normalized.includes('request url is invalid')
    || normalized.includes('requestistooolong')
    || normalized.includes('is request too long');
};

const stripHtmlAndNormalizeWhitespace = (value: string): string =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\\r|\\n|\r|\n/g, ' ')
    .replace(/\\"/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

const tryParseJson = (value: string): unknown => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const candidate = trimmed.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate) as unknown;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }
};

const extractMessageFromUnknown = (value: unknown, depth = 0): string | undefined => {
  if (depth > 6 || value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    const parsed = tryParseJson(value);
    if (parsed !== undefined) {
      return extractMessageFromUnknown(parsed, depth + 1);
    }
    return value;
  }

  if (value instanceof Error) {
    return extractMessageFromUnknown(value.message, depth + 1);
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const keys = [
      'errorMessage',
      'message',
      'Message',
      'error',
      'Error',
      'responseText',
      'response',
      'innerError',
      '_message',
      'title',
      'detail',
    ];

    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(record, key)) continue;
      const nested = extractMessageFromUnknown(record[key], depth + 1);
      if (nested) return nested;
    }
  }

  return undefined;
};

const normalizeErrorMessage = (message?: string): string | undefined => {
  if (!message) return undefined;

  const extracted = extractMessageFromUnknown(message) ?? message;
  const cleaned = stripHtmlAndNormalizeWhitespace(extracted);
  const normalized = cleaned.toLowerCase();

  if (!cleaned) {
    return GENERIC_LOAD_ERROR_MESSAGE;
  }

  if (isServerErrorMessage(normalized)) {
    return TECHNICAL_ERROR_MESSAGE;
  }

  if (isBadRequestStyleMessage(normalized) || normalized.includes('<!doctype html') || normalized.includes('<html')) {
    return BAD_REQUEST_ERROR_MESSAGE;
  }

  // Hide oversized raw transport payloads from UI banners.
  if (cleaned.length > 240 || normalized.includes('clientrequestid') || normalized.includes('actionstack')) {
    return GENERIC_LOAD_ERROR_MESSAGE;
  }

  return cleaned;
};

const resolveCustomApiName = (context: ComponentFramework.Context<IInputs>): string => {
  const raw = (context.parameters as unknown as Record<string, { raw?: string }>).customApiName?.raw;
  const fromContext = normalizeCustomApiName(typeof raw === 'string' ? raw : undefined);
  const fallback = normalizeCustomApiName(CONTROL_CONFIG.customApiName);
  return fromContext || fallback || '';
};

const resolveCustomApiType = (context: ComponentFramework.Context<IInputs>): number => {
  const raw = (context.parameters as unknown as Record<string, { raw?: string }>).customApiType?.raw;
  const fromContext = typeof raw === 'string' ? raw : undefined;
  return resolveCustomApiOperationType(fromContext ?? CONTROL_CONFIG.customApiType);
};

const resolveServerDrivenThreshold = (context: ComponentFramework.Context<IInputs>): number => {
  const raw = (context.parameters as unknown as Record<string, { raw?: number | string }>).serverDrivenThreshold?.raw;
  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
  if (typeof raw === 'string') {
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return CONTROL_CONFIG.serverDrivenThreshold;
};

const isLocalHost = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location?.hostname ?? '';
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
};

export async function loadGridData(
  context: ComponentFramework.Context<IInputs>,
  args: {
    tableKey: string;
    filters: unknown; // GridFilterState but keep loose to avoid circular deps
    source?: string;
    requestedBy?: string;
    currentPage: number;
    pageSize: number;
    clientSort?: ClientSortState;
    prefilters?: unknown;
    searchQuery?: string;
    country?: string;
    listYear?: string;
  },
): Promise<LoadResult> {
  const pageSize = args.pageSize ?? (context.parameters as unknown as Record<string, { raw?: number }>).pageSize?.raw ?? 500;
  const customApiName = resolveCustomApiName(context);
  const customApiType = resolveCustomApiType(context);
  const buildParams = (page: number) =>
    buildGridApiParams({
      ...args,
      currentPage: page,
      pageSize,
    });

  const execCustomApi = async (params: Record<string, string>): Promise<TaskSearchResponse> => {
    const rawPayload = await executeUnboundCustomApi<TaskSearchResponse | SalesApiResponse>(context, customApiName, params, {
      operationType: customApiType,
    });
    const payload = unwrapCustomApiPayload(rawPayload);
    return normalizeSearchResponse(payload);
  };

  try {
    const firstParams = buildParams(args.currentPage);
    if (!customApiName) {
      svtDebug.warn('Grid', 'No customApiName configured; returning empty/sample data');
      // When no custom API is configured, show local sample data (from SampleData)
      if (isLocalHost()) {
        return { items: SAMPLE_RECORDS as unknown as TaskSearchItem[], totalCount: SAMPLE_RECORDS.length, serverDriven: false };
      }
      return { items: [], totalCount: 0, serverDriven: false };
    }
    const firstPayload = await execCustomApi(firstParams);
    svtDebug.log('Grid', 'loadGridData response', {
      totalCount: firstPayload.totalCount,
      itemCount: firstPayload.items?.length,
      hasFilters: Boolean(firstPayload.filters),
      errorMessage: firstPayload.errorMessage,
    });
    const total = Number(firstPayload.totalCount ?? firstPayload.items?.length ?? 0);
    const threshold = resolveServerDrivenThreshold(context);
    const firstPageCount = firstPayload.items?.length ?? 0;
    const serverDriven = total > threshold || total > firstPageCount;
    const responseFilters = firstPayload.filters;
    return {
      items: firstPayload.items ?? [],
      totalCount: total,
      serverDriven,
      filters: responseFilters,
      errorMessage: normalizeErrorMessage(firstPayload.errorMessage),
      userLookup: firstPayload.userLookup,
      userFilterOptions: firstPayload.userFilterOptions,
    };
  } catch (err) {
    // On error, log and fall back to showing local sample data (from SampleData)
    const errText = (() => {
      if (err instanceof Error) return `${err.name}: ${err.message}`;
      if (typeof err === 'string') return err;
      try {
        return JSON.stringify(err);
      } catch {
        return 'Unknown error';
      }
    })();
    try {
      console.error('[GridDataController] loadGridData failed; showing sample data', errText);
    } catch {
      /* ignore logging failures */
    }
    // Sample fallback disabled for now; return empty set on error.
    return {
      items: [],
      totalCount: 0,
      serverDriven: false,
      errorMessage: normalizeErrorMessage(errText) ?? GENERIC_LOAD_ERROR_MESSAGE,
    };
  }
}

