import React from 'react';

type TenantPage = 'dashboard' | 'documents' | 'maintenance' | 'payments';

interface TenantHeaderProps {
  tenantName: string;
  activePage: TenantPage;
  setActivePage: (page: TenantPage) => void;
  onLogout: () => void;
}

const TenantHeader: React.FC<TenantHeaderProps> = ({ tenantName, activePage, setActivePage, onLogout }) => {
  const navItems: { id: TenantPage; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'documents', label: 'My Documents' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'payments', label: 'Payments' },
  ];

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">Tenant Portal</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`text-lg font-medium ${
                  activePage === item.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                } transition duration-150 ease-in-out pb-1`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline text-gray-700">Welcome, {tenantName.split(' ')[0]}!</span>
            <button
              onClick={onLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TenantHeader;
