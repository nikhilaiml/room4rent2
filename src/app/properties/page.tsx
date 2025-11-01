'use client';

import { Suspense } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, Query, orderBy } from 'firebase/firestore';
import { useMemo } from 'react';
import { PropertyCard } from '@/components/PropertyCard';


interface Property {
    id: string;
    title: string;
    location: string;
    price: number;
    imageUrls: string[];
    propertyType: string;
    amenities: string;
    securityDeposit: number;
    views: number;
    rating: number;
}


function PropertiesList() {
    const searchParams = useSearchParams();
    const firestore = useFirestore();
    
    const location = searchParams.get('location');
    const propertyType = searchParams.get('propertyType');

    const propertiesQuery = useMemo(() => {
        if (!firestore) return null;
        const baseQuery = collection(firestore, 'properties');

        let conditions = [];
        if (location) {
            const searchLocation = location.toLowerCase();
            conditions.push(where('location', '>=', searchLocation));
            conditions.push(where('location', '<=', searchLocation + '\uf8ff'));
        }
        if (propertyType) {
            conditions.push(where('propertyType', '==', propertyType));
        }

        if (conditions.length > 0) {
            return query(baseQuery, ...conditions);
        }

        return query(baseQuery, orderBy('createdAt', 'desc'));

    }, [firestore, location, propertyType]);

    const { data: properties, isLoading } = useCollection<Property>(propertiesQuery as Query<Property>);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">
                        {location || propertyType ? `Properties matching your search` : 'All Properties'}
                    </h1>
                    {isLoading && <p>Loading properties...</p>}
                    {!isLoading && (!properties || properties.length === 0) && (
                        <p>No properties found matching your criteria. Try a different search.</p>
                    )}
                    {!isLoading && properties && properties.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {properties.map(prop => (
                                <PropertyCard 
                                    key={prop.id}
                                    id={prop.id}
                                    title={prop.title}
                                    location={prop.location}
                                    amenities={prop.amenities || ''}
                                    securityDeposit={prop.securityDeposit || 0}
                                    price={prop.price}
                                    views={prop.views || 0}
                                    image={{src: prop.imageUrls?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&h=250&auto=format&fit=crop', hint: 'property'}}
                                    rating={prop.rating || 4}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function PropertiesPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <PropertiesList />
        </Suspense>
    )
}
