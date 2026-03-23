import { buildHereditamentUrl, buildDataEnhancementUrl } from '../utils/HereditamentUrl';

describe('buildHereditamentUrl', () => {
  test('builds VOS URL using app ID, suId and form ID', () => {
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
});

describe('buildDataEnhancementUrl', () => {
  test('builds request line item entity list URL using app ID and view ID', () => {
    const url = buildDataEnhancementUrl('https://org.crm11.dynamics.com/');
    expect(url).toBe(
      'https://org.crm11.dynamics.com/main.aspx?appid=cdb5343c-51c1-ec11-983e-002248438fff&newWindow=true&pagetype=entitylist&etn=voa_requestlineitem&viewid=e949034d-2b76-4a16-b3dc-aad6285025bc&viewType=1039',
    );
  });

  test('returns empty string when environment URL is missing', () => {
    expect(buildDataEnhancementUrl('')).toBe('');
    expect(buildDataEnhancementUrl('  ')).toBe('');
  });
});
