# Audit History Data Transformations

## Overview
Yes, audit history data **IS being transformed** at multiple points in both the **Plugin** and **PCF**.

---

## 1. Plugin-Side Transformations (SvtGetAuditLogs.cs)

### **TransformAuditLogPayload()** - Main Transformation Function

The plugin applies the following transformations **after receiving the raw audit data** from the APIM endpoint:

#### 1.1 **ChangedBy Field Transformation**
- **What**: Replace GUID tokens with user display names
- **Code**: `TryReplaceChangedByWithDisplayName()`
- **Example**: 
  - Before: `"changedBy": "{27a0cd3f-89ab-44c2-a5db-3b85e3f8a1d9}"`
  - After: `"changedBy": "John Smith"` (resolved from Dataverse user records)

#### 1.2 **Assignee Field Transformations**
- **What**: Replace GUID tokens in field change values for assignee fields
- **Applied to**: `assignedto`, `qcassignedto`, and any field ending with `*assignedto`
- **Code**: `TryReplaceGuidTokensWithNames()`
- **Fields Transformed**:
  - `changes[...].OldValue` - old assignee GUID → display name
  - `changes[...].NewValue` - new assignee GUID → display name

#### 1.3 **GUID Token Resolution Process**
1. **Collect all GUIDs** from:
   - `historyItem.ChangedBy` 
   - `change.OldValue` and `change.NewValue` for assignee fields
2. **Query Dataverse** to resolve GUID → User Display Name mapping
3. **Replace all occurrences** using `ReplaceGuidTokensWithNames()` regex matching
4. **Return transformed JSON** only if changes were made

#### 1.4 **Error Handling**
- If any transformation fails, returns original response body unchanged
- Trace logs: `"SvtGetAuditLogs transform skipped due to error: {ex}"`

---

## 2. PCF-Side Transformations

### **fetchAuditHistory()** → **mergeAuditHistoryDetails()**

#### 2.1 **Payload Merging**
Location: `DetailsListRuntimeController.ts` → `sale-details.ts`

```typescript
mergeAuditHistoryDetails(saleDetailsJson, auditType, payload) {
  // Stores under TWO locations for backward compatibility:
  auditLogs[scopeKey] = payload;  // 'qc' or 'sl'
  
  // Legacy keys:
  root.qcAuditHistory = payload;  // if QC type
  root.auditHistory = payload;    // if SL type
}
```

**Scope Keys**:
- `'qc'` for QC audit type
- `'sl'` for SL (Sales Log) audit type

### **mapAuditHistoryModel()** - View Model Mapping

Location: `useSaleDetailsViewModel.ts`

This function performs the **most extensive transformations** for UI display:

#### 2.2 **History Array Extraction**
- Extracts from multiple possible keys (backward compatibility):
  - `auditHistory`
  - `history`
  - `records`
  - `items`

#### 2.3 **Field Label Normalization**
- **Transformation**: Maps technical field names → user-friendly display names
- **Function**: `toAuditFieldLabel()`
- **Examples**:
  - `taskstatus` → Display Name from `AUDIT_FIELD_LABEL_BY_KEY`
  - `assignedto` → "Assigned To"
  - `qcassignedto` → "QC Assigned To"
  - `padconfirmation` → "PAD Confirmation"
  - etc.

#### 2.4 **Date Formatting**
- **Transformation**: Parse UK date format and sort by timestamp
- **Function**: `toUkDateTime()`
- **Format**: `DD/MM/YYYY HH:mm:ss`
- **Example**:
  - Input: `"2026-03-20T11:36:16"`
  - Output: `"20/03/2026 11:36:16"`
- **Sort**: Latest entries first (reverse chronological)

#### 2.5 **User Resolution for Assignee Fields**
- **Function**: `resolveAuditUserValue()`
- **Detection**: Uses `isAuditAssigneeField()` to identify assignee fields
- **Behavior**: 
  - For assignee fields: resolve from lookup table (user name mapping)
  - For other fields: display raw value
- **Example**:
  ```
  oldValue: "User A" (resolved from lookup)
  newValue: "User B" (resolved from lookup)
  ```

#### 2.6 **Empty Value Handling**
- **Transformation**: Format empty/null values to `-` for display
- **Function**: `formatValue()`
- **Filters out**: If all fields (fieldName, oldValue, newValue) are `-`, returns empty array

#### 2.7 **Final View Model Structure**
Output after all transformations:
```typescript
AuditHistoryViewModel {
  taskId: string;
  entries: AuditHistoryEntryViewModel[];  // fully transformed entries
  errorMessage: string;
}

AuditHistoryEntryViewModel {
  changeId: string;      // normalized from changeID
  changedBy: string;     // user display name
  changedOn: string;     // formatted UK date
  eventType: string;     // event type (Update, Create, etc)
  changes: AuditHistoryChangeViewModel[];
}

AuditHistoryChangeViewModel {
  fieldName: string;     // user-friendly label
  oldValue: string;      // formatted/resolved value
  newValue: string;      // formatted/resolved value
}
```

---

## 3. Transformation Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│  APIM Endpoint (Raw Audit Data)                             │
│  - GUIDs for users                                          │
│  - Raw field names                                          │
│  - UTC timestamps                                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  PLUGIN: TransformAuditLogPayload()                         │
│  ✓ Resolve ChangedBy GUIDs → User Display Names            │
│  ✓ Resolve Assignee Field GUIDs → User Display Names       │
│  ✓ Return transformed JSON                                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  PCF: fetchAuditHistory() + mergeAuditHistoryDetails()     │
│  ✓ Merge payload into saleDetails JSON                     │
│  ✓ Store under auditLogs.qc/sl + legacy keys              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  PCF: mapAuditHistoryModel()                                │
│  ✓ Extract history from multiple key possibilities          │
│  ✓ Normalize field labels (technical → user-friendly)      │
│  ✓ Format dates to UK format (DD/MM/YYYY HH:mm:ss)         │
│  ✓ Resolve assignee users from lookup table                 │
│  ✓ Format empty values to "-"                              │
│  ✓ Sort by date (latest first)                             │
│  ✓ Return AuditHistoryViewModel                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  UI DISPLAY: Audit History Modal                           │
│  - Human-readable field names                              │
│  - User display names (no GUIDs)                           │
│  - UK-formatted dates                                      │
│  - Chronological order (latest first)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Key Files

### Plugin
- [VOA.SVT.Plugins/Plugins/CustomAPI/SvtGetAuditLogs.cs](VOA.SVT.Plugins/Plugins/CustomAPI/SvtGetAuditLogs.cs)
  - `TransformAuditLogPayload()` (line 262)
  - `TryReplaceChangedByWithDisplayName()` 
  - `TryReplaceGuidTokensWithNames()`
  - `ShouldResolveAssigneeField()`

### PCF
- [DetailsListVOA/services/DetailsListRuntimeController.ts](DetailsListVOA/services/DetailsListRuntimeController.ts)
  - `fetchAuditHistory()` (line 763)
- [DetailsListVOA/services/runtime/sale-details.ts](DetailsListVOA/services/runtime/sale-details.ts)
  - `mergeAuditHistoryDetails()` (line 602)
- [DetailsListVOA/components/SaleDetailsShell/useSaleDetailsViewModel.ts](DetailsListVOA/components/SaleDetailsShell/useSaleDetailsViewModel.ts)
  - `mapAuditHistoryModel()` (line 983)
  - `toAuditFieldLabel()`
  - `resolveAuditUserValue()`
  - `isAuditAssigneeField()`

### Type Definitions
- [DetailsListVOA/models/SvtGetAuditLogs.ts](DetailsListVOA/models/SvtGetAuditLogs.ts)
  - `AuditHistoryRecord`
  - `AuditHistoryEntryViewModel`
  - `AuditHistoryChangeViewModel`
  - `AuditHistoryViewModel`

---

## 5. Backward Compatibility

The system stores audit history under **multiple keys** for compatibility:

**New Structure** (Current):
- `auditLogs.qc` (QC audit type)
- `auditLogs.sl` (Sales Log audit type)

**Legacy Structure** (For old code):
- `qcAuditHistory` (QC type)
- `auditHistory` (Sales Log type)

The `mapAuditHistoryModel()` function also extracts from multiple key possibilities:
- `auditHistory`, `history`, `records`, `items`

---

## Conclusion

**YES**, audit history data undergoes significant transformation:

1. **At Plugin Level**: GUIDs → User display names
2. **At PCF Runtime Level**: Payload merging and state management
3. **At PCF View Model Level**: Field label mapping, date formatting, user resolution, sorting

These transformations ensure the audit history is displayed in a human-readable format in the UI.
