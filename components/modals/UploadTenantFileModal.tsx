import React, { useState, useMemo, ChangeEvent } from 'react';
import { Tenant, TenantFile, TenantFileCategory } from '../../types';
import { TENANT_FILE_CATEGORIES } from '../../constants';
import BaseModal from './BaseModal';

interface UploadTenantFileModalProps {
  tenant: Tenant;
  onClose: () => void;
  onUpload: (fileData: Omit<TenantFile, 'id'>) => void;
}

const UploadTenantFileModal: React.FC<UploadTenantFileModalProps> = ({ tenant, onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<TenantFileCategory>('Application Phase');
  const [subcategory, setSubcategory] = useState(TENANT_FILE_CATEGORIES['Application Phase'][0]);
  const [error, setError] = useState('');

  const subcategories = useMemo(() => TENANT_FILE_CATEGORIES[category] || [], [category]);

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as TenantFileCategory;
    setCategory(newCategory);
    setSubcategory(TENANT_FILE_CATEGORIES[newCategory][0]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        // Limit file size to 5MB
        if(selectedFile.size > 5 * 1024 * 1024) {
            setError('File is too large. Maximum size is 5MB.');
            setFile(null);
            e.target.value = ''; // Reset the input
        } else {
            setError('');
            setFile(selectedFile);
        }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !category || !subcategory) {
        setError('Please fill out all fields and select a file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64Data = loadEvent.target?.result as string;
      if (base64Data) {
        onUpload({
          tenantId: tenant.id,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          category,
          subcategory,
          uploadDate: new Date().toISOString(),
          fileData: base64Data,
        });
      } else {
          setError('Could not read the file. Please try again.');
      }
    };
    reader.onerror = () => {
        setError('Error reading file.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <BaseModal title={`Upload File for ${tenant.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">File</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} required />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, PDF, DOCX up to 5MB</p>
            </div>
          </div>
          {file && <p className="mt-2 text-sm text-gray-600">Selected: <span className="font-medium">{file.name}</span></p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select id="category" value={category} onChange={handleCategoryChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                {Object.keys(TENANT_FILE_CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">Subcategory</label>
              <select id="subcategory" value={subcategory} onChange={e => setSubcategory(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                {subcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end pt-4">
          <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Upload</button>
        </div>
      </form>
    </BaseModal>
  );
};

export default UploadTenantFileModal;