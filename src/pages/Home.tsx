/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  Pause,
  Youtube, 
  BookOpen, 
  Heart, 
  Sparkles, 
  Globe,
  ChevronRight,
  Send,
  CheckCircle2,
  Loader2,
  Search,
  Eye
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { supabase, News } from '../lib/supabase';
import { NewsModal } from '../components/NewsModal';
import { WidgetSection } from '../components/WidgetSection';
import { VideoPlaylistPlayer } from '../components/VideoPlaylistPlayer';
import { SocialFeed } from '../components/SocialFeed';

const Player = () => {
  const { isPlaying, togglePlay, volume, setVolume, isMuted, setIsMuted, toggleMute, currentTrack, downloadM3U } = usePlayer();

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 max-w-md w-full mx-auto relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-islamic-green/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-islamic-gold/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={togglePlay}
              className="flex items-center gap-3 group"
            >
              <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-stone-300'}`} />
              <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${isPlaying ? 'text-red-500' : 'text-stone-500 group-hover:text-islamic-green'}`}>
                {isPlaying ? 'En Direct' : 'Lancer le Direct'}
              </span>
            </button>
            <button 
              onClick={downloadM3U}
              title="Ouvrir dans VLC"
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors text-[10px] font-bold text-stone-600 uppercase tracking-tighter"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e6/VLC_Icon.svg" alt="VLC" className="w-3.5 h-3.5" />
              VLC
            </button>
          </div>
          <div className="text-xs font-medium text-stone-400">Ouagadougou, Burkina Faso</div>
        </div>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-32 h-32 bg-stone-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-stone-200 overflow-hidden">
            <img 
              src="https://radioiqraburkina.com/wp-content/uploads/2025/09/2732x2732-1.png" 
              alt="RADIO IQRA FM Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h3 className="text-2xl font-serif font-bold text-stone-800 mb-1">RADIO IQRA FM</h3>
          <p className="text-islamic-green font-bold text-sm mb-1">{currentTrack}</p>
          <p className="text-stone-500 font-medium text-xs">La Voix du Saint Coran</p>
        </div>

        <div className="flex items-center justify-center gap-6 mb-8">
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'RADIO IQRA FM',
                  text: 'Écoutez RADIO IQRA FM - La Voix du Saint Coran en direct !',
                  url: window.location.href,
                }).catch(console.error);
              } else {
                alert('Lien copié !');
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-islamic-green hover:border-islamic-green transition-colors"
            title="Partager"
          >
            <Globe size={20} />
          </button>
          <button 
            onClick={togglePlay}
            className="w-20 h-20 bg-islamic-green text-white rounded-full flex items-center justify-center shadow-xl shadow-islamic-green/20 hover:scale-105 transition-transform active:scale-95"
          >
            {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
          </button>
          <button 
            onClick={() => {
              const contactSection = document.getElementById('contact-info');
              if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-islamic-green hover:border-islamic-green transition-colors"
            title="Contact"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleMute}
              className="text-stone-500 hover:text-islamic-green transition-colors"
            >
              {isMuted || volume === 0 ? <span className="text-stone-400">🔇</span> : <span className="text-stone-400">🔊</span>}
            </button>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                <span>Volume</span>
                <span className={volume > 0 && !isMuted ? 'text-islamic-green' : ''}>{isMuted ? 'Muet' : `${volume}%`}</span>
              </div>
              <div className="relative h-1.5 w-full bg-stone-200 rounded-lg overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-islamic-green transition-all duration-300"
                  style={{ width: `${isMuted ? 0 : volume}%` }}
                />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={isMuted ? 0 : volume} 
                  onChange={(e) => {
                    setVolume(parseInt(e.target.value));
                    if (isMuted) setIsMuted(false);
                  }}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PrayerTimes = () => {
  const [times, setTimes] = useState([
    { name: 'Fajr', time: '05:12' },
    { name: 'Dhuhr', time: '12:34' },
    { name: 'Asr', time: '15:56' },
    { name: 'Maghrib', time: '18:22' },
    { name: 'Isha', time: '19:35' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Ouagadougou&country=Burkina%20Faso&method=2');
        const data = await response.json();
        if (data.code === 200) {
          const t = data.data.timings;
          setTimes([
            { name: 'Fajr', time: t.Fajr },
            { name: 'Dhuhr', time: t.Dhuhr },
            { name: 'Asr', time: t.Asr },
            { name: 'Maghrib', time: t.Maghrib },
            { name: 'Isha', time: t.Isha },
          ]);
        }
      } catch (err) {
        console.error('Error fetching prayer times:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrayerTimes();
  }, []);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="text-islamic-gold text-2xl">⏰</span>
          <h3 className="text-xl font-serif font-bold">Heures de Prière</h3>
        </div>
        {loading && <Loader2 className="w-4 h-4 text-islamic-green animate-spin" />}
      </div>
      <div className="space-y-4">
        {times.map((p) => (
          <div key={p.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors">
            <span className="font-medium text-stone-600">{p.name}</span>
            <span className="font-serif font-bold text-lg text-islamic-green">{p.time}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-6 border-t border-stone-100 text-center">
        <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">Ouagadougou • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:shadow-xl hover:shadow-stone-200/50 transition-all group"
  >
    <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-islamic-green mb-6 group-hover:bg-islamic-green group-hover:text-white transition-colors">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-serif font-bold mb-3 text-stone-800">{title}</h3>
    <p className="text-stone-600 leading-relaxed">{description}</p>
  </motion.div>
);

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email }]);
      if (error) throw error;
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error('Newsletter error:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <div className="bg-stone-900 rounded-3xl p-10 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-islamic-green/10 rounded-full -mr-32 -mt-32 blur-3xl" />
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-md">
          <h3 className="text-2xl font-serif font-bold mb-2">Restez Connecté</h3>
          <p className="text-stone-400">Inscrivez-vous à notre newsletter pour recevoir les actualités et les horaires de prière.</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 focus:outline-none focus:border-islamic-green transition-colors min-w-[280px]"
          />
          <button 
            disabled={status === 'loading'}
            className="bg-islamic-green hover:bg-islamic-gold text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            {status === 'success' ? 'Inscrit !' : "S'abonner"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function Home() {
  const { isPlaying, togglePlay } = usePlayer();
  const [news, setNews] = useState<News[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);

  const categories = ['Tous', 'Actualités', 'Religion', 'Culture', 'Éducation', 'Communauté', 'Santé'];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .order('published_at', { ascending: false })
          .limit(3);
        if (error) throw error;
        setNews(data || []);
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  const filteredNews = news.filter(item => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(searchStr) || 
                         item.content.toLowerCase().includes(searchStr) || 
                         (item.category || '').toLowerCase().includes(searchStr);
    const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleNewsClick = (item: News) => {
    setSelectedNews(item);
    setIsNewsModalOpen(true);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <header className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://www.afdb.org/sites/default/files/styles/1700x900/public/burkina_0.jpg?itok=N7KxVol3" 
            alt="Burkina Faso Landscape" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/60 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-islamic-gold/20 text-islamic-gold border border-islamic-gold/30 mb-6">
                <Sparkles size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">La Voix du Saint Coran</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-[1.1] mb-6">
                Éveillez votre <span className="text-islamic-gold italic">spiritualité</span> avec RADIO IQRA FM
              </h1>
              <p className="text-xl text-stone-300 leading-relaxed mb-10 max-w-xl">
                Basée au Burkina Faso, nous diffusons les enseignements authentiques de l'Islam dans un esprit de paix, de fraternité et d'éducation.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={togglePlay}
                  className="bg-islamic-green hover:bg-islamic-green/90 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-islamic-green/30 transition-all flex items-center gap-3"
                >
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                  {isPlaying ? 'Pause' : 'Écouter Maintenant'}
                </button>
                <a href="https://www.youtube.com/@RADIOIQRA-TV" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center gap-3">
                  <Youtube size={20} />
                  Suivre sur YouTube
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <Player />
            </motion.div>
          </div>
        </div>
      </header>

      {/* Live Player Mobile Only */}
      <section className="lg:hidden px-4 -mt-20 relative z-20 mb-12">
        <Player />
      </section>

      {/* Prayer Times & Quick Info */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="mb-12">
                <h2 className="text-4xl font-serif font-bold text-stone-800 mb-4">Notre Mission</h2>
                <div className="w-20 h-1.5 bg-islamic-gold rounded-full mb-6" />
                <p className="text-lg text-stone-600 leading-relaxed">
                  Fidèle à sa mission, notre radio-télévision tire son nom de l'impératif divin <span className="font-serif italic font-bold text-islamic-green">"Iqra" (Lis)</span>, qui rappelle l'importance de la connaissance dans l'épanouissement de la foi et de la société. Nous œuvrons pour une éducation spirituelle authentique et le renforcement des liens communautaires.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <FeatureCard 
                  icon={BookOpen} 
                  title="Éducation Religieuse" 
                  description="Tafsir du Coran, Hadiths, et cours sur les piliers de l’Islam pour tous les niveaux."
                  delay={0.1}
                />
                <FeatureCard 
                  icon={Globe} 
                  title="Programmes Culturels" 
                  description="Partage de la riche diversité culturelle musulmane du Burkina Faso et d'ailleurs."
                  delay={0.2}
                />
                <FeatureCard 
                  icon={Sparkles} 
                  title="Espace d’Inspiration" 
                  description="Conférences, témoignages, et discussions autour des valeurs islamiques fondamentales."
                  delay={0.3}
                />
                <FeatureCard 
                  icon={Heart} 
                  title="Soutien Communautaire" 
                  description="Informations locales, conseils sociaux, et initiatives caritatives pour aider les plus démunis."
                  delay={0.4}
                />
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <PrayerTimes />
              <div className="bg-islamic-green rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <h3 className="text-xl font-serif font-bold mb-4 relative z-10">Soutenez la Radio</h3>
                <p className="text-white/80 mb-6 relative z-10">Aidez-nous à diffuser la parole d'Allah. Vos dons permettent de maintenir nos équipements et de produire des programmes de qualité.</p>
                <a 
                  href="tel:+22676011208"
                  className="block w-full bg-white text-islamic-green text-center font-bold py-3 rounded-xl hover:bg-islamic-gold hover:text-white transition-all relative z-10"
                >
                  Faire un Don (Orange/Moov)
                </a>
                <p className="mt-4 text-[10px] text-white/60 text-center uppercase tracking-widest">Contactez le +226 76 01 12 08</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* News Section */}
      {(!loadingNews && news.length > 0) && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-4">Dernières Actualités</h2>
                <div className="w-20 h-1.5 bg-islamic-gold rounded-full" />
              </div>
              <div className="flex flex-col gap-4 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
                  <input 
                    type="text" 
                    placeholder="Rechercher un article..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-80 bg-stone-50 border border-stone-200 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-islamic-green transition-all"
                  />
                </div>
                <p className="text-stone-500 text-sm">Restez informé des derniers événements et annonces de RADIO IQRA FM.</p>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-islamic-green text-white shadow-lg shadow-islamic-green/20'
                      : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNews.length === 0 ? (
                <div className="col-span-full py-12 text-center text-stone-400">
                  Aucun article ne correspond à votre recherche.
                </div>
              ) : (
                filteredNews.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleNewsClick(item)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[4/3] bg-stone-100 rounded-3xl overflow-hidden mb-6 relative">
                    <img 
                      src={item.image_url || `https://picsum.photos/seed/${item.id}/800/600`} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-islamic-green shadow-sm">
                        {new Date(item.published_at || item.created_at || '').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </div>
                      {item.category && (
                        <div className="bg-islamic-green/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                          {item.category}
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1.5">
                      <Eye size={12} />
                      {item.views || 0}
                    </div>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-800 group-hover:text-islamic-green transition-colors mb-2">{item.title}</h3>
                  <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed">{item.content}</p>
                </motion.div>
              ))
            )}
          </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-12 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterForm />
        </div>
      </section>

      {/* Widgets Section (YouTube, Facebook, TikTok, etc.) */}
      <WidgetSection />

      {/* Social Feed Section (Latest Posts) */}
      <SocialFeed />

      {/* Video Playlist Section */}
      <VideoPlaylistPlayer />

      {/* News Modal */}
      <NewsModal 
        news={selectedNews} 
        isOpen={isNewsModalOpen} 
        onClose={() => setIsNewsModalOpen(false)} 
      />
    </div>
  );
}
