import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('assigned user mapping contract', () => {
  const hostSource = readRepoFile('DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx');

  test('uses a shared mapping context for GUID-to-name resolution across screens', () => {
    expect(hostSource).toContain("const userMappingScreenName = QC_ASSIGNMENT_SCREEN_NAME;");
    expect(hostSource).toContain("{ screenName: userMappingScreenName }");
  });

  test('maps both assignedto and qcassignedto via the same normalized ID path', () => {
    expect(hostSource).toContain('const extractNormalizedUserIds = (value: unknown): string[] | undefined');
    expect(hostSource).toContain('const assignedToIds = extractNormalizedUserIds(record.assignedto');
    expect(hostSource).toContain('const qcAssignedToIds = extractNormalizedUserIds(record.qcassignedto');
    expect(hostSource).toContain('assignDisplayNames({');
    expect(hostSource).toContain("sourceKey: 'assignedto',");
    expect(hostSource).toContain("sourceKey: 'qcassignedto',");
  });
});

