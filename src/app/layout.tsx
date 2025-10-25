import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'RoomLelo',
  description: 'Find your next room with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <body className={`${inter.variable} font-body antialiased`}>
        <FirebaseClientProvider>
          <main>{children}</main>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
