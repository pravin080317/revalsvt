# SonarCloud Issue Extraction And File Cross-Check (2026-04-22)

## Scope

- Source: attached SonarCloud screenshots from branch `feature/welsh-reform/svt/devbase`.
- Goal: extract issue themes and verify whether matching code is present in this workspace.
- Checked area: `DetailsListVOA/**`.

## Screenshot Issues Mapped To Current Files

| Screenshot item | Sonar rule text (short) | Screenshot ref | Current code check | Evidence |
| --- | --- | --- | --- | --- |
| 1 | Provide compare function based on `String.localeCompare` | `StatutorySpatialUnitBrowser.tsx` L246/L247 | Present | `DetailsListVOA/components/SpatialUnitBrowser/StatutorySpatialUnitBrowser.tsx:246` and `DetailsListVOA/components/SpatialUnitBrowser/StatutorySpatialUnitBrowser.tsx:247` use `Object.keys(...).sort()` without explicit comparator. |
| 2 | Reduce cognitive complexity 80 to 15 | `Filters.ts` L100 | Likely present | `DetailsListVOA/Filters.ts:100` starts `sanitizeFilters(...)`, a large multi-branch function. |
| 3 | Reduce cognitive complexity 156 to 15 | `Grid.tsx` L743 | Likely present (line drift) | `DetailsListVOA/Grid.tsx` remains a large component with many nested callbacks and conditional branches. |
| 4 | Reduce cognitive complexity 35 to 15 | `Grid.tsx` L1381 | Likely present | `DetailsListVOA/Grid.tsx:1382` is `isPrefilterDefault(...)` with multi-branch persona logic. |
| 5 | Reduce cognitive complexity 34 to 15 | `Grid.tsx` L2059 | Likely present | `DetailsListVOA/Grid.tsx:2040` to `DetailsListVOA/Grid.tsx:2078` (`handlePrefilterSearch`) combines state normalization, storage write, and UI state updates. |
| 6 | Refactor to not nest functions more than 4 levels | `Grid.tsx` L5426 | Present | `DetailsListVOA/Grid.tsx:5426` is inside a deep callback chain in menu multi-select handling. |
| 7 | Remove use of `void` operator | `Grid.tsx` L6844 | Present in file (line drift) | Current `void` uses include `DetailsListVOA/Grid.tsx:6754` and `DetailsListVOA/Grid.tsx:6991`. |
| 8 | Reduce cognitive complexity 27 to 15 | `DetailsListHost.tsx` L247 | Not directly reproducible at same line | `DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx:247` is now simple delimiter split logic; likely line drift from previous scan snapshot. |
| 9 | Reduce cognitive complexity 23 to 15 | `DetailsListHost.tsx` L284 | Not directly reproducible at same line | `DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx:284` is branch handling in filter normalization; may have moved since screenshot scan. |
| 10 | Reduce cognitive complexity 23 to 15 | `ManagerJourneyShell.tsx` L186 | Likely present (line drift) | `DetailsListVOA/components/HomeShell/ManagerJourneyShell.tsx:186` is the main component entry; complexity likely attributed to the full component body. |
| 11 | Remove use of `void` operator | `SaleDetailsShell.tsx` L337 | Present (exact) | `DetailsListVOA/components/SaleDetailsShell/SaleDetailsShell.tsx:337` has `onClick={() => { void onRefresh(); }}`. |

## Similar Issues Found In The Same Rule Families

### `sort()` without comparator (same reliability theme)

- `DetailsListVOA/components/SpatialUnitBrowser/StatutorySpatialUnitBrowser.tsx:246`
- `DetailsListVOA/components/SpatialUnitBrowser/StatutorySpatialUnitBrowser.tsx:247`
- `DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx:300`
- `DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx:301`

### `void` operator expression use (same intentionality theme)

- `DetailsListVOA/components/SaleDetailsShell/SaleDetailsShell.tsx:337`
- `DetailsListVOA/components/SpatialUnitBrowser/StatutorySpatialUnitBrowser.tsx:279`
- `DetailsListVOA/components/SpatialUnitBrowser/StatutorySpatialUnitBrowser.tsx:324`
- `DetailsListVOA/Grid.tsx:2966`
- `DetailsListVOA/Grid.tsx:4013`
- `DetailsListVOA/Grid.tsx:4021`
- `DetailsListVOA/Grid.tsx:4027`
- `DetailsListVOA/Grid.tsx:4221`
- `DetailsListVOA/Grid.tsx:5036`
- `DetailsListVOA/Grid.tsx:6754`
- `DetailsListVOA/Grid.tsx:6991`
- `DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx:642`
- `DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx:1646`
- `DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx:1727`
- `DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx:1850`
- `DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx:2008`
- `DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx:2201`
- `DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx:2722`

## Notes

- The screenshot line numbers and current workspace lines are not fully identical in all files; several issues appear to be line-drifted rather than removed.
- Cognitive complexity values cannot be recalculated exactly from static grep checks alone; those entries are marked as likely-present where the same high-risk function structure still exists.