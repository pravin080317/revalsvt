# voa_GetViewSaleRecordById Custom API

## Purpose
`voa_GetViewSaleRecordById` retrieves sale details for a single sale ID.
The PCF uses it when a user opens a sale from the grid and then exposes the returned payload through the `saleDetails` output property.

## Custom API contract

- Unique name: `voa_GetViewSaleRecordById`
- Is Function: `Yes`

### Request parameters

| Parameter | Type | Notes |
| --- | --- | --- |
| `saleId` | String | Required. User-facing sale identifier such as `S-1000001`. |

### Response parameters

| Parameter | Type | Notes |
| --- | --- | --- |
| `Result` | String | JSON string containing the sale details payload returned by the plugin/APIM layer. |

## Dataverse request shape

```text
GET <DATAVERSE_BASE_URL>/api/data/v9.2/voa_GetViewSaleRecordById(saleId='S-1000001')
```

## APIM behavior

The plugin reads the configured base address and resolves the final URL for the selected sale.
The effective call is a `GET` for the chosen sale record, typically `/sales/{saleId}` or the equivalent configured template.

## PCF output

The PCF writes the parsed payload into the `saleDetails` output property as a JSON string.

`saleDetails` is:

- the parsed `Result` payload when the request succeeds
- an empty fallback sale-details object when `saleId` is missing or the request fails

## Response payload guidance

The returned JSON can include nested sections such as:

- task details
- master sale details
- hereditament and banding details
- sales particulars
- Welsh Land Transaction Tax data
- repeat-sale information

Consumers should treat the payload as a structured JSON object and guard for missing sections.

## Canvas app usage

```powerfx
Set(parsedSale, ParseJSON(DetailsListVOA.saleDetails));
```

Example reads:

```powerfx
Text(parsedSale.taskDetails.saleId)
Text(parsedSale.bandingInfo.address)
Value(parsedSale.masterSale.salePrice)
```

## Related docs

- `docs/svtGetSaleRecords.md`
- `docs/svtTaskAssignment.md`
- `docs/svtManualTaskCreation.md`

