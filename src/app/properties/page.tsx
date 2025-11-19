'use client';

import { Suspense, useState } from 'react';

export const dynamic = 'force-dynamic';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCollection } from '@/supabase';
import { useMemo } from 'react';
import { PropertyCard } from '@/components/PropertyCard';
import PropertyFilters from '@/components/PropertyFilters';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Grid, List } from 'lucide-react';


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
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    const location = searchParams.get('location');
    const propertyType = searchParams.get('propertyType');
    const forWhom = searchParams.get('forWhom');
    const searchQuery = searchParams.get('q');

    const [filters, setFilters] = useState({
        location: location || '',
        propertyType: propertyType || '',
        forWhom: forWhom || '',
        minPrice: 0,
        maxPrice: 50000,
        searchQuery: searchQuery || '',
    });

    const propertiesQuery = useMemo(() => {
        return {
            table: 'properties',
            filter: (query: any) => {
                let q = query;
                if (filters.location) {
                    const searchLocation = filters.location.toLowerCase();
                    q = q.eq('city', searchLocation);
                }
                if (filters.propertyType) {
                    q = q.eq('propertyType', filters.propertyType);
                }
                if (filters.forWhom) {
                    q = q.eq('forWhom', filters.forWhom);
                }
                if (filters.searchQuery) {
                    const lowerQuery = filters.searchQuery.toLowerCase();
                    q = q.or(`title.ilike.%${lowerQuery}%,city.ilike.%${lowerQuery}%,location.ilike.%${lowerQuery}%`);
                }
                // Price filtering
                if (filters.minPrice > 0) {
                    q = q.gte('price', filters.minPrice);
                }
                if (filters.maxPrice < 50000) {
                    q = q.lte('price', filters.maxPrice);
                }
                return q;
            },
            orderBy: { column: 'createdAt', ascending: false },
            realtime: true,
        };
    }, [filters]);

    const { data: properties, isLoading } = useCollection<Property>(propertiesQuery);

    const handleFiltersChange = (newFilters: any) => {
        setFilters(newFilters);
        // Update URL params
        const params = new URLSearchParams();
        if (newFilters.location) params.set('location', newFilters.location);
        if (newFilters.propertyType) params.set('propertyType', newFilters.propertyType);
        if (newFilters.forWhom) params.set('forWhom', newFilters.forWhom);
        if (newFilters.searchQuery) params.set('q', newFilters.searchQuery);
        router.push(`/properties?${params.toString()}`);
    };

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
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-6">
                        {getTitle()}
                    </h1>

                    <div className="flex gap-8">
                        {/* Sidebar with filters */}
                        <div className="hidden lg:block w-80 flex-shrink-0">
                            <div className="sticky top-8">
                                <PropertyFilters
                                    onFiltersChange={handleFiltersChange}
                                    initialFilters={filters}
                                />
                            </div>
                        </div>

                        {/* Mobile filter toggle */}
                        <div className="lg:hidden mb-4">
                            <Button
                                onClick={() => setShowFilters(!showFilters)}
                                variant="outline"
                                className="w-full"
                            >
                                <SlidersHorizontal className="w-4 h-4 mr-2" />
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </Button>
                            {showFilters && (
                                <div className="mt-4 p-4 border rounded-lg bg-card">
                                    <PropertyFilters
                                        onFiltersChange={handleFiltersChange}
                                        initialFilters={filters}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Main content area */}
                        <div className="flex-1">
                            {/* View controls */}
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-muted-foreground">
                                    {properties ? `${properties.length} properties found` : 'Loading...'}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <Grid className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Properties display */}
                            {isLoading && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
                                            <div className="h-48 bg-muted rounded mb-4"></div>
                                            <div className="h-4 bg-muted rounded mb-2"></div>
                                            <div className="h-4 bg-muted rounded w-3/4"></div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!isLoading && (!properties || properties.length === 0) && (
                                <div className="text-center py-12">
                                    <p className="text-lg text-muted-foreground mb-4">
                                        No properties found matching your criteria.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Try adjusting your filters or search terms.
                                    </p>
                                </div>
                            )}

                            {!isLoading && properties && properties.length > 0 && (
                                <div className={
                                    viewMode === 'grid'
                                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                        : "space-y-4"
                                }>
                                    {properties.map((prop) => (
                                        <PropertyCard
                                            key={prop.id}
                                            id={prop.id}
                                            title={prop.title}
                                            location={prop.location}
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
                    </div>
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
