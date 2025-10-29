import React, { useState } from 'react';
import { MaintenanceRequest, MaintenanceAttachment } from '../../types';
import BaseModal from './BaseModal';
import TrashIcon from '../icons/TrashIcon';

interface CompleteMaintenanceRequestModalProps {
  request: MaintenanceRequest;
  onClose: () => void;
  onComplete: (completionDetails: { hours: number; cost: number; comments: string; messageToTenant: string; attachments?: MaintenanceAttachment[] }) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};


const CompleteMaintenanceRequestModal: React.FC<CompleteMaintenanceRequestModalProps> = ({ request, onClose, onComplete }) => {
  const [hours, setHours] = useState<number | ''>('');
  const [cost, setCost] = useState<number | ''>('');
  const [comments, setComments] = useState('');
  const [messageToTenant, setMessageToTenant] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      // FIX: Add explicit types to reducer arguments to resolve TS error and calculate total size including existing files.
      const newFilesSize = newFiles.reduce((acc: number, file: File) => acc + file.size, 0);
      const existingFilesSize = attachments.reduce((acc: number, file: File) => acc + file.size, 0);

      if (existingFilesSize + newFilesSize > 10 * 1024 * 1024) { // 10MB total limit
        setError('Total file size exceeds 10MB.');
        return;
      }
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof hours !== 'number' || typeof cost !== 'number' || !comments) {
        setError('Please fill out all required fields.');
        return;
    }

    setIsProcessing(true);
    setError('');
    
    try {
        const attachmentData: MaintenanceAttachment[] = await Promise.all(
            attachments.map(async (file) => {
                const fileData = await fileToBase64(file);
                return {
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    fileData: fileData,
                };
            })
        );
        onComplete({ hours, cost, comments, messageToTenant, attachments: attachmentData });
    } catch (err) {
        setError('Failed to process attachments. Please try again.');
        setIsProcessing(false);
    }
  };

  return (
    <BaseModal title="Complete Maintenance Request" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
        <div className="p-4 border rounded-md bg-gray-50">
            <p className="text-sm text-gray-800"><span className="font-semibold">Request Date:</span> {new Date(request.dateStarted).toLocaleDateString()}</p>
            <p className="text-sm text-gray-800 mt-1"><span className="font-semibold">Description:</span> {request.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black">Hours to Complete</label>
              <input type="number" step="0.1" value={hours} onChange={(e) => setHours(Number(e.target.value))} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Cost of Materials ($)</label>
              <input type="number" step="0.01" value={cost} onChange={(e) => setCost(Number(e.target.value))} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-black">Internal Completion Comments</label>
          <textarea value={comments} onChange={(e) => setComments(e.target.value)} required rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          <p className="text-xs text-gray-500 mt-1">These notes are for internal records and will not be visible to the tenant.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-black">Message to Tenant (Optional)</label>
          <textarea value={messageToTenant} onChange={(e) => setMessageToTenant(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          <p className="text-xs text-gray-500 mt-1">This message will be visible to the tenant.</p>
        </div>
        <div>
            <label className="block text-sm font-medium text-black">Attach Receipts or Photos</label>
             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                    <span>Upload files</span>
                    <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB total</p>
                </div>
            </div>
            {attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                    {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                            <span>{file.name}</span>
                            <button type="button" onClick={() => removeAttachment(index)} className="text-red-500 hover:text-red-700">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isProcessing} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300">
                {isProcessing ? 'Processing...' : 'Complete Request'}
            </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default CompleteMaintenanceRequestModal;