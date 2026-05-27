import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute, AdminOnlyRoute, OrgOnlyRoute, StudentOnlyRoute } from './components/ProtectedRoute';

import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { BrowsePage } from './pages/student/BrowsePage';
import { ListingDetailPage } from './pages/student/ListingDetailPage';
import { SavedListingsPage } from './pages/student/SavedListingsPage';
import { CreateListingPage } from './pages/org/CreateListingPage';
import { ListingSubmittedPage } from './pages/org/ListingSubmittedPage';
import { MyListingsPage } from './pages/org/MyListingsPage';
import { ApprovalQueuePage } from './pages/admin/ApprovalQueuePage';
import { ActivityDashboardPage } from './pages/admin/ActivityDashboardPage';
import { OrgVerificationPage } from './pages/admin/OrgVerificationPage';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Main App Layout */}
              <Route element={<Layout />}>
                {/* Redirect root to browse */}
                <Route path="/" element={<Navigate to="/browse" replace />} />
                
                {/* Protected Routes (All authenticated users) */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/browse" element={<BrowsePage />} />
                  <Route path="/listings/:id" element={<ListingDetailPage />} />
                </Route>

                {/* Student Only Routes */}
                <Route element={<StudentOnlyRoute />}>
                  <Route path="/saved" element={<SavedListingsPage />} />
                </Route>

                {/* Org Only Routes */}
                <Route element={<OrgOnlyRoute />}>
                  <Route path="/org/listings" element={<MyListingsPage />} />
                  <Route path="/org/listings/new" element={<CreateListingPage />} />
                  <Route path="/org/listings/submitted" element={<ListingSubmittedPage />} />
                </Route>

                {/* Admin Only Routes */}
                <Route element={<AdminOnlyRoute />}>
                  <Route path="/admin/approvals" element={<ApprovalQueuePage />} />
                  <Route path="/admin/activity" element={<ActivityDashboardPage />} />
                  <Route path="/admin/orgs" element={<OrgVerificationPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
