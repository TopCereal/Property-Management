import React, { useState } from 'react';
import { Tenant } from '../types';

interface LoginPageProps {
  tenants: Tenant[];
  onLogin: (role: 'manager' | 'tenant', tenantId?: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ tenants, onLogin }) => {
  const [selectedLogin, setSelectedLogin] = useState<'manager' | string>('manager');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLogin === 'manager') {
      onLogin('manager');
    } else {
      onLogin('tenant', selectedLogin);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Prop-Ease Management</h1>
          <p className="text-gray-500 mt-2">Please select your role to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="loginAs" className="block text-sm font-medium text-gray-700">
              Log in as
            </label>
            <select
              id="loginAs"
              value={selectedLogin}
              onChange={(e) => setSelectedLogin(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="manager">Manager</option>
              <optgroup label="Tenants">
                {tenants.filter(t => t.status === 'Active').map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} (Lot #{tenant.propertyId ? tenant.propertyId.replace('p', '') : 'N/A'})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
