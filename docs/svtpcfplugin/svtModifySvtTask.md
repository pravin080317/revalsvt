# voa_SvtModifyTask Custom API (Modify SVT Task)

## Purpose
`voa_SvtModifyTask` is an unbound Dataverse Action used to reopen a previously completed task back to `Assigned` through APIM.

This operation corresponds to the SQL stored procedure `svt.usp_ModifySvtTask`.

## Contract
- Custom API name: `voa_SvtModifyTask`
- Type: Action (not Function)
- Dataverse endpoint:
    - `POST /api/data/v9.2/voa_SvtModifyTask`

Request parameters:
- `source` (string, optional; defaults to `VSRT`)
- `taskStatus` (string, required)
- `taskList` (string, required; JSON array string, comma-separated, or single value)
- `requestedBy` (string, optional; GUID)

Response parameters:
- `Result` (string)

## Status rules (aligned to usp_ModifySvtTask)
Allowed values for `taskStatus`:
- `Complete`
- `Complete Passed QC`

Any other `taskStatus` is invalid for modify/reopen.

Business result:
- Task status is updated to `Assigned`
- Assignment fields are reset to current requester
- Completion and QC timestamps are cleared

## Runtime request example (PCF)
Dataverse call:
```json
{
    "source": "VSRT",
    "taskStatus": "Complete",
    "taskList": "[\"1000021\"]",
    "requestedBy": "05b749d9-f8cb-47ea-8487-5e891176e36d"
}
```

## Plugin outbound APIM payload
`VOA.SVT.Plugins/Plugins/CustomAPI/SvtModifyTask.cs` posts:
```json
{
    "source": "VSRT",
    "taskStatus": "Complete",
    "taskList": ["1000021"],
    "requestedBy": "05b749d9-f8cb-47ea-8487-5e891176e36d"
}
```

## Known payload examples
Use these as QA reference payloads for `/v1/sales/{saleId}/task` modify flows.

Example A: reopen `Complete` task
```json
{
    "source": "VSRT",
    "taskStatus": "Complete",
    "taskList": ["1000021"],
    "requestedBy": "05b749d9-f8cb-47ea-8487-5e891176e36d"
}
```

Example B: reopen `Complete Passed QC` task
```json
{
    "source": "VSRT",
    "taskStatus": "Complete Passed QC",
    "taskList": ["1000021"],
    "requestedBy": "05b749d9-f8cb-47ea-8487-5e891176e36d"
}
```

Notes:
- `taskList` is normalized into an array of task IDs.
- `requestedBy` is normalized to canonical GUID format (`8-4-4-4-12`, lowercase).
- If `requestedBy` is missing, plugin falls back to the resolved user context and normalizes it.

## Access control
Modify task is restricted to caseworker access (resolved by plugin user-context checks).

## SQL mapping (usp_ModifySvtTask)
Procedure inputs:
- `@TaskId`
- `@TaskStatus`
- `@RequestedBy`

Procedure validations:
- `@TaskStatus` must be `Complete` or `Complete Passed QC`
- `@TaskId` and `@RequestedBy` are required

Procedure update behavior:
- `status = 'Assigned'`
- `assigned_to = @RequestedBy`
- `assigned_at = SYSUTCDATETIME()`
- clears `completed_at`, `qc_assigned_to`, `qc_assigned_at`, `qc_completed_at`

## Reference files
- `DetailsListVOA/services/DetailsListRuntimeController.ts`
- `VOA.SVT.Plugins/Plugins/CustomAPI/SvtModifyTask.cs`
- `docs/svtpcfplugin/svtTaskAssignment.md`
