import { mapTaskItemToRecord, tryFormatDate } from '../services/DataService';
import type { TaskSearchItem } from '../data/TaskSearchSample';

describe('DataService.tryFormatDate', () => {
  test('returns empty string for empty input', () => {
    expect(tryFormatDate('')).toBe('');
    expect(tryFormatDate(undefined)).toBe('');
  });

  test('returns original value for invalid date string', () => {
    expect(tryFormatDate('not-a-date')).toBe('not-a-date');
  });

  test('formats valid date string using en-GB locale', () => {
    const formatted = tryFormatDate('2024-06-15T00:00:00.000Z');
    expect(formatted).toContain('2024');
    expect(formatted).not.toBe('2024-06-15T00:00:00.000Z');
  });
});

describe('DataService.mapTaskItemToRecord', () => {
  const baseItem: TaskSearchItem = {
    uprn: '100021234567',
    taskId: 'T-00001',
    taskStatus: 'Assigned',
    address: '1 Market Street, Bristol',
    postcode: 'BS1 1AA',
    transactionDate: '2024-04-17T09:30:00Z',
    saleId: 'S-1001',
    suid: 'SUID-1',
    billingAuthority: 'Bristol',
    salePrice: 250000,
    ratio: 0.8,
    dwellingType: 'Terraced',
    flaggedForReview: true,
    reviewFlags: ['flag-a', 'flag-b'],
    outlierRatio: 1.2,
    overallFlag: 'Amber',
    summaryFlags: ['same solicitor'],
    assignedTo: ['Alice Caseworker', 'Bob Caseworker'],
    assignedDate: '2024-04-18',
    taskCompletedDate: '2024-04-19',
    qcAssignedTo: ['QC User'],
    qcAssignedDate: '2024-04-20',
    qcCompletedDate: '2024-04-21',
  };

  test('maps core fields and entity record functions', () => {
    const record = mapTaskItemToRecord(baseItem, 0);

    expect(record.getRecordId()).toBe('T-00001');
    expect(record.getValue('taskid')).toBe('T-00001');
    expect(record.getValue('taskId')).toBe('T-00001');
    expect(record.getValue('saleid')).toBe('S-1001');
    expect(record.getValue('saleId')).toBe('S-1001');

    expect(record.getValue('assignedto')).toBe('Alice Caseworker, Bob Caseworker');
    expect(record.getValue('assignedTo')).toBe('Alice Caseworker, Bob Caseworker');

    expect(record.getValue('taskstatus')).toBe('Assigned');
    expect(record.getValue('address')).toBe('1 Market Street, Bristol');
    expect(record.getValue('postcode')).toBe('BS1 1AA');

    expect(record.getFormattedValue('saleprice')).toBe('250000');
    expect(record.getFormattedValue('flaggedforreview')).toBe('true');
    expect(record.getFormattedValue('reviewflags')).toBe('');
  });

  test('formats transaction date into transactiondate and transactionDate fields', () => {
    const record = mapTaskItemToRecord(baseItem, 0);
    const expected = tryFormatDate(baseItem.transactionDate);

    expect(record.getValue('transactiondate')).toBe(expected);
    expect(record.getValue('transactionDate')).toBe(expected);
  });

  test('falls back to uprn-index as record id when taskId is empty', () => {
    const itemWithoutTaskId = {
      ...baseItem,
      taskId: '',
      uprn: '100021999999',
    } as TaskSearchItem;

    const record = mapTaskItemToRecord(itemWithoutTaskId, 3);
    expect(record.getRecordId()).toBe('100021999999-3');
  });

  test('handles string assignedTo and empty optional values', () => {
    const minimalItem = {
      ...baseItem,
      assignedTo: 'Single User',
      saleId: undefined,
      suid: undefined,
      billingAuthority: undefined,
      salePrice: undefined,
      ratio: undefined,
      dwellingType: undefined,
      flaggedForReview: undefined,
      reviewFlags: undefined,
      outlierRatio: undefined,
      overallFlag: undefined,
      summaryFlags: undefined,
      assignedDate: undefined,
      taskCompletedDate: undefined,
      qcAssignedTo: undefined,
      qcAssignedDate: undefined,
      qcCompletedDate: undefined,
    };

    const record = mapTaskItemToRecord(minimalItem as TaskSearchItem, 1);
    expect(record.getValue('assignedto')).toBe('Single User');
    expect(record.getValue('saleid')).toBe('');
    expect(record.getValue('suid')).toBe('');
    expect(record.getValue('billingauthority')).toBe('');
    expect(record.getValue('saleprice')).toBe('');
    expect(record.getValue('reviewflags')).toEqual([]);
    expect(record.getValue('summaryflags')).toEqual([]);
  });
});
