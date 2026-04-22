import { normalizeTextValue } from '../services/runtime/text';

describe('runtime text normalization', () => {
  test('normalizes en dash role names to plain hyphen for access checks', () => {
    expect(normalizeTextValue('VOA – SVT User')).toBe('VOA - SVT User');
    expect(normalizeTextValue('VOA – SVT Manager,VOA – SVT User').toLowerCase())
      .toBe('voa - svt manager,voa - svt user');
  });

  test('preserves existing plain hyphen text', () => {
    expect(normalizeTextValue('VOA - SVT Manager')).toBe('VOA - SVT Manager');
  });
});