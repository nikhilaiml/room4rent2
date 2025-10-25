'use client';

import { Suspense } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, Query } from 'firebase/firestore';
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Star, MapPin, Share2, Heart, Phone, Eye } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
            // Using a case-insensitive approach by searching for lowercase.
            // This requires you to store a lowercase version of the location in Firestore.
            // For now, we will do an exact match which is case-sensitive.
            conditions.push(where('location', '>=', location));
            conditions.push(where('location', '<=', location + '\uf8ff'));
        }
        if (propertyType) {
            conditions.push(where('propertyType', '==', propertyType));
        }

        return conditions.length > 0 ? query(baseQuery, ...conditions) : baseQuery;
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
                                    image={{src: prop.imageUrls?.[0] || 'https://picsum.photos/seed/prop/400/250', hint: 'property'}}
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
        <Suspense fallback={<div>Loading...</div>}>
            <PropertiesList />
        </Suspense>
    )
}
