using System;
using System.Collections.Generic;
using System.Linq;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using SeleniumExtras.WaitHelpers;

namespace AQAAutomation.PageObjects
{
    /// <summary>
    /// Page Object for the View Sale Details page (PCF-rendered).
    /// Replaces the previous Canvas App page object that used data-control-name selectors.
    /// </summary>
    public class SaleRecordPageObject
    {
        private readonly IWebDriver _webDriver;
        private readonly WebDriverWait _wait;

        // Root container for the entire PCF-rendered sale details view
        private static readonly By PcfRoot = By.CssSelector("div.voa-sale-details-shell");

        public SaleRecordPageObject(IWebDriver webDriver, int waitTimeoutSeconds = 15)
        {
            _webDriver = webDriver;
            _wait = new WebDriverWait(webDriver, TimeSpan.FromSeconds(waitTimeoutSeconds));
        }

        // ──────────────────────────────────────────────
        //  Wait / Navigation helpers
        // ──────────────────────────────────────────────

        /// <summary>Wait until the PCF sale details shell is present on the page.</summary>
        public void WaitForSaleDetailsToLoad()
        {
            _wait.Until(ExpectedConditions.ElementIsVisible(PcfRoot));
        }

        /// <summary>Click the Back button to return to the grid.</summary>
        public void ClickOnBackArrowForSearchPageNavigation()
        {
            var backButton = _webDriver.FindElement(
                By.CssSelector(".voa-sale-details-shell__header-btn"));
            backButton.Click();
        }

        /// <summary>Click the Refresh button.</summary>
        public void ClickRefreshButton()
        {
            var refreshButton = _webDriver.FindElement(
                By.CssSelector(".voa-sale-details-shell__header-btn--right"));
            refreshButton.Click();
        }

        /// <summary>Scroll to a section by its wrapper id.</summary>
        public void ScrollToSaleDetailsSection(string sectionId)
        {
            var section = _webDriver.FindElement(By.Id(sectionId));
            ((IJavaScriptExecutor)_webDriver).ExecuteScript(
                "arguments[0].scrollIntoView({behavior:'smooth',block:'start'});", section);
        }

        // ──────────────────────────────────────────────
        //  Low-level field readers (replacements for
        //  old Canvas-based GetFieldValue, etc.)
        // ──────────────────────────────────────────────

        /// <summary>
        /// Read a KVP (label → value) row's text by scoping to a parent section id and the label text.
        /// Replaces: GetFieldValue / GetFieldValueFromFormControl for read-only fields.
        /// </summary>
        public string GetKvpValue(string sectionId, string labelText)
        {
            var valueElement = _webDriver.FindElement(By.XPath(
                $"//*[@id='{sectionId}']//span[@class='voa-kvp-row__label' and text()='{labelText}']/following-sibling::span"));
            return valueElement.Text.Trim();
        }

        /// <summary>
        /// Read a readonly-pill value (used for Sale ID and Task ID).
        /// Replaces: GetFieldValue("txtSaleId") / GetFieldValue("txtTaskId").
        /// </summary>
        public string GetReadonlyPillValue(string articleAriaLabelledBy, string labelText)
        {
            var pill = _webDriver.FindElement(By.XPath(
                $"//article[@aria-labelledby='{articleAriaLabelledBy}']//span[@class='voa-kvp-row__label' and text()='{labelText}']/following-sibling::span//span[@class='voa-readonly-pill']"));
            return pill.Text.Trim();
        }

        /// <summary>
        /// Read the status badge text (e.g. "Complete Passed QC").
        /// Replaces: GetReactKnockoutControlField("htaTaskStatus").
        /// </summary>
        public string GetStatusBadgeText()
        {
            var badge = _webDriver.FindElement(
                By.CssSelector("article[aria-labelledby='status-heading'] .voa-status-badge"));
            return badge.Text.Trim();
        }

        /// <summary>
        /// Read an ownership row value (Caseworker or QC Reviewer name).
        /// Replaces: GetFieldValue("txtAssignedTo") / GetFieldValue("txtQCAssignedTo").
        /// </summary>
        public string GetOwnershipValue(string ownershipLabel)
        {
            var name = _webDriver.FindElement(By.XPath(
                $"//article[@aria-labelledby='ownership-heading']//span[@class='voa-ownership-row__label' and text()='{ownershipLabel}']/following-sibling::span[@class='voa-ownership-row__name']"));
            return name.Text.Trim();
        }

        /// <summary>
        /// Read the text value of a Fluent UI TextField by its HTML id.
        /// Works for readonly and editable text fields.
        /// Replaces: GetFieldValueFromFormControl for input elements.
        /// </summary>
        public string GetTextFieldValue(string elementId)
        {
            var input = _webDriver.FindElement(By.CssSelector($"#{elementId} input, #{elementId} textarea"));
            return input.GetAttribute("value") ?? input.Text;
        }

        /// <summary>
        /// Read the currently selected option text from a Fluent UI Dropdown by its HTML id.
        /// Replaces: GetFieldValueFromDropdown (e.g. "cmbPadConfirmation").
        /// </summary>
        public string GetDropdownSelectedText(string elementId)
        {
            var dropdown = _webDriver.FindElement(By.Id(elementId));
            var selectedOption = dropdown.FindElement(
                By.CssSelector(".ms-Dropdown-title, [role='option'][aria-selected='true']"));
            return selectedOption.Text.Trim();
        }

        /// <summary>
        /// Select an option from a Fluent UI Dropdown by its display text.
        /// </summary>
        public void SelectDropdownOption(string elementId, string optionText)
        {
            var dropdown = _webDriver.FindElement(By.Id(elementId));
            dropdown.Click();
            _wait.Until(ExpectedConditions.ElementIsVisible(
                By.CssSelector(".ms-Callout [role='listbox']")));
            var option = _webDriver.FindElement(By.XPath(
                $"//div[contains(@class,'ms-Callout')]//button[@role='option' and .//span[text()='{optionText}']]"));
            option.Click();
        }

        /// <summary>
        /// Set value in a Fluent UI TextField by its HTML id.
        /// </summary>
        public void SetTextFieldValue(string elementId, string value)
        {
            var input = _webDriver.FindElement(By.CssSelector($"#{elementId} input, #{elementId} textarea"));
            input.Clear();
            input.SendKeys(value);
        }

        /// <summary>
        /// Read multi-line flag chip values (Review Flags / Summary Flags).
        /// Replaces: GetReactKnockoutControlFieldValueReviewFlag.
        /// </summary>
        public string GetFlagChipValues(string sectionId, string labelText)
        {
            var valueContainer = _webDriver.FindElement(By.XPath(
                $"//*[@id='{sectionId}']//span[@class='voa-kvp-row__label' and text()='{labelText}']/following-sibling::span"));

            var chips = valueContainer.FindElements(By.CssSelector(".voa-summary-flag-chip"));
            if (chips.Count > 0)
            {
                return string.Join("\n", chips.Select(c => c.Text.Trim()));
            }
            return valueContainer.Text.Trim();
        }

        /// <summary>
        /// Check whether an error message is displayed on the page.
        /// Replaces: FindElement(By.XPath($"//div[@data-control-name='{errorMessageDataControlName}']")).
        /// </summary>
        public bool IsErrorMessageDisplayed()
        {
            try
            {
                var errorElements = _webDriver.FindElements(
                    By.CssSelector(".voa-sales-verification-row__error, .voa-sales-verification-mandatory[role='alert']"));
                return errorElements.Any(e => e.Displayed);
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }

        /// <summary>
        /// Check whether a specific section-level error is shown in the mandatory error list.
        /// </summary>
        public bool IsMandatoryErrorDisplayedFor(string errorText)
        {
            try
            {
                var errorItem = _webDriver.FindElement(By.XPath(
                    $"//div[contains(@class,'voa-sales-verification-mandatory')]//li//button[text()='{errorText}']"));
                return errorItem.Displayed;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }

        // ──────────────────────────────────────────────
        //  Button click helpers
        // ──────────────────────────────────────────────

        /// <summary>Click a button by its visible text (within the PCF shell).</summary>
        public void ClickButtonByText(string buttonText)
        {
            var button = _webDriver.FindElement(By.XPath(
                $"//div[@class='voa-sale-details-shell']//button[.//span[text()='{buttonText}']]"));
            button.Click();
        }

        public void ClickAuditHistoryButton() => ClickButtonByText("Sales Audit History");
        public void ClickQcAuditHistoryButton() => ClickButtonByText("QC Audit History");
        public void ClickCreateTaskButton() => ClickButtonByText("Create Task");
        public void ClickModifyTaskButton() => ClickButtonByText("Modify SVT Task");
        public void ClickCompleteTaskButton() => ClickButtonByText("Complete Sales Verification Task");
        public void ClickSubmitForQcButton() => ClickButtonByText("Submit Sales Verification Task for QC");
        public void ClickCalculateButton() => ClickButtonByText("Calculate");

        // PAD section action buttons
        public void ClickCreateDataEnhancementJobButton() => ClickButtonByText("Create Data Enhancement Job");
        public void ClickViewHereditamentButton() => ClickButtonByText("View Hereditament");

        // Modify Task confirmation dialog
        public void ConfirmModifyTaskDialog()
        {
            _webDriver.FindElement(By.XPath(
                "//div[contains(@class,'ms-Dialog')]//button[.//span[text()='Yes']]")).Click();
        }

        public void CancelModifyTaskDialog()
        {
            _webDriver.FindElement(By.XPath(
                "//div[contains(@class,'ms-Dialog')]//button[.//span[text()='No']]")).Click();
        }

        // Scroll to top floating button
        public void ClickScrollToTop()
        {
            _webDriver.FindElement(By.CssSelector(".voa-scroll-to-top")).Click();
        }

        // ──────────────────────────────────────────────
        //  WLTT / LRPPD record navigation
        // ──────────────────────────────────────────────

        public void ClickNextWlttRecord()
        {
            var nextBtn = _webDriver.FindElement(
                By.CssSelector("#section-wltt .voa-record-nav button:last-child"));
            nextBtn.Click();
        }

        public void ClickPreviousWlttRecord()
        {
            var prevBtn = _webDriver.FindElement(
                By.CssSelector("#section-wltt .voa-record-nav button:first-child"));
            prevBtn.Click();
        }

        public void ClickNextLrppdRecord()
        {
            var nextBtn = _webDriver.FindElement(
                By.CssSelector("#section-lrppd .voa-record-nav button:last-child"));
            nextBtn.Click();
        }

        public void ClickPreviousLrppdRecord()
        {
            var prevBtn = _webDriver.FindElement(
                By.CssSelector("#section-lrppd .voa-record-nav button:first-child"));
            prevBtn.Click();
        }

        public void ClickPromoteWlttToMaster()
        {
            _webDriver.FindElement(By.XPath(
                "//*[@id='section-wltt']//button[.//span[text()='Promote Sale to Master']]")).Click();
        }

        public void ClickPromoteLrppdToMaster()
        {
            _webDriver.FindElement(By.XPath(
                "//*[@id='section-lrppd']//button[.//span[text()='Promote Sale to Master']]")).Click();
        }

        // ──────────────────────────────────────────────
        //  Section extraction methods
        //  (matching the existing test pattern)
        // ──────────────────────────────────────────────

        public MasterSaleDetails ExtractMasterSaleDetailsSection()
        {
            ScrollToSaleDetailsSection("section-master");

            return new MasterSaleDetails
            {
                TaskId = GetReadonlyPillValue("record-identifiers-heading", "Task ID"),
                TaskStatus = GetStatusBadgeText(),
                AssignedTo = GetOwnershipValue("Caseworker"),
                QCAssignedTo = GetOwnershipValue("QC Reviewer"),
                PadConfirmation = GetDropdownSelectedText("voa-pad-confirmation"),
                SalePrice = GetValueFromFormattedPriceFloat(GetKvpValue("section-master", "Sale Price")),
                TransactionDate = DateComparator.NormalizeDate(GetKvpValue("section-master", "Transaction Date")),
                SaleSource = GetKvpValue("section-master", "Sale Source"),
                ReviewFlags = GetFlagChipValues("section-master", "Review Flags"),
                OverallFlag = GetKvpValue("section-master", "Overall Flag"),
                HpiAdjustedPrice = GetValueFromFormattedPriceFloat(GetKvpValue("section-master", "HPI Adjusted Price")),
                ModelValue = GetValueFromFormattedPriceInt(GetKvpValue("section-master", "Model Value")),
                Ratio = GetDecimalValue(GetKvpValue("section-master", "Ratio")),
                SummaryFlags = GetFlagChipValues("section-master", "Summary Flags"),
                PreviousRatioRange = GetDecimalValue(GetKvpValue("section-master", "Previous Ratio Range")),
                LaterRatioRange = GetDecimalValue(GetKvpValue("section-master", "Latest Ratio Range")),
            };
        }

        public SalesVerificationTaskDetails ExtractSalesVerificationTaskSection()
        {
            return new SalesVerificationTaskDetails
            {
                SaleId = GetReadonlyPillValue("record-identifiers-heading", "Sale ID"),
                TaskId = GetReadonlyPillValue("record-identifiers-heading", "Task ID"),
                TaskStatus = GetStatusBadgeText(),
                AssignedTo = GetOwnershipValue("Caseworker"),
                QCAssignedTo = GetOwnershipValue("QC Reviewer"),
            };
        }

        public HereditamentBandingDetails ExtractHereditamentBandingPADSection()
        {
            ScrollToSaleDetailsSection("section-banding");

            return new HereditamentBandingDetails
            {
                Address = GetKvpValue("section-banding", "Address"),
                BillingAuthority = GetKvpValue("section-banding", "Billing Authority"),
                Band = GetKvpValue("section-banding", "Band"),
                BandingEffectiveDate = GetKvpValue("section-banding", "Banding Effective Date"),
                Composite = GetKvpValue("section-banding", "Composite"),
                PadConfirmation = GetDropdownSelectedText("voa-pad-confirmation"),
            };
        }

        public WlttSaleRecord ExtractMLTTSaleRecord()
        {
            ScrollToSaleDetailsSection("section-wltt");

            return new WlttSaleRecord
            {
                Id = GetKvpValue("section-wltt", "ID"),
                TransactionPrice = GetKvpValue("section-wltt", "Transaction Price"),
                TransactionPremium = GetKvpValue("section-wltt", "Transaction Premium"),
                TransactionDate = GetKvpValue("section-wltt", "Transaction Date"),
                GroundRent = GetKvpValue("section-wltt", "Ground Rent"),
                Vendors = GetKvpValue("section-wltt", "Vendor(s)"),
                Vendees = GetKvpValue("section-wltt", "Vendee(s)"),
                VendorAgents = GetKvpValue("section-wltt", "Vendor Agent(s)"),
                VendeeAgents = GetKvpValue("section-wltt", "Vendee Agent(s)"),
                TypeOfProperty = GetKvpValue("section-wltt", "Type of Property"),
                TenureType = GetKvpValue("section-wltt", "Tenure Type"),
                LeaseFrom = GetKvpValue("section-wltt", "Lease From"),
                LeaseTerm = GetKvpValue("section-wltt", "Lease Term"),
            };
        }

        public LrppdSaleRecord ExtractLRPPDSaleRecord()
        {
            ScrollToSaleDetailsSection("section-lrppd");

            return new LrppdSaleRecord
            {
                Id = GetKvpValue("section-lrppd", "ID"),
                Address = GetKvpValue("section-lrppd", "Address"),
                TransactionPrice = GetKvpValue("section-lrppd", "Transaction Price"),
                TypeOfProperty = GetKvpValue("section-lrppd", "Type of Property"),
                TenureType = GetKvpValue("section-lrppd", "Tenure Type"),
                PricePaidCategory = GetKvpValue("section-lrppd", "Price Paid Category"),
                OldNew = GetKvpValue("section-lrppd", "Old/New"),
                TransactionDate = GetKvpValue("section-lrppd", "Transaction Date"),
            };
        }

        public SalesParticularDetails ExtractSalesParticularSection()
        {
            ScrollToSaleDetailsSection("section-particulars");

            return new SalesParticularDetails
            {
                LinkParticulars = GetTextFieldValue("voa-link-particulars"),
                KitchenAge = GetDropdownSelectedText("voa-kitchen-age"),
                KitchenSpecification = GetDropdownSelectedText("voa-kitchen-specification"),
                BathroomAge = GetDropdownSelectedText("voa-bathroom-age"),
                BathroomSpecification = GetDropdownSelectedText("voa-bathroom-specification"),
                Glazing = GetDropdownSelectedText("voa-glazing"),
                Heating = GetDropdownSelectedText("voa-heating"),
                DecorativeFinishes = GetDropdownSelectedText("voa-decorative-finishes"),
                ConditionScore = GetTextFieldValue("voa-condition-score"),
                ConditionCategory = GetTextFieldValue("voa-condition-category"),
                ParticularsNotes = GetTextFieldValue("voa-particulars-notes"),
            };
        }

        public SalesVerificationDetails ExtractSaleVerificationSection()
        {
            ScrollToSaleDetailsSection("section-verification");

            return new SalesVerificationDetails
            {
                IsSaleUseful = GetDropdownSelectedText("voa-sale-useful"),
                WhyNotUseful = IsElementPresent(By.Id("voa-why-not-useful"))
                    ? GetDropdownSelectedText("voa-why-not-useful")
                    : null,
                AdditionalNotes = GetTextFieldValue("voa-additional-notes"),
            };
        }

        public QcSectionDetails ExtractQCSection()
        {
            ScrollToSaleDetailsSection("section-verification");

            return new QcSectionDetails
            {
                QcUndertakenBy = GetTextFieldValue("voa-qc-undertaken-by"),
                QcOutcome = GetDropdownSelectedText("voa-qc-outcome"),
                QcRemarks = GetTextFieldValue("voa-qc-remarks"),
            };
        }

        // ──────────────────────────────────────────────
        //  Sales Verification form fill helpers
        // ──────────────────────────────────────────────

        public void SetIsSaleUseful(string optionText) => SelectDropdownOption("voa-sale-useful", optionText);
        public void SetWhyNotUseful(string optionText) => SelectDropdownOption("voa-why-not-useful", optionText);
        public void SetAdditionalNotes(string notes) => SetTextFieldValue("voa-additional-notes", notes);
        public void SetPadConfirmation(string optionText) => SelectDropdownOption("voa-pad-confirmation", optionText);

        // Sales Particulars form fill
        public void SetKitchenAge(string optionText) => SelectDropdownOption("voa-kitchen-age", optionText);
        public void SetKitchenSpecification(string optionText) => SelectDropdownOption("voa-kitchen-specification", optionText);
        public void SetBathroomAge(string optionText) => SelectDropdownOption("voa-bathroom-age", optionText);
        public void SetBathroomSpecification(string optionText) => SelectDropdownOption("voa-bathroom-specification", optionText);
        public void SetGlazing(string optionText) => SelectDropdownOption("voa-glazing", optionText);
        public void SetHeating(string optionText) => SelectDropdownOption("voa-heating", optionText);
        public void SetDecorativeFinishes(string optionText) => SelectDropdownOption("voa-decorative-finishes", optionText);
        public void SetParticularsNotes(string notes) => SetTextFieldValue("voa-particulars-notes", notes);
        public void SetLinkParticulars(string value) => SetTextFieldValue("voa-link-particulars", value);

        // QC form fill
        public void SetQcOutcome(string optionText) => SelectDropdownOption("voa-qc-outcome", optionText);
        public void SetQcRemarks(string remarks) => SetTextFieldValue("voa-qc-remarks", remarks);

        public void SubmitQcOutcome()
        {
            _webDriver.FindElement(By.CssSelector(
                "#section-verification .voa-sales-verification-qc-section__actions button")).Click();
        }

        // Submit for QC dialog
        public void SetSubmitForQcRemarks(string remarks) => SetTextFieldValue("voa-submit-qc-remarks", remarks);

        public void ConfirmSubmitForQcDialog()
        {
            _webDriver.FindElement(By.XPath(
                "//div[contains(@class,'ms-Dialog')]//button[.//span[text()='Submit']]")).Click();
        }

        public void CancelSubmitForQcDialog()
        {
            _webDriver.FindElement(By.XPath(
                "//div[contains(@class,'ms-Dialog')]//button[.//span[text()='Cancel']]")).Click();
        }

        // ──────────────────────────────────────────────
        //  Hyperlinks section
        // ──────────────────────────────────────────────

        /// <summary>Get all available hyperlink card titles.</summary>
        public List<string> GetHyperlinkTitles()
        {
            var cards = _webDriver.FindElements(By.CssSelector("#section-hyperlinks .voa-link-card__title"));
            return cards.Select(c => c.Text.Trim()).ToList();
        }

        /// <summary>Click the external link for a specific card by title text.</summary>
        public void ClickHyperlinkByTitle(string title)
        {
            var link = _webDriver.FindElement(By.XPath(
                $"//div[@id='section-hyperlinks']//h3[contains(.,'{title}')]/ancestor::article//a[contains(@class,'voa-link-card__button')]"));
            link.Click();
        }

        // ──────────────────────────────────────────────
        //  PAD section
        // ──────────────────────────────────────────────

        public string GetPadStatus()
        {
            return _webDriver.FindElement(
                By.CssSelector("#section-pad .voa-pad-status-chip")).Text.Trim();
        }

        public List<string> GetPadAttributeChips()
        {
            return _webDriver.FindElements(By.CssSelector("#section-pad .voa-pad-attribute-chip"))
                .Select(e => e.Text.Trim()).ToList();
        }

        public List<string> GetPadVscCodes()
        {
            return _webDriver.FindElements(By.CssSelector("#section-pad .voa-pad-code-chip--vsc"))
                .Select(e => e.Text.Trim()).ToList();
        }

        public List<string> GetPadSourceCodes()
        {
            return _webDriver.FindElements(By.CssSelector("#section-pad .voa-pad-code-chip--source"))
                .Select(e => e.Text.Trim()).ToList();
        }

        // ──────────────────────────────────────────────
        //  Audit History modal
        // ──────────────────────────────────────────────

        public void WaitForAuditHistoryModal()
        {
            _wait.Until(ExpectedConditions.ElementIsVisible(By.Id("voa-audit-modal-title")));
        }

        public string GetAuditHistoryModalTitle()
        {
            return _webDriver.FindElement(By.Id("voa-audit-modal-title")).Text.Trim();
        }

        // ──────────────────────────────────────────────
        //  Private utility methods
        // ──────────────────────────────────────────────

        private bool IsElementPresent(By locator)
        {
            try
            {
                _webDriver.FindElement(locator);
                return true;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }

        // ──────────────────────────────────────────────
        //  Formatting helpers (match existing test utils)
        //  Adapt these to call your existing DateComparator /
        //  price parsing utils — stubs provided below.
        // ──────────────────────────────────────────────

        private static float GetValueFromFormattedPriceFloat(string rawText)
        {
            if (string.IsNullOrWhiteSpace(rawText) || rawText == "-")
                return 0f;

            var cleaned = rawText.Replace("£", "").Replace(",", "").Trim();
            return float.TryParse(cleaned, out var result) ? result : 0f;
        }

        private static int GetValueFromFormattedPriceInt(string rawText)
        {
            if (string.IsNullOrWhiteSpace(rawText) || rawText == "-")
                return 0;

            var cleaned = rawText.Replace("£", "").Replace(",", "").Trim();
            return int.TryParse(cleaned, out var result) ? result : 0;
        }

        private static decimal GetDecimalValue(string rawText)
        {
            if (string.IsNullOrWhiteSpace(rawText) || rawText == "-")
                return 0m;

            var cleaned = rawText.Replace("£", "").Replace(",", "").Trim();
            return decimal.TryParse(cleaned, out var result) ? result : 0m;
        }
    }
}
