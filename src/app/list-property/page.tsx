'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

const propertyFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  location: z.string().min(3, 'Location is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  propertyType: z.enum(['Room', '1BHK', '2BHK', 'PG', 'Hostel']),
});


export default function ListPropertyPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({
        variant: 'destructive',
        title: 'Login Required',
        description: 'You must be logged in to list a property.',
      });
      router.push('/login');
    }
  }, [user, isUserLoading, router, toast]);

  const form = useForm<z.infer<typeof propertyFormSchema>>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: '',
      description: '',
      city: '',
      location: '',
      price: 0,
      propertyType: 'Room',
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof propertyFormSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'User not found.' });
      return;
    }
    
    // For now, image upload to cloud will be a separate step.
    // We'll just use a placeholder URL. In a real app, you'd upload `imageFile` to Firebase Storage
    // and get a URL to save in Firestore.
    const imageUrl = imagePreview ? 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop';

    try {
      await addDoc(collection(firestore, 'properties'), {
        ...values,
        city: values.city.toLowerCase(),
        location: values.location.toLowerCase(),
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        imageUrls: [imageUrl],
      });
      toast({
        title: 'Property Listed!',
        description: 'Your property has been successfully listed.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Error listing property: ", error);
      toast({
        variant: 'destructive',
        title: 'Listing Failed',
        description: error.message || 'Could not list your property. Please try again.',
      });
    }
  }

  if (isUserLoading || !user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12">
        <Card className="w-full max-w-2xl mx-4">
          <CardHeader>
            <CardTitle>List Your Property</CardTitle>
            <CardDescription>Fill out the details below to put your property on the market.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-2">
                    <Label>Property Image</Label>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-border border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50">
                            {imagePreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={imagePreview} alt="Property preview" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                </div>
                            )}
                            <Input id="dropzone-file" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                        </label>
                    </div>
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cozy 1BHK near city center" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your property in detail..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Varanasi" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Location / Locality</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Lanka" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Rent Price (per month)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 15000" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select property type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Room">Room</SelectItem>
                              <SelectItem value="1BHK">1BHK</SelectItem>
                              <SelectItem value="2BHK">2BHK</SelectItem>
                              <SelectItem value="PG">PG</SelectItem>
                              <SelectItem value="Hostel">Hostel</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                 <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Listing...' : 'List Property'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
