'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useFirestore, useDoc } from '@/firebase';
import { doc, DocumentData } from 'firebase/firestore';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Share2, Heart, Phone, ShieldCheck, Wifi, BedDouble, Bath } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Property extends DocumentData {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  price: number;
  imageUrls: string[];
  propertyType: string;
  amenities: string[];
}

function PropertyDetails() {
  const params = useParams();
  const { id } = params;
  const firestore = useFirestore();
  const { toast } = useToast();

  const propertyRef = doc(firestore, 'properties', id as string);
  const { data: property, isLoading, error } = useDoc<Property>(propertyRef);

  if (isLoading) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex items-center justify-center">
                <p>Loading property details...</p>
            </main>
            <Footer />
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex items-center justify-center">
                <p>Error loading property: {error.message}</p>
            </main>
            <Footer />
        </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p>Property not found.</p>
        </main>
        <Footer />
      </div>
    );
  }
  
  const handleCall = () => {
    toast({
      title: "Contact Owner",
      description: "Functionality to call the owner will be implemented soon.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
            <Card className="overflow-hidden">
                 <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-3xl font-bold">{property.title}</CardTitle>
                            <CardDescription className="text-md text-muted-foreground mt-2">{property.location}, {property.city}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" size="icon"><Heart className="w-5 h-5" /></Button>
                             <Button variant="outline" size="icon"><Share2 className="w-5 h-5" /></Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                             <Carousel className="w-full">
                                <CarouselContent>
                                {property.imageUrls && property.imageUrls.length > 0 ? (
                                    property.imageUrls.map((url, index) => (
                                    <CarouselItem key={index}>
                                        <Image src={url} alt={`${property.title} image ${index + 1}`} width={800} height={500} className="w-full h-auto object-cover rounded-lg"/>
                                    </CarouselItem>
                                    ))
                                ) : (
                                     <CarouselItem>
                                        <Image src={'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&h=500&auto=format&fit=crop'} alt="Placeholder image" width={800} height={500} className="w-full h-auto object-cover rounded-lg"/>
                                    </CarouselItem>
                                )}
                                </CarouselContent>
                                <CarouselPrevious className="left-4" />
                                <CarouselNext className="right-4" />
                            </Carousel>
                            <div className="mt-8">
                                <h2 className="text-2xl font-bold mb-4">About this property</h2>
                                <p className="text-muted-foreground">{property.description}</p>
                            </div>
                             <div className="mt-8">
                                <h2 className="text-2xl font-bold mb-4">Amenities</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                   {/* This should be dynamic based on property.amenities */}
                                   <div className="flex items-center gap-2"><Wifi className="w-5 h-5 text-primary"/><span>WiFi</span></div>
                                   <div className="flex items-center gap-2"><BedDouble className="w-5 h-5 text-primary"/><span>Furnished</span></div>
                                   <div className="flex items-center gap-2"><Bath className="w-5 h-5 text-primary"/><span>Attached Bathroom</span></div>
                                   <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary"/><span>Security</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                             <Card className="sticky top-24">
                                <CardHeader>
                                    <p className="text-2xl font-bold">₹{property.price.toLocaleString()}<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                                    <Badge>{property.propertyType}</Badge>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-bold mb-2">Owner Details</p>
                                    {/* Fetch owner details later */}
                                    <p className="text-sm text-muted-foreground">Contact details will be visible after sending an enquiry.</p>
                                    <Button className="w-full mt-4" onClick={handleCall}>
                                        <Phone className="w-4 h-4 mr-2" /> Call Owner
                                    </Button>
                                    <Button variant="secondary" className="w-full mt-2">Send Enquiry</Button>
                                </CardContent>
                             </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}


export default function PropertyPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <PropertyDetails />
        </Suspense>
    )
}
