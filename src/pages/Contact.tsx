/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ContactInfo = ({ icon: Icon, title, content, subContent }: { icon: any, title: string, content: string, subContent?: string }) => (
  <div className="flex gap-6 p-8 bg-white rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-all">
    <div className="w-14 h-14 bg-islamic-green/10 rounded-2xl flex items-center justify-center text-islamic-green shrink-0">
      <Icon size={28} />
    </div>
    <div>
      <h4 className="text-xl font-serif font-bold text-stone-800 mb-1">{title}</h4>
      <p className="text-stone-600 font-medium">{content}</p>
      {subContent && <p className="text-stone-400 text-sm mt-1">{subContent}</p>}
    </div>
  </div>
);

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([formData]);

      if (error) throw error;

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error('Error sending message:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-serif font-bold text-stone-900 mb-4"
          >
            Contactez RADIO IQRA FM
          </motion.h1>
          <div className="w-24 h-1.5 bg-islamic-gold rounded-full mx-auto mb-6" />
          <p className="text-stone-600 max-w-2xl mx-auto text-lg">
            Nous sommes à votre écoute. N'hésitez pas à nous contacter pour toute question, suggestion ou demande de partenariat.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <ContactInfo 
              icon={MapPin} 
              title="Notre Siège" 
              content="Ouagadougou, Secteur 15, Burkina Faso" 
              subContent="Près de la Grande Mosquée"
            />
            <ContactInfo 
              icon={Phone} 
              title="Téléphone" 
              content="+226 76 01 12 08" 
              subContent="Disponible 7J/7"
            />
            <ContactInfo 
              icon={Mail} 
              title="Email" 
              content="radioiqra07@gmail.com" 
              subContent="Réponse sous 24h ouvrées"
            />
            <ContactInfo 
              icon={Clock} 
              title="Horaires d'Ouverture" 
              content="7J/7 : 06h00 - 21h00" 
              subContent="au service du Coran"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-10 rounded-3xl shadow-xl border border-stone-100"
          >
            <h3 className="text-2xl font-serif font-bold text-stone-800 mb-8">Envoyez-nous un Message</h3>
            
            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-100 p-8 rounded-2xl text-center"
              >
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-emerald-900 mb-2">Message Envoyé !</h4>
                <p className="text-emerald-700">Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.</p>
              </motion.div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-400 uppercase tracking-widest">Nom Complet</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green transition-colors" 
                      placeholder="Votre nom" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-400 uppercase tracking-widest">Email</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green transition-colors" 
                      placeholder="votre@email.com" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-400 uppercase tracking-widest">Sujet</label>
                  <input 
                    type="text" 
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green transition-colors" 
                    placeholder="Comment pouvons-nous vous aider ?" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-stone-400 uppercase tracking-widest">Message</label>
                  <textarea 
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={5} 
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green transition-colors" 
                    placeholder="Votre message..."
                  ></textarea>
                </div>
                
                {status === 'error' && (
                  <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-xl">
                    <AlertCircle size={20} />
                    <span className="text-sm font-medium">Une erreur est survenue. Veuillez réessayer.</span>
                  </div>
                )}

                <button 
                  disabled={status === 'loading'}
                  className="w-full bg-islamic-green text-white font-bold py-4 rounded-xl hover:bg-islamic-gold transition-all flex items-center justify-center gap-3 shadow-lg shadow-islamic-green/20 disabled:opacity-50"
                >
                  {status === 'loading' ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={20} />
                      Envoyer le Message
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-serif font-bold text-stone-800 mb-8">Suivez-nous sur les Réseaux Sociaux</h3>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="facebook.com/profile.php?id=61571862830361" className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-stone-100 flex items-center justify-center text-stone-400 hover:bg-islamic-green hover:text-white transition-all">
              <Facebook size={28} />
            </a>
            <a href="x.com/iqra_radio4578" className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-stone-100 flex items-center justify-center text-stone-400 hover:bg-islamic-green hover:text-white transition-all">
              <Twitter size={28} />
            </a>
            <a href="instagram.com/radioiqratv_officielle?igsh=bTB1NDF6aGNtM3Uy" className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-stone-100 flex items-center justify-center text-stone-400 hover:bg-islamic-green hover:text-white transition-all">
              <Instagram size={28} />
            </a>
            <a href="https://www.youtube.com/@RADIOIQRA-TV" target="_blank" rel="noopener noreferrer" className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-stone-100 flex items-center justify-center text-stone-400 hover:bg-red-600 hover:text-white transition-all">
              <Youtube size={28} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
