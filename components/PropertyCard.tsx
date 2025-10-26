import React from 'react';
import { Property, Tenant, MaintenanceRequest } from '../types';
import BedIcon from './icons/BedIcon';
import BathIcon from './icons/BathIcon';
import AreaIcon from './icons/AreaIcon';

interface PropertyCardProps {
  property: Property;
  tenant: Tenant | null;
  requests: MaintenanceRequest[];
  onAddTenant: () => void;
  onRemoveTenant: () => void;
  onDeleteProperty: () => void;
  onEditProperty: () => void;
  onAddRequest: () => void;
  onViewRequests: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  tenant,
  requests,
  onAddTenant,
  onRemoveTenant,
  onDeleteProperty,
  onEditProperty,
  onAddRequest,
  onViewRequests,
}) => {
  const activeRequestsCount = requests.filter(r => r.status === 'Active').length;
  const hasMaintenance = activeRequestsCount > 0;
  const isOccupied = !!tenant;

  const getStatus = () => {
    if (isOccupied) return { text: 'Occupied', color: 'bg-green-100 text-green-800', borderColor: 'border-green-500' };
    return { text: 'Vacant', color: 'bg-blue-100 text-blue-800', borderColor: 'border-blue-500' };
  };

  const status = getStatus();

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden flex flex-col justify-between border-4 ${hasMaintenance ? 'border-yellow-400' : status.borderColor}`}>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-900">Lot #{property.lotNumber}</h3>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
            {status.text}
          </span>
        </div>
        {hasMaintenance && (
          <div className="mt-2 text-sm font-semibold text-yellow-600">
            {activeRequestsCount} Active Maintenance Request{activeRequestsCount > 1 ? 's' : ''}
          </div>
        )}

        <div className="mt-4 flex items-center justify-around text-gray-600 border-t border-b py-3">
          <div className="flex items-center space-x-2">
            <BedIcon className="w-5 h-5" />
            <span>{property.beds} beds</span>
          </div>
          <div className="flex items-center space-x-2">
            <BathIcon className="w-5 h-5" />
            <span>{property.baths} baths</span>
          </div>
          <div className="flex items-center space-x-2">
            <AreaIcon className="w-5 h-5" />
            <span>{property.sqft} sqft</span>
          </div>
        </div>

        <div className="mt-4">
            <p className="text-2xl font-bold text-center">${property.rent}<span className="text-base font-normal text-gray-500">/mo</span></p>
        </div>

        {isOccupied && tenant && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="font-semibold text-gray-700">Tenant: {tenant.name}</p>
            <p className="text-sm text-gray-500">{tenant.email}</p>
            <p className="text-sm text-gray-500">{tenant.phone}</p>
          </div>
        )}
      </div>

      <div className="bg-gray-50 px-5 py-3">
        <div className="space-y-2">
          {isOccupied ? (
            <>
              <button onClick={onAddRequest} className="w-full text-sm bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition duration-150">Add Maintenance Request</button>
              {requests.length > 0 && <button onClick={onViewRequests} className="w-full text-sm bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-150">View Requests</button>}
              <button onClick={onEditProperty} className="w-full text-sm bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-150">Edit Property</button>
              <button onClick={onRemoveTenant} className="w-full text-sm bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-150">Remove Tenant</button>
            </>
          ) : (
            <>
              <button onClick={onAddTenant} className="w-full text-sm bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-150">Add Tenant</button>
              <button onClick={onEditProperty} className="w-full text-sm bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-150">Edit Property</button>
              <button onClick={onDeleteProperty} className="w-full text-sm bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-150 mt-2">Delete Property</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;