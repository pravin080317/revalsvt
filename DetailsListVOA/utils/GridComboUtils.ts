import { IComboBoxOption } from '@fluentui/react';

import { type ColumnFilterValue } from './GridColumnFilters';

export const comboBoxStyles240x200 = {
  root: { width: '100%' },
  callout: { minWidth: 240 },
  optionsContainer: { minWidth: 200 },
};

export const comboBoxStyles240x240 = {
  root: { width: '100%' },
  callout: { minWidth: 240 },
  optionsContainer: { minWidth: 240 },
};

export function buildExactMatchHighlightedOptions(
  options: IComboBoxOption[],
  exactMatchKey: string | number | undefined,
  highlightBorder: string,
  hoverBackground: string,
): IComboBoxOption[] {
  if (!exactMatchKey) {
    return options;
  }

  return options.map((option) => {
    if (String(option.key) !== String(exactMatchKey)) {
      return option;
    }

    const highlight = {
      backgroundColor: hoverBackground,
      outline: `2px solid ${highlightBorder}`,
      outlineOffset: '-2px',
    };

    return {
      ...option,
      styles: {
        ...option.styles,
        root: [option.styles?.root, highlight],
        rootHovered: [option.styles?.rootHovered, highlight],
        rootFocused: [option.styles?.rootFocused, highlight],
        rootPressed: [option.styles?.rootPressed, highlight],
      },
    };
  });
}

export function getNextMultiSelectValues(
  currentValues: string[],
  option: IComboBoxOption,
  hasSelectAll: boolean,
  selectAllKey: string,
  multiLimit?: number,
): string[] {
  const nextValues = hasSelectAll
    ? currentValues.filter((key) => String(key) !== selectAllKey)
    : [...currentValues];
  const optionKey = String(option.key);
  const existingIndex = nextValues.indexOf(optionKey);

  if (option.selected) {
    if (existingIndex === -1) {
      nextValues.push(optionKey);
    }
  } else if (existingIndex !== -1) {
    nextValues.splice(existingIndex, 1);
  }

  if (multiLimit && nextValues.length > multiLimit) {
    return nextValues.slice(nextValues.length - multiLimit);
  }

  return nextValues;
}

export function resolveMenuMultiSelectValue(
  previousValue: ColumnFilterValue,
  option: IComboBoxOption,
  hasSelectAll: boolean,
  selectAllKey: string,
  isSingleAll: boolean,
  selectAllValues: string[],
  multiLimit?: number,
): string[] {
  if (hasSelectAll && String(option.key) === selectAllKey) {
    return isSingleAll ? [selectAllKey] : selectAllValues;
  }

  const currentValues = Array.isArray(previousValue)
    ? previousValue.map((value) => String(value))
    : [];

  return getNextMultiSelectValues(currentValues, option, hasSelectAll, selectAllKey, multiLimit);
}
