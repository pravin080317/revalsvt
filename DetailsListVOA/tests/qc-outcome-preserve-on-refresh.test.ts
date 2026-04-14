import { preserveQcOutcomeDetails } from '../services/runtime/sale-details';

describe('preserveQcOutcomeDetails', () => {
  test('fills missing QC values from existing details for the same sale/task', () => {
    const existing = JSON.stringify({
      salesVerificationTaskDetails: {
        taskId: '1000564',
        saleId: 'S-1004906',
      },
      qualityControlOutcome: {
        qcOutcome: 'Fail',
        qcRemark: 'Insufficient evidence',
        qcReviewedBy: 'user-1',
        qcReviewedOn: '2026-04-09T10:00:00.000Z',
      },
    });

    const incoming = JSON.stringify({
      salesVerificationTaskDetails: {
        taskId: '1000564',
        saleId: 'S-1004906',
      },
      qualityControlOutcome: {
        qcOutcome: '',
        qcRemark: '',
      },
    });

    const result = JSON.parse(preserveQcOutcomeDetails(incoming, existing));

    expect(result.qualityControlOutcome.qcOutcome).toBe('Fail');
    expect(result.qualityControlOutcome.qcRemark).toBe('Insufficient evidence');
    expect(result.qualityControlOutcome.qcReviewedBy).toBe('user-1');
    expect(result.qualityControlOutcome.qcReviewedOn).toBe('2026-04-09T10:00:00.000Z');
  });

  test('keeps incoming QC values when they are present', () => {
    const existing = JSON.stringify({
      salesVerificationTaskDetails: {
        taskId: '1000564',
        saleId: 'S-1004906',
      },
      qualityControlOutcome: {
        qcOutcome: 'Fail',
        qcRemark: 'Old remark',
      },
    });

    const incoming = JSON.stringify({
      salesVerificationTaskDetails: {
        taskId: '1000564',
        saleId: 'S-1004906',
      },
      qualityControlOutcome: {
        qcOutcome: 'Pass',
        qcRemark: 'New remark',
      },
    });

    const result = JSON.parse(preserveQcOutcomeDetails(incoming, existing));

    expect(result.qualityControlOutcome.qcOutcome).toBe('Pass');
    expect(result.qualityControlOutcome.qcRemark).toBe('New remark');
  });

  test('does not copy QC values when record identity differs', () => {
    const existing = JSON.stringify({
      salesVerificationTaskDetails: {
        taskId: '1000564',
        saleId: 'S-1004906',
      },
      qualityControlOutcome: {
        qcOutcome: 'Fail',
        qcRemark: 'Old remark',
      },
    });

    const incoming = JSON.stringify({
      salesVerificationTaskDetails: {
        taskId: '1000999',
        saleId: 'S-1004999',
      },
      qualityControlOutcome: {
        qcOutcome: '',
        qcRemark: '',
      },
    });

    const result = JSON.parse(preserveQcOutcomeDetails(incoming, existing));

    expect(result.qualityControlOutcome.qcOutcome).toBe('');
    expect(result.qualityControlOutcome.qcRemark).toBe('');
  });
});
