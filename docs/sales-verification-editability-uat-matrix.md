# Sales Verification Editability UAT Matrix

## Scope
Validate editability behavior on the Sale Details page for:
- `Is this sale useful?`
- `Why is the sale not useful?`
- `QC outcome`
- `QC remarks`

This matrix is based on current implemented gating in:
- `DetailsListVOA/components/SaleDetailsShell/sections/SalesVerificationSection.tsx`
- `DetailsListVOA/components/SaleDetailsShell/rules/ViewSaleActionRules.ts`
- `DetailsListVOA/services/DetailsListRuntimeController.ts`
- `DetailsListVOA/components/SaleDetailsShell/SaleDetailsShell.tsx`

## Quick Rules Summary
- Caseworker edit is allowed only when task is assigned to current user and status is `Assigned` or `Assigned QC Failed`.
- QC edit is allowed only when user is QA/Manager, task is QC-assigned to current user, and status is `Assigned To QC` or `Reassigned To QC`.
- Caseworker can view QC section in read-only mode when the task is assigned to current user and either QC details are present or task status is in QC lifecycle (status contains `QC`, such as `Assigned QC Failed`).
- `Why is the sale not useful?` is enabled only when `Is this sale useful? = No`.
- If task ID or task status is missing, sections are disabled.

## Final Persona View/Edit Table (QC Section)

| Persona | Assigned To Current User | Task Status | QC Details Present | QC Section Visible | QC Outcome Editable | QC Remarks Editable |
|---|---|---|---|---|---|---|
| Caseworker | Yes | Assigned QC Failed | Yes | Yes | No | No |
| Caseworker | Yes | Assigned QC Failed | No | Yes | No | No |
| Caseworker | Yes | Assigned | No | No | No | No |
| Caseworker | No | Any | Any | No | No | No |
| QA | Yes (QC assigned) | Assigned To QC / Reassigned To QC | Any | Yes | Yes | Yes |
| QA | Yes (QC assigned) | Any other status | Any | Yes | No | No |
| QA | No (QC assigned to another user) | Any | Any | No | No | No |
| Manager | Yes (QC assigned) | Assigned To QC / Reassigned To QC | Any | Yes | Yes | Yes |
| Manager | Yes (QC assigned) | Any other status | Any | Yes | No | No |
| Manager | No (QC assigned to another user) | Any | Any | No | No | No |

## Preconditions For UAT
- Have at least 4 test users:
  - Caseworker A
  - Caseworker B
  - QC User
  - Manager
- Have test sales/tasks prepared in these statuses:
  - `Assigned`
  - `Assigned QC Failed`
  - `Assigned To QC`
  - `Reassigned To QC`
  - `Complete` (for negative checks)
- Ensure you can identify assignment in each record:
  - assigned to current user
  - assigned to different user

## Matrix A: Sales Verification Fields (Caseworker Area)

| ID | User Role | Task Assigned To | Task Status | Is this sale useful? | Why not useful? | Expected |
|---|---|---|---|---|---|---|
| SV-01 | Caseworker | Current user | Assigned | Editable | Disabled until useful=No | Editable path works |
| SV-02 | Caseworker | Current user | Assigned QC Failed | Editable | Disabled until useful=No | Editable path works |
| SV-03 | Caseworker | Different user | Assigned | Read-only | Read-only | Cannot change values |
| SV-04 | Caseworker | Different user | Assigned QC Failed | Read-only | Read-only | Cannot change values |
| SV-05 | Caseworker | Current user | Complete | Read-only | Read-only | Cannot change values |
| SV-06 | QA/Manager only (no caseworker access) | Any | Assigned | Read-only | Read-only | Cannot change values |
| SV-07 | Any | Any | Missing taskId or missing taskStatus | Read-only | Read-only | Section disabled by shell |

### Step Validation For SV-01 / SV-02
1. Open Sale Details record.
2. Verify `Is this sale useful?` is enabled.
3. Verify `Why is the sale not useful?` is initially disabled.
4. Set `Is this sale useful?` to `No`.
5. Verify `Why is the sale not useful?` becomes enabled.
6. Change both fields and confirm values remain in control state.

### Step Validation For Read-only Cases (SV-03 to SV-07)
1. Open Sale Details record.
2. Try to open `Is this sale useful?` dropdown.
3. Try to open `Why is the sale not useful?` dropdown.
4. Confirm controls are disabled and cannot be changed.
5. If banner appears, capture `readOnlyReason` text.

## Matrix B: QC Fields (QC Area)

| ID | User Role | QC Assigned To | Task Status | QC outcome | QC remarks | Expected |
|---|---|---|---|---|---|---|
| QC-01 | QA | Current user | Assigned To QC | Editable | Editable | QC section visible and submit allowed |
| QC-02 | QA | Current user | Reassigned To QC | Editable | Editable | QC section visible and submit allowed |
| QC-03 | QA | Different user | Assigned To QC | Hidden or disabled | Hidden or disabled | Cannot edit QC fields |
| QC-04 | Manager | Current user | Assigned To QC | Editable | Editable | Manager can submit QC outcome |
| QC-05 | Manager | Current user | Complete | Visible but submit disabled | Visible but submit disabled | Status not QC-editable |
| QC-06 | Caseworker only | Any | Assigned To QC | Not editable | Not editable | QC submit not allowed |

### Step Validation For QC-01 / QC-02
1. Open Sale Details record in QC context.
2. Verify QC section is visible.
3. Verify `QC outcome` dropdown is enabled.
4. Select `Fail` and verify `QC remarks` becomes mandatory.
5. Attempt submit with empty remarks; verify validation message.
6. Enter remarks and submit; verify success flow.

### Step Validation For QC Negative Cases (QC-03 to QC-06)
1. Open Sale Details record with negative precondition.
2. Verify QC section visibility and control state.
3. Attempt interaction with `QC outcome` and `QC remarks`.
4. Confirm expected lock/hide behavior.

## Mandatory Validation Checks
- If `Is this sale useful?` is empty, validation message should request selection.
- If `Is this sale useful? = No` and `Why not useful?` empty, validation message should request reason.
- If `QC outcome = Fail` and `QC remarks` empty, validation should block submission.

## Evidence To Capture Per Scenario
- Screenshot of control enabled/disabled state.
- Screenshot of validation message (where applicable).
- Task status and assignment values from the same record.
- User identity used for the run.

## Suggested Test Execution Order
1. Run SV-01 and SV-02 first (known good editable cases).
2. Run SV-03 to SV-07 to validate lock conditions.
3. Run QC-01 and QC-02.
4. Run QC-03 to QC-06.

## Pass/Fail Criteria
- Pass: control states and validation exactly match expected behavior per matrix row.
- Fail: any row where user can edit when expected read-only, or cannot edit when expected editable.
