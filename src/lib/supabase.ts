/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials are missing. Please check your Vercel environment variables.');
}

// Use a fallback URL if missing to prevent crash, but it won't work until configured
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseKey || 'placeholder-key'
);

// Database Types (to be expanded as needed)
export type Programme = {
  id: string;
  title: string;
  time: string;
  host: string;
  category: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  created_at?: string;
};

export type Lesson = {
  id: string;
  title: string;
  level: string;
  duration: string;
  description: string;
  category: string;
  icon_name: string;
  created_at?: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at?: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  content: any; // JSON for block editor
  excerpt?: string;
  status: 'draft' | 'published' | 'private';
  author_id: string;
  featured_image_url?: string;
  category_id?: string;
  meta_title?: string;
  meta_description?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  views?: number;
};

export type Page = {
  id: string;
  title: string;
  slug: string;
  content: any; // JSON for block editor
  status: 'draft' | 'published';
  featured_image_url?: string;
  meta_title?: string;
  meta_description?: string;
  created_at?: string;
  updated_at?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type Media = {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  mime_type: string;
  size: number;
  folder?: string;
  created_at?: string;
};

export type UserRole = 'admin' | 'editor' | 'author' | 'subscriber';

export type Profile = {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  bio?: string;
  created_at?: string;
};

export type SiteSettings = {
  id: string;
  site_title: string;
  site_description: string;
  logo_url?: string;
  favicon_url?: string;
  header_menu_id?: string;
  footer_menu_id?: string;
  radio_stream_url?: string;
  radio_fallback_url?: string;
  youtube_channel_id?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  theme_config: any;
};

export type Menu = {
  id: string;
  name: string;
  items: MenuItem[];
};

export type Widget = {
  id: string;
  type: string;
  title: string;
  content: any;
  is_active: boolean;
  order_index: number;
  created_at?: string;
};

export type Theme = {
  id: string;
  name: string;
  slug: string;
  config: any;
  is_active: boolean;
};

export type MenuItem = {
  id: string;
  label: string;
  url: string;
  parent_id?: string;
  order: number;
};

export type Comment = {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'spam';
  parent_id?: string;
  created_at: string;
};

export type News = Post; // Alias for compatibility
export type RadioConfig = SiteSettings; // Alias for compatibility
