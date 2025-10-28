import React from 'react';
import { RecurringTransaction, Property } from '../../types';
import BaseModal from './BaseModal';
import TrashIcon from '../icons/TrashIcon';

interface ViewRecurringTransactionsModalProps {
  transactions: RecurringTransaction[];
  properties: Property[];
  onClose: () => void;
  onAdd: () => void;
  onEdit: (transaction: RecurringTransaction) => void;
  onDelete: (id: string) => void;
}

const ViewRecurringTransactionsModal: React.FC<ViewRecurringTransactionsModalProps> = ({ transactions, properties, onClose, onAdd, onEdit, onDelete }) => {

  return (
    <BaseModal title="Manage Recurring Transactions" onClose={onClose}>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length > 0 ? transactions.map(rt => {
                const isRevenue = rt.type === 'Revenue';
                // FIX: Use Array.find() for a more robust property lookup, fixing the type error.
                const property = properties.find(p => p.id === rt.propertyId);
                return (
                  <tr key={rt.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rt.description}
                        {property && <div className="text-xs text-gray-500">Lot #{property.lotNumber}</div>}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isRevenue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{rt.type}</span>
                    </td>
                    <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-medium ${isRevenue ? 'text-green-700' : 'text-red-700'}`}>
                        ${rt.amount.toFixed(2)}
                    </td>
                     <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{rt.frequency}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        Start: {new Date(rt.startDate+'T00:00:00Z').toLocaleDateString()}
                        <br />
                        End: {rt.endDate ? new Date(rt.endDate+'T00:00:00Z').toLocaleDateString() : 'None'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button onClick={() => onEdit(rt)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                        <button onClick={() => onDelete(rt.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5 inline-block"/></button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    No recurring transactions have been set up.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="p-4 bg-gray-100 border-t flex justify-between items-center">
        <button type="button" onClick={onAdd} className="bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700">Add New</button>
        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button>
      </div>
    </BaseModal>
  );
};
export default ViewRecurringTransactionsModal;