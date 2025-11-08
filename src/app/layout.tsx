'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SupabaseClientProvider } from '@/supabase/client-provider';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { Inter } from 'next/font/google';
import { useMemo } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'room4rent',
  description: 'Find your next room with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const firebaseServices = useMemo(() => initializeFirebase(), []);

  return (
    <html lang="en" suppressHydrationWarning={true}>
       <body className={`${inter.variable} font-body antialiased`} suppressHydrationWarning={true}>
         <FirebaseProvider firebaseApp={firebaseServices.firebaseApp} auth={firebaseServices.auth} firestore={firebaseServices.firestore}>
           <SupabaseClientProvider>
             <main>{children}</main>
           </SupabaseClientProvider>
         </FirebaseProvider>
         <Toaster />
       </body>
     </html>
  );
}
