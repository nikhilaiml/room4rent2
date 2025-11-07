-- Drop existing tables to recreate with correct schema
DROP TABLE IF EXISTS public.enquiries CASCADE;
DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create or update storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('properties', 'properties', true)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Public property images access" ON storage.objects;

-- Create storage policies for properties bucket
CREATE POLICY "Public property images access" ON storage.objects
    FOR SELECT USING (bucket_id = 'properties');

CREATE POLICY "Authenticated users can upload property images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'properties');

CREATE POLICY "Users can update their own property images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'properties');

CREATE POLICY "Users can delete their own property images" ON storage.objects
    FOR DELETE USING (bucket_id = 'properties');

-- Create users table
CREATE TABLE public.users (
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

-- Create policies for users
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON public.users
    FOR DELETE USING (auth.uid() = id);

-- Create properties table with all required columns
CREATE TABLE public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "ownerId" UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    city TEXT NOT NULL,
    location TEXT NOT NULL,
    price NUMERIC NOT NULL,
    "propertyType" TEXT NOT NULL CHECK ("propertyType" IN ('Room', '1BHK', '2BHK', 'PG', 'Hostel')),
    "forWhom" TEXT DEFAULT 'Any' CHECK ("forWhom" IN ('Family', 'Girls', 'Boys', 'Any')),
    "securityDeposit" NUMERIC DEFAULT 0,
    "ownerResidence" TEXT,
    "type" TEXT,
    "furnishing" TEXT,
    "listedBy" TEXT,
    "superBuiltUpArea" NUMERIC,
    "carpetArea" NUMERIC,
    "maintenance" NUMERIC,
    "totalFloors" INTEGER,
    "floorNo" INTEGER,
    "carParking" TEXT,
    "facing" TEXT,
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
CREATE TABLE public.enquiries (
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
    NEW."updatedAt" = TIMEZONE('utc'::text, NOW());
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