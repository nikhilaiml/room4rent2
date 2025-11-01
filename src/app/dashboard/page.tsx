'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, BedDouble, Heart, Building } from 'lucide-react';
import { collection, query, where, doc, documentId } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  imageUrls: string[];
  propertyType: string;
}

interface UserProfile {
    role: string;
    favorites?: string[];
}

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);
  
  const userDocRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const propertiesQuery = useMemo(() => {
    if (!firestore || !user || !userProfile) return null;

    if (userProfile.role === 'owner') {
      return query(collection(firestore, 'properties'), where('ownerId', '==', user.uid));
    }
    if (userProfile.role === 'tenant') {
        if (userProfile.favorites && userProfile.favorites.length > 0) {
            return query(collection(firestore, 'properties'), where(documentId(), 'in', userProfile.favorites));
        }
        // Tenant with no favorites yet, return a query that finds nothing.
        // Or return null to show the "no favorites" message immediately.
        return null;
    }
    return null;
  }, [firestore, user, userProfile]);

  const { data: properties, isLoading: isLoadingProperties } = useCollection<Property>(propertiesQuery);

  if (isUserLoading || isProfileLoading || !userProfile) {
    return (
       <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
            <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const renderOwnerDashboard = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Properties</CardTitle>
          <CardDescription>Here are the properties you have listed.</CardDescription>
        </div>
        <Button asChild>
            <Link href="/list-property">
                <PlusCircle className="mr-2 h-4 w-4" />
                List New Property
            </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoadingProperties && <p>Loading properties...</p>}
        {!isLoadingProperties && (!properties || properties.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-lg">
            <Building className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">You haven't listed any properties yet.</p>
            <p className="text-sm text-muted-foreground">Click the button above to get started.</p>
          </div>
        )}
        {!isLoadingProperties && properties && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(prop => (
               <Card key={prop.id} className="overflow-hidden">
                 <Image src={prop.imageUrls?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&h=250&auto=format&fit=crop'} alt={prop.title} width={400} height={250} className="w-full h-48 object-cover"/>
                 <div className="p-4">
                   <h3 className="font-bold">{prop.title}</h3>
                   <p className="text-sm text-muted-foreground">{prop.location}</p>
                   <p className="font-semibold mt-2">₹{prop.price}/month</p>
                 </div>
               </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderTenantDashboard = () => (
    <Card>
      <CardHeader>
        <CardTitle>My Favorites</CardTitle>
        <CardDescription>Here are the properties you have saved.</CardDescription>
      </CardHeader>
      <CardContent>
      {isLoadingProperties && <p>Loading favorites...</p>}
        {!isLoadingProperties && (!properties || properties.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-lg">
              <Heart className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">You haven't favorited any properties yet.</p>
              <Button variant="outline" asChild>
                <Link href="/properties">Browse Properties</Link>
              </Button>
          </div>
        )}
        {!isLoadingProperties && properties && properties.length > 0 && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(prop => (
              <Link key={prop.id} href={`/properties/${prop.id}`}>
               <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                 <Image src={prop.imageUrls?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&h=250&auto=format&fit=crop'} alt={prop.title} width={400} height={250} className="w-full h-48 object-cover"/>
                 <div className="p-4">
                   <h3 className="font-bold">{prop.title}</h3>
                   <p className="text-sm text-muted-foreground">{prop.location}</p>
                   <p className="font-semibold mt-2">₹{prop.price}/month</p>
                 </div>
               </Card>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  const renderAdminDashboard = () => (
     <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Manage users and properties.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Admin features coming soon!</p>
        </CardContent>
      </Card>
  );


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">
            Dashboard
          </h1>
          
          {userProfile.role === 'owner' && renderOwnerDashboard()}
          {userProfile.role === 'tenant' && renderTenantDashboard()}
          {userProfile.role === 'admin' && renderAdminDashboard()}

        </div>
      </main>
      <Footer />
    </div>
  );
}

    