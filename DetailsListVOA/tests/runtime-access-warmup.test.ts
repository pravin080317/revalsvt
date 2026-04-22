import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('runtime access warm-up', () => {
  const indexSource = readRepoFile('DetailsListVOA/index.ts');
  const runtimeSource = readRepoFile('DetailsListVOA/services/DetailsListRuntimeController.ts');

  test('updateView triggers runtime access warm-up', () => {
    expect(indexSource).toContain('this.runtime.warmupAccessResolution();');
  });

  test('runtime warm-up resolves access and notifies output change', () => {
    expect(runtimeSource).toContain('public warmupAccessResolution(): void');
    expect(runtimeSource).toContain('this.caseworkerAccessRequest = this.resolveCaseworkerAccess();');
    expect(runtimeSource).toContain('this.hasResolvedCaseworkerAccess = true;');
    expect(runtimeSource).toContain('this._notifyOutputChanged?.();');
  });
});