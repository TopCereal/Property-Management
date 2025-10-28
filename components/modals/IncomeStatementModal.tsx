import React, { useState, useMemo } from 'react';
import { Transaction } from '../../types';
import BaseModal from './BaseModal';

interface IncomeStatementModalProps {
  transactions: Transaction[];
  onClose: () => void;
}

type Range = 'lastMonth' | 'lastQuarter' | 'ytd';

const IncomeStatementModal: React.FC<IncomeStatementModalProps> = ({ transactions, onClose }) => {
  const [range, setRange] = useState<Range>('lastMonth');

  const { startDate, endDate, title } = useMemo(() => {
    const today = new Date();
    let start = new Date();
    let end = new Date();
    let rangeTitle = '';

    switch (range) {
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        rangeTitle = `For the Month of ${start.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
        break;
      case 'lastQuarter':
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const lastQuarterYear = currentQuarter === 0 ? today.getFullYear() - 1 : today.getFullYear();
        const lastQuarterStartMonth = currentQuarter === 0 ? 9 : (currentQuarter - 1) * 3;
        start = new Date(lastQuarterYear, lastQuarterStartMonth, 1);
        end = new Date(lastQuarterYear, lastQuarterStartMonth + 3, 0);
        rangeTitle = `For the Quarter Ending ${end.toLocaleDateString()}`;
        break;
      case 'ytd':
        start = new Date(today.getFullYear(), 0, 1);
        end = today;
        rangeTitle = 'Year to Date';
        break;
    }
    return { startDate: start, endDate: end, title: rangeTitle };
  }, [range]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      // Set hours to 0 to include start date fully
      const transactionDate = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate());
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [transactions, startDate, endDate]);

  const { revenue, expenses, totalRevenue, totalExpenses, netIncome } = useMemo(() => {
    const revenueData: Record<string, { transactions: Transaction[], total: number }> = {};
    const expenseData: Record<string, { transactions: Transaction[], total: number }> = {};
    let totalRev = 0;
    let totalExp = 0;

    for (const t of filteredTransactions) {
      if (t.type === 'Revenue') {
        if (!revenueData[t.category]) revenueData[t.category] = { transactions: [], total: 0 };
        revenueData[t.category].transactions.push(t);
        revenueData[t.category].total += t.amount;
        totalRev += t.amount;
      } else {
        if (!expenseData[t.category]) expenseData[t.category] = { transactions: [], total: 0 };
        expenseData[t.category].transactions.push(t);
        expenseData[t.category].total += t.amount;
        totalExp += t.amount;
      }
    }
    return { revenue: revenueData, expenses: expenseData, totalRevenue: totalRev, totalExpenses: totalExp, netIncome: totalRev - totalExp };
  }, [filteredTransactions]);

  const handlePrint = () => {
    window.print();
  };

  const renderSection = (title: string, data: Record<string, { total: number }>, total: number) => (
    <div className="mb-6">
      <h3 className="text-xl font-semibold border-b pb-2 mb-2 text-gray-800">{title}</h3>
      {Object.entries(data).length > 0 ? Object.entries(data).map(([category, { total: categoryTotal }]) => (
        <div key={category} className="flex justify-between py-1 text-gray-700">
          <span>{category}</span>
          <span>${categoryTotal.toFixed(2)}</span>
        </div>
      )) : <p className="text-gray-500 py-2">No {title.toLowerCase()} recorded for this period.</p>}
      <div className="flex justify-between font-bold text-lg border-t-2 mt-2 pt-2">
        <span>Total {title}</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
  
  return (
    <BaseModal title="Income Statement" onClose={onClose}>
        <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .modal-content, .modal-content * {
                  visibility: hidden;
              }
              #income-statement-print-area, #income-statement-print-area * {
                visibility: visible;
              }
              #income-statement-print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
              }
              .no-print {
                  display: none;
              }
            }
        `}</style>
      <div className="p-6">
        <div className="flex justify-center space-x-2 mb-4 no-print">
            {(
                [
                    {key: 'lastMonth', label: 'Last Month'}, 
                    {key: 'lastQuarter', label: 'Last Quarter'},
                    {key: 'ytd', label: 'Year to Date'}
                ] as {key: Range, label: string}[]
            ).map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${range === r.key ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        
        <div id="income-statement-print-area">
            <div className="bg-white p-4 sm:p-6 rounded-lg border">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">Income Statement</h2>
                    <p className="text-gray-600">{title}</p>
                    <p className="text-sm text-gray-500">{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</p>
                </div>

                {renderSection('Revenue', revenue, totalRevenue)}
                {renderSection('Expenses', expenses, totalExpenses)}

                <div className="mt-8 pt-4 border-t-2 border-gray-800">
                    <div className="flex justify-between font-bold text-xl">
                        <span>Net Income</span>
                        <span className={netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                            ${netIncome.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>

      </div>
      <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2 no-print modal-content">
        <button type="button" onClick={handlePrint} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Print</button>
        <button type="button" onClick={onClose} className="bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700">Close</button>
      </div>
    </BaseModal>
  );
};

export default IncomeStatementModal;