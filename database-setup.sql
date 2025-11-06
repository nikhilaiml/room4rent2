-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('properties', 'properties', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for properties bucket
CREATE POLICY "Anyone can view property images" ON storage.objects
    FOR SELECT USING (bucket_id = 'properties');

CREATE POLICY "Authenticated users can upload property images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'properties' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own property images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'properties' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own property images" ON storage.objects
    FOR DELETE USING (bucket_id = 'properties' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('tenant', 'owner', 'admin')),
    favorites UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON public.users
    FOR DELETE USING (auth.uid() = id);

-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "ownerId" UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    city TEXT NOT NULL,
    location TEXT NOT NULL,
    price NUMERIC NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('Room', '1BHK', '2BHK', 'PG', 'Hostel')),
    for_whom TEXT DEFAULT 'Anyone' CHECK (for_whom IN ('Male', 'Female', 'Student', 'Family', 'Anyone')),
    amenities TEXT[] DEFAULT '{}',
    "imageUrls" TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Policies for properties
CREATE POLICY "Anyone can view properties" ON public.properties
    FOR SELECT USING (true);

CREATE POLICY "Owners can insert their properties" ON public.properties
    FOR INSERT WITH CHECK (auth.uid() = "ownerId");

CREATE POLICY "Owners can update their properties" ON public.properties
    FOR UPDATE USING (auth.uid() = "ownerId");

CREATE POLICY "Owners can delete their properties" ON public.properties
    FOR DELETE USING (auth.uid() = "ownerId");

-- Create enquiries table
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "propertyId" UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    "tenantId" UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    "ownerId" UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on enquiries
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Policies for enquiries
CREATE POLICY "Owners and tenants can view enquiries" ON public.enquiries
    FOR SELECT USING (auth.uid() = "ownerId" OR auth.uid() = "tenantId");

CREATE POLICY "Tenants can create enquiries" ON public.enquiries
    FOR INSERT WITH CHECK (auth.uid() = "tenantId");

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_users
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_properties
    BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();