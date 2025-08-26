# DetailsListVOA Control

This project contains a Power Apps Component Framework (PCF) control that renders a grid of records.

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
