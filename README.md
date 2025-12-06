# DetailsListVOA Control

This project contains a Power Apps Component Framework (PCF) control that renders a grid of records.

## Quick Start

- Build and run locally: `npm start`
- Add the control to a form/app and configure properties:
  - `revalSalesDataset`: Bind to your dataset.
  - `tableKey` (optional): Select a table profile for the current screen (defaults to `sales`). Supported keys out of the box: `sales`/`allsales`, `myassignment`, `manager`, `qa`.
  - `customApiName` (optional): Name of your unbound Dataverse Custom API to execute. If set, the control calls this API with the built query parameters. If not set, it falls back to `apimEndpoint`.
  - `apimEndpoint` (optional): Fully qualified URL to call when `customApiName` is not provided.
  - `pageSize` (optional): Grid page size (default 10).
  - `columnDisplayNames` (optional): JSON mapping of dataset field → display label.
  - `columnConfig` (optional): JSON array configuring column behavior (width, sorting, cell type, etc.).

## Column Display Name Overrides

Dataset column display names are read-only in the property pane. To override them, use the **Column Display Names** property and provide a JSON object that maps dataset column names to display labels.

Example:

```json
{"JobID":"Job Ref","UARN":"Unique Ref","Address":"Full Address"}
```

The control parses this mapping and applies the custom names to the corresponding columns at runtime. Invalid JSON is ignored and the dataset's default display names are used instead.

## Column Configuration

Additional column behavior can be specified with the **Column Configuration** property. Provide a JSON array describing each column and its settings such as width, cell type, or sorting.

Example:

```json
[
  {
    "ColName": "JobID",
    "ColDisplayName": "Job Reference",
    "ColWidth": 120,
    "ColSortable": true,
    "ColCellType": "text",
    "ColIsBold": true
  }
]
```

Each entry is matched to the dataset column by `ColName`, and supported properties are applied when rendering the grid.

## Screen Profiles (tableKey)

Use the `tableKey` property to select a profile for each screen without changing code. Profiles specify:

- Which columns behave as lookups (show a dropdown of distinct values in the column menu).
- How to map the current search filters into API query parameters.

Out of the box profiles exist for: `sales`/`allsales`, `myassignment`, `manager`, `qa`.

Implementation details live in `DetailsListVOA/TableConfigs.ts`:

- `TABLE_CONFIGS`: central registry of profiles.
- `lookupFields`: set of normalized field names treated as lookup/choice.
- `buildApiParams`: translates current filter state to query params.

To add or customize a profile:

1) Add a new key in `TABLE_CONFIGS` and provide `lookupFields` + `buildApiParams`.
2) Set `tableKey` to that key on the screen using the control.

## Data Loading

The control supports two data-calling modes:

1) Dataverse Custom API (recommended)
   - Set `customApiName` to the name of your unbound Custom API.
   - The control calls `context.webAPI.execute` and passes all built parameters as strings.
   - Your Custom API can call APIM or any backend service and return a payload shaped like `TaskSearchResponse`.

2) Direct HTTP endpoint
   - If `customApiName` is not set, the control builds a URL using `apimEndpoint` and appends the same parameters.

## Filtering and Sorting

- Column header menu supports:
  - Sort Ascending/Descending (with icons).
  - Filter by value:
    - Lookup/choice columns show a dropdown of distinct values.
    - Other columns show a text field.
- Filtering uses case-insensitive "contains" matching.
- Active column filters display a Filter icon in the column header.

## Search Panel

The top panel contains quick filters (e.g., UPRN, Task ID, Address, Postcode, Task Status, Source). You can add more by extending `GridFilterState` and rendering the appropriate input, often using `getDistinctOptions([...])` for lookup fields.

## Extending to Additional Screens

- Create or adjust a profile in `TableConfigs.ts` for each screen.
- Set `tableKey` on each screen instance to select the profile.
- If different screens need different API parameter names, implement a dedicated `buildApiParams` for each profile.

## Notes

- Column and filter matching is case-insensitive and uses "contains" semantics.
- If a dataset column is missing but appears in the Custom API payload, the control will add it at runtime with a generated display name.
- The control shows shimmer and overlay on sort or while loading.

## Deployment

There are two common ways to get this PCF control into a Dataverse environment: a quick developer push for rapid iteration, and packaging it in a solution for ALM/promotions.

### Prerequisites

- Node.js LTS and npm installed.
- Power Platform CLI (`pac`) installed and authenticated to your environment.
- Appropriate permissions in the target Dataverse environment.

If your production API domain is not `api.contoso.gov.uk`, update `DetailsListVOA/ControlManifest.Input.xml` `<external-service-usage>` `<domain>` to your real domain and rebuild, as external service usage makes the control premium.

### Quick Dev Push (for rapid testing)

1. Install dependencies and build:
   - `npm ci`
   - `npm run build`
2. Authenticate to your environment (one-time):
   - `pac auth create --url https://<your-org>.crm.dynamics.com`
3. Push the control to the environment:
   - `pac pcf push --publisher-prefix <prefix>`

This creates or updates an unmanaged, temporary solution in the environment for quick iteration. After pushing, add the control to a form/app in the maker UI.

### Package as a Solution (for ALM)

1. Create a solution workspace (once):
   - `mkdir solution && cd solution`
   - `pac solution init --publisher-name "Contoso" --publisher-prefix cts`
2. Add the PCF project reference (from repo root use the correct relative path):
   - `pac solution add-reference --path ..\DetailsListVOA`
3. Build the control and pack the solution zip:
   - In repo root: `npm ci && npm run build`
   - In `solution/`: `pac solution pack --zipFile ..\bin\DetailsListVOA_unmanaged.zip --packageType Unmanaged`
   - Optionally also create managed: `pac solution pack --zipFile ..\bin\DetailsListVOA_managed.zip --packageType Managed`
4. Import into your target environment:
   - `pac auth create --url https://<your-org>.crm.dynamics.com`
   - `pac solution import --path ..\bin\DetailsListVOA_unmanaged.zip`

After import, the control appears in maker under code components and can be added to forms/canvas apps.

### Configure In App

Set the following properties in the app/form where the control is used:

- `customApiName` (optional): Name of an unbound Dataverse Custom API to execute. If set, the control uses `context.webAPI.execute` and passes built query parameters.
- `apimEndpoint` (optional): Fully qualified HTTP URL used when `customApiName` is not provided.
- `apiBaseUrl` (optional): Base URL used for sale details fetch on row invoke.
- `tableKey` (optional): Profile key selecting column/parameter behavior (defaults to `sales`).
- `pageSize`, `columnDisplayNames`, `columnConfig`, `columnConfigProfile`, `allowColumnReorder`, `perfLogsEnabled`: Tuning options; see sections above.

### Useful Scripts

- `npm start` — run the PCF test harness locally.
- `npm run build` — build production bundle under `out/controls`.
- `npm run clean` / `npm run rebuild` — clean or full rebuild.

### Troubleshooting

- If the control is not visible after `pac pcf push`, clear app designer cache or open a new session.
- If calls to your API fail, verify CORS and that the manifest `<external-service-usage>` domain matches the actual host.
- If using `customApiName`, ensure the Custom API exists, user has privileges, and it returns the expected payload shape.
