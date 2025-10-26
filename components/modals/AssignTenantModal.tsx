import React, { useState } from 'react';
import { Tenant, Property } from '../../types';
import BaseModal from './BaseModal';

interface AssignTenantModalProps {
  applicant: Tenant;
  vacantProperties: Property[];
  onClose: () => void;
  onAssign: (tenantId: string, propertyId: string) => void;
}

const AssignTenantModal: React.FC<AssignTenantModalProps> = ({ applicant, vacantProperties, onClose, onAssign }) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(vacantProperties[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPropertyId) {
      onAssign(applicant.id, selectedPropertyId);
    }
  };

  return (
    <BaseModal title={`Assign ${applicant.name} to a Property`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {vacantProperties.length > 0 ? (
          <div>
            <label className="block text-sm font-medium text-gray-700">Select a Vacant Property</label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {vacantProperties.map(prop => (
                <option key={prop.id} value={prop.id}>
                  Lot #{prop.lotNumber} ({prop.beds}b/{prop.baths}b, ${prop.rent}/mo)
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-center text-gray-600 bg-gray-100 p-4 rounded-md">
            There are no vacant properties available to assign.
          </p>
        )}
        <div className="flex justify-end pt-4">
          <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
          {vacantProperties.length > 0 && (
            <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Assign Tenant</button>
          )}
        </div>
      </form>
    </BaseModal>
  );
};

export default AssignTenantModal;