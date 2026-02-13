'use client';

import { ReactNode } from 'react';
import HRNavbar from '@/components/hiring/HRNavbar';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <HRNavbar />
      <main>{children}</main>
    </div>
  );
}
