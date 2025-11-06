import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SupabaseClientProvider } from '@/supabase/client-provider';
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
  return (
    <html lang="en" suppressHydrationWarning={true}>
       <body className={`${inter.variable} font-body antialiased`} suppressHydrationWarning={true}>
        <SupabaseClientProvider>
          <main>{children}</main>
        </SupabaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
