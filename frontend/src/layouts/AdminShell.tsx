import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { AdminHeader } from '../components/layout/AdminHeader';

export const AdminShell: React.FC = () => {
  const location = useLocation();

  const getHeaderInfo = () => {
    switch (location.pathname) {
      case '/admin/overview':
        return { title: 'Municipal Control Overview', subtitle: 'Real-time city analytics and urgent action queue' };
      case '/admin/complaints':
        return { title: 'Complaint Management Queue', subtitle: 'Search, filter, and track all incoming citizen reports' };
      case '/admin/hotspots':
        return { title: 'DBSCAN Hotspot Spatial Analysis', subtitle: 'Algorithmic recurrence clustering and geographic density' };
      case '/admin/analytics':
        return { title: 'Analytics & Trend Forecasting', subtitle: 'Ward-level volume comparisons and departmental KPIs' };
      case '/admin/officers':
        return { title: 'Officer Workload & Directory', subtitle: 'Engineering staff dispatch and assignment balance' };
      case '/admin/datasets':
        return { title: 'Dataset Registry & Provenance', subtitle: 'Verified municipal datasets and processing pipelines' };
      default:
        return { title: 'Admin Control Center', subtitle: 'CivicAI Operations' };
    }
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <div className="min-h-screen flex w-full bg-[#F4F7FA]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader title={title} subtitle={subtitle} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
