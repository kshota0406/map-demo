'use client';

import { ReactNode } from 'react';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="app-container">
      {children}
    </div>
  );
} 