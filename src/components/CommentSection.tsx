import React, { useState, useEffect } from 'react';
import { supabase, Comment } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Clock, MessageSquare, Loader2 } from 'lucide-react';

interface CommentSectionProps {
  newsId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ newsId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [newsId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('news_id', newsId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      const { error } = await supabase
        .from('comments')
        .insert([{ news_id: newsId, name, content }]);

      if (error) throw error;

      setName('');
      setContent('');
      fetchComments();
    } catch (err: any) {
      console.error('Error posting comment:', err);
      setError('Impossible de publier votre commentaire. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-12 border-t border-stone-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-islamic-green/10 rounded-xl flex items-center justify-center text-islamic-green">
          <MessageSquare size={20} />
        </div>
        <h3 className="text-2xl font-serif font-bold text-stone-800">Commentaires ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="bg-stone-50 rounded-3xl p-6 mb-12">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Votre Nom</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Ahmed"
                className="w-full bg-white border border-stone-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-islamic-green transition-all"
              />
            </div>
          </div>
        </div>
        <div className="space-y-2 mb-6">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Votre Message</label>
          <textarea 
            required
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Partagez votre avis..."
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green transition-all resize-none"
          />
        </div>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button 
          type="submit" 
          disabled={submitting}
          className="bg-islamic-green text-white font-bold px-8 py-3 rounded-xl hover:bg-islamic-gold transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Publication...
            </>
          ) : (
            <>
              <Send size={20} />
              Publier
            </>
          )}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-islamic-green" size={32} />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            Soyez le premier à commenter cet article !
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {comments.map((comment) => (
              <motion.div 
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-800">{comment.name}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-stone-400">
                        <Clock size={12} />
                        {new Date(comment.created_at).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-stone-600 leading-relaxed">{comment.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
