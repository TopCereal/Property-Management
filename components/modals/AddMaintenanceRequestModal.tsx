
import React, { useState } from 'react';
import { Property, Tenant, MaintenanceRequest, UrgencyLevel } from '../../types';
import { MAINTENANCE_ISSUES } from '../../constants';
import BaseModal from './BaseModal';

interface AddMaintenanceRequestModalProps {
  property: Property;
  tenant: Tenant | undefined | null;
  onClose: () => void;
  onAddRequest: (request: Omit<MaintenanceRequest, 'id' | 'propertyId' | 'status' | 'completionDetails'>) => void;
}

const AddMaintenanceRequestModal: React.FC<AddMaintenanceRequestModalProps> = ({ property, tenant, onClose, onAddRequest }) => {
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [otherIssue, setOtherIssue] = useState('');
  const [description, setDescription] = useState('');
  const [dateStarted, setDateStarted] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Routine');
  const [authToEnter, setAuthToEnter] = useState<boolean>(false);
  
  const handleIssueChange = (issue: string) => {
    setSelectedIssues(prev => 
      prev.includes(issue) ? prev.filter(i => i !== issue) : [...prev, issue]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((selectedIssues.length > 0 || otherIssue) && description && dateStarted) {
      onAddRequest({ issues: selectedIssues, otherIssue, description, dateStarted, urgency, authToEnter });
    }
  };

  return (
    <BaseModal title={`New Maintenance Request for Lot #${property.lotNumber}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p><span className="font-semibold">Tenant:</span> {tenant?.name || 'N/A'}</p>
          <p><span className="font-semibold">Email:</span> {tenant?.email || 'N/A'}</p>
          <p><span className="font-semibold">Address:</span> Lot #{property.lotNumber}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900">Issues *</h3>
          <p className="text-sm text-gray-500">Please check all that apply.</p>
          <div className="mt-4 space-y-4">
            {Object.entries(MAINTENANCE_ISSUES).map(([category, subIssues]) => (
              <div key={category}>
                <h4 className="font-semibold text-gray-700">{category}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2">
                  {subIssues.map(issue => (
                    <label key={issue} className="flex items-center">
                      <input type="checkbox" checked={selectedIssues.includes(issue)} onChange={() => handleIssueChange(issue)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                      <span className="ml-2 text-sm text-gray-600">{issue}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <h4 className="font-semibold text-gray-700">Other</h4>
              <input type="text" value={otherIssue} onChange={e => setOtherIssue(e.target.value)} placeholder="Please specify" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description of the Issue *</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">When did the issue start? *</label>
          <input type="date" value={dateStarted} onChange={e => setDateStarted(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700">Level of Urgency *</h3>
          <div className="mt-2 flex space-x-4">
            {(['Routine', 'Urgent', 'Emergency'] as UrgencyLevel[]).map(level => (
              <label key={level} className="flex items-center">
                <input type="radio" name="urgency" value={level} checked={urgency === level} onChange={() => setUrgency(level)} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                <span className="ml-2 text-sm text-gray-600">{level}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700">Authorization to Enter Without Tenant Present? *</h3>
          <div className="mt-2 flex space-x-4">
            <label className="flex items-center">
              <input type="radio" name="auth" checked={authToEnter === true} onChange={() => setAuthToEnter(true)} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
              <span className="ml-2 text-sm text-gray-600">Yes</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="auth" checked={authToEnter === false} onChange={() => setAuthToEnter(false)} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
              <span className="ml-2 text-sm text-gray-600">No</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Submit Request</button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddMaintenanceRequestModal;
