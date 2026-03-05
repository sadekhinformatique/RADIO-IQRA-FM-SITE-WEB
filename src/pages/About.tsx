/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Globe, Heart, Sparkles, Users, MapPin } from 'lucide-react';

const StatCard = ({ number, label }: { number: string, label: string }) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 text-center">
    <h3 className="text-4xl font-serif font-bold text-islamic-green mb-2 tracking-tight">{number}</h3>
    <p className="text-stone-500 font-medium uppercase tracking-widest text-xs">{label}</p>
  </div>
);

export default function About() {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-serif font-bold text-stone-900 mb-4"
          >
            À Propos de RADIO IQRA FM
          </motion.h1>
          <div className="w-24 h-1.5 bg-islamic-gold rounded-full mx-auto mb-6" />
          <p className="text-stone-600 max-w-2xl mx-auto text-lg">
            La Voix du Saint Coran au cœur du Burkina Faso, dédiée à l'éducation, la paix et la fraternité.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-serif font-bold text-stone-800 mb-4">Notre Histoire & Mission</h2>
            <p className="text-lg text-stone-600 leading-relaxed">
              Basée au cœur du Burkina Faso, RADIO IQRA TV est une station islamique dédiée à la diffusion des enseignements authentiques de l'Islam, dans un esprit de paix, de fraternité et d'éducation spirituelle.
            </p>
            <p className="text-lg text-stone-600 leading-relaxed">
              Fidèle à sa mission, notre radio-télévision tire son nom de l'impératif divin <span className="font-serif italic font-bold text-islamic-green">"Iqra" (Lis)</span>, qui rappelle l'importance de la connaissance dans l'épanouissement de la foi et de la société.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-islamic-green/10 rounded-2xl flex items-center justify-center text-islamic-green shrink-0">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-stone-800">Éducation</h4>
                  <p className="text-sm text-stone-500">Savoir authentique</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-islamic-gold/10 rounded-2xl flex items-center justify-center text-islamic-gold shrink-0">
                  <Heart size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-stone-800">Fraternité</h4>
                  <p className="text-sm text-stone-500">Unité communautaire</p>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square bg-stone-200 rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://www.afdb.org/sites/default/files/styles/1700x900/public/burkina_0.jpg?itok=N7KxVol3" 
                alt="Burkina Faso Landscape" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl border border-stone-100 max-w-xs">
              <p className="text-stone-800 font-serif italic font-bold text-lg mb-2">"La connaissance est la lumière de l'âme."</p>
              <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">Devise de RADIO IQRA</p>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          <StatCard number="24/7" label="Diffusion Continue" />
          <StatCard number="15+" label="Émissions Hebdo" />
          <StatCard number="100k+" label="Auditeurs Fidèles" />
          <StatCard number="45" label="Conférenciers" />
        </div>

        <div className="bg-stone-900 rounded-3xl p-12 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="grid grid-cols-12 gap-4 h-full">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="h-full border-r border-white/20" />
              ))}
            </div>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-serif font-bold mb-6">Notre Vision pour l'Avenir</h2>
            <p className="text-stone-400 max-w-3xl mx-auto text-lg leading-relaxed mb-10">
              Nous aspirons à devenir la référence médiatique islamique en Afrique de l'Ouest, en utilisant les technologies modernes pour porter le message de paix et de savoir au-delà des frontières, tout en restant ancrés dans nos valeurs burkinabè.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10">
                <Globe size={18} className="text-islamic-gold" />
                <span className="font-bold text-sm">Portée Régionale</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10">
                <Users size={18} className="text-islamic-gold" />
                <span className="font-bold text-sm">Inclusion Sociale</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10">
                <MapPin size={18} className="text-islamic-gold" />
                <span className="font-bold text-sm">Impact Local</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
