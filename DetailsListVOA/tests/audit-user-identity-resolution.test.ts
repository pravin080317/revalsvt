import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('audit user identity resolution', () => {
  const hostSource = readRepoFile('DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx');
  const viewModelSource = readRepoFile('DetailsListVOA/components/SaleDetailsShell/useSaleDetailsViewModel.ts');

  test('details host includes Entra and system user IDs in the shared display-name map', () => {
    expect(hostSource).toContain('const primaryId = normalizeAssignableUserId(user.entraObjectId ?? user.id);');
    expect(hostSource).toContain('const userId = normalizeAssignableUserId(user.id);');
    expect(hostSource).toContain('const systemUserId = normalizeAssignableUserId(user.systemUserId);');
    expect(hostSource).toContain('if (systemUserId) {');
    expect(hostSource).toContain('map[systemUserId] = name;');
  });

  test('audit user token fallback never returns raw GUID values', () => {
    expect(viewModelSource).toContain('const resolveAuditUserToken = (value: string, lookup: Record<string, string>): string => {');
    expect(viewModelSource).toContain("return 'Unknown User';");
    expect(viewModelSource).toContain('return resolved;');
  });
});
