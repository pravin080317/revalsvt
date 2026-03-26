import {
  parseAssignableUsersResponse,
  resolveAssignedUserIdsToDisable,
  resolveAssignmentStatusValidation,
  type AssignmentConfig,
} from '../utils/AssignmentHelpers';

describe('assignment helpers', () => {
  // Mirrors manager assignment rules used by the runtime config.
  const managerAssignmentCfg: AssignmentConfig = {
    allowedStatusesManager: ['New', 'Assigned', 'Assigned QC failed', 'QC requested'],
    allowedStatusesQc: [],
    allowedStatuses: [],
  };

  // QC assignment rules:
  // - Included statuses: QC requested, Complete, Assigned QC failed, Assigned To QC, Reassigned To QC
  // - Excluded status: Complete Passed QC
  // - taskStatus sent to API:
  //   * QC requested -> QC Requested (assignment to QC)
  //   * other included statuses -> current status (reassignment)
  const qcAssignmentCfg: AssignmentConfig = {
    allowedStatusesManager: [],
    allowedStatusesQc: ['QC requested', 'Complete', 'Assigned QC failed', 'Assigned To QC', 'Reassigned To QC'],
    allowedStatuses: [],
  };

  const messages = {
    noUsersFound: 'No users found.',
    assignableUsersParseFailed: 'Parse failed.',
    assignableUsersLoadFailed: 'Load failed.',
  };

  test('manager assignment errors on mixed new/non-new statuses', () => {
    const cfg: AssignmentConfig = { allowedStatusesManager: [], allowedStatusesQc: [], allowedStatuses: [] };
    const result = resolveAssignmentStatusValidation(
      [{ taskstatus: 'New' }, { taskStatus: 'Assigned' }],
      'managerAssign',
      cfg,
      'invalid',
    );
    expect(result.error).toBe('invalid');
  });

  test('manager assignment sets task status for all new', () => {
    const result = resolveAssignmentStatusValidation(
      [{ taskstatus: 'New' }],
      'managerAssign',
      managerAssignmentCfg,
      'invalid',
    );
    expect(result.assignmentTaskStatus).toBe('New');
    expect(result.error).toBeUndefined();
  });

  test('manager assignment sends current task status for reassignment payload', () => {
    const result = resolveAssignmentStatusValidation(
      [{ taskstatus: 'Assigned' }],
      'managerAssign',
      managerAssignmentCfg,
      'invalid',
    );
    expect(result.error).toBeUndefined();
    expect(result.assignmentTaskStatus).toBe('Assigned');
  });

  test('manager assignment sends current task status for non-new allowed statuses', () => {
    const result = resolveAssignmentStatusValidation(
      [{ taskstatus: 'QC requested' }],
      'managerAssign',
      managerAssignmentCfg,
      'invalid',
    );
    expect(result.error).toBeUndefined();
    expect(result.assignmentTaskStatus).toBe('QC requested');
  });

  test('manager assignment is restricted for Complete status', () => {
    const result = resolveAssignmentStatusValidation(
      [{ taskstatus: 'Complete' }],
      'managerAssign',
      managerAssignmentCfg,
      'invalid',
    );
    expect(result.error).toBe('invalid');
  });

  test('manager assignment is restricted for Complete Passed QC status', () => {
    const result = resolveAssignmentStatusValidation(
      [{ taskstatus: 'Complete Passed QC' }],
      'managerAssign',
      managerAssignmentCfg,
      'invalid',
    );
    expect(result.error).toBe('invalid');
  });

  test('qc assignment errors on mixed qc requested/non-qc requested', () => {
    const cfg: AssignmentConfig = { allowedStatusesManager: [], allowedStatusesQc: [], allowedStatuses: [] };
    const result = resolveAssignmentStatusValidation(
      [{ taskstatus: 'QC Requested' }, { taskStatus: 'Assigned' }],
      'qcAssign',
      cfg,
      'invalid',
    );
    expect(result.error).toBe('invalid');
  });

  test('qc assignment sends current status for complete-task reassignment', () => {
    const result = resolveAssignmentStatusValidation(
      [{ taskstatus: 'Complete' }],
      'qcAssign',
      qcAssignmentCfg,
      'invalid',
    );
    expect(result.error).toBeUndefined();
    expect(result.assignmentTaskStatus).toBe('Complete');
  });

  test('qc assignment sends QC Requested when selected rows are QC Requested', () => {
    const result = resolveAssignmentStatusValidation(
      [{ taskstatus: 'QC Requested' }],
      'qcAssign',
      qcAssignmentCfg,
      'invalid',
    );
    expect(result.error).toBeUndefined();
    expect(result.assignmentTaskStatus).toBe('QC Requested');
  });

  test('qc assignment sends current status for assigned-to-qc reassignment', () => {
    const result = resolveAssignmentStatusValidation(
      [{ taskstatus: 'Assigned To QC' }],
      'qcAssign',
      qcAssignmentCfg,
      'invalid',
    );
    expect(result.error).toBeUndefined();
    expect(result.assignmentTaskStatus).toBe('Assigned To QC');
  });

  test('qc assignment is restricted for Complete Passed QC status', () => {
    const result = resolveAssignmentStatusValidation(
      [{ taskstatus: 'Complete Passed QC' }],
      'qcAssign',
      qcAssignmentCfg,
      'invalid',
    );
    expect(result.error).toBe('invalid');
  });

  test('enforces allowed statuses for non-assignment screens', () => {
    const cfg: AssignmentConfig = {
      allowedStatusesManager: [],
      allowedStatusesQc: [],
      allowedStatuses: ['assigned'],
    };
    const result = resolveAssignmentStatusValidation(
      [{ taskstatus: 'In Progress' }],
      'caseworkerView',
      cfg,
      'invalid',
    );
    expect(result.error).toBe('invalid');
  });

  test('parseAssignableUsersResponse handles empty result', () => {
    const parsed = parseAssignableUsersResponse({}, messages);
    expect(parsed.users).toHaveLength(0);
    expect(parsed.info).toBe(messages.noUsersFound);
  });

  test('parseAssignableUsersResponse handles invalid JSON', () => {
    const parsed = parseAssignableUsersResponse({ Result: '{' }, messages);
    expect(parsed.error).toBe(messages.assignableUsersParseFailed);
  });

  test('parseAssignableUsersResponse handles success=false with message', () => {
    const parsed = parseAssignableUsersResponse(
      { Result: JSON.stringify({ success: false, message: 'boom' }) },
      messages,
    );
    expect(parsed.error).toBe('boom');
  });

  test('parseAssignableUsersResponse handles success=true with users', () => {
    const parsed = parseAssignableUsersResponse(
      {
        Result: JSON.stringify({
          success: true,
          users: [
            { id: '', firstName: 'Ignore', lastName: 'Me', email: '', team: '', role: '' },
            {
              id: '1',
              systemUserId: 's1',
              entraObjectId: 'e1',
              firstName: 'A',
              lastName: 'B',
              email: 'a@b.com',
              team: 't',
              role: 'r',
              teams: ['t2'],
              roles: ['r2', 'r'],
            },
            { id: '2', firstName: 'C', lastName: 'D', email: 'c@d.com', teams: ['t3'], roles: ['r3'] },
          ],
        }),
      },
      messages,
    );
    expect(parsed.users).toHaveLength(2);
    expect(parsed.users[0].id).toBe('1');
    expect(parsed.users[0].systemUserId).toBe('s1');
    expect(parsed.users[0].entraObjectId).toBe('e1');
    expect(parsed.users[0].roles).toEqual(['r', 'r2']);
    expect(parsed.users[1].role).toBe('r3');
  });

  test('resolveAssignedUserIdsToDisable matches manager assigned user by name', () => {
    const users = [
      { id: 'u1', firstName: 'Praveen', lastName: 'K', email: 'praveen@example.com', team: '', role: '' },
      { id: 'u2', firstName: 'Alex', lastName: 'J', email: 'alex@example.com', team: '', role: '' },
    ];
    const selectedRows = [{ assignedto: 'Praveen K' }];
    const disabled = resolveAssignedUserIdsToDisable(selectedRows, users, 'managerAssign');
    expect(disabled).toEqual(['u1']);
  });

  test('resolveAssignedUserIdsToDisable matches qc assigned user by id and delimiters', () => {
    const users = [
      { id: '123', firstName: 'Praveen', lastName: 'K', email: 'praveen@example.com', team: '', role: '' },
      { id: '456', firstName: 'Alex', lastName: 'J', email: 'alex@example.com', team: '', role: '' },
    ];
    const selectedRows = [{ qcAssignedTo: '123;789' }];
    const disabled = resolveAssignedUserIdsToDisable(selectedRows, users, 'qcAssign');
    expect(disabled).toEqual(['123']);
  });

  test('resolveAssignedUserIdsToDisable ignores non-assignment screens', () => {
    const users = [{ id: 'u1', firstName: 'Praveen', lastName: 'K', email: 'praveen@example.com', team: '', role: '' }];
    const selectedRows = [{ assignedto: 'Praveen K' }];
    const disabled = resolveAssignedUserIdsToDisable(selectedRows, users, 'salesSearch');
    expect(disabled).toEqual([]);
  });
});
