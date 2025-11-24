'use client';

import Link from 'next/link';
import { useUser, useAuth } from '@/supabase';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { User, LogIn, LogOut, Menu, Search } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';
import { useState, useEffect } from 'react';


export default function Header({ transparent = false }: { transparent?: boolean }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection
  useEffect(() => {
    if (typeof window !== 'undefined' && transparent) {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 100);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [transparent]);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/properties?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/properties", label: "Properties" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  const isTransparent = transparent && !isScrolled;

  const NavLink = ({ href, label }: { href: string; label: string; }) => (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors",
        pathname === href ? "text-primary" : (isTransparent ? "text-white hover:text-primary" : "text-foreground hover:text-primary")
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className={cn(
      "border-b sticky top-0 z-50 transition-all duration-300",
      isTransparent ? "bg-black/30 backdrop-blur-md border-transparent" : "bg-white/95 backdrop-blur-sm border-border"
    )}>
      <div className="container mx-auto flex items-center justify-between p-4 h-20">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-sm mx-2">
          <Input
            type="text"
            placeholder="Search properties or cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "flex-1",
              isTransparent && "bg-white/10 border-white/20 text-white placeholder:text-white/60"
            )}
          />
          <Button type="submit" size="sm" className={isTransparent ? "bg-white/20 hover:bg-white/30 text-white border-white/20" : ""}>
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => <NavLink key={link.href} {...link} />)}
        </nav>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex">
            {!isUserLoading && (
              <>
                {user ? (
                  <>
                    <Button variant="ghost" asChild className={isTransparent ? "text-white hover:bg-white/10" : ""}>
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSignOut}
                      size="sm"
                      className={isTransparent ? "border-white/20 text-white hover:bg-white/10" : ""}
                    >
                      <LogOut className="mr-0 md:mr-2 h-4 w-4" />
                      <span className="hidden md:inline">Sign Out</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      size="sm"
                      className={isTransparent ? "border-white/20 text-white hover:bg-white/10" : ""}
                    >
                      <Link href="/login" className="flex items-center">
                        <User className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Login</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className={isTransparent ? "bg-white/20 hover:bg-white/30 text-white" : ""}
                    >
                      <Link href="/register" className="flex items-center">
                        <LogIn className="mr-2 h-4 w-4" /> Register
                      </Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
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
                    <Logo className="h-8" />
                  </Link>
                </SheetClose>
                {navLinks.map(link => (
                  <SheetClose asChild key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </SheetClose>
                ))}
                {!user && (
                  <>
                    <SheetClose asChild>
                      <Link href="/login" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Login
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/register" className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Register
                      </Link>
                    </SheetClose>
                  </>
                )}
                {user && (
                  <>
                    <SheetClose asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="ghost" onClick={handleSignOut} className="justify-start">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </SheetClose>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
