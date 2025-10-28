import React, { useState, useMemo } from 'react';
import { Transaction, Property, TransactionType, RecurringTransaction } from '../types';
import TrashIcon from './icons/TrashIcon';
import FilterIcon from './icons/FilterIcon';

interface BillingPageProps {
  transactions: Transaction[];
  properties: Property[];
  recurringTransactions: RecurringTransaction[];
  onAddRevenue: () => void;
  onAddExpense: () => void;
  onDeleteTransaction: (transactionId: string) => void;
  onGenerateIncomeStatement: () => void;
  onEditRecurring: (transaction: RecurringTransaction) => void;
  onDeleteRecurring: (id: string) => void;
}

const BillingPage: React.FC<BillingPageProps> = ({ 
  transactions, 
  properties, 
  recurringTransactions,
  onAddRevenue, 
  onAddExpense, 
  onDeleteTransaction, 
  onGenerateIncomeStatement,
  onEditRecurring,
  onDeleteRecurring
}) => {
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedType, setSelectedType] = useState<'All' | TransactionType>('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProperty, setSelectedProperty] = useState('All');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const propertyMap = useMemo(() => new Map(properties.map(p => [p.id, p])), [properties]);
  
  const uniqueCategories = useMemo(() => {
    const categories = new Set(transactions.map(t => t.category));
    return ['All', ...Array.from(categories).sort()];
  }, [transactions]);
  
  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedType('All');
    setSelectedCategory('All');
    setSelectedProperty('All');
    setMinAmount('');
    setMaxAmount('');
  };

  const filteredTransactions = useMemo(() => {
    let tempTransactions = [...transactions];

    if (selectedType !== 'All') {
        tempTransactions = tempTransactions.filter(t => t.type === selectedType);
    }
    if (dateFrom) {
        tempTransactions = tempTransactions.filter(t => t.date >= dateFrom);
    }
    if (dateTo) {
        tempTransactions = tempTransactions.filter(t => t.date <= dateTo);
    }
    if (selectedCategory !== 'All') {
        tempTransactions = tempTransactions.filter(t => t.category === selectedCategory);
    }
    if (selectedProperty !== 'All') {
        if (selectedProperty === 'general') {
            tempTransactions = tempTransactions.filter(t => t.propertyId === null);
        } else {
            tempTransactions = tempTransactions.filter(t => t.propertyId === selectedProperty);
        }
    }
    const min = parseFloat(minAmount);
    if (!isNaN(min)) {
        tempTransactions = tempTransactions.filter(t => t.amount >= min);
    }
    const max = parseFloat(maxAmount);
    if (!isNaN(max)) {
        tempTransactions = tempTransactions.filter(t => t.amount <= max);
    }
    
    return tempTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedType, dateFrom, dateTo, selectedCategory, selectedProperty, minAmount, maxAmount]);

  const totalRevenue = useMemo(() => filteredTransactions.filter(t => t.type === 'Revenue').reduce((sum, t) => sum + t.amount, 0), [filteredTransactions]);
  const totalExpenses = useMemo(() => filteredTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0), [filteredTransactions]);
  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Financials</h2>
        <div className="space-x-2 flex items-center">
          <button
            onClick={onGenerateIncomeStatement}
            className="hidden sm:inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            Generate Income Statement
          </button>
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
          <h3 className="text-sm font-medium text-green-800 uppercase">Filtered Revenue</h3>
          <p className="mt-1 text-3xl font-semibold text-green-900">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <h3 className="text-sm font-medium text-red-800 uppercase">Filtered Expenses</h3>
          <p className="mt-1 text-3xl font-semibold text-red-900">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg text-center">
          <h3 className="text-sm font-medium text-indigo-800 uppercase">Filtered Net Income</h3>
          <p className={`mt-1 text-3xl font-semibold ${netIncome >= 0 ? 'text-indigo-900' : 'text-red-900'}`}>
            ${netIncome.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="border rounded-md p-4 mb-6">
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center text-indigo-600 font-medium">
          <FilterIcon className="w-5 h-5 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select value={selectedType} onChange={e => setSelectedType(e.target.value as any)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                <option value="All">All Types</option>
                <option value="Revenue">Revenue</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
             {/* Property Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Property</label>
              <select value={selectedProperty} onChange={e => setSelectedProperty(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                <option value="All">All Properties</option>
                <option value="general">General (No Property)</option>
                {properties.map(p => <option key={p.id} value={p.id}>Lot #{p.lotNumber}</option>)}
              </select>
            </div>
            {/* Date Filters */}
            <div className="flex items-end space-x-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date From</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Date To</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                </div>
            </div>
            {/* Amount Filters */}
             <div className="flex items-end space-x-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Min Amount</label>
                    <input type="number" placeholder="0.00" value={minAmount} onChange={e => setMinAmount(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Max Amount</label>
                    <input type="number" placeholder="1000.00" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"/>
                </div>
            </div>
            <div className="flex items-end">
              <button onClick={handleClearFilters} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 w-full">Clear Filters</button>
            </div>
          </div>
        )}
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
                  No transactions found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Recurring Transactions</h3>
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
              {recurringTransactions.length > 0 ? recurringTransactions.map(rt => {
                const isRevenue = rt.type === 'Revenue';
                const property = rt.propertyId ? propertyMap.get(rt.propertyId) : null;
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
                        <button onClick={() => onEditRecurring(rt)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                        <button onClick={() => onDeleteRecurring(rt.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5 inline-block"/></button>
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
    </div>
  );
};

export default BillingPage;
