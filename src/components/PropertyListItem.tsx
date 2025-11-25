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
import { motion } from 'framer-motion';

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
    <Link href={`/properties/${id}`} className="block group">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ x: 4 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Card className="overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row rounded-2xl h-auto md:h-80 group bg-white dark:bg-card">
          <CardContent className="p-0 flex flex-col md:flex-row w-full h-full">
            {/* Image Section */}
            <div className="relative overflow-hidden w-full md:w-72 flex-shrink-0 h-64 md:h-full">
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
                  />
                </motion.div>
              )}

              {/* Gradient Overlay */}
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
            </div>

            {/* Details Section */}
            <div className="p-6 md:p-8 flex flex-col flex-1 min-w-0 justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <motion.h3
                    className="font-bold text-2xl group-hover:text-primary transition-colors leading-tight line-clamp-1"
                  >
                    {title}
                  </motion.h3>
                  <div className="flex items-center bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs font-bold">
                    <Star className="w-3 h-3 mr-1 fill-yellow-700" /> {rating || 4.5}
                  </div>
                </div>

                <p className="text-muted-foreground flex items-center mb-6 text-sm">
                  <MapPin className="w-4 h-4 mr-1.5 text-primary/70 flex-shrink-0" /> {location}
                </p>

                <div className="flex items-center text-sm text-gray-600 gap-6 mb-6">
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><Bed className="w-4 h-4 text-primary/70" /> 3 Beds</span>
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><Bath className="w-4 h-4 text-primary/70" /> 2 Baths</span>
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><Car className="w-4 h-4 text-primary/70" /> Parking</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-100 mt-2 gap-4">
                <div className="flex flex-col items-start">
                  <p className="font-bold text-2xl text-primary">₹{price.toLocaleString()}<span className="text-sm text-muted-foreground font-normal">/Month</span></p>
                  <p className="text-xs text-muted-foreground">Security: ₹{securityDeposit.toLocaleString()}</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <Button variant="outline" size="sm" className="flex-1 md:flex-none border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 md:flex-none border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Enquiry
                  </Button>
                  <Button size="sm" className="flex-1 md:flex-none bg-primary hover:bg-primary-dark shadow-lg hover:shadow-primary/30 transition-all">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};