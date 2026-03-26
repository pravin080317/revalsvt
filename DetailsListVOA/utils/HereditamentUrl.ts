import { CONTROL_CONFIG } from '../config/ControlConfig';

const SSU_FORM_ID = '4176b880-fcc3-4ee7-b915-ab163011bbcb';
const REQUEST_LINE_ITEM_VIEW_ID = 'e949034d-2b76-4a16-b3dc-aad6285025bc';

const normalizeBaseUrl = (environmentUrl: string): string => {
  const trimmed = environmentUrl.trim();
  if (!trimmed) {
    return '';
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.origin;
  } catch {
    return trimmed.replace(/\/$/, '');
  }
};

const getHostFromUrl = (rawUrl: string): string => {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return '';
  }

  try {
    return new URL(trimmed).host.toLowerCase();
  } catch {
    return '';
  }
};

const normalizeEnvironmentHostKey = (rawKey: string): string => {
  const trimmed = String(rawKey ?? '').trim();
  if (!trimmed) {
    return '';
  }
  const fromUrl = getHostFromUrl(trimmed);
  return fromUrl || trimmed.toLowerCase();
};

const parseAppIdFromHostUrl = (environmentUrl: string): string => {
  const trimmed = environmentUrl.trim();
  if (!trimmed) {
    return '';
  }

  try {
    const parsed = new URL(trimmed);
    return (parsed.searchParams.get('appid') ?? '').trim();
  } catch {
    return '';
  }
};

const parseAppIdFromCurrentBrowserUrl = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const href = String(window.location?.href ?? '').trim();
    if (!href) {
      return '';
    }
    const parsed = new URL(href);
    return (parsed.searchParams.get('appid') ?? '').trim();
  } catch {
    return '';
  }
};

const resolveConfiguredAppIdByEnvironment = (environmentUrl: string): string => {
  const map = CONTROL_CONFIG.mdaAppIdByEnvironment as Record<string, string> | undefined;
  if (!map || typeof map !== 'object') {
    return '';
  }

  const byHost = new Map<string, string>();
  Object.keys(map).forEach((key) => {
    const hostKey = normalizeEnvironmentHostKey(key);
    const appId = String(map[key] ?? '').trim();
    if (hostKey && appId) {
      byHost.set(hostKey, appId);
    }
  });

  const envHost = getHostFromUrl(environmentUrl);
  if (envHost && byHost.has(envHost)) {
    return byHost.get(envHost) ?? '';
  }

  if (typeof window !== 'undefined') {
    const browserHost = String(window.location?.host ?? '').trim().toLowerCase();
    if (browserHost && byHost.has(browserHost)) {
      return byHost.get(browserHost) ?? '';
    }
  }

  return '';
};

const resolveMdaAppId = (environmentUrl: string): string => {
  const configured = String(CONTROL_CONFIG.mdaAppId ?? '').trim();
  if (configured) {
    return configured;
  }

  const configuredByEnvironment = resolveConfiguredAppIdByEnvironment(environmentUrl);
  if (configuredByEnvironment) {
    return configuredByEnvironment;
  }

  const fromEnvironmentUrl = parseAppIdFromHostUrl(environmentUrl);
  if (fromEnvironmentUrl) {
    return fromEnvironmentUrl;
  }

  return parseAppIdFromCurrentBrowserUrl();
};

export const buildDataEnhancementUrl = (environmentUrl: string): string => {
  const baseUrl = normalizeBaseUrl(environmentUrl);
  const appId = resolveMdaAppId(environmentUrl);
  if (!baseUrl || !appId) { return ''; }
  return `${baseUrl}/main.aspx?appid=${encodeURIComponent(appId)}&newWindow=true&pagetype=entitylist&etn=voa_requestlineitem&viewid=${REQUEST_LINE_ITEM_VIEW_ID}&viewType=1039`;
};

export const buildHereditamentUrl = (environmentUrl: string, suId: string): string => {
  const baseUrl = normalizeBaseUrl(environmentUrl);
  const appId = resolveMdaAppId(environmentUrl);
  const normalizedSuid = suId.trim();
  if (!baseUrl || !normalizedSuid || !appId) {
    return '';
  }

  return `${baseUrl}/main.aspx?appid=${encodeURIComponent(appId)}&newWindow=true&pagetype=entityrecord&etn=voa_ssu&id=${encodeURIComponent(normalizedSuid)}&formid=${SSU_FORM_ID}`;
};
