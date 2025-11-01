
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
    <Carousel opts={{ align: "start", loop: true }}>
      <CarouselContent>
        {properties?.map((prop, index) => (
          <CarouselItem key={`${prop.id}-${index}`} className="md:basis-1/2 lg:basis-1/3">
            <PropertyCard
              id={prop.id}
              title={prop.title}
              location={prop.location}
              amenities={prop.amenities || ''}
              securityDeposit={prop.securityDeposit || 0}
              price={prop.price}
              views={prop.views || 0}
              image={{ src: prop.imageUrls?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&h=250&auto=format&fit=crop', hint: 'property' }}
              rating={prop.rating || 4}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-[-20px]" />
      <CarouselNext className="right-[-20px]" />
    </Carousel>
  );
}
