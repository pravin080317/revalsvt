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
import { normalizeSearchResponse } from '../services/DataService';

const repoRoot = path.resolve(__dirname, '..', '..');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const hostSource = fs.readFileSync(
  path.join(repoRoot, 'DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx'),
  'utf8',
);

// ---------------------------------------------------------------------------

describe('getSales API user name mapping', () => {
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
  });
});
