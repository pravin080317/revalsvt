import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('details list host load dedupe contract', () => {
  const hostSource = readRepoFile('DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx');

  test('skips starting a second identical in-flight grid load request', () => {
    expect(hostSource).toContain('const inFlightGridLoadKeyRef = React.useRef<string>(\'\');');
    expect(hostSource).toContain('if (inFlightGridLoadKeyRef.current === loadRequestKey) {');
    expect(hostSource).toContain('inFlightGridLoadKeyRef.current = loadRequestKey;');
  });

  test('ignores stale responses and clears in-flight key in finally', () => {
    expect(hostSource).toContain('if (inFlightGridLoadKeyRef.current !== loadRequestKey) {');
    expect(hostSource).toContain('} finally {');
    expect(hostSource).toContain('if (inFlightGridLoadKeyRef.current === loadRequestKey) {');
    expect(hostSource).toContain("inFlightGridLoadKeyRef.current = '';");
  });
});
