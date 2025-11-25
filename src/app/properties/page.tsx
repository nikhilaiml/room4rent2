'use client';

import { Suspense, useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCollection } from '@/supabase';
import { useMemo } from 'react';
import { PropertyCard } from '@/components/PropertyCard';
import { PropertyListItem } from '@/components/PropertyListItem';
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
    const [userLocation, setUserLocation] = useState<string | null>(null);

    const location = searchParams.get('location');
    const propertyType = searchParams.get('propertyType');
    const forWhom = searchParams.get('forWhom');
    const searchQuery = searchParams.get('q');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');

    // Get user location from localStorage
    useEffect(() => {
        const storedLocation = localStorage.getItem('userLocation');
        if (storedLocation) {
            setUserLocation(storedLocation);
        }
    }, []);

    // Update filters when userLocation is loaded and no URL params exist
    useEffect(() => {
        if (userLocation && !location && !propertyType && !forWhom && !searchQuery) {
            setFilters(prev => ({
                ...prev,
                location: userLocation
            }));
        }
    }, [userLocation, location, propertyType, forWhom, searchQuery]);

    const [filters, setFilters] = useState({
        location: location || userLocation || 'all',
        propertyType: propertyType || 'all',
        forWhom: forWhom || 'all',
        minPrice: minPriceParam ? parseInt(minPriceParam) : 0,
        maxPrice: maxPriceParam ? parseInt(maxPriceParam) : 50000,
        searchQuery: searchQuery || '',
    });

    const propertiesQuery = useMemo(() => {
        return {
            table: 'properties',
            filter: (query: any) => {
                let q = query;

                // Check if any filters are actively applied by user (not auto-set values)
                const hasActiveFilters =
                    (filters.location && filters.location !== 'all' && filters.location !== userLocation) ||
                    (filters.propertyType && filters.propertyType !== 'all') ||
                    (filters.forWhom && filters.forWhom !== 'all') ||
                    filters.searchQuery ||
                    filters.minPrice > 0 ||
                    filters.maxPrice < 50000;

                if (hasActiveFilters) {
                    // Apply strict filtering when user has set filters
                    if (filters.location && filters.location !== 'all') {
                        const searchLocation = filters.location.toLowerCase();
                        q = q.eq('city', searchLocation);
                    }
                    if (filters.propertyType && filters.propertyType !== 'all') {
                        q = q.eq('propertyType', filters.propertyType);
                    }
                    if (filters.forWhom && filters.forWhom !== 'all') {
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
                } else {
                    // Default behavior: show all properties for variety
                    // User can see properties from their location and others
                    // If they want location-specific, they can use the location filter
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
        if (newFilters.minPrice > 0) params.set('minPrice', newFilters.minPrice.toString());
        if (newFilters.maxPrice < 50000) params.set('maxPrice', newFilters.maxPrice.toString());
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
                                    initialFilters={{
                                        ...filters,
                                        location: filters.location || 'all',
                                        propertyType: filters.propertyType || 'all',
                                        forWhom: filters.forWhom || 'all',
                                        minPrice: filters.minPrice,
                                        maxPrice: filters.maxPrice,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Main content area */}
                        <div className="flex-1">
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
                                            initialFilters={{
                                                ...filters,
                                                location: filters.location || 'all',
                                                propertyType: filters.propertyType || 'all',
                                                forWhom: filters.forWhom || 'all',
                                                minPrice: filters.minPrice,
                                                maxPrice: filters.maxPrice,
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                                        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                                        : "space-y-4"
                                }>
                                    {properties.map((prop) => (
                                        viewMode === 'grid' ? (
                                            <PropertyCard
                                                key={prop.id}
                                                id={prop.id}
                                                title={prop.title}
                                                location={prop.location}
                                                securityDeposit={prop.securityDeposit || 0}
                                                price={prop.price}
                                                views={prop.views || 0}
                                                images={prop.imageUrls || (prop as any).image_urls}
                                                rating={prop.rating || 4}
                                                listingType={prop.listingType}
                                            />
                                        ) : (
                                            <PropertyListItem
                                                key={prop.id}
                                                id={prop.id}
                                                title={prop.title}
                                                location={prop.location}
                                                securityDeposit={prop.securityDeposit || 0}
                                                price={prop.price}
                                                views={prop.views || 0}
                                                images={prop.imageUrls || (prop as any).image_urls}
                                                rating={prop.rating || 4}
                                                listingType={prop.listingType}
                                            />
                                        )
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
