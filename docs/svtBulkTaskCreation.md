# voa_SvtBulkTaskCreation Requirement (Bulk Task Creation)

## Purpose
`voa_SvtBulkTaskCreation` is a proposed **unbound** Dataverse Custom API used to create tasks for multiple Sale IDs in one user action. The recommended design is to keep the existing single-sale API unchanged and add a new bulk API that loops the same APIM task-creation endpoint for each selected sale.

This requirement supports the manager flow of selecting multiple sales from the grid and creating tasks in bulk from the current result set, including scenarios where users pre-filter the grid by summary flags.

---

## Recommended approach
Use **Option B**:

- Keep `voa_SvtManualTaskCreation` and `SvtManualTaskCreation.cs` unchanged for single-sale creation.
- Add a new plugin class `SvtBulkTaskCreation.cs` and expose it through a new unbound Custom API `voa_SvtBulkTaskCreation`.
- Reuse the same APIM endpoint pattern already used by manual task creation:
  - `POST /sales/{saleId}/task`
- Process one sale at a time inside the plugin and aggregate the per-sale results into a single response.

Reason:

- Lowest backend risk.
- Reuses the existing APIM contract and authentication flow.
- Avoids changing a stable single-sale API that may already be consumed elsewhere.
- Supports partial success reporting when some sale IDs fail and others succeed.

---

## Custom API contract
Recommended setup:

- Unique name: `voa_SvtBulkTaskCreation`
- Is Function: **No** (Action)
- Request parameters:
  - `saleIds` (String, required)
    - JSON array string of sale IDs.
    - Example: `["S-1000001","S-1000002","S-1000003"]`
  - `sourceType` (String, optional, defaults to `"M"`)
  - `createdBy` (String, optional)
    - Defaults to the initiating user's Entra object ID resolved from user context, matching the existing manual creation flow.
- Response parameters:
  - `Result` (String)

Recommended guardrails:

- Reject empty `saleIds`.
- Reject malformed JSON.
- Reject batches larger than 100 sale IDs per call.
- Reject non-manager users using the same persona enforcement as manual task creation.

---

## Response format
`Result` should remain a JSON string so the PCF client can keep a consistent Custom API parsing pattern.

Recommended shape:

```json
{
  "success": true,
  "message": "Bulk task creation completed.",
  "successCount": 2,
  "failureCount": 1,
  "successes": [
    {
      "saleId": "S-1000001",
      "payload": "<raw APIM body>"
    },
    {
      "saleId": "S-1000002",
      "payload": "<raw APIM body>"
    }
  ],
  "failures": [
    {
      "saleId": "S-1000003",
      "reason": "APIM returned 400 Bad Request"
    }
  ]
}
```

Notes:

- `success` should be `true` when at least one task is created successfully.
- `success` should be `false` only when the entire operation fails or no sale IDs succeed.
- `message` should summarise the outcome in a user-readable way.
- Preserve per-sale detail so the UI can surface partial failures.

---

## Backend plugin requirement
Implement in a new class:

- `VOA.SVT.Plugins/Plugins/CustomAPI/SvtBulkTaskCreation.cs`

Expected behaviour:

1. Resolve user context with the same mechanism used by `SvtManualTaskCreation.cs`.
2. Enforce **manager-only** access.
3. Parse `saleIds` from the incoming JSON array string.
4. Resolve configuration from `voa_CredentialProvider` using a dedicated configuration entry, for example `SVTBulkTaskCreation`, or reuse the same base address pattern as `SVTManualTaskCreation` if the config strategy stays shared.
5. Acquire auth once for the request.
6. For each sale ID:
   - Build the same APIM URL used today for single-sale creation.
   - `POST` the JSON body:
     ```json
     { "sourceType": "M", "createdBy": "<entra-object-id>" }
     ```
   - Capture success or failure without aborting the whole batch.
7. Return a single aggregated `Result` JSON string.

Implementation note:

- The bulk plugin should **reuse** the existing request-building and response-wrapping logic where practical, but it should stay as a separate class rather than overloading the single-sale plugin.

---

## PCF requirement
The grid needs a dedicated bulk-create action that sends the selected sale IDs to the new Custom API.

Required UI/PCF changes:

- Add a new command-bar action for managers when one or more rows are selected.
- Read selected sale IDs from existing grid selection state.
- Call `voa_SvtBulkTaskCreation` with:
  - `saleIds` as JSON array string
  - `sourceType: "M"`
  - `createdBy` if the client continues to pass it explicitly
- Show a consolidated success/error notification using the aggregated response.
- Refresh the grid after successful or partially successful completion.

Recommended implementation areas:

- `DetailsListVOA/components/DetailsListHost/DetailsListRuntimeController.ts`
- `DetailsListVOA/components/DetailsListHost/actions.ts`
- `DetailsListVOA/Grid.tsx`

If the PCF manifest is extended for the new endpoint, add new input properties such as:

- `bulkTaskCreationApiName`
- `bulkTaskCreationApiType`

These should mirror the existing `manualTaskCreationApiName` and `manualTaskCreationApiType` pattern.

---

## Summary flag filter requirement
Bulk task creation is expected to work well with summary-flag-driven selection. To make that usable, the summary flag column filter should be improved.

### Requirement
When the metadata/API response includes distinct summary flag values, and the option count is less than 500, the filter popup should show a `ComboBox` with free-form input enabled.

When there are no returned options, or the count is 500 or more, the UI should fall back to the existing text input.

### Why

- Users should not have to type full summary flag text when the values are already known.
- The UI must still allow free-text input so the filter does not become restrictive.
- Large option sets should not degrade usability.

### Behaviour

- Source of options: metadata `filters.summaryflags` or `filters.summaryflag`.
- Threshold: `< 500` distinct values.
- Control type when below threshold: `ComboBox` with free-form input.
- Control type when threshold not met: plain `TextField`.
- Filtering behaviour remains single-value text matching, not multi-select.

### Important finding
The existing code already retrieves summary flag options from metadata and stores them in client state:

- Metadata response populates `res.filters`.
- `DetailsListHost.tsx` normalises that into `apiFilterOptions`.
- `summaryFlagOptions` is already derived from `apiFilterOptions.summaryflags` or `apiFilterOptions.summaryflag`.

This means no new metadata endpoint is required if those values are already present in the current response.

---

## Non-requirements
The following are **not** required for this scope:

- No change to `voa_SvtManualTaskCreation`.
- No multi-select summary flag filter.
- No mandatory restriction to predefined summary flag values.
- No backend bulk APIM endpoint, if looping the existing single-sale endpoint is acceptable.

---

## Open points to confirm

- Does the metadata payload consistently return `summaryflags` or `summaryflag` values for every relevant screen?
- Should `createdBy` continue to use Entra object ID, or should the API standardise on Dataverse user ID for this bulk flow?
- What is the exact user-facing success message required for partial success batches?
- Is 100 the agreed maximum batch size, or should a different cap be enforced?

---

## Related docs

- `docs/svtpcfplugin/svtManualTaskCreation.md`
- `docs/svtpcfplugin/task-creation-api-urls.md`
- `docs/svtpcfplugin/SvtGetSalesMetadata.README.md`
- `docs/svt-sales-record-search-technical-doc.md`