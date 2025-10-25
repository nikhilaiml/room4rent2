import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, BedDouble, Users, Star, ChevronLeft, ChevronRight, Share2, Heart, Phone, Eye } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const cities = [
  { name: 'Varanasi', img: '/varanasi.jpg' },
  { name: 'Lucknow', img: '/lucknow.jpg' },
  { name: 'Prayagraj', img: '/prayagraj.jpg' },
  { name: 'Patna', img: '/patna.jpg' },
];

const properties = [
  {
    id: 1,
    title: 'Homes 39',
    location: 'Lanka (Varanasi)',
    amenities: 'With standard amenities like Bed, Matters, Tabl...',
    securityDeposit: 20000,
    price: 20000,
    views: 268,
    image: '/property1.jpg',
    rating: 0
  },
  {
    id: 2,
    title: 'Homes 38',
    location: 'Lanka (Varanasi)',
    amenities: 'Fully Independent Furnished 2BHK Flats Near Hy...',
    securityDeposit: 20000,
    price: 20000,
    views: 121,
    image: '/property2.jpg',
    rating: 0
  },
];

const testimonials = [
    {
        name: 'Rajneesh Kumar',
        role: 'Tenant in RIl homes01',
        text: 'When I moved to a completely new city from my hometown, RoomLelo really helped me to find an affordable place to live and assisted me with other requirements. Great Initiative.',
        avatar: '/avatar1.png'
    },
    {
        name: 'Suryansh Kumar',
        role: 'Tenant in RIl homes02',
        text: 'Cannot be more thankful to you RoomLelo for your existence. Saved my time, effort and money by simply booking the flat online from your website. Move-in was quick and easy.',
        avatar: '/avatar2.png'
    },
    {
        name: 'Swapnil',
        role: 'Tenant in Sparsh apartment',
        text: 'Once my fan got out of order in the late evening, they solved it within an hour. Kept their promise of quick maintenance.',
        avatar: '/avatar3.png'
    }
];

const benefits = [
  { title: 'Free Listing', description: 'You won\'t have to worry about paying any amount for better audience engagement unlike other property search platforms.', icon: '/benefit1.png' },
  { title: 'Rent on Time', description: 'You won\'t have to worry about rent delays or defaults, once associated with us.', icon: '/benefit2.png' },
  { title: 'Verified tenants', description: 'You won\'t have to worry about problematic tenants or possession of valid Identity Proof of Tenant\'s, once associated with us.', icon: '/benefit3.png' },
  { title: 'Owners Dashboard', description: 'You will get to access all relevant details from your customized dashboard on our exclusive Partners app.', icon: '/benefit4.png' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section className="relative h-[400px] bg-cover bg-center text-white" style={{ backgroundImage: "url('/hero-bg.png')"}}>
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6 w-full max-w-4xl mx-auto mt-auto mb-[-60px]">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div className="md:col-span-1">
                            <label htmlFor="location" className="text-sm font-semibold text-gray-600">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input id="location" placeholder="Search location, hostel..." className="pl-10" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="property-type" className="text-sm font-semibold text-gray-600">Property Type</label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Type Of Property" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="room">Room</SelectItem>
                                    <SelectItem value="1bhk">1BHK</SelectItem>
                                    <SelectItem value="2bhk">2BHK</SelectItem>
                                    <SelectItem value="pg">PG</SelectItem>
                                    <SelectItem value="hostel">Hostel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label htmlFor="for-whom" className="text-sm font-semibold text-gray-600">For Whom</label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Preference" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="students">Students</SelectItem>
                                    <SelectItem value="family">Family</SelectItem>
                                    <SelectItem value="bachelors">Bachelors</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full h-12 text-base md:mt-6">
                            <Search className="mr-2 h-5 w-5" /> Search
                        </Button>
                    </div>
                </div>
            </div>
        </section>

        <section className="pt-24 pb-12 bg-white">
          <div className="container mx-auto">
            <div className="flex justify-center space-x-8">
              {cities.map(city => (
                <div key={city.name} className="text-center">
                  <Image src={city.img} alt={city.name} width={100} height={100} className="rounded-full mx-auto" />
                  <p className="mt-2 font-semibold">{city.name}</p>
                  {city.name !== 'Varanasi' && city.name !== 'Lucknow' && <p className="text-xs text-gray-500">(Coming Soon)</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-6">Trending Properties in Varanasi</h2>
            <Carousel opts={{ align: "start", loop: true }}>
              <CarouselContent>
                {properties.concat(properties).map((prop, index) => (
                  <CarouselItem key={`${prop.id}-${index}`} className="md:basis-1/2 lg:basis-1/3">
                    <PropertyCard {...prop} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-[-20px]" />
              <CarouselNext className="right-[-20px]" />
            </Carousel>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <Users className="mr-3 text-primary h-8 w-8" />
              RoomLelo Recommendations
            </h2>
            <Carousel opts={{ align: "start", loop: true }}>
              <CarouselContent>
                {properties.map((prop, index) => (
                  <CarouselItem key={`${prop.id}-${index}`} className="md:basis-1/2 lg:basis-1/3">
                    <PropertyCard {...prop} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-[-20px]" />
              <CarouselNext className="right-[-20px]" />
            </Carousel>
          </div>
        </section>

        <section className="py-12 bg-background">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold mb-2">Our Tenants Speak</h2>
                <p className="text-muted-foreground mb-8">We have been working with clients around the Lucknow Varanasi</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map(testimonial => (
                        <Card key={testimonial.name} className="bg-white text-center p-6 shadow-lg">
                            <CardContent>
                                <p className="text-gray-600 mb-6">&quot;{testimonial.text}&quot;</p>
                                <Image src={testimonial.avatar} alt={testimonial.name} width={60} height={60} className="rounded-full mx-auto mb-4" />
                                <h4 className="font-bold">{testimonial.name}</h4>
                                <p className="text-sm text-gray-500">{testimonial.role}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Benefits of Listing with us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map(benefit => (
                <div key={benefit.title} className="flex items-start">
                  <Image src={benefit.icon} alt={benefit.title} width={60} height={60} className="mr-4" />
                  <div>
                    <h4 className="font-bold text-lg mb-2">{benefit.title}</h4>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">Lease Your Property Now &rarr;</Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

const PropertyCard = ({ title, location, amenities, securityDeposit, price, views, image, rating }: (typeof properties)[0]) => (
  <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
    <CardContent className="p-0">
      <div className="relative">
        <Image src={image} alt={title} width={400} height={250} className="w-full object-cover" />
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md flex items-center">
            <Star className="w-3 h-3 mr-1" /> {rating}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{title}</h3>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="w-8 h-8"><Share2 className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="w-8 h-8"><Heart className="w-4 h-4" /></Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground flex items-center"><MapPin className="w-4 h-4 mr-1" /> {location}</p>
        <p className="text-sm my-2">{amenities}</p>
        <p className="text-sm font-semibold">Security Deposit: ₹{securityDeposit.toLocaleString()}</p>
        <div className="flex items-center text-sm text-amber-600 my-2">
            <Eye className="w-4 h-4 mr-1" /> {views} people already view this property, Hurr...
        </div>
        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-xs text-muted-foreground">Starting at:</p>
            <p className="font-bold text-lg">₹{price.toLocaleString()}/Month</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline"><Phone className="w-4 h-4 mr-2" /> Call</Button>
            <Button>Visit</Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
