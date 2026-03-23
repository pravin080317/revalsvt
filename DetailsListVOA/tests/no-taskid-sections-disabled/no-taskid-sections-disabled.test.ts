/**
 * Tests: When taskId is null/empty or taskStatus is null/empty, PAD confirmation,
 * sales particulars, promote-to-master (WLTT/LRPPD), and sales verification
 * sections are disabled, and QC controls are hidden.
 *
 * Also validates PAD confirmation layout uses compact left-aligned flex layout.
 */
import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '..', '..', '..');

function readRepoFile(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const shellSource = readRepoFile('DetailsListVOA/components/SaleDetailsShell/SaleDetailsShell.tsx');
const shellCss = readRepoFile('DetailsListVOA/components/SaleDetailsShell/SaleDetailsShell.css');

/* ================================================================== */
/*  1. noTaskId and noTaskStatus flags                                */
/* ================================================================== */

describe('noTaskId flag', () => {
  test('noTaskId is derived from model.taskId', () => {
    expect(shellSource).toContain('const noTaskId = !model.taskId;');
  });
});

describe('noTaskStatus flag', () => {
  test('noTaskStatus is derived from model.statusText', () => {
    expect(shellSource).toContain("const noTaskStatus = !model.statusText || model.statusText === '-';");
  });
});

describe('sectionsDisabled combines noTaskId and noTaskStatus', () => {
  test('sectionsDisabled flag combines both conditions', () => {
    expect(shellSource).toContain('const sectionsDisabled = noTaskId || noTaskStatus;');
  });
});

/* ================================================================== */
/*  2. Sections disabled via readOnly when sectionsDisabled            */
/* ================================================================== */

describe('sections disabled when taskId or taskStatus is null', () => {
  test('PadSection readOnly includes sectionsDisabled', () => {
    expect(shellSource).toContain('readOnly={readOnly || sectionsDisabled}');
  });

  test('readOnly || sectionsDisabled appears for PAD, WLTT, LRPPD, particulars, and verification sections', () => {
    const matches = shellSource.match(/readOnly=\{readOnly \|\| sectionsDisabled\}/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(5);
  });

  test('canProgressTask suppressed when sectionsDisabled', () => {
    expect(shellSource).toContain('canProgressTask={canProgressTask && !sectionsDisabled}');
  });

  test('canSubmitQcOutcome suppressed when sectionsDisabled', () => {
    expect(shellSource).toContain('canSubmitQcOutcome={canSubmitQcOutcome && !sectionsDisabled}');
  });

  test('showQcSection suppressed when sectionsDisabled', () => {
    expect(shellSource).toContain('showQcSection={showQcSection && !sectionsDisabled}');
  });
});

/* ================================================================== */
/*  3. PAD confirmation compact left-aligned layout                   */
/* ================================================================== */

describe('PAD confirmation layout', () => {
  test('uses flex layout (not grid)', () => {
    expect(shellCss).toMatch(/\.voa-pad-confirmation\s*\{[^}]*display:\s*flex/);
  });

  test('has compact gap of 8px', () => {
    expect(shellCss).toMatch(/\.voa-pad-confirmation\s*\{[^}]*gap:\s*8px/);
  });

  test('label has white-space nowrap for left alignment', () => {
    expect(shellCss).toMatch(/\.voa-pad-confirmation__label\s*\{[^}]*white-space:\s*nowrap/);
  });

  test('dropdown has fixed width of 260px', () => {
    expect(shellCss).toMatch(/\.voa-pad-confirmation__dropdown\s*\{[^}]*width:\s*260px/);
  });

  test('responsive breakpoint uses flex-direction column', () => {
    expect(shellCss).toMatch(/\.voa-pad-confirmation\s*\{[^}]*flex-direction:\s*column/);
  });
});

/* ================================================================== */
/*  4. Disabled button styling for action buttons                     */
/* ================================================================== */

describe('disabled button styling', () => {
  test('action buttons have a visible disabled state (greyed out)', () => {
    expect(shellCss).toMatch(/\.voa-sales-verification-action-btn:disabled/);
  });

  test('disabled buttons use muted background and text', () => {
    const disabledBlock = shellCss.slice(
      shellCss.indexOf('.voa-sales-verification-action-btn:disabled'),
    );
    expect(disabledBlock).toMatch(/background:\s*#f3f2f1/);
    expect(disabledBlock).toMatch(/color:\s*#a19f9d/);
    expect(disabledBlock).toMatch(/cursor:\s*not-allowed/);
  });
});
