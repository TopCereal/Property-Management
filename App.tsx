import React, { useState, useMemo } from 'react';
import { Property, Tenant, MaintenanceRequest, Transaction } from './types';

// Components
import Header from './components/Header';
import PropertyList from './components/PropertyList';
import TenantsPage from './components/TenantsPage';
import MaintenancePage from './components/MaintenancePage';
import BillingPage from './components/BillingPage';

// Modals
import AddPropertyModal from './components/modals/AddPropertyModal';
import EditPropertyModal from './components/modals/EditPropertyModal';
import AddTenantModal from './components/modals/AddTenantModal';
import AddApplicantModal from './components/modals/AddApplicantModal';
import AssignTenantModal from './components/modals/AssignTenantModal';
import AddMaintenanceRequestModal from './components/modals/AddMaintenanceRequestModal';
import ViewMaintenanceRequestsModal from './components/modals/ViewMaintenanceRequestsModal';
import CompleteMaintenanceRequestModal from './components/modals/CompleteMaintenanceRequestModal';
import AddRevenueModal from './components/modals/AddRevenueModal';
import AddExpenseModal from './components/modals/AddExpenseModal';

type Page = 'properties' | 'tenants' | 'maintenance' | 'billing';

type ModalState =
  | { name: 'addProperty' }
  | { name: 'editProperty', property: Property }
  | { name: 'addTenant', property: Property }
  | { name: 'addApplicant' }
  | { name: 'assignTenant', applicant: Tenant }
  | { name: 'addRequest', property: Property }
  | { name: 'viewRequests', property: Property }
  | { name: 'completeRequest', request: MaintenanceRequest }
  | { name: 'addRevenue' }
  | { name: 'addExpense' }
  | null;

const App: React.FC = () => {
    // Mock Data
    const [properties, setProperties] = useState<Property[]>([
        { id: 'p1', lotNumber: '101', beds: 3, baths: 2, sqft: 1200, rent: 1500, amenities: 'Washer/Dryer, Dishwasher', tenantId: 't1' },
        { id: 'p2', lotNumber: '102', beds: 2, baths: 1, sqft: 900, rent: 1200, amenities: 'Washer/Dryer', tenantId: null },
        { id: 'p3', lotNumber: '205', beds: 4, baths: 3, sqft: 1800, rent: 2200, amenities: 'Garage, Fireplace', tenantId: 't2' },
    ]);
    const [tenants, setTenants] = useState<Tenant[]>([
        { id: 't1', name: 'John Doe', email: 'john.doe@example.com', phone: '555-1234', status: 'Active', propertyId: 'p1' },
        { id: 't2', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '555-5678', status: 'Active', propertyId: 'p3' },
        { id: 't3', name: 'Sam Wilson', email: 'sam.wilson@example.com', phone: '555-8765', status: 'Applicant', propertyId: null },
    ]);
    const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([
        { id: 'm1', propertyId: 'p1', issues: ['Leaky faucet or pipe'], otherIssue: '', description: 'Kitchen sink is dripping constantly.', dateStarted: '2023-10-20', urgency: 'Routine', authToEnter: true, status: 'Active', completionDetails: null },
    ]);
    const [transactions, setTransactions] = useState<Transaction[]>([
        { id: 'tr1', type: 'Revenue', propertyId: 'p1', description: 'October Rent', category: 'Rent', amount: 1500, date: '2023-10-01' },
        { id: 'tr2', type: 'Expense', propertyId: 'p1', description: 'Plumbing repair for kitchen sink', category: 'Maintenance', amount: 150, date: '2023-10-22' },
        { id: 'tr3', type: 'Revenue', propertyId: 'p3', description: 'October Rent', category: 'Rent', amount: 2200, date: '2023-10-01' },
    ]);
    
    const [activePage, setActivePage] = useState<Page>('properties');
    const [modal, setModal] = useState<ModalState>(null);
    
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

    const handleCompleteRequest = (completionDetails: { hours: number, cost: number, comments: string }) => {
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

    const handleAddRevenue = (revenueData: Omit<Transaction, 'id' | 'type'>) => {
        const newRevenue: Transaction = { ...revenueData, id: `tr${Date.now()}`, type: 'Revenue' };
        setTransactions(prev => [...prev, newRevenue]);
        setModal(null);
    };

    const handleAddExpense = (expenseData: Omit<Transaction, 'id' | 'type'>) => {
        const newExpense: Transaction = { ...expenseData, id: `tr${Date.now()}`, type: 'Expense' };
        setTransactions(prev => [...prev, newExpense]);
        setModal(null);
    };

    const handleDeleteTransaction = (transactionId: string) => {
        if(window.confirm('Are you sure you want to delete this transaction?')) {
            setTransactions(prev => prev.filter(t => t.id !== transactionId));
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
                        />;
            case 'tenants':
                return <TenantsPage 
                            tenants={tenants} 
                            properties={properties} 
                            onAddApplicant={() => setModal({ name: 'addApplicant' })} 
                            onApproveApplicant={handleApproveApplicant}
                            onDeclineApplicant={handleDeclineApplicant}
                            onDisableTenant={handleDisableTenant}
                        />;
            case 'maintenance':
                return <MaintenancePage 
                            requests={maintenanceRequests}
                            tenants={tenants}
                            properties={properties}
                            onCompleteRequest={(r) => setModal({ name: 'completeRequest', request: r })}
                        />;
            case 'billing':
                return <BillingPage 
                            transactions={transactions}
                            properties={properties}
                            onAddRevenue={() => setModal({ name: 'addRevenue' })}
                            onAddExpense={() => setModal({ name: 'addExpense' })}
                            onDeleteTransaction={handleDeleteTransaction}
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
            case 'completeRequest':
                return <CompleteMaintenanceRequestModal request={modal.request} onClose={() => setModal(null)} onComplete={handleCompleteRequest} />;
            case 'addRevenue':
                return <AddRevenueModal properties={properties} onClose={() => setModal(null)} onAddRevenue={handleAddRevenue} />;
            case 'addExpense':
                return <AddExpenseModal properties={properties} onClose={() => setModal(null)} onAddExpense={handleAddExpense} />;
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
