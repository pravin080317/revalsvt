import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('summary flag equal filter contract', () => {
  const gridSource = readRepoFile('DetailsListVOA/Grid.tsx');

  test('equal-mode combobox resolves typed exact value into a selected key so Apply can be enabled', () => {
    expect(gridSource).toContain('const isSummaryFlagMultiSelect = !isSummaryFlagField || menuSummaryOperator !== \'eq\';');
    expect(gridSource).toContain('allowFreeInput');
    expect(gridSource).toContain('const resolvedKey = next ? resolveComboOptionKey(options, next) : undefined;');
    expect(gridSource).toContain("setMenuFilterValue(resolvedKey ? String(resolvedKey) : '');");
    expect(gridSource).toContain("isSummaryFlagField && menuSummaryOperator === 'eq' && typeof menuFilterValue === 'string'");
    expect(gridSource).toContain("? [menuFilterValue.trim()].filter((v) => v !== '')");
  });
});
