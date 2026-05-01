import type { GridFilterState } from '../Filters';
import {
  buildApiParamsFor,
  getColumnFilterConfigFor,
  getSearchByOptionsFor,
  isLookupFieldFor,
  isViewSalesRecordEnabledFor,
} from '../config/TableConfigs';

describe('table column filter config', () => {
  test('shows Yes/No labels for flagged for review', () => {
    expect(getColumnFilterConfigFor('sales', 'flaggedForReview')).toEqual({
      control: 'singleSelect',
      options: [
        { key: 'true', text: 'Yes' },
        { key: 'false', text: 'No' },
      ],
      minLength: 1,
    });
  });

  test('keeps assigned-to fields as lookup single-selects across all table keys', () => {
    const tableKeys = ['sales', 'allsales', 'myassignment', 'manager', 'qa', 'qaassign', 'qaview'];

    tableKeys.forEach((tableKey) => {
      expect(getColumnFilterConfigFor(tableKey, 'assignedto')).toEqual({
        control: 'singleSelect',
        optionFields: ['assignedto'],
        minLength: 1,
      });
      expect(getColumnFilterConfigFor(tableKey, 'qcassignedto')).toEqual({
        control: 'singleSelect',
        optionFields: ['qcassignedto'],
        minLength: 1,
      });
      expect(isLookupFieldFor(tableKey, 'assignedto')).toBe(true);
      expect(isLookupFieldFor(tableKey, 'qcassignedto')).toBe(true);
    });
  });

  test('returns undefined config for empty field name', () => {
    expect(getColumnFilterConfigFor('sales', undefined)).toBeUndefined();
  });

  test('normalizes field name lookup and table fallback', () => {
    expect(getColumnFilterConfigFor('unknown-table', 'Assigned To')?.control).toBe('singleSelect');
    expect(getColumnFilterConfigFor('sales', 'Assigned-To')?.control).toBe('singleSelect');
  });

  test('returns false for lookup check when field name is missing', () => {
    expect(isLookupFieldFor('sales', undefined)).toBe(false);
  });

  test('unknown table falls back to sales search options and view-sales-record flag', () => {
    expect(getSearchByOptionsFor('unknown-table')).toEqual(getSearchByOptionsFor('sales'));
    expect(isViewSalesRecordEnabledFor('unknown-table')).toBe(true);
  });

  test('maps single-day transactionDate and one-sided assigned dates', () => {
    const filters = {
      transactionDate: { from: '01/01/2026', to: '01/01/2026' },
      assignedDate: { from: '02/01/2026' },
      qcAssignedDate: { to: '03/01/2026' },
      qcCompletedDate: { from: '04/01/2026', to: '05/01/2026' },
    } as GridFilterState;

    const params = buildApiParamsFor('sales', filters, 0, 50);

    expect(params.transactionDate).toBe('01/01/2026');
    expect(params.assignedFromDate).toBe('02/01/2026');
    expect(params.assignedToDate).toBeUndefined();
    expect(params.qcAssignedFromDate).toBeUndefined();
    expect(params.qcAssignedToDate).toBe('03/01/2026');
    expect(params.qcCompleteFromDate).toBe('04/01/2026');
    expect(params.qcCompleteToDate).toBe('05/01/2026');
  });

  test('maps operator numeric fields and between fallbacks', () => {
    const geParams = buildApiParamsFor(
      'sales',
      {
        salePrice: { mode: '>=', min: 250000 },
        ratio: { mode: '<=', max: 1.2 },
        outlierRatio: { mode: 'between', min: 0.8 },
      } as GridFilterState,
      0,
      50,
    );

    expect(geParams.salesPrice).toBe('250000');
    expect(geParams.salesPriceOperator).toBe('GE');
    expect(geParams.ratio).toBe('1.2');
    expect(geParams.outlierRatio).toBe('0.8');

    const leParams = buildApiParamsFor(
      'sales',
      {
        salePrice: { mode: '<=', max: 300000 },
        ratio: { mode: 'between', max: 2.4 },
      } as GridFilterState,
      0,
      50,
    );

    expect(leParams.salesPrice).toBe('300000');
    expect(leParams.salesPriceOperator).toBe('LE');
    expect(leParams.ratio).toBe('2.4');

    const noneParams = buildApiParamsFor(
      'sales',
      {
        salePrice: { mode: 'between' },
        ratio: { mode: 'between' },
        outlierRatio: { mode: 'between' },
      } as GridFilterState,
      0,
      50,
    );

    expect(noneParams.salesPrice).toBeUndefined();
    expect(noneParams.salesPriceOperator).toBeUndefined();
    expect(noneParams.ratio).toBeUndefined();
    expect(noneParams.outlierRatio).toBeUndefined();

    const salePriceMaxOnly = buildApiParamsFor(
      'sales',
      {
        salePrice: { mode: 'between', max: 450000 },
      } as GridFilterState,
      0,
      50,
    );

    expect(salePriceMaxOnly.salesPrice).toBe('450000');
    expect(salePriceMaxOnly.salesPriceOperator).toBe('LE');
  });

  test('maps transactionDate for to-only and differing from/to cases', () => {
    const toOnly = buildApiParamsFor(
      'sales',
      {
        transactionDate: { to: '05/01/2026' },
      } as GridFilterState,
      0,
      50,
    );

    expect(toOnly.transactionDate).toBe('05/01/2026');

    const fromAndToDifferent = buildApiParamsFor(
      'sales',
      {
        transactionDate: { from: '01/01/2026', to: '10/01/2026' },
      } as GridFilterState,
      0,
      50,
    );

    expect(fromAndToDifferent.transactionDate).toBe('01/01/2026');
  });

  test('maps summaryFlag operator variants including fallback', () => {
    const containsParams = buildApiParamsFor(
      'sales',
      { summaryFlag: { values: ['Potential'], operator: 'contains' } } as GridFilterState,
      0,
      50,
    );
    expect(containsParams.summaryFlag).toBe('Potential');
    expect(containsParams.summaryFlagOperator).toBe('LIKE');

    const notContainsParams = buildApiParamsFor(
      'sales',
      { summaryFlag: { values: ['Potential'], operator: 'notContains' } } as GridFilterState,
      0,
      50,
    );
    expect(notContainsParams.summaryFlagOperator).toBe('NTL');

    const eqParams = buildApiParamsFor(
      'sales',
      { summaryFlag: { values: ['Potential'], operator: 'eq' } } as GridFilterState,
      0,
      50,
    );
    expect(eqParams.summaryFlagOperator).toBe('EQ');

    const unknownOperatorParams = buildApiParamsFor(
      'sales',
      { summaryFlag: { values: ['Potential'], operator: 'unexpected' as 'contains' } } as GridFilterState,
      0,
      50,
    );
    expect(unknownOperatorParams.summaryFlagOperator).toBe('LIKE');

    const emptyObjectParams = buildApiParamsFor(
      'sales',
      ({ summaryFlag: { values: [], operator: 'contains' } } as unknown) as GridFilterState,
      0,
      50,
    );
    expect(emptyObjectParams.summaryFlag).toBeUndefined();

    const stringParams = buildApiParamsFor('sales', { summaryFlag: '  FLAG  ' } as GridFilterState, 0, 50);
    expect(stringParams.summaryFlag).toBe('  FLAG  ');

    const blankStringParams = buildApiParamsFor('sales', { summaryFlag: '   ' } as GridFilterState, 0, 50);
    expect(blankStringParams.summaryFlag).toBeUndefined();
  });

  test('merges prefilter params from table-specific prefilter mapper', () => {
    const params = buildApiParamsFor(
      'manager',
      {} as GridFilterState,
      1,
      100,
      {
        searchBy: 'caseworker',
        billingAuthorities: [],
        caseworkers: ['user-1'],
        workThat: 'assignedToSelected',
      },
    );

    expect(params.pageNumber).toBe('2');
    expect(params.pageSize).toBe('100');
    expect(params.searchBy).toBe('CW');
    expect(params.preFilter).toBe('user-1');
    expect(params.taskStatus).toBe('Assigned QC Failed,Assigned');
  });

  test('maps all optional sales filter fields into API params', () => {
    const params = buildApiParamsFor(
      'sales',
      {
        source: 'VS',
        saleId: 'S-100',
        taskId: 'A-100',
        uprn: '100021234567',
        address: '1 Market Street',
        buildingNameNumber: '1',
        street: 'Market Street',
        townCity: 'Bristol',
        postcode: 'BS1 1AA',
        billingAuthority: ['Bristol', 'Bath'],
        bacode: 'BA-1',
        dwellingType: ['Flat', 'Terraced'],
        flaggedForReview: 'true',
        reviewFlags: ['Flag 1', 'Flag 2'],
        outlierKeySale: ['yes'],
        overallFlag: ['Investigate can use'],
        summaryFlag: 'FLAGGED',
        taskStatus: ['Assigned', 'Complete'],
        assignedTo: 'Case Worker',
        qcAssignedTo: 'QA User',
      } as GridFilterState,
      1,
      25,
    );

    expect(params.pageNumber).toBe('2');
    expect(params.pageSize).toBe('25');
    expect(params.source).toBe('VS');
    expect(params.saleId).toBe('S-100');
    expect(params.taskId).toBe('A-100');
    expect(params.uprn).toBe('100021234567');
    expect(params.address).toBe('1 Market Street');
    expect(params.buildingNameOrNumber).toBe('1');
    expect(params.street).toBe('Market Street');
    expect(params.town).toBe('Bristol');
    expect(params.postcode).toBe('BS1 1AA');
    expect(params.billingAuthority).toBe('Bristol,Bath');
    expect(params.billingAuthorityReference).toBe('BA-1');
    expect(params.dwellingType).toBe('Flat,Terraced');
    expect(params.flaggedForReview).toBe('true');
    expect(params.reviewFlag).toBe('Flag 1,Flag 2');
    expect(params.outlierKeySale).toBe('yes');
    expect(params.overallFlag).toBe('Investigate can use');
    expect(params.summaryFlag).toBe('FLAGGED');
    expect(params.taskStatus).toBe('Assigned,Complete');
    expect(params.assignedTo).toBe('Case Worker');
    expect(params.qcAssignedTo).toBe('QA User');
  });

  test('returns fallback config and false view flag only when explicitly disabled', () => {
    expect(isViewSalesRecordEnabledFor('sales')).toBe(true);
    expect(isViewSalesRecordEnabledFor(undefined)).toBe(true);
    expect(getSearchByOptionsFor(undefined)).toEqual(getSearchByOptionsFor('sales'));
  });
});
