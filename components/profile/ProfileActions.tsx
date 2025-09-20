import React from 'react';
import { UserProfile } from '../../lib/firebase';
import { EditIcon, LogoutIcon } from './ProfileIcons';

interface ProfileActionsProps {
  isEditing: boolean;
  onEdit: () => void;
  onLogout: () => void;
  onCancel: () => void;
  onSave: () => void;
}

const ProfileActions = React.memo<ProfileActionsProps>(({
  isEditing,
  onEdit,
  onLogout,
  onCancel,
  onSave
}) => {
  if (!isEditing) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <button 
          onClick={onEdit} 
          className="group flex items-center justify-center gap-3 flex-1 px-6 py-4 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border border-blue-200 dark:border-blue-800"
        >
          <EditIcon />
          <span>Edit Profile</span>
        </button>
        
        <button 
          onClick={onLogout} 
          className="group flex items-center justify-center gap-3 px-6 py-4 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg border border-red-200 dark:border-red-800"
        >
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
      <button 
        onClick={onCancel} 
        className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600/50 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-300 border border-gray-200 dark:border-gray-600"
      >
        Cancel
      </button>
      
      <button 
        onClick={onSave} 
        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        Save Changes
      </button>
    </div>
  );
});

ProfileActions.displayName = 'ProfileActions';
export default ProfileActions;
