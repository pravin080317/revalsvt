import { Link } from '@fluentui/react';
import { ColumnConfig } from './Component.types';

// Built-in, code-defined column configuration profiles.
// Makers can select a profile via the PCF property `columnConfigProfile`.
// Any JSON provided in `columnConfig` will be merged on top to override.

export const COLUMN_PROFILES: Record<string, ColumnConfig[]> = {
  // Default sales-style grid
  sales: [
    { ColName: 'uprn', ColDisplayName: 'UPRN', ColWidth: 120 },
    { ColName: 'taskid', ColDisplayName: 'Task ID', ColWidth: 120 },
    { ColName: 'taskstatus', ColDisplayName: 'Task Status', ColCellType: 'tag', ColWidth: 140 },
    { ColName: 'caseassignedto', ColDisplayName: 'Case Assigned To', ColWidth: 180 },
    { ColName: 'address', ColDisplayName: 'Address', ColWidth: 260, ColMultiLine: true },
    { ColName: 'postcode', ColDisplayName: 'Postcode', ColWidth: 110 },
    { ColName: 'transactiondate', ColDisplayName: 'Transaction Date', ColWidth: 160 },
    { ColName: 'source', ColDisplayName: 'Source', ColWidth: 120 },
  ],
  // Other personas can start by reusing the sales definition
  allsales: [],
  myassignment: [],
  manager: [
    { ColName: 'saleid', ColDisplayName: 'Sale ID', ColWidth: 120 },
    { ColName: 'taskid', ColDisplayName: 'Task ID', ColWidth: 120, ColCellType: 'link' },
    { ColName: 'uprn', ColDisplayName: 'UPRN', ColWidth: 120 },
    { ColName: 'address', ColDisplayName: 'Address', ColWidth: 280, ColMultiLine: true },
    { ColName: 'postcode', ColDisplayName: 'Post code', ColWidth: 110 },
    { ColName: 'billingauthority', ColDisplayName: 'Billing Authority', ColWidth: 180 },
    { ColName: 'transactiondate', ColDisplayName: 'Transaction Date', ColWidth: 160 },
    { ColName: 'ratio', ColDisplayName: 'Sale Price Ratio', ColWidth: 140 },
    { ColName: 'dwellingtype', ColDisplayName: 'Dwelling Type', ColWidth: 160 },
    { ColName: 'flaggedforreview', ColDisplayName: 'Flagged for review', ColWidth: 160, ColCellType: 'tag' },
    { ColName: 'reviewflags', ColDisplayName: 'Review Flags', ColWidth: 160, ColCellType: 'tag' },
    { ColName: 'outlierratio', ColDisplayName: 'Outlier Ratio', ColWidth: 140 },
    { ColName: 'overallflag', ColDisplayName: 'Overall flag', ColWidth: 140, ColCellType: 'tag' },
    { ColName: 'summaryflags', ColDisplayName: 'Summary flag', ColWidth: 140, ColCellType: 'tag' },
    { ColName: 'taskstatus', ColDisplayName: 'Task status', ColWidth: 140, ColCellType: 'tag' },
    { ColName: 'assignedto', ColDisplayName: 'Assigned to', ColWidth: 160 },
    { ColName: 'qcassignedto', ColDisplayName: 'QC Assigned to', ColWidth: 170 },
    { ColName: 'completeddate', ColDisplayName: 'Completed date', ColWidth: 160 },
  ],
  qa: [
    { ColName: 'saleid', ColDisplayName: 'Sale ID', ColWidth: 120 },
    { ColName: 'taskid', ColDisplayName: 'Task ID', ColWidth: 120, ColCellType: 'link'  },
    { ColName: 'uprn', ColDisplayName: 'UPRN', ColWidth: 120 },
    { ColName: 'address', ColDisplayName: 'Address', ColWidth: 280, ColMultiLine: true },
    { ColName: 'postcode', ColDisplayName: 'Post code', ColWidth: 110 },
    { ColName: 'billingauthority', ColDisplayName: 'Billing Authority', ColWidth: 180 },
    { ColName: 'transactiondate', ColDisplayName: 'Transaction Date', ColWidth: 160 },
    { ColName: 'ratio', ColDisplayName: 'Sale Price Ratio', ColWidth: 140 },
    { ColName: 'dwellingtype', ColDisplayName: 'Dwelling Type', ColWidth: 160 },
    { ColName: 'flaggedforreview', ColDisplayName: 'Flagged for review', ColWidth: 160, ColCellType: 'tag' },
    { ColName: 'reviewflags', ColDisplayName: 'Review Flags', ColWidth: 160, ColCellType: 'tag' },
    { ColName: 'outlierratio', ColDisplayName: 'Outlier Ratio', ColWidth: 140 },
    { ColName: 'overallflag', ColDisplayName: 'Overall flag', ColWidth: 140, ColCellType: 'tag' },
    { ColName: 'summaryflags', ColDisplayName: 'Summary flag', ColWidth: 140, ColCellType: 'tag' },
    { ColName: 'taskstatus', ColDisplayName: 'Task status', ColWidth: 140, ColCellType: 'tag' },
    { ColName: 'assignedto', ColDisplayName: 'Assigned to', ColWidth: 160 },
    { ColName: 'qcassignedto', ColDisplayName: 'QC Assigned to', ColWidth: 170 },
    { ColName: 'completeddate', ColDisplayName: 'Completed date', ColWidth: 160 },
  ],
};

export function getProfileConfigs(key?: string): ColumnConfig[] {
  const k = (key ?? '').trim().toLowerCase();
  if (!k) return [];
  const prof = COLUMN_PROFILES[k];
  if (!prof || prof.length === 0) {
    // Fall back to sales when a known key maps to empty array
    if (k in COLUMN_PROFILES) return COLUMN_PROFILES.sales ?? [];
    return [];
  }
  return prof;
}
