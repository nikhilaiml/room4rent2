'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MapPin, Share2, Heart, Phone, Eye, Bed, Bath, Car, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useSupabaseClient } from '@/supabase';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';

export const PropertyListItem = ({ id, title, location, securityDeposit, price, views, images = [], rating, listingType }: {
  id: string;
  title: string;
  location: string;
  securityDeposit: number;
  price: number;
  views: number;
  images?: string[];
  rating: number;
  listingType?: string;
}) => {
  const { toast } = useToast();
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user && supabase) {
      // Fetch user data
      supabase
        .from('users')
        .select('favorites')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setIsFavorite(data.favorites && data.favorites.includes(id));
          }
        });

      // Subscribe to changes
      const channel = supabase
        .channel(`user_${user.id}_favorites`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            const newData = payload.new as { favorites?: string[] };
            setIsFavorite(newData.favorites?.includes(id) || false);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, supabase, id]);

  // Auto-swipe carousel on hover
  useEffect(() => {
    if (isHovered && api && images && images.length > 1) {
      intervalRef.current = setInterval(() => {
        api.scrollNext();
      }, 2000); // Change image every 2 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, api, images?.length]);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/properties/${id}`);
    toast({
      title: "Link Copied!",
      description: "Property link has been copied to your clipboard.",
    });
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please login to add properties to your favorites.",
      });
      router.push('/login');
      return;
    }
    try {
      // Get current user data
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('favorites')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const currentFavorites = (userData?.favorites || []) as string[];
      let newFavorites: string[];

      if (isFavorite) {
        newFavorites = currentFavorites.filter(favId => favId !== id);
        toast({
          title: "Removed from Favorites",
        });
      } else {
        newFavorites = [...currentFavorites, id];
        toast({
          title: "Added to Favorites!",
        });
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ favorites: newFavorites })
        .eq('id', user.id);

      if (updateError) throw updateError;
    } catch(err: any) {
       console.error("Favorite toggle error: ", err);
       toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update favorites. Please try again.",
      });
    }
  };

  return (
    <Link href={`/properties/${id}`} className="block group h-full">
    <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 rounded-lg hover:-translate-y-1 h-80 md:h-64 relative">
      <CardContent className="p-0 w-full h-full">
        {/* Full height image background */}
        <div className="relative overflow-hidden w-full h-full" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          {images && images.length > 1 ? (
            <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="w-full h-full">
              <CarouselContent className="h-full">
                {images.map((imgSrc, index) => (
                  <CarouselItem key={index} className="h-full">
                    <Image src={imgSrc} alt={`${title} - ${index + 1}`} fill className="object-cover" />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            <Image src={(images && images[0]) || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&h=250&auto=format&fit=crop'} alt={title} fill className="object-cover transform group-hover:scale-110 transition-transform duration-500" />
          )}

          {/* Overlay content */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
            {listingType && (
              <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-sm px-4 py-2 rounded-full font-bold z-10">
                {listingType === 'Sale' ? 'For Sale' : 'For Rent'}
              </div>
            )}
            <div className="absolute top-3 right-3 flex space-x-2 z-10">
               <Button variant="ghost" size="icon" className="w-10 h-10 bg-white/90 hover:bg-white text-gray-700 shadow-lg" onClick={handleFavorite}>
                  <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'text-primary fill-primary' : 'text-gray-500'}`} />
                </Button>
                 <Button variant="ghost" size="icon" className="w-10 h-10 bg-white/90 hover:bg-white text-gray-700 shadow-lg" onClick={handleShare}><Share2 className="w-5 h-5" /></Button>
            </div>

            {/* Details overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="font-bold text-xl mb-2 line-clamp-2">{title}</h3>
              <p className="text-base flex items-center mb-3"><MapPin className="w-5 h-5 mr-2 flex-shrink-0" /> {location}</p>

              <div className="flex items-center text-base gap-6 mb-4">
                  <span className="flex items-center gap-2"><Bed className="w-5 h-5"/> 3</span>
                  <span className="flex items-center gap-2"><Bath className="w-5 h-5"/> 2</span>
                  <span className="flex items-center gap-2"><Car className="w-5 h-5"/> 1</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <p className="font-bold text-xl">₹{price.toLocaleString()}/Month</p>
                  <p className="text-sm opacity-90">Security: ₹{securityDeposit.toLocaleString()}</p>
                </div>
                <Button asChild variant="outline" size="default" className="px-6 py-2 bg-white/20 border-white/30 text-white hover:bg-white/30">
                    <span className="font-semibold">View Details</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
};