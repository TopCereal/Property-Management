import React from 'react';
import { Property, MaintenanceRequest } from '../../types';
import BaseModal from './BaseModal';
import DownloadIcon from '../icons/DownloadIcon';
import PaperclipIcon from '../icons/PaperclipIcon';

interface ViewMaintenanceRequestsModalProps {
  property: Property;
  requests: MaintenanceRequest[];
  onClose: () => void;
  onCompleteRequest: (request: MaintenanceRequest) => void;
}

const RequestItem: React.FC<{ request: MaintenanceRequest; onComplete: () => void }> = ({ request, onComplete }) => {
    const statusColor = request.status === 'Active' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
    
    const handleDownload = (fileData: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = fileData;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4 border rounded-md shadow-sm bg-white">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold">Started: {new Date(request.dateStarted).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Urgency: {request.urgency}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>{request.status}</span>
            </div>
            <div className="mt-2">
                <p className="font-semibold text-sm">Issues:</p>
                <ul className="list-disc list-inside text-sm text-gray-500">
                    {request.issues.map(issue => <li key={issue}>{issue}</li>)}
                    {request.otherIssue && <li>Other: {request.otherIssue}</li>}
                </ul>
            </div>
            <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">{request.description}</p>
            {request.status === 'Completed' && request.completionDetails && (
                <div className="mt-2 p-3 bg-green-50 border-l-4 border-green-400">
                    <p className="font-semibold text-sm">Completion Details:</p>
                    <p className="text-sm">Completed on: {new Date(request.completionDetails.completedAt).toLocaleString()}</p>
                    <p className="text-sm">Hours: {request.completionDetails.hours}, Cost: ${request.completionDetails.cost}</p>
                    <p className="text-sm mt-1 italic">"{request.completionDetails.comments}"</p>
                    {request.completionDetails.attachments && request.completionDetails.attachments.length > 0 && (
                        <div className="mt-3">
                            <h5 className="text-sm font-semibold text-gray-800 flex items-center"><PaperclipIcon className="w-4 h-4 mr-1"/>Attachments</h5>
                            <ul className="mt-1 space-y-1">
                                {request.completionDetails.attachments.map((file, index) => (
                                    <li key={index} className="flex items-center justify-between text-sm text-gray-600 bg-white p-1 rounded">
                                        <span className="truncate">{file.fileName}</span>
                                        <button onClick={() => handleDownload(file.fileData, file.fileName)} className="ml-2 text-indigo-500 hover:text-indigo-700">
                                            <DownloadIcon className="w-4 h-4"/>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
            {request.status === 'Active' && (
                <div className="mt-4 text-right">
                    <button onClick={onComplete} className="text-sm bg-green-500 text-black py-1 px-3 rounded-md hover:bg-green-600 transition duration-150">Mark as Complete</button>
                </div>
            )}
        </div>
    );
};

const ViewMaintenanceRequestsModal: React.FC<ViewMaintenanceRequestsModalProps> = ({ property, requests, onClose, onCompleteRequest }) => {
    const activeRequests = requests.filter(r => r.status === 'Active');
    const completedRequests = requests.filter(r => r.status === 'Completed');

    return (
    <BaseModal title={`Maintenance History for Lot #${property.lotNumber}`} onClose={onClose}>
        <div className="p-6 bg-gray-50 space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900">Active Requests ({activeRequests.length})</h3>
                {activeRequests.length > 0 ? (
                    <div className="mt-2 space-y-4">
                        {activeRequests.map(req => <RequestItem key={req.id} request={req} onComplete={() => onCompleteRequest(req)} />)}
                    </div>
                ) : <p className="mt-2 text-sm text-gray-500">No active requests.</p>}
            </div>
             <div>
                <h3 className="text-lg font-medium text-gray-900">Completed Requests ({completedRequests.length})</h3>
                {completedRequests.length > 0 ? (
                    <div className="mt-2 space-y-4">
                        {completedRequests.map(req => <RequestItem key={req.id} request={req} onComplete={() => {}} />)}
                    </div>
                ) : <p className="mt-2 text-sm text-gray-500">No completed requests.</p>}
            </div>
        </div>
        <div className="p-4 bg-gray-100 border-t flex justify-end">
             <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Close</button>
        </div>
    </BaseModal>
  );
};

export default ViewMaintenanceRequestsModal;