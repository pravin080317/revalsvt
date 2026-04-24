import { ContextualMenuItemType, IContextualMenuItem } from '@fluentui/react';

/**
 * Builds the sort ascending and descending menu items for column headers
 */
export function buildSortMenuItems(
  commonText: { columnMenu: { sortAscending: string; sortDescending: string } },
  onSortAscending: () => void,
  onSortDescending: () => void,
): IContextualMenuItem[] {
  return [
    {
      key: 'sortAsc',
      text: commonText.columnMenu.sortAscending,
      iconProps: { iconName: 'SortUp' },
      onClick: onSortAscending,
    },
    {
      key: 'sortDesc',
      text: commonText.columnMenu.sortDescending,
      iconProps: { iconName: 'SortDown' },
      onClick: onSortDescending,
    },
  ];
}

/**
 * Builds a divider menu item
 */
export function buildDividerMenuItem(): IContextualMenuItem {
  return {
    key: 'divider',
    itemType: ContextualMenuItemType.Divider,
  };
}

/**
 * Computes the error message for date range filter validation
 */
export function computeDateRangeFilterError(
  hasDateRangeStart: boolean,
  isDateRangeInvalidOrder: boolean,
  columnName: string,
): string {
  if (!hasDateRangeStart) {
    return `Select a start date for ${columnName} to enable filtering.`;
  }
  if (isDateRangeInvalidOrder) {
    return `End date for ${columnName} must be on or after the start date.`;
  }
  return 'Enter or select a filter value before applying.';
}

/**
 * Computes the helper text for incomplete date range filters
 */
export function computeDateRangeIncompleteText(
  hasDateRangeStart: boolean,
  columnName: string,
): string {
  if (!hasDateRangeStart) {
    return `Select a start date for ${columnName} to enable the end date.`;
  }
  return `Select an end date for ${columnName} to apply this filter.`;
}
