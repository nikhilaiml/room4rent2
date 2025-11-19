'use client';

import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useSearchParams } from 'next/navigation';
import { useCollection } from '@/supabase';
import { useMemo } from 'react';
import { PropertyCard } from '@/components/PropertyCard';
import PropertiesCarousel from '@/components/PropertiesCarousel';


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
    const searchQuery = searchParams.get('q');

    const propertiesQuery = useMemo(() => {
        return {
            table: 'properties',
            filter: (query: any) => {
                let q = query;
                if (location) {
                    const searchLocation = location.toLowerCase();
                    q = q.eq('city', searchLocation);
                }
                if (propertyType) {
                    q = q.eq('propertyType', propertyType);
                }
                if (forWhom) {
                    q = q.eq('forWhom', forWhom);
                }
                if (searchQuery) {
                    const lowerQuery = searchQuery.toLowerCase();
                    q = q.or(`title.ilike.%${lowerQuery}%,city.ilike.%${lowerQuery}%,location.ilike.%${lowerQuery}%`);
                }
                return q;
            },
            orderBy: { column: 'createdAt', ascending: false },
            realtime: true,
        };
    }, [location, propertyType, forWhom, searchQuery]);

    const { data: properties, isLoading } = useCollection<Property>(propertiesQuery);

    const getTitle = () => {
        if (searchQuery) {
            return `Search results for "${searchQuery}"`;
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
                        <PropertiesCarousel properties={properties} isLoading={isLoading} />
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
