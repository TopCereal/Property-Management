import React from 'react';
import { Tenant, Property, MaintenanceRequest, Transaction } from '../../types';
import BedIcon from '../icons/BedIcon';
import BathIcon from '../icons/BathIcon';
import AreaIcon from '../icons/AreaIcon';

type TenantPage = 'dashboard' | 'documents' | 'maintenance' | 'payments';

interface TenantDashboardProps {
    tenant: Tenant;
    property: Property | null;
    requests: MaintenanceRequest[];
    transactions: Transaction[];
    onNavigate: (page: TenantPage) => void;
}

const TenantDashboard: React.FC<TenantDashboardProps> = ({ tenant, property, requests, transactions, onNavigate }) => {
    const activeRequestsCount = requests.filter(r => r.status === 'Active').length;

    const getNextDueDate = () => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const rentPaidThisMonth = transactions.some(t => {
            const tDate = new Date(t.date + 'T00:00:00Z');
            return t.category === 'Rent' && tDate.getUTCMonth() === currentMonth && tDate.getUTCFullYear() === currentYear;
        });

        if (rentPaidThisMonth) {
            const nextMonth = new Date(currentYear, currentMonth + 1, 1);
            return nextMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' });
        } else {
            const thisMonth = new Date(currentYear, currentMonth, 1);
            return `is due for ${thisMonth.toLocaleString('default', { month: 'long' })}`;
        }
    };

    if (!property) {
        return (
            <div className="bg-white shadow-lg rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Welcome, {tenant.name}!</h2>
                <p className="mt-4 text-gray-600">You are not currently assigned to a property. Please contact management for assistance.</p>
            </div>
        );
    }
    
    return (
        <div>
            <div className="bg-white shadow-lg rounded-lg p-8 mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Welcome home, {tenant.name.split(' ')[0]}!</h2>
                <p className="mt-2 text-gray-600">This is your personal dashboard. Here you can manage your maintenance requests, view documents, and check your payment history.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Property Details Card */}
                <div className="lg:col-span-1 bg-white shadow-lg rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2">My Home</h3>
                    <div className="mt-4">
                        <p className="text-2xl font-semibold">Lot #{property.lotNumber}</p>
                        <div className="mt-4 flex items-center justify-around text-gray-600 border-t border-b py-3">
                            <div className="flex items-center space-x-2"><BedIcon className="w-5 h-5" /><span>{property.beds} beds</span></div>
                            <div className="flex items-center space-x-2"><BathIcon className="w-5 h-5" /><span>{property.baths} baths</span></div>
                            <div className="flex items-center space-x-2"><AreaIcon className="w-5 h-5" /><span>{property.sqft} sqft</span></div>
                        </div>
                         <div className="mt-4">
                            <p className="text-sm text-gray-500">Monthly Rent</p>
                            <p className="text-3xl font-bold text-gray-900">${property.rent.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Payment Card */}
                    <div className="bg-white shadow-lg rounded-lg p-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Payments</h3>
                            <p className="text-gray-600 mt-1">Your next rent payment {getNextDueDate()}.</p>
                        </div>
                        <button onClick={() => onNavigate('payments')} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition">View History</button>
                    </div>

                    {/* Maintenance Card */}
                     <div className="bg-white shadow-lg rounded-lg p-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Maintenance</h3>
                            {activeRequestsCount > 0 ? (
                                <p className="text-yellow-600 font-semibold mt-1">{activeRequestsCount} active request{activeRequestsCount > 1 ? 's' : ''} require attention.</p>
                            ) : (
                                <p className="text-green-600 font-semibold mt-1">No active maintenance requests. All clear!</p>
                            )}
                        </div>
                        <button onClick={() => onNavigate('maintenance')} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition">Manage Requests</button>
                    </div>

                    {/* Documents Card */}
                     <div className="bg-white shadow-lg rounded-lg p-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">My Documents</h3>
                            <p className="text-gray-600 mt-1">Access your lease, application, and other files.</p>
                        </div>
                        <button onClick={() => onNavigate('documents')} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition">View Documents</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenantDashboard;
