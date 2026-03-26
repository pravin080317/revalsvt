# voa_SvtSubmitSalesVerification Custom API

## Purpose
`voa_SvtSubmitSalesVerification` is an unbound Dataverse Custom API used by the caseworker sales-details flow. It sends a PUT request to APIM for `/sales/{saleId}` and forwards one normalized payload with three sections:

- `salesVerificationTaskDetails`
- `salesParticularDetails`
- `salesVerificationDetails`

This API is only for caseworker submission. QC pass/fail is handled by `voa_SvtSubmitQcRemarks`.

## Request parameters
- `saleId` (required)
- `saleSubmitPayload` (optional JSON string)
- `payload` (optional JSON string legacy alias)
- `saleSubmitRemarks` (optional; overrides `salesVerificationDetails.remarks`)
- `taskId` (optional fallback field)
- `taskStatus` (optional fallback field; allowed values only: `Complete`, `QC Requested`, `Reassigned To QC`)
- `salesSource` (optional fallback field)
- `wlttId` (optional fallback field)
- `lrppdId` (optional fallback field)
- `requestedBy` (optional fallback field; GUID)
- `wltId` (optional fallback field; legacy alias of `wlttId`)
- `lrpddId` (optional fallback field; legacy alias of `lrppdId`)
- `salesParticular`, `linkParticulars`, `kitchenAge`, `kitchenSpecification`, `bathroomAge`, `bathroomSpecification`, `glazing`, `heating`, `decorativeFinishes`, `conditionScore`, `conditionCategory`, `particularNotes` (optional fallback fields)
- `isSaleUseful`, `whyNotUseful`, `additionalNotes`, `remarks` (optional fallback fields)

## Normalized request body
```json
{
  "salesVerificationTaskDetails": {
    "taskId": "1029615",
    "taskStatus": "Complete",
    "requestedBy": "56ec660c-c908-f011-bae3-6045bd0e1fbf",
    "salesSource": "LRPPD",
    "wlttId": null,
    "lrppdId": null
  },
  "salesParticularDetails": {
    "salesParticular": "Details not available",
    "linkParticulars": null,
    "padConfirmation": "Data enhancement job created",
    "particularNotes": null,
    "kitchenAge": null,
    "kitchenSpecification": null,
    "bathroomAge": null,
    "bathroomSpecification": null,
    "glazing": null,
    "heating": null,
    "decorativeFinishes": null,
    "conditionScore": null,
    "conditionCategory": null
  },
  "salesVerificationDetails": {
    "isSaleUseful": "Yes",
    "whyNotUseful": null,
    "additionalNotes": null,
    "remarks": null
  }
}
```

## Contract rules
- `taskStatus` must be one of `Complete`, `QC Requested`, or `Reassigned To QC`.
- `requestedBy` is normalized to canonical lowercase GUID format before forwarding.
- Empty strings from the PCF are normalized to `null` in the real payload for optional text fields.
- `qualityControlOutcome` is not part of this API contract and is ignored if it appears in an incoming payload.
- `Complete Passed QC` is not valid here. That status belongs to the QC outcome API after QC passes the task.

## Caseworker workflow

### Scenario 1: Caseworker submits to QC, QC fails, caseworker resubmits, QC passes

| Step | User action | Current status before action | API called | Payload `taskStatus` | Resulting workflow status |
| --- | --- | --- | --- | --- | --- |
| 1 | Manager assigns task to caseworker | `New` or assignable state | `voa_SvtTaskAssignment` | `Assigned` from assignment flow | `Assigned` |
| 2 | Caseworker fills sales details and clicks Submit to QC | `Assigned` | `voa_SvtSubmitSalesVerification` | `QC Requested` | `QC Requested` |
| 3 | QC reviews and fails | `QC Requested` or QC-assigned state | `voa_SvtSubmitQcRemarks` | QC outcome `Fail` | `Assigned QC Failed` |
| 4 | Caseworker fixes details and clicks Submit to QC again | `Assigned QC Failed` | `voa_SvtSubmitSalesVerification` | `Reassigned To QC` | `Reassigned To QC` |
| 5 | QC reviews and passes | `Reassigned To QC` or QC-assigned state | `voa_SvtSubmitQcRemarks` | QC outcome `Pass` | `Complete Passed QC` |

### Scenario 2: Caseworker completes directly

| Step | User action | Current status before action | API called | Payload `taskStatus` | Resulting workflow status |
| --- | --- | --- | --- | --- | --- |
| 1 | Manager assigns task to caseworker | `New` or assignable state | `voa_SvtTaskAssignment` | `Assigned` from assignment flow | `Assigned` |
| 2 | Caseworker fills sales details and clicks Complete | `Assigned` | `voa_SvtSubmitSalesVerification` | `Complete` | `Complete` |

## Payload matrix for caseworker actions

| Caseworker button | Allowed current status | Payload `taskStatus` | `salesVerificationDetails.remarks` |
| --- | --- | --- | --- |
| Complete | `Assigned` | `Complete` | `null` or omitted from UI, normalized to `null` |
| Submit to QC | `Assigned` | `QC Requested` | Required business comment |
| Submit to QC again after QC fail | `Assigned QC Failed` | `Reassigned To QC` | Required business comment |

## What the stored procedure does
`svt.usp_SubmitSalesVerificationTask` only performs updates when `@TaskStatus` is one of:

- `Complete`
- `QC Requested`
- `Reassigned To QC`

If any other value reaches SQL, the main update block is skipped. That means no task update, no scoring update, no sales-verification-outcome update, and no audit insert for that submission. The plugin now blocks invalid statuses before the APIM call so this does not silently no-op.

## Example payloads

### Complete directly
```json
{
  "salesVerificationTaskDetails": {
    "taskId": "1029615",
    "taskStatus": "Complete",
    "requestedBy": "56ec660c-c908-f011-bae3-6045bd0e1fbf",
    "salesSource": "LRPPD",
    "wlttId": null,
    "lrppdId": null
  },
  "salesParticularDetails": {
    "bathroomAge": null,
    "bathroomSpecification": null,
    "conditionCategory": null,
    "conditionScore": null,
    "decorativeFinishes": null,
    "glazing": null,
    "heating": null,
    "kitchenAge": null,
    "kitchenSpecification": null,
    "linkParticulars": null,
    "padConfirmation": "Data enhancement job created",
    "particularNotes": null,
    "salesParticular": "Details not available"
  },
  "salesVerificationDetails": {
    "additionalNotes": null,
    "isSaleUseful": "Yes",
    "whyNotUseful": null,
    "remarks": null
  }
}
```

### First submit to QC
```json
{
  "salesVerificationTaskDetails": {
    "taskId": "1029615",
    "taskStatus": "QC Requested",
    "requestedBy": "56ec660c-c908-f011-bae3-6045bd0e1fbf",
    "salesSource": "LRPPD",
    "wlttId": null,
    "lrppdId": null
  },
  "salesParticularDetails": {
    "bathroomAge": null,
    "bathroomSpecification": null,
    "conditionCategory": null,
    "conditionScore": null,
    "decorativeFinishes": null,
    "glazing": null,
    "heating": null,
    "kitchenAge": null,
    "kitchenSpecification": null,
    "linkParticulars": null,
    "padConfirmation": "Data enhancement job created",
    "particularNotes": null,
    "salesParticular": "Details not available"
  },
  "salesVerificationDetails": {
    "additionalNotes": null,
    "isSaleUseful": "Yes",
    "whyNotUseful": null,
    "remarks": "Please review"
  }
}
```

### Resubmit after QC fail
```json
{
  "salesVerificationTaskDetails": {
    "taskId": "1029615",
    "taskStatus": "Reassigned To QC",
    "requestedBy": "56ec660c-c908-f011-bae3-6045bd0e1fbf",
    "salesSource": "LRPPD",
    "wlttId": null,
    "lrppdId": null
  },
  "salesParticularDetails": {
    "bathroomAge": null,
    "bathroomSpecification": null,
    "conditionCategory": null,
    "conditionScore": null,
    "decorativeFinishes": null,
    "glazing": null,
    "heating": null,
    "kitchenAge": null,
    "kitchenSpecification": null,
    "linkParticulars": null,
    "padConfirmation": "Data enhancement job created",
    "particularNotes": null,
    "salesParticular": "Details not available"
  },
  "salesVerificationDetails": {
    "additionalNotes": "updated after QC feedback",
    "isSaleUseful": "Yes",
    "whyNotUseful": null,
    "remarks": "Updated after QC fail"
  }
}
```

## Related docs
- `docs/svtpcfplugin/svtTaskAssignment.md`
- `docs/svtpcfplugin/svtModifySvtTask.md`
- `docs/svtpcfplugin/svtManualTaskCreation.md`
- `docs/svtpcfplugin/svtGetViewSaleRecordById.md`