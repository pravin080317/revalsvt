# View Sale Details — Automation Selectors Reference

> **Purpose**: This document lists all unique selectors available inside the PCF-rendered "View Sale Details" page.
> Previously these controls lived on a **Canvas App** page and were identified via `data-control-name` attributes (e.g. `txtSaleId`, `htaTaskStatus`).
> Now the entire view is rendered inside the PCF component using standard HTML `id`, `aria-label`, and CSS-class selectors documented below.

---

## How to locate controls with Selenium

| Strategy | Syntax (C#) | When to use |
|---|---|---|
| **By.Id** | `driver.FindElement(By.Id("voa-sale-useful"))` | Best — use when an `id` attribute is listed below |
| **By.CssSelector** | `driver.FindElement(By.CssSelector(".voa-kvp-row__label"))` | When locating read-only label/value pairs |
| **By.XPath (label text)** | `driver.FindElement(By.XPath("//span[@class='voa-kvp-row__label' and text()='Sale Price']"))` | When you need a specific KVP row by its label |
| **Container + child** | `driver.FindElement(By.CssSelector("#section-master .voa-kvp-row"))` | Scope a generic class to a specific section |

> **Tip**: The PCF root element has `class="voa-sale-details-shell"` and `role="region"` with `aria-label="Sale Record Details"`.

---

## 1. Page Header

| Control | Selector | Type | Notes |
|---|---|---|---|
| **Back button** | `By.CssSelector(".voa-sale-details-shell__header-btn")` | `<button>` | `aria-label` includes "Back to …" |
| **Page title** | `By.CssSelector(".voa-sale-details-shell__title")` | `<h1>` | Shows "Sale Record — {saleId}" |
| **Context subtitle** | `By.CssSelector(".voa-sale-details-shell__context-subtitle")` | `<span>` | Shows Country · List Year |
| **Refresh button** | `By.CssSelector(".voa-sale-details-shell__header-btn--right")` | `<button>` | `aria-label="Refresh sale record details"` |

---

## 2. Sales Verification Task Details (section wrapper — no `id`)

The section heading has `id="svt-task-details-heading"`.

### 2.1 Record Identifiers

> These are rendered as `<KvpRow>` inside `article[aria-labelledby="record-identifiers-heading"]`.

| Old Canvas Name | Field Label | Selector | Element |
|---|---|---|---|
| `txtSaleId` | Sale ID | `By.XPath("//article[@aria-labelledby='record-identifiers-heading']//span[@class='voa-kvp-row__label' and text()='Sale ID']/following-sibling::span/span[@class='voa-readonly-pill']")` | `<span class="voa-readonly-pill">` |
| `txtTaskId` | Task ID | `By.XPath("//article[@aria-labelledby='record-identifiers-heading']//span[@class='voa-kvp-row__label' and text()='Task ID']/following-sibling::span/span[@class='voa-readonly-pill']")` | `<span class="voa-readonly-pill">` |

### 2.2 Status

| Old Canvas Name | Field Label | Selector | Element |
|---|---|---|---|
| `htaTaskStatus` | Task Status | `By.CssSelector("article[aria-labelledby='status-heading'] .voa-status-badge")` | `<span class="voa-status-badge">` — contains status text |

### 2.3 Ownership

| Old Canvas Name | Field Label | Selector | Element |
|---|---|---|---|
| `txtAssignedTo` | Caseworker (Assigned to) | `By.XPath("//article[@aria-labelledby='ownership-heading']//span[@class='voa-ownership-row__label' and text()='Caseworker']/following-sibling::span[@class='voa-ownership-row__name']")` | `<span>` |
| `txtQCAssignedTo` | QC Reviewer (Assigned to QC) | `By.XPath("//article[@aria-labelledby='ownership-heading']//span[@class='voa-ownership-row__label' and text()='QC Reviewer']/following-sibling::span[@class='voa-ownership-row__name']")` | `<span>` |

### 2.4 Actions

| Old Canvas Name | Button Text | Selector |
|---|---|---|
| `btnAuditHistory` | Sales Audit History | `By.XPath("//article[@aria-labelledby='actions-heading']//button/span[text()='Sales Audit History']/parent::button")` |
| *(new)* | QC Audit History | `By.XPath("//article[@aria-labelledby='actions-heading']//button/span[text()='QC Audit History']/parent::button")` |
| `btnCreateTask` | Create SVT Task | `By.XPath("//article[@aria-labelledby='actions-heading']//button/span[text()='Create SVT Task']/parent::button")` |
| *(new)* | Modify SVT Task | `By.XPath("//article[@aria-labelledby='actions-heading']//button/span[text()='Modify SVT Task']/parent::button")` |

---

## 3. Hyperlinks `#section-hyperlinks`

| Control | Selector | Notes |
|---|---|---|
| Section wrapper | `By.Id("section-hyperlinks")` | `<div>` |
| Section heading | `By.Id("hyperlinks-heading")` | `<h2>` text = "Hyperlinks" |
| Each link card | `By.CssSelector("#section-hyperlinks .voa-link-card")` | One per external link (VMS, Zoopla, Right Move, EPC) |
| Link card title | `By.CssSelector(".voa-link-card__title")` | `<h3>` inside each card |
| Open in new tab link | `By.CssSelector(".voa-link-card__button")` | `<a>` with `target="_blank"` |

---

## 4. Hereditament and Banding Details `#section-banding`

| Old Canvas Name | Field Label | Selector |
|---|---|---|
| *(read-only)* | Address | `By.XPath("//*[@id='section-banding']//span[@class='voa-kvp-row__label' and text()='Address']/following-sibling::span")` |
| *(link)* | Address link (opens new tab) | `By.XPath("//*[@id='section-banding']//a[contains(@aria-label,'Open address')]")` |
| *(read-only)* | Billing Authority | `By.XPath("//*[@id='section-banding']//span[@class='voa-kvp-row__label' and text()='Billing Authority']/following-sibling::span")` |
| *(read-only)* | Band | `By.XPath("//*[@id='section-banding']//span[@class='voa-kvp-row__label' and text()='Band']/following-sibling::span")` |
| *(read-only)* | Banding Effective Date | `By.XPath("//*[@id='section-banding']//span[@class='voa-kvp-row__label' and text()='Banding Effective Date']/following-sibling::span")` |
| *(read-only)* | Composite | `By.XPath("//*[@id='section-banding']//span[@class='voa-kvp-row__label' and text()='Composite']/following-sibling::span")` |

---

## 5. Property Attribute Details (PAD) `#section-pad`

| Control | Selector | Type |
|---|---|---|
| Section wrapper | `By.Id("section-pad")` | `<div>` |
| Heading | `By.Id("pad-heading")` | `<h2>` |
| PAD status chip | `By.CssSelector("#section-pad .voa-pad-status-chip")` | `<span>` e.g. "Committed" |
| Active request warning | `By.CssSelector("#section-pad .voa-pad-top-tag--warning")` | `<span>` |
| Create Data Enhancement Job | `By.XPath("//*[@id='section-pad']//button/span[text()='Create Data Enhancement Job']/parent::button")` | `<button>` |
| View Hereditament | `By.XPath("//*[@id='section-pad']//button/span[text()='View Hereditament']/parent::button")` | `<button>` |
| Effective Date cell | `By.CssSelector("#section-pad .voa-pad-table tbody td:nth-child(2)")` | `<td>` |
| Effective To cell | `By.CssSelector("#section-pad .voa-pad-table tbody td:nth-child(3)")` | `<td>` |
| PAD Status cell | `By.CssSelector("#section-pad .voa-pad-table tbody td:nth-child(4)")` | `<td>` |
| Attribute chips | `By.CssSelector("#section-pad .voa-pad-attribute-chip")` | `<span>` list |
| VSC codes | `By.CssSelector("#section-pad .voa-pad-code-chip--vsc")` | `<span>` list |
| Source codes | `By.CssSelector("#section-pad .voa-pad-code-chip--source")` | `<span>` list |
| Plot Size cell | `By.CssSelector("#section-pad .voa-pad-table tbody td:nth-child(8)")` | `<td>` |
| **PAD Confirmation dropdown** | `By.Id("voa-pad-confirmation")` | `<div>` (Fluent Dropdown) |

---

## 6. Master Sale Details and Calculated Values `#section-master`

| Old Canvas Name | Field Label | Selector |
|---|---|---|
| `txtSalePriceValue` | Sale Price | `By.XPath("//*[@id='section-master']//span[@class='voa-kvp-row__label' and text()='Sale Price']/following-sibling::span")` |
| `txtTransactionDateValue` | Transaction Date | `By.XPath("//*[@id='section-master']//span[@class='voa-kvp-row__label' and text()='Transaction Date']/following-sibling::span")` |
| `txtModelValue` | Model Value | `By.XPath("//*[@id='section-master']//span[@class='voa-kvp-row__label' and text()='Model Value']/following-sibling::span")` |
| `txtSaleSourceValue` | Sale Source | `By.XPath("//*[@id='section-master']//span[@class='voa-kvp-row__label' and text()='Sale Source']/following-sibling::span")` |
| `txtOverallFlagValue` | Overall Flag | `By.XPath("//*[@id='section-master']//span[@class='voa-kvp-row__label' and text()='Overall Flag']/following-sibling::span")` |
| `txtRatioValue` | Ratio | `By.XPath("//*[@id='section-master']//span[@class='voa-kvp-row__label' and text()='Ratio']/following-sibling::span")` |
| `htaReviewFlagsValue` | Review Flags | `By.XPath("//*[@id='section-master']//span[@class='voa-kvp-row__label' and text()='Review Flags']/following-sibling::span")` |
| `txtHPIAdjustedPriceValue` | HPI Adjusted Price | `By.XPath("//*[@id='section-master']//span[@class='voa-kvp-row__label' and text()='HPI Adjusted Price']/following-sibling::span")` |
| `htaSummaryFlagsValue` | Summary Flags | `By.XPath("//*[@id='section-master']//span[@class='voa-kvp-row__label' and text()='Summary Flags']/following-sibling::span")` |
| `txtPreviousRatioRangeValue` | Previous Ratio Range | `By.XPath("//*[@id='section-master']//span[@class='voa-kvp-row__label' and text()='Previous Ratio Range']/following-sibling::span")` |
| `txtLaterRatioRangeValue` | Latest Ratio Range | `By.XPath("//*[@id='section-master']//span[@class='voa-kvp-row__label' and text()='Latest Ratio Range']/following-sibling::span")` |

---

## 7. WLTT (Stamp Duty Land Tax) `#section-wltt`

| Field Label | Selector |
|---|---|
| Section | `By.Id("section-wltt")` |
| Heading | `By.Id("wltt-heading")` |
| Record Navigator (Prev) | `By.CssSelector("#section-wltt .voa-record-nav button:first-child")` |
| Record Navigator (Next) | `By.CssSelector("#section-wltt .voa-record-nav button:last-child")` |
| Record Counter | `By.CssSelector("#section-wltt .voa-record-nav")` |
| ID | `By.XPath("//*[@id='section-wltt']//span[@class='voa-kvp-row__label' and text()='ID']/following-sibling::span")` |
| Transaction Price | `By.XPath("//*[@id='section-wltt']//span[@class='voa-kvp-row__label' and text()='Transaction Price']/following-sibling::span")` |
| Transaction Premium | `By.XPath("//*[@id='section-wltt']//span[@class='voa-kvp-row__label' and text()='Transaction Premium']/following-sibling::span")` |
| Transaction Date | `By.XPath("//*[@id='section-wltt']//span[@class='voa-kvp-row__label' and text()='Transaction Date']/following-sibling::span")` |
| Ground Rent | `By.XPath("//*[@id='section-wltt']//span[@class='voa-kvp-row__label' and text()='Ground Rent']/following-sibling::span")` |
| Vendor(s) | `By.XPath("//*[@id='section-wltt']//span[@class='voa-kvp-row__label' and text()='Vendor(s)']/following-sibling::span")` |
| Vendee(s) | `By.XPath("//*[@id='section-wltt']//span[@class='voa-kvp-row__label' and text()='Vendee(s)']/following-sibling::span")` |
| Vendor Agent(s) | `By.XPath("//*[@id='section-wltt']//span[@class='voa-kvp-row__label' and text()='Vendor Agent(s)']/following-sibling::span")` |
| Vendee Agent(s) | `By.XPath("//*[@id='section-wltt']//span[@class='voa-kvp-row__label' and text()='Vendee Agent(s)']/following-sibling::span")` |
| Type of Property | `By.XPath("//*[@id='section-wltt']//span[@class='voa-kvp-row__label' and text()='Type of Property']/following-sibling::span")` |
| Tenure Type | `By.XPath("//*[@id='section-wltt']//span[@class='voa-kvp-row__label' and text()='Tenure Type']/following-sibling::span")` |
| Lease From | `By.XPath("//*[@id='section-wltt']//span[@class='voa-kvp-row__label' and text()='Lease From']/following-sibling::span")` |
| Lease Term | `By.XPath("//*[@id='section-wltt']//span[@class='voa-kvp-row__label' and text()='Lease Term']/following-sibling::span")` |
| Promote to Master btn | `By.XPath("//*[@id='section-wltt']//button/span[text()='Promote Sale to Master']/parent::button")` |
| Current Master indicator | `By.CssSelector("#section-wltt .voa-master-status-box--current")` |
| HPI Adjusted Price | `By.XPath("//*[@id='section-wltt']//span[@class='voa-kvp-row__label' and text()='HPI Adjusted Price']/following-sibling::span")` (rendered in master calculation row area) |
| Ratio | `By.XPath("//*[@id='section-wltt']//span[@class='voa-kvp-row__label' and text()='Ratio']/following-sibling::span")` |

---

## 8. LRPPD (HM Land Registry Price Paid Data) `#section-lrppd`

| Field Label | Selector |
|---|---|
| Section | `By.Id("section-lrppd")` |
| Heading | `By.Id("lrppd-heading")` |
| Record Navigator (Prev) | `By.CssSelector("#section-lrppd .voa-record-nav button:first-child")` |
| Record Navigator (Next) | `By.CssSelector("#section-lrppd .voa-record-nav button:last-child")` |
| ID | `By.XPath("//*[@id='section-lrppd']//span[@class='voa-kvp-row__label' and text()='ID']/following-sibling::span")` |
| Address | `By.XPath("//*[@id='section-lrppd']//span[@class='voa-kvp-row__label' and text()='Address']/following-sibling::span")` |
| Transaction Price | `By.XPath("//*[@id='section-lrppd']//span[@class='voa-kvp-row__label' and text()='Transaction Price']/following-sibling::span")` |
| Type of Property | `By.XPath("//*[@id='section-lrppd']//span[@class='voa-kvp-row__label' and text()='Type of Property']/following-sibling::span")` |
| Tenure Type | `By.XPath("//*[@id='section-lrppd']//span[@class='voa-kvp-row__label' and text()='Tenure Type']/following-sibling::span")` |
| Price Paid Category | `By.XPath("//*[@id='section-lrppd']//span[@class='voa-kvp-row__label' and text()='Price Paid Category']/following-sibling::span")` |
| Old/New | `By.XPath("//*[@id='section-lrppd']//span[@class='voa-kvp-row__label' and text()='Old/New']/following-sibling::span")` |
| Transaction Date | `By.XPath("//*[@id='section-lrppd']//span[@class='voa-kvp-row__label' and text()='Transaction Date']/following-sibling::span")` |
| Promote to Master btn | `By.XPath("//*[@id='section-lrppd']//button/span[text()='Promote Sale to Master']/parent::button")` |
| Current Master indicator | `By.CssSelector("#section-lrppd .voa-master-status-box--current")` |

---

## 9. Sales Particulars `#section-particulars`

| Old Canvas Name | Field Label | **HTML `id`** | Control Type |
|---|---|---|---|
| *(radio)* | Sales Particulars (review status) | *(ChoiceGroup — use `By.CssSelector("#section-particulars .voa-sales-particular-review")`)* | RadioGroup |
| *(text)* | Link Particulars | `voa-link-particulars` | `<input type="text">` |
| *(dropdown)* | Kitchen Age | `voa-kitchen-age` | Fluent `<Dropdown>` |
| *(dropdown)* | Kitchen Spec | `voa-kitchen-specification` | Fluent `<Dropdown>` |
| *(dropdown)* | Bathroom Age | `voa-bathroom-age` | Fluent `<Dropdown>` |
| *(dropdown)* | Bathroom Spec | `voa-bathroom-specification` | Fluent `<Dropdown>` |
| *(dropdown)* | Glazing | `voa-glazing` | Fluent `<Dropdown>` |
| *(dropdown)* | Heating | `voa-heating` | Fluent `<Dropdown>` |
| *(dropdown)* | Decorative Finishes | `voa-decorative-finishes` | Fluent `<Dropdown>` |
| *(button)* | Calculate | `By.CssSelector("#section-particulars .voa-sales-particular-calculate")` | `<button>` |
| *(readonly)* | Condition Score | `voa-condition-score` | `<input>` (readonly) |
| *(readonly)* | Condition Category | `voa-condition-category` | `<input>` (readonly) |
| *(textarea)* | Particulars Notes | `voa-particulars-notes` | `<textarea>` |

---

## 10. Sales Verification `#section-verification`

| Old Canvas Name | Field Label | **HTML `id`** | Control Type |
|---|---|---|---|
| *(dropdown)* | Is this sale useful? | `voa-sale-useful` | Fluent `<Dropdown>` |
| *(dropdown)* | Why is the sale not useful? | `voa-why-not-useful` | Fluent `<Dropdown>` *(conditional — only visible when "No" is selected)* |
| *(textarea)* | Additional Notes | `voa-additional-notes` | `<textarea>` |
| *(button)* | Complete Sales Verification Task | `By.XPath("//button/span[text()='Complete Sales Verification Task']/parent::button")` | `<button>` |
| *(button)* | Submit Sales Verification Task for QC | `By.XPath("//button/span[text()='Submit Sales Verification Task for QC']/parent::button")` | `<button>` |

### 10.1 QC Section (visible to QC users only)

| Old Canvas Name | Field Label | **HTML `id`** | Control Type |
|---|---|---|---|
| *(readonly)* | QC undertaken by | `voa-qc-undertaken-by` | `<input>` (disabled/readonly) |
| *(dropdown)* | QC outcome | `voa-qc-outcome` | Fluent `<Dropdown>` |
| *(textarea)* | QC remarks | `voa-qc-remarks` | `<textarea>` |
| *(button)* | Submit QC Outcome | `By.CssSelector("#section-verification .voa-sales-verification-qc-section__actions button")` | `<button>` |

### 10.2 Submit for QC Dialog (modal)

| Field Label | **HTML `id`** | Control Type |
|---|---|---|
| Remarks (in dialog) | `voa-submit-qc-remarks` | `<textarea>` |

---

## 11. Audit History Modal

| Control | Selector |
|---|---|
| Modal title | `By.Id("voa-audit-modal-title")` |
| Audit entries | `By.CssSelector(".voa-audit-entry__meta")` |

---

## 12. Sales Particular Reference Modal

| Control | Selector |
|---|---|
| Modal title | `By.Id("voa-reference-modal-title")` |

---

## Quick Mapping: Old Canvas `data-control-name` → New PCF Selector

| Canvas `data-control-name` | New PCF Selector | Method |
|---|---|---|
| `txtSaleId` | `//article[@aria-labelledby='record-identifiers-heading']//span[text()='Sale ID']/following-sibling::span//span[@class='voa-readonly-pill']` | XPath |
| `txtTaskId` | `//article[@aria-labelledby='record-identifiers-heading']//span[text()='Task ID']/following-sibling::span//span[@class='voa-readonly-pill']` | XPath |
| `htaTaskStatus` | `article[aria-labelledby='status-heading'] .voa-status-badge` | CSS |
| `txtAssignedTo` | `//article[@aria-labelledby='ownership-heading']//span[text()='Caseworker']/following-sibling::span[@class='voa-ownership-row__name']` | XPath |
| `txtQCAssignedTo` | `//article[@aria-labelledby='ownership-heading']//span[text()='QC Reviewer']/following-sibling::span[@class='voa-ownership-row__name']` | XPath |
| `btnAuditHistory` | `//button[.//span[text()='Sales Audit History']]` | XPath |
| `txtSalePriceValue` | `//*[@id='section-master']//span[text()='Sale Price']/following-sibling::span` | XPath |
| `txtTransactionDateValue` | `//*[@id='section-master']//span[text()='Transaction Date']/following-sibling::span` | XPath |
| `txtSaleSourceValue` | `//*[@id='section-master']//span[text()='Sale Source']/following-sibling::span` | XPath |
| `htaReviewFlagsValue` | `//*[@id='section-master']//span[text()='Review Flags']/following-sibling::span` | XPath |
| `txtOverallFlagValue` | `//*[@id='section-master']//span[text()='Overall Flag']/following-sibling::span` | XPath |
| `txtHPIAdjustedPriceValue` | `//*[@id='section-master']//span[text()='HPI Adjusted Price']/following-sibling::span` | XPath |
| `txtModelValue` | `//*[@id='section-master']//span[text()='Model Value']/following-sibling::span` | XPath |
| `txtRatioValue` | `//*[@id='section-master']//span[text()='Ratio']/following-sibling::span` | XPath |
| `htaSummaryFlagsValue` | `//*[@id='section-master']//span[text()='Summary Flags']/following-sibling::span` | XPath |
| `txtPreviousRatioRangeValue` | `//*[@id='section-master']//span[text()='Previous Ratio Range']/following-sibling::span` | XPath |
| `txtLaterRatioRangeValue` | `//*[@id='section-master']//span[text()='Latest Ratio Range']/following-sibling::span` | XPath |
| `cmbPadConfirmation` | `#voa-pad-confirmation` | CSS / Id |
| `btnCreateTask` | `//button[.//span[text()='Create SVT Task']]` | XPath |
| `errorMessageDataControlName` | `.voa-sales-verification-row__error` or `.voa-sales-verification-mandatory` | CSS |

---

## Important Notes for Selenium Tests

1. **Fluent UI Dropdowns** (`voa-sale-useful`, `voa-qc-outcome`, `voa-pad-confirmation`, etc.) render as `<div>` elements with `role="listbox"`. To select an option:
   ```csharp
   // Click the dropdown to open it
   driver.FindElement(By.Id("voa-sale-useful")).Click();
   // Select an option from the opened callout
   driver.FindElement(By.XPath("//button[@role='option' and .//span[text()='Yes']]")).Click();
   ```

2. **PCF controls render inside a shadow boundary level** — the PCF renders inside a `<div>` with `class="pcf-container"` in the Dynamics 365 form. You may need to first find the PCF container, then search within it.

3. **All section wrappers** have stable `id` attributes: `section-hyperlinks`, `section-banding`, `section-pad`, `section-master`, `section-wltt`, `section-lrppd`, `section-particulars`, `section-verification`.

4. **Read-only KVP rows** use the pattern:
   ```html
   <div class="voa-kvp-row">
     <span class="voa-kvp-row__label">Label</span>
     <span class="voa-kvp-row__value">Value</span>
   </div>
   ```
   Use the label `text()` to find the correct row, then read the sibling `voa-kvp-row__value`.

5. **Error messages** appear as `<span class="voa-sales-verification-row__error">` next to their control, or as `<div class="voa-sales-verification-mandatory" role="alert">` for grouped mandatory-field errors.
