'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Share2, Heart, Bed, Bath, Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useSupabaseClient } from '@/supabase';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
import { motion } from 'framer-motion';

export const PropertyCard = ({ id, title, location, securityDeposit, price, views, images = [], rating, listingType }: {
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
      }, 2000);
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
    } catch (err: any) {
      console.error("Favorite toggle error: ", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update favorites. Please try again.",
      });
    }
  };

  return (
    <Link href={`/properties/${id}`} className="block h-full group">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -10 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="h-full"
      >
        <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-500 h-full flex flex-col rounded-2xl relative group bg-white dark:bg-card">
          <CardContent className="p-0 flex flex-col h-full">
            <div className="relative overflow-hidden aspect-[4/3] flex-shrink-0">
              {images && images.length > 1 ? (
                <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="w-full h-full">
                  <CarouselContent className="h-full ml-0">
                    {images.map((imgSrc, index) => (
                      <CarouselItem key={index} className="h-full pl-0">
                        <motion.div
                          className="relative w-full h-full"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Image
                            src={imgSrc}
                            alt={`${title} - ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              ) : (
                <motion.div
                  className="relative w-full h-full"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6 }}
                >
                  <Image
                    src={(images && images[0]) || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&h=250&auto=format&fit=crop'}
                    alt={title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </motion.div>
              )}

              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

              {listingType && (
                <div className="absolute top-4 left-4 z-10">
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md ${listingType === 'Sale'
                    ? 'bg-blue-500/90 text-white'
                    : 'bg-primary/90 text-white'
                    }`}>
                    {listingType === 'Sale' ? 'For Sale' : 'For Rent'}
                  </div>
                </div>
              )}

              <div className="absolute top-4 right-4 flex space-x-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full bg-white/90 text-gray-700 backdrop-blur-sm shadow-lg hover:bg-white hover:text-primary transition-colors"
                  onClick={handleFavorite}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'text-primary fill-primary' : ''}`} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full bg-white/90 text-gray-700 backdrop-blur-sm shadow-lg hover:bg-white hover:text-primary transition-colors"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="absolute bottom-4 left-4 right-4 z-10 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <p className="font-bold text-2xl drop-shadow-md">₹{price.toLocaleString()}<span className="text-sm font-normal opacity-90">{listingType === 'Sale' ? '' : '/mo'}</span></p>
              </div>
            </div>

            <div className="p-5 flex flex-col flex-1 min-h-0 bg-card">
              <div className="mb-1">
                <div className="flex items-center text-xs font-medium text-primary mb-1 uppercase tracking-wider">
                  {listingType === 'Sale' ? 'Apartment' : 'Rental'}
                </div>
                <h3 className="font-bold text-lg leading-tight truncate group-hover:text-primary transition-colors" title={title}>
                  {title}
                </h3>
              </div>

              <div className="flex items-center text-sm text-muted-foreground mb-4 truncate">
                <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-primary/70" />
                <span className="truncate">{location}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-4 border-t border-border/50">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5" title="3 Bedrooms">
                    <Bed className="w-4 h-4 text-primary/60" />
                    <span className="font-medium text-foreground">3</span>
                  </span>
                  <span className="flex items-center gap-1.5" title="2 Bathrooms">
                    <Bath className="w-4 h-4 text-primary/60" />
                    <span className="font-medium text-foreground">2</span>
                  </span>
                  <span className="flex items-center gap-1.5" title="1 Parking">
                    <Car className="w-4 h-4 text-primary/60" />
                    <span className="font-medium text-foreground">1</span>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};
