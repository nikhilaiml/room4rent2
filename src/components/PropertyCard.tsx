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
        whileHover={{ y: -8 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Card className="overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 h-80 flex flex-col rounded-lg relative group">
          <CardContent className="p-0 flex flex-col h-full">
            <div className="relative overflow-hidden h-48 flex-shrink-0">
              {images && images.length > 1 ? (
                <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="w-full h-full">
                  <CarouselContent className="h-full">
                    {images.map((imgSrc, index) => (
                      <CarouselItem key={index} className="h-full">
                        <motion.div
                          className="relative w-full h-48"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.4 }}
                        >
                          <Image
                            src={imgSrc}
                            alt={`${title} - ${index + 1}`}
                            width={400}
                            height={250}
                            className="w-full object-cover h-48"
                          />
                        </motion.div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              ) : (
                <motion.div
                  className="relative w-full h-48"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                >
                  <Image
                    src={(images && images[0]) || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&h=250&auto=format&fit=crop'}
                    alt={title}
                    width={400}
                    height={250}
                    className="w-full object-cover h-48"
                  />
                </motion.div>
              )}

              {/* Gradient Overlay on Hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />

              {listingType && (
                <motion.div
                  className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-bold z-10 shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  {listingType === 'Sale' ? 'For Sale' : 'For Rent'}
                </motion.div>
              )}

              <div className="absolute top-3 right-3 flex space-x-1 z-10">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 bg-white/90 hover:bg-white text-gray-700 backdrop-blur-sm shadow-lg"
                    onClick={handleFavorite}
                  >
                    <motion.div
                      animate={isFavorite ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'text-primary fill-primary' : 'text-gray-500'}`} />
                    </motion.div>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 bg-white/90 hover:bg-white text-gray-700 backdrop-blur-sm shadow-lg"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </div>

            <div className="p-4 flex flex-col flex-1 min-h-0">
              <motion.h3
                className="font-bold text-lg mb-1 truncate group-hover:text-primary transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {title}
              </motion.h3>

              <motion.p
                className="text-sm text-muted-foreground flex items-center mb-2 truncate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" /> {location}
              </motion.p>

              <motion.div
                className="flex items-center text-sm text-muted-foreground gap-4 mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> 3</span>
                <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> 2</span>
                <span className="flex items-center gap-1"><Car className="w-4 h-4" /> 1</span>
              </motion.div>

              <motion.div
                className="flex justify-between items-center mt-auto pt-3 border-t"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <div>
                  <p className="font-bold text-lg text-primary">₹{price.toLocaleString()}{listingType === 'Sale' ? '' : '/Month'}</p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="default" size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                    View Details
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};
