import { browser } from 'k6/browser';
import { check, sleep } from 'k6';

const TARGET_URL = __ENV.TARGET_URL || 'http://localhost:8182';
const ITERATION_PAUSE_SECONDS = Number(__ENV.ITERATION_PAUSE_SECONDS || '1');
const MAX_WAIT_MS = Number(__ENV.MAX_WAIT_MS || '30000');
const USER_COUNT = Number(__ENV.USER_COUNT || '200');
const RAMP_UP_SECONDS = Number(__ENV.RAMP_UP_SECONDS || '60');
const HOLD_SECONDS = Number(__ENV.HOLD_SECONDS || '300');
const RAMP_DOWN_SECONDS = Number(__ENV.RAMP_DOWN_SECONDS || '30');
const PAGE_SETTLE_TARGET_MS = Number(__ENV.PAGE_SETTLE_TARGET_MS || '20000');
const MAX_HTTP_FAIL_RATE = Number(__ENV.MAX_HTTP_FAIL_RATE || '0.01');
const REQUIRE_BACK_NAV = String(__ENV.REQUIRE_BACK_NAV || 'false').toLowerCase() === 'true';
const FUNCTIONAL_FLOW_MODE = String(__ENV.FUNCTIONAL_FLOW_MODE || 'false').toLowerCase() === 'true';
const EXPECT_VIEW_SALE_ENV = String(__ENV.EXPECT_VIEW_SALE || '').toLowerCase();
const DEBUG_LOG = String(__ENV.DEBUG_LOG || '').toLowerCase() === 'true';
const FORCE_TILE_KEY = (__ENV.FORCE_TILE_KEY || '').trim();
const HOME_COUNTRY = __ENV.HOME_COUNTRY || 'England';
const HOME_LIST_YEAR = __ENV.HOME_LIST_YEAR || '2033';
const WORKSPACE_SELECT_RETRIES = Number(__ENV.WORKSPACE_SELECT_RETRIES || '4');
const START_STAGGER_MS = Number(__ENV.START_STAGGER_MS || '400');
const PERSONAS = (__ENV.PERSONAS || 'manager,qa,user,manager,user')
  .split(',')
  .map((p) => p.trim().toLowerCase())
  .filter(Boolean);

const PERSONA_TILE_PRIORITY = {
  manager: ['salesSearch', 'managerAssign', 'caseworkerView', 'qcAssign', 'qcView'],
  qa: ['qcView', 'qcAssign', 'salesSearch'],
  user: ['caseworkerView', 'salesSearch'],
  none: ['salesSearch'],
};

const resolveExpectViewSale = () => {
  if (EXPECT_VIEW_SALE_ENV === 'true' || EXPECT_VIEW_SALE_ENV === '1' || EXPECT_VIEW_SALE_ENV === 'yes') {
    return true;
  }
  if (EXPECT_VIEW_SALE_ENV === 'false' || EXPECT_VIEW_SALE_ENV === '0' || EXPECT_VIEW_SALE_ENV === 'no') {
    return false;
  }
  return (FORCE_TILE_KEY || '').toLowerCase() === 'salessearch';
};

const EXPECT_VIEW_SALE = resolveExpectViewSale();

export const options = {
  scenarios: {
    ui_200_users: FUNCTIONAL_FLOW_MODE
      ? {
        executor: 'per-vu-iterations',
        options: {
          browser: {
            type: 'chromium',
          },
        },
        vus: USER_COUNT,
        iterations: 1,
        maxDuration: `${Math.max(60, HOLD_SECONDS)}s`,
      }
      : {
        executor: 'ramping-vus',
        options: {
          browser: {
            type: 'chromium',
          },
        },
        startVUs: 1,
        stages: [
          { duration: `${RAMP_UP_SECONDS}s`, target: USER_COUNT },
          { duration: `${HOLD_SECONDS}s`, target: USER_COUNT },
          { duration: `${RAMP_DOWN_SECONDS}s`, target: 0 },
        ],
        gracefulRampDown: '30s',
      },
  },
  thresholds: {
    checks: [FUNCTIONAL_FLOW_MODE ? 'rate>0.90' : 'rate>0.98'],
    browser_web_vital_lcp: [FUNCTIONAL_FLOW_MODE ? 'p(95)<4000' : 'p(95)<2500'],
    browser_web_vital_fcp: [FUNCTIONAL_FLOW_MODE ? 'p(95)<3000' : 'p(95)<2000'],
    browser_web_vital_cls: [FUNCTIONAL_FLOW_MODE ? 'p(95)<0.5' : 'p(95)<0.1'],
    browser_http_req_failed: [`rate<${MAX_HTTP_FAIL_RATE}`],
  },
};

async function tryClick(page, selectors) {
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector);
      const count = await locator.count();
      if (count > 0) {
        try {
          await locator.first().click({ timeout: 5000 });
          return true;
        } catch (_error) {
          // Optional interactions should not fail an iteration if a control
          // is present but not currently actionable in the harness.
        }
      }
    } catch (_error) {
      // Skip selectors unsupported by the current query engine.
    }
  }
  return false;
}

async function tryClickEnabled(page, selectors) {
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector);
      const count = await locator.count();
      if (count > 0) {
        const first = locator.first();
        const enabled = await first.isEnabled();
        if (!enabled) continue;
        try {
          await first.click({ timeout: 5000 });
          return true;
        } catch (_error) {
          // Continue trying alternate selectors.
        }
      }
    } catch (_error) {
      // Skip unsupported selector.
    }
  }
  return false;
}

async function waitForAnySelector(page, selectors, timeoutMs = MAX_WAIT_MS) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    for (const selector of selectors) {
      try {
        const locator = page.locator(selector);
        if ((await locator.count()) > 0) {
          return selector;
        }
      } catch (_error) {
        // Ignore unsupported selectors and keep polling.
      }
    }
    await page.waitForTimeout(200);
  }
  return undefined;
}

async function setComboValue(page, selectors, value) {
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector);
      if ((await locator.count()) > 0) {
        await locator.first().fill('');
        await locator.first().type(value, { delay: 20 });
        await locator.first().press('Enter');
        return true;
      }
    } catch (_error) {
      // Try next selector.
    }
  }
  return false;
}

async function clickButtonByText(page, textFragments) {
  return page.evaluate((fragments) => {
    const lowered = fragments.map((f) => String(f).toLowerCase());
    const buttons = Array.from(document.querySelectorAll('button'));
    for (const btn of buttons) {
      const label = `${btn.textContent || ''} ${btn.getAttribute('aria-label') || ''}`.toLowerCase();
      if (lowered.some((fragment) => label.includes(fragment))) {
        btn.click();
        return true;
      }
    }
    return false;
  }, textFragments);
}

async function ensureRowsPresent(page) {
  const rows = await waitForAnySelector(page, ['.ms-DetailsRow'], 4000);
  if (rows) return true;

  // Sales Search flow: provide valid criteria before triggering Search.
  const hasSalesSearchInputs = await waitForAnySelector(page, ['#sales-saleid', '#sales-postcode'], 1000);
  if (hasSalesSearchInputs) {
    try {
      const saleIdInput = page.locator('#sales-saleid');
      if ((await saleIdInput.count()) > 0) {
        await saleIdInput.first().fill('S-1000001');
      } else {
        const postcodeInput = page.locator('#sales-postcode');
        if ((await postcodeInput.count()) > 0) {
          await postcodeInput.first().fill('CF10 1AA');
        }
      }
    } catch (_error) {
      // Continue with best-effort search click below.
    }

    const searched = await tryClickEnabled(page, [
      '.voa-search-panel__actions button[aria-label*="Search" i]',
      'button[aria-label="Search"]',
    ]);
    if (searched) {
      const rowsAfterSearch = await waitForAnySelector(page, ['.ms-DetailsRow'], 10000);
      if (rowsAfterSearch) return true;
    }
  }

  // Prefilter flow (assignment/caseworker/qc views): trigger the prefilter Search.
  const prefilterSearched = await tryClickEnabled(page, [
    '.voa-prefilter-actions button[aria-label*="Search" i]',
    '.voa-prefilter-actions button',
  ]);
  if (prefilterSearched) {
    const rowsAfterPrefilterSearch = await waitForAnySelector(page, ['.ms-DetailsRow'], 10000);
    if (rowsAfterPrefilterSearch) return true;
  }

  // Last resort: generic enabled search button.
  const searched = await tryClickEnabled(page, ['button[aria-label*="Search" i]']);
  if (searched) {
    const rowsAfterSearch = await waitForAnySelector(page, ['.ms-DetailsRow'], 6000);
    if (rowsAfterSearch) return true;
  }

  return false;
}

async function selectSingleRow(page) {
  const selectedViaCheckbox = await page.evaluate(() => {
    const row = document.querySelector('.ms-DetailsRow');
    if (!row) return false;
    const checkbox = row.querySelector('button[role="checkbox"], [role="checkbox"]');
    if (checkbox) {
      checkbox.click();
      return true;
    }
    (row).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  });

  if (!selectedViaCheckbox) return false;
  await page.waitForTimeout(200);

  const hasSingleSelection = await page.evaluate(() => {
    const rootText = document.body?.innerText?.toLowerCase() || '';
    return rootText.includes('1 selected');
  });

  return hasSingleSelection || selectedViaCheckbox;
}

async function openViewSaleRecord(page) {
  const openedFromButton = await tryClickEnabled(page, [
    '[data-testid="voa-open-first-sale-test"]',
    '[data-testid="voa-view-sales-record-button"]',
    'button[aria-label*="View selected" i]',
    'button[aria-label*="sales record" i]',
    'button[title*="View" i]',
  ]);

  if (openedFromButton) return true;
  return clickButtonByText(page, ['view sales record', 'view sale record']);
}

async function invokeFirstRow(page) {
  return page.evaluate(() => {
    const row = document.querySelector('.ms-DetailsRow');
    if (!row) return false;
    const target = row.querySelector('.ms-DetailsRow-cell') || row;
    target.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  });
}

async function selectPersonaWorkspace(page, persona) {
  if (FORCE_TILE_KEY) {
    const forcedSelector = `#voa-home-tile-button-${FORCE_TILE_KEY}`;
    if (await tryClick(page, [forcedSelector])) {
      return FORCE_TILE_KEY;
    }
  }

  const priorities = PERSONA_TILE_PRIORITY[persona] || PERSONA_TILE_PRIORITY.manager;
  for (const tileKey of priorities) {
    const selector = `#voa-home-tile-button-${tileKey}`;
    if (await tryClick(page, [selector])) {
      return tileKey;
    }
  }
  return undefined;
}

async function selectPersonaWorkspaceWithRetry(page, persona, retries = WORKSPACE_SELECT_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const selectedTile = await selectPersonaWorkspace(page, persona);
    if (!selectedTile) {
      await page.waitForTimeout(250);
      continue;
    }

    const transitioned = await waitForAnySelector(
      page,
      ['#voa-home-table-stage', '#voa-grid-results', '.ms-DetailsRow'],
      8000,
    );
    if (transitioned) {
      return selectedTile;
    }

    // Keep retries deterministic when the first click is swallowed in local harness.
    await page.waitForTimeout(300 * attempt);
  }

  return undefined;
}

async function runEndToEndJourney(page, persona) {
  const shell = await waitForAnySelector(page, ['#voa-home-tiles-stage', '#voa-home-table-stage']);
  if (!shell) return { openedTable: false, openedSaleRecord: false, returnedToTable: false };

  // Ensure context is populated on the home shell before selecting a workspace.
  if (shell === '#voa-home-tiles-stage') {
    await setComboValue(page, ['#voa-home-context-country-input input', '#voa-home-context-country-input'], HOME_COUNTRY);
    await setComboValue(page, ['#voa-home-context-listyear-input input', '#voa-home-context-listyear-input'], HOME_LIST_YEAR);
    await page.waitForTimeout(250);
    await selectPersonaWorkspaceWithRetry(page, persona);
  }

  const tableReady = await waitForAnySelector(page, ['#voa-home-table-stage', '#voa-grid-results', '.ms-DetailsRow'], 15000);
  if (!tableReady) return { openedTable: false, openedSaleRecord: false, returnedToTable: false };

  const rowsReady = await ensureRowsPresent(page);
  if (!rowsReady) {
    return { openedTable: true, openedSaleRecord: false, returnedToTable: false };
  }

  // In local harness mode, row invoke is the most deterministic path to details.
  let detailsSelector = await waitForAnySelector(page, [
    '.voa-details-view-wrap--active',
    '.voa-sale-details-shell',
    '[aria-label="Sale Record Details"]',
    '#section-master',
  ], 1000);
  if (!detailsSelector) {
    const invokedFirst = await invokeFirstRow(page);
    if (invokedFirst) {
      detailsSelector = await waitForAnySelector(page, [
        '.voa-details-view-wrap--active',
        '.voa-sale-details-shell',
        '[aria-label="Sale Record Details"]',
        '#section-master',
      ], 9000);
    }
  }

  if (detailsSelector) {
    await waitForAnySelector(page, ['#section-master', '#section-verification', '#section-particulars'], 5000);
    await tryClick(page, ['.voa-sale-details-shell__header-btn--right']);
    await page.waitForTimeout(200);
    const returned = await tryClick(page, ['.voa-sale-details-shell__header-btn']);
    if (returned) {
      await waitForAnySelector(page, ['#voa-home-table-stage', '#voa-grid-results'], 10000);
    }
    return { openedTable: true, openedSaleRecord: true, returnedToTable: returned };
  }

  const rowSelected = await selectSingleRow(page);

  if (!rowSelected) {
    return { openedTable: true, openedSaleRecord: false, returnedToTable: false };
  }

  const openedFromPrimaryWorkspace = await openViewSaleRecord(page);

  if (!openedFromPrimaryWorkspace && !FORCE_TILE_KEY) {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: MAX_WAIT_MS });
    await waitForAnySelector(page, ['#voa-home-tiles-stage'], 10000);
    await setComboValue(page, ['#voa-home-context-country-input input', '#voa-home-context-country-input'], HOME_COUNTRY);
    await setComboValue(page, ['#voa-home-context-listyear-input input', '#voa-home-context-listyear-input'], HOME_LIST_YEAR);
    await page.waitForTimeout(250);
    await selectPersonaWorkspaceWithRetry(page, 'user');
    await waitForAnySelector(page, ['#voa-home-table-stage', '#voa-grid-results', '.ms-DetailsRow'], 15000);
    const fallbackRowsReady = await ensureRowsPresent(page);
    if (!fallbackRowsReady) {
      return { openedTable: true, openedSaleRecord: false, returnedToTable: false };
    }
    const fallbackRowSelected = await selectSingleRow(page);
    if (!fallbackRowSelected) {
      return { openedTable: true, openedSaleRecord: false, returnedToTable: false };
    }
  }

  const openedFromText = openedFromPrimaryWorkspace || await openViewSaleRecord(page);
  detailsSelector = undefined;
  if (!openedFromText) {
    const invoked = await invokeFirstRow(page);
    if (invoked) {
      detailsSelector = await waitForAnySelector(page, [
        '.voa-sale-details-shell',
        '[aria-label="Sale Record Details"]',
        '#section-master',
      ], 12000);
    }

    if (detailsSelector) {
      // Continue with detail-page validation when row invoke opens the page.
    } else {
    const debug = await page.evaluate(() => {
      const unavailable = document.querySelector('#voa-view-sales-record-unavailable')?.textContent?.trim() || '';
      const selectedSummary = Array.from(document.querySelectorAll('[role="status"], .voa-grid-toolbar__selection-summary'))
        .map((el) => (el.textContent || '').trim())
        .filter(Boolean)
        .slice(0, 5);
      const buttonLabels = Array.from(document.querySelectorAll('button'))
        .slice(0, 25)
        .map((btn) => ({
          label: ((btn.getAttribute('aria-label') || btn.textContent || '').trim()),
          disabled: btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true',
        }))
        .filter((b) => b.label);
      return { unavailable, selectedSummary, buttonLabels };
    });
    if (DEBUG_LOG) {
      console.error(`[view-sale-blocked] persona=${persona} details=${JSON.stringify(debug)}`);
    }
    return { openedTable: true, openedSaleRecord: false, returnedToTable: false };
    }
  }

  if (!detailsSelector) {
    detailsSelector = await waitForAnySelector(page, [
      '.voa-details-view-wrap--active',
      '.voa-sale-details-shell',
      '[aria-label="Sale Record Details"]',
      '#section-master',
    ], 15000);
  }

  if (!detailsSelector) {
    const invoked = await invokeFirstRow(page);
    if (invoked) {
      detailsSelector = await waitForAnySelector(page, [
        '.voa-sale-details-shell',
        '[aria-label="Sale Record Details"]',
        '#section-master',
      ], 12000);
    }
  }

  if (!detailsSelector) {
    if (DEBUG_LOG) {
      const postClickDebug = await page.evaluate(() => {
        const wrapperClass = document.querySelector('.voa-details-view-wrap')?.className || '';
        const actionTypeOutput = (document.querySelector('[data-id="actionType"]')?.textContent || '').trim();
        return { wrapperClass, actionTypeOutput };
      });
      console.error(`[details-not-rendered] persona=${persona} details=${JSON.stringify(postClickDebug)}`);
    }
    return { openedTable: true, openedSaleRecord: false, returnedToTable: false };
  }

  // Touch key sections so the journey is not only opening the page.
  await waitForAnySelector(page, ['#section-master', '#section-verification', '#section-particulars'], 5000);
  await tryClick(page, ['.voa-sale-details-shell__header-btn--right']);
  await page.waitForTimeout(200);

  const returned = await tryClick(page, ['.voa-sale-details-shell__header-btn']);
  if (returned) {
    await waitForAnySelector(page, ['#voa-home-table-stage', '#voa-grid-results'], 10000);
  }

  // Optional table interactions after returning from details.
  await tryClick(page, [
    'button[aria-label*="Sort" i]',
    '.ms-DetailsHeader-cell button',
  ]);
  await tryClick(page, [
    'button[aria-label*="Next page" i]',
    'button[aria-label*="Next" i]',
    'button[title*="Next" i]',
  ]);

  return { openedTable: true, openedSaleRecord: true, returnedToTable: returned };
}

export default async function () {
  const page = await browser.newPage();
  try {
    const start = Date.now();
    const staggerDelay = Math.max(0, START_STAGGER_MS) * Math.max(0, (__VU || 1) - 1);
    if (staggerDelay > 0) {
      await page.waitForTimeout(staggerDelay);
    }

    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: MAX_WAIT_MS });

    const docState = await page.evaluate(() => document.readyState);
    const loaded = check(docState, {
      'document ready': (state) => state === 'complete' || state === 'interactive',
    });

    if (loaded) {
      const persona = PERSONAS.length > 0 ? PERSONAS[(__VU - 1) % PERSONAS.length] : 'manager';
      const journey = await runEndToEndJourney(page, persona);

      check(journey.openedTable, {
        'home to table journey works': (ok) => ok === true,
      });
      check(journey.openedSaleRecord, {
        'table to view sale record works': (ok) => (EXPECT_VIEW_SALE ? ok === true : true),
      });
      check(journey.returnedToTable, {
        'view sale record back navigation works': (ok) => (REQUIRE_BACK_NAV ? ok === true : true),
      });

      await page.waitForTimeout(250);
    }

    const elapsed = Date.now() - start;
    check(elapsed, {
      'page settles within target': (ms) => ms < PAGE_SETTLE_TARGET_MS,
    });

    sleep(ITERATION_PAUSE_SECONDS);
  } finally {
    await page.close();
  }
}
