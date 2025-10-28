import { fileURLToPath } from "url";

export type UrgencyLevel = 'Routine' | 'Urgent' | 'Emergency';
export type TenantStatus = 'Active' | 'Applicant' | 'Disabled' | 'Declined';
export type TransactionType = 'Revenue' | 'Expense';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type TenantFileCategory = 'Application Phase' | 'Lease Phase' | 'Move-out';
export type PropertyFileCategory = 'Photos' | 'Legal & Financial' | 'Insurance' | 'Maintenance & Improvements' | 'Compliance & Inspections' | 'Other';

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
  notes?: string;
}

export interface MaintenanceAttachment {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string; // base64 encoded
}

export interface MaintenanceRequest {
  id:string;
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
    attachments?: MaintenanceAttachment[];
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
  recurringTransactionId?: string;
}

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  propertyId: string | null;
  description: string;
  category: string;
  amount: number;
  frequency: RecurringFrequency;
  startDate: string; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
  lastGeneratedDate: string | null; // YYYY-MM-DD
}

export interface TenantFile {
  id: string;
  tenantId: string;
  fileName: string;
  fileType: string;
  fileSize: number; // in bytes
  category: TenantFileCategory;
  subcategory: string;
  uploadDate: string; // ISO string
  fileData: string; // base64 encoded file
}

export interface PropertyFile {
  id: string;
  propertyId: string;
  fileName: string;
  fileType: string;
  fileSize: number; // in bytes
  category: PropertyFileCategory;
  subcategory: string;
  uploadDate: string; // ISO string
  fileData: string; // base64 encoded file
}

export type MapCell = 
  | { type: 'empty' } 
  | { type: 'road' } 
  | { type: 'property', propertyId: string };

export type ParkLayout = MapCell[][];
