'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SupabaseClientProvider } from '@/supabase/client-provider';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { Inter } from 'next/font/google';
import { useMemo, useEffect, useState } from 'react';
import LocationPermission from '@/components/LocationPermission';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mounted, setMounted] = useState(false);
  const firebaseServices = useMemo(() => initializeFirebase(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <html lang="en" suppressHydrationWarning={true}>
        <body className={`${inter.variable} font-body antialiased`} suppressHydrationWarning={true}>
          <div>Loading...</div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning={true}>
       <body className={`${inter.variable} font-body antialiased`} suppressHydrationWarning={true}>
         <FirebaseProvider firebaseApp={firebaseServices.firebaseApp} auth={firebaseServices.auth} firestore={firebaseServices.firestore}>
           <SupabaseClientProvider>
             <LocationPermission />
             <main>{children}</main>
           </SupabaseClientProvider>
         </FirebaseProvider>
         <Toaster />
       </body>
     </html>
  );
}
