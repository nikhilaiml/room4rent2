'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import React, { useState, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';

const cities = placeholderImages.cities;
const testimonials = placeholderImages.testimonials;
const benefits = placeholderImages.benefits;

const PropertiesCarousel = React.lazy(() => import('@/components/PropertiesCarousel'));

export default function HomePage() {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const router = useRouter();
  
  const firestore = useFirestore();
  const propertiesQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'properties'));
  }, [firestore]);

  const { data: properties, isLoading: isLoadingProperties } = useCollection(propertiesQuery as any);

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (location) queryParams.set('location', location);
    if (propertyType && propertyType !== 'all') queryParams.set('propertyType', propertyType);
    router.push(`/properties?${queryParams.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section className="relative h-[350px] md:h-[400px] bg-cover bg-center text-white">
          <Image
              src={placeholderImages.hero.src}
              alt="Hero background"
              fill
              priority
              style={{ objectFit: 'cover' }}
              className="absolute inset-0"
              data-ai-hint="apartment building"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                 <h1 className="text-3xl md:text-5xl font-bold">Find Your Next Home</h1>
                 <p className="mt-2 md:mt-4 text-base md:text-lg max-w-2xl">The easiest way to find your perfect room, PG, or flat.</p>
            </div>
            <div className="relative z-10 p-4 w-full max-w-4xl mx-auto -mt-16 md:-mt-10">
                <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label htmlFor="location" className="text-sm font-semibold text-gray-600">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input id="location" placeholder="Search city, location, or area..." className="pl-10 text-black" value={location} onChange={(e) => setLocation(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="property-type" className="text-sm font-semibold text-gray-600">Property Type</label>
                            <Select onValueChange={setPropertyType} defaultValue="all">
                                <SelectTrigger className="text-black">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="Room">Room</SelectItem>
                                    <SelectItem value="1BHK">1BHK</SelectItem>
                                    <SelectItem value="2BHK">2BHK</SelectItem>
                                    <SelectItem value="PG">PG</SelectItem>
                                    <SelectItem value="Hostel">Hostel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full h-12 text-base" onClick={handleSearch}>
                            <Search className="mr-2 h-5 w-5" /> Search
                        </Button>
                    </div>
                </div>
            </div>
        </section>

        <section className="pt-24 pb-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-6">
              {cities.map(city => (
                <div key={city.name} className="text-center">
                  <Image src={city.img.src} alt={city.name} width={100} height={100} className="rounded-full mx-auto object-cover" data-ai-hint={city.img.hint} />
                  <p className="mt-2 font-semibold">{city.name}</p>
                  {city.name !== 'Varanasi' && city.name !== 'Lucknow' && <p className="text-xs text-gray-500">(Coming Soon)</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">Trending Properties</h2>
            <Suspense fallback={<div className="text-center"><p>Loading properties...</p></div>}>
              <PropertiesCarousel properties={properties} isLoading={isLoadingProperties} />
            </Suspense>
          </div>
        </section>

        <section className="py-12 bg-white">
            <div className="container mx-auto text-center px-4">
                <h2 className="text-3xl font-bold mb-2">Our Tenants Speak</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">We have been working with clients around Lucknow and Varanasi</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map(testimonial => (
                        <Card key={testimonial.name} className="bg-white text-center p-6 shadow-lg">
                            <CardContent>
                                <p className="text-gray-600 mb-6">&quot;{testimonial.text}&quot;</p>
                                <Image src={testimonial.avatar.src} alt={testimonial.name} width={60} height={60} className="rounded-full mx-auto mb-4 object-cover" data-ai-hint={testimonial.avatar.hint} />
                                <h4 className="font-bold">{testimonial.name}</h4>
                                <p className="text-sm text-gray-500">{testimonial.role}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">Benefits of Listing with us</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map(benefit => (
                <div key={benefit.title} className="flex items-start">
                  <Image src={benefit.icon.src} alt={benefit.title} width={50} height={50} className="mr-4 flex-shrink-0" data-ai-hint={benefit.icon.hint} />
                  <div>
                    <h4 className="font-bold text-lg mb-2">{benefit.title}</h4>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button variant="outline" size="lg" asChild>
                <Link href="/list-property">Lease Your Property Now &rarr;</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
