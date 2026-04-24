import { sanitizeExternalUrl } from '../components/SaleDetailsShell/utils';

describe('external URL sanitization', () => {
  test('allows absolute http and https URLs', () => {
    expect(sanitizeExternalUrl('https://example.com/path')).toBe('https://example.com/path');
    expect(sanitizeExternalUrl('http://example.com')).toBe('http://example.com');
  });

  test('blocks protocol-relative and non-http schemes', () => {
    const javascriptSchemePayload = ['java', 'script', ':', 'alert(1)'].join('');
    const dataSchemePayload = ['data', ':text/html,', '<', 'script', '>', 'alert(1)', '</', 'script', '>'].join('');

    expect(sanitizeExternalUrl('//evil.example.com')).toBe('');
    expect(sanitizeExternalUrl(javascriptSchemePayload)).toBe('');
    expect(sanitizeExternalUrl(dataSchemePayload)).toBe('');
    expect(sanitizeExternalUrl('ftp://example.com/file.txt')).toBe('');
  });

  test('resolves relative URLs only when explicitly allowed with a base URL', () => {
    expect(sanitizeExternalUrl('/sites/case/file.jpg')).toBe('');
    expect(
      sanitizeExternalUrl('/sites/case/file.jpg', {
        allowRelative: true,
        relativeBaseUrl: 'https://contoso.sharepoint.com/',
      }),
    ).toBe('https://contoso.sharepoint.com/sites/case/file.jpg');
  });

  test('blocks unknown/bare URL values', () => {
    expect(sanitizeExternalUrl('www.example.com/path')).toBe('');
    expect(sanitizeExternalUrl('some-relative-path/file.jpg')).toBe('');
  });
});
