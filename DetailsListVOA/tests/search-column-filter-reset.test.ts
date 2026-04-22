import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..');

const gridSource = fs.readFileSync(
  path.join(repoRoot, 'DetailsListVOA/Grid.tsx'),
  'utf8',
);

describe('sales search column filter reset guard', () => {
  test('defines a dedicated reset notice for column filters when search criteria changes', () => {
    expect(gridSource).toContain("const COLUMN_FILTER_RESET_NOTICE = 'New search criteria cleared existing column filters.';");
  });

  test('builds and tracks a search submission signature', () => {
    expect(gridSource).toContain('const buildSearchSubmissionSignature = (filters: GridFilterState): string => {');
    expect(gridSource).toContain('const lastSubmittedSearchSignatureRef = React.useRef<string>(buildSearchSubmissionSignature(searchFilters));');
  });

  test('clears column filters and notifies parent when submitted search criteria changes', () => {
    expect(gridSource).toContain('const clearColumnFiltersOnNewSearch = (nextFilters: GridFilterState): boolean => {');
    expect(gridSource).toContain('const didSearchChange = previousSignature !== \'\' && previousSignature !== nextSignature;');
    expect(gridSource).toContain('if (didSearchChange && Object.keys(columnFiltersState).length > 0) {');
    expect(gridSource).toContain('onColumnFiltersChange?.(cleared);');
    expect(gridSource).toContain('setSearchResetNotice(COLUMN_FILTER_RESET_NOTICE);');
  });

  test('applies changed-search check to both sales and non-sales submit paths', () => {
    expect(gridSource).toContain('clearColumnFiltersOnNewSearch(next);');
    expect(gridSource).toContain('clearColumnFiltersOnNewSearch(sanitized);');
  });
});
