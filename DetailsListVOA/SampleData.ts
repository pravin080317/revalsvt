export interface SampleColumnDefinition {
    name: string;
    displayName: string;
    width?: number;
}

// Sample records can include numbers and arrays as provided by API-like payloads
export type SampleRecordValue = string | number | boolean | string[] | number[] | null | undefined;
export type SampleRecord = Record<string, SampleRecordValue>;

export const SAMPLE_COLUMNS: SampleColumnDefinition[] = [
    { name: 'saleid', displayName: 'Sale ID', width: 120 },
    { name: 'taskid', displayName: 'Task ID', width: 120 },
    { name: 'uprn', displayName: 'UPRN', width: 120 },
    { name: 'address', displayName: 'Address', width: 260 },
    { name: 'postcode', displayName: 'Postcode', width: 110 },
    { name: 'billingauthority', displayName: 'Billing Authority', width: 220 },
    { name: 'transactiondate', displayName: 'Transaction Date', width: 160 },
    { name: 'saleprice', displayName: 'Sale Price', width: 120 },
    { name: 'marketvalue', displayName: 'Market Value', width: 140 },
    { name: 'ratio', displayName: 'Ratio', width: 90 },
    { name: 'dwellingtype', displayName: 'Dwelling Type', width: 140 },
    { name: 'flaggedforreview', displayName: 'Flagged for Review', width: 160 },
    { name: 'reviewflags', displayName: 'Review Flags', width: 160 },
    { name: 'outlierratio', displayName: 'Outlier Ratio', width: 130 },
    { name: 'overallflag', displayName: 'Overall Flag', width: 170 },
    { name: 'summaryflags', displayName: 'Summary Flags', width: 160 },
    { name: 'taskstatus', displayName: 'Task Status', width: 140 },
    { name: 'assignedto', displayName: 'Assigned To', width: 140 },
    { name: 'qcassignedto', displayName: 'QC Assigned To', width: 150 },
];

export const SAMPLE_RECORDS: SampleRecord[] = [
  {
    "SaleID": "S000001",
    "TaskID": "T100001",
    "UPRN": "100001238001",
    "Address": "1 Example Road, City 1",
    "Postcode": "CF13 3AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-06-29",
    "SalePrice": 321827,
    "Ratio": 1.08,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.03,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000002",
    "TaskID": "T100002",
    "UPRN": "100001238002",
    "Address": "2 Example Road, City 2",
    "Postcode": "CF28 3AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-02-09",
    "SalePrice": 595875,
    "Ratio": 1.06,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.11,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000003",
    "TaskID": "T100003",
    "UPRN": "100001238003",
    "Address": "3 Example Road, City 3",
    "Postcode": "CF33 9AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-10-28",
    "SalePrice": 352049,
    "Ratio": 0.93,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.15,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000004",
    "TaskID": "T100004",
    "UPRN": "100001238004",
    "Address": "4 Example Road, City 4",
    "Postcode": "CF41 2AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-04-23",
    "SalePrice": 217916,
    "Ratio": 1.13,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.02,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000005",
    "TaskID": "T100005",
    "UPRN": "100001238005",
    "Address": "5 Example Road, City 5",
    "Postcode": "CF51 4AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-11-03",
    "SalePrice": 526975,
    "Ratio": 1.14,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.97,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000006",
    "TaskID": "T100006",
    "UPRN": "100001238006",
    "Address": "6 Example Road, City 6",
    "Postcode": "CF68 2AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-02-03",
    "SalePrice": 147069,
    "Ratio": 0.98,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.97,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000007",
    "TaskID": "T100007",
    "UPRN": "100001238007",
    "Address": "7 Example Road, City 7",
    "Postcode": "CF77 9AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-09-27",
    "SalePrice": 229276,
    "Ratio": 0.96,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.24,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000008",
    "TaskID": "T100008",
    "UPRN": "100001238008",
    "Address": "8 Example Road, City 8",
    "Postcode": "CF83 2AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-10-01",
    "SalePrice": 613274,
    "Ratio": 0.96,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.04,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000009",
    "TaskID": "T100009",
    "UPRN": "100001238009",
    "Address": "9 Example Road, City 9",
    "Postcode": "CF97 9AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-01-12",
    "SalePrice": 215094,
    "Ratio": 1.01,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.01,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000010",
    "TaskID": "T100010",
    "UPRN": "100001238010",
    "Address": "10 Example Road, City 10",
    "Postcode": "CF03 9AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-03-21",
    "SalePrice": 570365,
    "Ratio": 0.91,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.02,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000011",
    "TaskID": "T100011",
    "UPRN": "100001238011",
    "Address": "11 Example Road, City 11",
    "Postcode": "CF19 4AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-03-10",
    "SalePrice": 532886,
    "Ratio": 0.92,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.94,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000012",
    "TaskID": "T100012",
    "UPRN": "100001238012",
    "Address": "12 Example Road, City 12",
    "Postcode": "CF23 1AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-12-18",
    "SalePrice": 625260,
    "Ratio": 1.01,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.07,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000013",
    "TaskID": "T100013",
    "UPRN": "100001238013",
    "Address": "13 Example Road, City 13",
    "Postcode": "CF32 6AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-11-27",
    "SalePrice": 126220,
    "Ratio": 1.07,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.05,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000014",
    "TaskID": "T100014",
    "UPRN": "100001238014",
    "Address": "14 Example Road, City 14",
    "Postcode": "CF48 5AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-04-08",
    "SalePrice": 727231,
    "Ratio": 0.86,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.85,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000015",
    "TaskID": "T100015",
    "UPRN": "100001238015",
    "Address": "15 Example Road, City 15",
    "Postcode": "CF52 3AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-05-19",
    "SalePrice": 617669,
    "Ratio": 0.93,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.98,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000016",
    "TaskID": "T100016",
    "UPRN": "100001238016",
    "Address": "16 Example Road, City 16",
    "Postcode": "CF67 5AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-02-17",
    "SalePrice": 123455,
    "Ratio": 1.01,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.29,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000017",
    "TaskID": "T100017",
    "UPRN": "100001238017",
    "Address": "17 Example Road, City 17",
    "Postcode": "CF75 8AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-08-30",
    "SalePrice": 718717,
    "Ratio": 1.14,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.11,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000018",
    "TaskID": "T100018",
    "UPRN": "100001238018",
    "Address": "18 Example Road, City 18",
    "Postcode": "CF81 2AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-01-01",
    "SalePrice": 516949,
    "Ratio": 0.89,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.08,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000019",
    "TaskID": "T100019",
    "UPRN": "100001238019",
    "Address": "19 Example Road, City 19",
    "Postcode": "CF91 5AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-01-09",
    "SalePrice": 222151,
    "Ratio": 0.88,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.2,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000020",
    "TaskID": "T100020",
    "UPRN": "100001238020",
    "Address": "20 Example Road, City 0",
    "Postcode": "CF04 8AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-01-28",
    "SalePrice": 286687,
    "Ratio": 0.87,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.1,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000021",
    "TaskID": "T100021",
    "UPRN": "100001238021",
    "Address": "21 Example Road, City 1",
    "Postcode": "CF12 8AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-08-01",
    "SalePrice": 125462,
    "Ratio": 1.11,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.08,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000022",
    "TaskID": "T100022",
    "UPRN": "100001238022",
    "Address": "22 Example Road, City 2",
    "Postcode": "CF25 8AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-04-28",
    "SalePrice": 472427,
    "Ratio": 1.01,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.05,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000023",
    "TaskID": "T100023",
    "UPRN": "100001238023",
    "Address": "23 Example Road, City 3",
    "Postcode": "CF32 3AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-02-13",
    "SalePrice": 125000,
    "Ratio": 0.86,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.16,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000024",
    "TaskID": "T100024",
    "UPRN": "100001238024",
    "Address": "24 Example Road, City 4",
    "Postcode": "CF42 3AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-03-07",
    "SalePrice": 737346,
    "Ratio": 0.9,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.06,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000025",
    "TaskID": "T100025",
    "UPRN": "100001238025",
    "Address": "25 Example Road, City 5",
    "Postcode": "CF55 6AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-04-08",
    "SalePrice": 534717,
    "Ratio": 1.1,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.12,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000026",
    "TaskID": "T100026",
    "UPRN": "100001238026",
    "Address": "26 Example Road, City 6",
    "Postcode": "CF67 1AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-06-20",
    "SalePrice": 278303,
    "Ratio": 0.95,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.11,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000027",
    "TaskID": "T100027",
    "UPRN": "100001238027",
    "Address": "27 Example Road, City 7",
    "Postcode": "CF78 6AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-05-13",
    "SalePrice": 553470,
    "Ratio": 1.15,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.03,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000028",
    "TaskID": "T100028",
    "UPRN": "100001238028",
    "Address": "28 Example Road, City 8",
    "Postcode": "CF85 5AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-12-02",
    "SalePrice": 534142,
    "Ratio": 0.92,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.95,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000029",
    "TaskID": "T100029",
    "UPRN": "100001238029",
    "Address": "29 Example Road, City 9",
    "Postcode": "CF97 5AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-02-02",
    "SalePrice": 744193,
    "Ratio": 0.89,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.24,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000030",
    "TaskID": "T100030",
    "UPRN": "100001238030",
    "Address": "30 Example Road, City 10",
    "Postcode": "CF01 9AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-01-26",
    "SalePrice": 221115,
    "Ratio": 0.9,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.26,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000031",
    "TaskID": "T100031",
    "UPRN": "100001238031",
    "Address": "31 Example Road, City 11",
    "Postcode": "CF12 3AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-10-19",
    "SalePrice": 501919,
    "Ratio": 0.91,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.88,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000032",
    "TaskID": "T100032",
    "UPRN": "100001238032",
    "Address": "32 Example Road, City 12",
    "Postcode": "CF24 9AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-02-20",
    "SalePrice": 255167,
    "Ratio": 0.85,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.27,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000033",
    "TaskID": "T100033",
    "UPRN": "100001238033",
    "Address": "33 Example Road, City 13",
    "Postcode": "CF38 5AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-06-07",
    "SalePrice": 360673,
    "Ratio": 1.09,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.12,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000034",
    "TaskID": "T100034",
    "UPRN": "100001238034",
    "Address": "34 Example Road, City 14",
    "Postcode": "CF49 6AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-04-10",
    "SalePrice": 449650,
    "Ratio": 0.91,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.88,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000035",
    "TaskID": "T100035",
    "UPRN": "100001238035",
    "Address": "35 Example Road, City 15",
    "Postcode": "CF52 3AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-02-15",
    "SalePrice": 406726,
    "Ratio": 0.92,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.91,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000036",
    "TaskID": "T100036",
    "UPRN": "100001238036",
    "Address": "36 Example Road, City 16",
    "Postcode": "CF65 2AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-03-07",
    "SalePrice": 724237,
    "Ratio": 1.06,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.29,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000037",
    "TaskID": "T100037",
    "UPRN": "100001238037",
    "Address": "37 Example Road, City 17",
    "Postcode": "CF72 4AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-07-12",
    "SalePrice": 544871,
    "Ratio": 1.12,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.17,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000038",
    "TaskID": "T100038",
    "UPRN": "100001238038",
    "Address": "38 Example Road, City 18",
    "Postcode": "CF86 9AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-07-10",
    "SalePrice": 654621,
    "Ratio": 0.9,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.11,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000039",
    "TaskID": "T100039",
    "UPRN": "100001238039",
    "Address": "39 Example Road, City 19",
    "Postcode": "CF94 9AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-08-08",
    "SalePrice": 442811,
    "Ratio": 1.02,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.23,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000040",
    "TaskID": "T100040",
    "UPRN": "100001238040",
    "Address": "40 Example Road, City 0",
    "Postcode": "CF01 8AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-07-01",
    "SalePrice": 419902,
    "Ratio": 1.04,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.94,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000041",
    "TaskID": "T100041",
    "UPRN": "100001238041",
    "Address": "41 Example Road, City 1",
    "Postcode": "CF14 6AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-04-24",
    "SalePrice": 399374,
    "Ratio": 0.87,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.85,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000042",
    "TaskID": "T100042",
    "UPRN": "100001238042",
    "Address": "42 Example Road, City 2",
    "Postcode": "CF23 8AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-05-25",
    "SalePrice": 164998,
    "Ratio": 0.93,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.15,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000043",
    "TaskID": "T100043",
    "UPRN": "100001238043",
    "Address": "43 Example Road, City 3",
    "Postcode": "CF35 2AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-09-09",
    "SalePrice": 406450,
    "Ratio": 0.98,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.84,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000044",
    "TaskID": "T100044",
    "UPRN": "100001238044",
    "Address": "44 Example Road, City 4",
    "Postcode": "CF46 6AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-02-15",
    "SalePrice": 711657,
    "Ratio": 1.12,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.27,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000045",
    "TaskID": "T100045",
    "UPRN": "100001238045",
    "Address": "45 Example Road, City 5",
    "Postcode": "CF55 8AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-06-25",
    "SalePrice": 271671,
    "Ratio": 1.13,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.18,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000046",
    "TaskID": "T100046",
    "UPRN": "100001238046",
    "Address": "46 Example Road, City 6",
    "Postcode": "CF63 2AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-12-21",
    "SalePrice": 352918,
    "Ratio": 1.08,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.92,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000047",
    "TaskID": "T100047",
    "UPRN": "100001238047",
    "Address": "47 Example Road, City 7",
    "Postcode": "CF71 4AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-07-31",
    "SalePrice": 369475,
    "Ratio": 0.96,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.19,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000048",
    "TaskID": "T100048",
    "UPRN": "100001238048",
    "Address": "48 Example Road, City 8",
    "Postcode": "CF88 8AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-09-15",
    "SalePrice": 571802,
    "Ratio": 1.05,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.98,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000049",
    "TaskID": "T100049",
    "UPRN": "100001238049",
    "Address": "49 Example Road, City 9",
    "Postcode": "CF92 8AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-05-29",
    "SalePrice": 157592,
    "Ratio": 0.91,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.03,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000050",
    "TaskID": "T100050",
    "UPRN": "100001238050",
    "Address": "50 Example Road, City 10",
    "Postcode": "CF07 4AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-12-02",
    "SalePrice": 734175,
    "Ratio": 0.86,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.92,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000051",
    "TaskID": "T100051",
    "UPRN": "100001238051",
    "Address": "51 Example Road, City 11",
    "Postcode": "CF14 5AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-12-10",
    "SalePrice": 662018,
    "Ratio": 0.96,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.02,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000052",
    "TaskID": "T100052",
    "UPRN": "100001238052",
    "Address": "52 Example Road, City 12",
    "Postcode": "CF28 7AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-07-13",
    "SalePrice": 175883,
    "Ratio": 0.9,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.2,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000053",
    "TaskID": "T100053",
    "UPRN": "100001238053",
    "Address": "53 Example Road, City 13",
    "Postcode": "CF34 2AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-12-24",
    "SalePrice": 500292,
    "Ratio": 0.94,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.81,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000054",
    "TaskID": "T100054",
    "UPRN": "100001238054",
    "Address": "54 Example Road, City 14",
    "Postcode": "CF42 4AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-04-08",
    "SalePrice": 243497,
    "Ratio": 1.13,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.05,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000055",
    "TaskID": "T100055",
    "UPRN": "100001238055",
    "Address": "55 Example Road, City 15",
    "Postcode": "CF57 1AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-02-20",
    "SalePrice": 420698,
    "Ratio": 1.13,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.95,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000056",
    "TaskID": "T100056",
    "UPRN": "100001238056",
    "Address": "56 Example Road, City 16",
    "Postcode": "CF62 2AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-11-30",
    "SalePrice": 475265,
    "Ratio": 0.9,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.14,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000057",
    "TaskID": "T100057",
    "UPRN": "100001238057",
    "Address": "57 Example Road, City 17",
    "Postcode": "CF75 9AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-10-15",
    "SalePrice": 177690,
    "Ratio": 0.9,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.15,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000058",
    "TaskID": "T100058",
    "UPRN": "100001238058",
    "Address": "58 Example Road, City 18",
    "Postcode": "CF82 8AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-05-14",
    "SalePrice": 197276,
    "Ratio": 1.05,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.97,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000059",
    "TaskID": "T100059",
    "UPRN": "100001238059",
    "Address": "59 Example Road, City 19",
    "Postcode": "CF94 2AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-01-16",
    "SalePrice": 347681,
    "Ratio": 1.04,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.27,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000060",
    "TaskID": "T100060",
    "UPRN": "100001238060",
    "Address": "60 Example Road, City 0",
    "Postcode": "CF04 2AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-05-22",
    "SalePrice": 674508,
    "Ratio": 0.87,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.25,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000061",
    "TaskID": "T100061",
    "UPRN": "100001238061",
    "Address": "61 Example Road, City 1",
    "Postcode": "CF15 9AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-03-19",
    "SalePrice": 160633,
    "Ratio": 1.04,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.97,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000062",
    "TaskID": "T100062",
    "UPRN": "100001238062",
    "Address": "62 Example Road, City 2",
    "Postcode": "CF29 6AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-06-23",
    "SalePrice": 311323,
    "Ratio": 1.01,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.86,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000063",
    "TaskID": "T100063",
    "UPRN": "100001238063",
    "Address": "63 Example Road, City 3",
    "Postcode": "CF37 1AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-10-29",
    "SalePrice": 596652,
    "Ratio": 0.96,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.85,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000064",
    "TaskID": "T100064",
    "UPRN": "100001238064",
    "Address": "64 Example Road, City 4",
    "Postcode": "CF45 6AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-10-05",
    "SalePrice": 505663,
    "Ratio": 1.01,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.94,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000065",
    "TaskID": "T100065",
    "UPRN": "100001238065",
    "Address": "65 Example Road, City 5",
    "Postcode": "CF52 7AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-03-02",
    "SalePrice": 215439,
    "Ratio": 1.15,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.1,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000066",
    "TaskID": "T100066",
    "UPRN": "100001238066",
    "Address": "66 Example Road, City 6",
    "Postcode": "CF67 5AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-08-22",
    "SalePrice": 313456,
    "Ratio": 0.89,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.04,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000067",
    "TaskID": "T100067",
    "UPRN": "100001238067",
    "Address": "67 Example Road, City 7",
    "Postcode": "CF76 8AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-05-19",
    "SalePrice": 451252,
    "Ratio": 1.03,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.98,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000068",
    "TaskID": "T100068",
    "UPRN": "100001238068",
    "Address": "68 Example Road, City 8",
    "Postcode": "CF84 2AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-09-13",
    "SalePrice": 647344,
    "Ratio": 1.0,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.03,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000069",
    "TaskID": "T100069",
    "UPRN": "100001238069",
    "Address": "69 Example Road, City 9",
    "Postcode": "CF96 4AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-01-05",
    "SalePrice": 542007,
    "Ratio": 1.03,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.86,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000070",
    "TaskID": "T100070",
    "UPRN": "100001238070",
    "Address": "70 Example Road, City 10",
    "Postcode": "CF05 9AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-02-15",
    "SalePrice": 218996,
    "Ratio": 1.07,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.91,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000071",
    "TaskID": "T100071",
    "UPRN": "100001238071",
    "Address": "71 Example Road, City 11",
    "Postcode": "CF12 5AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-02-25",
    "SalePrice": 213608,
    "Ratio": 1.02,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.03,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000072",
    "TaskID": "T100072",
    "UPRN": "100001238072",
    "Address": "72 Example Road, City 12",
    "Postcode": "CF27 5AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-07-25",
    "SalePrice": 456203,
    "Ratio": 1.03,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.22,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000073",
    "TaskID": "T100073",
    "UPRN": "100001238073",
    "Address": "73 Example Road, City 13",
    "Postcode": "CF37 2AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-10-06",
    "SalePrice": 625708,
    "Ratio": 1.06,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.11,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000074",
    "TaskID": "T100074",
    "UPRN": "100001238074",
    "Address": "74 Example Road, City 14",
    "Postcode": "CF46 6AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-11-13",
    "SalePrice": 367857,
    "Ratio": 1.08,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.89,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000075",
    "TaskID": "T100075",
    "UPRN": "100001238075",
    "Address": "75 Example Road, City 15",
    "Postcode": "CF56 9AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-09-16",
    "SalePrice": 194221,
    "Ratio": 1.14,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.98,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000076",
    "TaskID": "T100076",
    "UPRN": "100001238076",
    "Address": "76 Example Road, City 16",
    "Postcode": "CF62 5AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-02-20",
    "SalePrice": 595106,
    "Ratio": 0.94,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.8,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000077",
    "TaskID": "T100077",
    "UPRN": "100001238077",
    "Address": "77 Example Road, City 17",
    "Postcode": "CF78 3AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-02-17",
    "SalePrice": 280543,
    "Ratio": 0.98,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.21,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000078",
    "TaskID": "T100078",
    "UPRN": "100001238078",
    "Address": "78 Example Road, City 18",
    "Postcode": "CF89 9AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-05-11",
    "SalePrice": 407241,
    "Ratio": 1.13,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.93,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000079",
    "TaskID": "T100079",
    "UPRN": "100001238079",
    "Address": "79 Example Road, City 19",
    "Postcode": "CF99 6AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-10-03",
    "SalePrice": 286924,
    "Ratio": 0.91,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.27,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000080",
    "TaskID": "T100080",
    "UPRN": "100001238080",
    "Address": "80 Example Road, City 0",
    "Postcode": "CF02 5AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-10-23",
    "SalePrice": 573731,
    "Ratio": 0.97,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.27,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000081",
    "TaskID": "T100081",
    "UPRN": "100001238081",
    "Address": "81 Example Road, City 1",
    "Postcode": "CF18 6AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-11-28",
    "SalePrice": 462944,
    "Ratio": 0.89,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.84,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000082",
    "TaskID": "T100082",
    "UPRN": "100001238082",
    "Address": "82 Example Road, City 2",
    "Postcode": "CF29 4AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-11-03",
    "SalePrice": 531646,
    "Ratio": 1.14,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.21,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000083",
    "TaskID": "T100083",
    "UPRN": "100001238083",
    "Address": "83 Example Road, City 3",
    "Postcode": "CF34 6AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-03-12",
    "SalePrice": 383819,
    "Ratio": 1.04,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.84,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000084",
    "TaskID": "T100084",
    "UPRN": "100001238084",
    "Address": "84 Example Road, City 4",
    "Postcode": "CF43 7AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-08-27",
    "SalePrice": 509837,
    "Ratio": 0.87,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.08,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000085",
    "TaskID": "T100085",
    "UPRN": "100001238085",
    "Address": "85 Example Road, City 5",
    "Postcode": "CF56 2AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-12-30",
    "SalePrice": 476274,
    "Ratio": 1.11,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.07,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000086",
    "TaskID": "T100086",
    "UPRN": "100001238086",
    "Address": "86 Example Road, City 6",
    "Postcode": "CF63 4AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-03-08",
    "SalePrice": 461918,
    "Ratio": 0.88,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.18,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000087",
    "TaskID": "T100087",
    "UPRN": "100001238087",
    "Address": "87 Example Road, City 7",
    "Postcode": "CF73 6AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-08-25",
    "SalePrice": 303536,
    "Ratio": 1.05,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.05,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000088",
    "TaskID": "T100088",
    "UPRN": "100001238088",
    "Address": "88 Example Road, City 8",
    "Postcode": "CF88 9AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-08-13",
    "SalePrice": 170686,
    "Ratio": 0.88,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.12,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000089",
    "TaskID": "T100089",
    "UPRN": "100001238089",
    "Address": "89 Example Road, City 9",
    "Postcode": "CF93 1AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-09-10",
    "SalePrice": 396261,
    "Ratio": 1.0,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.93,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000090",
    "TaskID": "T100090",
    "UPRN": "100001238090",
    "Address": "90 Example Road, City 10",
    "Postcode": "CF03 2AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-03-25",
    "SalePrice": 550669,
    "Ratio": 1.05,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.23,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000091",
    "TaskID": "T100091",
    "UPRN": "100001238091",
    "Address": "91 Example Road, City 11",
    "Postcode": "CF12 1AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-02-19",
    "SalePrice": 659541,
    "Ratio": 0.89,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.86,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000092",
    "TaskID": "T100092",
    "UPRN": "100001238092",
    "Address": "92 Example Road, City 12",
    "Postcode": "CF25 3AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-07-22",
    "SalePrice": 513776,
    "Ratio": 0.93,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.09,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000093",
    "TaskID": "T100093",
    "UPRN": "100001238093",
    "Address": "93 Example Road, City 13",
    "Postcode": "CF32 7AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-04-20",
    "SalePrice": 654513,
    "Ratio": 1.12,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.16,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000094",
    "TaskID": "T100094",
    "UPRN": "100001238094",
    "Address": "94 Example Road, City 14",
    "Postcode": "CF48 9AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-10-26",
    "SalePrice": 138685,
    "Ratio": 1.05,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.82,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000095",
    "TaskID": "T100095",
    "UPRN": "100001238095",
    "Address": "95 Example Road, City 15",
    "Postcode": "CF59 2AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-09-05",
    "SalePrice": 627198,
    "Ratio": 1.0,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.84,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000096",
    "TaskID": "T100096",
    "UPRN": "100001238096",
    "Address": "96 Example Road, City 16",
    "Postcode": "CF66 3AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-08-08",
    "SalePrice": 701701,
    "Ratio": 0.9,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.04,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000097",
    "TaskID": "T100097",
    "UPRN": "100001238097",
    "Address": "97 Example Road, City 17",
    "Postcode": "CF77 6AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-10-05",
    "SalePrice": 489020,
    "Ratio": 0.93,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.08,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000098",
    "TaskID": "T100098",
    "UPRN": "100001238098",
    "Address": "98 Example Road, City 18",
    "Postcode": "CF86 8AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-10-30",
    "SalePrice": 148791,
    "Ratio": 0.98,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.81,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000099",
    "TaskID": "T100099",
    "UPRN": "100001238099",
    "Address": "99 Example Road, City 19",
    "Postcode": "CF93 6AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-12-24",
    "SalePrice": 276093,
    "Ratio": 1.04,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.22,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000100",
    "TaskID": "T100100",
    "UPRN": "100001238100",
    "Address": "100 Example Road, City 0",
    "Postcode": "CF01 9AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-05-14",
    "SalePrice": 404790,
    "Ratio": 1.07,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.2,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000101",
    "TaskID": "T100101",
    "UPRN": "100001238101",
    "Address": "101 Example Road, City 1",
    "Postcode": "CF17 4AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-09-01",
    "SalePrice": 738015,
    "Ratio": 0.89,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.86,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000102",
    "TaskID": "T100102",
    "UPRN": "100001238102",
    "Address": "102 Example Road, City 2",
    "Postcode": "CF21 9AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-10-30",
    "SalePrice": 460078,
    "Ratio": 0.91,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.13,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000103",
    "TaskID": "T100103",
    "UPRN": "100001238103",
    "Address": "103 Example Road, City 3",
    "Postcode": "CF32 4AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-06-04",
    "SalePrice": 693401,
    "Ratio": 1.09,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.17,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000104",
    "TaskID": "T100104",
    "UPRN": "100001238104",
    "Address": "104 Example Road, City 4",
    "Postcode": "CF41 8AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-06-02",
    "SalePrice": 416249,
    "Ratio": 0.88,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.29,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000105",
    "TaskID": "T100105",
    "UPRN": "100001238105",
    "Address": "105 Example Road, City 5",
    "Postcode": "CF58 5AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-03-13",
    "SalePrice": 379208,
    "Ratio": 0.89,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.22,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000106",
    "TaskID": "T100106",
    "UPRN": "100001238106",
    "Address": "106 Example Road, City 6",
    "Postcode": "CF61 5AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-06-14",
    "SalePrice": 391308,
    "Ratio": 0.91,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.16,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000107",
    "TaskID": "T100107",
    "UPRN": "100001238107",
    "Address": "107 Example Road, City 7",
    "Postcode": "CF71 9AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-01-24",
    "SalePrice": 644614,
    "Ratio": 1.04,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.95,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000108",
    "TaskID": "T100108",
    "UPRN": "100001238108",
    "Address": "108 Example Road, City 8",
    "Postcode": "CF86 4AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-04-24",
    "SalePrice": 700576,
    "Ratio": 0.97,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.84,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000109",
    "TaskID": "T100109",
    "UPRN": "100001238109",
    "Address": "109 Example Road, City 9",
    "Postcode": "CF94 3AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-10-08",
    "SalePrice": 368846,
    "Ratio": 0.9,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.27,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000110",
    "TaskID": "T100110",
    "UPRN": "100001238110",
    "Address": "110 Example Road, City 10",
    "Postcode": "CF07 3AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-08-16",
    "SalePrice": 199689,
    "Ratio": 1.09,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.18,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000111",
    "TaskID": "T100111",
    "UPRN": "100001238111",
    "Address": "111 Example Road, City 11",
    "Postcode": "CF13 6AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-09-18",
    "SalePrice": 211053,
    "Ratio": 1.12,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.0,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000112",
    "TaskID": "T100112",
    "UPRN": "100001238112",
    "Address": "112 Example Road, City 12",
    "Postcode": "CF26 4AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-06-16",
    "SalePrice": 666362,
    "Ratio": 1.08,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.08,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000113",
    "TaskID": "T100113",
    "UPRN": "100001238113",
    "Address": "113 Example Road, City 13",
    "Postcode": "CF32 3AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-11-15",
    "SalePrice": 363112,
    "Ratio": 1.12,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.05,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000114",
    "TaskID": "T100114",
    "UPRN": "100001238114",
    "Address": "114 Example Road, City 14",
    "Postcode": "CF46 8AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-01-09",
    "SalePrice": 209496,
    "Ratio": 0.94,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.14,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000115",
    "TaskID": "T100115",
    "UPRN": "100001238115",
    "Address": "115 Example Road, City 15",
    "Postcode": "CF59 5AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-09-14",
    "SalePrice": 499791,
    "Ratio": 0.87,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.09,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000116",
    "TaskID": "T100116",
    "UPRN": "100001238116",
    "Address": "116 Example Road, City 16",
    "Postcode": "CF66 7AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-07-15",
    "SalePrice": 683434,
    "Ratio": 1.06,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.9,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000117",
    "TaskID": "T100117",
    "UPRN": "100001238117",
    "Address": "117 Example Road, City 17",
    "Postcode": "CF78 7AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-05-26",
    "SalePrice": 299112,
    "Ratio": 0.96,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.99,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000118",
    "TaskID": "T100118",
    "UPRN": "100001238118",
    "Address": "118 Example Road, City 18",
    "Postcode": "CF87 4AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-10-30",
    "SalePrice": 511279,
    "Ratio": 1.09,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.91,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000119",
    "TaskID": "T100119",
    "UPRN": "100001238119",
    "Address": "119 Example Road, City 19",
    "Postcode": "CF93 6AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-09-16",
    "SalePrice": 258873,
    "Ratio": 0.92,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.24,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000120",
    "TaskID": "T100120",
    "UPRN": "100001238120",
    "Address": "120 Example Road, City 0",
    "Postcode": "CF09 2AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-10-08",
    "SalePrice": 471750,
    "Ratio": 0.93,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.03,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000121",
    "TaskID": "T100121",
    "UPRN": "100001238121",
    "Address": "121 Example Road, City 1",
    "Postcode": "CF16 8AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-07-31",
    "SalePrice": 434270,
    "Ratio": 0.88,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.09,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000122",
    "TaskID": "T100122",
    "UPRN": "100001238122",
    "Address": "122 Example Road, City 2",
    "Postcode": "CF23 3AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-11-01",
    "SalePrice": 651184,
    "Ratio": 1.01,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.07,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000123",
    "TaskID": "T100123",
    "UPRN": "100001238123",
    "Address": "123 Example Road, City 3",
    "Postcode": "CF35 1AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-10-15",
    "SalePrice": 547169,
    "Ratio": 0.95,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.89,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000124",
    "TaskID": "T100124",
    "UPRN": "100001238124",
    "Address": "124 Example Road, City 4",
    "Postcode": "CF47 8AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-12-13",
    "SalePrice": 376293,
    "Ratio": 1.14,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.89,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000125",
    "TaskID": "T100125",
    "UPRN": "100001238125",
    "Address": "125 Example Road, City 5",
    "Postcode": "CF53 2AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-04-19",
    "SalePrice": 219451,
    "Ratio": 1.02,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.99,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000126",
    "TaskID": "T100126",
    "UPRN": "100001238126",
    "Address": "126 Example Road, City 6",
    "Postcode": "CF65 5AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-11-29",
    "SalePrice": 289949,
    "Ratio": 1.12,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.99,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000127",
    "TaskID": "T100127",
    "UPRN": "100001238127",
    "Address": "127 Example Road, City 7",
    "Postcode": "CF78 5AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-06-06",
    "SalePrice": 712312,
    "Ratio": 0.94,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.89,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000128",
    "TaskID": "T100128",
    "UPRN": "100001238128",
    "Address": "128 Example Road, City 8",
    "Postcode": "CF82 7AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-10-21",
    "SalePrice": 530934,
    "Ratio": 0.94,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.82,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000129",
    "TaskID": "T100129",
    "UPRN": "100001238129",
    "Address": "129 Example Road, City 9",
    "Postcode": "CF95 2AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-10-15",
    "SalePrice": 347852,
    "Ratio": 1.15,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.15,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000130",
    "TaskID": "T100130",
    "UPRN": "100001238130",
    "Address": "130 Example Road, City 10",
    "Postcode": "CF08 6AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-05-12",
    "SalePrice": 231635,
    "Ratio": 0.99,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.03,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000131",
    "TaskID": "T100131",
    "UPRN": "100001238131",
    "Address": "131 Example Road, City 11",
    "Postcode": "CF15 4AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-02-07",
    "SalePrice": 203784,
    "Ratio": 0.93,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.2,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000132",
    "TaskID": "T100132",
    "UPRN": "100001238132",
    "Address": "132 Example Road, City 12",
    "Postcode": "CF25 6AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-07-23",
    "SalePrice": 231749,
    "Ratio": 1.04,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.91,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000133",
    "TaskID": "T100133",
    "UPRN": "100001238133",
    "Address": "133 Example Road, City 13",
    "Postcode": "CF36 6AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-12-25",
    "SalePrice": 710087,
    "Ratio": 1.13,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.2,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000134",
    "TaskID": "T100134",
    "UPRN": "100001238134",
    "Address": "134 Example Road, City 14",
    "Postcode": "CF48 5AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-09-10",
    "SalePrice": 499548,
    "Ratio": 1.11,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.91,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000135",
    "TaskID": "T100135",
    "UPRN": "100001238135",
    "Address": "135 Example Road, City 15",
    "Postcode": "CF55 1AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-04-06",
    "SalePrice": 130373,
    "Ratio": 1.0,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.07,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000136",
    "TaskID": "T100136",
    "UPRN": "100001238136",
    "Address": "136 Example Road, City 16",
    "Postcode": "CF63 1AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-07-25",
    "SalePrice": 615622,
    "Ratio": 1.12,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.97,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000137",
    "TaskID": "T100137",
    "UPRN": "100001238137",
    "Address": "137 Example Road, City 17",
    "Postcode": "CF78 4AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-01-02",
    "SalePrice": 123955,
    "Ratio": 0.92,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.24,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000138",
    "TaskID": "T100138",
    "UPRN": "100001238138",
    "Address": "138 Example Road, City 18",
    "Postcode": "CF88 4AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-12-07",
    "SalePrice": 249333,
    "Ratio": 0.87,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.98,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000139",
    "TaskID": "T100139",
    "UPRN": "100001238139",
    "Address": "139 Example Road, City 19",
    "Postcode": "CF94 4AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-05-01",
    "SalePrice": 558070,
    "Ratio": 0.86,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.02,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000140",
    "TaskID": "T100140",
    "UPRN": "100001238140",
    "Address": "140 Example Road, City 0",
    "Postcode": "CF09 7AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-08-27",
    "SalePrice": 310230,
    "Ratio": 0.86,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.2,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000141",
    "TaskID": "T100141",
    "UPRN": "100001238141",
    "Address": "141 Example Road, City 1",
    "Postcode": "CF14 9AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-06-11",
    "SalePrice": 622170,
    "Ratio": 0.91,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.21,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000142",
    "TaskID": "T100142",
    "UPRN": "100001238142",
    "Address": "142 Example Road, City 2",
    "Postcode": "CF22 8AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-01-18",
    "SalePrice": 554822,
    "Ratio": 1.06,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.13,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000143",
    "TaskID": "T100143",
    "UPRN": "100001238143",
    "Address": "143 Example Road, City 3",
    "Postcode": "CF37 6AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-07-03",
    "SalePrice": 393540,
    "Ratio": 1.06,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.98,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000144",
    "TaskID": "T100144",
    "UPRN": "100001238144",
    "Address": "144 Example Road, City 4",
    "Postcode": "CF49 9AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-03-21",
    "SalePrice": 598980,
    "Ratio": 0.96,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.08,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000145",
    "TaskID": "T100145",
    "UPRN": "100001238145",
    "Address": "145 Example Road, City 5",
    "Postcode": "CF57 3AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-08-18",
    "SalePrice": 480030,
    "Ratio": 0.93,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.87,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000146",
    "TaskID": "T100146",
    "UPRN": "100001238146",
    "Address": "146 Example Road, City 6",
    "Postcode": "CF63 5AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-09-29",
    "SalePrice": 592532,
    "Ratio": 0.9,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.98,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000147",
    "TaskID": "T100147",
    "UPRN": "100001238147",
    "Address": "147 Example Road, City 7",
    "Postcode": "CF75 1AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-08-11",
    "SalePrice": 558745,
    "Ratio": 1.13,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.28,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000148",
    "TaskID": "T100148",
    "UPRN": "100001238148",
    "Address": "148 Example Road, City 8",
    "Postcode": "CF89 8AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-10-06",
    "SalePrice": 381586,
    "Ratio": 1.07,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.03,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000149",
    "TaskID": "T100149",
    "UPRN": "100001238149",
    "Address": "149 Example Road, City 9",
    "Postcode": "CF91 4AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-05-11",
    "SalePrice": 561997,
    "Ratio": 0.95,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.15,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000150",
    "TaskID": "T100150",
    "UPRN": "100001238150",
    "Address": "150 Example Road, City 10",
    "Postcode": "CF07 4AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-01-19",
    "SalePrice": 361999,
    "Ratio": 0.95,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.18,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000151",
    "TaskID": "T100151",
    "UPRN": "100001238151",
    "Address": "151 Example Road, City 11",
    "Postcode": "CF15 3AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-09-01",
    "SalePrice": 414153,
    "Ratio": 1.1,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.83,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000152",
    "TaskID": "T100152",
    "UPRN": "100001238152",
    "Address": "152 Example Road, City 12",
    "Postcode": "CF23 9AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-01-15",
    "SalePrice": 619355,
    "Ratio": 1.05,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.87,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000153",
    "TaskID": "T100153",
    "UPRN": "100001238153",
    "Address": "153 Example Road, City 13",
    "Postcode": "CF32 5AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-09-22",
    "SalePrice": 331908,
    "Ratio": 0.93,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.87,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000154",
    "TaskID": "T100154",
    "UPRN": "100001238154",
    "Address": "154 Example Road, City 14",
    "Postcode": "CF41 6AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-07-12",
    "SalePrice": 218204,
    "Ratio": 0.95,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.9,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000155",
    "TaskID": "T100155",
    "UPRN": "100001238155",
    "Address": "155 Example Road, City 15",
    "Postcode": "CF56 3AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-09-20",
    "SalePrice": 203694,
    "Ratio": 1.09,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.28,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000156",
    "TaskID": "T100156",
    "UPRN": "100001238156",
    "Address": "156 Example Road, City 16",
    "Postcode": "CF67 4AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-07-03",
    "SalePrice": 534471,
    "Ratio": 1.12,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.1,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000157",
    "TaskID": "T100157",
    "UPRN": "100001238157",
    "Address": "157 Example Road, City 17",
    "Postcode": "CF75 1AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-01-19",
    "SalePrice": 445496,
    "Ratio": 1.15,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.89,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000158",
    "TaskID": "T100158",
    "UPRN": "100001238158",
    "Address": "158 Example Road, City 18",
    "Postcode": "CF84 8AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-04-16",
    "SalePrice": 334222,
    "Ratio": 1.02,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.87,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000159",
    "TaskID": "T100159",
    "UPRN": "100001238159",
    "Address": "159 Example Road, City 19",
    "Postcode": "CF96 9AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-02-14",
    "SalePrice": 601014,
    "Ratio": 0.87,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.14,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000160",
    "TaskID": "T100160",
    "UPRN": "100001238160",
    "Address": "160 Example Road, City 0",
    "Postcode": "CF01 4AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-05-22",
    "SalePrice": 482102,
    "Ratio": 0.89,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.82,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000161",
    "TaskID": "T100161",
    "UPRN": "100001238161",
    "Address": "161 Example Road, City 1",
    "Postcode": "CF12 2AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-07-11",
    "SalePrice": 217747,
    "Ratio": 1.11,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.93,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000162",
    "TaskID": "T100162",
    "UPRN": "100001238162",
    "Address": "162 Example Road, City 2",
    "Postcode": "CF27 9AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-10-02",
    "SalePrice": 425597,
    "Ratio": 1.01,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.92,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000163",
    "TaskID": "T100163",
    "UPRN": "100001238163",
    "Address": "163 Example Road, City 3",
    "Postcode": "CF31 2AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-02-08",
    "SalePrice": 424647,
    "Ratio": 1.09,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.11,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000164",
    "TaskID": "T100164",
    "UPRN": "100001238164",
    "Address": "164 Example Road, City 4",
    "Postcode": "CF45 4AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-06-18",
    "SalePrice": 388835,
    "Ratio": 0.99,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.84,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000165",
    "TaskID": "T100165",
    "UPRN": "100001238165",
    "Address": "165 Example Road, City 5",
    "Postcode": "CF56 9AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-04-18",
    "SalePrice": 584428,
    "Ratio": 0.96,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.92,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000166",
    "TaskID": "T100166",
    "UPRN": "100001238166",
    "Address": "166 Example Road, City 6",
    "Postcode": "CF64 1AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-06-14",
    "SalePrice": 420840,
    "Ratio": 1.08,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.12,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000167",
    "TaskID": "T100167",
    "UPRN": "100001238167",
    "Address": "167 Example Road, City 7",
    "Postcode": "CF76 8AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-10-20",
    "SalePrice": 205293,
    "Ratio": 1.0,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.15,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000168",
    "TaskID": "T100168",
    "UPRN": "100001238168",
    "Address": "168 Example Road, City 8",
    "Postcode": "CF86 2AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-07-26",
    "SalePrice": 585110,
    "Ratio": 0.86,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.26,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000169",
    "TaskID": "T100169",
    "UPRN": "100001238169",
    "Address": "169 Example Road, City 9",
    "Postcode": "CF99 6AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-09-13",
    "SalePrice": 579723,
    "Ratio": 1.02,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.87,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000170",
    "TaskID": "T100170",
    "UPRN": "100001238170",
    "Address": "170 Example Road, City 10",
    "Postcode": "CF02 2AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-11-06",
    "SalePrice": 516579,
    "Ratio": 0.87,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.9,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000171",
    "TaskID": "T100171",
    "UPRN": "100001238171",
    "Address": "171 Example Road, City 11",
    "Postcode": "CF11 4AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-02-24",
    "SalePrice": 549497,
    "Ratio": 0.98,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.9,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000172",
    "TaskID": "T100172",
    "UPRN": "100001238172",
    "Address": "172 Example Road, City 12",
    "Postcode": "CF27 5AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-06-12",
    "SalePrice": 178857,
    "Ratio": 0.96,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.07,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000173",
    "TaskID": "T100173",
    "UPRN": "100001238173",
    "Address": "173 Example Road, City 13",
    "Postcode": "CF38 3AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-01-31",
    "SalePrice": 420939,
    "Ratio": 1.0,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.26,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000174",
    "TaskID": "T100174",
    "UPRN": "100001238174",
    "Address": "174 Example Road, City 14",
    "Postcode": "CF43 7AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-08-23",
    "SalePrice": 362283,
    "Ratio": 1.08,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.27,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000175",
    "TaskID": "T100175",
    "UPRN": "100001238175",
    "Address": "175 Example Road, City 15",
    "Postcode": "CF53 9AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-10-31",
    "SalePrice": 227806,
    "Ratio": 0.95,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.85,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000176",
    "TaskID": "T100176",
    "UPRN": "100001238176",
    "Address": "176 Example Road, City 16",
    "Postcode": "CF65 4AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-01-08",
    "SalePrice": 676477,
    "Ratio": 0.96,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.11,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000177",
    "TaskID": "T100177",
    "UPRN": "100001238177",
    "Address": "177 Example Road, City 17",
    "Postcode": "CF77 9AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-05-06",
    "SalePrice": 330177,
    "Ratio": 0.94,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.8,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000178",
    "TaskID": "T100178",
    "UPRN": "100001238178",
    "Address": "178 Example Road, City 18",
    "Postcode": "CF87 6AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-10-25",
    "SalePrice": 390162,
    "Ratio": 0.91,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.91,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000179",
    "TaskID": "T100179",
    "UPRN": "100001238179",
    "Address": "179 Example Road, City 19",
    "Postcode": "CF98 2AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-03-22",
    "SalePrice": 409618,
    "Ratio": 0.93,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.04,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000180",
    "TaskID": "T100180",
    "UPRN": "100001238180",
    "Address": "180 Example Road, City 0",
    "Postcode": "CF05 1AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-12-09",
    "SalePrice": 318640,
    "Ratio": 1.07,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.15,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000181",
    "TaskID": "T100181",
    "UPRN": "100001238181",
    "Address": "181 Example Road, City 1",
    "Postcode": "CF19 3AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-07-09",
    "SalePrice": 335866,
    "Ratio": 0.88,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.82,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000182",
    "TaskID": "T100182",
    "UPRN": "100001238182",
    "Address": "182 Example Road, City 2",
    "Postcode": "CF22 1AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-09-16",
    "SalePrice": 256230,
    "Ratio": 1.14,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.84,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000183",
    "TaskID": "T100183",
    "UPRN": "100001238183",
    "Address": "183 Example Road, City 3",
    "Postcode": "CF38 9AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-01-23",
    "SalePrice": 677761,
    "Ratio": 0.88,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.98,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000184",
    "TaskID": "T100184",
    "UPRN": "100001238184",
    "Address": "184 Example Road, City 4",
    "Postcode": "CF43 7AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-05-19",
    "SalePrice": 556103,
    "Ratio": 0.98,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.14,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000185",
    "TaskID": "T100185",
    "UPRN": "100001238185",
    "Address": "185 Example Road, City 5",
    "Postcode": "CF59 2AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-07-05",
    "SalePrice": 184121,
    "Ratio": 0.95,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.19,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000186",
    "TaskID": "T100186",
    "UPRN": "100001238186",
    "Address": "186 Example Road, City 6",
    "Postcode": "CF69 4AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-05-25",
    "SalePrice": 546159,
    "Ratio": 0.86,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.17,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000187",
    "TaskID": "T100187",
    "UPRN": "100001238187",
    "Address": "187 Example Road, City 7",
    "Postcode": "CF74 6AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-06-30",
    "SalePrice": 125240,
    "Ratio": 0.96,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.18,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000188",
    "TaskID": "T100188",
    "UPRN": "100001238188",
    "Address": "188 Example Road, City 8",
    "Postcode": "CF86 4AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-11-18",
    "SalePrice": 123581,
    "Ratio": 1.12,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.95,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000189",
    "TaskID": "T100189",
    "UPRN": "100001238189",
    "Address": "189 Example Road, City 9",
    "Postcode": "CF97 8AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-01-17",
    "SalePrice": 240558,
    "Ratio": 1.1,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.85,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000190",
    "TaskID": "T100190",
    "UPRN": "100001238190",
    "Address": "190 Example Road, City 10",
    "Postcode": "CF04 2AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-07-28",
    "SalePrice": 524030,
    "Ratio": 1.05,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.96,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000191",
    "TaskID": "T100191",
    "UPRN": "100001238191",
    "Address": "191 Example Road, City 11",
    "Postcode": "CF14 2AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-10-18",
    "SalePrice": 657048,
    "Ratio": 1.15,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.12,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000192",
    "TaskID": "T100192",
    "UPRN": "100001238192",
    "Address": "192 Example Road, City 12",
    "Postcode": "CF24 7AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-05-19",
    "SalePrice": 610631,
    "Ratio": 0.9,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.88,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000193",
    "TaskID": "T100193",
    "UPRN": "100001238193",
    "Address": "193 Example Road, City 13",
    "Postcode": "CF31 1AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-06-29",
    "SalePrice": 716599,
    "Ratio": 0.94,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.9,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000194",
    "TaskID": "T100194",
    "UPRN": "100001238194",
    "Address": "194 Example Road, City 14",
    "Postcode": "CF47 4AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-01-02",
    "SalePrice": 403475,
    "Ratio": 0.96,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.81,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000195",
    "TaskID": "T100195",
    "UPRN": "100001238195",
    "Address": "195 Example Road, City 15",
    "Postcode": "CF57 5AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-11-20",
    "SalePrice": 400799,
    "Ratio": 1.14,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.19,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000196",
    "TaskID": "T100196",
    "UPRN": "100001238196",
    "Address": "196 Example Road, City 16",
    "Postcode": "CF68 3AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-12-21",
    "SalePrice": 273997,
    "Ratio": 0.97,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.82,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000197",
    "TaskID": "T100197",
    "UPRN": "100001238197",
    "Address": "197 Example Road, City 17",
    "Postcode": "CF74 4AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-04-23",
    "SalePrice": 299898,
    "Ratio": 0.93,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.8,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000198",
    "TaskID": "T100198",
    "UPRN": "100001238198",
    "Address": "198 Example Road, City 18",
    "Postcode": "CF86 8AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-10-21",
    "SalePrice": 387637,
    "Ratio": 0.92,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.97,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000199",
    "TaskID": "T100199",
    "UPRN": "100001238199",
    "Address": "199 Example Road, City 19",
    "Postcode": "CF91 3AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-05-26",
    "SalePrice": 678087,
    "Ratio": 1.03,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.83,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000200",
    "TaskID": "T100200",
    "UPRN": "100001238200",
    "Address": "200 Example Road, City 0",
    "Postcode": "CF04 5AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-04-17",
    "SalePrice": 234641,
    "Ratio": 0.98,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.22,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000201",
    "TaskID": "T100201",
    "UPRN": "100001238201",
    "Address": "201 Example Road, City 1",
    "Postcode": "CF12 1AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-12-04",
    "SalePrice": 515752,
    "Ratio": 0.87,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.97,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000202",
    "TaskID": "T100202",
    "UPRN": "100001238202",
    "Address": "202 Example Road, City 2",
    "Postcode": "CF25 5AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-07-12",
    "SalePrice": 609360,
    "Ratio": 1.05,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.93,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000203",
    "TaskID": "T100203",
    "UPRN": "100001238203",
    "Address": "203 Example Road, City 3",
    "Postcode": "CF37 3AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-10-01",
    "SalePrice": 536484,
    "Ratio": 1.07,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.89,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000204",
    "TaskID": "T100204",
    "UPRN": "100001238204",
    "Address": "204 Example Road, City 4",
    "Postcode": "CF46 7AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-11-09",
    "SalePrice": 527848,
    "Ratio": 1.08,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.15,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000205",
    "TaskID": "T100205",
    "UPRN": "100001238205",
    "Address": "205 Example Road, City 5",
    "Postcode": "CF52 9AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-09-07",
    "SalePrice": 645248,
    "Ratio": 0.98,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.93,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000206",
    "TaskID": "T100206",
    "UPRN": "100001238206",
    "Address": "206 Example Road, City 6",
    "Postcode": "CF68 8AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-10-12",
    "SalePrice": 124438,
    "Ratio": 1.14,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.81,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000207",
    "TaskID": "T100207",
    "UPRN": "100001238207",
    "Address": "207 Example Road, City 7",
    "Postcode": "CF72 6AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-11-26",
    "SalePrice": 161141,
    "Ratio": 1.06,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.08,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000208",
    "TaskID": "T100208",
    "UPRN": "100001238208",
    "Address": "208 Example Road, City 8",
    "Postcode": "CF83 7AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-05-04",
    "SalePrice": 677521,
    "Ratio": 1.05,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.12,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000209",
    "TaskID": "T100209",
    "UPRN": "100001238209",
    "Address": "209 Example Road, City 9",
    "Postcode": "CF95 7AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-05-15",
    "SalePrice": 552431,
    "Ratio": 0.93,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.06,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000210",
    "TaskID": "T100210",
    "UPRN": "100001238210",
    "Address": "210 Example Road, City 10",
    "Postcode": "CF03 1AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-11-10",
    "SalePrice": 189153,
    "Ratio": 0.95,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.01,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000211",
    "TaskID": "T100211",
    "UPRN": "100001238211",
    "Address": "211 Example Road, City 11",
    "Postcode": "CF18 3AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-10-31",
    "SalePrice": 404997,
    "Ratio": 1.12,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.84,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000212",
    "TaskID": "T100212",
    "UPRN": "100001238212",
    "Address": "212 Example Road, City 12",
    "Postcode": "CF23 5AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-04-22",
    "SalePrice": 196901,
    "Ratio": 1.14,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.88,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000213",
    "TaskID": "T100213",
    "UPRN": "100001238213",
    "Address": "213 Example Road, City 13",
    "Postcode": "CF39 4AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-07-09",
    "SalePrice": 611978,
    "Ratio": 1.09,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.15,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000214",
    "TaskID": "T100214",
    "UPRN": "100001238214",
    "Address": "214 Example Road, City 14",
    "Postcode": "CF45 1AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-05-24",
    "SalePrice": 269062,
    "Ratio": 1.06,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.86,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000215",
    "TaskID": "T100215",
    "UPRN": "100001238215",
    "Address": "215 Example Road, City 15",
    "Postcode": "CF51 3AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-07-21",
    "SalePrice": 278479,
    "Ratio": 1.15,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.89,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000216",
    "TaskID": "T100216",
    "UPRN": "100001238216",
    "Address": "216 Example Road, City 16",
    "Postcode": "CF62 3AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-02-13",
    "SalePrice": 131672,
    "Ratio": 0.96,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.11,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000217",
    "TaskID": "T100217",
    "UPRN": "100001238217",
    "Address": "217 Example Road, City 17",
    "Postcode": "CF75 3AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-06-24",
    "SalePrice": 708402,
    "Ratio": 0.86,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.05,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000218",
    "TaskID": "T100218",
    "UPRN": "100001238218",
    "Address": "218 Example Road, City 18",
    "Postcode": "CF89 1AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-08-23",
    "SalePrice": 647663,
    "Ratio": 1.0,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.28,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000219",
    "TaskID": "T100219",
    "UPRN": "100001238219",
    "Address": "219 Example Road, City 19",
    "Postcode": "CF97 5AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-12-19",
    "SalePrice": 206270,
    "Ratio": 1.04,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.1,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000220",
    "TaskID": "T100220",
    "UPRN": "100001238220",
    "Address": "220 Example Road, City 0",
    "Postcode": "CF08 2AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-03-18",
    "SalePrice": 354585,
    "Ratio": 1.04,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.93,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000221",
    "TaskID": "T100221",
    "UPRN": "100001238221",
    "Address": "221 Example Road, City 1",
    "Postcode": "CF12 9AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-12-25",
    "SalePrice": 209697,
    "Ratio": 0.92,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.84,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000222",
    "TaskID": "T100222",
    "UPRN": "100001238222",
    "Address": "222 Example Road, City 2",
    "Postcode": "CF25 8AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-01-21",
    "SalePrice": 480307,
    "Ratio": 0.9,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.89,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000223",
    "TaskID": "T100223",
    "UPRN": "100001238223",
    "Address": "223 Example Road, City 3",
    "Postcode": "CF33 4AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-06-17",
    "SalePrice": 618920,
    "Ratio": 1.02,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.15,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000224",
    "TaskID": "T100224",
    "UPRN": "100001238224",
    "Address": "224 Example Road, City 4",
    "Postcode": "CF46 4AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-02-06",
    "SalePrice": 300388,
    "Ratio": 0.96,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.14,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000225",
    "TaskID": "T100225",
    "UPRN": "100001238225",
    "Address": "225 Example Road, City 5",
    "Postcode": "CF58 2AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-06-22",
    "SalePrice": 570960,
    "Ratio": 0.86,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.28,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000226",
    "TaskID": "T100226",
    "UPRN": "100001238226",
    "Address": "226 Example Road, City 6",
    "Postcode": "CF63 6AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-08-08",
    "SalePrice": 467207,
    "Ratio": 0.88,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.23,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000227",
    "TaskID": "T100227",
    "UPRN": "100001238227",
    "Address": "227 Example Road, City 7",
    "Postcode": "CF79 5AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-02-29",
    "SalePrice": 124330,
    "Ratio": 1.14,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.21,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000228",
    "TaskID": "T100228",
    "UPRN": "100001238228",
    "Address": "228 Example Road, City 8",
    "Postcode": "CF87 2AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-01-24",
    "SalePrice": 406888,
    "Ratio": 1.08,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.97,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000229",
    "TaskID": "T100229",
    "UPRN": "100001238229",
    "Address": "229 Example Road, City 9",
    "Postcode": "CF96 5AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-05-14",
    "SalePrice": 212678,
    "Ratio": 0.9,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.0,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000230",
    "TaskID": "T100230",
    "UPRN": "100001238230",
    "Address": "230 Example Road, City 10",
    "Postcode": "CF09 5AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-10-24",
    "SalePrice": 698723,
    "Ratio": 0.95,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.05,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000231",
    "TaskID": "T100231",
    "UPRN": "100001238231",
    "Address": "231 Example Road, City 11",
    "Postcode": "CF11 9AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-09-19",
    "SalePrice": 154393,
    "Ratio": 1.1,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.05,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000232",
    "TaskID": "T100232",
    "UPRN": "100001238232",
    "Address": "232 Example Road, City 12",
    "Postcode": "CF29 7AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-02-13",
    "SalePrice": 561416,
    "Ratio": 1.07,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.01,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000233",
    "TaskID": "T100233",
    "UPRN": "100001238233",
    "Address": "233 Example Road, City 13",
    "Postcode": "CF33 7AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-03-22",
    "SalePrice": 628648,
    "Ratio": 0.92,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.12,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000234",
    "TaskID": "T100234",
    "UPRN": "100001238234",
    "Address": "234 Example Road, City 14",
    "Postcode": "CF43 8AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-07-03",
    "SalePrice": 473194,
    "Ratio": 0.93,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.12,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000235",
    "TaskID": "T100235",
    "UPRN": "100001238235",
    "Address": "235 Example Road, City 15",
    "Postcode": "CF52 9AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-07-12",
    "SalePrice": 441671,
    "Ratio": 1.01,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.14,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000236",
    "TaskID": "T100236",
    "UPRN": "100001238236",
    "Address": "236 Example Road, City 16",
    "Postcode": "CF62 3AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-11-09",
    "SalePrice": 401597,
    "Ratio": 1.02,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.89,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000237",
    "TaskID": "T100237",
    "UPRN": "100001238237",
    "Address": "237 Example Road, City 17",
    "Postcode": "CF72 6AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-11-01",
    "SalePrice": 552599,
    "Ratio": 1.05,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.01,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000238",
    "TaskID": "T100238",
    "UPRN": "100001238238",
    "Address": "238 Example Road, City 18",
    "Postcode": "CF84 6AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-09-21",
    "SalePrice": 330003,
    "Ratio": 0.94,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.95,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000239",
    "TaskID": "T100239",
    "UPRN": "100001238239",
    "Address": "239 Example Road, City 19",
    "Postcode": "CF94 8AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-11-30",
    "SalePrice": 249298,
    "Ratio": 1.05,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.2,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000240",
    "TaskID": "T100240",
    "UPRN": "100001238240",
    "Address": "240 Example Road, City 0",
    "Postcode": "CF04 2AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-09-30",
    "SalePrice": 266063,
    "Ratio": 1.11,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.83,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000241",
    "TaskID": "T100241",
    "UPRN": "100001238241",
    "Address": "241 Example Road, City 1",
    "Postcode": "CF16 6AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-06-01",
    "SalePrice": 578163,
    "Ratio": 0.86,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.29,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000242",
    "TaskID": "T100242",
    "UPRN": "100001238242",
    "Address": "242 Example Road, City 2",
    "Postcode": "CF29 1AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-10-23",
    "SalePrice": 286443,
    "Ratio": 1.13,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.82,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000243",
    "TaskID": "T100243",
    "UPRN": "100001238243",
    "Address": "243 Example Road, City 3",
    "Postcode": "CF35 7AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-02-08",
    "SalePrice": 586630,
    "Ratio": 1.0,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.98,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000244",
    "TaskID": "T100244",
    "UPRN": "100001238244",
    "Address": "244 Example Road, City 4",
    "Postcode": "CF49 5AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-12-18",
    "SalePrice": 290149,
    "Ratio": 1.02,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.92,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000245",
    "TaskID": "T100245",
    "UPRN": "100001238245",
    "Address": "245 Example Road, City 5",
    "Postcode": "CF58 1AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-02-01",
    "SalePrice": 447750,
    "Ratio": 1.04,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.95,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000246",
    "TaskID": "T100246",
    "UPRN": "100001238246",
    "Address": "246 Example Road, City 6",
    "Postcode": "CF63 8AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-01-10",
    "SalePrice": 383581,
    "Ratio": 0.96,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.03,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000247",
    "TaskID": "T100247",
    "UPRN": "100001238247",
    "Address": "247 Example Road, City 7",
    "Postcode": "CF73 9AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-01-08",
    "SalePrice": 590618,
    "Ratio": 0.89,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.93,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000248",
    "TaskID": "T100248",
    "UPRN": "100001238248",
    "Address": "248 Example Road, City 8",
    "Postcode": "CF89 1AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-11-20",
    "SalePrice": 463482,
    "Ratio": 1.09,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.93,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000249",
    "TaskID": "T100249",
    "UPRN": "100001238249",
    "Address": "249 Example Road, City 9",
    "Postcode": "CF98 3AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-06-12",
    "SalePrice": 187514,
    "Ratio": 0.98,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.15,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000250",
    "TaskID": "T100250",
    "UPRN": "100001238250",
    "Address": "250 Example Road, City 10",
    "Postcode": "CF03 6AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-06-17",
    "SalePrice": 274684,
    "Ratio": 1.04,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.18,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000251",
    "TaskID": "T100251",
    "UPRN": "100001238251",
    "Address": "251 Example Road, City 11",
    "Postcode": "CF12 9AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-01-27",
    "SalePrice": 590067,
    "Ratio": 1.05,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.09,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000252",
    "TaskID": "T100252",
    "UPRN": "100001238252",
    "Address": "252 Example Road, City 12",
    "Postcode": "CF29 9AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-09-28",
    "SalePrice": 188667,
    "Ratio": 1.09,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.28,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000253",
    "TaskID": "T100253",
    "UPRN": "100001238253",
    "Address": "253 Example Road, City 13",
    "Postcode": "CF38 5AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-09-26",
    "SalePrice": 339358,
    "Ratio": 1.08,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.29,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000254",
    "TaskID": "T100254",
    "UPRN": "100001238254",
    "Address": "254 Example Road, City 14",
    "Postcode": "CF44 6AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-09-15",
    "SalePrice": 145384,
    "Ratio": 1.09,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.99,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000255",
    "TaskID": "T100255",
    "UPRN": "100001238255",
    "Address": "255 Example Road, City 15",
    "Postcode": "CF52 5AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-09-02",
    "SalePrice": 653468,
    "Ratio": 1.05,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.95,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000256",
    "TaskID": "T100256",
    "UPRN": "100001238256",
    "Address": "256 Example Road, City 16",
    "Postcode": "CF61 2AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-05-17",
    "SalePrice": 154315,
    "Ratio": 1.06,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.07,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000257",
    "TaskID": "T100257",
    "UPRN": "100001238257",
    "Address": "257 Example Road, City 17",
    "Postcode": "CF76 5AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-03-15",
    "SalePrice": 512213,
    "Ratio": 1.14,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.12,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000258",
    "TaskID": "T100258",
    "UPRN": "100001238258",
    "Address": "258 Example Road, City 18",
    "Postcode": "CF85 1AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-02-09",
    "SalePrice": 285104,
    "Ratio": 1.04,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.09,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000259",
    "TaskID": "T100259",
    "UPRN": "100001238259",
    "Address": "259 Example Road, City 19",
    "Postcode": "CF98 4AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-03-04",
    "SalePrice": 448334,
    "Ratio": 0.93,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.24,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000260",
    "TaskID": "T100260",
    "UPRN": "100001238260",
    "Address": "260 Example Road, City 0",
    "Postcode": "CF02 6AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-02-14",
    "SalePrice": 258410,
    "Ratio": 1.11,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.86,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000261",
    "TaskID": "T100261",
    "UPRN": "100001238261",
    "Address": "261 Example Road, City 1",
    "Postcode": "CF11 3AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-11-17",
    "SalePrice": 158749,
    "Ratio": 1.12,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.06,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000262",
    "TaskID": "T100262",
    "UPRN": "100001238262",
    "Address": "262 Example Road, City 2",
    "Postcode": "CF27 6AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-03-10",
    "SalePrice": 163903,
    "Ratio": 1.11,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.2,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000263",
    "TaskID": "T100263",
    "UPRN": "100001238263",
    "Address": "263 Example Road, City 3",
    "Postcode": "CF38 3AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-06-26",
    "SalePrice": 667846,
    "Ratio": 0.99,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.04,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000264",
    "TaskID": "T100264",
    "UPRN": "100001238264",
    "Address": "264 Example Road, City 4",
    "Postcode": "CF46 3AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-12-04",
    "SalePrice": 606127,
    "Ratio": 0.9,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.11,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000265",
    "TaskID": "T100265",
    "UPRN": "100001238265",
    "Address": "265 Example Road, City 5",
    "Postcode": "CF54 1AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-04-19",
    "SalePrice": 454240,
    "Ratio": 0.97,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.12,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000266",
    "TaskID": "T100266",
    "UPRN": "100001238266",
    "Address": "266 Example Road, City 6",
    "Postcode": "CF69 3AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-08-16",
    "SalePrice": 142790,
    "Ratio": 0.99,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.12,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000267",
    "TaskID": "T100267",
    "UPRN": "100001238267",
    "Address": "267 Example Road, City 7",
    "Postcode": "CF75 9AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-09-20",
    "SalePrice": 571329,
    "Ratio": 0.97,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.82,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000268",
    "TaskID": "T100268",
    "UPRN": "100001238268",
    "Address": "268 Example Road, City 8",
    "Postcode": "CF84 3AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-10-23",
    "SalePrice": 671535,
    "Ratio": 0.95,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.87,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000269",
    "TaskID": "T100269",
    "UPRN": "100001238269",
    "Address": "269 Example Road, City 9",
    "Postcode": "CF91 3AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-11-18",
    "SalePrice": 484779,
    "Ratio": 1.09,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.24,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000270",
    "TaskID": "T100270",
    "UPRN": "100001238270",
    "Address": "270 Example Road, City 10",
    "Postcode": "CF09 6AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-12-14",
    "SalePrice": 356398,
    "Ratio": 1.1,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.81,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000271",
    "TaskID": "T100271",
    "UPRN": "100001238271",
    "Address": "271 Example Road, City 11",
    "Postcode": "CF17 7AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-05-26",
    "SalePrice": 314220,
    "Ratio": 1.15,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.12,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000272",
    "TaskID": "T100272",
    "UPRN": "100001238272",
    "Address": "272 Example Road, City 12",
    "Postcode": "CF28 8AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-05-28",
    "SalePrice": 719986,
    "Ratio": 1.1,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.96,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000273",
    "TaskID": "T100273",
    "UPRN": "100001238273",
    "Address": "273 Example Road, City 13",
    "Postcode": "CF38 1AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-01-17",
    "SalePrice": 323457,
    "Ratio": 1.05,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.92,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000274",
    "TaskID": "T100274",
    "UPRN": "100001238274",
    "Address": "274 Example Road, City 14",
    "Postcode": "CF48 5AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-07-31",
    "SalePrice": 500653,
    "Ratio": 1.07,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.14,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000275",
    "TaskID": "T100275",
    "UPRN": "100001238275",
    "Address": "275 Example Road, City 15",
    "Postcode": "CF56 9AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-05-12",
    "SalePrice": 459287,
    "Ratio": 1.11,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.92,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000276",
    "TaskID": "T100276",
    "UPRN": "100001238276",
    "Address": "276 Example Road, City 16",
    "Postcode": "CF65 6AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-04-27",
    "SalePrice": 460185,
    "Ratio": 1.12,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.09,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000277",
    "TaskID": "T100277",
    "UPRN": "100001238277",
    "Address": "277 Example Road, City 17",
    "Postcode": "CF79 6AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-11-17",
    "SalePrice": 205370,
    "Ratio": 1.08,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.85,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000278",
    "TaskID": "T100278",
    "UPRN": "100001238278",
    "Address": "278 Example Road, City 18",
    "Postcode": "CF82 5AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-01-16",
    "SalePrice": 600062,
    "Ratio": 1.1,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.23,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000279",
    "TaskID": "T100279",
    "UPRN": "100001238279",
    "Address": "279 Example Road, City 19",
    "Postcode": "CF93 8AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-09-22",
    "SalePrice": 570114,
    "Ratio": 0.88,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.01,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000280",
    "TaskID": "T100280",
    "UPRN": "100001238280",
    "Address": "280 Example Road, City 0",
    "Postcode": "CF07 8AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-02-04",
    "SalePrice": 402429,
    "Ratio": 1.05,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.19,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000281",
    "TaskID": "T100281",
    "UPRN": "100001238281",
    "Address": "281 Example Road, City 1",
    "Postcode": "CF14 5AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-09-11",
    "SalePrice": 282205,
    "Ratio": 0.99,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.02,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000282",
    "TaskID": "T100282",
    "UPRN": "100001238282",
    "Address": "282 Example Road, City 2",
    "Postcode": "CF22 6AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-09-08",
    "SalePrice": 121736,
    "Ratio": 0.92,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.25,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000283",
    "TaskID": "T100283",
    "UPRN": "100001238283",
    "Address": "283 Example Road, City 3",
    "Postcode": "CF31 8AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-09-11",
    "SalePrice": 199086,
    "Ratio": 0.93,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.1,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000284",
    "TaskID": "T100284",
    "UPRN": "100001238284",
    "Address": "284 Example Road, City 4",
    "Postcode": "CF42 9AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-06-08",
    "SalePrice": 595039,
    "Ratio": 1.12,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.11,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000285",
    "TaskID": "T100285",
    "UPRN": "100001238285",
    "Address": "285 Example Road, City 5",
    "Postcode": "CF55 4AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-04-09",
    "SalePrice": 372325,
    "Ratio": 0.96,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.9,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000286",
    "TaskID": "T100286",
    "UPRN": "100001238286",
    "Address": "286 Example Road, City 6",
    "Postcode": "CF62 1AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-06-06",
    "SalePrice": 177408,
    "Ratio": 0.96,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.04,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000287",
    "TaskID": "T100287",
    "UPRN": "100001238287",
    "Address": "287 Example Road, City 7",
    "Postcode": "CF74 3AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-10-12",
    "SalePrice": 515483,
    "Ratio": 1.09,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.06,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000288",
    "TaskID": "T100288",
    "UPRN": "100001238288",
    "Address": "288 Example Road, City 8",
    "Postcode": "CF83 4AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-02-20",
    "SalePrice": 232755,
    "Ratio": 1.09,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.01,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000289",
    "TaskID": "T100289",
    "UPRN": "100001238289",
    "Address": "289 Example Road, City 9",
    "Postcode": "CF95 8AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-01-17",
    "SalePrice": 363560,
    "Ratio": 1.1,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.99,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000290",
    "TaskID": "T100290",
    "UPRN": "100001238290",
    "Address": "290 Example Road, City 10",
    "Postcode": "CF09 6AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-07-03",
    "SalePrice": 653996,
    "Ratio": 1.07,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.08,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000291",
    "TaskID": "T100291",
    "UPRN": "100001238291",
    "Address": "291 Example Road, City 11",
    "Postcode": "CF14 6AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-08-06",
    "SalePrice": 482382,
    "Ratio": 0.88,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.26,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000292",
    "TaskID": "T100292",
    "UPRN": "100001238292",
    "Address": "292 Example Road, City 12",
    "Postcode": "CF24 7AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-07-21",
    "SalePrice": 480491,
    "Ratio": 1.07,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.16,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000293",
    "TaskID": "T100293",
    "UPRN": "100001238293",
    "Address": "293 Example Road, City 13",
    "Postcode": "CF36 2AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-04-04",
    "SalePrice": 618177,
    "Ratio": 0.88,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.27,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000294",
    "TaskID": "T100294",
    "UPRN": "100001238294",
    "Address": "294 Example Road, City 14",
    "Postcode": "CF46 4AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-05-09",
    "SalePrice": 330340,
    "Ratio": 0.95,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.24,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000295",
    "TaskID": "T100295",
    "UPRN": "100001238295",
    "Address": "295 Example Road, City 15",
    "Postcode": "CF52 6AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-07-29",
    "SalePrice": 356196,
    "Ratio": 0.87,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.91,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000296",
    "TaskID": "T100296",
    "UPRN": "100001238296",
    "Address": "296 Example Road, City 16",
    "Postcode": "CF69 4AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-12-27",
    "SalePrice": 685050,
    "Ratio": 1.09,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.22,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000297",
    "TaskID": "T100297",
    "UPRN": "100001238297",
    "Address": "297 Example Road, City 17",
    "Postcode": "CF78 4AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-03-17",
    "SalePrice": 520141,
    "Ratio": 1.14,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.3,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000298",
    "TaskID": "T100298",
    "UPRN": "100001238298",
    "Address": "298 Example Road, City 18",
    "Postcode": "CF86 5AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-03-02",
    "SalePrice": 405938,
    "Ratio": 0.97,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.12,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000299",
    "TaskID": "T100299",
    "UPRN": "100001238299",
    "Address": "299 Example Road, City 19",
    "Postcode": "CF96 7AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-12-29",
    "SalePrice": 262569,
    "Ratio": 1.14,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.09,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000300",
    "TaskID": "T100300",
    "UPRN": "100001238300",
    "Address": "300 Example Road, City 0",
    "Postcode": "CF01 2AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-06-03",
    "SalePrice": 677895,
    "Ratio": 1.02,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.23,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000301",
    "TaskID": "T100301",
    "UPRN": "100001238301",
    "Address": "301 Example Road, City 1",
    "Postcode": "CF19 3AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-03-16",
    "SalePrice": 376469,
    "Ratio": 1.14,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.03,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000302",
    "TaskID": "T100302",
    "UPRN": "100001238302",
    "Address": "302 Example Road, City 2",
    "Postcode": "CF28 5AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-05-05",
    "SalePrice": 236947,
    "Ratio": 1.08,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.02,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000303",
    "TaskID": "T100303",
    "UPRN": "100001238303",
    "Address": "303 Example Road, City 3",
    "Postcode": "CF33 5AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-12-31",
    "SalePrice": 655362,
    "Ratio": 0.87,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.04,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000304",
    "TaskID": "T100304",
    "UPRN": "100001238304",
    "Address": "304 Example Road, City 4",
    "Postcode": "CF41 8AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-06-21",
    "SalePrice": 219097,
    "Ratio": 1.03,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.29,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000305",
    "TaskID": "T100305",
    "UPRN": "100001238305",
    "Address": "305 Example Road, City 5",
    "Postcode": "CF53 3AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-06-11",
    "SalePrice": 205334,
    "Ratio": 1.06,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.18,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000306",
    "TaskID": "T100306",
    "UPRN": "100001238306",
    "Address": "306 Example Road, City 6",
    "Postcode": "CF68 7AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-02-20",
    "SalePrice": 330465,
    "Ratio": 0.87,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.0,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000307",
    "TaskID": "T100307",
    "UPRN": "100001238307",
    "Address": "307 Example Road, City 7",
    "Postcode": "CF78 8AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-11-23",
    "SalePrice": 124156,
    "Ratio": 0.91,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.12,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000308",
    "TaskID": "T100308",
    "UPRN": "100001238308",
    "Address": "308 Example Road, City 8",
    "Postcode": "CF89 8AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-01-03",
    "SalePrice": 198025,
    "Ratio": 1.04,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.9,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000309",
    "TaskID": "T100309",
    "UPRN": "100001238309",
    "Address": "309 Example Road, City 9",
    "Postcode": "CF96 3AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-11-23",
    "SalePrice": 189384,
    "Ratio": 1.13,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.1,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000310",
    "TaskID": "T100310",
    "UPRN": "100001238310",
    "Address": "310 Example Road, City 10",
    "Postcode": "CF06 7AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-03-08",
    "SalePrice": 369380,
    "Ratio": 1.06,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.23,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000311",
    "TaskID": "T100311",
    "UPRN": "100001238311",
    "Address": "311 Example Road, City 11",
    "Postcode": "CF13 4AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-01-02",
    "SalePrice": 274862,
    "Ratio": 1.07,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.91,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000312",
    "TaskID": "T100312",
    "UPRN": "100001238312",
    "Address": "312 Example Road, City 12",
    "Postcode": "CF27 9AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-03-12",
    "SalePrice": 225128,
    "Ratio": 0.87,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.21,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000313",
    "TaskID": "T100313",
    "UPRN": "100001238313",
    "Address": "313 Example Road, City 13",
    "Postcode": "CF34 7AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-05-15",
    "SalePrice": 188306,
    "Ratio": 0.99,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.86,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000314",
    "TaskID": "T100314",
    "UPRN": "100001238314",
    "Address": "314 Example Road, City 14",
    "Postcode": "CF48 5AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-05-06",
    "SalePrice": 485484,
    "Ratio": 1.08,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.95,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000315",
    "TaskID": "T100315",
    "UPRN": "100001238315",
    "Address": "315 Example Road, City 15",
    "Postcode": "CF53 7AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-09-18",
    "SalePrice": 349518,
    "Ratio": 1.15,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.05,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000316",
    "TaskID": "T100316",
    "UPRN": "100001238316",
    "Address": "316 Example Road, City 16",
    "Postcode": "CF67 5AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-03-31",
    "SalePrice": 399558,
    "Ratio": 0.88,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.01,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000317",
    "TaskID": "T100317",
    "UPRN": "100001238317",
    "Address": "317 Example Road, City 17",
    "Postcode": "CF73 5AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-03-13",
    "SalePrice": 292430,
    "Ratio": 1.02,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.17,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000318",
    "TaskID": "T100318",
    "UPRN": "100001238318",
    "Address": "318 Example Road, City 18",
    "Postcode": "CF86 4AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-05-31",
    "SalePrice": 412891,
    "Ratio": 1.1,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.92,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000319",
    "TaskID": "T100319",
    "UPRN": "100001238319",
    "Address": "319 Example Road, City 19",
    "Postcode": "CF92 5AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-04-10",
    "SalePrice": 120203,
    "Ratio": 0.92,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.07,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000320",
    "TaskID": "T100320",
    "UPRN": "100001238320",
    "Address": "320 Example Road, City 0",
    "Postcode": "CF05 5AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-06-24",
    "SalePrice": 436975,
    "Ratio": 1.15,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.07,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000321",
    "TaskID": "T100321",
    "UPRN": "100001238321",
    "Address": "321 Example Road, City 1",
    "Postcode": "CF13 9AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-10-28",
    "SalePrice": 236700,
    "Ratio": 1.09,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.16,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000322",
    "TaskID": "T100322",
    "UPRN": "100001238322",
    "Address": "322 Example Road, City 2",
    "Postcode": "CF21 5AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-01-26",
    "SalePrice": 580140,
    "Ratio": 0.97,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.15,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000323",
    "TaskID": "T100323",
    "UPRN": "100001238323",
    "Address": "323 Example Road, City 3",
    "Postcode": "CF31 2AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-11-09",
    "SalePrice": 498247,
    "Ratio": 0.88,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.83,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000324",
    "TaskID": "T100324",
    "UPRN": "100001238324",
    "Address": "324 Example Road, City 4",
    "Postcode": "CF49 1AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-03-07",
    "SalePrice": 370221,
    "Ratio": 1.0,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.18,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000325",
    "TaskID": "T100325",
    "UPRN": "100001238325",
    "Address": "325 Example Road, City 5",
    "Postcode": "CF57 1AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-11-01",
    "SalePrice": 301487,
    "Ratio": 0.93,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.17,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000326",
    "TaskID": "T100326",
    "UPRN": "100001238326",
    "Address": "326 Example Road, City 6",
    "Postcode": "CF64 6AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-09-16",
    "SalePrice": 346850,
    "Ratio": 1.11,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.98,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000327",
    "TaskID": "T100327",
    "UPRN": "100001238327",
    "Address": "327 Example Road, City 7",
    "Postcode": "CF73 8AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-10-13",
    "SalePrice": 610749,
    "Ratio": 1.11,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.16,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000328",
    "TaskID": "T100328",
    "UPRN": "100001238328",
    "Address": "328 Example Road, City 8",
    "Postcode": "CF89 1AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-10-14",
    "SalePrice": 354271,
    "Ratio": 1.1,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.27,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000329",
    "TaskID": "T100329",
    "UPRN": "100001238329",
    "Address": "329 Example Road, City 9",
    "Postcode": "CF93 6AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-02-22",
    "SalePrice": 556105,
    "Ratio": 1.14,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.96,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000330",
    "TaskID": "T100330",
    "UPRN": "100001238330",
    "Address": "330 Example Road, City 10",
    "Postcode": "CF04 5AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-07-10",
    "SalePrice": 356803,
    "Ratio": 0.88,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.93,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000331",
    "TaskID": "T100331",
    "UPRN": "100001238331",
    "Address": "331 Example Road, City 11",
    "Postcode": "CF18 2AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-08-23",
    "SalePrice": 296349,
    "Ratio": 0.93,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.81,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000332",
    "TaskID": "T100332",
    "UPRN": "100001238332",
    "Address": "332 Example Road, City 12",
    "Postcode": "CF29 4AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-07-27",
    "SalePrice": 577606,
    "Ratio": 0.95,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.01,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000333",
    "TaskID": "T100333",
    "UPRN": "100001238333",
    "Address": "333 Example Road, City 13",
    "Postcode": "CF36 5AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-04-18",
    "SalePrice": 168457,
    "Ratio": 1.14,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.82,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000334",
    "TaskID": "T100334",
    "UPRN": "100001238334",
    "Address": "334 Example Road, City 14",
    "Postcode": "CF42 2AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-01-02",
    "SalePrice": 476345,
    "Ratio": 0.94,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.99,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000335",
    "TaskID": "T100335",
    "UPRN": "100001238335",
    "Address": "335 Example Road, City 15",
    "Postcode": "CF59 2AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-06-18",
    "SalePrice": 183224,
    "Ratio": 1.06,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.21,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000336",
    "TaskID": "T100336",
    "UPRN": "100001238336",
    "Address": "336 Example Road, City 16",
    "Postcode": "CF67 3AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-08-04",
    "SalePrice": 535441,
    "Ratio": 1.11,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.98,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000337",
    "TaskID": "T100337",
    "UPRN": "100001238337",
    "Address": "337 Example Road, City 17",
    "Postcode": "CF79 9AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-08-25",
    "SalePrice": 610143,
    "Ratio": 1.01,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.91,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000338",
    "TaskID": "T100338",
    "UPRN": "100001238338",
    "Address": "338 Example Road, City 18",
    "Postcode": "CF84 9AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-10-15",
    "SalePrice": 387971,
    "Ratio": 1.11,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.18,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000339",
    "TaskID": "T100339",
    "UPRN": "100001238339",
    "Address": "339 Example Road, City 19",
    "Postcode": "CF99 4AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-11-15",
    "SalePrice": 563076,
    "Ratio": 1.06,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.92,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000340",
    "TaskID": "T100340",
    "UPRN": "100001238340",
    "Address": "340 Example Road, City 0",
    "Postcode": "CF05 2AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-09-16",
    "SalePrice": 706772,
    "Ratio": 0.89,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.1,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000341",
    "TaskID": "T100341",
    "UPRN": "100001238341",
    "Address": "341 Example Road, City 1",
    "Postcode": "CF15 5AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-05-07",
    "SalePrice": 650930,
    "Ratio": 0.91,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.97,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000342",
    "TaskID": "T100342",
    "UPRN": "100001238342",
    "Address": "342 Example Road, City 2",
    "Postcode": "CF22 5AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-08-15",
    "SalePrice": 127655,
    "Ratio": 0.91,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.83,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000343",
    "TaskID": "T100343",
    "UPRN": "100001238343",
    "Address": "343 Example Road, City 3",
    "Postcode": "CF31 1AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-06-16",
    "SalePrice": 309818,
    "Ratio": 1.1,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.1,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000344",
    "TaskID": "T100344",
    "UPRN": "100001238344",
    "Address": "344 Example Road, City 4",
    "Postcode": "CF48 7AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-06-11",
    "SalePrice": 475108,
    "Ratio": 1.15,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.91,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000345",
    "TaskID": "T100345",
    "UPRN": "100001238345",
    "Address": "345 Example Road, City 5",
    "Postcode": "CF52 2AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-07-20",
    "SalePrice": 652820,
    "Ratio": 1.02,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.2,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000346",
    "TaskID": "T100346",
    "UPRN": "100001238346",
    "Address": "346 Example Road, City 6",
    "Postcode": "CF62 2AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-12-05",
    "SalePrice": 189435,
    "Ratio": 1.05,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.28,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000347",
    "TaskID": "T100347",
    "UPRN": "100001238347",
    "Address": "347 Example Road, City 7",
    "Postcode": "CF71 4AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-02-11",
    "SalePrice": 708663,
    "Ratio": 1.12,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.11,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000348",
    "TaskID": "T100348",
    "UPRN": "100001238348",
    "Address": "348 Example Road, City 8",
    "Postcode": "CF81 5AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-04-21",
    "SalePrice": 185665,
    "Ratio": 1.1,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.97,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000349",
    "TaskID": "T100349",
    "UPRN": "100001238349",
    "Address": "349 Example Road, City 9",
    "Postcode": "CF97 2AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-02-26",
    "SalePrice": 559306,
    "Ratio": 1.03,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.99,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000350",
    "TaskID": "T100350",
    "UPRN": "100001238350",
    "Address": "350 Example Road, City 10",
    "Postcode": "CF04 5AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-12-23",
    "SalePrice": 157052,
    "Ratio": 1.01,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.12,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000351",
    "TaskID": "T100351",
    "UPRN": "100001238351",
    "Address": "351 Example Road, City 11",
    "Postcode": "CF19 1AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-10-11",
    "SalePrice": 172091,
    "Ratio": 1.1,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.12,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000352",
    "TaskID": "T100352",
    "UPRN": "100001238352",
    "Address": "352 Example Road, City 12",
    "Postcode": "CF23 4AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-03-09",
    "SalePrice": 180702,
    "Ratio": 1.06,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.09,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000353",
    "TaskID": "T100353",
    "UPRN": "100001238353",
    "Address": "353 Example Road, City 13",
    "Postcode": "CF33 8AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-01-12",
    "SalePrice": 686215,
    "Ratio": 1.05,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.89,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000354",
    "TaskID": "T100354",
    "UPRN": "100001238354",
    "Address": "354 Example Road, City 14",
    "Postcode": "CF42 6AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-05-20",
    "SalePrice": 666719,
    "Ratio": 0.98,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.15,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000355",
    "TaskID": "T100355",
    "UPRN": "100001238355",
    "Address": "355 Example Road, City 15",
    "Postcode": "CF59 7AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-07-27",
    "SalePrice": 141053,
    "Ratio": 1.15,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.87,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000356",
    "TaskID": "T100356",
    "UPRN": "100001238356",
    "Address": "356 Example Road, City 16",
    "Postcode": "CF65 2AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-01-07",
    "SalePrice": 159176,
    "Ratio": 1.0,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.08,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000357",
    "TaskID": "T100357",
    "UPRN": "100001238357",
    "Address": "357 Example Road, City 17",
    "Postcode": "CF74 6AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-02-02",
    "SalePrice": 313204,
    "Ratio": 1.13,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.05,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000358",
    "TaskID": "T100358",
    "UPRN": "100001238358",
    "Address": "358 Example Road, City 18",
    "Postcode": "CF83 3AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-04-02",
    "SalePrice": 340656,
    "Ratio": 0.91,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.17,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000359",
    "TaskID": "T100359",
    "UPRN": "100001238359",
    "Address": "359 Example Road, City 19",
    "Postcode": "CF95 2AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-05-05",
    "SalePrice": 417708,
    "Ratio": 1.0,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.99,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000360",
    "TaskID": "T100360",
    "UPRN": "100001238360",
    "Address": "360 Example Road, City 0",
    "Postcode": "CF07 1AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-12-13",
    "SalePrice": 248142,
    "Ratio": 1.15,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.96,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000361",
    "TaskID": "T100361",
    "UPRN": "100001238361",
    "Address": "361 Example Road, City 1",
    "Postcode": "CF14 9AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-11-21",
    "SalePrice": 649866,
    "Ratio": 1.12,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.89,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000362",
    "TaskID": "T100362",
    "UPRN": "100001238362",
    "Address": "362 Example Road, City 2",
    "Postcode": "CF26 9AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-03-10",
    "SalePrice": 253376,
    "Ratio": 1.01,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.08,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000363",
    "TaskID": "T100363",
    "UPRN": "100001238363",
    "Address": "363 Example Road, City 3",
    "Postcode": "CF37 7AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-11-16",
    "SalePrice": 178759,
    "Ratio": 1.14,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.26,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000364",
    "TaskID": "T100364",
    "UPRN": "100001238364",
    "Address": "364 Example Road, City 4",
    "Postcode": "CF42 5AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-05-15",
    "SalePrice": 651500,
    "Ratio": 1.0,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.06,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000365",
    "TaskID": "T100365",
    "UPRN": "100001238365",
    "Address": "365 Example Road, City 5",
    "Postcode": "CF58 7AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-02-05",
    "SalePrice": 714993,
    "Ratio": 1.14,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.28,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000366",
    "TaskID": "T100366",
    "UPRN": "100001238366",
    "Address": "366 Example Road, City 6",
    "Postcode": "CF68 8AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-04-18",
    "SalePrice": 488920,
    "Ratio": 1.09,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.27,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000367",
    "TaskID": "T100367",
    "UPRN": "100001238367",
    "Address": "367 Example Road, City 7",
    "Postcode": "CF78 1AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-08-21",
    "SalePrice": 703764,
    "Ratio": 0.88,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.23,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000368",
    "TaskID": "T100368",
    "UPRN": "100001238368",
    "Address": "368 Example Road, City 8",
    "Postcode": "CF82 3AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-01-01",
    "SalePrice": 328663,
    "Ratio": 1.14,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.81,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000369",
    "TaskID": "T100369",
    "UPRN": "100001238369",
    "Address": "369 Example Road, City 9",
    "Postcode": "CF98 4AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-03-24",
    "SalePrice": 154578,
    "Ratio": 0.91,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.22,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000370",
    "TaskID": "T100370",
    "UPRN": "100001238370",
    "Address": "370 Example Road, City 10",
    "Postcode": "CF02 5AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-04-08",
    "SalePrice": 444123,
    "Ratio": 1.04,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.8,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000371",
    "TaskID": "T100371",
    "UPRN": "100001238371",
    "Address": "371 Example Road, City 11",
    "Postcode": "CF11 6AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-05-16",
    "SalePrice": 438671,
    "Ratio": 1.03,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.98,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000372",
    "TaskID": "T100372",
    "UPRN": "100001238372",
    "Address": "372 Example Road, City 12",
    "Postcode": "CF25 2AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-07-23",
    "SalePrice": 690584,
    "Ratio": 1.11,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.91,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000373",
    "TaskID": "T100373",
    "UPRN": "100001238373",
    "Address": "373 Example Road, City 13",
    "Postcode": "CF35 7AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-07-24",
    "SalePrice": 507246,
    "Ratio": 1.1,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.16,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000374",
    "TaskID": "T100374",
    "UPRN": "100001238374",
    "Address": "374 Example Road, City 14",
    "Postcode": "CF41 9AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-09-14",
    "SalePrice": 203922,
    "Ratio": 1.02,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.13,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000375",
    "TaskID": "T100375",
    "UPRN": "100001238375",
    "Address": "375 Example Road, City 15",
    "Postcode": "CF58 8AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-03-17",
    "SalePrice": 267947,
    "Ratio": 1.14,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.96,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000376",
    "TaskID": "T100376",
    "UPRN": "100001238376",
    "Address": "376 Example Road, City 16",
    "Postcode": "CF67 1AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-02-12",
    "SalePrice": 275088,
    "Ratio": 1.09,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.07,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000377",
    "TaskID": "T100377",
    "UPRN": "100001238377",
    "Address": "377 Example Road, City 17",
    "Postcode": "CF74 4AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-07-12",
    "SalePrice": 453453,
    "Ratio": 1.13,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.13,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000378",
    "TaskID": "T100378",
    "UPRN": "100001238378",
    "Address": "378 Example Road, City 18",
    "Postcode": "CF89 5AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-04-15",
    "SalePrice": 235741,
    "Ratio": 1.15,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.23,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000379",
    "TaskID": "T100379",
    "UPRN": "100001238379",
    "Address": "379 Example Road, City 19",
    "Postcode": "CF97 3AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-08-28",
    "SalePrice": 594282,
    "Ratio": 1.09,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.25,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000380",
    "TaskID": "T100380",
    "UPRN": "100001238380",
    "Address": "380 Example Road, City 0",
    "Postcode": "CF07 4AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-11-12",
    "SalePrice": 725534,
    "Ratio": 0.99,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.03,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000381",
    "TaskID": "T100381",
    "UPRN": "100001238381",
    "Address": "381 Example Road, City 1",
    "Postcode": "CF15 6AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-05-20",
    "SalePrice": 523637,
    "Ratio": 1.08,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.17,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000382",
    "TaskID": "T100382",
    "UPRN": "100001238382",
    "Address": "382 Example Road, City 2",
    "Postcode": "CF23 6AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-12-27",
    "SalePrice": 558927,
    "Ratio": 0.85,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.28,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000383",
    "TaskID": "T100383",
    "UPRN": "100001238383",
    "Address": "383 Example Road, City 3",
    "Postcode": "CF31 8AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-10-03",
    "SalePrice": 530671,
    "Ratio": 0.97,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.1,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000384",
    "TaskID": "T100384",
    "UPRN": "100001238384",
    "Address": "384 Example Road, City 4",
    "Postcode": "CF49 6AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-12-15",
    "SalePrice": 160934,
    "Ratio": 1.04,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.89,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000385",
    "TaskID": "T100385",
    "UPRN": "100001238385",
    "Address": "385 Example Road, City 5",
    "Postcode": "CF51 5AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-02-09",
    "SalePrice": 327797,
    "Ratio": 0.85,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.2,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000386",
    "TaskID": "T100386",
    "UPRN": "100001238386",
    "Address": "386 Example Road, City 6",
    "Postcode": "CF65 9AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-10-17",
    "SalePrice": 425963,
    "Ratio": 1.07,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.94,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000387",
    "TaskID": "T100387",
    "UPRN": "100001238387",
    "Address": "387 Example Road, City 7",
    "Postcode": "CF78 3AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-12-29",
    "SalePrice": 190252,
    "Ratio": 1.12,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.86,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000388",
    "TaskID": "T100388",
    "UPRN": "100001238388",
    "Address": "388 Example Road, City 8",
    "Postcode": "CF89 3AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-03-19",
    "SalePrice": 154934,
    "Ratio": 0.86,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.21,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000389",
    "TaskID": "T100389",
    "UPRN": "100001238389",
    "Address": "389 Example Road, City 9",
    "Postcode": "CF98 6AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-07-17",
    "SalePrice": 141918,
    "Ratio": 1.12,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.85,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000390",
    "TaskID": "T100390",
    "UPRN": "100001238390",
    "Address": "390 Example Road, City 10",
    "Postcode": "CF02 2AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-07-06",
    "SalePrice": 498571,
    "Ratio": 0.87,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.96,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000391",
    "TaskID": "T100391",
    "UPRN": "100001238391",
    "Address": "391 Example Road, City 11",
    "Postcode": "CF14 5AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-12-20",
    "SalePrice": 489507,
    "Ratio": 1.04,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.12,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000392",
    "TaskID": "T100392",
    "UPRN": "100001238392",
    "Address": "392 Example Road, City 12",
    "Postcode": "CF28 6AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-10-31",
    "SalePrice": 740239,
    "Ratio": 1.0,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.03,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000393",
    "TaskID": "T100393",
    "UPRN": "100001238393",
    "Address": "393 Example Road, City 13",
    "Postcode": "CF38 7AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-01-29",
    "SalePrice": 399035,
    "Ratio": 0.85,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.21,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000394",
    "TaskID": "T100394",
    "UPRN": "100001238394",
    "Address": "394 Example Road, City 14",
    "Postcode": "CF45 8AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-10-06",
    "SalePrice": 491143,
    "Ratio": 0.93,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.96,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000395",
    "TaskID": "T100395",
    "UPRN": "100001238395",
    "Address": "395 Example Road, City 15",
    "Postcode": "CF53 2AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-03-29",
    "SalePrice": 675740,
    "Ratio": 0.89,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.12,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000396",
    "TaskID": "T100396",
    "UPRN": "100001238396",
    "Address": "396 Example Road, City 16",
    "Postcode": "CF69 9AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-12-13",
    "SalePrice": 167680,
    "Ratio": 1.04,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.24,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000397",
    "TaskID": "T100397",
    "UPRN": "100001238397",
    "Address": "397 Example Road, City 17",
    "Postcode": "CF79 7AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-03-19",
    "SalePrice": 377803,
    "Ratio": 1.03,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.91,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000398",
    "TaskID": "T100398",
    "UPRN": "100001238398",
    "Address": "398 Example Road, City 18",
    "Postcode": "CF83 5AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-12-22",
    "SalePrice": 625700,
    "Ratio": 1.03,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.22,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000399",
    "TaskID": "T100399",
    "UPRN": "100001238399",
    "Address": "399 Example Road, City 19",
    "Postcode": "CF94 2AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-05-08",
    "SalePrice": 637453,
    "Ratio": 0.87,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.01,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000400",
    "TaskID": "T100400",
    "UPRN": "100001238400",
    "Address": "400 Example Road, City 0",
    "Postcode": "CF01 7AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-10-28",
    "SalePrice": 543259,
    "Ratio": 0.87,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.93,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000401",
    "TaskID": "T100401",
    "UPRN": "100001238401",
    "Address": "401 Example Road, City 1",
    "Postcode": "CF19 4AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-02-19",
    "SalePrice": 647786,
    "Ratio": 1.04,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.92,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000402",
    "TaskID": "T100402",
    "UPRN": "100001238402",
    "Address": "402 Example Road, City 2",
    "Postcode": "CF26 8AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-03-18",
    "SalePrice": 709143,
    "Ratio": 1.15,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.15,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000403",
    "TaskID": "T100403",
    "UPRN": "100001238403",
    "Address": "403 Example Road, City 3",
    "Postcode": "CF36 5AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-10-10",
    "SalePrice": 510992,
    "Ratio": 1.12,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.03,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000404",
    "TaskID": "T100404",
    "UPRN": "100001238404",
    "Address": "404 Example Road, City 4",
    "Postcode": "CF49 3AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-04-23",
    "SalePrice": 121541,
    "Ratio": 1.11,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.81,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000405",
    "TaskID": "T100405",
    "UPRN": "100001238405",
    "Address": "405 Example Road, City 5",
    "Postcode": "CF59 6AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-05-18",
    "SalePrice": 629630,
    "Ratio": 1.08,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.8,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000406",
    "TaskID": "T100406",
    "UPRN": "100001238406",
    "Address": "406 Example Road, City 6",
    "Postcode": "CF69 7AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-02-23",
    "SalePrice": 460327,
    "Ratio": 0.98,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.89,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000407",
    "TaskID": "T100407",
    "UPRN": "100001238407",
    "Address": "407 Example Road, City 7",
    "Postcode": "CF78 5AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-12-26",
    "SalePrice": 749815,
    "Ratio": 1.13,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.05,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000408",
    "TaskID": "T100408",
    "UPRN": "100001238408",
    "Address": "408 Example Road, City 8",
    "Postcode": "CF82 2AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-07-08",
    "SalePrice": 216501,
    "Ratio": 1.13,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.17,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000409",
    "TaskID": "T100409",
    "UPRN": "100001238409",
    "Address": "409 Example Road, City 9",
    "Postcode": "CF91 2AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-06-14",
    "SalePrice": 669908,
    "Ratio": 1.03,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.87,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000410",
    "TaskID": "T100410",
    "UPRN": "100001238410",
    "Address": "410 Example Road, City 10",
    "Postcode": "CF05 2AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-12-13",
    "SalePrice": 211249,
    "Ratio": 0.96,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.11,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000411",
    "TaskID": "T100411",
    "UPRN": "100001238411",
    "Address": "411 Example Road, City 11",
    "Postcode": "CF18 5AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-11-16",
    "SalePrice": 226462,
    "Ratio": 0.97,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.29,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000412",
    "TaskID": "T100412",
    "UPRN": "100001238412",
    "Address": "412 Example Road, City 12",
    "Postcode": "CF21 5AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-04-27",
    "SalePrice": 586118,
    "Ratio": 0.88,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.03,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000413",
    "TaskID": "T100413",
    "UPRN": "100001238413",
    "Address": "413 Example Road, City 13",
    "Postcode": "CF37 6AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-05-14",
    "SalePrice": 707094,
    "Ratio": 1.14,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.27,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000414",
    "TaskID": "T100414",
    "UPRN": "100001238414",
    "Address": "414 Example Road, City 14",
    "Postcode": "CF47 1AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-07-27",
    "SalePrice": 322246,
    "Ratio": 0.91,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.15,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000415",
    "TaskID": "T100415",
    "UPRN": "100001238415",
    "Address": "415 Example Road, City 15",
    "Postcode": "CF51 1AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-05-08",
    "SalePrice": 616411,
    "Ratio": 1.05,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.84,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000416",
    "TaskID": "T100416",
    "UPRN": "100001238416",
    "Address": "416 Example Road, City 16",
    "Postcode": "CF69 7AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-07-12",
    "SalePrice": 180002,
    "Ratio": 0.86,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.28,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000417",
    "TaskID": "T100417",
    "UPRN": "100001238417",
    "Address": "417 Example Road, City 17",
    "Postcode": "CF78 2AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-05-13",
    "SalePrice": 644960,
    "Ratio": 1.1,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.96,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000418",
    "TaskID": "T100418",
    "UPRN": "100001238418",
    "Address": "418 Example Road, City 18",
    "Postcode": "CF84 7AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-09-04",
    "SalePrice": 501251,
    "Ratio": 0.92,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.85,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000419",
    "TaskID": "T100419",
    "UPRN": "100001238419",
    "Address": "419 Example Road, City 19",
    "Postcode": "CF96 9AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-06-17",
    "SalePrice": 315295,
    "Ratio": 0.89,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.91,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000420",
    "TaskID": "T100420",
    "UPRN": "100001238420",
    "Address": "420 Example Road, City 0",
    "Postcode": "CF06 1AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-03-28",
    "SalePrice": 577877,
    "Ratio": 1.14,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.99,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000421",
    "TaskID": "T100421",
    "UPRN": "100001238421",
    "Address": "421 Example Road, City 1",
    "Postcode": "CF19 5AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-11-04",
    "SalePrice": 515156,
    "Ratio": 1.14,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.08,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000422",
    "TaskID": "T100422",
    "UPRN": "100001238422",
    "Address": "422 Example Road, City 2",
    "Postcode": "CF23 1AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-07-05",
    "SalePrice": 741176,
    "Ratio": 0.96,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.02,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000423",
    "TaskID": "T100423",
    "UPRN": "100001238423",
    "Address": "423 Example Road, City 3",
    "Postcode": "CF35 9AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-12-16",
    "SalePrice": 285620,
    "Ratio": 1.1,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.14,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000424",
    "TaskID": "T100424",
    "UPRN": "100001238424",
    "Address": "424 Example Road, City 4",
    "Postcode": "CF46 9AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-08-24",
    "SalePrice": 673367,
    "Ratio": 1.09,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.27,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000425",
    "TaskID": "T100425",
    "UPRN": "100001238425",
    "Address": "425 Example Road, City 5",
    "Postcode": "CF55 4AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-06-06",
    "SalePrice": 327023,
    "Ratio": 1.06,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.28,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000426",
    "TaskID": "T100426",
    "UPRN": "100001238426",
    "Address": "426 Example Road, City 6",
    "Postcode": "CF66 3AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-10-13",
    "SalePrice": 533387,
    "Ratio": 0.9,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.82,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000427",
    "TaskID": "T100427",
    "UPRN": "100001238427",
    "Address": "427 Example Road, City 7",
    "Postcode": "CF73 1AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-03-15",
    "SalePrice": 648245,
    "Ratio": 1.02,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.27,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000428",
    "TaskID": "T100428",
    "UPRN": "100001238428",
    "Address": "428 Example Road, City 8",
    "Postcode": "CF82 5AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-02-12",
    "SalePrice": 280087,
    "Ratio": 0.87,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.99,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000429",
    "TaskID": "T100429",
    "UPRN": "100001238429",
    "Address": "429 Example Road, City 9",
    "Postcode": "CF94 4AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-10-13",
    "SalePrice": 531784,
    "Ratio": 1.14,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.15,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000430",
    "TaskID": "T100430",
    "UPRN": "100001238430",
    "Address": "430 Example Road, City 10",
    "Postcode": "CF09 3AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-09-18",
    "SalePrice": 695422,
    "Ratio": 1.0,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.14,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000431",
    "TaskID": "T100431",
    "UPRN": "100001238431",
    "Address": "431 Example Road, City 11",
    "Postcode": "CF16 5AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-09-18",
    "SalePrice": 570485,
    "Ratio": 0.94,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.21,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000432",
    "TaskID": "T100432",
    "UPRN": "100001238432",
    "Address": "432 Example Road, City 12",
    "Postcode": "CF29 4AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-04-16",
    "SalePrice": 546278,
    "Ratio": 1.04,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.85,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000433",
    "TaskID": "T100433",
    "UPRN": "100001238433",
    "Address": "433 Example Road, City 13",
    "Postcode": "CF38 5AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-12-03",
    "SalePrice": 253184,
    "Ratio": 0.89,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.89,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000434",
    "TaskID": "T100434",
    "UPRN": "100001238434",
    "Address": "434 Example Road, City 14",
    "Postcode": "CF48 2AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-03-08",
    "SalePrice": 468557,
    "Ratio": 0.89,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.97,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000435",
    "TaskID": "T100435",
    "UPRN": "100001238435",
    "Address": "435 Example Road, City 15",
    "Postcode": "CF54 7AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-08-03",
    "SalePrice": 346630,
    "Ratio": 1.05,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.99,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000436",
    "TaskID": "T100436",
    "UPRN": "100001238436",
    "Address": "436 Example Road, City 16",
    "Postcode": "CF67 6AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-09-22",
    "SalePrice": 674623,
    "Ratio": 0.99,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.81,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000437",
    "TaskID": "T100437",
    "UPRN": "100001238437",
    "Address": "437 Example Road, City 17",
    "Postcode": "CF79 7AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-11-12",
    "SalePrice": 651287,
    "Ratio": 1.01,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.08,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000438",
    "TaskID": "T100438",
    "UPRN": "100001238438",
    "Address": "438 Example Road, City 18",
    "Postcode": "CF86 4AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-08-04",
    "SalePrice": 306127,
    "Ratio": 0.93,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.92,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000439",
    "TaskID": "T100439",
    "UPRN": "100001238439",
    "Address": "439 Example Road, City 19",
    "Postcode": "CF94 5AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-03-03",
    "SalePrice": 469927,
    "Ratio": 1.1,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.98,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000440",
    "TaskID": "T100440",
    "UPRN": "100001238440",
    "Address": "440 Example Road, City 0",
    "Postcode": "CF04 9AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-07-13",
    "SalePrice": 228699,
    "Ratio": 1.09,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.98,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000441",
    "TaskID": "T100441",
    "UPRN": "100001238441",
    "Address": "441 Example Road, City 1",
    "Postcode": "CF16 9AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-03-01",
    "SalePrice": 319221,
    "Ratio": 0.94,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.92,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000442",
    "TaskID": "T100442",
    "UPRN": "100001238442",
    "Address": "442 Example Road, City 2",
    "Postcode": "CF23 1AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-04-18",
    "SalePrice": 437336,
    "Ratio": 0.92,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.25,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000443",
    "TaskID": "T100443",
    "UPRN": "100001238443",
    "Address": "443 Example Road, City 3",
    "Postcode": "CF31 3AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-10-22",
    "SalePrice": 682536,
    "Ratio": 1.01,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.1,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000444",
    "TaskID": "T100444",
    "UPRN": "100001238444",
    "Address": "444 Example Road, City 4",
    "Postcode": "CF47 4AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-10-28",
    "SalePrice": 549685,
    "Ratio": 1.14,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.93,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000445",
    "TaskID": "T100445",
    "UPRN": "100001238445",
    "Address": "445 Example Road, City 5",
    "Postcode": "CF52 7AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-02-13",
    "SalePrice": 525696,
    "Ratio": 0.99,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.05,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000446",
    "TaskID": "T100446",
    "UPRN": "100001238446",
    "Address": "446 Example Road, City 6",
    "Postcode": "CF66 8AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-02-08",
    "SalePrice": 334832,
    "Ratio": 0.99,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.19,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000447",
    "TaskID": "T100447",
    "UPRN": "100001238447",
    "Address": "447 Example Road, City 7",
    "Postcode": "CF76 9AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-09-16",
    "SalePrice": 122257,
    "Ratio": 0.91,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.22,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000448",
    "TaskID": "T100448",
    "UPRN": "100001238448",
    "Address": "448 Example Road, City 8",
    "Postcode": "CF83 7AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-05-29",
    "SalePrice": 456393,
    "Ratio": 0.87,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.98,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000449",
    "TaskID": "T100449",
    "UPRN": "100001238449",
    "Address": "449 Example Road, City 9",
    "Postcode": "CF96 8AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-04-28",
    "SalePrice": 503024,
    "Ratio": 1.11,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.28,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000450",
    "TaskID": "T100450",
    "UPRN": "100001238450",
    "Address": "450 Example Road, City 10",
    "Postcode": "CF06 9AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-07-02",
    "SalePrice": 696554,
    "Ratio": 1.07,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.96,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000451",
    "TaskID": "T100451",
    "UPRN": "100001238451",
    "Address": "451 Example Road, City 11",
    "Postcode": "CF11 2AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-03-09",
    "SalePrice": 500265,
    "Ratio": 0.99,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.96,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000452",
    "TaskID": "T100452",
    "UPRN": "100001238452",
    "Address": "452 Example Road, City 12",
    "Postcode": "CF29 6AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-12-29",
    "SalePrice": 318203,
    "Ratio": 1.07,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.04,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000453",
    "TaskID": "T100453",
    "UPRN": "100001238453",
    "Address": "453 Example Road, City 13",
    "Postcode": "CF38 3AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-06-01",
    "SalePrice": 651775,
    "Ratio": 1.04,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.03,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000454",
    "TaskID": "T100454",
    "UPRN": "100001238454",
    "Address": "454 Example Road, City 14",
    "Postcode": "CF44 7AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-06-17",
    "SalePrice": 300635,
    "Ratio": 1.15,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.89,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000455",
    "TaskID": "T100455",
    "UPRN": "100001238455",
    "Address": "455 Example Road, City 15",
    "Postcode": "CF54 1AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-08-06",
    "SalePrice": 251778,
    "Ratio": 1.12,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.27,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000456",
    "TaskID": "T100456",
    "UPRN": "100001238456",
    "Address": "456 Example Road, City 16",
    "Postcode": "CF69 3AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-09-13",
    "SalePrice": 171180,
    "Ratio": 0.89,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.82,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000457",
    "TaskID": "T100457",
    "UPRN": "100001238457",
    "Address": "457 Example Road, City 17",
    "Postcode": "CF75 6AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-06-08",
    "SalePrice": 657209,
    "Ratio": 1.04,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.99,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000458",
    "TaskID": "T100458",
    "UPRN": "100001238458",
    "Address": "458 Example Road, City 18",
    "Postcode": "CF86 4AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-02-29",
    "SalePrice": 141764,
    "Ratio": 1.08,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.93,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000459",
    "TaskID": "T100459",
    "UPRN": "100001238459",
    "Address": "459 Example Road, City 19",
    "Postcode": "CF99 7AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-06-18",
    "SalePrice": 353312,
    "Ratio": 1.14,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.03,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000460",
    "TaskID": "T100460",
    "UPRN": "100001238460",
    "Address": "460 Example Road, City 0",
    "Postcode": "CF09 8AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-02-12",
    "SalePrice": 399281,
    "Ratio": 0.91,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.97,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000461",
    "TaskID": "T100461",
    "UPRN": "100001238461",
    "Address": "461 Example Road, City 1",
    "Postcode": "CF17 4AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-02-27",
    "SalePrice": 333747,
    "Ratio": 0.88,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.87,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000462",
    "TaskID": "T100462",
    "UPRN": "100001238462",
    "Address": "462 Example Road, City 2",
    "Postcode": "CF29 7AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-12-01",
    "SalePrice": 644915,
    "Ratio": 0.88,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.9,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000463",
    "TaskID": "T100463",
    "UPRN": "100001238463",
    "Address": "463 Example Road, City 3",
    "Postcode": "CF36 2AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-01-22",
    "SalePrice": 467912,
    "Ratio": 0.88,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.83,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000464",
    "TaskID": "T100464",
    "UPRN": "100001238464",
    "Address": "464 Example Road, City 4",
    "Postcode": "CF44 4AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-10-22",
    "SalePrice": 190219,
    "Ratio": 1.07,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.14,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000465",
    "TaskID": "T100465",
    "UPRN": "100001238465",
    "Address": "465 Example Road, City 5",
    "Postcode": "CF56 4AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-06-12",
    "SalePrice": 145082,
    "Ratio": 1.15,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.15,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000466",
    "TaskID": "T100466",
    "UPRN": "100001238466",
    "Address": "466 Example Road, City 6",
    "Postcode": "CF68 1AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-06-06",
    "SalePrice": 428411,
    "Ratio": 1.03,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.29,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000467",
    "TaskID": "T100467",
    "UPRN": "100001238467",
    "Address": "467 Example Road, City 7",
    "Postcode": "CF79 9AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-01-31",
    "SalePrice": 304043,
    "Ratio": 1.03,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.06,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000468",
    "TaskID": "T100468",
    "UPRN": "100001238468",
    "Address": "468 Example Road, City 8",
    "Postcode": "CF89 4AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-09-15",
    "SalePrice": 616008,
    "Ratio": 0.96,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.13,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000469",
    "TaskID": "T100469",
    "UPRN": "100001238469",
    "Address": "469 Example Road, City 9",
    "Postcode": "CF93 9AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-06-16",
    "SalePrice": 403510,
    "Ratio": 0.99,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.92,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000470",
    "TaskID": "T100470",
    "UPRN": "100001238470",
    "Address": "470 Example Road, City 10",
    "Postcode": "CF01 5AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-07-03",
    "SalePrice": 142535,
    "Ratio": 1.03,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.05,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000471",
    "TaskID": "T100471",
    "UPRN": "100001238471",
    "Address": "471 Example Road, City 11",
    "Postcode": "CF19 5AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-12-27",
    "SalePrice": 475605,
    "Ratio": 0.88,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.23,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer07",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000472",
    "TaskID": "T100472",
    "UPRN": "100001238472",
    "Address": "472 Example Road, City 12",
    "Postcode": "CF29 6AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-06-06",
    "SalePrice": 462808,
    "Ratio": 1.02,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.93,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer06",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000473",
    "TaskID": "T100473",
    "UPRN": "100001238473",
    "Address": "473 Example Road, City 13",
    "Postcode": "CF37 7AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-03-03",
    "SalePrice": 332939,
    "Ratio": 0.91,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.84,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000474",
    "TaskID": "T100474",
    "UPRN": "100001238474",
    "Address": "474 Example Road, City 14",
    "Postcode": "CF48 3AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-07-21",
    "SalePrice": 448724,
    "Ratio": 0.86,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.22,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000475",
    "TaskID": "T100475",
    "UPRN": "100001238475",
    "Address": "475 Example Road, City 15",
    "Postcode": "CF55 3AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-02-22",
    "SalePrice": 334032,
    "Ratio": 0.95,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.98,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000476",
    "TaskID": "T100476",
    "UPRN": "100001238476",
    "Address": "476 Example Road, City 16",
    "Postcode": "CF66 4AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-07-14",
    "SalePrice": 555055,
    "Ratio": 1.07,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.01,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000477",
    "TaskID": "T100477",
    "UPRN": "100001238477",
    "Address": "477 Example Road, City 17",
    "Postcode": "CF76 5AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-05-13",
    "SalePrice": 419603,
    "Ratio": 0.85,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.85,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000478",
    "TaskID": "T100478",
    "UPRN": "100001238478",
    "Address": "478 Example Road, City 18",
    "Postcode": "CF84 4AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-04-21",
    "SalePrice": 232271,
    "Ratio": 1.06,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.01,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000479",
    "TaskID": "T100479",
    "UPRN": "100001238479",
    "Address": "479 Example Road, City 19",
    "Postcode": "CF98 8AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-10-15",
    "SalePrice": 627639,
    "Ratio": 1.02,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.0,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer08",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000480",
    "TaskID": "T100480",
    "UPRN": "100001238480",
    "Address": "480 Example Road, City 0",
    "Postcode": "CF04 7AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-06-02",
    "SalePrice": 470877,
    "Ratio": 1.03,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.83,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000481",
    "TaskID": "T100481",
    "UPRN": "100001238481",
    "Address": "481 Example Road, City 1",
    "Postcode": "CF14 5AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-03-22",
    "SalePrice": 164171,
    "Ratio": 1.11,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.0,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000482",
    "TaskID": "T100482",
    "UPRN": "100001238482",
    "Address": "482 Example Road, City 2",
    "Postcode": "CF26 4AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-05-04",
    "SalePrice": 722653,
    "Ratio": 1.1,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.05,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000483",
    "TaskID": "T100483",
    "UPRN": "100001238483",
    "Address": "483 Example Road, City 3",
    "Postcode": "CF35 5AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-05-31",
    "SalePrice": 175456,
    "Ratio": 1.13,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 0.89,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC03"
  },
  {
    "SaleID": "S000484",
    "TaskID": "T100484",
    "UPRN": "100001238484",
    "Address": "484 Example Road, City 4",
    "Postcode": "CF43 5AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-11-11",
    "SalePrice": 538023,
    "Ratio": 0.99,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 1.0,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC01"
  },
  {
    "SaleID": "S000485",
    "TaskID": "T100485",
    "UPRN": "100001238485",
    "Address": "485 Example Road, City 5",
    "Postcode": "CF52 6AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-03-17",
    "SalePrice": 204666,
    "Ratio": 0.98,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier",
      "Key Sale"
    ],
    "OutlierRatio": 0.93,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer09",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000486",
    "TaskID": "T100486",
    "UPRN": "100001238486",
    "Address": "486 Example Road, City 6",
    "Postcode": "CF63 4AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-05-18",
    "SalePrice": 691326,
    "Ratio": 0.93,
    "DwellingType": "Terraced",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.01,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000487",
    "TaskID": "T100487",
    "UPRN": "100001238487",
    "Address": "487 Example Road, City 7",
    "Postcode": "CF73 3AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-01-01",
    "SalePrice": 336267,
    "Ratio": 0.91,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.06,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer04",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000488",
    "TaskID": "T100488",
    "UPRN": "100001238488",
    "Address": "488 Example Road, City 8",
    "Postcode": "CF88 3AA",
    "BillingAuthority": "Carmarthenshire County Council",
    "TransactionDate": "2024-11-09",
    "SalePrice": 652111,
    "Ratio": 1.1,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 0.82,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000489",
    "TaskID": "T100489",
    "UPRN": "100001238489",
    "Address": "489 Example Road, City 9",
    "Postcode": "CF94 9AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-11-14",
    "SalePrice": 605332,
    "Ratio": 0.88,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [],
    "OutlierRatio": 1.12,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC05"
  },
  {
    "SaleID": "S000490",
    "TaskID": "T100490",
    "UPRN": "100001238490",
    "Address": "490 Example Road, City 10",
    "Postcode": "CF08 4AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-01-12",
    "SalePrice": 682919,
    "Ratio": 1.0,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.0,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000491",
    "TaskID": "T100491",
    "UPRN": "100001238491",
    "Address": "491 Example Road, City 11",
    "Postcode": "CF12 6AA",
    "BillingAuthority": "Newport City Council",
    "TransactionDate": "2024-10-15",
    "SalePrice": 417753,
    "Ratio": 0.89,
    "DwellingType": "Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.25,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000492",
    "TaskID": "T100492",
    "UPRN": "100001238492",
    "Address": "492 Example Road, City 12",
    "Postcode": "CF21 8AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-03-21",
    "SalePrice": 599985,
    "Ratio": 1.1,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.26,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "StableTrend"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000493",
    "TaskID": "T100493",
    "UPRN": "100001238493",
    "Address": "493 Example Road, City 13",
    "Postcode": "CF34 2AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-07-17",
    "SalePrice": 435808,
    "Ratio": 0.96,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 0.97,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer03",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000494",
    "TaskID": "T100494",
    "UPRN": "100001238494",
    "Address": "494 Example Road, City 14",
    "Postcode": "CF47 1AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-07-24",
    "SalePrice": 196547,
    "Ratio": 1.03,
    "DwellingType": "Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.2,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000495",
    "TaskID": "T100495",
    "UPRN": "100001238495",
    "Address": "495 Example Road, City 15",
    "Postcode": "CF56 1AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-06-28",
    "SalePrice": 222000,
    "Ratio": 0.92,
    "DwellingType": "Semi-Detached",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.24,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer10",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000496",
    "TaskID": "T100496",
    "UPRN": "100001238496",
    "Address": "496 Example Road, City 16",
    "Postcode": "CF62 8AA",
    "BillingAuthority": "Conwy County Borough Council",
    "TransactionDate": "2024-01-07",
    "SalePrice": 486225,
    "Ratio": 1.11,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.87,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": "QC02"
  },
  {
    "SaleID": "S000497",
    "TaskID": "T100497",
    "UPRN": "100001238497",
    "Address": "497 Example Road, City 17",
    "Postcode": "CF73 4AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-02-07",
    "SalePrice": 744543,
    "Ratio": 1.06,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 0.84,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Completed",
    "AssignedTo": "Valuer05",
    "QCAssignedTo": ""
  },
  {
    "SaleID": "S000498",
    "TaskID": "T100498",
    "UPRN": "100001238498",
    "Address": "498 Example Road, City 18",
    "Postcode": "CF85 6AA",
    "BillingAuthority": "Wrexham County Borough Council",
    "TransactionDate": "2024-02-12",
    "SalePrice": 672865,
    "Ratio": 1.07,
    "DwellingType": "Flat",
    "FlaggedForReview": "Yes",
    "ReviewFlags": [],
    "OutlierRatio": 1.09,
    "OverallFlag": "Exclude",
    "SummaryFlags": [
      "AVMVarianceHigh"
    ],
    "TaskStatus": "Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000499",
    "TaskID": "T100499",
    "UPRN": "100001238499",
    "Address": "499 Example Road, City 19",
    "Postcode": "CF99 8AA",
    "BillingAuthority": "Swansea Council",
    "TransactionDate": "2024-04-30",
    "SalePrice": 619379,
    "Ratio": 0.87,
    "DwellingType": "Terraced",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Key Sale"
    ],
    "OutlierRatio": 1.01,
    "OverallFlag": "Investigate - Can Use",
    "SummaryFlags": [
      "ComparableOK"
    ],
    "TaskStatus": "QA Assigned",
    "AssignedTo": "Valuer02",
    "QCAssignedTo": "QC04"
  },
  {
    "SaleID": "S000500",
    "TaskID": "T100500",
    "UPRN": "100001238500",
    "Address": "500 Example Road, City 0",
    "Postcode": "CF02 5AA",
    "BillingAuthority": "Cardiff City Council",
    "TransactionDate": "2024-05-15",
    "SalePrice": 498459,
    "Ratio": 1.11,
    "DwellingType": "Flat",
    "FlaggedForReview": "No",
    "ReviewFlags": [
      "Outlier"
    ],
    "OutlierRatio": 1.23,
    "OverallFlag": "No Flag",
    "SummaryFlags": [
      "KeySaleManualCheck"
    ],
    "TaskStatus": "New",
    "AssignedTo": "Valuer01",
    "QCAssignedTo": ""
  }
];
