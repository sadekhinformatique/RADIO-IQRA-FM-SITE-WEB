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

export type News = {
  id: string;
  title: string;
  content: string;
  category?: string;
  image_url?: string;
  published_at: string;
  created_at?: string;
  views?: number;
};

export type Comment = {
  id: string;
  news_id: string;
  name: string;
  content: string;
  created_at: string;
};

export type NewsletterSubscription = {
  id: string;
  email: string;
  created_at?: string;
};

export type Widget = {
  id: string;
  type: string;
  title: string;
  content: string;
  image_url?: string;
  is_active: boolean;
  order_index: number;
  created_at?: string;
};

export type RadioConfig = {
  id: string;
  primary_stream_url: string;
  fallback_stream_url: string;
  audio_playlist: { title: string; url: string }[];
  video_playlist: { title: string; url: string }[];
  youtube_channel_id?: string;
  updated_at?: string;
};
