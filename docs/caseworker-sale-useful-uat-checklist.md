# Caseworker UAT: Is This Sale Useful

## Scope
Focused validation for caseworker behavior of:
- `Is this sale useful?`
- `Why is the sale not useful?`

Exclude QC outcome/remarks from this checklist.

## Expected Behavior (Caseworker Only)

| ID | Logged-in User | Task Assigned To | Task Status | Is this sale useful? | Why not useful? | Expected Result |
|---|---|---|---|---|---|---|
| CW-01 | Caseworker | Current user | Assigned | Editable | Disabled until useful=No | User can change value |
| CW-02 | Caseworker | Current user | Assigned QC Failed | Editable | Disabled until useful=No | User can change value |
| CW-03 | Caseworker | Different user | Assigned | Disabled | Disabled | User cannot change value |
| CW-04 | Caseworker | Different user | Assigned QC Failed | Disabled | Disabled | User cannot change value |
| CW-05 | Caseworker | Current user | Complete | Disabled | Disabled | User cannot change value |
| CW-06 | Caseworker | Any | Missing taskId or taskStatus | Disabled | Disabled | Section disabled |

## Fast Test Steps (Run per row)
1. Open Sale Details as the caseworker user.
2. Confirm task status and assignment for the record.
3. Click `Is this sale useful?`.
4. Verify control state matches expected (enabled/disabled).
5. If enabled, select `No` and verify `Why is the sale not useful?` becomes enabled.
6. Change value and confirm it stays selected.
7. Capture screenshot evidence.

## Common "Cannot Change" Reasons (Expected)
- Record is not assigned to current caseworker.
- Task status is not `Assigned` or `Assigned QC Failed`.
- Task details are incomplete (missing task id/status).
- Page is in read-only mode from runtime access gate.

## Code Gates (Reference)
- Caseworker editable statuses:
  - `DetailsListVOA/services/DetailsListRuntimeController.ts:52`
- Read-only reason when not assigned/eligible:
  - `DetailsListVOA/services/DetailsListRuntimeController.ts:1321`
- Field disable binding:
  - `DetailsListVOA/components/SaleDetailsShell/sections/SalesVerificationSection.tsx:721`
- Dependent field (`Why not useful`) enablement:
  - `DetailsListVOA/components/SaleDetailsShell/sections/SalesVerificationSection.tsx:752`

## Pass/Fail
- Pass: CW-01 and CW-02 editable; all others correctly blocked.
- Fail: any mismatch, especially if assigned caseworker in valid status still cannot edit.
