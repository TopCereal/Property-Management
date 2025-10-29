import React from 'react';

type Page = 'properties' | 'tenants' | 'maintenance' | 'billing' | 'map';

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  onAddProperty: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage, onAddProperty, onLogout }) => {
  const navItems: { id: Page; label: string }[] = [
    { id: 'properties', label: 'Properties' },
    { id: 'tenants', label: 'Tenants' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'billing', label: 'Financials' },
    { id: 'map', label: 'Site Map'},
  ];

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">Prop-Ease Management</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`text-lg font-medium ${
                  activePage === item.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                } transition duration-150 ease-in-out pb-1`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center space-x-2">
            <button
              onClick={onAddProperty}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Property
            </button>
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

export default Header;
