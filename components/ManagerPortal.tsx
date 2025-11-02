import React, { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Property, Tenant, MaintenanceRequest, Transaction, RecurringTransaction, TenantFile, RecurringFrequency, MaintenanceAttachment, PropertyFile, ParkLayout, LateFeeSettings } from '../types';

// Components
import Header from './Header';
import PropertyList from './PropertyList';
import TenantsPage from './TenantsPage';
import MaintenancePage from './MaintenancePage';
import BillingPage from './BillingPage';
import ParkMapPage from './ParkMapPage';

// Modals
import AddPropertyModal from './modals/AddPropertyModal';
import EditPropertyModal from './modals/EditPropertyModal';
import AddTenantModal from './modals/AddTenantModal';
import EditTenantModal from './modals/EditTenantModal';
import AddApplicantModal from './modals/AddApplicantModal';
import AssignTenantModal from './modals/AssignTenantModal';
import AddMaintenanceRequestModal from './modals/AddMaintenanceRequestModal';
import ViewMaintenanceRequestsModal from './modals/ViewMaintenanceRequestsModal';
import CompleteMaintenanceRequestModal from './modals/CompleteMaintenanceRequestModal';
import AddRevenueModal from './modals/AddRevenueModal';
import AddExpenseModal from './modals/AddExpenseModal';
import IncomeStatementModal from './modals/IncomeStatementModal';
import PaymentHistoryModal from './modals/PaymentHistoryModal';
import EditRecurringTransactionModal from './modals/EditRecurringTransactionModal';
import TenantFilesModal from './modals/TenantFilesModal';
import UploadTenantFileModal from './modals/UploadTenantFileModal';
import ViewMaintenanceRequestDetailsModal from './modals/ViewMaintenanceRequestDetailsModal';
import PropertyFilesModal from './modals/PropertyFilesModal';
import UploadPropertyFileModal from './modals/UploadPropertyFileModal';
import LateFeeSettingsModal from './modals/LateFeeSettingsModal';
// Hooks to integrate with backend APIs
import { useCreateProperty, useUpdateProperty, useDeleteProperty } from '../src/hooks/useProperties';

type Page = 'properties' | 'tenants' | 'maintenance' | 'billing' | 'map';

type ModalState =
  | { name: 'addProperty' }
  | { name: 'editProperty', property: Property }
  | { name: 'addTenant', property: Property }
  | { name: 'editTenant', tenant: Tenant }
  | { name: 'addApplicant' }
  | { name: 'assignTenant', applicant: Tenant }
  | { name: 'addRequest', property: Property }
  | { name: 'viewRequests', property: Property }
  | { name: 'viewRequestDetails', request: MaintenanceRequest }
  | { name: 'completeRequest', request: MaintenanceRequest }
  | { name: 'addRevenue' }
  | { name: 'addExpense' }
  | { name: 'incomeStatement' }
  | { name: 'paymentHistory', tenant: Tenant, property: Property | null }
  | { name: 'editRecurring', transaction: RecurringTransaction }
  | { name: 'tenantFiles', tenant: Tenant }
  | { name: 'uploadTenantFile', tenant: Tenant }
  | { name: 'propertyFiles', property: Property }
  | { name: 'uploadPropertyFile', property: Property }
  | { name: 'lateFeeSettings' }
  | null;

interface ManagerPortalProps {
    allData: {
        properties: Property[];
        tenants: Tenant[];
        maintenanceRequests: MaintenanceRequest[];
        transactions: Transaction[];
        recurringTransactions: RecurringTransaction[];
        tenantFiles: TenantFile[];
        propertyFiles: PropertyFile[];
        parkLayout: ParkLayout;
        lateFeeSettings: LateFeeSettings;
    };
    setters: {
        setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
        setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
        setMaintenanceRequests: React.Dispatch<React.SetStateAction<MaintenanceRequest[]>>;
        setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
        setRecurringTransactions: React.Dispatch<React.SetStateAction<RecurringTransaction[]>>;
        setTenantFiles: React.Dispatch<React.SetStateAction<TenantFile[]>>;
        setPropertyFiles: React.Dispatch<React.SetStateAction<PropertyFile[]>>;
        setParkLayout: React.Dispatch<React.SetStateAction<ParkLayout>>;
        setLateFeeSettings: React.Dispatch<React.SetStateAction<LateFeeSettings>>;
    };
    onLogout: () => void;
}


const ManagerPortal: React.FC<ManagerPortalProps> = ({ allData, setters, onLogout }) => {
    const { properties, tenants, maintenanceRequests, transactions, recurringTransactions, tenantFiles, propertyFiles, parkLayout, lateFeeSettings } = allData;
    const { setProperties, setTenants, setMaintenanceRequests, setTransactions, setRecurringTransactions, setTenantFiles, setPropertyFiles, setParkLayout, setLateFeeSettings } = setters;

    const [activePage, setActivePage] = useState<Page>('properties');
    const [modal, setModal] = useState<ModalState>(null);

    // Backend property mutations (invalidate queries on success)
    const createProperty = useCreateProperty();
    const updateProperty = useUpdateProperty();
    const deleteProperty = useDeleteProperty();
    const queryClient = useQueryClient();

    useEffect(() => {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const generatedTransactions: Transaction[] = [];
        const updatedRecurringTransactions = recurringTransactions.map(rt => {
            const updatedRt = { ...rt };
            let lastDate = updatedRt.lastGeneratedDate
                ? new Date(updatedRt.lastGeneratedDate + 'T00:00:00Z')
                : new Date(updatedRt.startDate + 'T00:00:00Z');
            
            let nextDueDate = new Date(lastDate);

            if (updatedRt.lastGeneratedDate) {
                 switch (updatedRt.frequency) {
                    case 'daily': nextDueDate.setUTCDate(nextDueDate.getUTCDate() + 1); break;
                    case 'weekly': nextDueDate.setUTCDate(nextDueDate.getUTCDate() + 7); break;
                    case 'monthly': nextDueDate.setUTCMonth(nextDueDate.getUTCMonth() + 1); break;
                    case 'yearly': nextDueDate.setUTCFullYear(nextDueDate.getUTCFullYear() + 1); break;
                }
            }
            
            const endDate = updatedRt.endDate ? new Date(updatedRt.endDate + 'T00:00:00Z') : null;

            while (nextDueDate <= today && (!endDate || nextDueDate <= endDate)) {
                generatedTransactions.push({
                    id: `tr-${updatedRt.id}-${nextDueDate.toISOString().split('T')[0]}`,
                    type: updatedRt.type,
                    propertyId: updatedRt.propertyId,
                    description: updatedRt.description,
                    category: updatedRt.category,
                    amount: updatedRt.amount,
                    date: nextDueDate.toISOString().split('T')[0],
                    recurringTransactionId: updatedRt.id
                });

                updatedRt.lastGeneratedDate = nextDueDate.toISOString().split('T')[0];
                
                switch (updatedRt.frequency) {
                     case 'daily': nextDueDate.setUTCDate(nextDueDate.getUTCDate() + 1); break;
                    case 'weekly': nextDueDate.setUTCDate(nextDueDate.getUTCDate() + 7); break;
                    case 'monthly': nextDueDate.setUTCMonth(nextDueDate.getUTCMonth() + 1); break;
                    case 'yearly': nextDueDate.setUTCFullYear(nextDueDate.getUTCFullYear() + 1); break;
                }
            }
            return updatedRt;
        });
        
        const hasChanges = JSON.stringify(recurringTransactions) !== JSON.stringify(updatedRecurringTransactions);

        if (lateFeeSettings.isEnabled) {
            const activeProperties = properties.filter(p => p.tenantId);
            activeProperties.forEach(prop => {
                const rentDueDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
                const gracePeriodEnds = new Date(rentDueDate);
                gracePeriodEnds.setUTCDate(gracePeriodEnds.getUTCDate() + lateFeeSettings.gracePeriodDays);

                if (today > gracePeriodEnds) {
                    const currentMonth = today.getUTCMonth();
                    const currentYear = today.getUTCFullYear();

                    const rentPaidThisMonth = transactions.some(t => 
                        t.propertyId === prop.id &&
                        t.category === 'Rent' &&
                        new Date(t.date + 'T00:00:00Z').getUTCMonth() === currentMonth &&
                        new Date(t.date + 'T00:00:00Z').getUTCFullYear() === currentYear
                    );
                    
                    const lateFeeAppliedThisMonth = transactions.some(t => 
                        t.propertyId === prop.id &&
                        t.category === 'Late Fee' &&
                        new Date(t.date + 'T00:00:00Z').getUTCMonth() === currentMonth &&
                        new Date(t.date + 'T00:00:00Z').getUTCFullYear() === currentYear
                    );

                    if (!rentPaidThisMonth && !lateFeeAppliedThisMonth) {
                        let feeAmount = 0;
                        if (lateFeeSettings.feeType === 'fixed') {
                            feeAmount = lateFeeSettings.feeAmount;
                        } else {
                            feeAmount = prop.rent * (lateFeeSettings.feePercentage / 100);
                        }
                        
                        if(feeAmount > 0) {
                            const monthName = today.toLocaleString('default', { month: 'long' });
                            generatedTransactions.push({
                                id: `tr-latefee-${prop.id}-${today.toISOString().split('T')[0]}`,
                                type: 'Revenue',
                                propertyId: prop.id,
                                description: `Late Fee for ${monthName} Rent`,
                                category: 'Late Fee',
                                amount: parseFloat(feeAmount.toFixed(2)),
                                date: today.toISOString().split('T')[0],
                            });
                        }
                    }
                }
            });
        }
        
        if (generatedTransactions.length > 0) {
            const existingTransactionIds = new Set(transactions.map(t => t.id));
            const uniqueNewTransactions = generatedTransactions.filter(t => !existingTransactionIds.has(t.id));
            
            if(uniqueNewTransactions.length > 0) {
              setTransactions(prev => [...prev, ...uniqueNewTransactions]);
            }
        }

        if (hasChanges) {
             setRecurringTransactions(updatedRecurringTransactions);
        }
    }, [recurringTransactions, transactions, properties, lateFeeSettings, setTransactions, setRecurringTransactions]);
    
    const maintenanceRequestsByProperty = useMemo(() => {
        const map = new Map<string, MaintenanceRequest[]>();
        maintenanceRequests.forEach(req => {
            const requests = map.get(req.propertyId) || [];
            requests.push(req);
            map.set(req.propertyId, requests);
        });
        return map;
    }, [maintenanceRequests]);
    
    const handleAddProperty = (propData: Omit<Property, 'id' | 'tenantId'>) => {
        // Debug log: see when handler fires and payload content
        console.log('[UI] AddProperty clicked', propData);
        // Optimistic local add (for offline/local fallback)
        const newProperty: Property = { ...propData, id: `p${Date.now()}`, tenantId: null };
        setProperties(prev => [...prev, newProperty]);
        // Reflect optimistic change in react-query cache so UI shows it even when API data is active
        queryClient.setQueryData<Property[] | undefined>(['properties'], (prev) => {
            if (!prev) return [newProperty];
            return [...prev, newProperty];
        });
        // Send to backend (backend accepts UI aliases like lotNumber/beds/...)
        createProperty.mutate(propData as any, {
            onSuccess: (res: any) => {
                console.log('[API] Create success', res?.status, res?.data);
            },
            onError: (err: any) => {
                console.error('Failed to create property:', err);
                if (err?.response) {
                    alert(`Create failed: ${err.response.status} ${err.response.statusText}`);
                } else {
                    alert(`Create failed: ${String(err?.message || err)}`);
                }
                // Keep local fallback
            },
            onSettled: () => {
                setModal(null);
                // Reconcile with server
                queryClient.invalidateQueries({ queryKey: ['properties'] });
            }
        });
    };
    
    const handleEditProperty = (updatedProperty: Property) => {
        // Optimistic local update
        setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
        // Also update react-query cache so UI updates when API data is active
        queryClient.setQueryData<Property[] | undefined>(['properties'], (prev) => {
            if (!prev) return prev;
            return prev.map(p => p.id === updatedProperty.id ? updatedProperty : p);
        });
        // Prepare payload using UI aliases (backend maps them)
        const { lotNumber, beds, baths, sqft, rent, amenities } = updatedProperty;
        const numericId = Number(updatedProperty.id);
        if (Number.isFinite(numericId)) {
            console.log('[UI] EditProperty calling API', { id: numericId, lotNumber, beds, baths, sqft, rent });
            updateProperty.mutate({ id: numericId, payload: { lotNumber, beds, baths, sqft, rent, amenities } as any }, {
                onSuccess: (res: any) => {
                    console.log('[API] Update success', res?.status, res?.data);
                },
                onError: (err: any) => {
                    console.error('Failed to update property:', err);
                    if (err?.response) {
                        alert(`Update failed: ${err.response.status} ${err.response.statusText}`);
                    } else {
                        alert(`Update failed: ${String(err?.message || err)}`);
                    }
                },
                onSettled: () => {
                    setModal(null);
                    queryClient.invalidateQueries({ queryKey: ['properties'] });
                }
            });
        } else {
            // Local-only update for mock items
            console.warn('[UI] EditProperty skipped API call because ID is not numeric', updatedProperty.id);
            setModal(null);
        }
    };

    const handleDeleteProperty = (propertyId: string) => {
        if(window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
            // Optimistic local delete
            setProperties(prev => prev.filter(p => p.id !== propertyId));
            // Also update react-query cache immediately
            queryClient.setQueryData<Property[] | undefined>(['properties'], (prev) => {
                if (!prev) return prev;
                return prev.filter(p => p.id !== propertyId);
            });
            // Backend delete
            const numericId = Number(propertyId);
            if (Number.isFinite(numericId)) {
                console.log('[UI] DeleteProperty calling API', { id: numericId });
                deleteProperty.mutate(numericId, {
                    onSuccess: (res: any) => {
                        console.log('[API] Delete success', res?.status, res?.data);
                    },
                    onError: (err: any) => {
                        console.error('Failed to delete property:', err);
                        if (err?.response) {
                            alert(`Delete failed: ${err.response.status} ${err.response.statusText}`);
                        } else {
                            alert(`Delete failed: ${String(err?.message || err)}`);
                        }
                    },
                    onSettled: () => {
                        queryClient.invalidateQueries({ queryKey: ['properties'] });
                    }
                });
            }
        }
    };
    
    const handleAddTenant = (tenantData: Omit<Tenant, 'id' | 'propertyId' | 'status'>) => {
        if (!modal || modal.name !== 'addTenant') return;
        const newTenant: Tenant = { ...tenantData, id: `t${Date.now()}`, propertyId: modal.property.id, status: 'Active' };
        setTenants(prev => [...prev, newTenant]);
        setProperties(prev => prev.map(p => p.id === modal.property.id ? { ...p, tenantId: newTenant.id } : p));
        setModal(null);
    };
    
    const handleEditTenant = (updatedTenant: Tenant) => {
        setTenants(prev => prev.map(t => t.id === updatedTenant.id ? updatedTenant : t));
        setModal(null);
    };

    const handleRemoveTenant = (propertyId: string) => {
        if(window.confirm('Are you sure you want to remove this tenant? This will mark the property as vacant.')) {
            const property = properties.find(p => p.id === propertyId);
            if(property && property.tenantId) {
                setTenants(prev => prev.map(t => t.id === property.tenantId ? { ...t, status: 'Disabled', propertyId: null } : t));
                setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, tenantId: null } : p));
            }
        }
    };
    
    const handleAddApplicant = (applicantData: Omit<Tenant, 'id' | 'propertyId' | 'status'>) => {
        const newApplicant: Tenant = { ...applicantData, id: `t${Date.now()}`, propertyId: null, status: 'Applicant' };
        setTenants(prev => [...prev, newApplicant]);
        setModal(null);
    };

    const handleApproveApplicant = (applicant: Tenant) => {
        const vacantProperties = properties.filter(p => !p.tenantId);
        if (vacantProperties.length === 0) {
            alert('No vacant properties available to assign.');
            return;
        }
        setModal({ name: 'assignTenant', applicant });
    };

    const handleAssignTenant = (tenantId: string, propertyId: string) => {
        setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, status: 'Active', propertyId: propertyId } : t));
        setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, tenantId: tenantId } : p));
        setModal(null);
    };

    const handleDeclineApplicant = (applicant: Tenant) => {
        if(window.confirm(`Are you sure you want to decline ${applicant.name}?`)) {
            setTenants(prev => prev.map(t => t.id === applicant.id ? { ...t, status: 'Declined' } : t));
        }
    };

    const handleDisableTenant = (tenant: Tenant) => {
        if(window.confirm(`Are you sure you want to disable ${tenant.name}? This will remove them from their property.`)) {
             setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, status: 'Disabled', propertyId: null } : t));
             if(tenant.propertyId) {
                setProperties(prev => prev.map(p => p.id === tenant.propertyId ? { ...p, tenantId: null } : p));
             }
        }
    };

    const handleAddRequest = (requestData: Omit<MaintenanceRequest, 'id' | 'propertyId' | 'status' | 'completionDetails'>) => {
        if (!modal || (modal.name !== 'addRequest')) return;
        const newRequest: MaintenanceRequest = { ...requestData, id: `m${Date.now()}`, propertyId: modal.property.id, status: 'Active', completionDetails: null };
        setMaintenanceRequests(prev => [...prev, newRequest]);
        setModal(null);
    };

    const handleCompleteRequest = (completionDetails: { hours: number, cost: number, comments: string, messageToTenant: string, attachments?: MaintenanceAttachment[] }) => {
        if (!modal || modal.name !== 'completeRequest') return;
        setMaintenanceRequests(prev => prev.map(r => r.id === modal.request.id ? { ...r, status: 'Completed', completionDetails: { ...completionDetails, completedAt: new Date().toISOString() } } : r));
        
        if (completionDetails.cost > 0) {
            const propertyId = modal.request.propertyId;
            const property = properties.find(p=>p.id === propertyId);
            const expense: Transaction = {
                id: `tr${Date.now()}`,
                type: 'Expense',
                propertyId: propertyId,
                description: `Maintenance for Lot #${property?.lotNumber || 'N/A'}: ${modal.request.description}`,
                category: 'Maintenance',
                amount: completionDetails.cost,
                date: new Date().toISOString().split('T')[0]
            };
            setTransactions(prev => [...prev, expense]);
        }
        
        setModal(null);
    };
    
    const handleAddRecurringTransaction = (data: Omit<RecurringTransaction, 'id' | 'lastGeneratedDate'>) => {
        const newRecurringBase: RecurringTransaction = { ...data, id: `rt${Date.now()}`, lastGeneratedDate: null };
        
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
    
        const newTransactionsToGenerate: Transaction[] = [];
        const newRecurringWithDate = { ...newRecurringBase };
    
        let nextDueDate = new Date(newRecurringWithDate.startDate + 'T00:00:00Z');
        const endDate = newRecurringWithDate.endDate ? new Date(newRecurringWithDate.endDate + 'T00:00:00Z') : null;
    
        while (nextDueDate <= today && (!endDate || nextDueDate <= endDate)) {
            newTransactionsToGenerate.push({
                id: `tr-${newRecurringWithDate.id}-${nextDueDate.toISOString().split('T')[0]}`,
                type: newRecurringWithDate.type,
                propertyId: newRecurringWithDate.propertyId,
                description: newRecurringWithDate.description,
                category: newRecurringWithDate.category,
                amount: newRecurringWithDate.amount,
                date: nextDueDate.toISOString().split('T')[0],
                recurringTransactionId: newRecurringWithDate.id
            });
            newRecurringWithDate.lastGeneratedDate = nextDueDate.toISOString().split('T')[0];
            switch (newRecurringWithDate.frequency) {
                case 'daily': nextDueDate.setUTCDate(nextDueDate.getUTCDate() + 1); break;
                case 'weekly': nextDueDate.setUTCDate(nextDueDate.getUTCDate() + 7); break;
                case 'monthly': nextDueDate.setUTCMonth(nextDueDate.getUTCMonth() + 1); break;
                case 'yearly': nextDueDate.setUTCFullYear(nextDueDate.getUTCFullYear() + 1); break;
            }
        }
    
        if (newTransactionsToGenerate.length > 0) {
            setTransactions(prev => [...prev, ...newTransactionsToGenerate]);
        }
        setRecurringTransactions(prev => [...prev, newRecurringWithDate]);
    };

    const handleAddRevenue = (
        revenueData: Omit<Transaction, 'id' | 'type'>,
        recurringConfig?: { frequency: RecurringFrequency; endDate: string | null }
    ) => {
        setModal(null);
        if (recurringConfig) {
            handleAddRecurringTransaction({
                type: 'Revenue',
                ...revenueData,
                frequency: recurringConfig.frequency,
                startDate: revenueData.date,
                endDate: recurringConfig.endDate,
            });
        } else {
            const newRevenue: Transaction = { ...revenueData, id: `tr${Date.now()}`, type: 'Revenue' };
            setTransactions(prev => [...prev, newRevenue]);
        }
    };

    const handleAddExpense = (
        expenseData: Omit<Transaction, 'id' | 'type'>,
        recurringConfig?: { frequency: RecurringFrequency; endDate: string | null }
    ) => {
        setModal(null);
        if (recurringConfig) {
            handleAddRecurringTransaction({
                type: 'Expense',
                ...expenseData,
                frequency: recurringConfig.frequency,
                startDate: expenseData.date,
                endDate: recurringConfig.endDate,
            });
        } else {
            const newExpense: Transaction = { ...expenseData, id: `tr${Date.now()}`, type: 'Expense' };
            setTransactions(prev => [...prev, newExpense]);
        }
    };

    const handleDeleteTransaction = (transactionId: string) => {
        if(window.confirm('Are you sure you want to delete this transaction?')) {
            setTransactions(prev => prev.filter(t => t.id !== transactionId));
        }
    };

    const handleEditRecurringTransaction = (updated: RecurringTransaction) => {
        setRecurringTransactions(prev => prev.map(rt => rt.id === updated.id ? updated : rt));
        setModal(null);
    };

    const handleDeleteRecurringTransaction = (id: string) => {
        if (window.confirm('Are you sure you want to delete this recurring transaction? This will not delete previously generated transactions.')) {
            setRecurringTransactions(prev => prev.filter(rt => rt.id !== id));
        }
    };

    const handleAddTenantFile = (fileData: Omit<TenantFile, 'id'>) => {
        const newFile: TenantFile = { ...fileData, id: `tf${Date.now()}` };
        setTenantFiles(prev => [...prev, newFile]);
        if (modal && modal.name === 'uploadTenantFile') {
            setModal({ name: 'tenantFiles', tenant: modal.tenant });
        }
    };

    const handleDeleteTenantFile = (fileId: string) => {
        if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
            setTenantFiles(prev => prev.filter(f => f.id !== fileId));
        }
    };

    const handleAddPropertyFile = (fileData: Omit<PropertyFile, 'id'>) => {
        const newFile: PropertyFile = { ...fileData, id: `pf${Date.now()}` };
        setPropertyFiles(prev => [...prev, newFile]);
        if (modal && modal.name === 'uploadPropertyFile') {
            setModal({ name: 'propertyFiles', property: modal.property });
        }
    };

    const handleDeletePropertyFile = (fileId: string) => {
        if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
            setPropertyFiles(prev => prev.filter(f => f.id !== fileId));
        }
    };
    
    const handleSaveLateFeeSettings = (settings: LateFeeSettings) => {
        setLateFeeSettings(settings);
        setModal(null);
    };

    const renderPage = () => {
        switch (activePage) {
            case 'properties':
                return <PropertyList 
                            properties={properties} 
                            tenants={tenants} 
                            maintenanceRequests={maintenanceRequestsByProperty} 
                            onAddTenant={(p) => setModal({ name: 'addTenant', property: p })}
                            onRemoveTenant={handleRemoveTenant}
                            onDeleteProperty={handleDeleteProperty}
                            onEditProperty={(p) => setModal({ name: 'editProperty', property: p })}
                            onAddRequest={(p) => setModal({ name: 'addRequest', property: p })}
                            onViewRequests={(p) => setModal({ name: 'viewRequests', property: p })}
                            onViewFiles={(p) => setModal({ name: 'propertyFiles', property: p })}
                        />;
            case 'tenants':
                return <TenantsPage 
                            tenants={tenants} 
                            properties={properties} 
                            onAddApplicant={() => setModal({ name: 'addApplicant' })} 
                            onApproveApplicant={handleApproveApplicant}
                            onDeclineApplicant={handleDeclineApplicant}
                            onDisableTenant={handleDisableTenant}
                            onEditTenant={(tenant) => setModal({ name: 'editTenant', tenant })}
                            onViewPaymentHistory={(tenant, property) => setModal({ name: 'paymentHistory', tenant, property })}
                            onViewFiles={(tenant) => setModal({ name: 'tenantFiles', tenant })}
                        />;
            case 'maintenance':
                return <MaintenancePage 
                            requests={maintenanceRequests}
                            tenants={tenants}
                            properties={properties}
                            onCompleteRequest={(r) => setModal({ name: 'completeRequest', request: r })}
                            onViewRequestDetails={(r) => setModal({ name: 'viewRequestDetails', request: r })}
                        />;
            case 'billing':
                return <BillingPage 
                            transactions={transactions}
                            properties={properties}
                            recurringTransactions={recurringTransactions}
                            onAddRevenue={() => setModal({ name: 'addRevenue' })}
                            onAddExpense={() => setModal({ name: 'addExpense' })}
                            onDeleteTransaction={handleDeleteTransaction}
                            onGenerateIncomeStatement={() => setModal({ name: 'incomeStatement' })}
                            onEditRecurring={(rt) => setModal({ name: 'editRecurring', transaction: rt })}
                            onDeleteRecurring={handleDeleteRecurringTransaction}
                            onOpenLateFeeSettings={() => setModal({ name: 'lateFeeSettings' })}
                        />;
            case 'map':
                return <ParkMapPage 
                            properties={properties} 
                            tenants={tenants}
                            maintenanceRequests={maintenanceRequestsByProperty}
                            parkLayout={parkLayout}
                            onSetParkLayout={setParkLayout}
                        />;
            default:
                return null;
        }
    };

    const renderModal = () => {
        if (!modal) return null;
        switch (modal.name) {
            case 'addProperty':
                return <AddPropertyModal onClose={() => setModal(null)} onAddProperty={handleAddProperty} />;
            case 'editProperty':
                return <EditPropertyModal property={modal.property} onClose={() => setModal(null)} onEditProperty={handleEditProperty} />;
            case 'addTenant':
                return <AddTenantModal property={modal.property} onClose={() => setModal(null)} onAddTenant={handleAddTenant} />;
            case 'editTenant':
                return <EditTenantModal tenant={modal.tenant} onClose={() => setModal(null)} onEditTenant={handleEditTenant} />;
            case 'addApplicant':
                return <AddApplicantModal onClose={() => setModal(null)} onAddApplicant={handleAddApplicant} />;
            case 'assignTenant':
                return <AssignTenantModal applicant={modal.applicant} vacantProperties={properties.filter(p => !p.tenantId)} onClose={() => setModal(null)} onAssign={handleAssignTenant} />;
            case 'addRequest':
                return <AddMaintenanceRequestModal property={modal.property} tenant={tenants.find(t => t.id === modal.property.tenantId)} onClose={() => setModal(null)} onAddRequest={handleAddRequest} />;
            case 'viewRequests': {
                 const requestsForProp = maintenanceRequestsByProperty.get(modal.property.id) || [];
                return <ViewMaintenanceRequestsModal property={modal.property} requests={requestsForProp} onClose={() => setModal(null)} onCompleteRequest={(r) => setModal({ name: 'completeRequest', request: r })} />;
            }
            case 'viewRequestDetails': {
                const { request } = modal;
                const property = properties.find(p => p.id === request.propertyId);
                const tenant = property ? tenants.find(t => t.id === property.tenantId) : undefined;
                return <ViewMaintenanceRequestDetailsModal
                    request={request}
                    property={property}
                    tenant={tenant}
                    onClose={() => setModal(null)}
                    onCompleteRequest={(r) => {
                        setModal(null);
                        setTimeout(() => setModal({ name: 'completeRequest', request: r }), 50);
                    }}
                />
            }
            case 'completeRequest':
                return <CompleteMaintenanceRequestModal request={modal.request} onClose={() => setModal(null)} onComplete={handleCompleteRequest} />;
            case 'addRevenue':
                return <AddRevenueModal properties={properties} onClose={() => setModal(null)} onAddRevenue={handleAddRevenue} />;
            case 'addExpense':
                return <AddExpenseModal properties={properties} onClose={() => setModal(null)} onAddExpense={handleAddExpense} />;
            case 'incomeStatement':
                return <IncomeStatementModal transactions={transactions} onClose={() => setModal(null)} />;
            case 'paymentHistory':
                return <PaymentHistoryModal 
                            tenant={modal.tenant} 
                            property={modal.property}
                            transactions={transactions} 
                            onClose={() => setModal(null)} 
                        />;
            case 'editRecurring':
                return <EditRecurringTransactionModal
                            properties={properties}
                            recurringTransaction={modal.transaction}
                            onClose={() => setModal(null)}
                            onSave={handleEditRecurringTransaction}
                        />;
            case 'tenantFiles':
                return <TenantFilesModal
                            tenant={modal.tenant}
                            files={tenantFiles.filter(f => f.tenantId === modal.tenant.id)}
                            onClose={() => setModal(null)}
                            onDelete={handleDeleteTenantFile}
                            onTriggerUpload={() => setModal({ name: 'uploadTenantFile', tenant: modal.tenant })}
                        />;
            case 'uploadTenantFile':
                return <UploadTenantFileModal
                            tenant={modal.tenant}
                            onClose={() => setModal({ name: 'tenantFiles', tenant: modal.tenant })}
                            onUpload={handleAddTenantFile}
                        />;
            case 'propertyFiles':
                return <PropertyFilesModal
                            property={modal.property}
                            files={propertyFiles.filter(f => f.propertyId === modal.property.id)}
                            onClose={() => setModal(null)}
                            onDelete={handleDeletePropertyFile}
                            onTriggerUpload={() => setModal({ name: 'uploadPropertyFile', property: modal.property })}
                        />;
            case 'uploadPropertyFile':
                return <UploadPropertyFileModal
                            property={modal.property}
                            onClose={() => setModal({ name: 'propertyFiles', property: modal.property })}
                            onUpload={handleAddPropertyFile}
                        />
            case 'lateFeeSettings':
                return <LateFeeSettingsModal
                            settings={lateFeeSettings}
                            onClose={() => setModal(null)}
                            onSave={handleSaveLateFeeSettings}
                        />;
            default:
                return null;
        }
    };
    
    return (
        <div className="bg-gray-100 min-h-screen">
            <Header activePage={activePage} setActivePage={setActivePage} onAddProperty={() => setModal({ name: 'addProperty' })} onLogout={onLogout} />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {renderPage()}
            </main>
            {renderModal()}
        </div>
    );
};

export default ManagerPortal;