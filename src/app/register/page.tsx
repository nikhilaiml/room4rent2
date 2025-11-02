'use client';

import { useState, useEffect } from 'react';
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
import { useAuth, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/header';
import Footer from '@/components/footer';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';


const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['tenant', 'owner'], {
    required_error: 'You need to select a role.',
  }),
  phoneNumber: z.string().min(10, { message: 'Please enter a valid phone number.' }),
});

export default function RegisterPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!auth) return;
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
  }, [auth]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'tenant',
      phoneNumber: ''
    },
  });

  const handleSendOtp = async () => {
    const phoneNumber = form.getValues('phoneNumber');
    if (!phoneNumber) {
        form.setError('phoneNumber', { type: 'manual', message: 'Phone number is required.' });
        return;
    }
    
    try {
        const appVerifier = window.recaptchaVerifier;
        const result = await signInWithPhoneNumber(auth, `+${phoneNumber}`, appVerifier);
        setConfirmationResult(result);
        setIsOtpSent(true);
        toast({
            title: 'OTP Sent',
            description: 'An OTP has been sent to your phone number.',
        });
    } catch(error: any) {
        console.error("OTP sending failed:", error);
        toast({
            variant: 'destructive',
            title: 'OTP Sending Failed',
            description: error.message || 'Could not send OTP. Please check the phone number and try again.',
        });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!confirmationResult) {
        handleSendOtp();
        return;
    }

    setIsVerifying(true);

    try {
      await confirmationResult.confirm(otp);

      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if (user) {
        await updateProfile(user, {
          displayName: values.name,
        });

        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
          id: user.uid,
          name: values.name,
          email: values.email,
          role: values.role,
          phoneNumber: `+${values.phoneNumber}`
        });
      }

      toast({
        title: 'Account Created',
        description: "You're now logged in.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message || 'An unexpected error occurred.',
      });
      setIsVerifying(false);
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
                {!isOtpSent ? (
                    <>
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
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <PhoneInput
                                        country={'in'}
                                        value={field.value}
                                        onChange={field.onChange}
                                        inputClass="w-full !text-base md:!text-sm"
                                    />
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
                    </>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-center">Enter the OTP sent to +{form.getValues('phoneNumber')}</p>
                        <Input 
                            type="text" 
                            placeholder="Enter OTP" 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                        />
                    </div>
                )}
                 <div id="recaptcha-container"></div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" type="submit" disabled={form.formState.isSubmitting || isVerifying}>
                  {isVerifying ? 'Verifying...' : (isOtpSent ? 'Verify OTP & Create Account' : 'Send OTP & Create Account')}
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