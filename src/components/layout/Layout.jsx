import React from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
