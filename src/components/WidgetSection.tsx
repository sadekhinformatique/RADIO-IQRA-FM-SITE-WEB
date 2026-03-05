import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Youtube, Facebook, MessageSquare, Globe, Play, ExternalLink, Loader2 } from 'lucide-react';
import { supabase, Widget } from '../lib/supabase';

const WidgetCard: React.FC<{ widget: Widget }> = ({ widget }) => {
  const renderContent = () => {
    switch (widget.type) {
      case 'youtube':
        // Extract video ID if it's a URL
        const videoId = widget.content.includes('v=') 
          ? widget.content.split('v=')[1].split('&')[0] 
          : widget.content.includes('youtu.be/') 
            ? widget.content.split('youtu.be/')[1] 
            : widget.content;
        
        return (
          <div className="aspect-video rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={widget.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );

      case 'facebook':
      case 'tiktok':
        return (
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
            <div className="aspect-video rounded-xl overflow-hidden bg-white mb-4 flex items-center justify-center border border-stone-200">
              {widget.image_url ? (
                <img src={widget.image_url} alt={widget.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="text-stone-300">
                  {widget.type === 'facebook' ? <Facebook size={48} /> : <Play size={48} />}
                </div>
              )}
            </div>
            <a 
              href={widget.content} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between text-islamic-green font-bold hover:underline"
            >
              Voir sur {widget.type === 'facebook' ? 'Facebook' : 'TikTok'}
              <ExternalLink size={16} />
            </a>
          </div>
        );

      case 'custom_html':
        return (
          <div 
            className="widget-custom-html overflow-hidden rounded-2xl border border-stone-100"
            dangerouslySetInnerHTML={{ __html: widget.content }}
          />
        );

      case 'social_card':
        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
            {widget.image_url && (
              <div className="aspect-video rounded-xl overflow-hidden mb-4">
                <img src={widget.image_url} alt={widget.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <p className="text-stone-600 text-sm mb-4 line-clamp-3">{widget.content}</p>
            <div className="flex items-center gap-2 text-islamic-green font-bold text-sm">
              <Globe size={16} />
              <span>Suivez-nous</span>
            </div>
          </div>
        );

      case 'text':
      default:
        return (
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
            <p className="text-stone-700 leading-relaxed">{widget.content}</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-islamic-green/10 rounded-lg flex items-center justify-center text-islamic-green">
          {widget.type === 'youtube' && <Youtube size={18} />}
          {widget.type === 'facebook' && <Facebook size={18} />}
          {widget.type === 'tiktok' && <Play size={18} />}
          {widget.type === 'custom_html' && <Globe size={18} />}
          {widget.type === 'social_card' && <MessageSquare size={18} />}
          {widget.type === 'text' && <MessageSquare size={18} />}
        </div>
        <h3 className="font-serif font-bold text-stone-800">{widget.title}</h3>
      </div>
      {renderContent()}
    </motion.div>
  );
};

export const WidgetSection = () => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        const { data, error } = await supabase
          .from('widgets')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });
        
        if (error) throw error;
        setWidgets(data || []);
      } catch (err) {
        console.error('Error fetching widgets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWidgets();
  }, []);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="w-8 h-8 text-islamic-green animate-spin" />
      </div>
    );
  }

  if (widgets.length === 0) return null;

  return (
    <section className="py-24 bg-stone-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-stone-800 mb-4">Réseaux Sociaux & Médias</h2>
          <div className="w-20 h-1.5 bg-islamic-gold rounded-full mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {widgets.map((widget) => (
            <WidgetCard key={widget.id} widget={widget} />
          ))}
        </div>
      </div>
    </section>
  );
};
