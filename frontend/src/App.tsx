import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminShell } from './layouts/AdminShell';

// Public Pages (Lazy Loaded for high performance and low initial bundle size)
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const SubmitComplaintPage = lazy(() => import('./pages/SubmitComplaintPage').then(m => ({ default: m.SubmitComplaintPage })));
const ComplaintTrackingPage = lazy(() => import('./pages/ComplaintTrackingPage').then(m => ({ default: m.ComplaintTrackingPage })));
const PublicMapPage = lazy(() => import('./pages/PublicMapPage').then(m => ({ default: m.PublicMapPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));

// Admin Pages (Lazy Loaded)
const AdminOverviewPage = lazy(() => import('./pages/AdminOverviewPage').then(m => ({ default: m.AdminOverviewPage })));
const AdminComplaintManagementPage = lazy(() => import('./pages/AdminComplaintManagementPage').then(m => ({ default: m.AdminComplaintManagementPage })));
const AdminReviewPage = lazy(() => import('./pages/AdminReviewPage').then(m => ({ default: m.AdminReviewPage })));
const AdminHotspotMapPage = lazy(() => import('./pages/AdminHotspotMapPage').then(m => ({ default: m.AdminHotspotMapPage })));
const AdminAnalyticsPage = lazy(() => import('./pages/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })));
const AdminOfficersPage = lazy(() => import('./pages/AdminOfficersPage').then(m => ({ default: m.AdminOfficersPage })));
const AdminDatasetsPage = lazy(() => import('./pages/AdminDatasetsPage').then(m => ({ default: m.AdminDatasetsPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

const RouteLoader: React.FC = () => (
  <div 
    role="status" 
    aria-live="polite" 
    className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4"
  >
    <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-600 rounded-full animate-spin" />
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading CivicAI Platform...</p>
    <span className="sr-only">Loading page content, please wait</span>
  </div>
);

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            {/* Public Portal Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/submit" element={<SubmitComplaintPage />} />
              <Route path="/track" element={<ComplaintTrackingPage />} />
              <Route path="/public-map" element={<PublicMapPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Admin Control Center Routes */}
            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<Navigate to="/admin/overview" replace />} />
              <Route path="overview" element={<AdminOverviewPage />} />
              <Route path="complaints" element={<AdminComplaintManagementPage />} />
              <Route path="review/:id" element={<AdminReviewPage />} />
              <Route path="hotspots" element={<AdminHotspotMapPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="officers" element={<AdminOfficersPage />} />
              <Route path="datasets" element={<AdminDatasetsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
