-- SQL Schema for RADIO IQRA CMS
-- Run this in your Supabase SQL Editor

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Linked to Auth Users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'subscriber' CHECK (role IN ('admin', 'editor', 'author', 'subscriber')),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content JSONB DEFAULT '[]'::jsonb,
  excerpt TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'private')),
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  featured_image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  meta_title TEXT,
  meta_description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  views INTEGER DEFAULT 0
);

-- 6. Pages Table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured_image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Media Table
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT CHECK (type IN ('image', 'video', 'audio', 'document')),
  mime_type TEXT,
  size INTEGER,
  folder TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam')),
  parent_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_title TEXT DEFAULT 'RADIO IQRA FM',
  site_description TEXT DEFAULT 'La Voix du Saint Coran',
  logo_url TEXT,
  favicon_url TEXT,
  header_menu_id UUID,
  footer_menu_id UUID,
  radio_stream_url TEXT,
  radio_fallback_url TEXT,
  youtube_channel_id TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  theme_config JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Menus Table
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Widgets Table
CREATE TABLE IF NOT EXISTS widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  title TEXT,
  content JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Themes Table
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. RLS Policies (Simplified for Admin)
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access for tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public read access for published posts" ON posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public read access for published pages" ON pages FOR SELECT USING (status = 'published');
CREATE POLICY "Public read access for media" ON media FOR SELECT USING (true);
CREATE POLICY "Public read access for approved comments" ON comments FOR SELECT USING (status = 'approved');
CREATE POLICY "Public read access for site_settings" ON site_settings FOR SELECT USING (true);

-- Create policies for admin full access (assuming admin has a specific role or we use a service key)
-- For this demo, we'll allow all operations if authenticated (you should refine this)
CREATE POLICY "Admin full access for profiles" ON profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for tags" ON tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for posts" ON posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for pages" ON pages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for media" ON media FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for comments" ON comments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for site_settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for menus" ON menus FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for widgets" ON widgets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for themes" ON themes FOR ALL USING (auth.role() = 'authenticated');

-- 14. Storage Bucket
-- Note: You must create the 'cms_media' bucket manually in the Supabase Dashboard
-- and set its privacy to 'Public'.
