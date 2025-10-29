import React from 'react';
import { MaintenanceRequest, Property } from '../../types';

interface TenantMaintenancePageProps {
    requests: MaintenanceRequest[];
    property: Property | null;
    onAddRequest: () => void;
    onViewRequestDetails: (request: MaintenanceRequest) => void;
}

const RequestCard: React.FC<{ request: MaintenanceRequest; onViewDetails: () => void; }> = ({ request, onViewDetails }) => {
    const statusColor = request.status === 'Active' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
    
    return (
        <div onClick={onViewDetails} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 cursor-pointer hover:shadow-xl transition-shadow duration-200">
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold text-gray-800">Submitted: {new Date(request.dateStarted + 'T00:00:00Z').toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">Urgency: {request.urgency}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>{request.status}</span>
                </div>
                <div className="mt-4 pt-4 border-t">
                     <p className="font-semibold text-sm text-gray-800">Issues Reported:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                        {request.issues.map(issue => <li key={issue}>{issue}</li>)}
                        {request.otherIssue && <li>Other: {request.otherIssue}</li>}
                    </ul>
                    <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-md line-clamp-2">"{request.description}"</p>
                </div>
            </div>
            {request.status === 'Completed' && (
                 <div className="bg-green-50 px-5 py-3 border-t text-sm text-green-800 font-semibold text-center">
                    Completed on {new Date(request.completionDetails?.completedAt || '').toLocaleDateString()}
                </div>
            )}
        </div>
    );
};

const TenantMaintenancePage: React.FC<TenantMaintenancePageProps> = ({ requests, property, onAddRequest, onViewRequestDetails }) => {
    
    if (!property) {
         return (
            <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Maintenance</h2>
                <p className="mt-4 text-gray-600">You are not assigned to a property, so you cannot submit maintenance requests.</p>
            </div>
        );
    }
    
    const activeRequests = requests.filter(r => r.status === 'Active').sort((a,b) => new Date(b.dateStarted).getTime() - new Date(a.dateStarted).getTime());
    const completedRequests = requests.filter(r => r.status === 'Completed').sort((a,b) => new Date(b.completionDetails?.completedAt || 0).getTime() - new Date(a.completionDetails?.completedAt || 0).getTime());

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">My Maintenance Requests</h2>
                    <p className="mt-1 text-gray-600">Report issues and track their status here.</p>
                </div>
                <button
                    onClick={onAddRequest}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                    Submit New Request
                </button>
            </div>
            
            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Active Requests ({activeRequests.length})</h3>
                    {activeRequests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeRequests.map(req => <RequestCard key={req.id} request={req} onViewDetails={() => onViewRequestDetails(req)} />)}
                        </div>
                    ) : <p className="text-gray-500 bg-gray-50 p-4 rounded-md">You have no active maintenance requests.</p>}
                </div>

                 <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Completed Requests ({completedRequests.length})</h3>
                    {completedRequests.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {completedRequests.map(req => <RequestCard key={req.id} request={req} onViewDetails={() => onViewRequestDetails(req)} />)}
                        </div>
                    ) : <p className="text-gray-500 bg-gray-50 p-4 rounded-md">You have no completed maintenance requests.</p>}
                </div>
            </div>
        </div>
    );
};

export default TenantMaintenancePage;
