import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  BookOpen,
  MessageSquare,
  Plus,
  Trash2,
  Edit,
  LogOut,
  Save,
  X,
  Loader2,
  Image as ImageIcon,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileImage,
  Copy,
  ExternalLink,
  Search,
  Eye,
  Layout,
  Settings,
  Radio,
  Music,
  Video
} from 'lucide-react';
import { supabase, News, Programme, Lesson, ContactMessage, Widget, RadioConfig } from '../lib/supabase';

type Tab = 'news' | 'programmes' | 'lessons' | 'messages' | 'media' | 'comments' | 'widgets' | 'settings';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('news');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'news' | 'widgets'>('news');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [newsForm, setNewsForm] = useState({ title: '', content: '', image_url: '', category: 'Actualités' });
  const [progForm, setProgForm] = useState({ title: '', time: '', host: '', description: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', level: 'Débutant', duration: '', description: '', icon_name: 'BookOpen' });
  const [widgetsForm, setWidgetsForm] = useState({ title: '', type: 'youtube', content: '', image_url: '', is_active: true, order_index: 0 });
  const [radioConfigForm, setRadioConfigForm] = useState<Omit<RadioConfig, 'id'>>({
    primary_stream_url: '',
    fallback_stream_url: '',
    audio_playlist: [],
    video_playlist: [],
    youtube_channel_id: ''
  });

  const ADMIN_PASSWORD = 'admin_iqra_2026';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
    } else {
      alert('Mot de passe incorrect');
    }
  };

  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'media') {
        fetchMedia();
      } else {
        fetchData();
      }
    }
  }, [isAuthenticated, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let table = '';
      let orderField = 'created_at';

      if (activeTab === 'news') table = 'news';
      else if (activeTab === 'programmes') { table = 'programmes'; orderField = 'time'; }
      else if (activeTab === 'lessons') table = 'lessons';
      else if (activeTab === 'messages') table = 'contact_messages';
      else if (activeTab === 'comments') table = 'comments';
      else if (activeTab === 'widgets') { table = 'widgets'; orderField = 'order_index'; }
      else if (activeTab === 'settings') {
        const { data: config, error } = await supabase.from('radio_config').select('*').single();
        if (error && error.code !== 'PGRST116') throw error;
        if (config) {
          setData([config]);
          setRadioConfigForm({
            primary_stream_url: config.primary_stream_url,
            fallback_stream_url: config.fallback_stream_url,
            audio_playlist: config.audio_playlist || [],
            video_playlist: config.video_playlist || [],
            youtube_channel_id: config.youtube_channel_id || ''
          });
        } else {
          setData([]);
        }
        return;
      }

      const { data: result, error } = await supabase
        .from(table)
        .select('*')
        .order(orderField, { ascending: activeTab !== 'news' && activeTab !== 'messages' });

      if (error) throw error;
      setData(result || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data: files, error } = await supabase.storage.from('media').list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error) throw error;
      setMediaFiles(files || []);
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      fetchMedia();
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error('Error uploading:', err);
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (fileName: string) => {
    if (!window.confirm('Supprimer définitivement ce média ?')) return;
    try {
      const { error } = await supabase.storage.from('media').remove([fileName]);
      if (error) throw error;
      fetchMedia();
    } catch (err) {
      console.error('Error deleting media:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage.from('media').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    try {
      let table = '';
      if (activeTab === 'news') table = 'news';
      else if (activeTab === 'programmes') table = 'programmes';
      else if (activeTab === 'lessons') table = 'lessons';
      else if (activeTab === 'messages') table = 'contact_messages';
      else if (activeTab === 'comments') table = 'comments';
      else if (activeTab === 'widgets') table = 'widgets';

      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let table = '';
      if (activeTab === 'news') table = 'news';
      else if (activeTab === 'programmes') table = 'programmes';
      else if (activeTab === 'lessons') table = 'lessons';
      else if (activeTab === 'comments') table = 'comments';
      else if (activeTab === 'widgets') table = 'widgets';
      else if (activeTab === 'settings') table = 'radio_config';

      let payload = {};

      if (activeTab === 'news') {
        payload = {
          ...newsForm,
          published_at: editingItem?.published_at || new Date().toISOString()
        };
      }
      else if (activeTab === 'programmes') payload = progForm;
      else if (activeTab === 'lessons') payload = lessonForm;
      else if (activeTab === 'widgets') payload = widgetsForm;
      else if (activeTab === 'settings') {
        // Exclude youtube_channel_id to prevent schema cache errors if the column is missing
        const { youtube_channel_id, ...safeConfig } = radioConfigForm;
        payload = safeConfig;
      }

      if (editingItem || (activeTab === 'settings' && data.length > 0)) {
        const id = editingItem?.id || data[0]?.id;
        const { error } = await supabase.from(table).update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert([payload]);
        if (error) throw error;
      }

      setStatus('success');
      setErrorMessage('');
      setIsModalOpen(false);
      setEditingItem(null);
      resetForms();
      fetchData();
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      console.error('Error saving:', err);
      setErrorMessage(err.message || 'Erreur inconnue');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setNewsForm({ title: '', content: '', image_url: '', category: 'Actualités' });
    setProgForm({ title: '', time: '', host: '', description: '' });
    setLessonForm({ title: '', level: 'Débutant', duration: '', description: '', icon_name: 'BookOpen' });
    setWidgetsForm({ title: '', type: 'youtube', content: '', image_url: '', is_active: true, order_index: 0 });
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    if (activeTab === 'news') setNewsForm({ title: item.title, content: item.content, image_url: item.image_url || '', category: item.category || 'Actualités' });
    else if (activeTab === 'programmes') setProgForm({ title: item.title, time: item.time, host: item.host, description: item.description || '' });
    else if (activeTab === 'lessons') setLessonForm({ title: item.title, level: item.level, duration: item.duration || '', description: item.description || '', icon_name: item.icon_name || 'BookOpen' });
    else if (activeTab === 'widgets') setWidgetsForm({ title: item.title, type: item.type, content: item.content, image_url: item.image_url || '', is_active: item.is_active, order_index: item.order_index });
    setIsModalOpen(true);
  };

  const filteredData = data.filter(item => {
    const searchStr = searchTerm.toLowerCase();
    const title = (item.title || item.subject || item.name || '').toLowerCase();
    const content = (item.content || item.description || item.message || '').toLowerCase();
    const host = (item.host || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const email = (item.email || '').toLowerCase();
    return title.includes(searchStr) || content.includes(searchStr) || host.includes(searchStr) || category.includes(searchStr) || email.includes(searchStr);
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-stone-100 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-islamic-green/10 rounded-2xl flex items-center justify-center text-islamic-green mx-auto mb-4">
              <LayoutDashboard size={32} />
            </div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">Administration IQRA</h1>
            <p className="text-stone-500 text-sm">Veuillez vous connecter pour gérer le contenu</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            <button className="w-full bg-islamic-green text-white font-bold py-4 rounded-xl hover:bg-islamic-gold transition-all shadow-lg shadow-islamic-green/20">
              Se Connecter
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Tableau de Bord</h1>
            <p className="text-stone-500">Gérez les articles, programmes et leçons de RADIO IQRA</p>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="/"
              className="flex items-center gap-2 text-stone-400 hover:text-islamic-green font-medium transition-colors"
            >
              <ExternalLink size={18} />
              Voir le site
            </a>
            <button
              onClick={() => { localStorage.removeItem('admin_auth'); setIsAuthenticated(false); }}
              className="flex items-center gap-2 text-stone-400 hover:text-red-500 font-medium transition-colors"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {status !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-2xl flex items-center gap-3 shadow-lg ${status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                status === 'error' ? 'bg-red-50 text-red-700 border border-red-100' :
                  'bg-blue-50 text-blue-700 border border-blue-100'
                }`}
            >
              {status === 'success' ? <CheckCircle2 size={20} /> : status === 'error' ? <AlertCircle size={20} /> : <Loader2 className="animate-spin" size={20} />}
              <span className="font-bold flex flex-col">
                <span>{status === 'success' ? 'Opération réussie !' : status === 'error' ? 'Une erreur est survenue.' : 'Chargement...'}</span>
                {status === 'error' && errorMessage && <span className="text-xs font-normal opacity-80 mt-1">{errorMessage}</span>}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'news', label: 'Actualités', icon: Newspaper },
            { id: 'programmes', label: 'Programmes', icon: Calendar },
            { id: 'lessons', label: 'Leçons', icon: BookOpen },
            { id: 'media', label: 'Médiathèque', icon: FileImage },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'comments', label: 'Commentaires', icon: MessageSquare },
            { id: 'widgets', label: 'Widgets', icon: Layout },
            { id: 'settings', label: 'Configuration Radio', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                ? 'bg-islamic-green text-white shadow-lg shadow-islamic-green/20'
                : 'bg-white text-stone-500 border border-stone-100 hover:bg-stone-50'
                }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
          {activeTab === 'media' ? (
            <div className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-2xl font-serif font-bold text-stone-800">Médiathèque</h2>
                <div className="flex gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-islamic-green text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-islamic-gold transition-all disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                    Téléverser un média
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-20 text-center">
                  <Loader2 className="w-12 h-12 text-islamic-green animate-spin mx-auto mb-4" />
                  <p className="text-stone-400">Chargement des médias...</p>
                </div>
              ) : mediaFiles.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-stone-100 rounded-3xl">
                  <ImageIcon size={48} className="text-stone-200 mx-auto mb-4" />
                  <p className="text-stone-400">Aucun média dans la bibliothèque</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {mediaFiles.map((file) => {
                    const url = getPublicUrl(file.name);
                    return (
                      <div key={file.id} className="group relative aspect-square bg-stone-50 rounded-2xl overflow-hidden border border-stone-100">
                        <img
                          src={url}
                          alt={file.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                          <button
                            onClick={() => { navigator.clipboard.writeText(url); alert('Lien copié !'); }}
                            className="bg-white text-stone-800 p-2 rounded-lg hover:bg-islamic-gold hover:text-white transition-colors"
                            title="Copier le lien"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteMedia(file.name)}
                            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                <h2 className="text-xl font-serif font-bold text-stone-800 capitalize">
                  {activeTab === 'news' ? 'Articles' : activeTab === 'comments' ? 'Commentaires' : activeTab === 'settings' ? 'Configuration Radio' : activeTab}
                </h2>
                {activeTab !== 'settings' && (
                  <div className="flex items-center gap-4 flex-1 max-w-md mx-4">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-islamic-green"
                      />
                    </div>
                  </div>
                )}
                {activeTab !== 'messages' && activeTab !== 'comments' && activeTab !== 'settings' && (
                  <button
                    onClick={() => { setEditingItem(null); resetForms(); setIsModalOpen(true); }}
                    className="bg-islamic-green text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm hover:bg-islamic-gold transition-all"
                  >
                    <Plus size={16} />
                    Ajouter
                  </button>
                )}
                {activeTab === 'settings' && (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-islamic-green text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 text-sm hover:bg-islamic-gold transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Enregistrer
                  </button>
                )}
              </div>

              {activeTab === 'settings' ? (
                <div className="p-8 space-y-10">
                  {/* Streaming URLs */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-islamic-green">
                      <Radio size={24} />
                      <h3 className="text-xl font-serif font-bold">Flux de Streaming & IDs Sociaux</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Lien de Streaming Principal</label>
                        <input
                          type="text"
                          value={radioConfigForm.primary_stream_url}
                          onChange={(e) => setRadioConfigForm({ ...radioConfigForm, primary_stream_url: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Lien de Streaming de Secours (Fallback)</label>
                        <input
                          type="text"
                          value={radioConfigForm.fallback_stream_url}
                          onChange={(e) => setRadioConfigForm({ ...radioConfigForm, fallback_stream_url: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">ID de Chaîne YouTube (pour le flux social)</label>
                        <input
                          type="text"
                          value={radioConfigForm.youtube_channel_id}
                          onChange={(e) => setRadioConfigForm({ ...radioConfigForm, youtube_channel_id: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                          placeholder="Ex: UCJ9nE4p5YlbTsP_fLZvxRLw"
                        />
                        <p className="text-[10px] text-stone-400">Utilisé pour récupérer automatiquement les dernières vidéos.</p>
                      </div>
                    </div>
                  </div>

                  {/* Audio Playlist */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-islamic-green">
                        <Music size={24} />
                        <h3 className="text-xl font-serif font-bold">Playlist Audio (Secours)</h3>
                      </div>
                      <button
                        onClick={() => setRadioConfigForm({
                          ...radioConfigForm,
                          audio_playlist: [...radioConfigForm.audio_playlist, { title: '', url: '' }]
                        })}
                        className="text-islamic-green hover:text-islamic-gold font-bold text-sm flex items-center gap-1"
                      >
                        <Plus size={16} /> Ajouter un titre
                      </button>
                    </div>
                    <div className="space-y-4">
                      {radioConfigForm.audio_playlist.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-end bg-stone-50 p-4 rounded-2xl border border-stone-100">
                          <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Titre</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const newList = [...radioConfigForm.audio_playlist];
                                newList[idx].title = e.target.value;
                                setRadioConfigForm({ ...radioConfigForm, audio_playlist: newList });
                              }}
                              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-islamic-green"
                              placeholder="Nom du fichier"
                            />
                          </div>
                          <div className="flex-[2] space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">URL du fichier</label>
                            <input
                              type="text"
                              value={item.url}
                              onChange={(e) => {
                                const newList = [...radioConfigForm.audio_playlist];
                                newList[idx].url = e.target.value;
                                setRadioConfigForm({ ...radioConfigForm, audio_playlist: newList });
                              }}
                              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-islamic-green"
                              placeholder="https://..."
                            />
                          </div>
                          <button
                            onClick={() => {
                              const newList = radioConfigForm.audio_playlist.filter((_, i) => i !== idx);
                              setRadioConfigForm({ ...radioConfigForm, audio_playlist: newList });
                            }}
                            className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                      {radioConfigForm.audio_playlist.length === 0 && (
                        <p className="text-center py-8 text-stone-400 border-2 border-dashed border-stone-100 rounded-2xl">Aucun élément dans la playlist audio</p>
                      )}
                    </div>
                  </div>

                  {/* Video Playlist */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-islamic-green">
                        <Video size={24} />
                        <h3 className="text-xl font-serif font-bold">Playlist Vidéo (Boucle)</h3>
                      </div>
                      <button
                        onClick={() => setRadioConfigForm({
                          ...radioConfigForm,
                          video_playlist: [...radioConfigForm.video_playlist, { title: '', url: '' }]
                        })}
                        className="text-islamic-green hover:text-islamic-gold font-bold text-sm flex items-center gap-1"
                      >
                        <Plus size={16} /> Ajouter une vidéo
                      </button>
                    </div>
                    <div className="space-y-4">
                      {radioConfigForm.video_playlist.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-end bg-stone-50 p-4 rounded-2xl border border-stone-100">
                          <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Titre</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const newList = [...radioConfigForm.video_playlist];
                                newList[idx].title = e.target.value;
                                setRadioConfigForm({ ...radioConfigForm, video_playlist: newList });
                              }}
                              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-islamic-green"
                              placeholder="Nom de la vidéo"
                            />
                          </div>
                          <div className="flex-[2] space-y-2">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">URL de la vidéo</label>
                            <input
                              type="text"
                              value={item.url}
                              onChange={(e) => {
                                const newList = [...radioConfigForm.video_playlist];
                                newList[idx].url = e.target.value;
                                setRadioConfigForm({ ...radioConfigForm, video_playlist: newList });
                              }}
                              className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-islamic-green"
                              placeholder="https://..."
                            />
                          </div>
                          <button
                            onClick={() => {
                              const newList = radioConfigForm.video_playlist.filter((_, i) => i !== idx);
                              setRadioConfigForm({ ...radioConfigForm, video_playlist: newList });
                            }}
                            className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                      {radioConfigForm.video_playlist.length === 0 && (
                        <p className="text-center py-8 text-stone-400 border-2 border-dashed border-stone-100 rounded-2xl">Aucun élément dans la playlist vidéo</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 text-stone-400 text-xs font-bold uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Titre / Sujet</th>
                        <th className="px-6 py-4">Détails</th>
                        {activeTab === 'news' && <th className="px-6 py-4">Vues</th>}
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <Loader2 className="w-8 h-8 text-islamic-green animate-spin mx-auto mb-2" />
                            <p className="text-stone-400">Chargement...</p>
                          </td>
                        </tr>
                      ) : filteredData.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-stone-400">
                            Aucun élément trouvé
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((item) => (
                          <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-stone-800">{item.title || item.subject || item.name}</div>
                              {(item.email || item.category || item.news_id || item.type) && (
                                <div className="text-xs text-stone-400">
                                  {item.email || item.category || (activeTab === 'comments' ? `Article ID: ${item.news_id}` : item.type)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-stone-500 line-clamp-1">
                                {item.host || item.level || item.message || item.content}
                              </div>
                            </td>
                            {activeTab === 'news' && (
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 text-stone-600 font-medium">
                                  <Eye size={14} className="text-stone-300" />
                                  {item.views || 0}
                                </div>
                              </td>
                            )}
                            <td className="px-6 py-4 text-sm text-stone-400">
                              {new Date(item.created_at || item.published_at).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                {activeTab !== 'messages' && activeTab !== 'comments' && (
                                  <button
                                    onClick={() => openEditModal(item)}
                                    className="p-2 text-stone-400 hover:text-islamic-green transition-colors"
                                  >
                                    <Edit size={18} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <h3 className="text-xl font-serif font-bold text-stone-800">
                  {editingItem ? 'Modifier' : 'Ajouter'} {activeTab === 'news' ? 'un Article' : activeTab === 'programmes' ? 'un Programme' : activeTab === 'widgets' ? 'un Widget' : 'une Leçon'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                {activeTab === 'news' && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Titre de l'article</label>
                        <input
                          type="text"
                          required
                          value={newsForm.title}
                          onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                          placeholder="Ex: Nouveau programme de Ramadan"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Catégorie</label>
                        <select
                          value={newsForm.category}
                          onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                        >
                          <option>Actualités</option>
                          <option>Religion</option>
                          <option>Culture</option>
                          <option>Éducation</option>
                          <option>Communauté</option>
                          <option>Santé</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Image de l'article</label>
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                          <input
                            type="url"
                            value={newsForm.image_url}
                            onChange={(e) => setNewsForm({ ...newsForm, image_url: e.target.value })}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-islamic-green"
                            placeholder="URL de l'image"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => { setMediaPickerTarget('news'); setIsMediaPickerOpen(true); }}
                          className="bg-stone-100 text-stone-600 px-4 py-3 rounded-xl hover:bg-stone-200 transition-all flex items-center gap-2 font-bold text-sm"
                        >
                          <Search size={16} />
                          Médiathèque
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Contenu</label>
                      <textarea
                        required
                        rows={6}
                        value={newsForm.content}
                        onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                        placeholder="Écrivez votre article ici..."
                      ></textarea>
                    </div>
                  </>
                )}

                {activeTab === 'programmes' && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Titre</label>
                        <input
                          type="text" required
                          value={progForm.title}
                          onChange={(e) => setProgForm({ ...progForm, title: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Horaire</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                          <input
                            type="text" required
                            value={progForm.time}
                            onChange={(e) => setProgForm({ ...progForm, time: e.target.value })}
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-islamic-green"
                            placeholder="Ex: 08:00 - 09:30"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Animateur / Host</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                        <input
                          type="text" required
                          value={progForm.host}
                          onChange={(e) => setProgForm({ ...progForm, host: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-islamic-green"
                          placeholder="Ex: Imam Traoré"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Description</label>
                      <textarea
                        rows={3}
                        value={progForm.description}
                        onChange={(e) => setProgForm({ ...progForm, description: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                      ></textarea>
                    </div>
                  </>
                )}

                {activeTab === 'lessons' && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Titre de la leçon</label>
                        <input
                          type="text" required
                          value={lessonForm.title}
                          onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Niveau</label>
                        <select
                          value={lessonForm.level}
                          onChange={(e) => setLessonForm({ ...lessonForm, level: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                        >
                          <option>Débutant</option>
                          <option>Intermédiaire</option>
                          <option>Avancé</option>
                          <option>Tous Niveaux</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Durée / Nombre de leçons</label>
                        <input
                          type="text" required
                          value={lessonForm.duration}
                          onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                          placeholder="Ex: 12 Leçons"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Icône</label>
                        <select
                          value={lessonForm.icon_name}
                          onChange={(e) => setLessonForm({ ...lessonForm, icon_name: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                        >
                          <option value="BookOpen">Livre Ouvert</option>
                          <option value="Globe">Monde</option>
                          <option value="Sparkles">Étoiles</option>
                          <option value="Heart">Cœur</option>
                          <option value="Book">Livre</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Description</label>
                      <textarea
                        rows={3}
                        value={lessonForm.description}
                        onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                      ></textarea>
                    </div>
                  </>
                )}

                {activeTab === 'widgets' && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Titre du Widget</label>
                        <input
                          type="text" required
                          value={widgetsForm.title}
                          onChange={(e) => setWidgetsForm({ ...widgetsForm, title: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Type</label>
                        <select
                          value={widgetsForm.type}
                          onChange={(e) => setWidgetsForm({ ...widgetsForm, type: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                        >
                          <option value="youtube">YouTube Video</option>
                          <option value="facebook">Facebook Feed</option>
                          <option value="tiktok">TikTok Video</option>
                          <option value="social_post">Publication Sociale (Flux)</option>
                          <option value="custom_html">Code HTML Personnalisé</option>
                          <option value="social_card">Carte Réseaux Sociaux</option>
                          <option value="text">Texte Simple</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Contenu / URL / Code Embed</label>
                      <textarea
                        rows={4} required
                        value={widgetsForm.content}
                        onChange={(e) => setWidgetsForm({ ...widgetsForm, content: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green font-mono text-sm"
                        placeholder="Collez ici l'URL ou le code d'intégration..."
                      ></textarea>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Image URL (Optionnel)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={widgetsForm.image_url}
                            onChange={(e) => setWidgetsForm({ ...widgetsForm, image_url: e.target.value })}
                            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                          />
                          <button
                            type="button"
                            onClick={() => { setMediaPickerTarget('widgets'); setIsMediaPickerOpen(true); }}
                            className="bg-stone-100 p-3 rounded-xl hover:bg-stone-200 transition-colors"
                          >
                            <FileImage size={20} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Ordre d'affichage</label>
                        <input
                          type="number"
                          value={widgetsForm.order_index}
                          onChange={(e) => setWidgetsForm({ ...widgetsForm, order_index: parseInt(e.target.value) })}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={widgetsForm.is_active}
                        onChange={(e) => setWidgetsForm({ ...widgetsForm, is_active: e.target.checked })}
                        className="w-5 h-5 rounded border-stone-300 text-islamic-green focus:ring-islamic-green"
                      />
                      <label htmlFor="is_active" className="text-sm font-medium text-stone-700">Widget Actif</label>
                    </div>
                  </>
                )}

                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-stone-100 text-stone-600 font-bold py-4 rounded-xl hover:bg-stone-200 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    disabled={loading}
                    className="flex-1 bg-islamic-green text-white font-bold py-4 rounded-xl hover:bg-islamic-gold transition-all shadow-lg shadow-islamic-green/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Media Picker Modal */}
      <AnimatePresence>
        {isMediaPickerOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMediaPickerOpen(false)}
              className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <h3 className="text-xl font-serif font-bold text-stone-800">Choisir un média</h3>
                <button onClick={() => setIsMediaPickerOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {mediaFiles.map((file) => {
                    const url = getPublicUrl(file.name);
                    return (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => {
                          if (mediaPickerTarget === 'news') {
                            setNewsForm({ ...newsForm, image_url: url });
                          } else {
                            setWidgetsForm({ ...widgetsForm, image_url: url });
                          }
                          setIsMediaPickerOpen(false);
                        }}
                        className="group relative aspect-square bg-stone-50 rounded-xl overflow-hidden border-2 border-transparent hover:border-islamic-green transition-all"
                      >
                        <img
                          src={url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-islamic-green/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <CheckCircle2 className="text-white" size={32} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Status Toast */}
      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 ${status === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
              }`}
          >
            {status === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <span className="font-bold">
              {status === 'success' ? 'Opération réussie !' : 'Une erreur est survenue.'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
