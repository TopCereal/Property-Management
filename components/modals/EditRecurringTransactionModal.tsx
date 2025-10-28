import React, { useState } from 'react';
import { Property, RecurringTransaction, TransactionType, RecurringFrequency } from '../../types';
import { EXPENSE_CATEGORIES } from '../../constants';
import BaseModal from './BaseModal';

const REVENUE_CATEGORIES = ['Rent', 'Late Fee', 'Security Deposit', 'Other'];

interface EditRecurringTransactionModalProps {
  properties: Property[];
  recurringTransaction: RecurringTransaction;
  onClose: () => void;
  onSave: (data: RecurringTransaction) => void;
}

const EditRecurringTransactionModal: React.FC<EditRecurringTransactionModalProps> = ({ properties, recurringTransaction, onClose, onSave }) => {
  
  const [type, setType] = useState<TransactionType>(recurringTransaction.type);
  const [propertyId, setPropertyId] = useState<string | null>(recurringTransaction.propertyId);
  const [description, setDescription] = useState(recurringTransaction.description);
  const [category, setCategory] = useState(recurringTransaction.category);
  const [amount, setAmount] = useState<number | ''>(recurringTransaction.amount);
  const [frequency, setFrequency] = useState<RecurringFrequency>(recurringTransaction.frequency);
  const [startDate, setStartDate] = useState(recurringTransaction.startDate);
  const [endDate, setEndDate] = useState(recurringTransaction.endDate || '');
  
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'Revenue') {
        if (!REVENUE_CATEGORIES.includes(category)) {
            setCategory(REVENUE_CATEGORIES[0]);
        }
    } else {
        const allExpenseCategories = Object.values(EXPENSE_CATEGORIES).flat();
        if (!allExpenseCategories.includes(category)) {
            setCategory(Object.values(EXPENSE_CATEGORIES)[0][0]);
        }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !category || typeof amount !== 'number' || !startDate) return;

    const data = {
      type,
      propertyId,
      description,
      category,
      amount,
      frequency,
      startDate,
      endDate: endDate || null,
    };
    
    onSave({ ...recurringTransaction, ...data });
  };
  
  const categories = type === 'Revenue' ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <BaseModal title="Edit Recurring Transaction" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <button type="button" onClick={() => handleTypeChange('Revenue')} className={`px-4 py-2 rounded-l-md border text-sm font-medium flex-1 ${type === 'Revenue' ? 'bg-indigo-600 text-white border-indigo-600 z-10' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Revenue</button>
            <button type="button" onClick={() => handleTypeChange('Expense')} className={`-ml-px px-4 py-2 rounded-r-md border text-sm font-medium flex-1 ${type === 'Expense' ? 'bg-indigo-600 text-white border-indigo-600 z-10' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Expense</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                 <select value={category} onChange={(e) => setCategory(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                    {Array.isArray(categories) ? (
                        categories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                    ) : (
                        Object.entries(categories).map(([groupLabel, options]) => (
                            <optgroup label={groupLabel} key={groupLabel}>
                                {options.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </optgroup>
                        ))
                    )}
                 </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Property (Optional)</label>
          <select value={propertyId || ''} onChange={(e) => setPropertyId(e.target.value || null)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
            <option value="">General (No Property)</option>
            {properties.map(p => <option key={p.id} value={p.id}>Lot #{p.lotNumber}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Frequency</label>
              <select value={frequency} onChange={e => setFrequency(e.target.value as RecurringFrequency)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
            </div>
        </div>
        <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Save</button>
        </div>
      </form>
    </BaseModal>
  );
};
export default EditRecurringTransactionModal;
