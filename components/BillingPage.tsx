import React, { useState, useMemo } from 'react';
import { Transaction, Property, TransactionType } from '../types';
import TrashIcon from './icons/TrashIcon';

interface BillingPageProps {
  transactions: Transaction[];
  properties: Property[];
  onAddRevenue: () => void;
  onAddExpense: () => void;
  onDeleteTransaction: (transactionId: string) => void;
}

const BillingPage: React.FC<BillingPageProps> = ({ transactions, properties, onAddRevenue, onAddExpense, onDeleteTransaction }) => {
  const [filter, setFilter] = useState<'All' | TransactionType>('All');

  const propertyMap = useMemo(() => new Map(properties.map(p => [p.id, p])), [properties]);

  const filteredTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (filter === 'All') return sorted;
    return sorted.filter(t => t.type === filter);
  }, [transactions, filter]);

  const totalRevenue = useMemo(() => transactions.filter(t => t.type === 'Revenue').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const totalExpenses = useMemo(() => transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Billing & Financials</h2>
        <div className="space-x-2">
          <button
            onClick={onAddRevenue}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            Add Revenue
          </button>
          <button
            onClick={onAddExpense}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <h3 className="text-sm font-medium text-green-800 uppercase">Total Revenue</h3>
          <p className="mt-1 text-3xl font-semibold text-green-900">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <h3 className="text-sm font-medium text-red-800 uppercase">Total Expenses</h3>
          <p className="mt-1 text-3xl font-semibold text-red-900">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg text-center">
          <h3 className="text-sm font-medium text-indigo-800 uppercase">Net Income</h3>
          <p className={`mt-1 text-3xl font-semibold ${netIncome >= 0 ? 'text-indigo-900' : 'text-red-900'}`}>
            ${netIncome.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex space-x-2 border-b">
          {(['All', 'Revenue', 'Expense'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md ${filter === f ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.length > 0 ? filteredTransactions.map(t => {
              const property = t.propertyId ? propertyMap.get(t.propertyId) : null;
              const isRevenue = t.type === 'Revenue';
              return (
                <tr key={t.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isRevenue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{t.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{property ? `Lot #${property.lotNumber}` : 'General'}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${isRevenue ? 'text-green-700' : 'text-red-700'}`}>
                    {isRevenue ? '+' : '-'}${t.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => onDeleteTransaction(t.id)} className="text-gray-400 hover:text-red-600">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillingPage;
