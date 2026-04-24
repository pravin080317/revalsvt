# VT to SVT Readonly Launch Design

Date: 2026-04-23

## Purpose

This document defines the proposed integration for launching the SVT sale details page from the VT PCF in a new browser tab.

The target behaviour is:

- VT passes a `saleId`
- SVT opens directly on the sale details page
- SVT calls the existing Get Sale By Id API to load full details
- the page is forced into readonly mode
- all internal SVT actions are disabled
- external reference links remain enabled

This document is a design proposal only. It does not mean the manifest or runtime already implement this behaviour.

## Scope

This design applies when:

- VT is implemented as a separate PCF
- VT and SVT both sit inside the same CT model-driven app
- VT opens SVT in a new browser tab

This design does not change the existing SVT grid-driven details flow.

## Current Architecture

SVT is hosted as part of the CT model-driven app shell and uses custom pages/components within that app.

Current SVT sale-details behaviour is grid-driven:

1. User selects a row in SVT
2. SVT calls the configured View Sale Record Custom API
3. SVT renders the PCF sale details page

The details shell already supports readonly rendering for editable sections, but the current readonly behaviour is not strict enough for VT launch mode because some internal actions remain available.

## Agreed Approach

Use option 1:

- VT opens the existing SVT custom page in a new tab
- VT passes launch parameters through the page URL
- the SVT host page binds those parameters into the SVT PCF inputs
- the SVT PCF detects VT readonly launch mode and loads sale details directly

VT must not attempt to call the SVT PCF directly.

## VT Launch Contract

VT should open the SVT custom page with the following query parameters:

1. `saleId` - required
2. `openMode` - required, value `vt-readonly`
3. `country` - optional but recommended
4. `listYear` - optional but recommended

Example intent:

- open SVT custom page in new tab
- include `saleId=<sale id>`
- include `openMode=vt-readonly`
- include `country=<country>` when known
- include `listYear=<list year>` when known

## SVT Host Page Responsibilities

The SVT host page should:

1. read `Param("saleId")`
2. read `Param("openMode")`
3. optionally read `Param("country")`
4. optionally read `Param("listYear")`
5. bind those values into the SVT PCF input properties

The host page remains the handoff point. This keeps VT and SVT loosely coupled.

### Null and Blank Parameter Handling

The host mapping is null-safe.

- If `saleId` is blank/null, external readonly launch does not activate.
- If `openMode` is blank/null, external readonly launch does not activate.
- If `country` or `listYear` is blank/null, processing continues using normal fallback context.
- Blank values do not throw runtime errors.

Recommended FX mapping in the SVT host page:

```powerfx
externalSaleId: Coalesce(Param("saleId"), "")
externalOpenMode: Coalesce(Param("openMode"), "")
country: Coalesce(Param("country"), "")
listYear: Coalesce(Param("listYear"), "")
```

This keeps the runtime contract explicit and avoids null propagation into PCF string inputs.

## Proposed New PCF Inputs

Add two optional manifest inputs to the SVT PCF:

1. `externalSaleId`
2. `externalOpenMode`

Recommended values:

- `externalSaleId`: the sale identifier supplied by VT
- `externalOpenMode`: `vt-readonly`

These inputs must default to empty values so existing SVT screens remain unchanged.

## Required Runtime Behaviour

When the SVT PCF receives:

- `externalSaleId` with a non-empty value
- `externalOpenMode` equal to `vt-readonly`

it should:

1. bypass the normal row-click requirement
2. call the existing View Sale Record / Get Sale By Id flow using the provided `saleId`
3. open the details page directly
4. force readonly mode
5. disable all internal SVT actions

## API Requirement

VT readonly mode must use the existing sale-details retrieval flow.

The SVT PCF should continue to call the configured View Sale Record Custom API, which currently resolves to `voa_GetViewSaleRecordById` unless overridden by input configuration.

No separate VT-specific sale-details API is required.

## Readonly Rules for VT Launch Mode

In VT readonly mode, the following must be disabled:

1. Refresh
2. Sales Audit History
3. QC Audit History
4. Create Task
5. Modify SVT Task
6. Sales verification edit/submit actions
7. QC outcome actions
8. promote-to-master interactions
9. any other internal SVT command or mutation action

The following must remain enabled:

1. VMS link
2. Zoopla link
3. Rightmove link
4. EPC link
5. any other external reference links shown in the Hyperlinks section

## Why This Does Not Affect Current SVT Behaviour

The design is additive and isolated:

1. the new inputs are optional
2. existing SVT screens will not populate those inputs
3. the current row-click flow remains unchanged
4. the current access-resolution logic remains unchanged for normal SVT entry
5. VT readonly mode activates only when both the sale ID and the explicit readonly open mode are supplied

As a result, existing SVT behaviour should remain unchanged unless the new launch contract is used.

## Recommended Internal Design

To keep the logic explicit, the runtime should treat VT launch mode as a separate override, not as a side effect of normal readonly logic.

Recommended runtime concepts:

1. forced external readonly flag
2. forced disable-internal-actions flag
3. readonly banner message for VT launch mode
4. external launch key to prevent repeated refetch loops during update cycles

Recommended readonly banner message:

`Opened from VT in readonly mode. Internal SVT actions are disabled.`

## Affected Areas for Implementation

Expected files to change during implementation:

1. `DetailsListVOA/ControlManifest.Input.xml`
2. `DetailsListVOA/index.ts`
3. `DetailsListVOA/components/ControlShell/DetailsListControlShell.tsx`
4. `DetailsListVOA/services/DetailsListRuntimeController.ts`
5. `DetailsListVOA/components/SaleDetailsShell/SaleDetailsShell.tsx`
6. `DetailsListVOA/components/SaleDetailsShell/sections/SalesVerificationTaskSection.tsx`

Documentation likely to update after implementation:

1. `docs/pcf-input-output-parameters.md`

## Open Points

The following are expected implementation choices rather than unresolved business decisions:

1. the exact custom page URL VT should open
2. how the host page maps query parameters to PCF inputs
3. the exact disabled-reason text shown on blocked internal actions

The core business behaviour is agreed:

- open from VT using sale ID
- call Get Sale By Id and load sale details
- show details in readonly mode
- disable internal SVT actions including refresh and audit history
- keep external links enabled