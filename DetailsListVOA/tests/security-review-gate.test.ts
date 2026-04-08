import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('security review gate: Grid UI surface', () => {
  const source = readRepoFile('DetailsListVOA/Grid.tsx');

  test('does not use dangerous HTML/script injection APIs', () => {
    expect(source).not.toMatch(/\bdangerouslySetInnerHTML\b/);
    expect(source).not.toMatch(/\.innerHTML\s*=/);
    expect(source).not.toMatch(/\beval\s*\(/);
    expect(source).not.toMatch(/\bnew\s+Function\s*\(/);
  });

  test('keeps input sanitizers wired for key search fields', () => {
    expect(source).toContain('sanitizeAlphaNumHyphen(v, ID_FIELD_MAX_LENGTH)');
    expect(source).toContain('sanitizeTaskIdInput(v, ID_FIELD_MAX_LENGTH)');
    expect(source).toContain('sanitizeDigits(v, UPRN_MAX_LENGTH)');
  });
});
