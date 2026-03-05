import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Youtube, 
  Facebook, 
  MessageSquare, 
  ExternalLink, 
  Loader2, 
  Play, 
  Clock,
  ChevronRight
} from 'lucide-react';
import { supabase, Widget, RadioConfig } from '../lib/supabase';

interface SocialPost {
  id: string;
  platform: 'youtube' | 'facebook' | 'tiktok' | 'instagram';
  title: string;
  excerpt: string;
  image_url: string;
  url: string;
  published_at: string;
}

export const SocialFeed = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<RadioConfig | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Config for Social IDs (if we had them, otherwise use defaults)
        const { data: configData } = await supabase.from('radio_config').select('*').single();
        
        // 2. Fetch Manual Social Posts from Widgets table
        // We look for widgets of type 'social_post'
        const { data: widgetData } = await supabase
          .from('widgets')
          .select('*')
          .eq('is_active', true)
          .eq('type', 'social_post')
          .order('order_index', { ascending: true });

        const manualPosts: SocialPost[] = (widgetData || []).map(w => ({
          id: w.id,
          platform: (w.content.includes('facebook') ? 'facebook' : w.content.includes('tiktok') ? 'tiktok' : 'instagram') as any,
          title: w.title,
          excerpt: w.content.length > 100 ? w.content.substring(0, 100) + '...' : w.content,
          image_url: w.image_url || 'https://picsum.photos/seed/social/800/600',
          url: w.content,
          published_at: w.created_at || new Date().toISOString()
        }));

        // 3. Fetch YouTube Posts (Simulated or via RSS-to-JSON)
        // For the demo, we'll use a mix of manual and a simulated fetch from YouTube
        // In a real app, you'd use: https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=UC...
        
        const youtubeChannelId = configData?.youtube_channel_id || 'UCJ9nE4p5YlbTsP_fLZvxRLw';
        let youtubePosts: SocialPost[] = [];
        
        try {
          // Attempt to fetch real YouTube data via RSS-to-JSON proxy (free tier)
          // Channel ID for @RADIOIQRA-TV is needed. 
          // Using a placeholder for now but the logic is real.
          const ytResponse = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://www.youtube.com/feeds/videos.xml?channel_id=${youtubeChannelId}`);
          const ytData = await ytResponse.json();
          
          if (ytData.status === 'ok') {
            youtubePosts = ytData.items.slice(0, 3).map((item: any) => ({
              id: item.guid,
              platform: 'youtube',
              title: item.title,
              excerpt: 'Nouveau contenu vidéo sur notre chaîne YouTube.',
              image_url: item.thumbnail,
              url: item.link,
              published_at: item.pubDate
            }));
          }
        } catch (e) {
          console.warn('YouTube fetch failed, using fallback');
        }

        // Combine and sort
        const combined = [...youtubePosts, ...manualPosts].sort((a, b) => 
          new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        );

        setPosts(combined.slice(0, 6));
      } catch (err) {
        console.error('Error fetching social feed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-10 h-10 text-islamic-green animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4">Flux Social</h2>
            <div className="w-20 h-1.5 bg-islamic-gold rounded-full" />
          </div>
          <p className="text-stone-500 max-w-md">
            Suivez nos dernières mises à jour sur YouTube, Facebook et TikTok pour ne rien manquer de nos programmes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-stone-50 rounded-[2rem] overflow-hidden border border-stone-100 hover:shadow-xl hover:shadow-stone-200/50 transition-all"
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={post.image_url} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md ${
                    post.platform === 'youtube' ? 'bg-red-600 text-white' : 
                    post.platform === 'facebook' ? 'bg-blue-600 text-white' : 
                    'bg-black text-white'
                  }`}>
                    {post.platform === 'youtube' && <Youtube size={20} />}
                    {post.platform === 'facebook' && <Facebook size={20} />}
                    {post.platform === 'tiktok' && <Play size={20} />}
                    {post.platform === 'instagram' && <MessageSquare size={20} />}
                  </div>
                </div>
                {post.platform === 'youtube' && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center text-red-600 shadow-xl">
                      <Play size={32} fill="currentColor" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-8">
                <div className="flex items-center gap-2 text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                  <Clock size={12} />
                  {new Date(post.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-800 mb-3 group-hover:text-islamic-green transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-stone-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
                <a 
                  href={post.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-islamic-green font-bold text-sm hover:text-islamic-gold transition-colors"
                >
                  Voir la publication
                  <ExternalLink size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 p-6 bg-stone-50 rounded-3xl border border-stone-100">
            <p className="text-stone-600 font-medium">Rejoignez notre communauté</p>
            <div className="flex gap-4">
              <a href="https://www.youtube.com/@RADIOIQRA-TV" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                <Youtube size={18} />
              </a>
              <a href="https://facebook.com/profile.php?id=61571862830361" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <Facebook size={18} />
              </a>
              <a href="https://instagram.com/radioiqratv_officielle?igsh=bTB1NDF6aGNtM3Uy" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-pink-600 hover:bg-pink-600 hover:text-white transition-all shadow-sm">
                <MessageSquare size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
