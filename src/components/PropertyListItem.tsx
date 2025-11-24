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
        <Card className="overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row rounded-lg h-80 group">
          <CardContent className="p-0 flex flex-col md:flex-row w-full h-full">
            {/* Image Section */}
            <div className="relative overflow-hidden w-full md:w-64 flex-shrink-0 h-48 md:h-80">
              {images && images.length > 1 ? (
                <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="w-full h-full">
                  <CarouselContent className="h-full">
                    {images.map((imgSrc, index) => (
                      <CarouselItem key={index} className="h-full">
                        <motion.div
                          className="relative w-full h-full"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.4 }}
                        >
                          <Image
                            src={imgSrc}
                            alt={`${title} - ${index + 1}`}
                            width={256}
                            height={320}
                            className="w-full object-cover h-full"
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
                  transition={{ duration: 0.4 }}
                >
                  <Image
                    src={(images && images[0]) || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&h=250&auto=format&fit=crop'}
                    alt={title}
                    width={256}
                    height={320}
                    className="w-full object-cover h-full"
                  />
                </motion.div>
              )}

              {/* Gradient Overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />

              {listingType && (
                <motion.div
                  className="absolute top-3 left-3 bg-primary text-primary-foreground text-sm px-4 py-2 rounded-full font-bold z-10 shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  {listingType === 'Sale' ? 'For Sale' : 'For Rent'}
                </motion.div>
              )}

              <div className="absolute top-3 right-3 flex space-x-2 z-10">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 bg-white/90 hover:bg-white text-gray-700 shadow-lg backdrop-blur-sm"
                    onClick={handleFavorite}
                  >
                    <motion.div
                      animate={isFavorite ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'text-primary fill-primary' : 'text-gray-500'}`} />
                    </motion.div>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 bg-white/90 hover:bg-white text-gray-700 shadow-lg backdrop-blur-sm"
                    onClick={handleShare}
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-6 flex flex-col flex-1 min-w-0">
              <motion.h3
                className="font-bold text-xl group-hover:text-primary transition-colors leading-tight mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {title}
              </motion.h3>

              <motion.p
                className="text-base text-muted-foreground flex items-center mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <MapPin className="w-5 h-5 mr-2 flex-shrink-0" /> {location}
              </motion.p>

              <motion.div
                className="flex items-center text-base text-muted-foreground gap-6 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="flex items-center gap-2"><Bed className="w-5 h-5" /> 3</span>
                <span className="flex items-center gap-2"><Bath className="w-5 h-5" /> 2</span>
                <span className="flex items-center gap-2"><Car className="w-5 h-5" /> 1</span>
              </motion.div>

              <motion.div
                className="flex justify-end gap-2 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="default" className="px-4 py-2 shadow-md hover:shadow-lg transition-shadow">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Owner
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="default" className="px-4 py-2 shadow-md hover:shadow-lg transition-shadow">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Enquiry
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                className="flex justify-between items-center mt-auto pt-5 border-t border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex flex-col">
                  <p className="font-bold text-xl text-primary">₹{price.toLocaleString()}/Month</p>
                  <p className="text-sm text-muted-foreground">Security: ₹{securityDeposit.toLocaleString()}</p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild variant="outline" size="default" className="px-6 py-2 shadow-md hover:shadow-lg transition-shadow">
                    <span className="font-semibold">View Details</span>
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