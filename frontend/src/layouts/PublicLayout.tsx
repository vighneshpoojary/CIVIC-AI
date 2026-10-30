import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from '../components/layout/PublicHeader';
import { Footer } from '../components/layout/AdminHeader';
import { CivicAIChatbot } from '../components/common/CivicAIChatbot';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FA] relative">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* Floating Civic AI Assistant Widget */}
      <CivicAIChatbot />
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-[#F4F7FA]">
      <Outlet />
    </div>
  );
};
