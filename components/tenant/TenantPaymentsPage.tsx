import React, { useMemo } from 'react';
import { Property, Transaction } from '../../types';

interface TenantPaymentsPageProps {
  property: Property | null;
  transactions: Transaction[];
}

const TenantPaymentsPage: React.FC<TenantPaymentsPageProps> = ({ property, transactions }) => {

    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions]);

    const { totalCharges, totalPaid, balance } = useMemo(() => {
        let charges = 0;
        let paid = 0;
        transactions.forEach(t => {
            if (t.category === 'Rent' || t.category === 'Late Fee') {
                charges += t.amount;
            } else if (t.type === 'Revenue') { // Consider other payments as paid
                 paid += t.amount;
            }
        });
         // This is a simplified balance calculation. A real ledger would be more complex.
        const rentPayments = transactions.filter(t => t.category === 'Rent' && t.type === 'Revenue').reduce((sum, t) => sum + t.amount, 0);
        paid = rentPayments;

        return { totalCharges: charges, totalPaid: paid, balance: charges - paid };
    }, [transactions]);
    
    const getNextDueDateText = () => {
        if (!property) return 'N/A';
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const rentPaidThisMonth = transactions.some(t => {
            const tDate = new Date(t.date + 'T00:00:00Z');
            return t.category === 'Rent' && tDate.getUTCMonth() === currentMonth && tDate.getUTCFullYear() === currentYear;
        });

        if (rentPaidThisMonth) {
            const nextMonth = new Date(currentYear, currentMonth + 1, 1);
            return `Next payment due on ${nextMonth.toLocaleDateString()}`;
        } else {
             const thisMonth = new Date(currentYear, currentMonth, 1);
            return `Payment for ${thisMonth.toLocaleString('default', { month: 'long' })} is due.`;
        }
    }


    if (!property) {
        return (
            <div className="bg-white shadow-lg rounded-lg p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Payments</h2>
                <p className="mt-4 text-gray-600">You are not assigned to a property, so there is no payment information to display.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Payments</h2>
                <p className="mt-1 text-gray-600">View your transaction history and payment status.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                 <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h3 className="text-sm font-medium text-blue-800 uppercase">Next Payment</h3>
                    <p className="mt-1 text-xl font-semibold text-blue-900">${property.rent.toFixed(2)}</p>
                    <p className="text-sm text-blue-700">{getNextDueDateText()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="text-sm font-medium text-gray-800 uppercase">Account Balance</h3>
                    <p className={`mt-1 text-3xl font-semibold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${balance.toFixed(2)}
                    </p>
                     <p className="text-xs text-gray-500">(Total Charges - Rent Payments)</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                    <h3 className="text-sm font-medium text-green-800 uppercase">Total Paid (Rent)</h3>
                    <p className="mt-1 text-3xl font-semibold text-green-900">${totalPaid.toFixed(2)}</p>
                </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4 mt-8">Transaction History</h3>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Charges</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Payments</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedTransactions.map(t => {
                    const isCharge = t.category === 'Rent' || t.category === 'Late Fee';
                    const isPayment = t.category === 'Rent' && t.type === 'Revenue';
                    
                    return (
                        <tr key={t.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.date + 'T00:00:00Z').toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{t.description} ({t.category})</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                            {isCharge ? `$${t.amount.toFixed(2)}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                            {isPayment ? `$${t.amount.toFixed(2)}` : '-'}
                          </td>
                        </tr>
                    );
                  })}
                  {sortedTransactions.length === 0 && (
                     <tr>
                        <td colSpan={4} className="text-center py-10 text-gray-500">
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

export default TenantPaymentsPage;
