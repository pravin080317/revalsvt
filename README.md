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
