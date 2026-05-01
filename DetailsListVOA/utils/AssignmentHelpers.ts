import { type AssignUser } from '../Component.types';
import { type ScreenKind } from './ScreenResolution';

export interface AssignmentConfig {
  allowedStatusesManager: string[];
  allowedStatusesQc: string[];
  allowedStatuses: string[];
}

export interface AssignmentStatusResult {
  error?: string;
  assignmentTaskStatus?: string;
}

interface AssignableUserPayload {
  id?: unknown;
  systemUserId?: unknown;
  entraObjectId?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  team?: unknown;
  role?: unknown;
  teams?: unknown;
  roles?: unknown;
}

interface AssignableUsersResult {
  success?: boolean;
  message?: string;
  users?: AssignableUserPayload[];
}

export interface AssignableUsersMessages {
  noUsersFound: string;
  assignableUsersParseFailed: string;
  assignableUsersLoadFailed: string;
}

const normalizeIdentityToken = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') return '';
  const collapsed = String(value).trim().replace(/\s+/g, ' ');
  if (!collapsed) return '';

  let start = 0;
  let end = collapsed.length;

  while (start < end && collapsed.charCodeAt(start) === 123) {
    start++;
  }
  while (end > start && collapsed.charCodeAt(end - 1) === 125) {
    end--;
  }

  return collapsed.slice(start, end).toLowerCase();
};

const addToken = (set: Set<string>, value: unknown): void => {
  const token = normalizeIdentityToken(value);
  if (token) set.add(token);
};

const parseStructuredTokenInput = (trimmed: string): unknown | undefined => {
  const looksStructured =
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
    || (trimmed.startsWith('{') && trimmed.endsWith('}'));
  if (!looksStructured) {
    return undefined;
  }

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return undefined;
  }
};

const addDelimitedTextTokens = (trimmed: string, out: Set<string>): void => {
  addToken(out, trimmed);
  trimmed
    .split(/[|;,]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '')
    .forEach((entry) => addToken(out, entry));
};

const collectRecordTokens = (record: Record<string, unknown>, out: Set<string>): void => {
  ['id', 'name', 'displayName', 'email', 'firstName', 'lastName'].forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      collectValueTokens(record[key], out);
    }
  });
};

const collectValueTokens = (value: unknown, out: Set<string>): void => {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) {
    value.forEach((entry) => collectValueTokens(entry, out));
    return;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return;

    const parsed = parseStructuredTokenInput(trimmed);
    if (parsed !== undefined && parsed !== value) {
      collectValueTokens(parsed, out);
    }

    addDelimitedTextTokens(trimmed, out);
    return;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    addToken(out, value);
    return;
  }
  if (typeof value === 'object') {
    collectRecordTokens(value as Record<string, unknown>, out);
  }
};

const resolveAllowedStatuses = (screenKind: ScreenKind, assignmentConfig: AssignmentConfig): string[] => {
  const rawAllowedStatuses =
    screenKind === 'managerAssign'
      ? assignmentConfig.allowedStatusesManager
      : screenKind === 'qcAssign'
        ? assignmentConfig.allowedStatusesQc
        : assignmentConfig.allowedStatuses;

  return rawAllowedStatuses.map((status) => status.toLowerCase());
};

const collectAssignmentStatuses = (
  records: Record<string, unknown>[],
  allowedStatuses: string[],
  invalidStatusMessage: string,
): { normalizedStatuses: string[]; rawStatuses: string[]; error?: string } => {
  const normalizedStatuses: string[] = [];
  const rawStatuses: string[] = [];

  for (const rec of records) {
    const statusRaw = (rec.taskstatus ?? rec.taskStatus ?? '') as string;
    const trimmed = String(statusRaw ?? '').trim();
    const normalized = trimmed.toLowerCase();

    if (normalized) {
      normalizedStatuses.push(normalized);
      rawStatuses.push(trimmed);
    }

    if (allowedStatuses.length > 0 && normalized && !allowedStatuses.includes(normalized)) {
      return { normalizedStatuses, rawStatuses, error: invalidStatusMessage };
    }
  }

  return { normalizedStatuses, rawStatuses };
};

const resolveStatusForAssignmentFlow = (
  requiredStatus: string,
  requiredStatusLabel: string,
  normalizedStatuses: string[],
  rawStatuses: string[],
  invalidStatusMessage: string,
): { assignmentTaskStatus?: string; error?: string } => {
  const hasRequiredStatus = normalizedStatuses.includes(requiredStatus);
  const hasMixedStatuses = normalizedStatuses.some((status) => status !== requiredStatus);

  if (hasRequiredStatus && hasMixedStatuses) {
    return { error: invalidStatusMessage };
  }

  if (hasRequiredStatus) {
    return { assignmentTaskStatus: requiredStatusLabel };
  }

  return {
    assignmentTaskStatus: rawStatuses.find((status) => status.toLowerCase() !== requiredStatus),
  };
};

const buildUserMatchTokens = (user: AssignUser): Set<string> => {
  const tokens = new Set<string>();
  const firstName = (user.firstName ?? '').trim();
  const lastName = (user.lastName ?? '').trim();
  const fullName = [firstName, lastName].filter((entry) => entry !== '').join(' ');

  addToken(tokens, user.id);
  addToken(tokens, user.email);
  addToken(tokens, firstName);
  addToken(tokens, lastName);
  addToken(tokens, fullName);

  return tokens;
};

export const resolveAssignedUserIdsToDisable = (
  records: Record<string, unknown>[],
  users: AssignUser[],
  screenKind: ScreenKind,
): string[] => {
  if (screenKind !== 'managerAssign' && screenKind !== 'qcAssign') return [];
  if (!Array.isArray(records) || records.length === 0 || !Array.isArray(users) || users.length === 0) return [];

  const fields = screenKind === 'qcAssign'
    ? ['qcassignedto', 'qcAssignedTo']
    : ['assignedto', 'assignedTo'];

  const selectedTokens = new Set<string>();
  records.forEach((record) => {
    fields.forEach((field) => collectValueTokens(record[field], selectedTokens));
  });
  if (selectedTokens.size === 0) return [];

  const disabledIds: string[] = [];
  const seen = new Set<string>();
  users.forEach((user) => {
    const userId = (user.id ?? '').trim();
    if (!userId) return;
    const normalizedUserId = normalizeIdentityToken(userId);
    if (!normalizedUserId || seen.has(normalizedUserId)) return;
    const userTokens = buildUserMatchTokens(user);
    const isAssigned = Array.from(userTokens).some((token) => selectedTokens.has(token));
    if (!isAssigned) return;
    seen.add(normalizedUserId);
    disabledIds.push(userId);
  });
  return disabledIds;
};

export const resolveAssignmentStatusValidation = (
  records: Record<string, unknown>[],
  screenKind: ScreenKind,
  assignmentConfig: AssignmentConfig,
  invalidStatusMessage: string,
): AssignmentStatusResult => {
  const allowedStatuses = resolveAllowedStatuses(screenKind, assignmentConfig);
  const statusCollection = collectAssignmentStatuses(records, allowedStatuses, invalidStatusMessage);
  if (statusCollection.error) {
    return { error: statusCollection.error };
  }

  const { normalizedStatuses, rawStatuses } = statusCollection;

  if (screenKind === 'managerAssign') {
    return resolveStatusForAssignmentFlow('new', 'New', normalizedStatuses, rawStatuses, invalidStatusMessage);
  }

  if (screenKind === 'qcAssign') {
    return resolveStatusForAssignmentFlow('qc requested', 'QC Requested', normalizedStatuses, rawStatuses, invalidStatusMessage);
  }

  return {};
};

export const parseAssignableUsersResponse = (
  response: { Result?: string; result?: string } | undefined,
  messages: AssignableUsersMessages,
): { users: AssignUser[]; info?: string; error?: string } => {
  const toSafeString = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return '';
  };

  const normalizeStringList = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    const out: string[] = [];
    const seen = new Set<string>();
    value.forEach((item) => {
      const trimmed = String(item ?? '').trim();
      if (!trimmed) return;
      const key = trimmed.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push(trimmed);
    });
    return out;
  };

  const mergeSingleIntoList = (list: string[], single: string): string[] => {
    if (!single) return list;
    const key = single.toLowerCase();
    const filtered = list.filter((v) => v.toLowerCase() !== key);
    return [single, ...filtered];
  };

  const rawResult = typeof response?.Result === 'string'
    ? response.Result
    : typeof response?.result === 'string'
      ? response.result
      : '';

  const normalizedRaw = rawResult.trim();
  if (!normalizedRaw || normalizedRaw.toLowerCase() === 'null') {
    return { users: [] as AssignUser[], info: messages.noUsersFound };
  }

  let parsed: AssignableUsersResult | undefined;
  try {
    parsed = JSON.parse(normalizedRaw) as AssignableUsersResult;
  } catch {
    return { users: [] as AssignUser[], error: messages.assignableUsersParseFailed };
  }

  if (!parsed?.success) {
    return { users: [] as AssignUser[], error: parsed?.message ?? messages.assignableUsersLoadFailed };
  }

  const users = Array.isArray(parsed.users) ? parsed.users : [];
  if (users.length === 0) {
    const message = parsed?.message?.trim() ? parsed.message : messages.noUsersFound;
    return { users: [] as AssignUser[], info: message };
  }

  const normalized = users
    .map((u) => {
      const id = toSafeString(u?.id).trim();
      const systemUserId = toSafeString(u?.systemUserId).trim();
      const entraObjectId = toSafeString(u?.entraObjectId).trim();
      const teamRaw = toSafeString(u?.team).trim();
      const roleRaw = toSafeString(u?.role).trim();
      const teams = mergeSingleIntoList(normalizeStringList(u?.teams), teamRaw);
      const roles = mergeSingleIntoList(normalizeStringList(u?.roles), roleRaw);
      const team = teamRaw || teams[0] || '';
      const role = roleRaw || roles[0] || '';
      return {
        id,
        systemUserId,
        entraObjectId,
        firstName: toSafeString(u?.firstName),
        lastName: toSafeString(u?.lastName),
        email: toSafeString(u?.email),
        team,
        role,
        teams,
        roles,
      };
    })
    .filter((u) => u.id);

  return { users: normalized };
};
