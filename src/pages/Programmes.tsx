/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, BookOpen, Globe, Sparkles, Heart, Loader2 } from 'lucide-react';
import { supabase, Programme } from '../lib/supabase';

const ProgramCard = ({ time, title, host, description }: { time: string, title: string, host: string, description: string }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-all h-full flex flex-col">
    <div className="flex items-center justify-between mb-4">
      <span className="bg-islamic-green/10 text-islamic-green px-4 py-1 rounded-full text-sm font-bold">{time}</span>
      <Clock size={18} className="text-stone-300" />
    </div>
    <h3 className="text-xl font-serif font-bold text-stone-800 mb-1">{title}</h3>
    <p className="text-islamic-gold text-sm font-medium mb-3">Avec {host}</p>
    <p className="text-stone-600 text-sm leading-relaxed flex-grow">{description}</p>
  </div>
);

export default function Programmes() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultSchedule = [
    { time: "05:00 - 06:00", title: "L'Éveil Spirituel", host: "Imam Traoré", description: "Lecture et méditation du Saint Coran pour bien commencer la journée." },
    { time: "09:00 - 10:30", title: "Iqra : Apprendre l'Islam", host: "Oustaz Barry", description: "Cours interactifs sur les piliers de l'Islam et la jurisprudence." },
    { time: "14:00 - 15:30", title: "Culture & Société", host: "Mme Sawadogo", description: "Discussions sur la vie quotidienne et les valeurs islamiques au Burkina Faso." },
    { time: "17:00 - 18:30", title: "Le Jardin des Hadiths", host: "Cheick Diallo", description: "Exploration des paroles du Prophète (PSL) et leur application moderne." },
    { time: "20:30 - 22:00", title: "Veillée de Foi", host: "Divers Intervenants", description: "Conférences, chants religieux et moments de recueillement." },
  ];

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const { data, error } = await supabase
          .from('programmes')
          .select('*')
          .order('time', { ascending: true });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setSchedule(data);
        } else {
          setSchedule(defaultSchedule);
        }
      } catch (err) {
        console.error('Error fetching schedule:', err);
        setSchedule(defaultSchedule);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
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
            Nos Programmes
          </motion.h1>
          <div className="w-24 h-1.5 bg-islamic-gold rounded-full mx-auto mb-6" />
          <p className="text-stone-600 max-w-2xl mx-auto text-lg">
            Découvrez notre grille de programmes variée, conçue pour nourrir votre foi, enrichir votre savoir et renforcer les liens communautaires.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-islamic-green animate-spin mb-4" />
            <p className="text-stone-400 font-medium">Chargement de la grille...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {schedule.map((prog, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <ProgramCard {...prog} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-20 bg-islamic-green rounded-3xl p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-4">Émissions Spéciales</h2>
              <p className="text-white/80 text-lg mb-6">
                Ne manquez pas nos émissions spéciales lors des fêtes religieuses, du Ramadan et des grands événements de la communauté musulmane au Burkina Faso.
              </p>
              <button className="bg-white text-islamic-green px-8 py-3 rounded-xl font-bold hover:bg-islamic-gold hover:text-white transition-all">
                Voir le Calendrier
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <Sparkles className="text-islamic-gold mb-2" />
                <h4 className="font-bold">Ramadan</h4>
                <p className="text-xs text-white/60">Programmes H24</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <Globe className="text-islamic-gold mb-2" />
                <h4 className="font-bold">Conférences</h4>
                <p className="text-xs text-white/60">Direct National</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
