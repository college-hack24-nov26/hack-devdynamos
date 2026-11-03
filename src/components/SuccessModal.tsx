import React, { useEffect, useState } from 'react';
import { CheckCircle, ExternalLink, X } from 'lucide-react';
import { Button } from './ui/button';
import type { Project } from '../data/mockData';

interface SuccessModalData {
  type: 'approve' | 'mint';
  project: Project;
  transactionHash: string;
}

export function SuccessModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<SuccessModalData | null>(null);

  useEffect(() => {
    const handleShowModal = (event: CustomEvent<SuccessModalData>) => {
      setData(event.detail);
      setIsOpen(true);
    };

    window.addEventListener('showSuccessModal', handleShowModal as EventListener);
    
    return () => {
      window.removeEventListener('showSuccessModal', handleShowModal as EventListener);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setData(null);
  };

  const handleViewOnEtherscan = () => {
    if (data?.transactionHash) {
      window.open(`https://sepolia.etherscan.io/tx/${data.transactionHash}`, '_blank');
    }
  };

  if (!isOpen || !data) return null;

  const isApproval = data.type === 'approve';
  const title = isApproval ? 'Project Approved Successfully!' : 'Carbon Credits Minted Successfully!';
  const description = isApproval 
    ? `Project "${data.project.farmerName}" has been approved and is ready for carbon credit minting.`
    : `${data.project.estimatedCredits} BCC tokens have been minted for project "${data.project.farmerName}".`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 border border-green-200 dark:border-green-800">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 dark:bg-green-900 rounded-full p-4">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
          {title}
        </h2>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          {description}
        </p>

        {/* Project details */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Project:</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.project.farmerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Type:</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.project.projectType}</span>
            </div>
            {!isApproval && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Credits:</span>
                <span className="font-medium text-green-600 dark:text-green-400">{data.project.estimatedCredits} BCC</span>
              </div>
            )}
          </div>
        </div>

        {/* Transaction hash */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400 block mb-2">Transaction Hash:</span>
            <div className="font-mono text-xs text-gray-700 dark:text-gray-300 break-all bg-white dark:bg-gray-900 p-2 rounded border">
              {data.transactionHash}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleViewOnEtherscan}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Etherscan
          </Button>
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}