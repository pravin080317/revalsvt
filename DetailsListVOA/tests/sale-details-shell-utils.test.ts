import {
  isRecord,
  toDisplayText,
  getRecord,
  getRecordFromKeys,
  getRecordFromPath,
  getRecordArray,
  getRecordArrayFromKeys,
  getRecordArrayFromPath,
  getValue,
  getValueFromPath,
  firstNonEmpty,
  formatValue,
  isHttpUrl,
  toUkDate,
  toUkCurrency,
  buildSearchUrl,
  parseSaleDetails,
  toInitials,
  toStatusTone,
  parseCsvCodes,
  isTrueLike,
  mapPadConfirmationToKey,
  toReadableLabel,
  createAttributeChip,
} from '../components/SaleDetailsShell/utils';

// ──────────────────────────────────────────────
// isRecord
// ──────────────────────────────────────────────
describe('isRecord', () => {
  test('returns true for plain objects', () => {
    expect(isRecord({ a: 1 })).toBe(true);
    expect(isRecord({})).toBe(true);
  });

  test('returns false for arrays', () => {
    expect(isRecord([])).toBe(false);
    expect(isRecord([1, 2])).toBe(false);
  });

  test('returns false for null and primitives', () => {
    expect(isRecord(null)).toBe(false);
    expect(isRecord(undefined)).toBe(false);
    expect(isRecord('text')).toBe(false);
    expect(isRecord(42)).toBe(false);
  });
});

// ──────────────────────────────────────────────
// toDisplayText
// ──────────────────────────────────────────────
describe('toDisplayText', () => {
  test('null and undefined return empty string', () => {
    expect(toDisplayText(null)).toBe('');
    expect(toDisplayText(undefined)).toBe('');
  });

  test('string values pass through', () => {
    expect(toDisplayText('hello')).toBe('hello');
  });

  test('numbers and booleans convert to string', () => {
    expect(toDisplayText(42)).toBe('42');
    expect(toDisplayText(true)).toBe('true');
    expect(toDisplayText(false)).toBe('false');
  });

  test('array values join non-empty items with comma', () => {
    expect(toDisplayText(['Alice', 'Bob'])).toBe('Alice, Bob');
    expect(toDisplayText(['Alice', '', 'Carol'])).toBe('Alice, Carol');
  });

  test('record values JSON stringify', () => {
    const result = toDisplayText({ key: 'value' });
    expect(result).toBe(JSON.stringify({ key: 'value' }));
  });
});

// ──────────────────────────────────────────────
// getRecord
// ──────────────────────────────────────────────
describe('getRecord', () => {
  test('returns the nested record when present', () => {
    const root = { details: { taskId: 'A-1' } };
    expect(getRecord(root, 'details')).toEqual({ taskId: 'A-1' });
  });

  test('returns empty object when key is missing or not a record', () => {
    expect(getRecord({}, 'details')).toEqual({});
    expect(getRecord({ details: [1, 2] }, 'details')).toEqual({});
    expect(getRecord({ details: null }, 'details')).toEqual({});
  });
});

// ──────────────────────────────────────────────
// getRecordFromKeys
// ──────────────────────────────────────────────
describe('getRecordFromKeys', () => {
  test('returns the first matching key', () => {
    const root = { salesVerificationTaskDetails: { taskId: 'A-1' }, taskDetails: { taskId: 'A-2' } };
    expect(getRecordFromKeys(root, ['salesVerificationTaskDetails', 'taskDetails'])).toEqual({ taskId: 'A-1' });
  });

  test('skips non-record values and falls back', () => {
    const root = { first: null, second: { taskId: 'A-2' } } as Record<string, unknown>;
    expect(getRecordFromKeys(root, ['first', 'second'])).toEqual({ taskId: 'A-2' });
  });

  test('returns empty object when no keys match', () => {
    expect(getRecordFromKeys({ other: {} }, ['a', 'b'])).toEqual({});
  });
});

// ──────────────────────────────────────────────
// getRecordFromPath
// ──────────────────────────────────────────────
describe('getRecordFromPath', () => {
  const root = {
    a: {
      b: {
        c: { value: 42 },
      },
    },
  };

  test('traverses dot-separated path', () => {
    expect(getRecordFromPath(root, 'a.b.c')).toEqual({ value: 42 });
  });

  test('returns empty object for missing path', () => {
    expect(getRecordFromPath(root, 'a.missing')).toEqual({});
  });

  test('returns empty object for empty path', () => {
    expect(getRecordFromPath(root, '')).toEqual({});
  });

  test('handles array index traversal', () => {
    const withArray = { items: [{ name: 'first' }, { name: 'second' }] } as Record<string, unknown>;
    expect(getRecordFromPath(withArray, 'items.0')).toEqual({ name: 'first' });
    expect(getRecordFromPath(withArray, 'items.1')).toEqual({ name: 'second' });
  });

  test('returns empty object when array index is out of bounds', () => {
    const withArray = { items: [{ name: 'first' }] } as Record<string, unknown>;
    expect(getRecordFromPath(withArray, 'items.5')).toEqual({});
  });
});

// ──────────────────────────────────────────────
// getRecordArray
// ──────────────────────────────────────────────
describe('getRecordArray', () => {
  test('returns array of records filtered from mixed array', () => {
    const root = { items: [{ id: 1 }, 'skip', null, { id: 2 }] };
    expect(getRecordArray(root, 'items')).toEqual([{ id: 1 }, { id: 2 }]);
  });

  test('returns empty array when key not present or not an array', () => {
    expect(getRecordArray({}, 'items')).toEqual([]);
    expect(getRecordArray({ items: {} }, 'items')).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// getRecordArrayFromKeys
// ──────────────────────────────────────────────
describe('getRecordArrayFromKeys', () => {
  test('returns the first array found among keys', () => {
    const root = { a: 'not-array', b: [{ id: 1 }], c: [{ id: 2 }] } as Record<string, unknown>;
    expect(getRecordArrayFromKeys(root, ['a', 'b', 'c'])).toEqual([{ id: 1 }]);
  });

  test('returns empty array when no key has an array', () => {
    expect(getRecordArrayFromKeys({ x: {}, y: 'text' }, ['x', 'y'])).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// getRecordArrayFromPath
// ──────────────────────────────────────────────
describe('getRecordArrayFromPath', () => {
  test('traverses to array and filters records', () => {
    const root = { data: { items: [{ id: 1 }, null, { id: 2 }] } } as Record<string, unknown>;
    expect(getRecordArrayFromPath(root, 'data.items')).toEqual([{ id: 1 }, { id: 2 }]);
  });

  test('returns empty array for non-array path', () => {
    const root = { data: { item: { id: 1 } } } as Record<string, unknown>;
    expect(getRecordArrayFromPath(root, 'data.item')).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// getValue / getValueFromPath
// ──────────────────────────────────────────────
describe('getValue and getValueFromPath', () => {
  test('getValue returns trimmed display text for a record key', () => {
    expect(getValue({ taskStatus: '  Assigned  ' }, 'taskStatus')).toBe('Assigned');
  });

  test('getValue returns empty string for missing key', () => {
    expect(getValue({}, 'missing')).toBe('');
  });

  test('getValueFromPath resolves dot-path and returns trimmed text', () => {
    const root = { details: { taskStatus: 'Complete' } };
    expect(getValueFromPath(root, 'details.taskStatus')).toBe('Complete');
  });
});

// ──────────────────────────────────────────────
// firstNonEmpty
// ──────────────────────────────────────────────
describe('firstNonEmpty', () => {
  test('returns first non-blank value', () => {
    expect(firstNonEmpty('', '  ', 'hello', 'world')).toBe('hello');
  });

  test('returns empty string when all are blank', () => {
    expect(firstNonEmpty('', '   ', '')).toBe('');
  });
});

// ──────────────────────────────────────────────
// formatValue
// ──────────────────────────────────────────────
describe('formatValue', () => {
  test('returns value as-is when non-empty', () => {
    expect(formatValue('Complete')).toBe('Complete');
  });

  test('returns dash placeholder for empty/blank strings', () => {
    expect(formatValue('')).toBe('-');
    expect(formatValue('   ')).toBe('-');
  });
});

// ──────────────────────────────────────────────
// isHttpUrl
// ──────────────────────────────────────────────
describe('isHttpUrl', () => {
  test('returns true for https and http URLs', () => {
    expect(isHttpUrl('https://example.com')).toBe(true);
    expect(isHttpUrl('http://example.com/path')).toBe(true);
  });

  test('returns false for non-http schemes and bare paths', () => {
    expect(isHttpUrl('ftp://example.com')).toBe(false);
    expect(isHttpUrl('/relative/path')).toBe(false);
    expect(isHttpUrl('')).toBe(false);
  });
});

// ──────────────────────────────────────────────
// toUkDate
// ──────────────────────────────────────────────
describe('toUkDate', () => {
  test('converts ISO date string to DD/MM/YYYY', () => {
    // Use UTC midnight to avoid timezone edge cases
    expect(toUkDate('2024-06-15T00:00:00.000Z')).toMatch(/15\/06\/2024/);
  });

  test('returns the original value when date cannot be parsed', () => {
    expect(toUkDate('not-a-date')).toBe('not-a-date');
  });

  test('returns empty string for empty input', () => {
    expect(toUkDate('')).toBe('');
  });
});

// ──────────────────────────────────────────────
// toUkCurrency
// ──────────────────────────────────────────────
describe('toUkCurrency', () => {
  test('formats positive number as GBP currency', () => {
    const result = toUkCurrency('250000');
    expect(result).toContain('250,000');
    expect(result).toContain('£');
  });

  test('handles pound-sign-prefixed input', () => {
    const result = toUkCurrency('£350,000');
    expect(result).toContain('350,000');
  });

  test('returns empty string for blank or dash input', () => {
    expect(toUkCurrency('')).toBe('');
    expect(toUkCurrency('-')).toBe('');
  });

  test('returns untouched non-numeric string', () => {
    expect(toUkCurrency('not-a-number')).toBe('not-a-number');
  });
});

// ──────────────────────────────────────────────
// buildSearchUrl
// ──────────────────────────────────────────────
describe('buildSearchUrl', () => {
  test('appends URL-encoded query to the base URL', () => {
    expect(buildSearchUrl('https://search.example.com/?q=', 'hello world')).toBe(
      'https://search.example.com/?q=hello%20world',
    );
  });

  test('returns empty string when query is blank', () => {
    expect(buildSearchUrl('https://search.example.com/?q=', '')).toBe('');
    expect(buildSearchUrl('https://search.example.com/?q=', '   ')).toBe('');
  });
});

// ──────────────────────────────────────────────
// parseSaleDetails
// ──────────────────────────────────────────────
describe('parseSaleDetails', () => {
  test('parses valid JSON object', () => {
    const payload = JSON.stringify({ saleId: 'S-100', taskDetails: {} });
    expect(parseSaleDetails(payload)).toEqual({ saleId: 'S-100', taskDetails: {} });
  });

  test('returns empty object for invalid JSON', () => {
    expect(parseSaleDetails('not-json')).toEqual({});
  });

  test('returns empty object for empty string', () => {
    expect(parseSaleDetails('')).toEqual({});
  });

  test('returns empty object when JSON parses to non-record', () => {
    expect(parseSaleDetails(JSON.stringify([1, 2, 3]))).toEqual({});
  });
});

// ──────────────────────────────────────────────
// toInitials
// ──────────────────────────────────────────────
describe('toInitials', () => {
  test('returns first letters of first and last name uppercased', () => {
    expect(toInitials('Alice Smith')).toBe('AS');
  });

  test('returns first two chars for single-word name', () => {
    expect(toInitials('Alice')).toBe('AL');
  });

  test('returns ? for empty string', () => {
    expect(toInitials('')).toBe('?');
    expect(toInitials('   ')).toBe('?');
  });

  test('handles multiple spaces between names', () => {
    expect(toInitials('Bob   Jones')).toBe('BJ');
  });
});

// ──────────────────────────────────────────────
// toStatusTone
// ──────────────────────────────────────────────
describe('toStatusTone', () => {
  test('returns critical for fail/reject statuses', () => {
    expect(toStatusTone('QC Failed')).toBe('critical');
    expect(toStatusTone('Rejected')).toBe('critical');
  });

  test('returns ok for complete/pass/commit statuses', () => {
    expect(toStatusTone('Complete Passed QC')).toBe('ok');
    expect(toStatusTone('committed')).toBe('ok');
  });

  test('returns warning for review/assigned statuses', () => {
    expect(toStatusTone('Under Review')).toBe('warning');
    expect(toStatusTone('Assigned')).toBe('warning');
  });

  test('returns neutral for empty or unrecognised status', () => {
    expect(toStatusTone('')).toBe('neutral');
    expect(toStatusTone('Pending')).toBe('neutral');
  });
});

// ──────────────────────────────────────────────
// parseCsvCodes
// ──────────────────────────────────────────────
describe('parseCsvCodes', () => {
  test('splits comma-separated codes', () => {
    expect(parseCsvCodes('A,B,C')).toEqual(['A', 'B', 'C']);
  });

  test('trims whitespace from each code', () => {
    expect(parseCsvCodes(' A , B , C ')).toEqual(['A', 'B', 'C']);
  });

  test('returns empty array for empty or dash input', () => {
    expect(parseCsvCodes('')).toEqual([]);
    expect(parseCsvCodes('-')).toEqual([]);
    expect(parseCsvCodes('  ')).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// isTrueLike
// ──────────────────────────────────────────────
describe('isTrueLike', () => {
  test('returns true for truthy text representations', () => {
    expect(isTrueLike('true')).toBe(true);
    expect(isTrueLike('yes')).toBe(true);
    expect(isTrueLike('1')).toBe(true);
    expect(isTrueLike('y')).toBe(true);
    expect(isTrueLike('TRUE')).toBe(true);
  });

  test('returns false for falsy and unrecognised values', () => {
    expect(isTrueLike('false')).toBe(false);
    expect(isTrueLike('no')).toBe(false);
    expect(isTrueLike('')).toBe(false);
    expect(isTrueLike('maybe')).toBe(false);
  });
});

// ──────────────────────────────────────────────
// mapPadConfirmationToKey
// ──────────────────────────────────────────────
describe('mapPadConfirmationToKey', () => {
  test('maps job-created text to key', () => {
    expect(mapPadConfirmationToKey('Data enhancement job created')).toBe('job-created');
  });

  test('maps job-not-required text to key', () => {
    expect(mapPadConfirmationToKey('Data enhancement job not required')).toBe('job-not-required');
  });

  test('maps pads-not-reviewed text to key', () => {
    expect(mapPadConfirmationToKey('PADs not reviewed')).toBe('pads-not-reviewed');
  });

  test('returns undefined for empty or dash', () => {
    expect(mapPadConfirmationToKey('')).toBeUndefined();
    expect(mapPadConfirmationToKey('-')).toBeUndefined();
  });

  test('returns undefined for unrecognised text', () => {
    expect(mapPadConfirmationToKey('some other text')).toBeUndefined();
  });
});

// ──────────────────────────────────────────────
// toReadableLabel
// ──────────────────────────────────────────────
describe('toReadableLabel', () => {
  test('converts camelCase to readable label', () => {
    expect(toReadableLabel('taskStatus')).toBe('Task Status');
    expect(toReadableLabel('saleId')).toBe('Sale Id');
  });

  test('leaves already-spaced string unchanged content', () => {
    expect(toReadableLabel('myKey')).toBe('My Key');
  });
});

// ──────────────────────────────────────────────
// createAttributeChip
// ──────────────────────────────────────────────
describe('createAttributeChip', () => {
  test('creates chip with all provided fields', () => {
    const chip = createAttributeChip('flag1', 'Flagged', 'brick', 'Tooltip text', '#ff0000');
    expect(chip).toEqual({
      key: 'flag1',
      value: 'Flagged',
      tone: 'brick',
      tooltip: 'Tooltip text',
      color: '#ff0000',
    });
  });

  test('creates chip without optional tooltip and color', () => {
    const chip = createAttributeChip('flag2', 'Active', 'teal');
    expect(chip.key).toBe('flag2');
    expect(chip.tooltip).toBeUndefined();
    expect(chip.color).toBeUndefined();
  });
});
