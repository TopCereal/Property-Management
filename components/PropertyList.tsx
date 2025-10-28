import React from 'react';
import { Property, Tenant, MaintenanceRequest } from '../types';
import PropertyCard from './PropertyCard';

interface PropertyListProps {
  properties: Property[];
  tenants: Tenant[];
  maintenanceRequests: Map<string, MaintenanceRequest[]>;
  onAddTenant: (property: Property) => void;
  onRemoveTenant: (propertyId: string) => void;
  onDeleteProperty: (propertyId: string) => void;
  onEditProperty: (property: Property) => void;
  onAddRequest: (property: Property) => void;
  onViewRequests: (property: Property) => void;
  onViewFiles: (property: Property) => void;
}

const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  tenants,
  maintenanceRequests,
  onAddTenant,
  onRemoveTenant,
  onDeleteProperty,
  onEditProperty,
  onAddRequest,
  onViewRequests,
  onViewFiles,
}) => {
  if (properties.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-gray-500">No Properties Found</h2>
        <p className="mt-2 text-gray-400">Click "Add Property" to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((prop) => (
        <PropertyCard
          key={prop.id}
          property={prop}
          tenant={tenants.find((t) => t.id === prop.tenantId) || null}
          requests={maintenanceRequests.get(prop.id) || []}
          onAddTenant={() => onAddTenant(prop)}
          onRemoveTenant={() => onRemoveTenant(prop.id)}
          onDeleteProperty={() => onDeleteProperty(prop.id)}
          onEditProperty={() => onEditProperty(prop)}
          onAddRequest={() => onAddRequest(prop)}
          onViewRequests={() => onViewRequests(prop)}
          onViewFiles={() => onViewFiles(prop)}
        />
      ))}
    </div>
  );
};

export default PropertyList;