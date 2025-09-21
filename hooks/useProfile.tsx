import { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, getUserProfile, updateUserProfile, UserProfile } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export const useProfile = () => {
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({});
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/auth');
      return;
    }

    if (authUser) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          const userProfile = await getUserProfile(currentUser.uid);
          setProfile(userProfile);
          setFormData(userProfile || {});
          if (!userProfile?.name) {
            setIsEditing(true);
          }
        } else {
          router.push('/auth');
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [router, authUser, authLoading]);

  const handleLogout = useCallback(async () => {
    await signOut(auth);
    router.push('/');
  }, [router]);

  const handleSave = useCallback(async () => {
    if (!user || !formData.name) return;
    await updateUserProfile(user.uid, formData);
    setProfile(formData);
    setIsEditing(false);
  }, [user, formData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setFormData(profile || {});
  }, [profile]);

  return {
    user,
    profile,
    loading: loading || authLoading,
    isEditing,
    formData,
    handleLogout,
    handleSave,
    handleInputChange,
    handleEdit,
    handleCancel
  };
};
