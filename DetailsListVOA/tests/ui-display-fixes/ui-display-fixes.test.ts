/**
 * Tests for 5 UI display fixes matching canvas app behaviour:
 *
 *  1. Previous Ratio Range & Latest Ratio Range — rounded to 2 decimal places
 *  2. Condition Score — rounded to 2 decimal places
 *  3. Glazing / Heating — info icons (tooltips) removed
 *  4. Quality Control section — hidden for 'complete' status (non-QA user)
 *  5. Modify SVT Task button — hidden when assignedTo is 'Unknown User'
 */
import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..', '..');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const viewModelSource = readRepoFile('DetailsListVOA/components/SaleDetailsShell/useSaleDetailsViewModel.ts');
const runtimeSource = readRepoFile('DetailsListVOA/services/DetailsListRuntimeController.ts');
const taskSectionSource = readRepoFile('DetailsListVOA/components/SaleDetailsShell/sections/SalesVerificationTaskSection.tsx');

/* ================================================================== */
/*  1 & 2. Ratio ranges and condition score — 2 decimal places        */
/* ================================================================== */

describe('ratio ranges and condition score rounded to 2 decimal places', () => {
  test('roundTo2Dp helper is defined in the view model', () => {
    expect(viewModelSource).toContain('const roundTo2Dp = (raw: unknown): string =>');
  });

  test('roundTo2Dp returns value.toFixed(2) for finite numbers', () => {
    expect(viewModelSource).toContain('n.toFixed(2)');
  });

  test('previousRatioRange uses roundTo2Dp', () => {
    expect(viewModelSource).toContain(
      "previousRatioRange: formatValue(roundTo2Dp(getValueFromRecordOrRoot(repeatSaleInfoRecord, details, ['previousRatioRange', 'PreviousRatioRange'])))",
    );
  });

  test('latestRatioRange uses roundTo2Dp', () => {
    expect(viewModelSource).toContain(
      "latestRatioRange: formatValue(roundTo2Dp(getValueFromRecordOrRoot(repeatSaleInfoRecord, details, ['latestRatioRange', 'laterRatioRange', 'LatestRatioRange', 'LaterRatioRange'])))",
    );
  });

  test('conditionScore uses roundTo2Dp via toEditableInput', () => {
    expect(viewModelSource).toContain(
      "conditionScore: toEditableInput(roundTo2Dp(getValue(salesParticularDetails, 'conditionScore')))",
    );
  });
});

/* ================================================================== */
/*  3. Glazing / Heating info icons removed                           */
/* ================================================================== */

describe('glazing and heating info icons removed', () => {
  test('glazing attributeTooltip is empty string', () => {
    expect(viewModelSource).toMatch(/attributeTooltips:\s*\{[\s\S]*?glazing:\s*''/);
  });

  test('heating attributeTooltip is empty string', () => {
    expect(viewModelSource).toMatch(/attributeTooltips:\s*\{[\s\S]*?heating:\s*''/);
  });

  test('glazing tooltip does not use firstNonEmpty', () => {
    expect(viewModelSource).not.toContain("'Compare glazing using reference images'");
  });

  test('heating tooltip does not use firstNonEmpty', () => {
    expect(viewModelSource).not.toContain("'Compare heating using reference images'");
  });
});

/* ================================================================== */
/*  4. QC section hidden for non-QA users (all statuses)              */
/* ================================================================== */

describe('QC section hidden for non-QA users', () => {
  test('non-QA users always get showSection false', () => {
    expect(runtimeSource).toContain("return { canSubmit: false, showSection: false };");
  });
});

/* ================================================================== */
/*  5. Modify SVT Task hidden for Unknown User                        */
/* ================================================================== */

describe('modify SVT task button hidden for Unknown User', () => {
  test('canShowModifyTaskButton checks assignedTo is not Unknown User', () => {
    expect(taskSectionSource).toContain("assignedTo !== 'Unknown User'");
  });

  test('canShowModifyTaskButton depends on both statusText and assignedTo', () => {
    expect(taskSectionSource).toMatch(
      /canShowModifyTaskAction\(statusText\)\s*&&\s*assignedTo\s*!==\s*'Unknown User'/,
    );
  });

  test('canShowModifyTaskButton memo includes assignedTo in dependency array', () => {
    expect(taskSectionSource).toContain('[statusText, assignedTo]');
  });
});
