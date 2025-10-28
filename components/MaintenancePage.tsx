import React, { useState, useMemo } from 'react';
import { MaintenanceRequest, Tenant, Property } from '../types';
import DownloadIcon from './icons/DownloadIcon';
import PaperclipIcon from './icons/PaperclipIcon';

interface MaintenancePageProps {
    requests: MaintenanceRequest[];
    tenants: Tenant[];
    properties: Property[];
    onCompleteRequest: (request: MaintenanceRequest) => void;
    onViewRequestDetails: (request: MaintenanceRequest) => void;
}

const RequestCard: React.FC<{
    request: MaintenanceRequest;
    tenant: Tenant | undefined;
    property: Property | undefined;
    onComplete: () => void;
    onViewDetails: () => void;
}> = ({ request, tenant, property, onComplete, onViewDetails }) => {
    const statusColor = request.status === 'Active' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
    
    const handleCompleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onComplete();
    };

    const handleDownload = (e: React.MouseEvent, fileData: string, fileName: string) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = fileData;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div onClick={onViewDetails} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 cursor-pointer hover:shadow-xl transition-shadow duration-200 flex flex-col justify-between">
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Lot #{property?.lotNumber || 'N/A'}</h3>
                        <p className="text-sm text-gray-800">Tenant: {tenant?.name || 'N/A'}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>{request.status === 'Active' ? 'Pending' : 'Completed'}</span>
                </div>
                <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-800"><span className="font-semibold">Submitted:</span> {new Date(request.dateStarted).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-800"><span className="font-semibold">Urgency:</span> {request.urgency}</p>
                    <div className="mt-2">
                        <p className="font-semibold text-sm text-gray-800">Issues Reported:</p>
                        <ul className="list-disc list-inside text-sm text-gray-800 ml-2">
                            {request.issues.map(issue => <li key={issue}>{issue}</li>)}
                            {request.otherIssue && <li>Other: {request.otherIssue}</li>}
                        </ul>
                    </div>
                    <p className="mt-2 text-sm text-gray-800 bg-gray-50 p-3 rounded-md whitespace-normal break-words">"{request.description}"</p>
                </div>
            </div>
            {request.status === 'Completed' && request.completionDetails ? (
                <div className="bg-green-50 px-5 py-4 border-t">
                     <h4 className="font-semibold text-sm text-green-800">Completion Details</h4>
                     <p className="text-sm text-gray-800 mt-1">Completed on: {new Date(request.completionDetails.completedAt).toLocaleString()}</p>
                    <p className="text-sm text-gray-800">Hours: {request.completionDetails.hours} | Cost: ${request.completionDetails.cost.toFixed(2)}</p>
                    <p className="text-sm mt-2 text-gray-800 bg-white p-2 rounded-md">"{request.completionDetails.comments}"</p>
                    {request.completionDetails.attachments && request.completionDetails.attachments.length > 0 && (
                        <div className="mt-3">
                            <h5 className="text-sm font-semibold text-gray-800 flex items-center"><PaperclipIcon className="w-4 h-4 mr-1"/>Attachments</h5>
                            <ul className="mt-1 space-y-1">
                                {request.completionDetails.attachments.map((file, index) => (
                                    <li key={index} className="flex items-center justify-between text-sm text-gray-600 bg-white p-1 rounded">
                                        <span className="truncate">{file.fileName}</span>
                                        <button onClick={(e) => handleDownload(e, file.fileData, file.fileName)} className="ml-2 text-indigo-500 hover:text-indigo-700">
                                            <DownloadIcon className="w-4 h-4"/>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                 <div className="bg-gray-50 px-5 py-3 border-t text-right">
                    <button onClick={handleCompleteClick} className="text-sm bg-green-500 text-black py-2 px-4 rounded-md hover:bg-green-600 transition duration-150 shadow-sm">
                        Mark as Complete
                    </button>
                </div>
            )}
        </div>
    );
};

const MaintenancePage: React.FC<MaintenancePageProps> = ({ requests, tenants, properties, onCompleteRequest, onViewRequestDetails }) => {
    const [activeFilter, setActiveFilter] = useState<'Pending' | 'Completed'>('Pending');
    
    const tenantMap = useMemo(() => new Map(tenants.map(t => [t.id, t])), [tenants]);
    const propertyMap = useMemo(() => new Map(properties.map(p => [p.id, p])), [properties]);

    const filteredRequests = useMemo(() => {
        const status = activeFilter === 'Pending' ? 'Active' : 'Completed';
        return requests.filter(r => r.status === status).sort((a, b) => new Date(b.dateStarted).getTime() - new Date(a.dateStarted).getTime());
    }, [requests, activeFilter]);

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Maintenance Requests</h2>
            
            <div className="mb-6">
                <div className="flex space-x-2 border-b">
                    {(['Pending', 'Completed'] as const).map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-md ${activeFilter === filter ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {filter} ({filter === 'Pending' ? requests.filter(r => r.status === 'Active').length : requests.filter(r => r.status === 'Completed').length})
                        </button>
                    ))}
                </div>
            </div>

            {filteredRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRequests.map(request => {
                        const property = propertyMap.get(request.propertyId);
                        const tenant = property ? tenantMap.get(property.tenantId || '') : undefined;
                        return (
                            <RequestCard 
                                key={request.id}
                                request={request}
                                tenant={tenant}
                                property={property}
                                onComplete={() => onCompleteRequest(request)}
                                onViewDetails={() => onViewRequestDetails(request)}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20">
                    <h3 className="text-xl font-semibold text-gray-500">No {activeFilter.toLowerCase()} requests</h3>
                    <p className="mt-2 text-gray-400">There are currently no requests with this status.</p>
                </div>
            )}
        </div>
    );
};

export default MaintenancePage;