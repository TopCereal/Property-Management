import React, { useState } from 'react';
import { LateFeeSettings } from '../../types';
import BaseModal from './BaseModal';

interface LateFeeSettingsModalProps {
  settings: LateFeeSettings;
  onClose: () => void;
  onSave: (settings: LateFeeSettings) => void;
}

const LateFeeSettingsModal: React.FC<LateFeeSettingsModalProps> = ({ settings, onClose, onSave }) => {
  const [localSettings, setLocalSettings] = useState<LateFeeSettings>(settings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setLocalSettings(prev => ({ ...prev, [name]: checked }));
    } else {
        setLocalSettings(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSettings(prev => ({ ...prev, feeType: e.target.value as 'fixed' | 'percentage' }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
  };

  return (
    <BaseModal title="Late Fee Settings" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <span className="font-medium text-gray-700">Enable Automatic Late Fees</span>
            <label htmlFor="isEnabled" className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    id="isEnabled" 
                    name="isEnabled"
                    className="sr-only peer" 
                    checked={localSettings.isEnabled}
                    onChange={handleChange}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
        </div>

        <div className={!localSettings.isEnabled ? 'opacity-50' : ''}>
            <fieldset disabled={!localSettings.isEnabled} className="space-y-4">
                <div>
                    <label htmlFor="gracePeriodDays" className="block text-sm font-medium text-gray-700">Grace Period (Days)</label>
                    <input
                        type="number"
                        id="gracePeriodDays"
                        name="gracePeriodDays"
                        value={localSettings.gracePeriodDays}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        min="0"
                    />
                    <p className="mt-1 text-xs text-gray-500">Number of days after the due date before a fee is applied.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Fee Type</label>
                    <div className="mt-2 flex space-x-4">
                        <label className="flex items-center">
                            <input type="radio" name="feeType" value="fixed" checked={localSettings.feeType === 'fixed'} onChange={handleRadioChange} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                            <span className="ml-2 text-sm text-gray-700">Fixed Amount</span>
                        </label>
                        <label className="flex items-center">
                            <input type="radio" name="feeType" value="percentage" checked={localSettings.feeType === 'percentage'} onChange={handleRadioChange} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                            <span className="ml-2 text-sm text-gray-700">Percentage of Rent</span>
                        </label>
                    </div>
                </div>

                {localSettings.feeType === 'fixed' ? (
                    <div>
                        <label htmlFor="feeAmount" className="block text-sm font-medium text-gray-700">Fee Amount ($)</label>
                        <input
                            type="number"
                            id="feeAmount"
                            name="feeAmount"
                            value={localSettings.feeAmount}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            min="0"
                            step="0.01"
                        />
                    </div>
                ) : (
                    <div>
                        <label htmlFor="feePercentage" className="block text-sm font-medium text-gray-700">Fee Percentage (%)</label>
                        <input
                            type="number"
                            id="feePercentage"
                            name="feePercentage"
                            value={localSettings.feePercentage}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            min="0"
                            step="0.1"
                        />
                    </div>
                )}
            </fieldset>
        </div>

        <div className="flex justify-end pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Save Settings</button>
        </div>
      </form>
    </BaseModal>
  );
};

export default LateFeeSettingsModal;
