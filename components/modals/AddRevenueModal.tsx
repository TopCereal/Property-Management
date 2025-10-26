
import React, { useState } from 'react';
import { Property, Transaction } from '../../types';
import BaseModal from './BaseModal';

interface AddRevenueModalProps {
  properties: Property[];
  onClose: () => void;
  onAddRevenue: (revenue: Omit<Transaction, 'id' | 'type'>) => void;
}

const REVENUE_CATEGORIES = ['Rent', 'Late Fee', 'Security Deposit', 'Other'];

const AddRevenueModal: React.FC<AddRevenueModalProps> = ({ properties, onClose, onAddRevenue }) => {
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [category, setCategory] = useState(REVENUE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category && typeof amount === 'number' && date) {
      onAddRevenue({ propertyId, category, description, amount, date });
    }
  };

  return (
    <BaseModal title="Add Revenue" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Property (Optional)</label>
          <select value={propertyId || ''} onChange={(e) => setPropertyId(e.target.value || null)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="">General (No Property)</option>
            {properties.map(p => <option key={p.id} value={p.id}>Lot #{p.lotNumber}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            {REVENUE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
          <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
        </div>
         <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></textarea>
        </div>
        <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">Add Revenue</button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddRevenueModal;
