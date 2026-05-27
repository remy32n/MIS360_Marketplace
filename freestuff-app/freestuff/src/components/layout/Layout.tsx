import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { Toaster } from '../ui/toaster';
import { useAuth } from '../../hooks/useAuth';

export function Layout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white max-w-2xl mx-auto">
      <Navbar />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      {isAuthenticated && <BottomNav />}
      <Toaster />
    </div>
  );
}
