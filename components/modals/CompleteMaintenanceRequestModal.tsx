
import React, { useState } from 'react';
import { MaintenanceRequest } from '../../types';
import BaseModal from './BaseModal';

interface CompleteMaintenanceRequestModalProps {
  request: MaintenanceRequest;
  onClose: () => void;
  onComplete: (completionDetails: { hours: number; cost: number; comments: string }) => void;
}

const CompleteMaintenanceRequestModal: React.FC<CompleteMaintenanceRequestModalProps> = ({ request, onClose, onComplete }) => {
  const [hours, setHours] = useState<number | ''>('');
  const [cost, setCost] = useState<number | ''>('');
  const [comments, setComments] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof hours === 'number' && typeof cost === 'number' && comments) {
      onComplete({ hours, cost, comments });
    }
  };

  return (
    <BaseModal title="Complete Maintenance Request" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="p-4 border rounded-md bg-gray-50">
            <p className="text-sm"><span className="font-semibold">Request Date:</span> {new Date(request.dateStarted).toLocaleDateString()}</p>
            <p className="text-sm"><span className="font-semibold">Description:</span> {request.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hours to Complete</label>
              <input type="number" step="0.1" value={hours} onChange={(e) => setHours(Number(e.target.value))} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cost of Materials ($)</label>
              <input type="number" step="0.01" value={cost} onChange={(e) => setCost(Number(e.target.value))} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Completion Comments</label>
          <textarea value={comments} onChange={(e) => setComments(e.target.value)} required rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
        </div>
        <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
            <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Complete Request</button>
        </div>
      </form>
    </BaseModal>
  );
};

export default CompleteMaintenanceRequestModal;
