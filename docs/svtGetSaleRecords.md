# voa_GetAllSalesRecord Custom API

## Purpose
`voa_GetAllSalesRecord` is the grid data API used by the SVT PCF to load rows for all supported screens.
It accepts paging, sorting, top-of-grid filters, optional prefilters, and column header filters, then returns a JSON payload in the `Result` output parameter.

## Custom API contract

- Unique name: `voa_GetAllSalesRecord`
- Is Function: `Yes`

### Request parameters
All request parameters are sent as strings.

| Parameter group | Parameters | Notes |
| --- | --- | --- |
| Paging | `pageNumber`, `pageSize` | 1-based paging. |
| Sorting | `sortField`, `sortDirection` | `asc` or `desc`. |
| Screen routing | `source` | One of `MA`, `CWV`, `QCA`, `QCV`, `SRS`. |
| Prefilters | `searchBy`, `preFilter`, `RequestedBy`, `taskStatus`, `fromDate`, `toDate` | Screen-dependent. |
| Search filters | `saleId`, `taskId`, `uprn`, `address`, `postcode`, `billingAuthority`, `billingAuthorityReference`, `transactionDate`, `salesPrice`, `salesPriceOperator`, `ratio`, `dwellingType`, `flaggedForReview`, `reviewFlag`, `outlierKeySale`, `outlierRatio`, `overallFlag`, `summaryFlag`, `assignedTo`, `assignedFromDate`, `assignedToDate`, `qcAssignedTo`, `qcAssignedFromDate`, `qcAssignedToDate`, `qcCompleteFromDate`, `qcCompleteToDate` | Used by grid search flows. |
| Header filters | `SearchQuery` | Repeated `columnFilter=...` tokens joined by `&`. |

### Response parameters

| Parameter | Type | Notes |
| --- | --- | --- |
| `Result` | String | JSON string containing the APIM/grid response payload. |

## Dataverse request shape

```text
GET <DATAVERSE_BASE_URL>/api/data/v9.2/voa_GetAllSalesRecord(
  pageNumber='1',
  pageSize='50',
  source='SRS',
  sortField='saleId',
  sortDirection='asc',
  SearchQuery='columnFilter=saleId~like~S-1000001'
)
```

## APIM behavior

The plugin translates the Dataverse request into an APIM query string.

- `pageNumber` -> `page-number`
- `pageSize` -> `page-size`
- `sortField` -> `sort-field`
- `sortDirection` -> `sort-direction`
- `SearchQuery` -> repeated `columnFilter` query parameters

For full screen-level examples, use `docs/prefilter-api-urls.md`.
For column header filter and sort token examples, use `docs/column-filter-and-sorting-urls.md`.

## Response payload

The `Result` string normally contains one of these shapes:

### Sales API response

```json
{
  "pageInfo": {
    "pageNumber": 1,
    "pageSize": 50,
    "totalRecords": 123
  },
  "sales": [],
  "filters": {}
}
```

### Normalized task-search response

```json
{
  "items": [],
  "totalCount": 123,
  "page": 1,
  "pageSize": 50,
  "filters": {}
}
```

## Response mapping rules

- `sales` rows are normalized into the PCF task-search item model.
- `pageInfo.totalRecords` maps to `totalCount`.
- `filters` can be returned to seed or resync column header filter state.
- Filter keys should align to column logical names, preferably lowercased.

For filter resync to work reliably:

- multi-select values should be arrays or JSON-string arrays
- numeric/date range values should be objects or JSON-string objects
- text filter values can be plain strings

## Canvas app usage

```powerfx
Set(
    varSalesRaw,
    voa_GetAllSalesRecord(
        {
            pageNumber: "1",
            pageSize: "25",
            source: "SRS",
            sortField: "saleId",
            sortDirection: "asc"
        }
    )
);

Set(varSalesParsed, ParseJSON(varSalesRaw.Result));
```

## Related docs

- `docs/prefilter-api-urls.md`
- `docs/column-filter-and-sorting-urls.md`
- `docs/svtGetViewSaleRecordById.md`
**Option A: TaskSearchResponse (already normalized)**
```
{
  items: TaskSearchItem[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
  filters?: Record<string, string | string[]>;
}
```

**Option B: SalesApiResponse (normalized by the client)**
```
{
  pageInfo?: {
    pageNumber?: number;
    pageSize?: number;
    totalRecords?: number;
  };
  sales?: SalesApiItem[];
  filters?: Record<string, string | string[]>;
}
```

If `sales` or `pageInfo` exist, the control maps them into `TaskSearchResponse` before returning to the grid.【F:DetailsListVOA/services/DataService.ts†L146-L164】

### When the API returns a JSON string payload
The Dataverse Custom API plugin returns the APIM response in the `Result` output parameter (as a JSON string). The PCF control detects `Result`/`result`, parses the JSON, and then applies the mapping rules above.【F:DetailsListVOA/services/DataService.ts†L168-L186】【F:VOA.SVT.Plugins/Plugins/CustomAPI/GetAllSalesRecord.cs†L116-L118】

### Item field mapping
When the API returns `sales`, each item is mapped into the internal `TaskSearchItem`. The mapping is one-to-one (e.g., `saleId` → `saleId`, `taskStatus` → `taskStatus`, etc.).【F:DetailsListVOA/services/DataService.ts†L94-L144】

### Page info mapping
`pageInfo.totalRecords`, `pageInfo.pageNumber`, and `pageInfo.pageSize` are mapped to `totalCount`, `page`, and `pageSize` for the grid.【F:DetailsListVOA/services/DataService.ts†L146-L162】

---

## How response filters map to column header filters
The API can return a `filters` object that directly seeds or syncs the grid’s column header filters. The grid host:
1. Lowercases each filter key.
2. Accepts arrays, strings (including JSON-encoded arrays/objects), or object values.
3. Converts those values into the grid’s column filter state used by header filter controls.

This normalization happens in `normalizeApiFilters` inside the grid host component.【F:DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx†L52-L112】

### Practical guidance for API responses
- Prefer **lowercased** field names (e.g., `saleid`, `saleprice`, `taskstatus`) to match column keys.
- For multi-select columns, return arrays or JSON strings of arrays.
- For numeric/date range filters, return a JSON object (example: `{ "mode": ">=", "min": 100000 }`) so the UI can parse it into header filter state.

These response filters are applied to the grid and stay synchronized as users refine column header filters.【F:DetailsListVOA/components/DetailsListHost/DetailsListHost.tsx†L52-L169】

---

## Using `voa_GetAllSalesRecord` in a Canvas app
Canvas apps can call the Custom API directly and parse the `Result` string returned by the plugin.

### Example Power Fx flow
1. **Call the API** (adjust parameters to suit your filters):
   ```
   Set(
     salesResponse,
    voa_GetAllSalesRecord({
       pageNumber: "1",
       pageSize: "25",
       sortField: "saleId",
       sortDirection: "asc"
     })
   )
   ```
2. **Parse the JSON string** from `Result`:
   ```
   Set(parsedSales, ParseJSON(salesResponse.Result))
   ```
3. **Bind to a gallery or data table**:
   ```
   ClearCollect(
     SalesItems,
     ForAll(parsedSales.sales, {
       SaleId: Text(ThisRecord.saleId),
       Address: Text(ThisRecord.address),
       Postcode: Text(ThisRecord.postcode),
       SalesPrice: Value(ThisRecord.salesPrice)
     })
   )
   ```

### Notes
- `Result` is a string because the plugin forwards the raw APIM response back to Dataverse. If you update the plugin to return structured output parameters later, you can skip `ParseJSON`.【F:VOA.SVT.Plugins/Plugins/CustomAPI/GetAllSalesRecord.cs†L116-L118】
- The response schema matches the `SalesApiResponse` format (with `sales` and `pageInfo`) described above, so you can read `parsedSales.pageInfo.totalRecords` for pagination if needed.【F:DetailsListVOA/services/DataService.ts†L146-L164】

---

## Using PCF output (`saleDetails`) in a Canvas app
When a user clicks a task link, the PCF writes the response from `voa_GetViewSaleRecordById` into the output property `saleDetails` (JSON string). Parse it with `ParseJSON` and read values by type.

### Parse once
```
Set(
  parsedSale,
  ParseJSON(DetailsListVOA.saleDetails)
);
```

### Read string values
```
Text(parsedSale.taskDetails.saleId)
Text(parsedSale.bandingInfo.address)
Text(parsedSale.salesParticularInfo.salesParticular)
```

### Read numbers and booleans
```
Value(parsedSale.masterSale.salePrice)
Value(parsedSale.plotSize)
If(Boolean(parsedSale.propertyAttributes.composite), "Yes", "No")
```

### Read arrays (table output)
```
ClearCollect(
  wlttItems,
  ForAll(parsedSale.welshLandTax, {
    WlttId: Text(ThisRecord.wlttId),
    TransactionPrice: Value(ThisRecord.transactionPrice),
    Vendors: Text(ThisRecord.vendors)
  })
);
```

### Read nested objects
```
Text(parsedSale.propertyAttributes.dwellingType)
Text(parsedSale.repeatSaleInfo.previousRatioRange)
```

### Empty response handling
The PCF can emit an empty JSON object with all sections present. Guard with `IsBlank` before reading:
```
If(
  IsBlank(parsedSale.taskDetails.saleId),
  "No sale details",
  Text(parsedSale.taskDetails.saleId)
)
```

---

## Related Custom API docs
- `docs/svtGetViewSaleRecordById.md` (sale details by Sale ID).
- `docs/svtTaskAssignment.md` (task assignment endpoint).
- `docs/svtManualTaskCreation.md` (manual task creation endpoint).
