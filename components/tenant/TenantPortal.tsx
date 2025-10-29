import React, { useState } from 'react';
import { Tenant, Property, MaintenanceRequest, Transaction, TenantFile } from '../../types';
import TenantHeader from './TenantHeader';
import TenantDashboard from './TenantDashboard';
import TenantDocumentsPage from './TenantDocumentsPage';
import TenantMaintenancePage from './TenantMaintenancePage';
import TenantPaymentsPage from './TenantPaymentsPage';
import AddMaintenanceRequestModal from '../modals/AddMaintenanceRequestModal';
import ViewMaintenanceRequestDetailsModal from '../modals/ViewMaintenanceRequestDetailsModal';


type TenantPage = 'dashboard' | 'documents' | 'maintenance' | 'payments';
type TenantModal = 
    | { name: 'addRequest' }
    | { name: 'viewRequestDetails', request: MaintenanceRequest }
    | null;

interface TenantPortalProps {
    tenant: Tenant;
    property: Property | null;
    maintenanceRequests: MaintenanceRequest[];
    transactions: Transaction[];
    files: TenantFile[];
    onLogout: () => void;
    onAddMaintenanceRequest: (request: Omit<MaintenanceRequest, 'id' | 'propertyId' | 'status' | 'completionDetails'>) => void;
}

const TenantPortal: React.FC<TenantPortalProps> = ({ tenant, property, maintenanceRequests, transactions, files, onLogout, onAddMaintenanceRequest }) => {
    const [activePage, setActivePage] = useState<TenantPage>('dashboard');
    const [modal, setModal] = useState<TenantModal>(null);

    const handleAddRequest = (requestData: Omit<MaintenanceRequest, 'id' | 'propertyId' | 'status' | 'completionDetails'>) => {
        onAddMaintenanceRequest(requestData);
        setModal(null);
    };

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard':
                return <TenantDashboard 
                    tenant={tenant} 
                    property={property} 
                    requests={maintenanceRequests}
                    transactions={transactions}
                    onNavigate={setActivePage} 
                />;
            case 'documents':
                return <TenantDocumentsPage files={files} />;
            case 'maintenance':
                return <TenantMaintenancePage 
                    requests={maintenanceRequests}
                    property={property}
                    onAddRequest={() => setModal({ name: 'addRequest' })}
                    onViewRequestDetails={(request) => setModal({ name: 'viewRequestDetails', request })}
                />;
            case 'payments':
                return <TenantPaymentsPage property={property} transactions={transactions} />;
            default:
                return null;
        }
    };
    
    const renderModal = () => {
        if (!modal || !property) return null;
        switch(modal.name) {
            case 'addRequest':
                return <AddMaintenanceRequestModal
                    property={property}
                    tenant={tenant}
                    onClose={() => setModal(null)}
                    onAddRequest={handleAddRequest}
                />;
            case 'viewRequestDetails':
                return <ViewMaintenanceRequestDetailsModal
                    request={modal.request}
                    property={property}
                    tenant={tenant}
                    onClose={() => setModal(null)}
                />
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <TenantHeader tenantName={tenant.name} activePage={activePage} setActivePage={setActivePage} onLogout={onLogout} />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {renderPage()}
            </main>
            {renderModal()}
        </div>
    );
};

export default TenantPortal;