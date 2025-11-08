import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SupabaseClientProvider } from '@/supabase/client-provider';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { Inter } from 'next/font/google';

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
  const { firebaseApp, auth, firestore } = initializeFirebase();

  return (
    <html lang="en" suppressHydrationWarning={true}>
       <body className={`${inter.variable} font-body antialiased`} suppressHydrationWarning={true}>
         <FirebaseProvider firebaseApp={firebaseApp} auth={auth} firestore={firestore}>
           <SupabaseClientProvider>
             <main>{children}</main>
           </SupabaseClientProvider>
         </FirebaseProvider>
         <Toaster />
       </body>
     </html>
  );
}
