import {
  getManagerWorkThatOptions,
  getQcWorkThatOptions,
  isManagerCompletedWorkThat,
  isQcCompletedWorkThat,
  CASEWORKER_PREFILTER_DEFAULT,
  CASEWORKER_WORKTHAT_SELF_OPTIONS,
  MANAGER_PREFILTER_DEFAULT,
  MANAGER_SEARCH_BY_OPTIONS,
  mapManagerPrefiltersToApi,
  mapQcPrefiltersToApi,
  mapQcViewPrefiltersToApi,
  QC_PREFILTER_DEFAULT,
  QC_SEARCH_BY_OPTIONS,
  QC_VIEW_PREFILTER_DEFAULT,
  QC_WORKTHAT_SELF_OPTIONS,
} from '../config/PrefilterConfigs';

describe('prefilter configs extra', () => {
  test('manager defaults and search-by options', () => {
    expect(MANAGER_PREFILTER_DEFAULT.searchBy).toBe('billingAuthority');
    const optionKeys = MANAGER_SEARCH_BY_OPTIONS.map((opt) => String(opt.key));
    expect(optionKeys).toEqual(['billingAuthority', 'caseworker']);
  });

  test('caseworker defaults and workThat options', () => {
    expect(CASEWORKER_PREFILTER_DEFAULT.searchBy).toBe('caseworker');
    expect(CASEWORKER_PREFILTER_DEFAULT.workThat).toBe('assignedToSelected');

    const options = CASEWORKER_WORKTHAT_SELF_OPTIONS.map((opt) => ({
      key: String(opt.key),
      text: opt.text,
    }));
    expect(options).toEqual([
      { key: 'assignedToSelected', text: 'Is assigned to me' },
      { key: 'completedBySelected', text: 'I have completed' },
      { key: 'assignedAwaitingQc', text: 'Is assigned to me but is awaiting or undergoing QC' },
    ]);
  });

  test('getManagerWorkThatOptions switches by searchBy', () => {
    const caseworkerOpts = getManagerWorkThatOptions('caseworker');
    const billingOpts = getManagerWorkThatOptions('billingAuthority');
    expect(caseworkerOpts.some((opt) => opt.key === 'assignedToSelected')).toBe(true);
    expect(billingOpts.some((opt) => opt.key === 'readyToAllocate')).toBe(true);
  });

  test('manager workThat options include expected keys', () => {
    const billingKeys = getManagerWorkThatOptions('billingAuthority').map((opt) => String(opt.key));
    expect(billingKeys).toEqual(['readyToAllocate', 'currentlyAssigned', 'hasBeenComplete', 'awaitingQc']);

    const caseworkerKeys = getManagerWorkThatOptions('caseworker').map((opt) => String(opt.key));
    expect(caseworkerKeys).toEqual(['assignedToSelected', 'completedBySelected', 'assignedAwaitingQc']);
  });

  test('getQcWorkThatOptions switches by searchBy', () => {
    expect(getQcWorkThatOptions('qcUser').some((opt) => opt.key === 'qcAssignedToSelected')).toBe(true);
    expect(getQcWorkThatOptions('caseworker').some((opt) => opt.key === 'caseworkerCompleted')).toBe(true);
    expect(getQcWorkThatOptions('task').some((opt) => opt.key === 'taskCompleted')).toBe(true);
  });

  test('getQcWorkThatOptions uses default branch for unknown searchBy values', () => {
    const options = getQcWorkThatOptions('unexpected' as never);
    expect(options.some((opt) => opt.key === 'taskCompleted')).toBe(true);
  });

  test('qc assignment defaults and search-by options', () => {
    expect(QC_PREFILTER_DEFAULT.searchBy).toBe('task');
    const keys = QC_SEARCH_BY_OPTIONS.map((opt) => String(opt.key)).sort();
    expect(keys).toEqual(['caseworker', 'qcUser', 'task'].sort());
  });

  test('qc assignment workThat options for qcUser', () => {
    const options = getQcWorkThatOptions('qcUser').map((opt) => ({
      key: String(opt.key),
      text: opt.text,
    }));
    expect(options).toEqual([
      { key: 'qcAssignedToSelected', text: 'Is assigned to the selected user(s)' },
      { key: 'qcCompletedBySelected', text: 'Has been completed by the selected user(s)' },
      { key: 'qcAssignedInProgress', text: 'Is assigned to the selected user(s) but is being progressed by the caseworker' },
    ]);
  });

  test('qc assignment workThat options for caseworker', () => {
    const options = getQcWorkThatOptions('caseworker').map((opt) => ({
      key: String(opt.key),
      text: opt.text,
    }));
    expect(options).toEqual([
      { key: 'caseworkerCompletedQcRequested', text: 'Has been completed by the selected caseworker where QC has been requested' },
      { key: 'caseworkerCompleted', text: 'Has been completed by the selected caseworker' },
    ]);
  });

  test('qc assignment workThat options for task', () => {
    const options = getQcWorkThatOptions('task').map((opt) => ({
      key: String(opt.key),
      text: opt.text,
    }));
    expect(options).toEqual([
      { key: 'taskCompletedQcRequested', text: 'Has been completed by a caseworker where QC has been requested' },
      { key: 'taskCompleted', text: 'Has been completed by a caseworker' },
    ]);
  });

  test('completed workThat helpers', () => {
    expect(isManagerCompletedWorkThat('hasBeenComplete')).toBe(true);
    expect(isManagerCompletedWorkThat('completedBySelected')).toBe(true);
    expect(isManagerCompletedWorkThat('readyToAllocate')).toBe(false);

    expect(isQcCompletedWorkThat('qcCompletedBySelected')).toBe(true);
    expect(isQcCompletedWorkThat('caseworkerCompleted')).toBe(true);
    expect(isQcCompletedWorkThat('taskCompleted')).toBe(true);
    expect(isQcCompletedWorkThat('qcAssignedToSelected')).toBe(false);
  });

  test('mapManagerPrefiltersToApi handles empty values', () => {
    const params = mapManagerPrefiltersToApi({
      searchBy: 'billingAuthority',
      billingAuthorities: ['  '],
      caseworkers: [],
    });
    expect(params.preFilter).toBeUndefined();
    expect(params.searchBy).toBe('BA');
  });

  test('mapQcPrefiltersToApi searchBy switch', () => {
    const params = mapQcPrefiltersToApi({
      searchBy: 'task',
      billingAuthorities: [],
      caseworkers: ['__all__'],
      workThat: 'caseworkerCompleted',
    });
    expect(params.searchBy).toBe('TK');
    expect(params.preFilter).toBeUndefined();
    expect(params.taskStatus).toBe('Complete');
  });

  test('mapQcViewPrefiltersToApi omits searchBy and preFilter', () => {
    const params = mapQcViewPrefiltersToApi({
      searchBy: 'task',
      billingAuthorities: [],
      caseworkers: ['123'],
      workThat: 'qcAssignedInProgress',
    });
    expect(params.searchBy).toBeUndefined();
    expect(params.preFilter).toBeUndefined();
    expect(params.taskStatus).toBe('Assigned QC Failed,Assigned');
  });

  test('all mappers return empty object when prefilters are missing', () => {
    expect(mapManagerPrefiltersToApi(undefined)).toEqual({});
    expect(mapQcPrefiltersToApi(undefined)).toEqual({});
    expect(mapQcViewPrefiltersToApi(undefined)).toEqual({});
  });

  test('manager mapper omits invalid ISO dates and empty prefilter values', () => {
    const params = mapManagerPrefiltersToApi({
      searchBy: 'caseworker',
      billingAuthorities: [],
      caseworkers: ['   ', ''],
      completedFrom: '2026/02/01',
      completedTo: 'bad',
    });

    expect(params.searchBy).toBe('CW');
    expect(params.preFilter).toBeUndefined();
    expect(params.fromDate).toBeUndefined();
    expect(params.toDate).toBeUndefined();
    expect(params.taskStatus).toBeUndefined();
  });

  test('manager mapper supports one-sided valid dates', () => {
    const params = mapManagerPrefiltersToApi({
      searchBy: 'billingAuthority',
      billingAuthorities: ['Cardiff'],
      caseworkers: [],
      completedFrom: '2026-03-01',
    });

    expect(params.searchBy).toBe('BA');
    expect(params.preFilter).toBe('Cardiff');
    expect(params.fromDate).toBe('01/03/2026');
    expect(params.toDate).toBeUndefined();
  });

  test('qc assignment mapper supports unknown searchBy fallback and task branch prefilter omission', () => {
    const unknownSearchParams = mapQcPrefiltersToApi({
      searchBy: 'unknown' as never,
      billingAuthorities: [],
      caseworkers: ['user-1'],
      workThat: 'qcAssignedToSelected',
    });

    expect(unknownSearchParams.searchBy).toBeUndefined();
    expect(unknownSearchParams.preFilter).toBe('user-1');

    const taskParams = mapQcPrefiltersToApi({
      searchBy: 'task',
      billingAuthorities: [],
      caseworkers: ['user-1'],
      workThat: 'taskCompleted',
      completedTo: '2026-03-10',
    });

    expect(taskParams.searchBy).toBe('TK');
    expect(taskParams.preFilter).toBeUndefined();
    expect(taskParams.taskStatus).toBe('Complete');
    expect(taskParams.toDate).toBe('10/03/2026');
  });

  test('qc view mapper omits invalid dates and supports one-sided valid date', () => {
    const invalidParams = mapQcViewPrefiltersToApi({
      searchBy: 'qcUser',
      billingAuthorities: [],
      caseworkers: [],
      workThat: 'qcAssignedToSelected',
      completedFrom: 'bad-value',
      completedTo: '2026/12/10',
    });

    expect(invalidParams.fromDate).toBeUndefined();
    expect(invalidParams.toDate).toBeUndefined();

    const oneSidedParams = mapQcViewPrefiltersToApi({
      searchBy: 'qcUser',
      billingAuthorities: [],
      caseworkers: [],
      workThat: 'qcCompletedBySelected',
      completedTo: '2026-12-10',
    });

    expect(oneSidedParams.taskStatus).toBe('Complete Passed QC,Complete');
    expect(oneSidedParams.fromDate).toBeUndefined();
    expect(oneSidedParams.toDate).toBe('10/12/2026');
  });

  test('qc view defaults and options', () => {
    expect(QC_VIEW_PREFILTER_DEFAULT.searchBy).toBe('qcUser');
    expect(QC_VIEW_PREFILTER_DEFAULT.workThat).toBe('qcAssignedToSelected');
    const options = QC_WORKTHAT_SELF_OPTIONS.map((opt) => ({
      key: String(opt.key),
      text: opt.text,
    }));
    expect(options).toEqual([
      { key: 'qcAssignedToSelected', text: 'Is assigned to me' },
      { key: 'qcCompletedBySelected', text: 'I have completed' },
      { key: 'qcAssignedInProgress', text: 'Is assigned to me but is being progressed by the caseworker' },
    ]);
  });
});
