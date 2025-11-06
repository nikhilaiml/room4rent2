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
import { getStorage, ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from 'firebase/storage';
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
});


export default function ListPropertyPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
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

  const uploadImages = (files: File[]): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        if (!user) {
          return reject(new Error("User not authenticated for image upload."));
        }
        const storage = getStorage();
        const promises: Promise<string>[] = [];
        let totalBytesTransferred = 0;
        const totalBytes = files.reduce((acc, file) => acc + file.size, 0);

        files.forEach(file => {
            const imageRef = ref(storage, `properties/${user.uid}/${uuidv4()}-${file.name}`);
            const uploadTask = uploadBytesResumable(imageRef, file);
            
            promises.push(new Promise<string>((resolveTask, rejectTask) => {
                uploadTask.on('state_changed',
                    (snapshot: UploadTaskSnapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        // This will be noisy if we aggregate like this, better to calculate total progress
                    },
                    (error) => {
                        console.error(`Upload failed for file: ${file.name}`, error);
                        rejectTask(error);
                    },
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolveTask(downloadURL);
                        } catch (error) {
                            rejectTask(error);
                        }
                    }
                );
            }));

            // Track total progress
            uploadTask.on('state_changed', (snapshot) => {
                // This is not perfect as it doesn't account for already transferred bytes of other files
                // but it's a way to show progress. A better approach would be to track each file's progress.
                // Let's try a simpler aggregation.
            });
        });
        
        // A better way to calculate progress
        const allTasks = files.map(file => {
            const imageRef = ref(storage, `properties/${user.uid}/${uuidv4()}-${file.name}`);
            return uploadBytesResumable(imageRef, file);
        });

        let uploadedBytes = 0;
        const totalSize = allTasks.reduce((acc, task) => acc + task.snapshot.totalBytes, 0);

        allTasks.forEach(task => {
            task.on('state_changed',
                (snapshot) => {
                    // This is not quite right, it doesn't aggregate progress
                }
            );
        });

        // Let's stick to the Promise.all approach which is simpler to reason about for completion
        Promise.all(allTasks.map(task => new Promise<string>((resolveTask, rejectTask) => {
             task.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    // We can't easily aggregate progress this way without more complex state management
                    // A simple approximation:
                    const totalProgress = allTasks.reduce((acc, t) => acc + (t.snapshot.bytesTransferred / t.snapshot.totalBytes), 0);
                    setUploadProgress((totalProgress / allTasks.length) * 100);
                },
                (error) => rejectTask(error),
                async () => {
                    const downloadURL = await getDownloadURL(task.snapshot.ref);
                    resolveTask(downloadURL);
                }
            );
        })))
        .then(urls => resolve(urls))
        .catch(error => reject(error));
    });
};


  async function onSubmit(values: z.infer<typeof propertyFormSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'User not found.' });
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
      const uploadedUrls = await uploadImages(imageFiles);
      
      const propertyData = {
        ...values,
        imageUrls: uploadedUrls,
        city: values.city.toLowerCase(),
        location: values.location.toLowerCase(),
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(firestore, 'properties'), propertyData);

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
