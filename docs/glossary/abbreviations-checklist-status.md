# Abbreviations Checklist Status

Source checklist:
- Abbreviations
  - Are all abbreviations explained the first time they appear?
  - Is the full term provided before using abbreviations (or shown in brackets)?
  - Are tooltips or glossary sections used where needed and accessible to all users?

Assessment date: 2026-03-24

## Results

- [ ] Are all abbreviations explained the first time they appear?
  - Status: Not met
  - Evidence: `QC` appears in visible UI text before first expansion in some flows, for example `Submit Sales Verification Task for QC` in `DetailsListVOA/components/SaleDetailsShell/sections/SalesVerificationSection.tsx:609`.

- [ ] Is the full term provided before using abbreviations (or shown in brackets)?
  - Status: Partially met
  - Evidence: Full term is shown in some places (for example `Quality Control` at `DetailsListVOA/components/SaleDetailsShell/sections/SalesVerificationSection.tsx:623`), but abbreviations are still used unexpanded in labels/buttons (`QC outcome`, `QC remarks`, `Submit for QC`).

- [ ] Are tooltips or glossary sections used where needed and accessible to all users?
  - Status: Partially met
  - Evidence: Tooltips are present (for example `title="QC review..."` in `DetailsListVOA/components/SaleDetailsShell/sections/SalesVerificationSection.tsx:622`). Glossary section now exists at `docs/glossary/abbreviations-accessibility.md`.
  - Gap: Tooltip-only explanation is not sufficient for all users; key expansions should remain visible in labels/body text.

## Recommended wording updates

- `Submit Sales Verification Task for QC` -> `Submit Sales Verification Task for Quality Control (QC)`
- `Submit for QC` -> `Submit for Quality Control (QC)`
- `QC undertaken by` -> `Quality Control (QC) undertaken by`
- `QC outcome` -> `Quality Control (QC) outcome`
- `QC remarks` -> `Quality Control (QC) remarks`
- `QC review of the caseworker's sales verification decision` -> `Quality Control (QC) review of the caseworker's sales verification decision`
- `PAD Confirmation` -> `Property Attribute Details (PAD) confirmation`
- `Select PAD confirmation` -> `Select Property Attribute Details (PAD) confirmation`