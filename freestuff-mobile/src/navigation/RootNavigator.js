import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthStack from './AuthStack';
import StudentTabs from './StudentTabs';
import OrgTabs from './OrgTabs';
import AdminTabs from './AdminTabs';
import LoadingScreen from '../screens/shared/LoadingScreen';

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <AuthStack />;

  if (user.role === 'ADMIN') return <AdminTabs />;
  if (user.role === 'ORG')   return <OrgTabs />;
  return <StudentTabs />;
}
