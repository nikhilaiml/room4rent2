'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Users, Star, Share2, Heart, Phone, Eye } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import placeholderImages from '@/lib/placeholder-images.json';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


const cities = placeholderImages.cities;
const properties = placeholderImages.properties;
const testimonials = placeholderImages.testimonials;
const benefits = placeholderImages.benefits;


export default function HomePage() {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    const query = new URLSearchParams();
    if (location) query.set('location', location);
    if (propertyType) query.set('propertyType', propertyType);
    router.push(`/properties?${query.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section className="relative h-[400px] bg-cover bg-center text-white">
          <Image
              src={placeholderImages.hero.src}
              alt="Hero background"
              fill
              style={{ objectFit: 'cover' }}
              className="absolute inset-0"
              data-ai-hint="apartment building"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6 w-full max-w-4xl mx-auto mt-auto mb-[-60px]">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div className="md:col-span-1">
                            <label htmlFor="location" className="text-sm font-semibold text-gray-600">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input id="location" placeholder="Search location, hostel..." className="pl-10 text-black" value={location} onChange={(e) => setLocation(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="property-type" className="text-sm font-semibold text-gray-600">Property Type</label>
                            <Select onValueChange={setPropertyType}>
                                <SelectTrigger className="text-black">
                                    <SelectValue placeholder="Type Of Property" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Room">Room</SelectItem>
                                    <SelectItem value="1BHK">1BHK</SelectItem>
                                    <SelectItem value="2BHK">2BHK</SelectItem>
                                    <SelectItem value="PG">PG</SelectItem>
                                    <SelectItem value="Hostel">Hostel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label htmlFor="for-whom" className="text-sm font-semibold text-gray-600">For Whom</label>
                            <Select>
                                <SelectTrigger className="text-black">
                                    <SelectValue placeholder="Select Preference" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="students">Students</SelectItem>
                                    <SelectItem value="family">Family</SelectItem>
                                    <SelectItem value="bachelors">Bachelors</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full h-12 text-base md:mt-6" onClick={handleSearch}>
                            <Search className="mr-2 h-5 w-5" /> Search
                        </Button>
                    </div>
                </div>
            </div>
        </section>

        <section className="pt-24 pb-12 bg-white">
          <div className="container mx-auto">
            <div className="flex justify-center space-x-8">
              {cities.map(city => (
                <div key={city.name} className="text-center">
                  <Image src={city.img.src} alt={city.name} width={100} height={100} className="rounded-full mx-auto" data-ai-hint={city.img.hint} />
                  <p className="mt-2 font-semibold">{city.name}</p>
                  {city.name !== 'Varanasi' && city.name !== 'Lucknow' && <p className="text-xs text-gray-500">(Coming Soon)</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-6">Trending Properties in Varanasi</h2>
            <Carousel opts={{ align: "start", loop: true }}>
              <CarouselContent>
                {properties.concat(properties).map((prop, index) => (
                  <CarouselItem key={`${prop.id}-${index}`} className="md:basis-1/2 lg:basis-1/3">
                    <PropertyCard {...prop} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-[-20px]" />
              <CarouselNext className="right-[-20px]" />
            </Carousel>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <Users className="mr-3 text-primary h-8 w-8" />
              RoomLelo Recommendations
            </h2>
            <Carousel opts={{ align: "start", loop: true }}>
              <CarouselContent>
                {properties.map((prop, index) => (
                  <CarouselItem key={`${prop.id}-${index}`} className="md:basis-1/2 lg:basis-1/3">
                    <PropertyCard {...prop} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-[-20px]" />
              <CarouselNext className="right-[-20px]" />
            </Carousel>
          </div>
        </section>

        <section className="py-12 bg-background">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold mb-2">Our Tenants Speak</h2>
                <p className="text-muted-foreground mb-8">We have been working with clients around the Lucknow Varanasi</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map(testimonial => (
                        <Card key={testimonial.name} className="bg-white text-center p-6 shadow-lg">
                            <CardContent>
                                <p className="text-gray-600 mb-6">&quot;{testimonial.text}&quot;</p>
                                <Image src={testimonial.avatar.src} alt={testimonial.name} width={60} height={60} className="rounded-full mx-auto mb-4" data-ai-hint={testimonial.avatar.hint} />
                                <h4 className="font-bold">{testimonial.name}</h4>
                                <p className="text-sm text-gray-500">{testimonial.role}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Benefits of Listing with us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map(benefit => (
                <div key={benefit.title} className="flex items-start">
                  <Image src={benefit.icon.src} alt={benefit.title} width={60} height={60} className="mr-4" data-ai-hint={benefit.icon.hint} />
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

const PropertyCard = ({ id, title, location, amenities, securityDeposit, price, views, image, rating }: {
  id: string; // Changed to string to match firestore id
  title: string;
  location: string;
  amenities: string;
  securityDeposit: number;
  price: number;
  views: number;
  image: { src: string; hint: string };
  rating: number;
}) => {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      getDoc(userRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.favorites && userData.favorites.includes(id)) {
            setIsFavorite(true);
          }
        }
      });
    }
  }, [user, firestore, id]);

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/properties/${id}`);
    toast({
      title: "Link Copied!",
      description: "Property link has been copied to your clipboard.",
    });
  };

  const handleCall = () => {
    toast({
      title: "Contact Owner",
      description: "Functionality to call the owner will be implemented soon.",
    });
  };

  const handleVisit = () => {
    router.push(`/properties/${id}`);
  };
  
  const handleFavorite = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please login to add properties to your favorites.",
      });
      router.push('/login');
      return;
    }
    const userRef = doc(firestore, 'users', user.uid);
    try {
      if (isFavorite) {
        await updateDoc(userRef, {
          favorites: arrayRemove(id)
        });
        toast({
          title: "Removed from Favorites",
        });
        setIsFavorite(false);
      } else {
        await updateDoc(userRef, {
          favorites: arrayUnion(id)
        });
        toast({
          title: "Added to Favorites!",
        });
        setIsFavorite(true);
      }
    } catch(e: any) {
       console.error("Favorite toggle error: ", e);
       toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update favorites. Please try again.",
      });
    }
  };


  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
      <CardContent className="p-0 flex-grow flex flex-col">
        <div className="relative">
          <Image src={image.src} alt={title} width={400} height={250} className="w-full object-cover h-48" data-ai-hint={image.hint} />
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md flex items-center">
              <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" /> {rating}
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg flex-1 mr-2">{title}</h3>
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleShare}><Share2 className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleFavorite}>
                <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-current' : ''}`} />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground flex items-center mt-1"><MapPin className="w-4 h-4 mr-1" /> {location}</p>
          <p className="text-sm my-2 flex-grow">{amenities}</p>
          <p className="text-sm font-semibold">Security Deposit: ₹{securityDeposit.toLocaleString()}</p>
          <div className="flex items-center text-sm text-amber-600 my-2">
              <Eye className="w-4 h-4 mr-1" /> {views} people already view this property, Hurr...
          </div>
          <div className="flex justify-between items-center mt-auto pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Starting at:</p>
              <p className="font-bold text-lg">₹{price.toLocaleString()}/Month</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCall}><Phone className="w-4 h-4 mr-2" /> Call</Button>
              <Button onClick={handleVisit}>Visit</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
