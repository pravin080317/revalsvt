import { buildHereditamentUrl, buildDataEnhancementUrl } from '../utils/HereditamentUrl';
import { CONTROL_CONFIG } from '../config/ControlConfig';

const originalMdaAppId = CONTROL_CONFIG.mdaAppId;
const originalMdaAppIdByEnvironment = { ...(CONTROL_CONFIG.mdaAppIdByEnvironment ?? {}) };
type TestGlobal = typeof globalThis & { window?: unknown };
const originalWindow = (globalThis as TestGlobal).window;

afterEach(() => {
  CONTROL_CONFIG.mdaAppId = originalMdaAppId;
  CONTROL_CONFIG.mdaAppIdByEnvironment = { ...originalMdaAppIdByEnvironment };
  (globalThis as TestGlobal).window = originalWindow;
});

describe('buildHereditamentUrl', () => {
  test('builds VOS URL using app ID, suId and form ID', () => {
    CONTROL_CONFIG.mdaAppId = 'cdb5343c-51c1-ec11-983e-002248438fff';
    const url = buildHereditamentUrl(
      'https://org.crm11.dynamics.com/',
      '5e6cc9c5-9ffe-8e43-b18e-29eb0ce3cba7',
    );

    expect(url).toBe(
      'https://org.crm11.dynamics.com/main.aspx?appid=cdb5343c-51c1-ec11-983e-002248438fff&newWindow=true&pagetype=entityrecord&etn=voa_ssu&id=5e6cc9c5-9ffe-8e43-b18e-29eb0ce3cba7&formid=4176b880-fcc3-4ee7-b915-ab163011bbcb',
    );
  });

  test('returns empty string when environment URL or suId is missing', () => {
    expect(buildHereditamentUrl('', '5e6cc9c5-9ffe-8e43-b18e-29eb0ce3cba7')).toBe('');
    expect(buildHereditamentUrl('https://org.crm11.dynamics.com', '')).toBe('');
  });

  test('parses host URL and falls back to appid from URL when config appid is empty', () => {
    CONTROL_CONFIG.mdaAppId = '';
    const url = buildHereditamentUrl(
      'https://org.crm11.dynamics.com/main.aspx?appid=a63c216b-2c7f-ef11-ac21-0022481b5b80&pagetype=entityrecord',
      '5e6cc9c5-9ffe-8e43-b18e-29eb0ce3cba7',
    );

    expect(url).toBe(
      'https://org.crm11.dynamics.com/main.aspx?appid=a63c216b-2c7f-ef11-ac21-0022481b5b80&newWindow=true&pagetype=entityrecord&etn=voa_ssu&id=5e6cc9c5-9ffe-8e43-b18e-29eb0ce3cba7&formid=4176b880-fcc3-4ee7-b915-ab163011bbcb',
    );
  });
});

describe('buildDataEnhancementUrl', () => {
  test('builds request line item entity list URL using app ID and view ID', () => {
    CONTROL_CONFIG.mdaAppId = 'cdb5343c-51c1-ec11-983e-002248438fff';
    const url = buildDataEnhancementUrl('https://org.crm11.dynamics.com/');
    expect(url).toBe(
      'https://org.crm11.dynamics.com/main.aspx?appid=cdb5343c-51c1-ec11-983e-002248438fff&newWindow=true&pagetype=entitylist&etn=voa_requestlineitem&viewid=e949034d-2b76-4a16-b3dc-aad6285025bc&viewType=1039',
    );
  });

  test('returns empty string when environment URL is missing', () => {
    expect(buildDataEnhancementUrl('')).toBe('');
    expect(buildDataEnhancementUrl('  ')).toBe('');
  });

  test('uses appid from host URL when config appid is empty', () => {
    CONTROL_CONFIG.mdaAppId = '';
    const url = buildDataEnhancementUrl(
      'https://org.crm11.dynamics.com/main.aspx?appid=a63c216b-2c7f-ef11-ac21-0022481b5b80&pagetype=entitylist',
    );

    expect(url).toBe(
      'https://org.crm11.dynamics.com/main.aspx?appid=a63c216b-2c7f-ef11-ac21-0022481b5b80&newWindow=true&pagetype=entitylist&etn=voa_requestlineitem&viewid=e949034d-2b76-4a16-b3dc-aad6285025bc&viewType=1039',
    );
  });

  test('returns empty string when appid cannot be resolved from config or host URL', () => {
    CONTROL_CONFIG.mdaAppId = '';
    expect(buildDataEnhancementUrl('https://org.crm11.dynamics.com')).toBe('');
  });

  test('falls back to appid from current browser URL when env URL has no appid', () => {
    CONTROL_CONFIG.mdaAppId = '';
    (globalThis as unknown as { window?: { location?: { href?: string } } }).window = {
      location: {
        href: 'https://org.crm11.dynamics.com/main.aspx?appid=a63c216b-2c7f-ef11-ac21-0022481b5b80&pagetype=entityrecord',
      },
    };

    const url = buildDataEnhancementUrl('https://org.crm11.dynamics.com');
    expect(url).toBe(
      'https://org.crm11.dynamics.com/main.aspx?appid=a63c216b-2c7f-ef11-ac21-0022481b5b80&newWindow=true&pagetype=entitylist&etn=voa_requestlineitem&viewid=e949034d-2b76-4a16-b3dc-aad6285025bc&viewType=1039',
    );
  });

  test('falls back to environment app id from config map when env var is empty', () => {
    CONTROL_CONFIG.mdaAppId = '';
    CONTROL_CONFIG.mdaAppIdByEnvironment = {
      'voabstdev.crm11.dynamics.com': 'dev-app-id-123',
    };

    const url = buildDataEnhancementUrl('https://voabstdev.crm11.dynamics.com');
    expect(url).toBe(
      'https://voabstdev.crm11.dynamics.com/main.aspx?appid=dev-app-id-123&newWindow=true&pagetype=entitylist&etn=voa_requestlineitem&viewid=e949034d-2b76-4a16-b3dc-aad6285025bc&viewType=1039',
    );
  });

  test('env var app id takes precedence over environment app id map', () => {
    CONTROL_CONFIG.mdaAppId = 'env-override-app-id';
    CONTROL_CONFIG.mdaAppIdByEnvironment = {
      'voabstdev.crm11.dynamics.com': 'dev-app-id-123',
    };

    const url = buildDataEnhancementUrl('https://voabstdev.crm11.dynamics.com');
    expect(url).toBe(
      'https://voabstdev.crm11.dynamics.com/main.aspx?appid=env-override-app-id&newWindow=true&pagetype=entitylist&etn=voa_requestlineitem&viewid=e949034d-2b76-4a16-b3dc-aad6285025bc&viewType=1039',
    );
  });
});
