namespace AQAAutomation.PageObjects
{
    /// <summary>
    /// Model for "Sales Verification Task Details" section.
    /// Maps to the top section of the View Sale Details page.
    /// </summary>
    public class SalesVerificationTaskDetails
    {
        public string SaleId { get; set; }
        public string TaskId { get; set; }
        public string TaskStatus { get; set; }
        public string AssignedTo { get; set; }
        public string QCAssignedTo { get; set; }
    }

    /// <summary>
    /// Model for "Master Sale Details and Calculated Values" section.
    /// Previously populated by ExtractMasterSaleDetailsSection() using canvas data-control-names.
    /// </summary>
    public class MasterSaleDetails
    {
        public string TaskId { get; set; }
        public string TaskStatus { get; set; }
        public string AssignedTo { get; set; }
        public string QCAssignedTo { get; set; }
        public string PadConfirmation { get; set; }
        public float SalePrice { get; set; }
        public string TransactionDate { get; set; }
        public string SaleSource { get; set; }
        public string ReviewFlags { get; set; }
        public string OverallFlag { get; set; }     // needs string handling
        public float HpiAdjustedPrice { get; set; }
        public int ModelValue { get; set; }
        public decimal Ratio { get; set; }
        public string SummaryFlags { get; set; }
        public decimal PreviousRatioRange { get; set; }
        public decimal LaterRatioRange { get; set; }
    }

    /// <summary>
    /// Model for "Hereditament and Banding Details" + PAD confirmation.
    /// </summary>
    public class HereditamentBandingDetails
    {
        public string Address { get; set; }
        public string BillingAuthority { get; set; }
        public string Band { get; set; }
        public string BandingEffectiveDate { get; set; }
        public string Composite { get; set; }
        public string PadConfirmation { get; set; }
    }

    /// <summary>
    /// Model for WLTT (Stamp Duty Land Tax / Welsh Land Transaction Tax) record.
    /// Previously populated by ExtractMLTTSaleRecord().
    /// </summary>
    public class WlttSaleRecord
    {
        public string Id { get; set; }
        public string TransactionPrice { get; set; }
        public string TransactionPremium { get; set; }
        public string TransactionDate { get; set; }
        public string GroundRent { get; set; }
        public string Vendors { get; set; }
        public string Vendees { get; set; }
        public string VendorAgents { get; set; }
        public string VendeeAgents { get; set; }
        public string TypeOfProperty { get; set; }
        public string TenureType { get; set; }
        public string LeaseFrom { get; set; }
        public string LeaseTerm { get; set; }
    }

    /// <summary>
    /// Model for LRPPD (HM Land Registry Price Paid Data) record.
    /// Previously populated by ExtractLRPPDSaleRecord().
    /// </summary>
    public class LrppdSaleRecord
    {
        public string Id { get; set; }
        public string Address { get; set; }
        public string TransactionPrice { get; set; }
        public string TypeOfProperty { get; set; }
        public string TenureType { get; set; }
        public string PricePaidCategory { get; set; }
        public string OldNew { get; set; }
        public string TransactionDate { get; set; }
    }

    /// <summary>
    /// Model for "Sales Particulars" section.
    /// Previously populated by ExtractSalesParticularSection().
    /// </summary>
    public class SalesParticularDetails
    {
        public string LinkParticulars { get; set; }
        public string KitchenAge { get; set; }
        public string KitchenSpecification { get; set; }
        public string BathroomAge { get; set; }
        public string BathroomSpecification { get; set; }
        public string Glazing { get; set; }
        public string Heating { get; set; }
        public string DecorativeFinishes { get; set; }
        public string ConditionScore { get; set; }
        public string ConditionCategory { get; set; }
        public string ParticularsNotes { get; set; }
    }

    /// <summary>
    /// Model for "Sales Verification" section.
    /// Previously populated by ExtractSaleVerificationSection().
    /// </summary>
    public class SalesVerificationDetails
    {
        public string IsSaleUseful { get; set; }
        public string WhyNotUseful { get; set; }
        public string AdditionalNotes { get; set; }
    }

    /// <summary>
    /// Model for the QC sub-section inside Sales Verification.
    /// Previously populated by ExtractQCSection().
    /// </summary>
    public class QcSectionDetails
    {
        public string QcUndertakenBy { get; set; }
        public string QcOutcome { get; set; }
        public string QcRemarks { get; set; }
    }
}
