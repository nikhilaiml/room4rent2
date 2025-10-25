'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return null; // or a login prompt
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-headline font-bold mb-6">
            Welcome, {user.displayName || 'User'}!
          </h1>
          
          <Card>
            <CardHeader>
              <CardTitle>My Documents</CardTitle>
              <CardDescription>Upload and manage your research documents here.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground mb-4">You haven't uploaded any documents yet.</p>
                  <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Upload Document
                  </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
