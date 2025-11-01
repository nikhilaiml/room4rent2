'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { User, LogIn, Briefcase, LogOut, Menu } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';


export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };
  
  const navLinks = (
      <>
        <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
        <Link href="/properties" className="text-sm font-medium hover:text-primary transition-colors">Properties</Link>
        <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">About Us</Link>
        <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">Contact</Link>
      </>
  );

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src={placeholderImages.footer.logo.src} alt="room4rent Logo" width={40} height={40} data-ai-hint={placeholderImages.footer.logo.hint} />
          <span className="text-xl font-bold">room4rent</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks}
        </nav>
        <div className="flex items-center gap-2 md:gap-4">
          {!isUserLoading && (
            <>
              {user ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="mr-0 md:mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Sign Out</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild className="hidden sm:flex">
                    <Link href="/list-property" className="flex items-center">
                      <Briefcase className="mr-2 h-4 w-4" /> List Your Property
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/login" className="flex items-center">
                       <span className="hidden sm:inline">Login</span> <User className="ml-0 sm:ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
            </>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-6 text-lg font-medium mt-10">
                 <SheetClose asChild>
                    <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                      <Image src={placeholderImages.footer.logo.src} alt="room4rent Logo" width={30} height={30} data-ai-hint={placeholderImages.footer.logo.hint} />
                      <span>room4rent</span>
                    </Link>
                 </SheetClose>
                <SheetClose asChild><Link href="/">Home</Link></SheetClose>
                <SheetClose asChild><Link href="/properties">Properties</Link></SheetClose>
                <SheetClose asChild><Link href="/about">About Us</Link></SheetClose>
                <SheetClose asChild><Link href="/contact">Contact</Link></SheetClose>
                 <SheetClose asChild>
                    <Link href="/list-property" className="flex items-center sm:hidden">
                      List Your Property
                    </Link>
                 </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
