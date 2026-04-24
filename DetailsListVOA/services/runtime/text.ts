export const normalizeTextValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
      .replace(/[\u2010-\u2015\u2212]/g, '-')
      .trim();
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }
  return '';
};

export const hasDisplayText = (value: unknown): boolean => {
  const normalized = normalizeTextValue(value);
  return normalized !== '' && normalized !== '-';
};

export const normalizeGuidValue = (value?: string): string => {
  const normalized = normalizeTextValue(value);
  if (!normalized) {
    return '';
  }

  let start = 0;
  let end = normalized.length;

  while (start < end && normalized.charCodeAt(start) === 123) {
    start++;
  }
  while (end > start && normalized.charCodeAt(end - 1) === 125) {
    end--;
  }

  return normalized.slice(start, end);
};
