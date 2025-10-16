export interface SampleColumnDefinition {
    name: string;
    displayName: string;
    width?: number;
}

export type SampleRecord = Record<string, string>;

export const SAMPLE_COLUMNS: SampleColumnDefinition[] = [
    { name: 'uprn', displayName: 'UPRN', width: 120 },
    { name: 'address', displayName: 'Address', width: 260 },
    { name: 'postcode', displayName: 'Post Code', width: 100 },
    { name: 'transactionid', displayName: 'Transaction ID', width: 140 },
    { name: 'saleprice', displayName: 'Sale Price', width: 110 },
    { name: 'marketvalue', displayName: 'Market Value', width: 120 },
    { name: 'tasktitle', displayName: 'Task Title', width: 220 },
    { name: 'taskstatus', displayName: 'Task Status', width: 110 },
    { name: 'assignedto', displayName: 'Assigned To', width: 140 },
    { name: 'action', displayName: 'Action', width: 120 },
];

export const SAMPLE_RECORDS: SampleRecord[] = [
    {
        uprn: '010051907871',
        address: '10 Market Square, London',
        postcode: 'SW1A 1AA',
        transactionid: 'TRX-00190',
        saleprice: '£510,000',
        marketvalue: '£525,000',
        tasktitle: 'Confirm buyer solicitor details',
        taskstatus: 'Assigned',
        assignedto: 'Alex Johnson',
        action: '🔍 View / Edit',
        saleId: 'SAMPLE-001',
        taskId: 'TASK-001',
    },
    {
        uprn: '010051907872',
        address: '22 High Street, Bristol',
        postcode: 'BS1 4ST',
        transactionid: 'TRX-00191',
        saleprice: '£435,000',
        marketvalue: '£440,000',
        tasktitle: 'Validate comparable sales',
        taskstatus: 'In Review',
        assignedto: 'Maria Chen',
        action: '🔍 View / Edit',
        saleId: 'SAMPLE-002',
        taskId: 'TASK-002',
    },
    {
        uprn: '010051907873',
        address: '5 Riverside Close, York',
        postcode: 'YO1 6DG',
        transactionid: 'TRX-00192',
        saleprice: '£389,000',
        marketvalue: '£395,000',
        tasktitle: 'Check land registry entry',
        taskstatus: 'Assigned',
        assignedto: 'Priya Desai',
        action: '🔍 View / Edit',
        saleId: 'SAMPLE-003',
        taskId: 'TASK-003',
    },
    {
        uprn: '010051907874',
        address: '48 Orchard Way, Manchester',
        postcode: 'M1 2AB',
        transactionid: 'TRX-00193',
        saleprice: '£612,500',
        marketvalue: '£630,000',
        tasktitle: 'Verify postcode assignment',
        taskstatus: 'Completed',
        assignedto: 'James Carter',
        action: '🔍 View / Edit',
        saleId: 'SAMPLE-004',
        taskId: 'TASK-004',
    },
    {
        uprn: '010051907875',
        address: '3 Seaview Terrace, Brighton',
        postcode: 'BN1 1AA',
        transactionid: 'TRX-00194',
        saleprice: '£455,750',
        marketvalue: '£460,200',
        tasktitle: 'Assess market adjustment',
        taskstatus: 'Assigned',
        assignedto: 'Sophie Martin',
        action: '🔍 View / Edit',
        saleId: 'SAMPLE-005',
        taskId: 'TASK-005',
    },
];
