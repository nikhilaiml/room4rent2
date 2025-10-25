'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MapPin, Share2, Heart, Phone, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
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
    if (user) {
      const userRef = doc(firestore, 'users', user.uid);
      const unsub = require('firebase/firestore').onSnapshot(userRef, (docSnap: any) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setIsFavorite(userData.favorites && userData.favorites.includes(id));
        }
      });
      return () => unsub();
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

  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: "Contact Owner",
      description: "Functionality to call the owner will be implemented soon.",
    });
  };

  const handleVisit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/properties/${id}`);
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
    <Link href={`/properties/${id}`} className="block h-full">
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
                <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
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
    </Link>
  );
};
