/**
 * api-user-name-mapping.test.ts
 *
 * Unit tests for the getSales API user name mapping pipeline in DataService.ts.
 *
 * Covers:
 *  - normalizeSearchResponse: extraction of assignedToUserList / qcAssignedToUserList
 *  - userLookup GUID → display name mapping
 *  - userFilterOptions {key, text} dropdown option building
 *  - Stripping user list keys from regular filters
 *  - assignedToName / qcAssignedToName pass-through on sales items
 *  - displayFilterOptionsRich contract in DetailsListHost.tsx (source-reading)
 */

import fs from 'fs';
import path from 'path';
import { normalizeSearchResponse, unwrapCustomApiPayload } from '../services/DataService';

const repoRoot = path.resolve(__dirname, '..', '..');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const hostSource = fs.readFileSync(
  path.join(repoRoot, 'DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx'),
  'utf8',
);

const gridSource = fs.readFileSync(
  path.join(repoRoot, 'DetailsListVOA/Grid.tsx'),
  'utf8',
);

// ---------------------------------------------------------------------------

describe('getSales API user name mapping', () => {
  describe('unwrapCustomApiPayload — APIM envelopes', () => {
    test('unwraps nested response.Result payload with pageInfo and sales items', () => {
      const wrapped = {
        response: {
          '@odata.context': 'https://example.crm11.dynamics.com/api/data/v9.0/$metadata#Microsoft.Dynamics.CRM.voa_GetAllSalesRecordResponse',
          Result: JSON.stringify({
            pageInfo: { pageNumber: 1, pageSize: 500, totalRows: 24 },
            sales: [
              {
                saleId: 'S-1000026',
                taskId: 'M-1029671',
                address: '10 SUMMERLAND CLOSE',
                assignedTo: '95ba3c88-b8e2-4bd1-a7c3-fa5ea4399859',
                assignedToName: 'Maria Augustine',
                qcAssignedTo: 'e5ed7758-1b05-428b-b726-414329ce2486',
                qcAssignedToName: 'Shahul Sheik Dawood',
              },
            ],
          }),
        },
      };

      const unwrapped = unwrapCustomApiPayload(wrapped);
      const normalized = normalizeSearchResponse(unwrapped);

      expect(normalized.totalCount).toBe(24);
      expect(normalized.items).toHaveLength(1);
      expect(normalized.items[0].saleId).toBe('S-1000026');
      expect(normalized.items[0].assignedToName).toBe('Maria Augustine');
      expect(normalized.items[0].qcAssignedToName).toBe('Shahul Sheik Dawood');
    });
  });

  // -------------------------------------------------------------------------
  describe('normalizeSearchResponse — assignedToUserList extraction', () => {
    const payload = {
      sales: [],
      pageInfo: { totalRecords: 0, pageNumber: 1, pageSize: 25 },
      filters: {
        assignedToUserList: [
          { userId: 'AAA-111', userName: 'Alice Caseworker', isActive: true },
          { userId: 'BBB-222', userName: 'Bob Worker', isActive: false },
        ],
        qcAssignedToUserList: [
          { userId: 'CCC-333', userName: 'Carol QC', isActive: true },
        ],
        taskStatus: ['Assigned', 'Complete'],
      },
    };

    const result = normalizeSearchResponse(payload);

    test('userLookup maps lowercased GUIDs to display names', () => {
      expect(result.userLookup?.['aaa-111']).toBe('Alice Caseworker');
      expect(result.userLookup?.['bbb-222']).toBe('Bob Worker');
      expect(result.userLookup?.['ccc-333']).toBe('Carol QC');
    });

    test('userFilterOptions[assignedto] builds {key, text} option objects', () => {
      const opts = result.userFilterOptions?.['assignedto'];
      expect(opts).toHaveLength(2);
      expect(opts?.[0]).toEqual({ key: 'aaa-111', text: 'Alice Caseworker' });
      expect(opts?.[1]).toEqual({ key: 'bbb-222', text: 'Bob Worker' });
    });

    test('userFilterOptions[qcassignedto] builds {key, text} option objects', () => {
      const opts = result.userFilterOptions?.['qcassignedto'];
      expect(opts).toHaveLength(1);
      expect(opts?.[0]).toEqual({ key: 'ccc-333', text: 'Carol QC' });
    });

    test('user list keys are stripped from regular filters', () => {
      expect(result.filters?.['assignedToUserList']).toBeUndefined();
      expect(result.filters?.['qcAssignedToUserList']).toBeUndefined();
    });

    test('regular filter values pass through unchanged', () => {
      expect(result.filters?.['taskstatus']).toEqual(['Assigned', 'Complete']);
    });

    test('inactive users (isActive: false) are still included in lookup and options', () => {
      // isActive is informational only — inactive users are not excluded from the dropdown
      expect(result.userLookup?.['bbb-222']).toBe('Bob Worker');
      const opts = result.userFilterOptions?.['assignedto'];
      expect(opts?.find((o) => o.key === 'bbb-222')).toEqual({ key: 'bbb-222', text: 'Bob Worker' });
    });

    test('option keys use lowercased user IDs', () => {
      // Keys must be lowercase so they match the lowercased GUID comparisons in DetailsListHost
      const assignedOpts = result.userFilterOptions?.['assignedto'] ?? [];
      const qcOpts = result.userFilterOptions?.['qcassignedto'] ?? [];
      [...assignedOpts, ...qcOpts].forEach((o) => {
        expect(o.key).toBe(o.key.toLowerCase());
      });
    });

    test('user options are alphabetically sorted by display name and deduplicated by GUID', () => {
      const sortedResult = normalizeSearchResponse({
        sales: [],
        filters: {
          assignedToUserList: [
            { userId: 'ZZZ-999', userName: 'Zara Worker', isActive: true },
            { userId: 'AAA-111', userName: 'Alice Caseworker', isActive: true },
            { userId: 'BBB-222', userName: 'Bob Worker', isActive: true },
            { userId: 'AAA-111', userName: 'Alice Caseworker Duplicate', isActive: true },
          ],
          qcAssignedToUserList: [
            { userId: 'DDD-444', userName: 'Delta QC', isActive: true },
            { userId: 'CCC-333', userName: 'Charlie QC', isActive: true },
          ],
        },
      });

      expect(sortedResult.userFilterOptions?.['assignedto']).toEqual([
        { key: 'aaa-111', text: 'Alice Caseworker' },
        { key: 'bbb-222', text: 'Bob Worker' },
        { key: 'zzz-999', text: 'Zara Worker' },
      ]);

      expect(sortedResult.userFilterOptions?.['qcassignedto']).toEqual([
        { key: 'ccc-333', text: 'Charlie QC' },
        { key: 'ddd-444', text: 'Delta QC' },
      ]);
    });
  });

  // -------------------------------------------------------------------------
  describe('normalizeSearchResponse — no user lists', () => {
    test('userLookup is undefined when no user list keys in filters', () => {
      const result = normalizeSearchResponse({
        sales: [],
        filters: { taskStatus: ['Assigned'] },
      });
      expect(result.userLookup).toBeUndefined();
    });

    test('userFilterOptions is undefined when no user list keys in filters', () => {
      const result = normalizeSearchResponse({
        sales: [],
        filters: { taskStatus: ['Assigned'] },
      });
      expect(result.userFilterOptions).toBeUndefined();
    });

    test('userLookup is undefined when only qcAssignedToUserList is absent', () => {
      const result = normalizeSearchResponse({ sales: [], filters: {} });
      expect(result.userLookup).toBeUndefined();
      expect(result.userFilterOptions).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  describe('normalizeSearchResponse — assignedToUserList only (no QC list)', () => {
    const result = normalizeSearchResponse({
      sales: [],
      filters: {
        assignedToUserList: [{ userId: 'DDD-444', userName: 'Dave CW', isActive: true }],
      },
    });

    test('userFilterOptions[assignedto] is populated', () => {
      expect(result.userFilterOptions?.['assignedto']).toEqual([{ key: 'ddd-444', text: 'Dave CW' }]);
    });

    test('userFilterOptions[qcassignedto] is absent when no QC user list supplied', () => {
      expect(result.userFilterOptions?.['qcassignedto']).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  describe('normalizeSearchResponse — sales item name pass-through', () => {
    test('assignedToName is carried through from sales item', () => {
      const result = normalizeSearchResponse({
        sales: [{ assignedTo: 'aaa-111', assignedToName: 'Alice Caseworker' }],
        filters: {},
      });
      expect(result.items[0].assignedToName).toBe('Alice Caseworker');
    });

    test('qcAssignedToName is carried through from sales item', () => {
      const result = normalizeSearchResponse({
        sales: [{ qcAssignedTo: 'ccc-333', qcAssignedToName: 'Carol QC' }],
        filters: {},
      });
      expect(result.items[0].qcAssignedToName).toBe('Carol QC');
    });

    test('missing name fields produce undefined (not null)', () => {
      const result = normalizeSearchResponse({
        sales: [{ assignedTo: 'aaa-111' }],
        filters: {},
      });
      expect(result.items[0].assignedToName).toBeUndefined();
      expect(result.items[0].qcAssignedToName).toBeUndefined();
    });

    test('summaryFlags accepts array payloads (sort response contract)', () => {
      const result = normalizeSearchResponse({
        sales: [{ summaryFlags: ['Low confidence', 'Review required'] }],
        filters: {},
      });
      expect(result.items[0].summaryFlags).toEqual(['Low confidence', 'Review required']);
    });

    test('summaryFlags accepts comma/semicolon delimited payloads', () => {
      const result = normalizeSearchResponse({
        sales: [{ summaryFlags: 'Low confidence,Review required;Needs check' }],
        filters: {},
      });
      expect(result.items[0].summaryFlags).toEqual(['Low confidence', 'Review required', 'Needs check']);
    });
  });

  // -------------------------------------------------------------------------
  describe('displayFilterOptionsRich contract (DetailsListHost.tsx source)', () => {
    test('iterates both assignedto and qcassignedto filter fields', () => {
      expect(hostSource).toContain("(['assignedto', 'qcassignedto'] as const).forEach");
    });

    test('prefers API-supplied user options when available', () => {
      expect(hostSource).toContain('apiUserFilterOptions[field]');
      expect(hostSource).toContain('apiUserFilterOptions[field].length > 0');
    });

    test('option text is updated from display name map when plugin cache is available', () => {
      expect(hostSource).toContain('userDisplayNameMap[o.key]');
    });

    test('GUID key is preserved through the rich option mapping', () => {
      expect(hostSource).toContain('key: o.key,');
    });

    test('falls back to raw GUID strings with display map when no API user options', () => {
      expect(hostSource).toContain('apiFilterOptions[field]');
      expect(hostSource).toContain('userDisplayNameMap[normalizedGuid]');
    });

    test('apiUserLookup and apiUserFilterOptions state is held in DetailsListHost', () => {
      expect(hostSource).toContain('apiUserLookup');
      expect(hostSource).toContain('apiUserFilterOptions');
    });

    test('preserves assigned/qc assigned ID fields for GUID-backed filtering', () => {
      expect(hostSource).toContain('r.assignedtoid = assignedToIds');
      expect(hostSource).toContain('r.qcassignedtoid = qcAssignedToIds');
    });

    test('passes APIM filter options into Grid for synchronous column filter menus', () => {
      expect(hostSource).toContain('columnFilterOptions: displayFilterOptionsRich');
    });

    test('Grid prefers preloaded APIM column filter options before record-derived distinct values', () => {
      expect(gridSource).toContain("columnFilterOptions[normalizedField]");
    });

    test('Grid no longer excludes summary flag from async filter option loading', () => {
      expect(gridSource).not.toContain('!isSummaryFlagField &&');
    });

    test('normalizeFilterOptions splits semicolon-delimited multiSelect filter values', () => {
      // COLUMN_FILTER_VALUE_SEPARATOR is "," but the API returns summaryflags as ";"-delimited.
      // The condition must use /[;,|]/ not trimmed.includes(',') so that semicolons also trigger the split.
      expect(hostSource).toContain('/[;,|]/.test(trimmed)');
      expect(hostSource).toContain('.flatMap((v) => (/[;,|]/.test(v) ? splitDelimitedFilterValue(v) : [v]))');
    });

    test('summary/review/overall flag dropdown options are alphabetically sorted', () => {
      expect(gridSource).toContain("normalizedField === 'summaryflags'");
      expect(gridSource).toContain("normalizedField === 'reviewflags'");
      expect(gridSource).toContain("normalizedField === 'overallflag'");
      expect(gridSource).toContain("return aText.localeCompare(bText, undefined, { sensitivity: 'base' });");
    });

    test('host sort normalizes multi-value strings and arrays to first-word keys', () => {
      expect(hostSource).toContain('const toFirstWordKey = (value: unknown): string => {');
      expect(hostSource).toContain("const firstToken = source.split(/[;,|]/)[0] ?? '';");
      expect(hostSource).toContain("const firstWord = firstToken.trim().toLowerCase().split(/\\s+/)[0] ?? '';");
      expect(hostSource).toContain('if (Array.isArray(v)) return toFirstWordKey(v);');
      expect(hostSource).toContain("if (typeof v === 'string') return toFirstWordKey(v);");
    });
  });
});
