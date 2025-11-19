'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SupabaseClientProvider } from '@/supabase/client-provider';
import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import LocationPermission from '@/components/LocationPermission';
import Loading from '@/components/Loading';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <html lang="en" suppressHydrationWarning={true}>
        <body className={`${inter.variable} font-body antialiased`} suppressHydrationWarning={true}>
          <Loading />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning={true}>
       <body className={`${inter.variable} font-body antialiased`} suppressHydrationWarning={true}>
         <SupabaseClientProvider>
           <LocationPermission />
           <main>{children}</main>
         </SupabaseClientProvider>
         <Toaster />
       </body>
     </html>
  );
}
