'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Eye } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-64 bg-cover bg-center text-white">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&h=400&auto=format&fit=crop"
            alt="About us hero"
            fill
            style={{ objectFit: 'cover' }}
            className="absolute inset-0"
            data-ai-hint="office interior"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold">About room4rent</h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl">
              Your trusted partner in finding the perfect home away from home.
            </p>
          </div>
        </section>

        {/* Mission and Vision Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Who We Are</h2>
                <p className="text-muted-foreground mb-4">
                  room4rent is an online home rental aggregation platform executing tech-based solutions for individuals in need of independent and comfortable living spaces. We are a team of passionate individuals dedicated to simplifying the rental experience for both tenants and property owners.
                </p>
                <p className="text-muted-foreground">
                  Founded with the vision to bridge the gap between property seekers and providers, we leverage technology to create a seamless, transparent, and efficient ecosystem. Our platform is designed to cater to the diverse needs of students, professionals, and families looking for their next home.
                </p>
              </div>
              <div>
                <Image
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=600&h=400&auto=format&fit=crop"
                  alt="Team collaboration"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                  data-ai-hint="diverse team working"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center mt-16">
              <div className="order-2 md:order-1">
                 <Image
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&h=400&auto=format&fit=crop"
                  alt="Our Vision"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                  data-ai-hint="city skyline sunset"
                />
              </div>
               <div className="order-1 md:order-2">
                <h2 className="text-3xl font-bold mb-4">Our Mission & Vision</h2>
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <Target className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-lg">Our Mission</h3>
                            <p className="text-muted-foreground">To provide a one-stop solution for finding and listing rental properties, ensuring trust, transparency, and convenience for everyone involved.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Eye className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-lg">Our Vision</h3>
                            <p className="text-muted-foreground">To become the most preferred and reliable home rental platform in India, known for our user-centric approach and innovative solutions.</p>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Team Section */}
        <section className="py-16 bg-white px-4">
            <div className="container mx-auto text-center">
                <h2 className="text-3xl font-bold mb-2">Meet Our Team</h2>
                <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
                    We are a small but dedicated team of professionals who are passionate about making a difference in the rental industry.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                   {placeholderImages.testimonials.slice(0, 3).map((member, index) => (
                       <Card key={index} className="text-center p-6 shadow-lg">
                           <CardContent className="flex flex-col items-center">
                               <Image src={member.avatar.src} alt={member.name} width={100} height={100} className="rounded-full mx-auto mb-4" data-ai-hint={member.avatar.hint} />
                               <h4 className="font-bold text-lg">{member.name}</h4>
                               <p className="text-sm text-primary">{member.role.split(' in ')[0]}</p>
                           </CardContent>
                       </Card>
                   ))}
                </div>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
