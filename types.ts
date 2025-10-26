
export type UrgencyLevel = 'Routine' | 'Urgent' | 'Emergency';
export type TenantStatus = 'Active' | 'Applicant' | 'Disabled' | 'Declined';
export type TransactionType = 'Revenue' | 'Expense';

export interface Property {
  id: string;
  lotNumber: string;
  beds: number;
  baths: number;
  sqft: number;
  rent: number;
  amenities: string;
  tenantId: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: TenantStatus;
  propertyId: string | null;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  issues: string[];
  otherIssue: string;
  description: string;
  dateStarted: string;
  urgency: UrgencyLevel;
  authToEnter: boolean;
  status: 'Active' | 'Completed';
  completionDetails: {
    completedAt: string;
    hours: number;
    cost: number;
    comments: string;
  } | null;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  propertyId: string | null;
  description: string;
  category: string;
  amount: number;
  date: string;
}
