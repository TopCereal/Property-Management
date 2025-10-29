import React from 'react';
import { TenantFile, TenantFileCategory } from '../../types';
import { TENANT_FILE_CATEGORIES } from '../../constants';
import DownloadIcon from '../icons/DownloadIcon';

interface TenantDocumentsPageProps {
  files: TenantFile[];
}

const FileListItem: React.FC<{ file: TenantFile }> = ({ file }) => {
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
            </div>
        </li>
    );
};

const TenantDocumentsPage: React.FC<TenantDocumentsPageProps> = ({ files }) => {
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
    <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="border-b pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Documents</h2>
            <p className="mt-1 text-gray-600">Here you can find all documents related to your tenancy.</p>
        </div>
      <div className="space-y-4">
        {Object.keys(TENANT_FILE_CATEGORIES).map(category => (
            <details key={category} className="bg-gray-50 p-3 rounded-lg shadow-sm border" open={groupedFiles[category as TenantFileCategory].length > 0}>
                <summary className="font-semibold text-lg cursor-pointer text-gray-700">
                    {category} ({groupedFiles[category as TenantFileCategory].length})
                </summary>
                <div className="mt-2 pt-2 border-t">
                    {groupedFiles[category as TenantFileCategory].length > 0 ? (
                        <ul className="space-y-1">
                            {groupedFiles[category as TenantFileCategory].map(file => (
                                <FileListItem key={file.id} file={file} />
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 px-3 py-2">No files in this category.</p>
                    )}
                </div>
            </details>
        ))}
        {files.length === 0 && (
            <div className="text-center py-20">
                <p className="text-xl text-gray-500">No documents have been uploaded for your account.</p>
                 <p className="mt-2 text-gray-400">Please contact management if you believe this is an error.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default TenantDocumentsPage;
