import { DetailsListRuntimeController } from '../services/DetailsListRuntimeController';

type AccessFlags = {
  hasCaseworkerAccess: boolean;
  hasQaAccess: boolean;
  hasManagerAccess: boolean;
};

const CURRENT_USER_ID = '11111111-1111-1111-1111-111111111111';

const createController = (flags: AccessFlags): DetailsListRuntimeController => {
  const controller = new DetailsListRuntimeController();
  const internal = controller as unknown as Record<string, unknown>;

  internal._context = {
    userSettings: {
      userId: CURRENT_USER_ID,
      userName: 'CW User',
      userDisplayName: 'CW User',
    },
  } as unknown;

  internal.hasCaseworkerAccess = flags.hasCaseworkerAccess;
  internal.hasQaAccess = flags.hasQaAccess;
  internal.hasManagerAccess = flags.hasManagerAccess;

  return controller;
};

const asJson = (value: unknown): string => JSON.stringify(value);

describe('runtime qc section access', () => {
  test('caseworker sees QC section read-only when assigned and QC details exist', () => {
    const controller = createController({ hasCaseworkerAccess: true, hasQaAccess: false, hasManagerAccess: false });

    const detailsPayload = asJson({
      salesVerificationTaskDetails: {
        taskStatus: 'Assigned QC Failed',
        assignedToUserId: CURRENT_USER_ID,
      },
      qualityControlOutcome: {
        qcOutcome: 'Fail',
        qcRemark: 'Please re-evaluate',
      },
    });

    const access = (controller as unknown as {
      resolveQcSectionAccess: (payload: string) => { canSubmit: boolean; showSection: boolean };
    }).resolveQcSectionAccess(detailsPayload);

    expect(access).toEqual({ canSubmit: false, showSection: true });
  });

  test('caseworker does not see QC section when assigned but status is non-QC and no QC details exist', () => {
    const controller = createController({ hasCaseworkerAccess: true, hasQaAccess: false, hasManagerAccess: false });

    const detailsPayload = asJson({
      salesVerificationTaskDetails: {
        taskStatus: 'Assigned',
        assignedToUserId: CURRENT_USER_ID,
      },
      qualityControlOutcome: {
        qcOutcome: '',
        qcRemark: '',
      },
    });

    const access = (controller as unknown as {
      resolveQcSectionAccess: (payload: string) => { canSubmit: boolean; showSection: boolean };
    }).resolveQcSectionAccess(detailsPayload);

    expect(access).toEqual({ canSubmit: false, showSection: false });
  });

  test('caseworker sees QC section read-only for QC lifecycle status even when QC details are empty', () => {
    const controller = createController({ hasCaseworkerAccess: true, hasQaAccess: false, hasManagerAccess: false });

    const detailsPayload = asJson({
      salesVerificationTaskDetails: {
        taskStatus: 'Assigned QC Failed',
        assignedToUserId: CURRENT_USER_ID,
      },
      qualityControlOutcome: {
        qcOutcome: '',
        qcRemark: '',
      },
    });

    const access = (controller as unknown as {
      resolveQcSectionAccess: (payload: string) => { canSubmit: boolean; showSection: boolean };
    }).resolveQcSectionAccess(detailsPayload);

    expect(access).toEqual({ canSubmit: false, showSection: true });
  });

  test('QA user assigned in QC-editable status can submit QC outcome', () => {
    const controller = createController({ hasCaseworkerAccess: false, hasQaAccess: true, hasManagerAccess: false });

    const detailsPayload = asJson({
      salesVerificationTaskDetails: {
        taskStatus: 'Assigned To QC',
        qcAssignedToUserId: CURRENT_USER_ID,
      },
      qualityControlOutcome: {
        qcOutcome: '',
        qcRemark: '',
      },
    });

    const access = (controller as unknown as {
      resolveQcSectionAccess: (payload: string) => { canSubmit: boolean; showSection: boolean };
    }).resolveQcSectionAccess(detailsPayload);

    expect(access).toEqual({ canSubmit: true, showSection: true });
  });

  test('mixed-role user falls back to caseworker visibility when not QC-assigned but assigned as caseworker', () => {
    const controller = createController({ hasCaseworkerAccess: true, hasQaAccess: true, hasManagerAccess: true });

    const detailsPayload = asJson({
      salesVerificationTaskDetails: {
        taskStatus: 'Assigned QC Failed',
        assignedToUserId: CURRENT_USER_ID,
        qcAssignedToUserId: '22222222-2222-2222-2222-222222222222',
      },
      qualityControlOutcome: {
        qcOutcome: 'Fail',
        qcRemark: 'QC failed previously',
      },
    });

    const access = (controller as unknown as {
      resolveQcSectionAccess: (payload: string) => { canSubmit: boolean; showSection: boolean };
    }).resolveQcSectionAccess(detailsPayload);

    expect(access).toEqual({ canSubmit: false, showSection: true });
  });
});
