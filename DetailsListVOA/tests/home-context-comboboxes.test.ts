import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('home context comboboxes', () => {
  const source = readRepoFile('DetailsListVOA/components/HomeShell/ManagerJourneyShell.tsx');

  test('country and list year both render as combobox controls', () => {
    const comboBoxMatches = source.match(/<ComboBox/g) ?? [];
    expect(comboBoxMatches.length).toBeGreaterThanOrEqual(2);
    expect(source).not.toContain('<Dropdown');
  });

  test('country combobox supports automation-friendly typed selection', () => {
    expect(source).toContain('id={HOME_JOURNEY_AUTOMATION_IDS.contextCountryInput}');
    expect(source).toContain('allowFreeInput');
    expect(source).toContain('onInputValueChange={handleCountryInputValueChange}');
    expect(source).toContain('selectedKey={countryEditing ? null : country || undefined}');
  });

  test('list year combobox clears stale selection while typing and backspacing', () => {
    expect(source).toContain('onInputValueChange={handleListYearInputValueChange}');
    expect(source).toContain('selectedKey={listYearEditing ? null : listYear || undefined}');
    expect(source).toContain("setSelected('');");
    expect(source).toContain('setEditing(true);');
  });
});