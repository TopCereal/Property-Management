import React from 'react';
import { Tenant, TenantFile, TenantFileCategory } from '../../types';
import { TENANT_FILE_CATEGORIES } from '../../constants';
import BaseModal from './BaseModal';
import TrashIcon from '../icons/TrashIcon';
import DownloadIcon from '../icons/DownloadIcon';

interface TenantFilesModalProps {
  tenant: Tenant;
  files: TenantFile[];
  onClose: () => void;
  onDelete: (fileId: string) => void;
  onTriggerUpload: () => void;
}

const FileListItem: React.FC<{ file: TenantFile; onDelete: () => void; }> = ({ file, onDelete }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = file.fileData;
        link.download = file.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <li className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md">
            <div>
                <p className="font-medium text-gray-800">{file.fileName}</p>
                <p className="text-sm text-gray-500">
                    {file.subcategory} &bull; {new Date(file.uploadDate).toLocaleDateString()} &bull; {formatBytes(file.fileSize)}
                </p>
            </div>
            <div className="space-x-3">
                <button onClick={handleDownload} className="text-gray-400 hover:text-indigo-600" title="Download">
                    <DownloadIcon className="w-5 h-5" />
                </button>
                 <button onClick={onDelete} className="text-gray-400 hover:text-red-600" title="Delete">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </li>
    );
};

const TenantFilesModal: React.FC<TenantFilesModalProps> = ({ tenant, files, onClose, onDelete, onTriggerUpload }) => {
  const groupedFiles = React.useMemo(() => {
    const groups: Record<TenantFileCategory, TenantFile[]> = {
      'Application Phase': [],
      'Lease Phase': [],
      'Move-out': [],
    };
    files.forEach(file => {
      if (groups[file.category]) {
        groups[file.category].push(file);
      }
    });
    return groups;
  }, [files]);

  return (
    <BaseModal title={`Documents for ${tenant.name}`} onClose={onClose}>
      <div className="p-6 bg-gray-50 space-y-4">
        {Object.keys(TENANT_FILE_CATEGORIES).map(category => (
            <details key={category} className="bg-white p-3 rounded-lg shadow-sm border" open={groupedFiles[category as TenantFileCategory].length > 0}>
                <summary className="font-semibold text-lg cursor-pointer text-gray-700">
                    {category} ({groupedFiles[category as TenantFileCategory].length})
                </summary>
                <div className="mt-2 pt-2 border-t">
                    {groupedFiles[category as TenantFileCategory].length > 0 ? (
                        <ul className="space-y-1">
                            {groupedFiles[category as TenantFileCategory].map(file => (
                                <FileListItem key={file.id} file={file} onDelete={() => onDelete(file.id)} />
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 px-3 py-2">No files in this category.</p>
                    )}
                </div>
            </details>
        ))}
        {files.length === 0 && (
            <div className="text-center py-10">
                <p className="text-gray-500">No documents have been uploaded for this tenant.</p>
            </div>
        )}
      </div>
      <div className="p-4 bg-gray-100 border-t flex justify-between items-center">
        <button
          type="button"
          onClick={onTriggerUpload}
          className="bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700"
        >
          Upload New File
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </BaseModal>
  );
};

export default TenantFilesModal;