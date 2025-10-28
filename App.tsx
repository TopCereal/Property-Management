import React, { useState, useMemo, useEffect } from 'react';
import { Property, Tenant, MaintenanceRequest, Transaction, RecurringTransaction, TenantFile, RecurringFrequency, MaintenanceAttachment, PropertyFile, ParkLayout } from './types';

// Components
import Header from './components/Header';
import PropertyList from './components/PropertyList';
import TenantsPage from './components/TenantsPage';
import MaintenancePage from './components/MaintenancePage';
import BillingPage from './components/BillingPage';
import ParkMapPage from './components/ParkMapPage';

// Modals
import AddPropertyModal from './components/modals/AddPropertyModal';
import EditPropertyModal from './components/modals/EditPropertyModal';
import AddTenantModal from './components/modals/AddTenantModal';
import EditTenantModal from './components/modals/EditTenantModal';
import AddApplicantModal from './components/modals/AddApplicantModal';
import AssignTenantModal from './components/modals/AssignTenantModal';
import AddMaintenanceRequestModal from './components/modals/AddMaintenanceRequestModal';
import ViewMaintenanceRequestsModal from './components/modals/ViewMaintenanceRequestsModal';
import CompleteMaintenanceRequestModal from './components/modals/CompleteMaintenanceRequestModal';
import AddRevenueModal from './components/modals/AddRevenueModal';
import AddExpenseModal from './components/modals/AddExpenseModal';
import IncomeStatementModal from './components/modals/IncomeStatementModal';
import PaymentHistoryModal from './components/modals/PaymentHistoryModal';
import EditRecurringTransactionModal from './components/modals/EditRecurringTransactionModal';
import TenantFilesModal from './components/modals/TenantFilesModal';
import UploadTenantFileModal from './components/modals/UploadTenantFileModal';
import ViewMaintenanceRequestDetailsModal from './components/modals/ViewMaintenanceRequestDetailsModal';
import PropertyFilesModal from './components/modals/PropertyFilesModal';
import UploadPropertyFileModal from './components/modals/UploadPropertyFileModal';


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
  | null;

const App: React.FC = () => {
    // Mock Data
    const [properties, setProperties] = useState<Property[]>([
        { id: 'p1', lotNumber: '101', beds: 3, baths: 2, sqft: 1200, rent: 1500, amenities: 'Washer/Dryer, Dishwasher', tenantId: 't1' },
        { id: 'p2', lotNumber: '102', beds: 2, baths: 1, sqft: 900, rent: 1200, amenities: 'Washer/Dryer', tenantId: null },
        { id: 'p3', lotNumber: '205', beds: 4, baths: 3, sqft: 1800, rent: 2200, amenities: 'Garage, Fireplace', tenantId: 't2' },
    ]);
    const [tenants, setTenants] = useState<Tenant[]>([
        { id: 't1', name: 'John Doe', email: 'john.doe@example.com', phone: '555-1234', status: 'Active', propertyId: 'p1', notes: 'Always pays rent on time. Has a small dog named Sparky.' },
        { id: 't2', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '555-5678', status: 'Active', propertyId: 'p3', notes: '' },
        { id: 't3', name: 'Sam Wilson', email: 'sam.wilson@example.com', phone: '555-8765', status: 'Applicant', propertyId: null, notes: 'Good reference from previous landlord.' },
    ]);
    const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([
        { id: 'm1', propertyId: 'p1', issues: ['Leaky faucet or pipe'], otherIssue: '', description: 'Kitchen sink is dripping constantly. It has been getting worse over the last week and is now a steady drip. I have placed a bucket underneath but it fills up every few hours. Please fix as soon as possible as it is wasting a lot of water and the sound is annoying.', dateStarted: '2023-10-20', urgency: 'Routine', authToEnter: true, status: 'Active', completionDetails: null },
    ]);
    const [transactions, setTransactions] = useState<Transaction[]>([
        { id: 'tr1', type: 'Revenue', propertyId: 'p1', description: 'October Rent', category: 'Rent', amount: 1500, date: '2023-10-01' },
        { id: 'tr2', type: 'Expense', propertyId: 'p1', description: 'Plumbing repair for kitchen sink', category: 'Maintenance', amount: 150, date: '2023-10-22' },
        { id: 'tr3', type: 'Revenue', propertyId: 'p3', description: 'October Rent', category: 'Rent', amount: 2200, date: '2023-10-01' },
        { id: 'tr4', type: 'Revenue', propertyId: 'p1', description: 'November Rent', category: 'Rent', amount: 1500, date: '2023-11-01' },
    ]);
    const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
    const [tenantFiles, setTenantFiles] = useState<TenantFile[]>([]);
    const [propertyFiles, setPropertyFiles] = useState<PropertyFile[]>([]);
    const [parkLayout, setParkLayout] = useState<ParkLayout>(() => {
        const layout: ParkLayout = Array(10).fill(null).map(() => Array(15).fill({ type: 'empty' }));
        // Add some roads
        for (let i = 0; i < 15; i++) {
            layout[4][i] = { type: 'road' };
        }
         for (let i = 3; i < 7; i++) {
            layout[i][7] = { type: 'road' };
        }
        // Add some properties from mock data
        layout[3][2] = { type: 'property', propertyId: 'p1' };
        layout[3][9] = { type: 'property', propertyId: 'p3' };
        layout[5][5] = { type: 'property', propertyId: 'p2' };
        return layout;
    });
    
    const [activePage, setActivePage] = useState<Page>('properties');
    const [modal, setModal] = useState<ModalState>(null);

     useEffect(() => {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const newTransactions: Transaction[] = [];
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
                newTransactions.push({
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

        if (newTransactions.length > 0) {
            const existingTransactionIds = new Set(transactions.map(t => t.id));
            const uniqueNewTransactions = newTransactions.filter(t => !existingTransactionIds.has(t.id));
            
            if(uniqueNewTransactions.length > 0) {
              setTransactions(prev => [...prev, ...uniqueNewTransactions]);
            }
        }

        if (hasChanges) {
             setRecurringTransactions(updatedRecurringTransactions);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
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
        const newProperty: Property = { ...propData, id: `p${Date.now()}`, tenantId: null };
        setProperties(prev => [...prev, newProperty]);
        setModal(null);
    };
    
    const handleEditProperty = (updatedProperty: Property) => {
        setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
        setModal(null);
    };

    const handleDeleteProperty = (propertyId: string) => {
        if(window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
            setProperties(prev => prev.filter(p => p.id !== propertyId));
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

    const handleCompleteRequest = (completionDetails: { hours: number, cost: number, comments: string, attachments?: MaintenanceAttachment[] }) => {
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
            default:
                return null;
        }
    };
    
    return (
        <div className="bg-gray-100 min-h-screen">
            <Header activePage={activePage} setActivePage={setActivePage} onAddProperty={() => setModal({ name: 'addProperty' })} />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {renderPage()}
            </main>
            {renderModal()}
        </div>
    );
};

export default App;
