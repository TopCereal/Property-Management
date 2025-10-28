import { TenantFileCategory, PropertyFileCategory } from "./types";

export const MAINTENANCE_ISSUES = {
  "HVAC (Heating, Ventilation, and Air Condition)": [
    "Furnace not heating",
    "A/C",
    "Thermostat malfunctioning",
    "Air filter replacement"
  ],
  "Plumbing": [
    "Leaky faucet or pipe",
    "Clogged or slow drains (sinks, showers, toilets)",
    "Low water pressure",
    "Water heater not working"
  ],
  "Electrical": [
    "Power outages in specific rooms",
    "Malfunctioning outlets or switches",
    "Circuit breaker tripping frequently",
    "Light fixtures not working",
    "Ceiling fan issues"
  ],
  "Appliance not working": [
    "Refrigerator",
    "Stove/oven",
    "Dishwasher",
    "Washing Machine",
    "Garbage disposal"
  ],
  "Structural & Exterior": [
    "Roof leaks",
    "Broken or leaking window",
    "Damaged doors or locks",
    "Siding or skirting damage"
  ],
  "Pest Control": [
    "Rodents (Mice and/or Rats)",
    "Insects (ants, cockroaches, bed bugs, termites)"
  ],
  "General Property Maintenance": [
    "Fence or gate repairs",
    "Clogged gutters"
  ],
  "Safety & Security": [
    "Broken locks or keys not working",
    "Smoke detector issues"
  ]
};

// FIX: Export EXPENSE_CATEGORIES so it can be shared across components.
export const EXPENSE_CATEGORIES = {
  "Cost of Revenue": [
    "Maintenance - Direct Labor",
    "Maintenance - Subcontracted",
    "Utilities - Vacant/Common Area",
  ],
  "Property Operations": [
    "Software & Technology",
    "Marketing & Advertising",
    "Tenant Screening",
    "Lease Preparation",
    "Property Inspections",
    "Eviction Costs",
    "Legal & Compliance",
  ],
  "General & Administrative": [
    "Salaries & Wages",
    "Employee Benefits & Payroll Taxes",
    "Office Rent & Utilities",
    "Office Supplies",
    "Professional Services (Accounting, IT)",
    "Business Communications",
    "Bank Charges",
    "Vehicle Expenses",
    "Insurance (E&O, Liability)",
    "Licenses, Dues & Training",
  ],
  "Property Ownership": [
    "Property Taxes",
    "Mortgage",
    "Property Insurance",
  ],
  "Other": [
    "Management Fee",
    "Other",
  ]
};

export const TENANT_FILE_CATEGORIES: Record<TenantFileCategory, string[]> = {
  'Application Phase': [
    'Rental Application',
    'Proof of Income',
    'Identification',
    'Bank Statements',
    'References',
    'Credit Report & Background Check',
    'Application Correspondence',
    'Rejection Letter',
  ],
  'Lease Phase': [
    'Lease Agreement',
    'Lease Addendums/Riders',
    'Move-In Checklist/Condition Report',
    'Welcome Packet/Tenant Handbook',
    'Proof of Renter\'s Insurance',
    'Payment History/Ledger',
    'Maintenance Requests & Work Orders',
    'Correspondence (General)',
    'Violation Notices',
    'Lease Renewal Offers/Agreements',
  ],
  'Move-out': [
    'Notice to Vacate',
    'Move-Out Checklist/Condition Report',
    'Security Deposit Disposition',
    'Damage Estimates/Invoices',
    'Forwarding Address',
    'Proof of Key Return',
  ],
};

export const PROPERTY_FILE_CATEGORIES: Record<PropertyFileCategory, string[]> = {
  'Photos': [
    'Exterior',
    'Interior',
    'Aerial View',
    'Before & After',
  ],
  'Legal & Financial': [
    'Deed',
    'Title Insurance',
    'Mortgage Documents',
    'Property Tax Records',
    'Appraisal Report',
  ],
  'Insurance': [
    'Homeowners Insurance Policy',
    'Flood Insurance Policy',
    'Liability Insurance',
  ],
  'Maintenance & Improvements': [
    'Renovation Records',
    'Major Repair Invoices',
    'Appliance Warranties',
    'System Warranties (HVAC, Roof)',
  ],
  'Compliance & Inspections': [
    'Home Inspection Report',
    'Pest Inspection Report',
    'Lead-Based Paint Disclosure',
    'Permits',
  ],
  'Other': [
    'HOA Documents',
    'Blueprints',
    'Land Survey',
    'Utility Agreements',
  ],
};