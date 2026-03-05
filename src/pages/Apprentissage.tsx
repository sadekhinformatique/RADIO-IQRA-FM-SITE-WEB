/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, Heart, Globe, Play, ChevronRight, Book, Loader2, X, Languages } from 'lucide-react';
import { supabase, Lesson } from '../lib/supabase';

const LessonCard = ({ title, level, duration, description, icon: Icon }: { title: string, level: string, duration: string, description: string, icon: any }) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:shadow-xl hover:shadow-stone-200/50 transition-all group h-full flex flex-col">
    <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-islamic-green mb-6 group-hover:bg-islamic-green group-hover:text-white transition-colors">
      <Icon size={28} />
    </div>
    <div className="flex items-center gap-3 mb-3">
      <span className="bg-islamic-gold/10 text-islamic-gold px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{level}</span>
      <span className="text-stone-400 text-xs font-medium">{duration}</span>
    </div>
    <h3 className="text-xl font-serif font-bold mb-3 text-stone-800">{title}</h3>
    <p className="text-stone-600 leading-relaxed mb-6 text-sm flex-grow">{description}</p>
    <button className="flex items-center gap-2 text-islamic-green font-bold text-sm hover:underline mt-auto">
      Commencer la Leçon
      <ChevronRight size={16} />
    </button>
  </div>
);

const iconMap: Record<string, any> = {
  BookOpen,
  Globe,
  Sparkles,
  Heart,
  Book
};

const QuranPlayer = () => {
  const [reciters, setReciters] = useState<any[]>([]);
  const [surahs, setSurahs] = useState<any[]>([]);
  const [selectedReciter, setSelectedReciter] = useState<string>('ar.alafasy');
  const [selectedSurah, setSelectedSurah] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [readingData, setReadingData] = useState<any>(null);
  const [loadingReading, setLoadingReading] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const initData = async () => {
      try {
        const [recitersRes, surahsRes] = await Promise.all([
          fetch('https://api.alquran.cloud/v1/edition?format=audio&language=ar'),
          fetch('https://api.alquran.cloud/v1/surah')
        ]);
        const recitersData = await recitersRes.json();
        const surahsData = await surahsRes.json();

        // Filter for some popular ones to keep it clean, or just use first 50
        setReciters(recitersData.data.slice(0, 48));
        setSurahs(surahsData.data);
      } catch (err) {
        console.error("Failed to fetch Quran data", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const handlePlaySurah = (surah: any) => {
    setSelectedSurah(surah);
    setIsPlaying(true);
    // Audio URL format: https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/1.mp3
    if (audioRef.current) {
      audioRef.current.src = `https://cdn.islamic.network/quran/audio-surah/128/${selectedReciter}/${surah.number}.mp3`;
      audioRef.current.play();
    }
  };

  const handleReadSurah = async (surahNumber: number) => {
    setLoadingReading(true);
    setIsReading(true);
    try {
      const response = await fetch('/quran.json');
      const data = await response.json();
      const surah = data.sourates.find((s: any) => s.position === surahNumber);
      setReadingData(surah);
    } catch (err) {
      console.error("Failed to fetch reading data", err);
    } finally {
      setLoadingReading(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const filteredReciters = reciters.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.englishName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden flex flex-col h-[800px]">
      <div className="p-8 border-b border-stone-50 bg-stone-50/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-serif font-bold text-stone-800 flex items-center gap-3">
              <BookOpen className="text-islamic-green" />
              Plateforme d'Apprentissage Coranique
            </h2>
            <p className="text-stone-500 mt-1">Écoutez et apprenez avec les plus grands récitateurs au monde.</p>
          </div>
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Rechercher un récitateur..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-islamic-green focus:border-transparent outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Globe className="absolute left-3 top-2.5 text-stone-400" size={18} />
          </div>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Reciters Sidebar */}
        <div className="w-1/3 border-r border-stone-100 overflow-y-auto p-4 bg-stone-50/30">
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 px-2">Récitateurs</h3>
          <div className="space-y-1">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-islamic-green" /></div>
            ) : (
              filteredReciters.map((r) => (
                <button
                  key={r.identifier}
                  onClick={() => setSelectedReciter(r.identifier)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group ${selectedReciter === r.identifier
                    ? 'bg-islamic-green text-white shadow-lg shadow-islamic-green/20'
                    : 'hover:bg-white text-stone-600'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${selectedReciter === r.identifier ? 'bg-white/20' : 'bg-stone-200 text-stone-500'
                    }`}>
                    {r.englishName.charAt(0)}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-sm truncate">{r.englishName}</p>
                    <p className={`text-[10px] uppercase tracking-tighter ${selectedReciter === r.identifier ? 'text-white/80' : 'text-stone-400'}`}>
                      {r.name}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Surahs Grid */}
        <div className="w-2/3 overflow-y-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-serif font-bold text-stone-800">Sourates</h3>
            <span className="text-xs font-medium text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
              {surahs.length} Chapitres
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {surahs.map((s) => (
              <button
                key={s.number}
                onClick={() => handlePlaySurah(s)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left group ${selectedSurah?.number === s.number
                  ? 'border-islamic-gold bg-islamic-gold/5 shadow-inner'
                  : 'border-stone-100 hover:border-islamic-green hover:shadow-md'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold ${selectedSurah?.number === s.number ? 'bg-islamic-gold text-white' : 'bg-stone-100 text-stone-400'
                    }`}>
                    {s.number}
                  </span>
                  <div>
                    <h4 className="font-bold text-stone-800 group-hover:text-islamic-green transition-colors">{s.englishName}</h4>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">{s.englishNameTranslation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-serif text-stone-700">{s.name}</p>
                    <p className="text-[10px] text-stone-400">{s.numberOfAyahs} Versets</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReadSurah(s.number); }}
                    className="p-2 text-stone-400 hover:text-islamic-gold transition-colors"
                    title="Lire la sourate"
                  >
                    <Book size={20} />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Player Bar */}
      <div className="h-24 bg-stone-900 text-white px-8 flex items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 bg-islamic-gold/20 w-full">
          <div className="h-full bg-islamic-gold" style={{ width: '0%' }}></div>
        </div>

        <div className="flex items-center gap-4 min-w-[200px] z-10">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-islamic-gold shrink-0">
            <Sparkles size={24} />
          </div>
          <div className="truncate">
            <h4 className="font-bold text-sm truncate">
              {selectedSurah ? selectedSurah.englishName : "Sélectionnez une sourate"}
            </h4>
            <p className="text-xs text-stone-400 truncate">
              {reciters.find(r => r.identifier === selectedReciter)?.englishName || "Récitateur"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 z-10">
          {selectedSurah && (
            <button
              onClick={() => handleReadSurah(selectedSurah.number)}
              className="text-stone-400 hover:text-white flex flex-col items-center gap-1 transition-all"
              title="Lire la sourate"
            >
              <BookOpen size={20} />
              <span className="text-[10px] uppercase font-bold tracking-tighter">Lire</span>
            </button>
          )}
          <button className="text-stone-400 hover:text-white transition-colors" title="Précédent (Bientôt)">
            <Play size={24} className="rotate-180" />
          </button>
          <button
            onClick={togglePlay}
            disabled={!selectedSurah}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${!selectedSurah ? 'bg-stone-700 text-stone-500 cursor-not-allowed' : 'bg-islamic-green text-white hover:scale-105 active:scale-95 shadow-islamic-green/20'
              }`}
          >
            {isPlaying ? <div className="flex gap-1"><div className="w-1.5 h-6 bg-current rounded-full"></div><div className="w-1.5 h-6 bg-current rounded-full"></div></div> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          <button className="text-stone-400 hover:text-white transition-colors" title="Suivant (Bientôt)">
            <Play size={24} />
          </button>
        </div>

        <div className="flex items-center gap-3 min-w-[150px] justify-end z-10">
          <div className="text-xs font-mono text-stone-400">00:00</div>
          <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-stone-400" style={{ width: '60%' }}></div>
          </div>
          <div className="text-xs font-mono text-stone-400">--:--</div>
        </div>

        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>

      {/* Full-Screen Reading Overlay */}
      {isReading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-stone-900/95 backdrop-blur-md flex flex-col"
        >
          <div className="p-6 md:p-8 flex justify-between items-center text-white border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-islamic-green rounded-full flex items-center justify-center">
                <Book size={20} />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold">
                  {loadingReading ? "Chargement..." : `${readingData?.nom_phonetique} (${readingData?.englishNameTranslation})`}
                </h3>
                <p className="text-xs text-stone-400 uppercase tracking-widest">
                  {loadingReading ? "Veuillez patienter" : `Sourate ${readingData?.position} - ${readingData?.nom}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsReading(false)}
              className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-12">
              {loadingReading ? (
                <div className="flex flex-col items-center justify-center py-40">
                  <Loader2 className="w-16 h-16 text-islamic-green animate-spin mb-4" />
                  <p className="text-white font-medium">Récupération du texte sacré...</p>
                </div>
              ) : (
                readingData?.versets.map((v: any) => (
                  <div key={v.position} className="flex flex-col gap-6 relative group">
                    <div className="absolute -left-8 top-0 text-stone-600 font-mono text-sm opacity-50 group-hover:opacity-100 transition-opacity">
                      {v.position_ds_sourate}
                    </div>
                    <div className="text-right rtl">
                      <p className="text-4xl md:text-5xl leading-[1.8] text-islamic-gold text-right font-serif" dir="rtl">
                        {v.text_arabe}
                      </p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded bg-islamic-green/10 flex items-center justify-center text-[10px] text-islamic-green font-bold shrink-0 mt-1">
                        FR
                      </div>
                      <p className="text-xl text-stone-300 leading-relaxed italic">
                        {v.text}
                      </p>
                    </div>
                    <div className="w-full h-px bg-white/5 mt-4" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-8 bg-stone-900 border-t border-white/10 flex justify-center text-stone-500 text-sm">
            Lecteur Coranique Radio Iqra - Traduction & Texte Standard
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default function Apprentissage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultLessons = [
    { title: "Lecture du Coran (Tajwid)", level: "Débutant", duration: "12 Leçons", description: "Apprenez les règles fondamentales de la prononciation et de la récitation du Saint Coran.", icon: BookOpen },
    { title: "Langue Arabe", level: "Intermédiaire", duration: "24 Leçons", description: "Maîtrisez les bases de la langue arabe pour mieux comprendre les textes sacrés.", icon: Globe },
    { title: "Jurisprudence (Fiqh)", level: "Tous Niveaux", duration: "10 Leçons", description: "Comprendre les règles de la pratique quotidienne de l'Islam dans la vie moderne.", icon: Sparkles },
    { title: "Éthique & Valeurs", level: "Tous Niveaux", duration: "8 Leçons", description: "Cultivez les nobles caractères et les valeurs morales de l'Islam au quotidien.", icon: Heart },
    { title: "Histoires des Prophètes", level: "Débutant", duration: "15 Leçons", description: "Découvrez la vie et les enseignements des prophètes à travers des récits inspirants.", icon: Book },
    { title: "Mémorisation (Hifz)", level: "Avancé", duration: "Continu", description: "Un programme structuré pour vous aider dans votre cheminement de mémorisation.", icon: Sparkles },
  ];

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedLessons = data.map(l => ({
            ...l,
            icon: iconMap[l.icon_name] || BookOpen
          }));
          setLessons(formattedLessons);
        } else {
          setLessons(defaultLessons);
        }
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setLessons(defaultLessons);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  return (
    <div className="pt-32 pb-20 min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-serif font-bold text-stone-900 mb-4"
          >
            Espace Apprentissage (Iqra)
          </motion.h1>
          <div className="w-24 h-1.5 bg-islamic-gold rounded-full mx-auto mb-6" />
          <p className="text-stone-600 max-w-2xl mx-auto text-lg">
            "Lis, au nom de ton Seigneur qui a créé." — Plongez dans notre bibliothèque de ressources éducatives pour enrichir votre savoir.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-islamic-green animate-spin mb-4" />
            <p className="text-stone-400 font-medium">Chargement des leçons...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {lessons.map((lesson, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="h-full"
              >
                <LessonCard {...lesson} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Custom Quran Player Section */}
        <section id="quran-learning" className="mb-20">
          <QuranPlayer />
        </section>

        <div className="bg-white rounded-3xl p-12 shadow-xl border border-stone-100 flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-islamic-green/5 rounded-full -mr-48 -mt-48 blur-3xl opacity-50" />
          <div className="lg:w-1/2 relative z-10">
            <h2 className="text-4xl font-serif font-bold text-stone-800 mb-6">Bibliothèque Audio & Vidéo Internationale</h2>
            <p className="text-lg text-stone-600 leading-relaxed mb-8">
              Explorez une collection vaste et diversifiée de cours, de récits et de conférences provenant de sources académiques islamiques mondiales. En complément de notre programme local, cet espace vous connecte aux enseignements universels.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-islamic-green text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-islamic-green/20 hover:bg-islamic-gold transition-all flex items-center gap-3">
                <Play size={20} fill="currentColor" />
                Accéder aux Vidéos
              </button>
              <button className="bg-stone-100 text-stone-800 px-8 py-4 rounded-2xl font-bold hover:bg-stone-200 transition-all">
                Télécharger les PDF
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 grid grid-cols-2 gap-6 relative z-10">
            <div className="aspect-video bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 shadow-inner flex items-center justify-center">
              <Play size={48} className="text-islamic-green/20" />
            </div>
            <div className="aspect-video bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 shadow-inner flex items-center justify-center">
              <Play size={48} className="text-islamic-green/20" />
            </div>
            <div className="aspect-video bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 shadow-inner flex items-center justify-center">
              <Play size={48} className="text-islamic-green/20" />
            </div>
            <div className="aspect-video bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 shadow-inner flex items-center justify-center">
              <Play size={48} className="text-islamic-green/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
