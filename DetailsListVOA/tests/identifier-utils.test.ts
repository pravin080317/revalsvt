import { isGuidValue, normalizeSuid, normalizeUserId } from '../utils/IdentifierUtils';

describe('identifier utils', () => {
  test('normalizeUserId trims and unwraps braces', () => {
    expect(normalizeUserId('{ABCDEFAB-1234-1234-1234-ABCDEFABCDEF}')).toBe('ABCDEFAB-1234-1234-1234-ABCDEFABCDEF');
    expect(normalizeUserId(' (ABCDEFAB-1234-1234-1234-ABCDEFABCDEF) ')).toBe('ABCDEFAB-1234-1234-1234-ABCDEFABCDEF');
    expect(normalizeUserId('')).toBe('');
    expect(normalizeUserId('   ')).toBe('');
    expect(normalizeUserId(undefined)).toBe('');
  });

  test('isGuidValue validates GUIDs', () => {
    expect(isGuidValue('ABCDEFAB-1234-1234-1234-ABCDEFABCDEF')).toBe(true);
    expect(isGuidValue('not-a-guid')).toBe(false);
  });

  test('normalizeSuid returns empty for invalid values', () => {
    expect(normalizeSuid(undefined)).toBe('');
    expect(normalizeSuid(123)).toBe('');
    expect(normalizeSuid('   ')).toBe('');
    expect(normalizeSuid('null')).toBe('');
    expect(normalizeSuid('undefined')).toBe('');
    expect(normalizeSuid('not-a-guid')).toBe('');
  });

  test('normalizeSuid unwraps and validates GUID', () => {
    expect(normalizeSuid('{abcdefab-1234-1234-1234-abcdefabcdef}')).toBe('abcdefab-1234-1234-1234-abcdefabcdef');
    expect(normalizeSuid('(abcdefab-1234-1234-1234-abcdefabcdef)')).toBe('abcdefab-1234-1234-1234-abcdefabcdef');
  });
});
