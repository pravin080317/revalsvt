import { type IDropdownOption } from '@fluentui/react';
import { type GridFilterState, type SearchByOption } from '../Filters';
import {
  ID_FIELD_MAX_LENGTH,
  TASK_ID_MIN_LENGTH,
  UPRN_MAX_LENGTH,
  sanitizeAlphaNumHyphen,
  sanitizeDigits,
  sanitizeTaskIdInput,
} from '../utils/SalesSearchValidation';

export type SearchControlType =
  | 'text'
  | 'numeric'
  | 'dateRange'
  | 'singleSelect'
  | 'multiSelect'
  | 'textContains'
  | 'textPrefix';

export interface SearchFieldConfig {
  key: SearchByOption;
  label: string;
  control: SearchControlType;
  stateKey: keyof GridFilterState;
  minLength?: number;
  placeholder?: string;
  tooltip?: string;
  inputMode?: 'numeric';
  transform?: (value?: string) => string;
  optionFields?: string[];
  options?: IDropdownOption[];
  selectAll?: boolean;
  selectAllValues?: string[];
  multiLimit?: number;
}

export const SALES_SEARCH_OPTIONS: SearchByOption[] = [
  'address',
  'saleId',
  'taskId',
  'uprn',
  'billingAuthority',
];

export const SEARCH_FIELD_CONFIGS: Record<SearchByOption, SearchFieldConfig> = {
  manualCheck: {
    key: 'manualCheck',
    label: 'Manual check',
    control: 'singleSelect',
    stateKey: 'manualCheck',
    options: [
      { key: 'all', text: 'All' },
      { key: 'yes', text: 'Yes' },
      { key: 'no', text: 'No' },
    ],
  },
  street: { key: 'street', label: 'Street', control: 'textContains', stateKey: 'street', minLength: 1 },
  town: { key: 'town', label: 'Town/City', control: 'textContains', stateKey: 'townCity', minLength: 1 },
  source: { key: 'source', label: 'Source', control: 'textContains', stateKey: 'source', minLength: 1 },
  outlierKeySale: {
    key: 'outlierKeySale',
    label: 'Outlier / Key sale',
    control: 'multiSelect',
    stateKey: 'outlierKeySale',
    options: [
      { key: 'Outlier', text: 'Outlier' },
      { key: 'Key sale', text: 'Key sale' },
    ],
    selectAll: true,
    selectAllValues: ['Outlier', 'Key sale'],
  },
  saleId: {
    key: 'saleId',
    label: 'Sale ID',
    control: 'text',
    stateKey: 'saleId',
    placeholder: 'S-1000001',
    tooltip: 'Format: S-1234567.',
    transform: (v) => sanitizeAlphaNumHyphen(v, ID_FIELD_MAX_LENGTH),
  },
  taskId: {
    key: 'taskId',
    label: 'Task ID',
    control: 'text',
    stateKey: 'taskId',
    placeholder: 'A-1000001 or 1000001',
    minLength: TASK_ID_MIN_LENGTH,
    tooltip: 'Use A- or M- prefix (e.g. A-1000001) or numbers only.',
    transform: (v) => sanitizeTaskIdInput(v, ID_FIELD_MAX_LENGTH),
  },
  uprn: {
    key: 'uprn',
    label: 'UPRN',
    control: 'text',
    stateKey: 'uprn',
    placeholder: '12345678',
    tooltip: 'Digits only.',
    inputMode: 'numeric',
    transform: (v) => sanitizeDigits(v, UPRN_MAX_LENGTH),
  },
  address: {
    key: 'address',
    label: 'Address',
    control: 'textContains',
    stateKey: 'address',
    minLength: 3,
    placeholder: 'Enter address',
    tooltip: 'Enter at least 3 characters.',
  },
  postcode: {
    key: 'postcode',
    label: 'Post code',
    control: 'textPrefix',
    stateKey: 'postcode',
    minLength: 2,
    placeholder: 'CF10 1AA',
    tooltip: 'Enter a full or partial UK postcode.',
    transform: (v) => (v ?? '').toUpperCase(),
  },
  billingAuthority: {
    key: 'billingAuthority',
    label: 'Billing Authority',
    control: 'multiSelect',
    stateKey: 'billingAuthority',
    optionFields: ['billingauthority'],
    multiLimit: 3,
  },
  transactionDate: { key: 'transactionDate', label: 'Transaction Date', control: 'dateRange', stateKey: 'transactionDate' },
  salePrice: { key: 'salePrice', label: 'Sale Price', control: 'numeric', stateKey: 'salePrice' },
  ratio: { key: 'ratio', label: 'Ratio', control: 'numeric', stateKey: 'ratio' },
  dwellingType: {
    key: 'dwellingType',
    label: 'Dwelling Type',
    control: 'multiSelect',
    stateKey: 'dwellingType',
    optionFields: ['dwellingtype'],
    selectAll: true,
  },
  flaggedForReview: {
    key: 'flaggedForReview',
    label: 'Flagged for review',
    control: 'singleSelect',
    stateKey: 'flaggedForReview',
    options: [
      { key: 'true', text: 'Yes' },
      { key: 'false', text: 'No' },
    ],
  },
  reviewFlags: {
    key: 'reviewFlags',
    label: 'Review Flags',
    control: 'multiSelect',
    stateKey: 'reviewFlags',
    optionFields: ['reviewflags'],
    selectAll: true,
  },
  outlierRatio: { key: 'outlierRatio', label: 'Outlier Ratio', control: 'numeric', stateKey: 'outlierRatio' },
  overallFlag: {
    key: 'overallFlag',
    label: 'Overall flag',
    control: 'multiSelect',
    stateKey: 'overallFlag',
    options: [
      { key: 'Exclude', text: 'Exclude' },
      { key: 'Exclude potential false', text: 'Exclude potential false' },
      { key: 'Investigate can use', text: 'Investigate can use' },
      { key: 'Investigate do not use', text: 'Investigate do not use' },
      { key: 'No flag', text: 'No flag' },
      { key: 'Not fully HPI adjusted', text: 'Not fully HPI adjusted' },
      { key: 'Remove', text: 'Remove' },
    ],
    selectAll: true,
    selectAllValues: [
      'Exclude',
      'Exclude potential false',
      'Investigate can use',
      'Investigate do not use',
      'No flag',
      'Not fully HPI adjusted',
      'Remove',
    ],
  },
  summaryFlag: {
    key: 'summaryFlag',
    label: 'Summary flag',
    control: 'textContains',
    stateKey: 'summaryFlag',
    minLength: 3,
  },
  taskStatus: {
    key: 'taskStatus',
    label: 'Task status',
    control: 'multiSelect',
    stateKey: 'taskStatus',
    optionFields: ['taskstatus', 'status', 'statuscode'],
    selectAll: true,
  },
  assignedTo: {
    key: 'assignedTo',
    label: 'Assigned to',
    control: 'singleSelect',
    stateKey: 'assignedTo',
    optionFields: ['assignedto'],
  },
  assignedDate: { key: 'assignedDate', label: 'Assigned date', control: 'dateRange', stateKey: 'assignedDate' },
  taskCompletedDate: { key: 'taskCompletedDate', label: 'Task completed date', control: 'dateRange', stateKey: 'taskCompletedDate' },
  qcAssignedTo: {
    key: 'qcAssignedTo',
    label: 'QC Assigned to',
    control: 'singleSelect',
    stateKey: 'qcAssignedTo',
    optionFields: ['qcassignedto'],
  },
  qcAssignedDate: { key: 'qcAssignedDate', label: 'QC Assigned date', control: 'dateRange', stateKey: 'qcAssignedDate' },
  qcCompletedDate: { key: 'qcCompletedDate', label: 'QC Completed date', control: 'dateRange', stateKey: 'qcCompletedDate' },
};
