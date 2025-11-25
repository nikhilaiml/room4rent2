'use client';

import Link from 'next/link';

export const dynamic = 'force-dynamic';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, DollarSign, Calendar, ShieldCheck, BarChart3 } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';
import { useCollection } from '@/supabase';
import React, { useState, useMemo, Suspense, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Bubbles from '@/components/Bubbles';
import { PropertyCard } from '@/components/PropertyCard';
import { motion } from 'framer-motion';

const cities = placeholderImages.cities;
const testimonials = placeholderImages.testimonials;
const benefits = placeholderImages.benefits;

const PropertiesCarousel = React.lazy(() => import('@/components/PropertiesCarousel'));

export default function HomePage() {
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [forWhom, setForWhom] = useState('');
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const router = useRouter();

  const heroTexts = [
    'Find Your Perfect Room',
    'Discover Amazing Rentals',
    'Your Stay Starts Here',
    'Comfortable Rooms Await'
  ];
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let pauseCounter = 0;
    const pauseDuration = 20; // 2 seconds at 100ms interval

    const typeWriter = () => {
      const currentText = heroTexts[currentIndex];

      if (pauseCounter > 0) {
        pauseCounter--;
        return;
      }

      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setDisplayedText(currentText.slice(0, charIndex + 1));
          charIndex++;
        } else {
          pauseCounter = pauseDuration; // Start pause
          isDeleting = true;
        }
      } else {
        if (charIndex > 0) {
          setDisplayedText(currentText.slice(0, charIndex - 1));
          charIndex--;
        } else {
          isDeleting = false;
          currentIndex = (currentIndex + 1) % heroTexts.length;
          charIndex = 0;
        }
      }
    };

    const interval = setInterval(typeWriter, 100);

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(interval);
      clearInterval(cursorInterval);
    };
  }, []);

  useEffect(() => {
    const storedLocation = localStorage.getItem('userLocation');
    if (storedLocation) {
      setUserLocation(storedLocation);
      setLocation(storedLocation);
    }
  }, []);

  useEffect(() => {
    const handleLocationUpdate = (event: any) => {
      setLocation(event.detail);
    };
    window.addEventListener('locationUpdated', handleLocationUpdate);
    return () => window.removeEventListener('locationUpdated', handleLocationUpdate);
  }, []);

  // Query for user's location properties (for Recommended Properties section)
  const recommendedPropertiesQuery = useMemo(() => {
    if (userLocation) {
      return {
        table: 'properties',
        filter: (query: any) => {
          return query.eq('city', userLocation.toLowerCase());
        },
        orderBy: { column: 'createdAt', ascending: false },
        realtime: true,
      };
    }
    return null;
  }, [userLocation]);

  const { data: recommendedProperties, isLoading: isLoadingRecommended } = useCollection(recommendedPropertiesQuery);

  // Query for properties NOT in user's location (for Discover Properties section)
  const discoverPropertiesQuery = useMemo(() => {
    if (userLocation) {
      return {
        table: 'properties',
        filter: (query: any) => {
          return query.neq('city', userLocation.toLowerCase());
        },
        orderBy: { column: 'createdAt', ascending: false },
        realtime: true,
      };
    }
    // If no user location, show all properties
    return {
      table: 'properties',
      orderBy: { column: 'createdAt', ascending: false },
      realtime: true,
    };
  }, [userLocation]);

  const { data: discoverProperties, isLoading: isLoadingDiscover } = useCollection(discoverPropertiesQuery);

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (location) queryParams.set('location', location);
    if (minPrice) queryParams.set('minPrice', minPrice);
    if (maxPrice) queryParams.set('maxPrice', maxPrice);
    if (forWhom) queryParams.set('forWhom', forWhom);
    router.push(`/properties?${queryParams.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section className="relative h-[400px] md:h-[500px] bg-cover bg-center text-white">
          <Image
            src={placeholderImages.hero.src}
            alt="Find Your Dream Apartment"
            fill
            priority
            style={{ objectFit: 'cover' }}
            className="absolute inset-0"
            data-ai-hint="bright modern living room"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <Bubbles />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold">{displayedText}<span className={`inline-block w-1 h-12 bg-white ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}></span></h1>
            <p className="mt-2 md:mt-4 text-lg md:text-xl max-w-2xl animate-in fade-in slide-in-from-top-12 duration-700 delay-500">Book rooms online with ease</p>
          </div>
          <div className="relative z-10 p-4 w-full max-w-5xl mx-auto -mt-16 md:-mt-24 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <div className="bg-transparent backdrop-blur-sm rounded-lg shadow-2xl p-4 md:p-6 hover:bg-white focus-within:bg-white transition-colors duration-300">
              <div className="grid grid-cols-3 gap-2 items-end">
                <div>
                  <label htmlFor="location" className="text-sm font-semibold text-gray-700">Location</label>
                  <div className="relative">
                    <Input id="location" placeholder="Enter city or location" className="text-black" value={location} onChange={(e) => setLocation(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Price Range</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input placeholder="Min Price" type="number" className="text-black" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                    <Input placeholder="Max Price" type="number" className="text-black" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label htmlFor="for-whom" className="text-sm font-semibold text-gray-700">For Whom</label>
                  <Select value={forWhom} onValueChange={setForWhom}>
                    <SelectTrigger className="text-black">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anyone">Anyone</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="professionals">Professionals</SelectItem>
                      <SelectItem value="families">Families</SelectItem>
                      <SelectItem value="couples">Couples</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full h-12 text-base font-bold" onClick={handleSearch}>
                Search Rooms
              </Button>
            </div>
          </div>
        </section>

        <section className="pt-24 pb-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold mb-2">Featured Cities</h2>
            <p className="text-center text-muted-foreground mb-8">Find properties in these cities.</p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-6">
              {cities.map(city => (
                <div key={city.name} className="text-center group">
                  <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                    <Image src={city.img.src} alt={city.name} width={128} height={128} className="object-cover w-full h-full" data-ai-hint={city.img.hint} />
                  </div>
                  <p className="mt-4 font-semibold">{city.name}</p>
                  {city.name !== 'Varanasi' && city.name !== 'Lucknow' && <p className="text-xs text-gray-500">(Coming Soon)</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold mb-2">Recommended Properties</h2>
            <p className="text-center text-muted-foreground mb-8">
              Properties in {userLocation || 'your area'}
            </p>
            <Suspense fallback={<div className="text-center"><p>Loading properties...</p></div>}>
              {isLoadingRecommended ? (
                <div className="text-center"><p>Loading properties...</p></div>
              ) : !recommendedProperties || recommendedProperties.length === 0 ? (
                <div className="text-center"><p>No properties found in {userLocation || 'your location'}. Try searching for properties in other cities.</p></div>
              ) : (
                <PropertiesCarousel properties={recommendedProperties.slice(0, 6)} isLoading={isLoadingRecommended} />
              )}
            </Suspense>
          </div>
        </section>

        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-2">Discover Properties</h2>
            <p className="mb-8">Explore properties in other cities</p>
            <Suspense fallback={<div className="text-center"><p>Loading properties...</p></div>}>
              {isLoadingDiscover ? (
                <div className="text-center"><p>Loading properties...</p></div>
              ) : !discoverProperties || discoverProperties.length === 0 ? (
                <div className="text-center"><p>No properties available in other cities at the moment.</p></div>
              ) : (
                <PropertiesCarousel properties={discoverProperties.slice(0, 6)} isLoading={isLoadingDiscover} />
              )}
            </Suspense>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">Why Choose Us</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={benefit.title} className="text-center p-6">
                  <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    {index === 0 && <DollarSign className="w-8 h-8 text-primary" />}
                    {index === 1 && <Calendar className="w-8 h-8 text-primary" />}
                    {index === 2 && <ShieldCheck className="w-8 h-8 text-primary" />}
                    {index === 3 && <BarChart3 className="w-8 h-8 text-primary" />}
                  </div>
                  <h4 className="font-bold text-lg mb-2">{benefit.title}</h4>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-2">Clients Testimonials</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">What our happy clients say about us.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map(testimonial => (
                <Card key={testimonial.name} className="bg-background text-center p-6 shadow-none border-0">
                  <CardContent className="relative">
                    <p className="text-gray-600 mb-6 italic">&quot;{testimonial.text}&quot;</p>
                    <div className="absolute -bottom-10 right-0 text-6xl text-primary opacity-20">”</div>
                    <div className="flex items-center justify-center">
                      <Image src={testimonial.avatar.src} alt={testimonial.name} width={60} height={60} className="rounded-full mr-4 object-cover" data-ai-hint={testimonial.avatar.hint} />
                      <div>
                        <h4 className="font-bold">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
