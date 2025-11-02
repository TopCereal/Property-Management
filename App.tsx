import React, { useState, useMemo } from 'react';
import { Property, Tenant, MaintenanceRequest, Transaction, RecurringTransaction, TenantFile, RecurringFrequency, MaintenanceAttachment, PropertyFile, ParkLayout, LateFeeSettings } from './types';
import LoginPage from './components/LoginPage';
import ManagerPortal from './components/ManagerPortal';
import TenantPortal from './components/tenant/TenantPortal';
import { useProperties, useCreateProperty } from './src/hooks/useProperties';

const App: React.FC = () => {
    // Properties will be loaded from the backend when available; fall back to local mock data
    const { data: propertiesFromApi = [], isLoading: propertiesLoading } = useProperties() as any;
    const createPropertyMutation = useCreateProperty();

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
    const [lateFeeSettings, setLateFeeSettings] = useState<LateFeeSettings>({
        isEnabled: false,
        gracePeriodDays: 5,
        feeType: 'fixed',
        feeAmount: 50,
        feePercentage: 5,
    });
    const [parkLayout, setParkLayout] = useState<ParkLayout>(() => {
        const layout: ParkLayout = Array(10).fill(null).map(() => Array(15).fill({ type: 'empty' }));
        layout[4][7] = { type: 'road' };
        layout[3][2] = { type: 'property', propertyId: 'p1' };
        layout[3][9] = { type: 'property', propertyId: 'p3' };
        layout[5][5] = { type: 'property', propertyId: 'p2' };
        return layout;
    });

    const [userRole, setUserRole] = useState<'manager' | 'tenant' | null>(null);
    const [loggedInTenantId, setLoggedInTenantId] = useState<string | null>(null);

    const handleLogin = (role: 'manager' | 'tenant', tenantId?: string) => {
        if (role === 'manager') {
            setUserRole('manager');
            setLoggedInTenantId(null);
        } else if (role === 'tenant' && tenantId) {
            setUserRole('tenant');
            setLoggedInTenantId(tenantId);
        }
    };
    
    const handleLogout = () => {
        setUserRole(null);
        setLoggedInTenantId(null);
    };

    const data = {
        properties: propertiesFromApi.length ? propertiesFromApi : properties,
        tenants, maintenanceRequests, transactions, recurringTransactions, tenantFiles, propertyFiles, parkLayout, lateFeeSettings
    };
    const setters = {
        setProperties, setTenants, setMaintenanceRequests, setTransactions, setRecurringTransactions, setTenantFiles, setPropertyFiles, setParkLayout, setLateFeeSettings
    };

    if (!userRole) {
        return <LoginPage tenants={tenants} onLogin={handleLogin} />;
    }

    if (userRole === 'tenant' && loggedInTenantId) {
        const loggedInTenant = tenants.find(t => t.id === loggedInTenantId);
        if (!loggedInTenant) {
            // Should not happen in a real app, but good for safety
            handleLogout();
            return null;
        }

        const tenantProperty = loggedInTenant.propertyId ? properties.find(p => p.id === loggedInTenant.propertyId) : null;
        
        return <TenantPortal
            tenant={loggedInTenant}
            property={tenantProperty || null}
            maintenanceRequests={maintenanceRequests.filter(req => req.propertyId === loggedInTenant.propertyId)}
            transactions={transactions.filter(t => t.propertyId === loggedInTenant.propertyId)}
            files={tenantFiles.filter(f => f.tenantId === loggedInTenantId)}
            onLogout={handleLogout}
            onAddMaintenanceRequest={(requestData) => {
                if (!tenantProperty) return;
                const newRequest: MaintenanceRequest = { ...requestData, id: `m${Date.now()}`, propertyId: tenantProperty.id, status: 'Active', completionDetails: null };
                setMaintenanceRequests(prev => [...prev, newRequest]);
            }}
        />;
    }

    return <ManagerPortal allData={data} setters={setters} onLogout={handleLogout} />;
};

export default App;
