'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useSupabaseClient } from '@/supabase';
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
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { Progress } from '@/components/ui/progress';

const propertyFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  location: z.string().min(3, 'Location is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  propertyType: z.enum(['Room', '1BHK', '2BHK', 'PG', 'Hostel']),
  securityDeposit: z.coerce.number().min(0, 'Security deposit must be a positive number'),
  forWhom: z.enum(['Family', 'Girls', 'Boys', 'Any']),
  ownerResidence: z.string().min(1, 'Owner residence is required'),
  type: z.string().min(1, 'Type is required'),
  furnishing: z.string().min(1, 'Furnishing is required'),
  listedBy: z.string().min(1, 'Listed by is required'),
  superBuiltUpArea: z.coerce.number().min(0, 'Super built-up area must be a positive number'),
  carpetArea: z.coerce.number().min(0, 'Carpet area must be a positive number'),
  maintenance: z.coerce.number().min(0, 'Maintenance must be a positive number'),
  totalFloors: z.coerce.number().min(1, 'Total floors must be at least 1'),
  floorNo: z.coerce.number().min(0, 'Floor number must be 0 or more'),
  carParking: z.string().min(1, 'Car parking is required'),
  facing: z.string().min(1, 'Facing is required'),
});


export default function ListPropertyPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({
        variant: 'destructive',
        title: 'Login Required',
        description: 'You must be logged in to list a property.',
      });
      router.push('/login');
    }
     // Cleanup object URLs on component unmount
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [user, isUserLoading, router, toast, imagePreviews]);

  const form = useForm<z.infer<typeof propertyFormSchema>>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: '',
      description: '',
      city: '',
      location: '',
      price: 0,
      propertyType: 'Room',
      securityDeposit: 0,
      forWhom: 'Any',
      ownerResidence: '',
      type: '',
      furnishing: '',
      listedBy: '',
      superBuiltUpArea: 0,
      carpetArea: 0,
      maintenance: 0,
      totalFloors: 1,
      floorNo: 0,
      carParking: '',
      facing: '',
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const currentFilesCount = imageFiles.length;
      const totalFiles = currentFilesCount + newFiles.length;

      if (totalFiles > 5) {
          toast({
              variant: 'destructive',
              title: 'Upload Limit Exceeded',
              description: 'You can upload a maximum of 5 images.',
          });
          return;
      }
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));

      setImageFiles(prev => [...prev.slice(0, 5 - newFiles.length), ...newFiles]);
      setImagePreviews(prev => [...prev.slice(0, 5 - newPreviews.length), ...newPreviews]);
    }
  };
  
  const removeImage = (index: number) => {
    const newPreviews = [...imagePreviews];
    const newFiles = [...imageFiles];
    
    URL.revokeObjectURL(newPreviews[index]);

    newPreviews.splice(index, 1);
    newFiles.splice(index, 1);
    
    setImagePreviews(newPreviews);
    setImageFiles(newFiles);
  }

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (!user) {
      throw new Error('User not authenticated for image upload.');
    }

    // Preflight: verify bucket exists and is accessible for this user
    const { error: bucketListError } = await supabase.storage
      .from('properties')
      .list('', { limit: 1 });
    if (bucketListError) {
      const msg = String(bucketListError.message || '').toLowerCase();
      if (msg.includes('not found')) {
        throw new Error('Storage bucket "properties" not found. Create it and set Public: ON.');
      }
      if (msg.includes('permission denied') || msg.includes('unauthorized')) {
        throw new Error('No permission to access storage bucket. Add storage policies for authenticated users.');
      }
      // Non-fatal, proceed to attempt upload which will produce a clearer error
    }

    const uploadedPublicUrls: string[] = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const safeBaseName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const fileName = `${uuidv4()}-${safeBaseName}`;
      // Path is inside the 'properties' bucket, do not repeat bucket name
      const filePath = `${user.id}/${fileName}`;

      // Add a 25s timeout so UI doesn't hang forever
      const timeoutMs = 25000;
      const uploadPromise = supabase.storage
        .from('properties')
        .upload(filePath, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        });
      const timeoutPromise = new Promise<{ error: any }>((_resolve, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error('Image upload timed out. Check bucket policies and network.'));
        }, timeoutMs);
      });

      const { error: uploadError } = await Promise.race([uploadPromise as any, timeoutPromise as any]);

      if (uploadError) {
        // Surface clearer guidance for common misconfigurations
        const hint = uploadError.message?.includes('Not Found') || uploadError.message?.includes('not found')
          ? 'Storage bucket "properties" is missing in Supabase project.'
          : uploadError.message;
        throw new Error(hint || 'Image upload failed.');
      }

      const { data: publicUrlData } = supabase.storage
        .from('properties')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error('Could not generate public URL for the uploaded image.');
      }

      // Verify the URL is actually reachable (helps catch policy misconfig)
      try {
        const headResponse = await fetch(publicUrlData.publicUrl, { method: 'HEAD' });
        if (!headResponse.ok) {
          throw new Error(`Uploaded image not publicly accessible (HTTP ${headResponse.status}). Check bucket public setting and SELECT policy.`);
        }
      } catch (e: any) {
        throw new Error(e?.message || 'Uploaded image not publicly accessible.');
      }

      uploadedPublicUrls.push(publicUrlData.publicUrl);

      const progressValue = ((index + 1) / files.length) * 100;
      setUploadProgress(progressValue);
    }

    return uploadedPublicUrls;
  };


  async function onSubmit(values: z.infer<typeof propertyFormSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'User not found.',
      });
      return;
    }
  
    if (imageFiles.length < 2) {
      setImageError('Please upload at least 2 photos.');
      toast({
        variant: 'destructive',
        title: 'Upload Error',
        description: 'Please upload at least 2 photos of your property.',
      });
      return;
    }
  
    setImageError(null);
    setIsUploading(true);
    setUploadProgress(0);
  
    try {
      // ✅ Upload images first
      const uploadedUrls = await uploadImages(imageFiles);
  
      // ✅ Safely fetch authenticated user ID
      const {
        data: { user: authUser },
        error: userFetchError,
      } = await supabase.auth.getUser();
  
      if (userFetchError || !authUser) {
        throw new Error('Could not fetch authenticated user. Please re-login.');
      }
  
      // ✅ Prepare property data
      const propertyData = {
        ...values,
        imageUrls: uploadedUrls, // array of public image URLs
        city: values.city.toLowerCase(),
        location: values.location.toLowerCase(),
        ownerId: authUser.id, // ensures UUID is valid for RLS
        createdAt: new Date().toISOString(),
      };
  
      // ✅ Insert into Supabase table
      const { data, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select();
  
      console.log('Insert result:', { data, error }); // optional debug
  
      if (error) throw error;
  
      toast({
        title: 'Property Listed!',
        description: 'Your property has been successfully listed.',
      });
  
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error listing property: ', error);
      const raw = String(error?.message || '');
      let friendly = raw;
  
      // 🔍 Friendly readable messages
      if (/relation\s+"?properties"?\s+does not exist/i.test(raw)) {
        friendly = 'Table "public.properties" does not exist. Create it in Supabase.';
      } else if (/column\s+"?imageurls"?\s+does not exist/i.test(raw)) {
        friendly = 'Column "imageUrls" is missing in table "public.properties".';
      } else if (/violates row-level security policy|row level security/i.test(raw)) {
        friendly = 'RLS blocked the insert. Add an INSERT policy: ownerId = auth.uid().';
      } else if (/permission denied/i.test(raw)) {
        friendly = 'Permission denied by RLS. Check table policies for INSERT/SELECT.';
      } else if (/bucket.*not.*found/i.test(raw)) {
        friendly = 'Storage bucket "properties" not found. Create it and set Public: ON.';
      } else if (/invalid input syntax for type uuid/i.test(raw)) {
        friendly = 'ownerId must be UUID. Ensure you are logged in and using auth.uid().';
      } else if (!raw) {
        friendly = 'Unknown error occurred.';
      }
  
      toast({
        variant: 'destructive',
        title: 'Listing Failed',
        description: friendly,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
            <CardDescription>Fill out the details below to put your property on the market. Upload at least 2 photos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-2">
                    <Label>Property Images (2 to 5 images)</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                            <Image src={preview} alt={`Property preview ${index+1}`} width={200} height={120} className="w-full h-24 object-cover rounded-lg" />
                            <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none" disabled={isUploading}>
                            <X className="w-3 h-3"/>
                            </button>
                        </div>
                        ))}
                        {imagePreviews.length < 5 &&
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-24 border-2 border-border border-dashed rounded-lg ${isUploading ? 'cursor-not-allowed bg-muted/50' : 'cursor-pointer bg-card hover:bg-muted/50'}`}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <Input id="dropzone-file" type="file" className="hidden" onChange={handleImageChange} accept="image/*" multiple disabled={isUploading} />
                                </label>
                            </div>
                        }
                    </div>
                    {imageError && <p className="text-sm font-medium text-destructive">{imageError}</p>}
                </div>


                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cozy 1BHK near city center" {...field} disabled={isUploading} />
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
                        <Textarea placeholder="Describe your property in detail..." {...field} disabled={isUploading} />
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
                            <Input placeholder="e.g., Varanasi" {...field} disabled={isUploading} />
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
                            <Input placeholder="e.g., Lanka" {...field} disabled={isUploading} />
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
                            <Input type="number" placeholder="e.g., 15000" {...field} disabled={isUploading} />
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
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isUploading}>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="securityDeposit"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Security Deposit Amount (INR) *</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 30000" {...field} disabled={isUploading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                      control={form.control}
                      name="forWhom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>For Whom</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isUploading}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select for whom" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Family">Family</SelectItem>
                              <SelectItem value="Girls">Girls</SelectItem>
                              <SelectItem value="Boys">Boys</SelectItem>
                              <SelectItem value="Any">Any</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="ownerResidence"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Owner Residence</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Same City" {...field} disabled={isUploading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Apartment" {...field} disabled={isUploading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="furnishing"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Furnishing</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Fully Furnished" {...field} disabled={isUploading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="listedBy"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Listed By</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Owner" {...field} disabled={isUploading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="superBuiltUpArea"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Super Built-up Area (Sqft) *</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 1200" {...field} disabled={isUploading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="carpetArea"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Carpet Area (Sqft) *</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 1000" {...field} disabled={isUploading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="maintenance"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Maintenance (Monthly) *</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 500" {...field} disabled={isUploading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="totalFloors"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Total Floors *</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 5" {...field} disabled={isUploading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="floorNo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Floor No *</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 2" {...field} disabled={isUploading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="carParking"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Car Parking</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Available" {...field} disabled={isUploading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="facing"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Facing</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., East" {...field} disabled={isUploading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                
                 {isUploading && (
                    <div className="space-y-2">
                        <Label>Upload Progress</Label>
                        <Progress value={uploadProgress} />
                        <p className="text-sm text-muted-foreground text-center">{Math.round(uploadProgress)}% complete</p>
                    </div>
                 )}

                 <Button type="submit" className="w-full" disabled={isUploading}>
                  {isUploading ? 'Uploading & Listing...' : 'List Property'}
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
