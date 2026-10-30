import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminShell } from './layouts/AdminShell';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { SubmitComplaintPage } from './pages/SubmitComplaintPage';
import { ComplaintTrackingPage } from './pages/ComplaintTrackingPage';
import { PublicMapPage } from './pages/PublicMapPage';
import { LoginPage } from './pages/LoginPage';

// Admin Pages
import { AdminOverviewPage } from './pages/AdminOverviewPage';
import { AdminComplaintManagementPage } from './pages/AdminComplaintManagementPage';
import { AdminReviewPage } from './pages/AdminReviewPage';
import { AdminHotspotMapPage } from './pages/AdminHotspotMapPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { AdminOfficersPage } from './pages/AdminOfficersPage';
import { AdminDatasetsPage } from './pages/AdminDatasetsPage';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
