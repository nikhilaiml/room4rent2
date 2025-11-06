'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth, useSupabaseClient } from '@/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';
import Footer from '@/components/footer';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['tenant', 'owner'], {
    required_error: 'You need to select a role.',
  }),
});

export default function RegisterPage() {
  const auth = useAuth();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'tenant',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data: userData, error: signUpError } = await auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            role: values.role,
          }
        }
      });

      if (signUpError) throw signUpError;

      // Ensure we have a session before inserting into RLS-protected table
      let session = userData.session;
      if (!session) {
        const { data: signInData, error: signInError } = await auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (signInError) throw signInError;
        session = signInData.session;
      }

      if (userData?.user) {
        // Upsert user profile in users table
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: userData.user.id,
            name: values.name,
            email: values.email,
            role: values.role,
          }, { onConflict: 'id' });

        if (profileError) throw profileError;
      }

      toast({
        title: 'Account Created',
        description: "You're now logged in.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration failed:', error);
      let errorMessage = 'An unexpected error occurred.';
      const msg = String(error?.message || '').toLowerCase();
      if (msg.includes('already registered') || msg.includes('user already registered') || msg.includes('exists')) {
        errorMessage = 'This email is already registered. Please log in.';
      } else if (msg.includes('row level security') || msg.includes('permission denied')) {
        errorMessage = 'Permission denied by RLS while creating profile. Ensure an INSERT policy on table users where id = auth.uid().';
      } else if (msg.includes('relation') && msg.includes('does not exist')) {
        errorMessage = 'Database table "users" does not exist. Run the database-setup.sql in Supabase SQL Editor.';
      } else if (msg.includes('column') && msg.includes('does not exist')) {
        errorMessage = 'Database schema mismatch. Check table columns match the expected schema.';
      } else if (msg.includes('network') || msg.includes('fetch')) {
        errorMessage = 'Network error. Check your connection and try again.';
      } else if (msg.includes('invalid') && msg.includes('uuid')) {
        errorMessage = 'Invalid user ID format. Try logging out and back in.';
      }
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: errorMessage,
      });
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>Enter your details below to create your account</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="m@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>You are a...</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="tenant" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Tenant (Looking for a property)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="owner" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Owner (Want to list a property)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
                <div className="text-center text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="underline text-primary">
                    Login
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
