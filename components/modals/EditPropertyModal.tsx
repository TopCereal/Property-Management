import React, { useState } from 'react';
import { Property } from '../../types';
import BaseModal from './BaseModal';

interface EditPropertyModalProps {
  property: Property;
  onClose: () => void;
  onEditProperty: (property: Property) => void;
}

const EditPropertyModal: React.FC<EditPropertyModalProps> = ({ property, onClose, onEditProperty }) => {
  const [lotNumber, setLotNumber] = useState(property.lotNumber);
  const [beds, setBeds] = useState<number | ''>(property.beds);
  const [baths, setBaths] = useState<number | ''>(property.baths);
  const [sqft, setSqft] = useState<number | ''>(property.sqft);
  const [rent, setRent] = useState<number | ''>(property.rent);
  const [amenities, setAmenities] = useState(property.amenities);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lotNumber && beds && baths && sqft && rent) {
      onEditProperty({ ...property, lotNumber, beds, baths, sqft, rent, amenities });
    }
  };

  return (
    <BaseModal title={`Edit Property: Lot #${property.lotNumber}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Lot Number</label>
          <input type="text" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Beds</label>
              <input type="number" value={beds} onChange={(e) => setBeds(Number(e.target.value))} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Baths</label>
              <input type="number" value={baths} onChange={(e) => setBaths(Number(e.target.value))} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Square Feet</label>
              <input type="number" value={sqft} onChange={(e) => setSqft(Number(e.target.value))} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rent ($)</label>
              <input type="number" value={rent} onChange={(e) => setRent(Number(e.target.value))} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Amenities</label>
          <textarea value={amenities} onChange={(e) => setAmenities(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" rows={3}></textarea>
        </div>
        <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
            <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save Changes</button>
        </div>
      </form>
    </BaseModal>
  );
};

export default EditPropertyModal;