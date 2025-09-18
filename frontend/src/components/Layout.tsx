"use client"

import React from 'react';
import { AppSidebar } from './app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AuthGuard } from './auth-guard';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
};