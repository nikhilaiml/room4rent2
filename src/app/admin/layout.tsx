'use client';

import { useUser, useSupabaseClient } from '@/supabase';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Building, Users, MessageSquare, Settings, ShieldAlert, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';

interface UserProfile {
  role: string;
}

const AdminSidebar = () => {
    const pathname = usePathname();
    const navLinks = [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/properties", label: "Properties", icon: Building },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
        { href: "/admin/settings", label: "Settings", icon: Settings },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 bg-gray-800 text-white">
            <div className="h-20 flex items-center justify-center px-4 border-b border-gray-700">
                <Logo className="h-10" />
            </div>
            <nav className="flex-grow px-4 py-4">
                <ul className="space-y-2">
                    {navLinks.map(link => (
                        <li key={link.href}>
                            <Link 
                                href={link.href} 
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                                    pathname === link.href ? "bg-primary text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                )}
                            >
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="px-4 py-4 border-t border-gray-700">
                 <Link 
                    href="/" 
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
                >
                    <LogOut className="h-4 w-4" />
                    Exit Admin
                </Link>
            </div>
        </aside>
    );
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const checkAdminRole = async () => {
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (userData) {
          const userProfile = userData as UserProfile;
          if (userProfile.role === 'admin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();
  }, [user, isUserLoading, supabase, router]);

  if (isLoading || isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Checking permissions...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-center p-4">
        <div>
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
          <Button onClick={() => router.push('/')} className="mt-6">Go to Homepage</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-muted/40">{children}</main>
    </div>
  );
}
