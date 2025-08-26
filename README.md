# DetailsListVOA Control

This project contains a Power Apps Component Framework (PCF) control that renders a grid of records.

## Column Display Name Overrides

Dataset column display names are read-only in the property pane. To override them, use the **Column Display Names** property and provide a JSON object that maps dataset column names to display labels.

Example:

```json
{"JobID":"Job Ref","UARN":"Unique Ref","Address":"Full Address"}
```

The control parses this mapping and applies the custom names to the corresponding columns at runtime. Invalid JSON is ignored and the dataset's default display names are used instead.

## Column Metadata

The grid's columns are defined by a JSON array. Each object in the array describes a column using the following schema:

```json
[
  {
    "ColName": "status",
    "ColDisplayName": "Status",
    "ColWidth": 120,
    "ColCellType": "tag",
    "ColTagColorColumn": "statusColor",
    "ColTagBorderColorColumn": "statusBorder"
  }
]
```

**Required properties**

- `ColName`: logical name for the column. This becomes the column's key and field name.
- `ColDisplayName`: header text shown in the grid.
- `ColWidth`: numeric width in pixels applied to `minWidth` and `maxWidth`.

**Optional properties**

Additional keys map to fields on the `IGridColumn` type to control behaviour:

- `ColCellType` – renders specialised cells such as `tag`, `link`, or `image`.
- `ColTagColorColumn` and `ColTagBorderColorColumn` – supply colours for tag-based cells.
- Fields like `ColIsBold`, `ColLabelAbove`, `ColMultiLine`, etc. correspond to properties on `IGridColumn`.

Unsupported keys (for example `ColTooltipField`) are ignored if present.

The **Column Metadata** property is pre-populated with sample definitions for the core `taskstatus`, `assignedto`, `tasktitle`, and `action` columns. Makers can modify or extend this array to configure additional columns.
