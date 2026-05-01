import { computeCompletedToDateIso, getPrefilterFromDateError } from '../utils/PrefilterDateUtils';

describe('prefilter date utils', () => {
  const today = new Date(2026, 1, 24);

  test('computeCompletedToDateIso returns +14 days when within range', () => {
    const from = new Date(2026, 1, 1);
    expect(computeCompletedToDateIso(from, today)).toBe('2026-02-15');
  });

  test('computeCompletedToDateIso clamps to today when +14 exceeds today', () => {
    const from = new Date(2026, 1, 20);
    expect(computeCompletedToDateIso(from, today)).toBe('2026-02-24');
  });

  test('computeCompletedToDateIso returns today when from date is today', () => {
    const from = new Date(2026, 1, 24);
    expect(computeCompletedToDateIso(from, today)).toBe('2026-02-24');
  });

  test('computeCompletedToDateIso returns undefined when from date is missing', () => {
    expect(computeCompletedToDateIso(undefined, today)).toBeUndefined();
    expect(computeCompletedToDateIso(null, today)).toBeUndefined();
  });

  test('computeCompletedToDateIso uses current date when today override is omitted', () => {
    const realDate = Date;
    const mockedToday = new Date(2026, 1, 10, 15, 30, 0);

    global.Date = class extends Date {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(mockedToday.getTime());
          return;
        }
        if (args.length === 1) {
          super(args[0]);
          return;
        }
        if (args.length === 2) {
          super(args[0], args[1]);
          return;
        }
        if (args.length === 3) {
          super(args[0], args[1], args[2]);
          return;
        }
        if (args.length === 4) {
          super(args[0], args[1], args[2], args[3]);
          return;
        }
        if (args.length === 5) {
          super(args[0], args[1], args[2], args[3], args[4]);
          return;
        }
        if (args.length === 6) {
          super(args[0], args[1], args[2], args[3], args[4], args[5]);
          return;
        }
        super(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
      }

      static now(): number {
        return mockedToday.getTime();
      }
    } as DateConstructor;

    expect(computeCompletedToDateIso(new realDate(2026, 1, 1))).toBe('2026-02-10');

    global.Date = realDate;
  });

  test('getPrefilterFromDateError flags future dates', () => {
    expect(getPrefilterFromDateError('2026-02-25', today)).toBe('Start date cannot be in the future');
  });

  test('getPrefilterFromDateError ignores today or past dates', () => {
    expect(getPrefilterFromDateError('2026-02-24', today)).toBeUndefined();
    expect(getPrefilterFromDateError('2026-02-01', today)).toBeUndefined();
  });

  test('getPrefilterFromDateError ignores blank and invalid ISO-like values', () => {
    expect(getPrefilterFromDateError('', today)).toBeUndefined();
    expect(getPrefilterFromDateError('2026-02', today)).toBeUndefined();
    expect(getPrefilterFromDateError('2026-aa-10', today)).toBeUndefined();
  });
});
