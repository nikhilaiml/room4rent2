
'use client';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PropertyCard } from '@/components/PropertyCard';

interface Property {
  id: string;
  title: string;
  location: string;
  amenities: string;
  securityDeposit: number;
  price: number;
  views: number;
  imageUrls: string[];
  rating: number;
  listingType?: string;
}

interface PropertiesCarouselProps {
  properties: Property[] | null;
  isLoading: boolean;
}

export default function PropertiesCarousel({ properties, isLoading }: PropertiesCarouselProps) {
  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max">
        {properties?.map((prop, index) => (
          <div key={`${prop.id}-${index}`} className="flex-shrink-0 w-80">
            <PropertyCard
              id={prop.id}
              title={prop.title}
              location={prop.location}
              securityDeposit={prop.securityDeposit || 0}
              price={prop.price}
              views={prop.views || 0}
              image={{ src: prop.imageUrls?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&h=250&auto=format&fit=crop', hint: 'property' }}
              rating={prop.rating || 4}
              listingType={prop.listingType}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
