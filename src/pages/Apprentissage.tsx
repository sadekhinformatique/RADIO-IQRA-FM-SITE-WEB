/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, Heart, Globe, Play, ChevronRight, Book, Loader2 } from 'lucide-react';
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

        <div className="bg-white rounded-3xl p-12 shadow-xl border border-stone-100 flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-islamic-green/5 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="lg:w-1/2 relative z-10">
            <h2 className="text-4xl font-serif font-bold text-stone-800 mb-6">Bibliothèque Audio & Vidéo</h2>
            <p className="text-lg text-stone-600 leading-relaxed mb-8">
              Accédez à des centaines d'heures de cours, de conférences et de récitations enregistrées par nos meilleurs oustaz et imams. Apprenez à votre rythme, où que vous soyez.
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
