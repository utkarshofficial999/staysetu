-- Database Schema for StaySetu

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  role TEXT CHECK (role IN ('student', 'owner', 'admin')) DEFAULT 'student',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create listings table
CREATE TABLE listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  type TEXT CHECK (type IN ('PG', 'Flat', 'Hostel')) NOT NULL,
  amenities TEXT[],
  images TEXT[], -- Array of image URLs
  phone_number TEXT,
  whatsapp_number TEXT,
  status TEXT CHECK (status IN ('pending', 'approved')) DEFAULT 'pending',
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create favorites table
CREATE TABLE favorites (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, listing_id)
);

-- Set up Row Level Security (RLS)

-- Profiles: Users can read all profiles (to see names in chat/listings), but only edit their own.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Listings:
-- Everyone can view approved listings.
-- Owners can view their own listings (including pending).
-- Admins can view all listings.
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved listings are viewable by everyone" ON listings FOR SELECT USING (status = 'approved');
CREATE POLICY "Owners can see their own listings" ON listings FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can insert their own listings" ON listings FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their own listings" ON listings FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete their own listings" ON listings FOR DELETE USING (auth.uid() = owner_id);

-- Messages: Users can see messages where they are sender or receiver.
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can insert messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Favorites:
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for property photos
-- Note: Buckets are usually managed via Supabase dashboard, 
-- but we can document the policy here.
-- Bucket name: 'property-images'
-- Policy: Public read, Authenticated upload (Owner only)
