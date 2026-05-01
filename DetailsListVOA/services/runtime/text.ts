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

export const stripHtmlTags = (value: string): string => {
  let output = '';
  let inTag = false;

  for (let i = 0; i < value.length; i++) {
    const ch = value.charCodeAt(i);
    if (ch === 60) {
      inTag = true;
      output += ' ';
      continue;
    }
    if (ch === 62 && inTag) {
      inTag = false;
      continue;
    }
    if (!inTag) {
      output += value[i];
    }
  }

  return output;
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
