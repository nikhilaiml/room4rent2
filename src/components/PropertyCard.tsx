'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MapPin, Share2, Heart, Phone, Eye, Bed, Bath, Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const PropertyCard = ({ id, title, location, amenities, securityDeposit, price, views, image, rating }: {
  id: string;
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
    if (user && firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setIsFavorite(userData.favorites && userData.favorites.includes(id));
        }
      });
      return () => unsubscribe();
    }
  }, [user, firestore, id]);

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
    const userRef = doc(firestore, 'users', user.uid);
    try {
      if (isFavorite) {
        await updateDoc(userRef, {
          favorites: arrayRemove(id)
        });
        toast({
          title: "Removed from Favorites",
        });
      } else {
        await updateDoc(userRef, {
          favorites: arrayUnion(id)
        });
        toast({
          title: "Added to Favorites!",
        });
      }
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
    <Link href={`/properties/${id}`} className="block h-full group">
    <Card className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 h-full flex flex-col rounded-lg">
      <CardContent className="p-0 flex-grow flex flex-col">
        <div className="relative">
          <Image src={image.src} alt={title} width={400} height={250} className="w-full object-cover h-56 transform group-hover:scale-105 transition-transform duration-300" data-ai-hint={image.hint} />
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-bold">For Sale</div>
          <div className="absolute top-3 right-3 flex space-x-1">
             <Button variant="ghost" size="icon" className="w-8 h-8 bg-white/80 hover:bg-white text-gray-700" onClick={handleFavorite}>
                <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'text-primary fill-primary' : 'text-gray-500'}`} />
              </Button>
               <Button variant="ghost" size="icon" className="w-8 h-8 bg-white/80 hover:bg-white text-gray-700" onClick={handleShare}><Share2 className="w-4 h-4" /></Button>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-lg flex-1 mr-2 truncate group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground flex items-center mt-1 truncate"><MapPin className="w-4 h-4 mr-1 flex-shrink-0" /> {location}</p>
          
          <div className="flex items-center text-sm text-muted-foreground gap-4 my-3">
              <span className="flex items-center gap-1"><Bed className="w-4 h-4"/> 3</span>
              <span className="flex items-center gap-1"><Bath className="w-4 h-4"/> 2</span>
              <span className="flex items-center gap-1"><Car className="w-4 h-4"/> 1</span>
          </div>

          <div className="flex justify-between items-center mt-auto pt-4 border-t">
            <div>
              <p className="font-bold text-lg text-primary">₹{price.toLocaleString()}/Month</p>
            </div>
            <Button asChild variant="outline" size="sm">
                <p>View Details</p>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
};
