import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Tag, Eye, Share2, Clock } from 'lucide-react';
import { News, supabase } from '../lib/supabase';
import { CommentSection } from './CommentSection';
import { BlockRenderer } from './BlockRenderer';

interface NewsModalProps {
  news: News | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NewsModal: React.FC<NewsModalProps> = ({ news, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen && news) {
      incrementViews();
    }
  }, [isOpen, news]);

  const incrementViews = async () => {
    if (!news) return;
    try {
      const { error } = await supabase.rpc('increment_post_views', { post_id: news.id });
      if (error) {
        // Fallback if RPC doesn't exist
        const { error: updateError } = await supabase
          .from('posts')
          .update({ views: (news.views || 0) + 1 })
          .eq('id', news.id);
        if (updateError) throw updateError;
      }
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  };

  if (!news) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center text-stone-400 hover:text-stone-800 transition-all"
            >
              <X size={24} />
            </button>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {/* Header Image */}
              <div className="relative h-64 sm:h-96 w-full">
                <img 
                  src={news.featured_image_url || news.image_url || `https://picsum.photos/seed/${news.id}/1200/800`} 
                  alt={news.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex flex-wrap gap-3 mb-4">
                    {news.category && (
                      <span className="bg-islamic-green text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-islamic-green/20">
                        {news.category}
                      </span>
                    )}
                    <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(news.published_at || news.created_at || '').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">{news.title}</h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 sm:p-12">
                <div className="flex items-center gap-6 mb-8 text-stone-400 text-sm border-b border-stone-100 pb-8">
                  <div className="flex items-center gap-2">
                    <Eye size={18} className="text-islamic-green" />
                    <span className="font-bold text-stone-600">{(news.views || 0) + 1} vues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-islamic-gold" />
                    <span>Lecture : 3 min</span>
                  </div>
                  <button className="flex items-center gap-2 hover:text-islamic-green transition-colors ml-auto">
                    <Share2 size={18} />
                    <span>Partager</span>
                  </button>
                </div>

                <div className="prose prose-stone max-w-none">
                  <BlockRenderer blocks={news.content} />
                </div>

                {/* Comment Section */}
                <CommentSection postId={news.id} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
