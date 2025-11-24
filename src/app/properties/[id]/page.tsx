'use client';

import { Suspense, useMemo, useState } from 'react';

export const dynamic = 'force-dynamic';
import { useParams } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { useDoc } from '@/supabase';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Share2, Heart, Phone, ShieldCheck, Wifi, BedDouble, Bath, MapPin, Home, Maximize, Car, MessageSquare, Eye, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseClient, useSupabase } from '@/supabase';
import ChatComponent from '@/components/ChatComponent';
import { Card, CardContent } from '@/components/ui/card';

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  price: number;
  imageUrls: string[];
  propertyType: string;
  amenities: string[];
  ownerId: string;
  securityDeposit?: number;
  views?: number;
  rating?: number;
}

function PropertyDetails() {
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();
  const { user } = useSupabase();
  const supabase = useSupabaseClient();
  const [chatEnquiryId, setChatEnquiryId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [ownerDetails, setOwnerDetails] = useState<any>(null);

  const propertyRef = useMemo(() => {
    if (!id) return null;
    return {
      table: 'properties',
      id: id as string,
      realtime: true,
    };
  }, [id]);

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
        {showChat && chatEnquiryId && user && property && (
          <ChatComponent
            enquiryId={chatEnquiryId}
            currentUserId={user.id}
            otherUserId={(property as any).ownerId}
            onClose={() => setShowChat(false)}
          />
        )}
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
        {showChat && chatEnquiryId && user && property && (
          <ChatComponent
            enquiryId={chatEnquiryId}
            currentUserId={user.id}
            otherUserId={(property as any).ownerId}
            onClose={() => setShowChat(false)}
          />
        )}
      </div>
    );
  }

  const handleCall = () => {
    toast({
      title: "Contact Owner",
      description: "Functionality to call the owner will be implemented soon.",
    });
  };

  const handleSendEnquiry = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to send an enquiry.",
        variant: "destructive",
      });
      return;
    }

    if (user.id === (property as any).ownerId) {
      toast({
        title: "Cannot Send Enquiry",
        description: "You cannot send enquiry to your own property.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create enquiry first
      const { data: enquiryData, error: enquiryError } = await supabase
        .from('enquiries')
        .insert({
          propertyId: property.id,
          tenantId: user.id,
          ownerId: (property as any).ownerId,
          message: "Hi, I'm interested in this property. Can we discuss the details?",
        })
        .select()
        .single();

      if (enquiryError) throw enquiryError;

      // Fetch owner details
      const { data: owner, error: ownerError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', (property as any).ownerId)
        .single();

      if (!ownerError && owner) {
        setOwnerDetails(owner);
      }

      // Open chat with the enquiry ID
      setChatEnquiryId(enquiryData.id);
      setShowChat(true);

      toast({
        title: "Enquiry Sent",
        description: "Your enquiry has been sent. Owner details are now visible. You can now chat with the owner.",
      });
    } catch (error) {
      console.error('Error sending enquiry:', error);
      toast({
        title: "Error",
        description: "Failed to send enquiry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "Property link has been copied to your clipboard.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header transparent={true} />
      <main className="flex-grow -mt-20">
        {/* Image Gallery Section */}
        <div className="w-full bg-black pt-20">
          <div className="max-w-7xl mx-auto">
            <Carousel className="w-full">
              <CarouselContent>
                {property.imageUrls && property.imageUrls.length > 0 ? (
                  property.imageUrls.map((url, index) => (
                    <CarouselItem key={index}>
                      <div className="relative w-full h-[400px] md:h-[600px]">
                        <Image
                          src={url}
                          alt={`${property.title} - ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem>
                    <div className="relative w-full h-[400px] md:h-[600px]">
                      <Image
                        src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&h=800&auto=format&fit=crop"
                        alt="Placeholder"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Property Overview */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{property.title}</h1>
                <p className="text-lg text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {property.location}, {property.city}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Key Features */}
            <div className="flex flex-wrap gap-6 py-4 border-y">
              <div className="flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-primary" />
                <span className="font-semibold">3 Bedrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-primary" />
                <span className="font-semibold">2 Bathrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Maximize className="w-5 h-5 text-primary" />
                <span className="font-semibold">1200 sq ft</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" />
                <span className="font-semibold">{property.propertyType}</span>
              </div>
              {property.views && (
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">{property.views} views</span>
                </div>
              )}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold mb-4">About this property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* Property Details */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Property Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Property Type</p>
                    <p className="font-semibold">{property.propertyType}</p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Monthly Rent</p>
                    <p className="font-semibold">₹{property.price.toLocaleString()}</p>
                  </div>
                  {property.securityDeposit && (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Security Deposit</p>
                      <p className="font-semibold">₹{property.securityDeposit.toLocaleString()}</p>
                    </div>
                  )}
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <p className="font-semibold">{property.city}</p>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Wifi className="w-5 h-5 text-primary" />
                    <span>WiFi</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <BedDouble className="w-5 h-5 text-primary" />
                    <span>Furnished</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Bath className="w-5 h-5 text-primary" />
                    <span>Attached Bathroom</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <span>Security</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Car className="w-5 h-5 text-primary" />
                    <span>Parking</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Home className="w-5 h-5 text-primary" />
                    <span>Balcony</span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Location</h2>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted h-64 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Map view coming soon</p>
                      <p className="text-sm text-muted-foreground mt-1">{property.location}, {property.city}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Card>
                  <CardContent className="p-6">
                    {/* Price */}
                    <div className="mb-6">
                      <p className="text-3xl font-bold text-primary">
                        ₹{property.price.toLocaleString()}
                        <span className="text-lg font-normal text-muted-foreground">/month</span>
                      </p>
                      {property.securityDeposit && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Security: ₹{property.securityDeposit.toLocaleString()}
                        </p>
                      )}
                      <Badge className="mt-3">{property.propertyType}</Badge>
                    </div>

                    {/* Owner Details */}
                    <div className="mb-6 pb-6 border-b">
                      <h3 className="font-bold mb-3">Owner Details</h3>
                      {ownerDetails ? (
                        <div className="space-y-2 text-sm">
                          <p><strong>Name:</strong> {ownerDetails.name}</p>
                          <p><strong>Email:</strong> {ownerDetails.email}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Contact details will be visible after sending an enquiry.
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button className="w-full" size="lg" onClick={handleCall}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call Owner
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full"
                        size="lg"
                        onClick={handleSendEnquiry}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Enquiry
                      </Button>
                    </div>

                    {/* Rating */}
                    {property.rating && (
                      <div className="mt-6 pt-6 border-t">
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{property.rating}</span>
                          <span className="text-sm text-muted-foreground">Rating</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      {showChat && chatEnquiryId && user && property && (
        <ChatComponent
          enquiryId={chatEnquiryId}
          currentUserId={user.id}
          otherUserId={(property as any).ownerId}
          onClose={() => setShowChat(false)}
        />
      )}
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
