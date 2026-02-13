// components/ui/InsufficientCoinsModal.tsx

import React from 'react';
import { useRouter } from 'next/navigation';

interface InsufficientCoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetCoins?: () => void; // 🔧 ADD THIS OPTIONAL PROP
  featureName: string;
  currentCoins: number;
  requiredCoins: number;
}

const InsufficientCoinsModal: React.FC<InsufficientCoinsModalProps> = ({
  isOpen,
  onClose,
  onGetCoins, // 🔧 ADD THIS PROP
  featureName,
  currentCoins,
  requiredCoins,
}) => {
  const router = useRouter();

  // 🔧 HANDLE GET COINS - Use prop if provided, otherwise default behavior
  const handleGetCoins = () => {
    if (onGetCoins) {
      onGetCoins(); // Use provided handler
    } else {
      // Default behavior - close modal and redirect
      onClose();
      router.push('/coins');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
        {/* Coin Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">🪙</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Insufficient Coins! 🪙
        </h2>

        {/* Description */}
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          You need <span className="font-semibold text-orange-600 dark:text-orange-400">{requiredCoins} coin(s)</span> to use {featureName}.
        </p>

        {/* Balance Info */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Your Balance:</span>
            <span className="font-bold text-gray-900 dark:text-white">{currentCoins} coins</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Required:</span>
            <span className="font-bold text-orange-600 dark:text-orange-400">{requiredCoins} coins</span>
          </div>
          <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-600 pt-2">
            <span className="text-gray-600 dark:text-gray-400">Needed:</span>
            <span className="font-bold text-red-600 dark:text-red-400">{Math.max(0, requiredCoins - currentCoins)} more coins</span>
          </div>
        </div>

        {/* How to get more coins */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
            💡 How to get more coins:
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Create a new account (5 coins)</li>
            <li>• Login daily bonus (coming soon)</li>
            <li>• Complete profile setup (coming soon)</li>
            <li>• Referral rewards (coming soon)</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleGetCoins} // 🔧 USE UPDATED HANDLER
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Get Coins
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsufficientCoinsModal;
