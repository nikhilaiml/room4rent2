'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { User, LogIn, Briefcase, LogOut, Menu } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';


export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };
  
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/properties", label: "Properties" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  const NavLink = ({ href, label }: { href: string; label: string; }) => (
    <Link 
      href={href} 
      className={cn(
        "text-sm font-medium transition-colors",
        pathname === href ? "text-primary" : "text-foreground hover:text-primary"
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4 h-20">
        <Link href="/" className="flex items-center gap-2">
          <Image src={placeholderImages.footer.logo.src} alt="room4rent Logo" width={40} height={40} className="bg-gray-800 rounded-md p-1" data-ai-hint={placeholderImages.footer.logo.hint} />
          <span className="text-xl font-bold">room4rent</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => <NavLink key={link.href} {...link} />)}
        </nav>
        <div className="flex items-center gap-2 md:gap-4">
          {!isUserLoading && (
            <>
              {user ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="outline" onClick={handleSignOut} size="sm">
                    <LogOut className="mr-0 md:mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Sign Out</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild size="sm">
                    <Link href="/login" className="flex items-center">
                       <User className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Login</span>
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/register" className="flex items-center">
                      <LogIn className="mr-2 h-4 w-4" /> Register
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
                    <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                      <Image src={placeholderImages.footer.logo.src} alt="room4rent Logo" width={30} height={30} data-ai-hint={placeholderImages.footer.logo.hint} />
                      <span>room4rent</span>
                    </Link>
                 </SheetClose>
                 {navLinks.map(link => (
                    <SheetClose asChild key={link.href}>
                      <Link href={link.href}>{link.label}</Link>
                    </SheetClose>
                  ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
