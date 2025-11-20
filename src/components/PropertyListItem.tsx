'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MapPin, Share2, Heart, Phone, Eye, Bed, Bath, Car, MessageSquare } from 'lucide-react';
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
    <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row rounded-lg hover:-translate-y-1">
      <CardContent className="p-0 flex flex-col md:flex-row w-full">
        {/* Image Section - Top on mobile, Left on desktop */}
        <div className="relative overflow-hidden w-full md:w-64 flex-shrink-0">
          <Image src={image.src} alt={title} width={256} height={192} className="w-full object-cover h-48 transform group-hover:scale-110 transition-transform duration-500" data-ai-hint={image.hint} />
          {listingType && (
            <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-sm px-4 py-2 rounded-full font-bold">
              {listingType === 'Sale' ? 'For Sale' : 'For Rent'}
            </div>
          )}
          <div className="absolute top-3 right-3 flex space-x-2">
             <Button variant="ghost" size="icon" className="w-10 h-10 bg-white/90 hover:bg-white text-gray-700 shadow-lg" onClick={handleFavorite}>
                <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'text-primary fill-primary' : 'text-gray-500'}`} />
              </Button>
               <Button variant="ghost" size="icon" className="w-10 h-10 bg-white/90 hover:bg-white text-gray-700 shadow-lg" onClick={handleShare}><Share2 className="w-5 h-5" /></Button>
          </div>
        </div>

        {/* Details Section - Right Side */}
        <div className="p-6 flex flex-col flex-1 min-w-0">
          <h3 className="font-bold text-xl group-hover:text-primary transition-colors leading-tight mb-2">{title}</h3>
          <p className="text-base text-muted-foreground flex items-center mb-3"><MapPin className="w-5 h-5 mr-2 flex-shrink-0" /> {location}</p>

          <div className="flex items-center text-base text-muted-foreground gap-6 mb-4">
              <span className="flex items-center gap-2"><Bed className="w-5 h-5"/> 3</span>
              <span className="flex items-center gap-2"><Bath className="w-5 h-5"/> 2</span>
              <span className="flex items-center gap-2"><Car className="w-5 h-5"/> 1</span>
          </div>

          <div className="flex justify-between items-center mt-auto pt-5 border-t border-gray-200">
            <div className="flex flex-col">
              <p className="font-bold text-xl text-primary">₹{price.toLocaleString()}/Month</p>
              <p className="text-sm text-muted-foreground">Security: ₹{securityDeposit.toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="default" className="px-4 py-2">
                <Phone className="w-4 h-4 mr-2" />
                Call Owner
              </Button>
              <Button variant="outline" size="default" className="px-4 py-2">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Enquiry
              </Button>
              <Button asChild variant="outline" size="default" className="px-6 py-2">
                  <span className="font-semibold">View Details</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
};