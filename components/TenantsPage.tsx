import React, { useState, useMemo } from 'react';
import { Tenant, Property, TenantStatus } from '../types';
import ExportIcon from './icons/ExportIcon';
import NoteIcon from './icons/NoteIcon';
import FolderIcon from './icons/FolderIcon';

interface TenantsPageProps {
    tenants: Tenant[];
    properties: Property[];
    onAddApplicant: () => void;
    onApproveApplicant: (tenant: Tenant) => void;
    onDeclineApplicant: (tenant: Tenant) => void;
    onDisableTenant: (tenant: Tenant) => void;
    onEditTenant: (tenant: Tenant) => void;
    onViewPaymentHistory: (tenant: Tenant, property: Property | null) => void;
    onViewFiles: (tenant: Tenant) => void;
}

const statusConfig: Record<TenantStatus, { text: string; bg: string; text_color: string; }> = {
    Active: { text: 'Active', bg: 'bg-green-100', text_color: 'text-green-800' },
    Applicant: { text: 'Applicant', bg: 'bg-blue-100', text_color: 'text-blue-800' },
    Disabled: { text: 'Disabled', bg: 'bg-gray-100', text_color: 'text-gray-800' },
    Declined: { text: 'Declined', bg: 'bg-red-100', text_color: 'text-red-800' },
};

const TenantsPage: React.FC<TenantsPageProps> = ({ tenants, properties, onAddApplicant, onApproveApplicant, onDeclineApplicant, onDisableTenant, onEditTenant, onViewPaymentHistory, onViewFiles }) => {
    const [activeFilter, setActiveFilter] = useState<TenantStatus | 'All'>('All');
    
    const propertyMap = useMemo(() => new Map(properties.map(p => [p.id, p])), [properties]);

    const tenantCounts = useMemo(() => {
        const counts: Record<TenantStatus | 'All', number> = {
            All: tenants.length,
            Active: 0,
            Applicant: 0,
            Disabled: 0,
            Declined: 0,
        };
        for (const tenant of tenants) {
            counts[tenant.status]++;
        }
        return counts;
    }, [tenants]);

    const filteredTenants = useMemo(() => {
        if (activeFilter === 'All') return tenants;
        return tenants.filter(t => t.status === activeFilter);
    }, [tenants, activeFilter]);

    const filters: (TenantStatus | 'All')[] = ['All', 'Applicant', 'Active', 'Disabled', 'Declined'];

    const handleExportCSV = () => {
        const csvHeader = ['ID', 'Name', 'Email', 'Phone', 'Status', 'Property Lot #', 'Notes'];
        
        const csvRows = filteredTenants.map(tenant => {
            const property = tenant.propertyId ? propertyMap.get(tenant.propertyId) : null;
            const lotNumber = property ? property.lotNumber : 'N/A';
            
            const escape = (str: string | null | undefined) => {
                if (str === null || str === undefined) return '';
                const s = String(str);
                if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                    return `"${s.replace(/"/g, '""')}"`;
                }
                return s;
            };

            return [
                escape(tenant.id),
                escape(tenant.name),
                escape(tenant.email),
                escape(tenant.phone),
                escape(tenant.status),
                escape(lotNumber),
                escape(tenant.notes)
            ].join(',');
        });

        const csvString = [csvHeader.join(','), ...csvRows].join('\n');
        
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'tenants_export.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">Tenants & Applicants</h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        aria-label="Export tenant data as CSV"
                    >
                        <ExportIcon className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" />
                        Export CSV
                    </button>
                    <button
                        onClick={onAddApplicant}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Add Applicant
                    </button>
                </div>
            </div>
            
            <div className="mb-4">
                <div className="flex space-x-2 border-b">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-md ${activeFilter === filter ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            aria-pressed={activeFilter === filter}
                        >
                            {filter} ({tenantCounts[filter]})
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTenants.length > 0 ? filteredTenants.map(tenant => {
                            const status = statusConfig[tenant.status];
                            const property = tenant.propertyId ? propertyMap.get(tenant.propertyId) : null;
                            return (
                                <tr key={tenant.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <div className="flex items-center">
                                            <span>{tenant.name}</span>
                                            {tenant.notes && <NoteIcon className="w-4 h-4 ml-2 text-gray-500" title={tenant.notes} />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>{tenant.email}</div>
                                        <div>{tenant.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.bg} ${status.text_color}`}>
                                            {status.text}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property ? `Lot #${property.lotNumber}` : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => onEditTenant(tenant)} className="text-gray-600 hover:text-indigo-600">Edit</button>
                                        <button onClick={() => onViewFiles(tenant)} className="text-gray-600 hover:text-indigo-600">Files</button>
                                        {tenant.status === 'Applicant' && (
                                            <>
                                                <button onClick={() => onApproveApplicant(tenant)} className="text-indigo-600 hover:text-indigo-900">Approve</button>
                                                <button onClick={() => onDeclineApplicant(tenant)} className="text-red-600 hover:text-red-900">Decline</button>
                                            </>
                                        )}
                                        {tenant.status === 'Active' && (
                                            <>
                                                <button onClick={() => onViewPaymentHistory(tenant, property)} className="text-indigo-600 hover:text-indigo-900">History</button>
                                                <button onClick={() => onDisableTenant(tenant)} className="text-yellow-600 hover:text-yellow-900">Disable</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-500">
                                    No tenants found for this filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TenantsPage;