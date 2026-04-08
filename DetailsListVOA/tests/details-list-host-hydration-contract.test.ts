import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('details list host hydration contract', () => {
  const hostSource = readRepoFile('DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx');

  test('waits for table-state restore before the load effect can fetch', () => {
    expect(hostSource).toContain("const [restoredGridStateKey, setRestoredGridStateKey] = React.useState('');");
    expect(hostSource).toContain('setRestoredGridStateKey(screenInstanceKey);');
    expect(hostSource).toContain('if (restoredGridStateKey !== screenInstanceKey) {');
  });

  test('waits for sales-search restore before the sales load effect can fetch', () => {
    expect(hostSource).toContain("const [restoredSalesSearchKey, setRestoredSalesSearchKey] = React.useState('');");
    expect(hostSource).toContain('setRestoredSalesSearchKey(salesSearchStorageKey);');
    expect(hostSource).toContain('if (isSalesSearch && restoredSalesSearchKey !== salesSearchStorageKey) {');
  });
});