import React, { useMemo } from 'react';
import { Tenant, Property, Transaction } from '../../types';
import BaseModal from './BaseModal';

interface PaymentHistoryModalProps {
  tenant: Tenant;
  property: Property | null;
  transactions: Transaction[];
  onClose: () => void;
}

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({ tenant, property, transactions, onClose }) => {
  const paymentHistory = useMemo(() => {
    if (!tenant.propertyId) return [];
    return transactions
      .filter(t => t.propertyId === tenant.propertyId && t.type === 'Revenue')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, tenant.propertyId]);

  const totalPaid = useMemo(() => {
    return paymentHistory.reduce((sum, t) => sum + t.amount, 0);
  }, [paymentHistory]);

  const modalTitle = `Payment History for ${tenant.name}` + (property ? ` (Lot #${property.lotNumber})` : '');

  return (
    <BaseModal title={modalTitle} onClose={onClose}>
      <div className="p-6">
        {paymentHistory.length > 0 ? (
          <>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentHistory.map(t => (
                    <tr key={t.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{t.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-700">
                        ${t.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100">
                    <tr>
                        <td colSpan={3} className="px-6 py-3 text-right text-sm font-bold text-gray-800 uppercase">Total Paid</td>
                        <td className="px-6 py-3 text-right text-sm font-bold text-gray-800">${totalPaid.toFixed(2)}</td>
                    </tr>
                </tfoot>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-10 px-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700">No Payment History Found</h3>
            <p className="mt-1 text-sm text-gray-500">There are no revenue transactions recorded for this tenant's property.</p>
          </div>
        )}
      </div>
      <div className="p-4 bg-gray-50 border-t flex justify-end">
        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Close</button>
      </div>
    </BaseModal>
  );
};

export default PaymentHistoryModal;
