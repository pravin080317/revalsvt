import { IInputs } from '../../generated/ManifestTypes';
import { normalizeCustomApiName, resolveCustomApiOperationType } from '../CustomApi';
import { hasDisplayText, normalizeGuidValue, normalizeTextValue, stripHtmlTags } from './text';

export type RuntimeActionType =
  | 'back'
  | 'viewSale'
  | 'viewSalePcf'
  | 'completeSalesVerificationTask'
  | 'submitSalesVerificationTaskForQc'
  | 'submitQcOutcome'
  | 'viewQcLog'
  | 'viewAuditHistory';

export interface ManualTaskCreationResult {
  success: boolean;
  message: string;
  payload: string;
}

export interface ModifyTaskResult {
  success: boolean;
  message: string;
}

export interface ApiMutationResult {
  success: boolean;
  message: string;
}

const TECHNICAL_ERROR_MESSAGE = 'Technical error. Please try again in some time.';
const GENERIC_ERROR_MESSAGE = 'Unable to process your request. Please try again.';

const stripHtmlAndNormalizeWhitespace = (value: string): string =>
  stripHtmlTags(value)
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
    const keys = ['errorMessage', 'message', 'Message', 'error', 'Error', 'innerError', 'response', 'responseText', '_message', 'title', 'detail'];
    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(record, key)) continue;
      const nested = extractMessageFromUnknown(record[key], depth + 1);
      if (nested) return nested;
    }
  }

  return undefined;
};

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

const sanitizeMutationErrorMessage = (message: string | undefined, fallback: string): string => {
  const extracted = extractMessageFromUnknown(message) ?? message ?? '';
  const cleaned = stripHtmlAndNormalizeWhitespace(extracted);
  const normalized = cleaned.toLowerCase();
  if (!cleaned) {
    return fallback || GENERIC_ERROR_MESSAGE;
  }

  if (isServerErrorMessage(normalized)) {
    return TECHNICAL_ERROR_MESSAGE;
  }

  if (isBadRequestStyleMessage(normalized) || normalized.includes('<!doctype html') || normalized.includes('<html')) {
    return fallback || GENERIC_ERROR_MESSAGE;
  }

  if (cleaned.length > 240 || normalized.includes('clientrequestid') || normalized.includes('actionstack')) {
    return fallback || GENERIC_ERROR_MESSAGE;
  }

  return cleaned;
};

export const resolveConfiguredApiName = (
  context: ComponentFramework.Context<IInputs>,
  paramName: string,
  fallbackApiName?: string,
): string => {
  const raw = (context.parameters as unknown as Record<string, { raw?: string }>)[paramName]?.raw;
  const fromContext = normalizeCustomApiName(typeof raw === 'string' ? raw : undefined);
  const fallback = normalizeCustomApiName(fallbackApiName);
  return fromContext || fallback || '';
};

export const resolveConfiguredApiType = (
  context: ComponentFramework.Context<IInputs>,
  paramName: string,
  fallbackApiType?: string,
): number => {
  const raw = (context.parameters as unknown as Record<string, { raw?: string }>)[paramName]?.raw;
  const fromContext = typeof raw === 'string' ? raw : undefined;
  return resolveCustomApiOperationType(fromContext ?? fallbackApiType);
};

export const resolveCurrentUserId = (context: ComponentFramework.Context<IInputs>): string => {
  const fromContext = (context.userSettings as { userId?: string } | undefined)?.userId;
  if (hasDisplayText(fromContext)) {
    return normalizeGuidValue(fromContext);
  }

  const xrm = (globalThis as {
    Xrm?: { Utility?: { getGlobalContext?: () => { userSettings?: { userId?: string } } } };
  }).Xrm;
  const fromXrm = xrm?.Utility?.getGlobalContext?.()?.userSettings?.userId;
  return normalizeGuidValue(fromXrm);
};

export const resolveCurrentUserDisplayName = (context: ComponentFramework.Context<IInputs>): string => {
  const contextSettings = context.userSettings as { userName?: string; userDisplayName?: string } | undefined;
  const fromContext = normalizeTextValue(contextSettings?.userName)
    || normalizeTextValue(contextSettings?.userDisplayName);
  if (fromContext) {
    return fromContext;
  }

  const xrm = (globalThis as {
    Xrm?: { Utility?: { getGlobalContext?: () => { userSettings?: { userName?: string } } } };
  }).Xrm;
  return normalizeTextValue(xrm?.Utility?.getGlobalContext?.()?.userSettings?.userName);
};

export const unwrapCustomApiPayload = (payload: unknown): unknown => {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const raw = record.Result ?? record.result;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw) as unknown;
      } catch {
        return raw;
      }
    }
  }
  return payload;
};

export const parseManualTaskCreationResult = (response: unknown): ManualTaskCreationResult => {
  const parsed = parseManualTaskCreationCandidate(unwrapCustomApiPayload(response))
    ?? parseManualTaskCreationCandidate(response);
  if (parsed) {
    parsed.message = sanitizeMutationErrorMessage(parsed.message, parsed.success ? 'Manual task creation succeeded.' : 'Manual task creation failed.');
    return parsed;
  }
  return { success: false, message: 'Manual task creation failed.', payload: '' };
};

const parseManualTaskCreationCandidate = (
  candidate: unknown,
  depth = 0,
): ManualTaskCreationResult | undefined => {
  if (depth > 5 || candidate === null || candidate === undefined) {
    return undefined;
  }

  if (typeof candidate === 'string') {
    const trimmed = candidate.trim();
    if (!trimmed) {
      return undefined;
    }
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return parseManualTaskCreationCandidate(parsed, depth + 1)
        ?? { success: false, message: trimmed, payload: trimmed };
    } catch {
      const normalized = trimmed.replace(/^['"]|['"]$/g, '').trim().toLowerCase();
      const success = ['success', 'succeeded', 'ok', 'true'].includes(normalized);
      return { success, message: trimmed, payload: trimmed };
    }
  }

  if (typeof candidate === 'object') {
    const record = candidate as Record<string, unknown>;
    const nested = record.Result ?? record.result;
    if (nested !== undefined) {
      const parsedNested = parseManualTaskCreationCandidate(nested, depth + 1);
      if (parsedNested) {
        return parsedNested;
      }
    }

    const hasKnownFields = Object.prototype.hasOwnProperty.call(record, 'success')
      || Object.prototype.hasOwnProperty.call(record, 'message')
      || Object.prototype.hasOwnProperty.call(record, 'payload');
    if (hasKnownFields) {
      return {
        success: record.success === true,
        message: normalizeTextValue(record.message),
        payload: normalizeTextValue(record.payload),
      };
    }
  }

  return undefined;
};

export const parseModifyTaskResult = (response: unknown): ModifyTaskResult => {
  const parsed = parseModifyTaskCandidate(unwrapCustomApiPayload(response))
    ?? parseModifyTaskCandidate(response);
  if (parsed) {
    parsed.message = sanitizeMutationErrorMessage(parsed.message, parsed.success ? 'Modify SVT task succeeded.' : 'Modify SVT task failed.');
    return parsed;
  }

  return {
    success: false,
    message: 'Modify SVT task failed.',
  };
};

const parseModifyTaskCandidate = (
  candidate: unknown,
  depth = 0,
): ModifyTaskResult | undefined => {
  if (depth > 5 || candidate === null || candidate === undefined) {
    return undefined;
  }

  if (typeof candidate === 'string') {
    const trimmed = candidate.trim();
    if (!trimmed) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return parseModifyTaskCandidate(parsed, depth + 1)
        ?? {
          success: false,
          message: trimmed,
        };
    } catch {
      const normalized = trimmed.replace(/^['"]|['"]$/g, '').trim().toLowerCase();
      const success = ['success', 'succeed', 'succeeded', 'ok', 'true'].includes(normalized);
      return {
        success,
        message: trimmed,
      };
    }
  }

  if (typeof candidate === 'object') {
    const record = candidate as Record<string, unknown>;
    const nested = record.Result ?? record.result ?? record.payload ?? record.message;
    if (nested !== undefined) {
      const parsedNested = parseModifyTaskCandidate(nested, depth + 1);
      if (parsedNested) {
        return parsedNested;
      }
    }

    if (Object.prototype.hasOwnProperty.call(record, 'success')) {
      return {
        success: record.success === true,
        message: normalizeTextValue(record.message) || normalizeTextValue(record.payload),
      };
    }
  }

  return undefined;
};

const SUCCESS_HINTS = ['success', 'succeed', 'succeeded', 'ok', 'completed', 'submitted', 'updated', 'passed'];
const FAILURE_HINTS = ['fail', 'failed', 'error', 'invalid', 'forbidden', 'denied'];

const parseMutationFromString = (
  candidate: string,
  depth: number,
): ApiMutationResult | undefined => {
  const trimmed = candidate.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return parseMutationResultCandidate(parsed, depth + 1)
      ?? {
        success: false,
        message: trimmed,
      };
  } catch {
    const normalized = trimmed.replace(/^['"]|['"]$/g, '').trim().toLowerCase();
    if (SUCCESS_HINTS.some((hint) => normalized.includes(hint))) {
      return { success: true, message: trimmed };
    }

    if (FAILURE_HINTS.some((hint) => normalized.includes(hint))) {
      return { success: false, message: trimmed };
    }

    return { success: false, message: trimmed };
  }
};

const parseMutationFromObject = (
  candidate: Record<string, unknown>,
  depth: number,
): ApiMutationResult | undefined => {
  const nested = candidate.Result ?? candidate.result ?? candidate.payload ?? candidate.message ?? candidate.status;
  if (nested !== undefined) {
    const parsedNested = parseMutationResultCandidate(nested, depth + 1);
    if (parsedNested) {
      return parsedNested;
    }
  }

  if (Object.prototype.hasOwnProperty.call(candidate, 'success')) {
    return {
      success: candidate.success === true,
      message: normalizeTextValue(candidate.message) || normalizeTextValue(candidate.payload),
    };
  }

  return undefined;
};

const parseMutationResultCandidate = (
  candidate: unknown,
  depth = 0,
): ApiMutationResult | undefined => {
  if (depth > 6 || candidate === null || candidate === undefined) {
    return undefined;
  }

  if (typeof candidate === 'string') {
    return parseMutationFromString(candidate, depth);
  }

  if (typeof candidate === 'object') {
    return parseMutationFromObject(candidate as Record<string, unknown>, depth);
  }

  return undefined;
};

export const parseApiMutationResult = (response: unknown, fallbackFailureMessage: string): ApiMutationResult => {
  const parsed = parseMutationResultCandidate(unwrapCustomApiPayload(response))
    ?? parseMutationResultCandidate(response);
  if (parsed) {
    parsed.message = sanitizeMutationErrorMessage(parsed.message, fallbackFailureMessage);
    if (!parsed.success && !parsed.message) {
      return { success: false, message: fallbackFailureMessage };
    }
    return parsed;
  }

  return {
    success: false,
    message: fallbackFailureMessage,
  };
};
export const extractTaskIdFromUnknown = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return extractTaskIdFromString(value);
  }

  if (Array.isArray(value)) {
    return extractTaskIdFromCollection(value);
  }

  if (typeof value === 'object') {
    return extractTaskIdFromObject(value as Record<string, unknown>);
  }

  return '';
};

const TASK_ID_KEY_CANDIDATES = ['taskId', 'taskid', 'svtTaskId', 'svttaskid', 'manualTaskId', 'id'];

const extractTaskIdFromCollection = (values: unknown[]): string => {
  for (const item of values) {
    const found = extractTaskIdFromUnknown(item);
    if (found) {
      return found;
    }
  }
  return '';
};

const extractTaskIdFromObject = (record: Record<string, unknown>): string => {
  for (const key of TASK_ID_KEY_CANDIDATES) {
    if (!Object.prototype.hasOwnProperty.call(record, key)) {
      continue;
    }

    const found = extractTaskIdFromUnknown(record[key]);
    if (found) {
      return found;
    }
  }

  return extractTaskIdFromCollection(Object.values(record));
};

const extractTaskIdFromString = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const directMatch = /\bM-\d+\b/i.exec(trimmed) ?? /\b[A-Za-z]-\d+\b/.exec(trimmed);
  if (directMatch?.[0]) {
    return directMatch[0].toUpperCase();
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    const nested = extractTaskIdFromUnknown(parsed);
    if (nested) {
      return nested;
    }
  } catch {
    // continue to single-quote fallback parsing below
  }

  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      const normalizedJson = trimmed.replace(/'/g, '"');
      const parsed = JSON.parse(normalizedJson) as unknown;
      return extractTaskIdFromUnknown(parsed);
    } catch {
      return '';
    }
  }

  return '';
};

