# To Do: Entra ID Enforcement and Audit Name Resolution

## Scenario
Some records in Audit History and QC Audit History show `Unknown User` or raw GUID values for `Changed By`, `AssignedTo`, `QCAssignedTo`, and `qcReviewedBy`.

## Root Cause Summary
- User IDs can appear in two formats in payloads:
  - Entra Object ID (`azureactivedirectoryobjectid`)
  - Dataverse `systemuserid`
- Runtime action payloads should send Entra ID only, but fallback paths can introduce non-Entra IDs when Entra ID is missing.
- Plugin enrichment must prefer Entra ID and only use `systemuserid` as fallback for unresolved IDs.

## Decision
- Enforce Entra-only identity for action requests:
  - Create Task
  - Modify Task
  - Submit Sales Verification
  - Request for QC
  - Submit QC Outcome
- If Entra ID is missing, block action with a clear error message.
- Keep plugin read/enrichment behavior as:
  - Primary lookup: `azureactivedirectoryobjectid`
  - Fallback lookup: `systemuserid` (only unresolved IDs)

## Expected Outcome
- No action request sends `systemuserid` as actor identity.
- Audit and QC audit screens resolve names consistently.
- `Unknown User` appears only when neither Entra ID nor system user mapping exists.

## Acceptance Criteria
1. Runtime blocks write actions when Entra ID is unavailable.
2. Action payload actor fields always contain Entra ID.
3. `SvtGetAuditLogs` resolves names using Entra-first and fallback-by-system-user.
4. `GetViewSaleRecordById` enriches `assignedToName`, `qcAssignedToName`, `requestedByName`, and `qcReviewedByName` with same lookup strategy.
5. Regression check on known tasks (for example `A-1000032`, `M-1029609`) shows no raw GUIDs in audit display where user exists.

## Notes
- If user is missing in Dataverse `systemuser`, unresolved IDs are expected and should be logged for support follow-up.

## Additional To Do: Configurable Naming Constants
- Move hardcoded naming constants (labels/status text/display mappings) from code to a Dataverse configuration table.
- Manage these values via a model-driven app so business/admin users can update configurable data without code deployment.
- Define a typed config contract in PCF/runtime with cache + fallback behavior for missing config values.

### Acceptance Criteria (Config)
1. Naming/display constants are read from Dataverse config table at runtime.
2. Model-driven app screen allows authorized users to add/update/deactivate config rows.
3. PCF uses safe defaults only when config is missing or invalid, with trace logging.
4. Changing configured names does not require code change or redeployment.

## Additional To Do: Performance Test Session Scenario
- Implement the session/storage improvements discussed during performance testing, especially for high-concurrency usage.
- Address `sessionStorage` growth for `voa-session-screens` by adding bounded retention/cleanup.
- Reduce synchronous `localStorage` write pressure (duplicate writes and write frequency) in grid/filter persistence logic.
- Add runtime telemetry counters for storage write volume and payload size in perf mode.

### Acceptance Criteria (Performance Session)
1. `voa-session-screens` does not grow unbounded during long sessions.
2. Storage persistence avoids duplicate write patterns where backward-compat keys are no longer required.
3. Under load-test profile, filter/sort interactions do not produce visible UI jank from storage writes.
4. Perf test report includes before/after metrics for storage write count, serialization time, and screen-load latency.

## Additional To Do: SVT User Reference JSON + Dataverse ID Resolution
- Prepare an SVT user reference list of 20 users in JSON format with:
  - `name`
  - `systemUserId`
  - `azureObjectId`
- Use this JSON only as a reference/seed lookup for display and diagnostics.
- For all insert/update operations, resolve and validate user IDs from Dataverse at runtime (Dataverse remains source of truth).
- Add a sync/refresh process to regenerate the JSON from Dataverse user data and detect stale entries.

### Acceptance Criteria (SVT User Reference)
1. A versioned JSON file exists for 20 SVT users with `name`, `systemUserId`, and `azureObjectId`.
2. Runtime write paths do not trust JSON IDs directly for persistence and use Dataverse-resolved IDs.
3. Insert/update APIs reject or log mismatches where reference JSON and Dataverse data diverge.
4. Operational doc defines how/when to refresh the reference JSON.

## Additional To Do: Staleness Checks and Logging for User Reference JSON
- Add metadata in JSON: `generatedAt`, `version`, `sourceEnvironment`, `generatedBy`.
- Add staleness policy (for example max age in days) and environment guard.
- Validate sampled/reference users against Dataverse and detect ID drift.
- Add structured logs/telemetry events so stale JSON never silently drives behavior.

### Acceptance Criteria (Staleness)
1. Runtime can detect stale JSON by age/version/environment.
2. Mismatch events are logged with clear reason codes (for example `SVT_USER_JSON_STALE`, `SVT_USER_JSON_ID_MISMATCH`).
3. On stale/mismatch, write flows use Dataverse lookup as source of truth.
4. User-facing error/warning is shown only when Dataverse fallback also fails.

## Utility Placement Recommendation (PCF vs Plugin)
- Preferred split:
  - **Plugin utility (authoritative):** ID validation, Dataverse lookup, stale/mismatch enforcement for insert/update operations.
  - **PCF utility (supporting):** pre-check warnings, lightweight cache freshness checks, and telemetry for UX/perf visibility.
- Rationale:
  - Plugin is server-side and cannot be bypassed by client behavior.
  - PCF checks improve user feedback but should not be the final gate for data integrity.
