import React from 'react';
import { MaintenanceRequest, Property, Tenant } from '../../types';
import BaseModal from './BaseModal';
import DownloadIcon from '../icons/DownloadIcon';
import PaperclipIcon from '../icons/PaperclipIcon';

interface ViewMaintenanceRequestDetailsModalProps {
  request: MaintenanceRequest;
  property: Property | undefined;
  tenant: Tenant | undefined;
  onClose: () => void;
  onCompleteRequest: (request: MaintenanceRequest) => void;
}

const ViewMaintenanceRequestDetailsModal: React.FC<ViewMaintenanceRequestDetailsModalProps> = ({ request, property, tenant, onClose, onCompleteRequest }) => {
  
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
    <BaseModal title={`Request Details: Lot #${property?.lotNumber || 'N/A'}`} onClose={onClose}>
      <div className="p-6 space-y-4">
        
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-800">Maintenance Request</h3>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColor}`}>{request.status}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
          <div>
            <h4 className="font-semibold text-gray-800">Property Details</h4>
            <p className="text-sm text-gray-800">Lot #: {property?.lotNumber || 'N/A'}</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Tenant Details</h4>
            <p className="text-sm text-gray-800">Name: {tenant?.name || 'N/A'}</p>
            <p className="text-sm text-gray-800">Email: {tenant?.email || 'N/A'}</p>
            <p className="text-sm text-gray-800">Phone: {tenant?.phone || 'N/A'}</p>
          </div>
        </div>

        <div>
            <h4 className="font-semibold text-gray-800">Request Information</h4>
            <div className="mt-2 space-y-1 text-sm text-gray-800">
                <p><span className="font-medium">Date Submitted:</span> {new Date(request.dateStarted + 'T00:00:00').toLocaleDateString()}</p>
                <p><span className="font-medium">Urgency Level:</span> {request.urgency}</p>
                <p><span className="font-medium">Authorized to Enter:</span> {request.authToEnter ? 'Yes' : 'No'}</p>
            </div>
        </div>

        <div>
            <h4 className="font-semibold text-gray-800">Issues Reported</h4>
            <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                <ul className="list-disc list-inside text-sm text-gray-800">
                    {request.issues.map(issue => <li key={issue}>{issue}</li>)}
                    {request.otherIssue && <li>Other: {request.otherIssue}</li>}
                </ul>
            </div>
        </div>

        <div>
            <h4 className="font-semibold text-gray-800">Full Description</h4>
            <p className="mt-2 p-3 bg-gray-50 rounded-md border text-sm text-gray-800 whitespace-pre-wrap">{request.description}</p>
        </div>

        {request.status === 'Completed' && request.completionDetails && (
          <div>
            <h4 className="font-semibold text-gray-800">Completion Details</h4>
            <div className="mt-2 p-3 bg-green-50 border-l-4 border-green-400">
                <p className="text-sm text-gray-800"><span className="font-medium">Completed on:</span> {new Date(request.completionDetails.completedAt).toLocaleString()}</p>
                <p className="text-sm text-gray-800"><span className="font-medium">Hours:</span> {request.completionDetails.hours}</p>
                <p className="text-sm text-gray-800"><span className="font-medium">Cost:</span> ${request.completionDetails.cost.toFixed(2)}</p>
                <p className="text-sm text-gray-800 mt-2">"{request.completionDetails.comments}"</p>
                {request.completionDetails.attachments && request.completionDetails.attachments.length > 0 && (
                    <div className="mt-3">
                        <h5 className="text-sm font-semibold text-gray-800 flex items-center"><PaperclipIcon className="w-4 h-4 mr-1"/>Attachments</h5>
                        <ul className="mt-1 space-y-1">
                            {request.completionDetails.attachments.map((file, index) => (
                                <li key={index} className="flex items-center justify-between text-sm text-gray-600 bg-white p-2 rounded-md border">
                                    <span className="truncate flex-1 mr-2">{file.fileName}</span>
                                    <button onClick={() => handleDownload(file.fileData, file.fileName)} className="text-indigo-600 hover:text-indigo-800 font-medium">
                                        <DownloadIcon className="w-5 h-5"/>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-100 border-t flex justify-end space-x-2">
        {request.status === 'Active' && (
          <button
            onClick={() => onCompleteRequest(request)}
            className="bg-green-600 text-black py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-green-700"
          >
            Mark as Complete
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </BaseModal>
  );
};

export default ViewMaintenanceRequestDetailsModal;