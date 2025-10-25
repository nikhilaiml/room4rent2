'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { User, LogIn, Briefcase } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src={placeholderImages.footer.logo.src} alt="RoomLelo Logo" width={40} height={40} data-ai-hint={placeholderImages.footer.logo.hint} />
          <span className="text-xl font-bold">RoomLelo</span>
        </Link>
        <div className="flex items-center gap-4">
          {!isUserLoading && (
            <>
              {user ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/list-property" className="flex items-center">
                      <Briefcase className="mr-2 h-4 w-4" /> List Your Property
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/login" className="flex items-center">
                       Login <User className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

    