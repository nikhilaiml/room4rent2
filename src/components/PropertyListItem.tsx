'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MapPin, Share2, Heart, Phone, Eye, Bed, Bath, Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useSupabaseClient } from '@/supabase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const PropertyListItem = ({ id, title, location, securityDeposit, price, views, image, rating, listingType }: {
  id: string;
  title: string;
  location: string;
  securityDeposit: number;
  price: number;
  views: number;
  image: { src: string; hint: string };
  rating: number;
  listingType?: string;
}) => {
  const { toast } = useToast();
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

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
    <Link href={`/properties/${id}`} className="block group">
    <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex rounded-lg hover:-translate-y-1">
      <CardContent className="p-0 flex flex-row w-full">
        {/* Image Section - Left Side */}
        <div className="relative overflow-hidden w-48 flex-shrink-0">
          <Image src={image.src} alt={title} width={192} height={144} className="w-full object-cover h-32 transform group-hover:scale-110 transition-transform duration-500" data-ai-hint={image.hint} />
          {listingType && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-bold">
              {listingType === 'Sale' ? 'For Sale' : 'For Rent'}
            </div>
          )}
          <div className="absolute top-2 right-2 flex space-x-1">
             <Button variant="ghost" size="icon" className="w-6 h-6 bg-white/80 hover:bg-white text-gray-700" onClick={handleFavorite}>
                <Heart className={`w-3 h-3 transition-colors ${isFavorite ? 'text-primary fill-primary' : 'text-gray-500'}`} />
              </Button>
               <Button variant="ghost" size="icon" className="w-6 h-6 bg-white/80 hover:bg-white text-gray-700" onClick={handleShare}><Share2 className="w-3 h-3" /></Button>
          </div>
        </div>

        {/* Details Section - Right Side */}
        <div className="p-4 flex flex-col flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground flex items-center mt-1 truncate"><MapPin className="w-4 h-4 mr-1 flex-shrink-0" /> {location}</p>

          <div className="flex items-center text-sm text-muted-foreground gap-3 my-2">
              <span className="flex items-center gap-1"><Bed className="w-3 h-3"/> 3</span>
              <span className="flex items-center gap-1"><Bath className="w-3 h-3"/> 2</span>
              <span className="flex items-center gap-1"><Car className="w-3 h-3"/> 1</span>
          </div>

          <div className="flex justify-between items-center mt-auto pt-3 border-t">
            <div>
              <p className="font-bold text-base text-primary">₹{price.toLocaleString()}/Month</p>
            </div>
            <Button asChild variant="outline" size="sm" className="text-xs px-3 py-1 h-7">
                <span>View Details</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
};