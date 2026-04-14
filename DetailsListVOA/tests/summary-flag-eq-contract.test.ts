import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('summary flag equal filter contract', () => {
  const gridSource = readRepoFile('DetailsListVOA/Grid.tsx');

  test('equal-mode uses multi-select combobox (same as contains/notContains)', () => {
    expect(gridSource).toContain('const isSummaryFlagMultiSelect = true;');
    expect(gridSource).toContain('allowFreeInput');
    expect(gridSource).toContain("isSummaryFlagField && menuSummaryOperator === 'eq' && typeof menuFilterValue === 'string'");
    expect(gridSource).toContain("? [menuFilterValue.trim()].filter((v) => v !== '')");
  });
});
