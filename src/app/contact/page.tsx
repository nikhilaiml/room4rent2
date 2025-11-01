'use client';

import { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  subject: z.string().min(5, 'Subject must be at least 5 characters.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
});

export default function ContactPage() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  function onSubmit(values: z.infer<typeof contactFormSchema>) {
    console.log(values);
    // Here you would typically send the data to your backend
    toast({
      title: 'Message Sent!',
      description: 'Thank you for contacting us. We will get back to you shortly.',
    });
    form.reset();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold">Get in Touch</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              We&apos;d love to hear from you! Whether you have a question, feedback, or need assistance, our team is ready to help.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-10">
            {/* Contact Information */}
            <div className="lg:col-span-2">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>You can reach us through the following channels.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 text-sm">
                        <div className="flex items-start gap-4">
                            <MapPin className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold">Our Address</h3>
                                <p className="text-muted-foreground">D-63/319c, Laharatara, Varanasi, Uttar Pradesh, India</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <Mail className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold">Email Us</h3>
                                <a href="mailto:contact@room4rent.in" className="text-muted-foreground hover:text-primary">contact@room4rent.in</a>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <Phone className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold">Call Us</h3>
                                <a href="tel:+917667651878" className="text-muted-foreground hover:text-primary">+91-76676 51878</a>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <Card>
                 <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                    <CardDescription>Fill out the form below and we will get back to you as soon as possible.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                             <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl><Input placeholder="Regarding a property..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl><Textarea placeholder="Your message here..." rows={5} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                         {form.formState.isSubmitting ? 'Sending...' : <>Send Message <Send className="w-4 h-4 ml-2" /></>}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
