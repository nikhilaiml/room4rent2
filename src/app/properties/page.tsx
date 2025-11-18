'use client';

import { Suspense } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useSearchParams } from 'next/navigation';
import { useCollection } from '@/supabase';
import { useMemo } from 'react';
import { PropertyCard } from '@/components/PropertyCard';


interface Property {
    id: string;
    title: string;
    location: string;
    price: number;
    imageUrls: string[];
    propertyType: string;
    forWhom: string;
    amenities: string;
    securityDeposit: number;
    views: number;
    rating: number;
    listingType: string;
}


function PropertiesList() {
    const searchParams = useSearchParams();

    const location = searchParams.get('location');
    const propertyType = searchParams.get('propertyType');
    const forWhom = searchParams.get('forWhom');
    const q = searchParams.get('q');

    const propertiesQuery = useMemo(() => {
        return {
            table: 'properties',
            filter: (query: any) => {
                let q = query;
                if (location) {
                    const searchLocation = location.toLowerCase();
                    q = q.eq('location', searchLocation);
                }
                if (propertyType) {
                    q = q.eq('propertyType', propertyType);
                }
                if (forWhom) {
                    q = q.eq('forWhom', forWhom);
                }
                if (q) {
                    q = q.or(`title.ilike.%${q}%,location.ilike.%${q}%`);
                }
                return q;
            },
            orderBy: { column: 'createdAt', ascending: false },
            realtime: true,
        };
    }, [location, propertyType, forWhom, q]);

    const { data: properties, isLoading } = useCollection<Property>(propertiesQuery);

    const getTitle = () => {
        if (q) {
            return `Search results for "${q}"`;
        }
        if (location || propertyType || forWhom) {
            return 'Properties matching your search';
        }
        return 'All Properties';
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-grow p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">
                        {getTitle()}
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
                                    listingType={prop.listingType}
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
