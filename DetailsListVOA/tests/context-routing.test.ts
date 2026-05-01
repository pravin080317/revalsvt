import {
  isManagerHomeJourneyScreen,
  isPcfViewSalesDetailsEnabled,
  normalizeJourneyContext,
  resolveActiveRequestContext,
  resolveSharePointCatalogChunks,
} from '../services/runtime/context-routing';

const makeContext = (overrides: Record<string, unknown> = {}): any => ({
  parameters: {
    canvasScreenName: { raw: '' },
    country: { raw: '' },
    listYear: { raw: '' },
    sharePointOptionsJson: { raw: '' },
    sharePointRecordsJson1: { raw: '' },
    sharePointRecordsJson2: { raw: '' },
    enablePcfViewSalesDetails: { raw: undefined },
    ...overrides,
  },
});

describe('runtime context-routing', () => {
  const originalWindow = (globalThis as any).window;

  afterEach(() => {
    (globalThis as any).window = originalWindow;
  });

  test('resolveSharePointCatalogChunks normalizes incoming text values', () => {
    const context = makeContext({
      sharePointOptionsJson: { raw: '  {"a":1}  ' },
      sharePointRecordsJson1: { raw: ' rec1 ' },
      sharePointRecordsJson2: { raw: ' rec2 ' },
    });

    const result = resolveSharePointCatalogChunks(context);

    expect(result).toEqual({
      optionsJson: '{"a":1}',
      recordsJson1: 'rec1',
      recordsJson2: 'rec2',
    });
  });

  test('normalizeJourneyContext trims values and handles missing input', () => {
    expect(normalizeJourneyContext({ country: ' Wales ', listYear: ' 2033 ' })).toEqual({
      country: 'Wales',
      listYear: '2033',
    });
    expect(normalizeJourneyContext({ country: '' as any, listYear: undefined as any })).toEqual({
      country: '',
      listYear: '',
    });
  });

  test('isManagerHomeJourneyScreen returns true for empty and known home/workspace screens', () => {
    expect(isManagerHomeJourneyScreen(makeContext({ canvasScreenName: { raw: '' } }))).toBe(true);
    expect(isManagerHomeJourneyScreen(makeContext({ canvasScreenName: { raw: 'Home Dashboard' } }))).toBe(true);
    expect(isManagerHomeJourneyScreen(makeContext({ canvasScreenName: { raw: 'Quality Control View' } }))).toBe(true);
  });

  test('isManagerHomeJourneyScreen returns false for unrelated screen names', () => {
    expect(isManagerHomeJourneyScreen(makeContext({ canvasScreenName: { raw: 'Some Other Screen' } }))).toBe(false);
  });

  test('resolveActiveRequestContext uses input context when manager journey is inactive', () => {
    const context = makeContext({
      country: { raw: ' England ' },
      listYear: { raw: ' 2028 ' },
    });

    const result = resolveActiveRequestContext(context, false, { country: 'Wales', listYear: '2033' });

    expect(result).toEqual({ country: 'England', listYear: '2028' });
  });

  test('resolveActiveRequestContext prefers manager journey context with fallback to input', () => {
    const context = makeContext({
      country: { raw: 'England' },
      listYear: { raw: '2028' },
    });

    const fromJourney = resolveActiveRequestContext(context, true, { country: 'Wales', listYear: '2033' });
    const withFallback = resolveActiveRequestContext(context, true, { country: '  ', listYear: '' });

    expect(fromJourney).toEqual({ country: 'Wales', listYear: '2033' });
    expect(withFallback).toEqual({ country: 'England', listYear: '2028' });
  });

  test('isPcfViewSalesDetailsEnabled respects boolean raw values', () => {
    expect(isPcfViewSalesDetailsEnabled(makeContext({ enablePcfViewSalesDetails: { raw: true } }))).toBe(true);
    expect(isPcfViewSalesDetailsEnabled(makeContext({ enablePcfViewSalesDetails: { raw: false } }))).toBe(false);
  });

  test('isPcfViewSalesDetailsEnabled parses common string booleans', () => {
    expect(isPcfViewSalesDetailsEnabled(makeContext({ enablePcfViewSalesDetails: { raw: 'true' } }))).toBe(true);
    expect(isPcfViewSalesDetailsEnabled(makeContext({ enablePcfViewSalesDetails: { raw: '1' } }))).toBe(true);
    expect(isPcfViewSalesDetailsEnabled(makeContext({ enablePcfViewSalesDetails: { raw: 'yes' } }))).toBe(true);
    expect(isPcfViewSalesDetailsEnabled(makeContext({ enablePcfViewSalesDetails: { raw: 'false' } }))).toBe(false);
    expect(isPcfViewSalesDetailsEnabled(makeContext({ enablePcfViewSalesDetails: { raw: '0' } }))).toBe(false);
    expect(isPcfViewSalesDetailsEnabled(makeContext({ enablePcfViewSalesDetails: { raw: 'no' } }))).toBe(false);
  });

  test('isPcfViewSalesDetailsEnabled forces true on localhost when value is unknown', () => {
    (globalThis as any).window = { location: { hostname: 'localhost' } };
    expect(isPcfViewSalesDetailsEnabled(makeContext({ enablePcfViewSalesDetails: { raw: 'maybe' } }))).toBe(true);
  });

  test('isPcfViewSalesDetailsEnabled falls back to control config default outside localhost', () => {
    (globalThis as any).window = { location: { hostname: 'example.org' } };
    expect(isPcfViewSalesDetailsEnabled(makeContext({ enablePcfViewSalesDetails: { raw: 'maybe' } }))).toBe(true);
  });
});
